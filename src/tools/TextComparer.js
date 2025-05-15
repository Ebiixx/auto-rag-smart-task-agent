import { askOpenAI } from "../api";

/**
 * Compares two texts and finds semantic similarities
 * @param {string} text1 - First text to compare
 * @param {string} text2 - Second text to compare
 * @returns {object} - Result with both texts and their similarities
 */
export async function compareTexts(text1, text2) {
  // Normally, a actual semantic analysis would take place here
  // For our demo purpose, we use OpenAI API to compare the texts

  try {
    const messages = [
      {
        role: "system",
        content:
          "Identify semantic and content similarities between two texts.",
      },
      {
        role: "user",
        content: `Compare the following two texts and describe their similarities:
        
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
    console.error("Error when comparing texts:", error);
    return {
      text1,
      text2,
      similarities:
        "An analysis could not be performed due to a technical problem.",
    };
  }
}
