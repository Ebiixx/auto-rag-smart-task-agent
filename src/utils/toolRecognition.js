import { askOpenAI } from "../api";
import { executeTools } from "./toolExecutor";

/**
 * Verarbeitet die Anfrage des Nutzers und identifiziert das passende Tool
 * @param {string} userQuery - Die Anfrage des Nutzers
 * @returns {Promise<object>} - Die Antwort und die Erklärung der Tool-Wahl
 */
export async function processUserQuery(userQuery) {
  try {
    // 1. Erkenne den Typ der Anfrage und identifiziere benötigte Tools
    const toolIdentification = await identifyRequiredTools(userQuery);

    // 2. Führe die identifizierten Tools aus
    const toolResponse = await executeTools(userQuery, toolIdentification);

    // 3. Erstelle die Erklärung für die Tool-Wahl
    const explanation = generateExplanation(toolIdentification);

    return {
      response: toolResponse,
      explanation,
    };
  } catch (error) {
    console.error("Fehler bei der Verarbeitung der Anfrage:", error);
    throw error;
  }
}

/**
 * Identifiziert die für eine Anfrage benötigten Tools
 * @param {string} query - Die Anfrage des Nutzers
 * @returns {Promise<object>} - Informationen über die identifizierten Tools
 */
async function identifyRequiredTools(query) {
  try {
    const messages = [
      {
        role: "system",
        content: `Du bist ein System zur Analyse von Benutzeranfragen. Deine Aufgabe ist es, zu erkennen, welche Art von Werkzeug für die Beantwortung der Anfrage verwendet werden sollte.

Verfügbare Tools:
1. "BerechneSparbetrag" - AUSSCHLIESSLICH für langfristige finanzielle SPAR-Berechnungen, bei denen jemand regelmäßig Geld zurücklegt, z.B. "Wenn ich 50€ pro Monat spare..."
2. "BerechneAllgemein" - Für ALLE anderen mathematischen Berechnungen, wie:
   - Einfache und komplexe Mathematik
   - Ausgabenberechnungen (z.B. "Wie viel kosten 3 Äpfel pro Tag für 3 Monate")
   - Prozentberechnungen
   - Zinsberechnungen (die keine monatlichen Sparraten betreffen)
   - Statistische Berechnungen
3. "VergleicheTexte" - Für den Vergleich von Texten und das Finden von Gemeinsamkeiten
4. "WebSearch" - Für aktuelle Informationen, die eine Web-Recherche erfordern
5. "GPTIntern" - Für allgemeine Fragen, die keine Berechnungen oder speziellen Tools benötigen

STRENGE REGEL: 
- BerechneSparbetrag NUR für regelmäßiges Sparen mit festen Beträgen
- BerechneAllgemein für ALLE anderen mathematischen Probleme

Antworte im folgenden JSON-Format:
{
  "primaryTool": "Name des Haupttools",
  "secondaryTool": "Name des optionalen Sekundärtools oder null",
  "requiredData": {
    // Für BerechneSparbetrag:
    "rate": Betrag in Euro als Nummer (nur der Zahlenwert),
    "years": Anzahl Jahre als Nummer (nur der Zahlenwert),
    "interestRate": Zinssatz als Nummer (nur der Zahlenwert, optional)
    
    // Für BerechneAllgemein:
    "query": "Die vollständige Berechnungsaufgabe"
    
    // Für VergleicheTexte:
    "text1": "Erster Text",
    "text2": "Zweiter Text"
    
    // Für WebSearch:
    "searchQuery": "Suchbegriff"
    
    // Für GPTIntern:
    "query": "Die Originalanfrage"
  },
  "reasoning": "Kurze Begründung deiner Tool-Wahl"
}`,
      },
      {
        role: "user",
        content: query,
      },
    ];

    const response = await askOpenAI(messages);

    try {
      // Parse die JSON-Antwort
      const result = JSON.parse(response.choices[0].message.content);
      console.log("Identifizierte Tools:", result);
      return result;
    } catch (parseError) {
      console.error("Fehler beim Parsen der Tool-Erkennung:", parseError);
      console.log("Erhaltene Antwort:", response.choices[0].message.content);

      // Fallback: Wenn das JSON nicht geparst werden kann, verwenden wir GPTIntern
      return {
        primaryTool: "GPTIntern",
        secondaryTool: null,
        requiredData: { query },
        reasoning:
          "Konnte Anfrage nicht analysieren, verwende allgemeine Verarbeitung.",
      };
    }
  } catch (error) {
    console.error("Fehler bei der Tool-Erkennung:", error);
    throw error;
  }
}

/**
 * Generiert eine Erklärung für die Tool-Wahl
 * @param {object} toolIdentification - Die identifizierten Tools
 * @returns {string} - Die Erklärung
 */
function generateExplanation(toolIdentification) {
  const { primaryTool, secondaryTool, reasoning } = toolIdentification;

  let explanation = `Ich habe ${primaryTool} als primäres Tool verwendet, weil ${reasoning}`;

  if (secondaryTool) {
    explanation += ` Zusätzlich habe ich ${secondaryTool} verwendet, um das Ergebnis zu verfeinern.`;
  }

  return explanation;
}
