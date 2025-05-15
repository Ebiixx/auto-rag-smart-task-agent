import { askOpenAI } from "../api";

/**
 * Vergleicht zwei Texte und findet semantische Gemeinsamkeiten
 * @param {string} text1 - Erster zu vergleichender Text
 * @param {string} text2 - Zweiter zu vergleichender Text
 * @returns {object} - Ergebnis mit beiden Texten und ihren Gemeinsamkeiten
 */
export async function VergleicheTexte(text1, text2) {
  // Hier würde normalerweise eine tatsächliche semantische Analyse erfolgen
  // Für unseren Demo-Zweck nutzen wir OpenAI API, um die Texte zu vergleichen

  try {
    const messages = [
      {
        role: "system",
        content:
          "Identifiziere semantische und inhaltliche Gemeinsamkeiten zwischen zwei Texten.",
      },
      {
        role: "user",
        content: `Vergleiche die folgenden zwei Texte und beschreibe ihre Gemeinsamkeiten:
        
        Text 1: ${text1}
        
        Text 2: ${text2}`,
      },
    ];

    const response = await askOpenAI(messages);
    const similarities = response.choices[0].message.content;

    return {
      text1,
      text2,
      similarities,
    };
  } catch (error) {
    console.error("Fehler beim Vergleichen der Texte:", error);
    return {
      text1,
      text2,
      similarities:
        "Es konnte keine Analyse durchgeführt werden aufgrund eines technischen Problems.",
    };
  }
}
