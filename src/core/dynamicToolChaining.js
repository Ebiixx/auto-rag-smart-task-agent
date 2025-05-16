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
 * Process a multi-step tool chain to solve a complex query
 * @param {string} query - The user's query
 * @returns {Promise<Object>} - Result of the tool chain execution
 */
export async function dynamicToolChain(query) {
  try {
    // Step 1: Get a tool chain plan from the AI planner
    console.log(`Starting dynamic tool chain for: ${query}`);
    const plan = await getPlanForQuery(query);
    console.log("Tool chain plan:", plan);

    // Track outputs and executed steps
    let previousStepOutput = null;
    const executedSteps = [];

    // Step 2: Execute each step in the chain
    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.log(`Executing step ${i + 1}: ${step.tool}`);

      try {
        // Execute the tool with appropriate input handling
        const stepOutput = await executeToolStep(
          step,
          query,
          previousStepOutput,
          executedSteps
        );

        // Store execution details
        executedSteps.push({
          tool: step.tool,
          input: step.input,
          output: stepOutput,
          description: step.description,
        });

        // Update for next iteration
        previousStepOutput = stepOutput;
      } catch (stepError) {
        console.error(`Error in step ${i + 1}:`, stepError);
        executedSteps.push({
          tool: step.tool,
          input: step.input,
          output: `Error: ${stepError.message}`,
          error: true,
          description: step.description,
        });
        throw new Error(
          `Error in step ${i + 1} (${step.tool}): ${stepError.message}`
        );
      }
    }

    // Step 3: Format final result
    let finalResult = previousStepOutput;

    // If we have no valid final result, generate a summary of what we did find
    if (
      !finalResult ||
      (typeof finalResult === "string" && finalResult.includes("could not"))
    ) {
      finalResult = await generateFallbackResponse(
        query,
        executedSteps,
        plan.explanation
      );
    }

    return {
      result: finalResult,
      steps: executedSteps,
      explanation: plan.explanation,
    };
  } catch (error) {
    // Instead of throwing, return a user-friendly error result
    return {
      result:
        "Sorry, I could not generate a valid tool chain for your query. Please try rephrasing.",
      steps: [],
      explanation: error.message,
    };
  }
}

/**
 * Gets a plan from the AI for processing the user's query
 * @param {string} query - The user's query
 * @returns {Promise<Object>} - The planned steps and explanation
 */
async function getPlanForQuery(query) {
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

    // Try to extract JSON from markdown code block if present
    let planJson;
    try {
      planJson = JSON.parse(content);
    } catch (parseErr) {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        planJson = JSON.parse(jsonMatch[1]);
      } else {
        // If the plan contains '+' or other JS-like expressions, reject it
        if (content.includes("+ output from step")) {
          throw new Error(
            "AI returned invalid JSON with concatenation. Please rephrase your query or check your AI prompt instructions."
          );
        }
        throw new Error("Failed to parse tool chain plan");
      }
    }

    // Check for concatenation in any input fields
    for (const step of planJson.steps) {
      if (
        typeof step.input === "string" &&
        step.input.includes("+ output from step")
      ) {
        throw new Error(
          "AI returned a plan with concatenation in input fields. This is not supported. Please rephrase your query or improve the AI prompt."
        );
      }
      if (
        typeof step.input === "object" &&
        (step.input.text1?.includes("+ output from step") ||
          step.input.text2?.includes("+ output from step"))
      ) {
        throw new Error(
          "AI returned a plan with concatenation in input fields. This is not supported. Please rephrase your query or improve the AI prompt."
        );
      }
    }

    return planJson;
  } catch (error) {
    console.error("Error planning tool chain:", error);
    // Fallback: show a user-friendly error instead of GPTIntern
    throw new Error(
      "Could not generate a valid tool chain plan. Please try again or contact support."
    );
  }
}

async function executeToolStep(
  step,
  originalQuery,
  previousStepOutput,
  previousSteps
) {
  const { tool, input } = step;

  // Determine the actual input to use for this step
  let actualInput = input;

  // Process the input - handle references to previous step outputs
  if (
    typeof input === "string" &&
    input.toLowerCase().includes("output from step")
  ) {
    // Extract step number from the input string - use case insensitive matching
    const stepMatch = input.match(/output from step (\d+)/i);
    if (stepMatch && stepMatch[1]) {
      const stepNumber = parseInt(stepMatch[1]);
      if (
        previousSteps.length >= stepNumber &&
        previousSteps[stepNumber - 1]?.output
      ) {
        actualInput = previousSteps[stepNumber - 1].output;
      }
    } else if (
      input.toLowerCase().includes("output from previous step") &&
      previousStepOutput !== null
    ) {
      actualInput = previousStepOutput;
    }
  } else if (typeof input === "object" && input !== null) {
    // Handle object inputs with references to previous steps
    if (
      typeof input.text1 === "string" &&
      input.text1.toLowerCase().includes("output from step")
    ) {
      const stepMatch = input.text1.match(/output from step (\d+)/i);
      if (stepMatch && stepMatch[1]) {
        const stepNumber = parseInt(stepMatch[1]);
        if (
          previousSteps.length >= stepNumber &&
          previousSteps[stepNumber - 1]?.output
        ) {
          input.text1 = previousSteps[stepNumber - 1].output;
        }
      }
    }

    if (
      typeof input.text2 === "string" &&
      input.text2.toLowerCase().includes("output from step")
    ) {
      const stepMatch = input.text2.match(/output from step (\d+)/i);
      if (stepMatch && stepMatch[1]) {
        const stepNumber = parseInt(stepMatch[1]);
        if (
          previousSteps.length >= stepNumber &&
          previousSteps[stepNumber - 1]?.output
        ) {
          input.text2 = previousSteps[stepNumber - 1].output;
        }
      }
    }
  }

  // Execute the appropriate tool
  switch (tool) {
    case "webSearch":
      return await webSearch(actualInput);

    case "textSummarizer":
      // Handle different input types
      if (typeof actualInput === "object" && actualInput.similarities) {
        return await textSummarizer(actualInput.similarities);
      }
      // If input is a string, use it directly
      if (typeof actualInput === "string") {
        return await textSummarizer(actualInput);
      }
      // Fallback: stringify object
      return await textSummarizer(JSON.stringify(actualInput));

    case "calculateGeneral":
      const calcResult = await calculateGeneral(actualInput);
      return calcResult.result;

    case "calculateSavings":
      // Map the AI planner parameter names to what the function expects
      if (typeof actualInput === "object" && actualInput !== null) {
        // Extract relevant values with fallbacks
        const rate =
          actualInput.monthlyContribution ||
          actualInput.monthlyDeposit ||
          actualInput.monthlySaving ||
          actualInput.rate ||
          actualInput.amount ||
          100;
        // Convert interest rate from percentage to decimal if needed
        let interestRate =
          actualInput.interestRate || actualInput.annualInterestRate || 0;
        // Assume values over 1 are percentages that need to be converted to decimal form
        if (interestRate > 1) {
          interestRate = interestRate / 100;
        }
        const years = actualInput.years || actualInput.period || 10;

        console.log(
          `Using savings parameters: rate=${rate}, years=${years}, interestRate=${interestRate}`
        );
        return calculateSavings(rate, years, interestRate);
      } else if (typeof actualInput === "string") {
        // Parse parameters from input string
        const params = extractSavingsParams(actualInput);
        return calculateSavings(params.rate, params.years, params.interestRate);
      } else {
        throw new Error("Invalid input format for savings calculation");
      }

    case "compareTexts":
      // Special handling for comparing two savings calculations
      if (
        originalQuery.includes("compare") &&
        originalQuery.includes("saving") &&
        originalQuery.includes("interest") &&
        previousSteps.length >= 2 &&
        previousSteps[0].tool === "calculateSavings" &&
        previousSteps[1].tool === "calculateSavings"
      ) {
        // Format the two savings results for comparison
        const saving1 = previousSteps[0].output;
        const saving2 = previousSteps[1].output;

        const text1 = `Savings with ${saving1.annualInterestRate}% interest rate: 
Final amount: ${saving1.amount}€
Total contribution: ${saving1.totalContribution}€
Interest earned: ${saving1.interestEarned}€ over ${saving1.years} years`;

        const text2 = `Savings with ${saving2.annualInterestRate}% interest rate:
Final amount: ${saving2.amount}€
Total contribution: ${saving2.totalContribution}€
Interest earned: ${saving2.interestEarned}€ over ${saving2.years} years`;

        const compareResult = await compareTexts(text1, text2);
        return compareResult.similarities;
      }

      // Handle normal object input with text1 and text2
      if (
        typeof actualInput === "object" &&
        actualInput.text1 &&
        actualInput.text2
      ) {
        let text1 = actualInput.text1;
        let text2 = actualInput.text2;

        // If we got calculation results, format them nicely
        if (typeof text1 === "object") {
          text1 = `Savings with ${text1.annualInterestRate}% interest rate: 
Final amount: ${text1.amount}€
Total contribution: ${text1.totalContribution}€
Interest earned: ${text1.interestEarned}€ over ${text1.years} years`;
        }

        if (typeof text2 === "object") {
          text2 = `Savings with ${text2.annualInterestRate}% interest rate:
Final amount: ${text2.amount}€
Total contribution: ${text2.totalContribution}€
Interest earned: ${text2.interestEarned}€ over ${text2.years} years`;
        }

        const compareResult = await compareTexts(text1, text2);
        return compareResult.similarities;
      } else if (typeof actualInput === "string") {
        const texts = extractTwoTexts(actualInput);
        const compareResult = await compareTexts(texts.text1, texts.text2);
        return compareResult.similarities;
      } else {
        // Create a formatted comparison for saving calculations
        const amountDiff = Math.abs(
          parseFloat(previousSteps[1]?.output?.amount || 0) -
            parseFloat(previousSteps[0]?.output?.amount || 0)
        ).toFixed(2);

        return `Comparison of Savings with Different Interest Rates:

Based on a monthly deposit of ${
          previousSteps[0]?.output?.monthlyAmount
        }€ over ${previousSteps[0]?.output?.years} years:

1. With ${previousSteps[0]?.output?.annualInterestRate}% interest rate:
   - Final amount: ${previousSteps[0]?.output?.amount}€
   - Total contribution: ${previousSteps[0]?.output?.totalContribution}€
   - Interest earned: ${previousSteps[0]?.output?.interestEarned}€

2. With ${previousSteps[1]?.output?.annualInterestRate}% interest rate:
   - Final amount: ${previousSteps[1]?.output?.amount}€
   - Total contribution: ${previousSteps[1]?.output?.totalContribution}€
   - Interest earned: ${previousSteps[1]?.output?.interestEarned}€

The difference in final savings is ${amountDiff}€, which demonstrates the significant impact of interest rates on long-term savings. 
The higher interest rate (${
          previousSteps[1]?.output?.annualInterestRate
        }%) results in approximately ${(
          parseFloat(previousSteps[1]?.output?.interestEarned) /
          parseFloat(previousSteps[0]?.output?.interestEarned)
        ).toFixed(1)}x more interest earned compared to the lower rate (${
          previousSteps[0]?.output?.annualInterestRate
        }%).`;
      }

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

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
}

/**
 * Generate a fallback response when the tool chain doesn't produce a clear result
 */
async function generateFallbackResponse(query, executedSteps, explanation) {
  // Format the steps and outputs for context
  let stepsContent = executedSteps
    .map((step, index) => {
      const outputStr =
        typeof step.output === "object"
          ? JSON.stringify(step.output, null, 2)
          : String(step.output);

      return `Step ${index + 1}: ${step.tool}\n${outputStr}`;
    })
    .join("\n\n");

  // Ask the AI to generate a response based on the partial results
  const messages = [
    {
      role: "system",
      content:
        "You are an expert at analyzing and synthesizing information from partial results. Generate a complete response based on the available information from partially completed tool chains.",
    },
    {
      role: "user",
      content: `Original query: "${query}"\n\nTool chain explanation: ${explanation}\n\nPartial results:\n${stepsContent}\n\nPlease synthesize a coherent response that addresses the original query using the available information.`,
    },
  ];

  try {
    const response = await askOpenAI(messages);
    return response.choices[0].message.content;
  } catch (error) {
    return "Could not generate a complete response with the available information.";
  }
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
 * Extract parameters for savings calculation from text
 * @param {string} input - Text describing savings calculation
 * @returns {object} - Extracted parameters
 */
function extractSavingsParams(input) {
  // Default values
  let rate = 100;
  let years = 10;
  let interestRate = 0;

  if (typeof input === "string") {
    // Try to extract monthly amount
    const rateMatch = input.match(
      /(\d+(?:\.\d+)?)\s*(?:€|euro|per month|monthly|each month)/i
    );
    if (rateMatch) {
      rate = parseFloat(rateMatch[1]);
    }

    // Try to extract years
    const yearsMatch = input.match(/(\d+(?:\.\d+)?)\s*(?:years|year)/i);
    if (yearsMatch) {
      years = parseFloat(yearsMatch[1]);
    }

    // Try to extract interest rate
    const interestMatch = input.match(
      /(\d+(?:\.\d+)?)\s*(?:%|percent|interest)/i
    );
    if (interestMatch) {
      interestRate = parseFloat(interestMatch[1]) / 100; // Convert percentage to decimal
    }
  }

  return {
    rate,
    years,
    interestRate,
  };
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
