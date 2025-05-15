import { askOpenAI } from "../api";

/**
 * Summarizes text using GPT
 * @param {string} text - The text to summarize
 * @param {number} maxLength - Maximum length of the summary in words
 * @returns {Promise<string>} - Summarized text
 */
export async function textSummarizer(text, maxLength = 200) {
  try {
    const messages = [
      {
        role: "system",
        content: `You are an expert in summarizing texts. Summarize the given text in at most ${maxLength} words. Keep the most important information.`,
      },
      {
        role: "user",
        content: text,
      },
    ];

    const response = await askOpenAI(messages);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error during text summarization:", error);
    return "The summary could not be created due to a technical problem.";
  }
}
