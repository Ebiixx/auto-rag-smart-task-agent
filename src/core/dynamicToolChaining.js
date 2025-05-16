import { askOpenAI } from "../api";
import { calculateSavings } from "../tools/SavingsCalculator";
import { calculateGeneral } from "../tools/GeneralCalculator";
import { compareTexts } from "../tools/TextComparer";
import { webSearch } from "../tools/WebSearch";
import { textSummarizer } from "../tools/TextSummarizer";

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
- Always provide specific inputs, never generic or placeholder inputs`,
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
  if (
    input.includes("output from previous step") &&
    previousStepOutput !== null
  ) {
    actualInput =
      typeof previousStepOutput === "string"
        ? previousStepOutput
        : JSON.stringify(previousStepOutput);
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
      // Parse parameters from input
      const params = extractSavingsParams(actualInput);
      const saveResult = calculateSavings(
        params.rate,
        params.years,
        params.interestRate
      );
      return saveResult;

    case "compareTexts":
      // Split input into two texts
      const texts = extractTwoTexts(actualInput);
      const compareResult = await compareTexts(texts.text1, texts.text2);
      return compareResult.similarities;

    case "GPTIntern":
      return await executeGPTStep(actualInput, previousSteps);

    default:
      throw new Error(`Unknown tool: ${tool}`);
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
 * Extract two texts for comparison from input
 * @param {string} input - Text containing two texts to compare
 * @returns {object} - Two extracted texts
 */
function extractTwoTexts(input) {
  // Try to find text enclosed in quotes
  const quotes = input.match(/"([^"]*)"|'([^']*)'|`([^`]*)`/g);

  if (quotes && quotes.length >= 2) {
    return {
      text1: quotes[0].replace(/['"``]/g, ""),
      text2: quotes[1].replace(/['"``]/g, ""),
    };
  }

  // If quotes not found, try to split on common separators
  const separators = ["vs", "versus", "and", "with", ";", ","];
  for (const separator of separators) {
    if (input.toLowerCase().includes(separator)) {
      const parts = input.split(new RegExp(separator, "i"));
      if (parts.length >= 2) {
        return {
          text1: parts[0].trim(),
          text2: parts[1].trim(),
        };
      }
    }
  }

  // Fallback: split in the middle
  const middle = Math.floor(input.length / 2);
  return {
    text1: input.slice(0, middle).trim(),
    text2: input.slice(middle).trim(),
  };
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
