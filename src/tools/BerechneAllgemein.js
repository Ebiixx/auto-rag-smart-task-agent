import { askOpenAI } from "../api";
const fs = require("fs").promises;
const path = require("path");

/**
 * Führt eine allgemeine Berechnung durch, indem eine Erklärung und Lösung generiert wird
 * @param {string} query - Die Berechnungsanfrage
 * @returns {Promise<object>} - Das Berechnungsergebnis und zusätzliche Informationen
 */
export async function BerechneAllgemein(query) {
  console.log("BerechneAllgemein aufgerufen mit:", { query });

  try {
    // Generiere eine Erklärung und Berechnung mit OpenAI
    const result = await generateCalculationResult(query);

    return {
      result: result.answer,
      pythonCode: result.pythonCode,
      explanation: result.explanation,
      query,
    };
  } catch (error) {
    console.error("Fehler in BerechneAllgemein:", error);
    throw new Error(`Fehler bei der Berechnung: ${error.message}`);
  }
}

/**
 * Generiert eine Berechnung und Erklärung für die mathematische Aufgabe
 * @param {string} query - Die Berechnungsanfrage
 * @returns {Promise<object>} - Ergebnis mit Antwort, Code und Erklärung
 */
async function generateCalculationResult(query) {
  try {
    const messages = [
      {
        role: "system",
        content: `Du bist ein Mathematik-Experte, der präzise Berechnungen durchführt.

Analysiere die gegebene Aufgabe und berechne das präzise mathematische Ergebnis mit folgenden Schritten:

1. Identifiziere die Variablen und Werte in der Aufgabe.
2. Erstelle einen Python-Code zur Lösung.
3. Führe die Berechnung schrittweise durch.
4. Gib das endgültige Ergebnis an.

Formatiere deine Antwort als JSON folgendermaßen:
{
  "answer": "Die eindeutige, präzise Antwort als vollständiger Satz",
  "pythonCode": "Ein korrekter Python-Code, der die Berechnung durchführt",
  "explanation": "Eine schrittweise Erklärung deiner Berechnung"
}

Sei besonders präzise bei der Berechnung und achte auf Kommazahlen und Währungsformatierungen.`,
      },
      {
        role: "user",
        content: `Berechne präzise: ${query}`,
      },
    ];

    const response = await askOpenAI(messages);

    try {
      // Versuche, die JSON-Antwort zu parsen
      return JSON.parse(response.choices[0].message.content.trim());
    } catch (parseError) {
      console.error("Fehler beim Parsen der Berechnung:", parseError);
      // Fallback, wenn die JSON-Antwort nicht geparst werden kann
      return {
        answer: "Die Berechnung konnte nicht automatisch durchgeführt werden.",
        pythonCode:
          "# Die Berechnung konnte nicht in Python-Code übersetzt werden",
        explanation: response.choices[0].message.content.trim(),
      };
    }
  } catch (error) {
    console.error("Fehler bei der Berechnung:", error);
    throw error;
  }
}
