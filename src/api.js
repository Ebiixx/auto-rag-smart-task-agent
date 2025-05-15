// src/api.js
import axios from "axios";

export async function askOpenAI(messages) {
  try {
    console.log(
      "Calling API with messages:",
      JSON.stringify(messages, null, 2)
    );

    const endpoint = `${process.env.REACT_APP_AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.REACT_APP_AZURE_OPENAI_CHAT_DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-01`;

    const headers = {
      "Content-Type": "application/json",
      "api-key": process.env.REACT_APP_AZURE_OPENAI_API_KEY,
    };

    const body = {
      messages: messages,
      max_tokens: 2500,
      temperature: 0.7,
    };

    const response = await axios.post(endpoint, body, { headers });

    console.log(
      "API response received:",
      JSON.stringify(response.data, null, 2)
    );
    return response.data;
  } catch (error) {
    console.error("API error details:", error);
    throw error;
  }
}
