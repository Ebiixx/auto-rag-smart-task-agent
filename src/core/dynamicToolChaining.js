import { askOpenAI } from "../api";
import { calculateSavings } from "../tools/SavingsCalculator";
import { calculateGeneral } from "../tools/GeneralCalculator";
import { compareTexts } from "../tools/TextComparer";
import { webSearch } from "../tools/WebSearch";
import { textSummarizer } from "../tools/TextSummarizer";
import {
  calculateBMI,
  interpretHealthMetrics,
} from "../tools/HealthInterpreter";

/**
 * Dynamically chains multiple tools together to solve complex queries
 * @param {string} query - The original user query
 * @returns {Promise<{result: string, steps: Array}>} - The final result and steps taken
 */
export async function dynamicToolChain(query) {
  console.log("Starting dynamic tool chain for:", query);

  try {
    // 1. Plan the tool chain using GPT
    const plan = await planToolChain(query);
    console.log("Tool chain plan:", plan);

    // 2. Execute the planned steps
    const executionSteps = [];
    let intermediateResult = null;
    let finalResult = "";

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.log(`Executing step ${i + 1}:`, step.tool);

      // Execute the current step, potentially using output from previous step
      const stepResult = await executeToolStep(
        step,
        query,
        intermediateResult,
        executionSteps
      );

      // Record the execution step
      executionSteps.push({
        tool: step.tool,
        input: step.input || query,
        output: stepResult,
      });

      // Update intermediate result for next step
      intermediateResult = stepResult;

      // If this is the last step, its output is our final result
      if (i === plan.steps.length - 1) {
        finalResult =
          typeof stepResult === "string"
            ? stepResult
            : JSON.stringify(stepResult);
      }
    }

    // 3. Format the final result with HTML
    const formattedResult = await formatChainResult(
      query,
      plan.explanation,
      finalResult
    );

    return {
      result: formattedResult,
      steps: executionSteps,
    };
  } catch (error) {
    console.error("Error in dynamic tool chain:", error);
    return {
      result: `<div class="error-message">
                <h3>Chain Execution Error</h3>
                <p>There was an error executing the tool chain: ${error.message}</p>
              </div>`,
      steps: [
        {
          tool: "error",
          input: query,
          output: error.message,
        },
      ],
    };
  }
}

/**
 * Plans a sequence of tools to execute based on the query
 * @param {string} query - The user query
 * @returns {Promise<{steps: Array, explanation: string}>} - The planned steps
 */
async function planToolChain(query) {
  const messages = [
    {
      role: "system",
      content: `You are an expert AI tool chain planner. Your job is to break down a complex query into a sequence of tool operations that together will solve the problem.

Available tools:
1. webSearch - Searches the web for information
2. textSummarizer - Summarizes long text into a concise form
3. calculateGeneral - Performs general calculations
4. calculateSavings - Calculates savings growth over time
5. compareTexts - Compares two texts for similarities
6. calculateBMI - Calculates Body Mass Index from height and weight
7. interpretHealthMetrics - Interprets health metrics with medical context
8. emotionalAnalysis - Analyzes the emotional tone of text

For each tool, you need to specify what input to provide and may reference output from previous steps.

Respond in this JSON format:
{
  "steps": [
    {
      "tool": "toolName",
      "input": "specific input for this tool",
      "description": "why this step is needed"
    },
    ...
  ],
  "explanation": "Clear explanation of why this chain of tools was chosen"
}

IMPORTANT RULES:
- Be judicious about the number of steps - only include necessary tools
- For simple queries that only need one tool, just use that single tool
- For webSearch + calculation, always put webSearch first
- When using webSearch + textSummarizer, be explicit about what to extract
- The input field should contain either exact text to use or specify to use "output from previous step"
- Always provide specific inputs, never generic or placeholder inputs
- For BMI calculation + interpretation, first use calculateBMI, then use interpretHealthMetrics
- For emotional analysis of text, use compareTexts tool with appropriate parameters`,
    },
    {
      role: "user",
      content: `Plan a tool chain for this query: "${query}"`,
    },
  ];

  try {
    const response = await askOpenAI(messages);
    const content = response.choices[0].message.content;

    // Extract JSON if it's wrapped in markdown code blocks
    let planJson;
    try {
      // Try parsing directly first
      planJson = JSON.parse(content);
    } catch (parseErr) {
      // If direct parse fails, try extracting from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        planJson = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Failed to parse tool chain plan");
      }
    }

    return planJson;
  } catch (error) {
    console.error("Error planning tool chain:", error);
    // Fallback to a single tool as default plan
    return {
      steps: [
        {
          tool: "GPTIntern",
          input: query,
          description: "Using GPT to answer directly due to planning error",
        },
      ],
      explanation: "Falling back to direct GPT response due to planning error",
    };
  }
}

/**
 * Extract savings calculation parameters from text
 * @param {string} input - Text containing savings parameters
 * @returns {object} - Extracted parameters
 */
function extractSavingsParams(input) {
  // This is a simplistic parameter extraction
  // In a real-world app, use a more robust approach
  const rateMatch = input.match(
    /(\d+(?:\.\d+)?)\s*(?:€|EUR|euros?|per month)/i
  );
  const yearsMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:years?|yr)/i);
  const interestMatch = input.match(
    /(\d+(?:\.\d+)?)\s*(?:%|percent|interest)/i
  );

  return {
    rate: rateMatch ? parseFloat(rateMatch[1]) : 100,
    years: yearsMatch ? parseFloat(yearsMatch[1]) : 5,
    interestRate: interestMatch ? parseFloat(interestMatch[1]) : 0,
  };
}

/**
 * Extract two texts from an input string or object
 * @param {string|object} input - Input which contains two texts
 * @returns {object} - Object with text1 and text2 properties
 */
function extractTwoTexts(input) {
  // If input is already an object with text1 and text2 properties, use it directly
  if (
    typeof input === "object" &&
    input !== null &&
    input.text1 &&
    input.text2
  ) {
    return {
      text1: input.text1,
      text2: input.text2,
    };
  }

  // Otherwise, try to extract from string
  if (typeof input === "string") {
    // Try to find patterns like 'text1: "something" text2: "something else"'
    const text1Match = input.match(
      /(?:text1:|first text:|'|")([^'"]*?)(?:'|")/i
    );
    const text2Match = input.match(
      /(?:text2:|second text:|'|")([^'"]*?)(?:'|")/i
    );

    if (text1Match && text2Match) {
      return {
        text1: text1Match[1].trim(),
        text2: text2Match[1].trim(),
      };
    }

    // Try to split by 'and' if the above didn't work
    const parts = input.split(/\band\b|,|\bvs\.?\b|\bversus\b/i);
    if (parts.length >= 2) {
      return {
        text1: parts[0].replace(/['"]/g, "").trim(),
        text2: parts[1].replace(/['"]/g, "").trim(),
      };
    }
  }

  // If all else fails
  throw new Error("Could not extract two separate texts from the input");
}

/**
 * Executes a single step in the tool chain
 * @param {object} step - The step configuration
 * @param {string} originalQuery - The original query
 * @param {any} previousStepOutput - Output from previous step
 * @param {Array} previousSteps - All previous execution steps
 * @returns {Promise<any>} - The result of this tool execution
 */
async function executeToolStep(
  step,
  originalQuery,
  previousStepOutput,
  previousSteps
) {
  const { tool, input } = step;

  // Determine the actual input to use for this step
  let actualInput = input;

  // Check if input is a string before using includes()
  if (
    typeof input === "string" &&
    input.includes("output from previous step") &&
    previousStepOutput !== null
  ) {
    actualInput = previousStepOutput;
  } else if (typeof input === "object" && input !== null) {
    // If it's already an object, use it directly
    actualInput = input;
  }

  // Execute the appropriate tool
  switch (tool) {
    case "webSearch":
      return await webSearch(actualInput);

    case "textSummarizer":
      return await textSummarizer(actualInput);

    case "calculateGeneral":
      const calcResult = await calculateGeneral(actualInput);
      return calcResult.result;

    case "calculateSavings":
      // Parse parameters from input if it's a string
      if (typeof actualInput === "string") {
        const params = extractSavingsParams(actualInput);
        const saveResult = calculateSavings(
          params.rate,
          params.years,
          params.interestRate
        );
        return saveResult;
      } else {
        // If it's an object, use the properties directly
        const saveResult = calculateSavings(
          actualInput.rate || actualInput.amount,
          actualInput.years || actualInput.period,
          actualInput.interestRate || 0
        );
        return saveResult;
      }

    case "compareTexts":
      // Get the two texts either from object or by extracting from string
      let texts;
      if (
        typeof actualInput === "object" &&
        actualInput.text1 &&
        actualInput.text2
      ) {
        texts = actualInput;
      } else {
        texts = extractTwoTexts(actualInput);
      }
      const compareResult = await compareTexts(texts.text1, texts.text2);
      return compareResult.similarities;

    case "calculateBMI":
      // If input is already an object with height and weight properties, use them directly
      if (typeof actualInput === "object" && actualInput !== null) {
        // Support both heightCm and height property names
        const height = actualInput.heightCm || actualInput.height;
        const weight = actualInput.weightKg || actualInput.weight;

        if (height && weight) {
          return calculateBMI(height, weight);
        }
      }
      // Otherwise extract from text
      const bmiParams = extractBMIParams(actualInput);
      return calculateBMI(bmiParams.height, bmiParams.weight);

    case "interpretHealthMetrics":
      return await interpretHealthMetrics(actualInput);

    case "emotionalAnalysis":
      // Handle object or string input
      let emotionTexts;
      if (
        typeof actualInput === "object" &&
        actualInput.text1 &&
        actualInput.text2
      ) {
        emotionTexts = actualInput;
      } else if (typeof actualInput === "string") {
        emotionTexts = extractTwoTexts(actualInput);
      } else {
        throw new Error("Invalid input format for emotional analysis");
      }

      // Use compareTexts but with a more specific focus
      const messages = [
        {
          role: "system",
          content:
            "Analyze the emotional tone and sentiment of these texts, comparing their differences in intensity, positivity/negativity, and implied feelings.",
        },
        {
          role: "user",
          content: `Compare these texts emotionally:\nText 1: ${emotionTexts.text1}\nText 2: ${emotionTexts.text2}`,
        },
      ];
      const response = await askOpenAI(messages);
      return response.choices[0].message.content;

    case "GPTIntern":
      return await executeGPTStep(actualInput, previousSteps);

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

/**
 * Execute a GPT step for tasks not covered by other tools
 * @param {string} input - The input for GPT
 * @param {Array} previousSteps - Previous execution steps
 * @returns {Promise<string>} - GPT response
 */
async function executeGPTStep(input, previousSteps) {
  try {
    // Build context from previous steps
    let contextFromPreviousSteps = "";
    if (previousSteps.length > 0) {
      contextFromPreviousSteps = "Using information from previous steps:\n";
      previousSteps.forEach((step, index) => {
        contextFromPreviousSteps += `Step ${index + 1} (${step.tool}): ${
          typeof step.output === "string"
            ? step.output.substring(0, 200) +
              (step.output.length > 200 ? "..." : "")
            : JSON.stringify(step.output).substring(0, 200) + "..."
        }\n\n`;
      });
    }

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant that provides clear, accurate answers based on available information.",
      },
      {
        role: "user",
        content: `${contextFromPreviousSteps}\n\nBased on this context, please answer: ${input}`,
      },
    ];

    const response = await askOpenAI(messages);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error in GPT step:", error);
    return "Error processing this step with GPT.";
  }
}

/**
 * Format the final chain result with HTML
 * @param {string} originalQuery - The original query
 * @param {string} explanation - Chain explanation
 * @param {string} result - Final result
 * @returns {Promise<string>} - HTML formatted result
 */
async function formatChainResult(originalQuery, explanation, result) {
  // If result is already HTML (from webSearch), extract content
  if (typeof result === "string" && result.startsWith("<")) {
    // Try to clean it up a bit by keeping just the main content
    const contentMatch = result.match(
      /<div class="search-summary">([\s\S]*?)<\/div>/
    );
    if (contentMatch) {
      result = contentMatch[1];
    }
  }

  // Final HTML formatting
  return `
    <div class="chain-result">
      <div class="chain-header">
        <h4>Multi-Step Processing Results</h4>
        <p class="chain-explanation">${explanation}</p>
      </div>
      <div class="chain-content">
        ${result}
      </div>
    </div>
    <style>
      .chain-result {
        background-color: #f8f9fa;
        border-radius: 8px;
        overflow: hidden;
      }
      .chain-header {
        background-color: #e3efff;
        padding: 15px;
        border-bottom: 1px solid #d0e1fd;
      }
      .chain-header h4 {
        margin-top: 0;
        color: #3366cc;
      }
      .chain-explanation {
        color: #555;
        font-style: italic;
        margin-bottom: 0;
      }
      .chain-content {
        padding: 20px;
      }
    </style>
  `;
}

/**
 * Extract BMI calculation parameters from text
 * @param {string} input - Text containing height and weight parameters
 * @returns {object} - Extracted parameters
 */
function extractBMIParams(input) {
  if (typeof input !== "string") {
    // Default values if input is not a string
    return {
      height: 170,
      weight: 70,
    };
  }

  // Extract height in cm
  const heightMatch = input.match(
    /(\d+(?:\.\d+)?)\s*(?:cm|centimeters?|tall)/i
  );
  // Extract weight in kg
  const weightMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|weigh)/i);

  return {
    height: heightMatch ? parseFloat(heightMatch[1]) : 170, // Default height
    weight: weightMatch ? parseFloat(weightMatch[1]) : 70, // Default weight
  };
}
