import { askOpenAI } from "../api";

/**
 * Fasst einen Text mittels GPT zusammen
 * @param {string} text - Der zu zusammenfassende Text
 * @param {number} maxLength - Maximale Länge der Zusammenfassung in Wörtern
 * @returns {Promise<string>} - Zusammengefasster Text
 */
export async function TextSummarizer(text, maxLength = 200) {
  try {
    const messages = [
      {
        role: "system",
        content: `Du bist ein Experte im Zusammenfassen von Texten. Fasse den gegebenen Text in maximal ${maxLength} Wörtern zusammen. Behalte die wichtigsten Informationen bei.`,
      },
      {
        role: "user",
        content: text,
      },
    ];

    const response = await askOpenAI(messages);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Fehler bei der Textzusammenfassung:", error);
    return "Die Zusammenfassung konnte aufgrund eines technischen Problems nicht erstellt werden.";
  }
}
