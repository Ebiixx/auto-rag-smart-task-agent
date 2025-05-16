import { calculateSavings } from "../tools/SavingsCalculator";
import { calculateGeneral } from "../tools/GeneralCalculator";
import { compareTexts } from "../tools/TextComparer";
import { webSearch } from "../tools/WebSearch";
import { askOpenAI } from "../api";

/**
 * Executes the identified tools and generates a response
 * @param {string} query - The original user query
 * @param {object} toolIdentification - The identified tools
 * @returns {Promise<object>} - The generated response
 */
export async function executeTools(query, toolIdentification) {
  const { primaryTool, requiredData } = toolIdentification;

  try {
    switch (primaryTool) {
      case "calculateSavings":
        return await executeCalculation(requiredData);

      case "calculateGeneral":
        return await executePythonCalculation(requiredData);

      case "compareTexts":
        return await executeTextComparison(requiredData);

      case "webSearch":
        return await executeWebSearch(requiredData);

      case "GPTIntern":
      default:
        return await executeGPTIntern(query);
    }
  } catch (error) {
    console.error("Error during tool execution:", error);

    // Fallback for errors
    return {
      type: "error",
      content: `There was a problem executing the tool ${primaryTool}: ${error.message}`,
    };
  }
}

/**
 * Executes a savings calculation
 * @param {object} data - The data for the calculation
 * @returns {Promise<object>} - The calculation result
 */
async function executeCalculation(data) {
  const { rate, years, interestRate = 0 } = data;

  const result = calculateSavings(rate, years, interestRate);

  return {
    type: "calculation",
    content: result,
  };
}

/**
 * Executes a general calculation
 * @param {object} data - The data for the calculation
 * @returns {Promise<object>} - The calculation result
 */
async function executePythonCalculation(data) {
  try {
    console.log("executePythonCalculation with data:", data);
    const { query } = data;

    // Ensure that the query exists
    if (!query) {
      console.error("Missing calculation query");
      return {
        type: "error",
        content: "A clear task description is needed for the calculation.",
      };
    }

    const result = await calculateGeneral(query);

    return {
      type: "pythonCalculation",
      content: {
        result: result.result,
        pythonCode: result.pythonCode,
        explanation: result.explanation,
        query: result.query,
      },
    };
  } catch (error) {
    console.error("Error executing calculateGeneral:", error);
    return {
      type: "error",
      content: `There was a problem with the calculation: ${error.message}`,
    };
  }
}

/**
 * Executes a text comparison
 * @param {object} data - The texts to compare
 * @returns {Promise<object>} - The comparison result
 */
async function executeTextComparison(data) {
  const { text1, text2 } = data;

  const result = await compareTexts(text1, text2);

  return {
    type: "comparison",
    content: result,
  };
}

/**
 * Executes a web search
 * @param {object} data - The search query
 * @returns {Promise<object>} - The search result
 */
async function executeWebSearch(data) {
  const { searchQuery } = data;

  const result = await webSearch(searchQuery);

  return {
    type: "search",
    content: result,
  };
}

/**
 * Uses only GPT to answer the question
 * @param {string} query - The user's query
 * @returns {Promise<object>} - The generated answer
 */
async function executeGPTIntern(query) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "You are a helpful assistant who answers questions precisely and informatively.",
      },
      {
        role: "user",
        content: query,
      },
    ];

    const response = await askOpenAI(messages);
    const content = response.choices[0].message.content;

    return {
      type: "text",
      content: formatGPTResponse(content),
    };
  } catch (error) {
    console.error("Error with GPT Intern:", error);
    throw error;
  }
}

/**
 * Formats the GPT response as HTML
 * @param {string} text - The text to format
 * @returns {string} - The formatted HTML text
 */
export function formatGPTResponse(text) {
  if (!text) return ""; // Sicherstellen, dass Text vorhanden ist

  let newText = text;

  // Überschriften:
  // Markdown H1 -> HTML H3
  // Markdown H2 -> HTML H4
  // Markdown H3 -> HTML H5
  // Die Reihenfolge von spezifischer (###) zu weniger spezifischer (#) ist hier gute Praxis.
  newText = newText.replace(/^### (.*$)/gm, "<h5>$1</h5>");
  newText = newText.replace(/^## (.*$)/gm, "<h4>$1</h4>");
  newText = newText.replace(/^# (.*$)/gm, "<h3>$1</h3>");

  // Inline-Formatierungen
  newText = newText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>"); // Fett
  newText = newText.replace(/\*(.*?)\*/g, "<em>$1</em>"); // Kursiv

  // Paragraphen: Doppelte Zeilenumbrüche zu <br/><br/>
  // Dies sollte nach der Verarbeitung von Block-Elementen wie Überschriften erfolgen.
  newText = newText.replace(/\n\n/g, "<br/><br/>");

  // Optional: Einzelne Zeilenumbrüche (die nicht Teil von \n\n sind) ebenfalls in <br/> umwandeln.
  // newText = newText.replace(/(?<!\r?\n)\r?\n(?!\r?\n)/g, "<br/>");

  return newText;
}
