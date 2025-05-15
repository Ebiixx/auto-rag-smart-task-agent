import { BerechneSparbetrag } from "../tools/BerechneSparbetrag";
import { BerechneAllgemein } from "../tools/BerechneAllgemein";
import { VergleicheTexte } from "../tools/VergleicheTexte";
import { WebSearch } from "../tools/WebSearch";
import { askOpenAI } from "../api";

/**
 * Führt die identifizierten Tools aus und generiert eine Antwort
 * @param {string} query - Die ursprüngliche Anfrage des Nutzers
 * @param {object} toolIdentification - Die identifizierten Tools
 * @returns {Promise<object>} - Die generierte Antwort
 */
export async function executeTools(query, toolIdentification) {
  const { primaryTool, secondaryTool, requiredData } = toolIdentification;

  try {
    switch (primaryTool) {
      case "BerechneSparbetrag":
        return await executeCalculation(requiredData);

      case "BerechneAllgemein":
        return await executePythonCalculation(requiredData);

      case "VergleicheTexte":
        return await executeTextComparison(requiredData);

      case "WebSearch":
        return await executeWebSearch(requiredData);

      case "GPTIntern":
      default:
        return await executeGPTIntern(query);
    }
  } catch (error) {
    console.error("Fehler bei der Tool-Ausführung:", error);

    // Fallback bei Fehlern
    return {
      type: "error",
      content: `Es gab ein Problem bei der Ausführung des Tools ${primaryTool}: ${error.message}`,
    };
  }
}

/**
 * Führt eine Sparberechnung aus
 * @param {object} data - Die Daten für die Berechnung
 * @returns {Promise<object>} - Das Berechnungsergebnis
 */
async function executeCalculation(data) {
  const { rate, years, interestRate = 0 } = data;

  const result = BerechneSparbetrag(rate, years, interestRate);

  return {
    type: "calculation",
    content: result,
  };
}

/**
 * Führt eine allgemeine Berechnung aus
 * @param {object} data - Die Daten für die Berechnung
 * @returns {Promise<object>} - Das Berechnungsergebnis
 */
async function executePythonCalculation(data) {
  try {
    console.log("executePythonCalculation mit Daten:", data);
    const { query } = data;

    // Sicherstellen, dass die Anfrage vorhanden ist
    if (!query) {
      console.error("Fehlende Berechnungsanfrage");
      return {
        type: "error",
        content:
          "Für die Berechnung wird eine klare Aufgabenstellung benötigt.",
      };
    }

    const result = await BerechneAllgemein(query);

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
    console.error("Fehler bei der Ausführung von BerechneAllgemein:", error);
    return {
      type: "error",
      content: `Es gab ein Problem bei der Berechnung: ${error.message}`,
    };
  }
}

/**
 * Führt einen Textvergleich aus
 * @param {object} data - Die zu vergleichenden Texte
 * @returns {Promise<object>} - Das Vergleichsergebnis
 */
async function executeTextComparison(data) {
  const { text1, text2 } = data;

  const result = await VergleicheTexte(text1, text2);

  return {
    type: "comparison",
    content: result,
  };
}

/**
 * Führt eine Websuche aus
 * @param {object} data - Die Suchanfrage
 * @returns {Promise<object>} - Das Suchergebnis
 */
async function executeWebSearch(data) {
  const { searchQuery } = data;

  const result = await WebSearch(searchQuery);

  return {
    type: "search",
    content: result,
  };
}

/**
 * Verwendet nur GPT für die Beantwortung der Frage
 * @param {string} query - Die Anfrage des Nutzers
 * @returns {Promise<object>} - Die generierte Antwort
 */
async function executeGPTIntern(query) {
  try {
    const messages = [
      {
        role: "system",
        content:
          "Du bist ein hilfreicher Assistent, der Fragen präzise und informativ beantwortet.",
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
    console.error("Fehler bei GPT Intern:", error);
    throw error;
  }
}

/**
 * Formatiert die GPT-Antwort als HTML
 * @param {string} text - Der zu formatierende Text
 * @returns {string} - Der formatierte HTML-Text
 */
function formatGPTResponse(text) {
  // Einfaches Markdown zu HTML
  return text
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^# (.*$)/gm, "<h3>$1</h3>")
    .replace(/^## (.*$)/gm, "<h4>$1</h4>");
}
