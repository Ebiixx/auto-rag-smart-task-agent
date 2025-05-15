import { askOpenAI } from "../api";
import { executeTools } from "./toolExecutor";

/**
 * Processes the user's request and identifies the appropriate tool
 * @param {string} userQuery - The user's request
 * @returns {Promise<object>} - The response and explanation of tool selection
 */
export async function processUserQuery(userQuery) {
  try {
    // 1. Recognize the type of request and identify needed tools
    const toolIdentification = await identifyRequiredTools(userQuery);

    // 2. Execute the identified tools
    const toolResponse = await executeTools(userQuery, toolIdentification);

    // 3. Create explanation for tool selection
    const explanation = generateExplanation(toolIdentification);

    return {
      response: toolResponse,
      explanation,
    };
  } catch (error) {
    console.error("Error processing request:", error);
    throw error;
  }
}

/**
 * Identifies the tools needed for a request
 * @param {string} query - The user's query
 * @returns {Promise<object>} - Information about the identified tools
 */
async function identifyRequiredTools(query) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are a system for analyzing user requests. Your task is to recognize what type of tool should be used to answer the request.

Available Tools:
1. "calculateSavings" - EXCLUSIVELY for long-term financial SAVING calculations, where someone regularly puts money aside, e.g. "If I save 50€ per month..."
2. "calculateGeneral" - For ALL other mathematical calculations, such as:
   - Simple and complex math
   - Expense calculations (e.g. "How much do 3 apples per day cost for 3 months")
   - Percentage calculations
   - Interest calculations (that don't involve monthly savings)
   - Statistical calculations
3. "compareTexts" - For comparing texts and finding similarities
4. "webSearch" - For current information that requires web research
5. "GPTIntern" - For general questions that don't require calculations or special tools

STRICT RULE: 
- calculateSavings ONLY for regular saving with fixed amounts
- calculateGeneral for ALL other mathematical problems

Answer in the following JSON format:
{
  "primaryTool": "Name of the main tool",
  "secondaryTool": "Name of the optional secondary tool or null",
  "requiredData": {
    // For calculateSavings:
    "rate": Amount in euros as a number (just the number value),
    "years": Number of years as a number (just the number value),
    "interestRate": Interest rate as a number (just the number value, optional)
    
    // For calculateGeneral:
    "query": "The complete calculation task"
    
    // For compareTexts:
    "text1": "First text",
    "text2": "Second text"
    
    // For webSearch:
    "searchQuery": "Search term"
    
    // For GPTIntern:
    "query": "The original query"
  },
  "reasoning": "Brief justification for your tool choice"
}`,
      },
      {
        role: "user",
        content: query,
      },
    ];

    const response = await askOpenAI(messages);

    try {
      // Parse the JSON response
      const result = JSON.parse(response.choices[0].message.content);
      console.log("Identified tools:", result);
      return result;
    } catch (parseError) {
      console.error("Error parsing tool recognition:", parseError);
      console.log("Response received:", response.choices[0].message.content);

      // Fallback: If the JSON can't be parsed, use GPTIntern
      return {
        primaryTool: "GPTIntern",
        secondaryTool: null,
        requiredData: { query },
        reasoning: "Could not analyze request, using general processing.",
      };
    }
  } catch (error) {
    console.error("Error in tool recognition:", error);
    throw error;
  }
}

/**
 * Generates an explanation for the tool choice
 * @param {object} toolIdentification - The identified tools
 * @returns {string} - The explanation
 */
function generateExplanation(toolIdentification) {
  const { primaryTool, secondaryTool, reasoning } = toolIdentification;

  let explanation = `I used ${primaryTool} as the primary tool because ${reasoning}`;

  if (secondaryTool) {
    explanation += ` Additionally, I used ${secondaryTool} to refine the result.`;
  }

  return explanation;
}
