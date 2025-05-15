import { askOpenAI } from "../api";

/**
 * Conducts a web search using Google Search API via RapidAPI
 * @param {string} query - The search query
 * @returns {Promise<string>} - An HTML-formatted summary of the search results
 */
export async function webSearch(query) {
  console.log(`Performing web search for: "${query}"`);

  try {
    const searchResults = await performRapidGoogleSearch(query);
    console.log(`Search returned ${searchResults.length} results`);
    const summarizedResult = await summarizeWebContent(searchResults, query);
    return summarizedResult;
  } catch (error) {
    console.error("Error during web search:", error);
    return `<div class="error-message">
              <h3>Search Error</h3>
              <p>Sorry, there was a problem with the web search: ${error.message}</p>
              <p>Please try again later or rephrase your search query.</p>
            </div>`;
  }
}

/**
 * Performs a Google search via RapidAPI
 */
async function performRapidGoogleSearch(query) {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://google-search72.p.rapidapi.com/search?q=${encodedQuery}&lr=en-US&num=10`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "x-rapidapi-host": "google-search72.p.rapidapi.com",
        "x-rapidapi-key": process.env.REACT_APP_RAPIDAPI_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Search failed with status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new Error("No search results returned from Google API");
    }

    return data.items.map((item) => ({
      title: item.title || "Untitled",
      url: item.link || "#",
      snippet: item.snippet || "No description available",
      source: "Google Search (RapidAPI)",
    }));
  } catch (error) {
    console.error("RapidAPI Google Search error:", error);
    throw new Error("Could not retrieve search results from Google API.");
  }
}

/**
 * Summarizes web content using OpenAI
 */
async function summarizeWebContent(searchResults, originalQuery) {
  let html = `<h3>Search results for "${originalQuery}"</h3>`;

  if (!searchResults || searchResults.length === 0) {
    html += `<div class="no-results"><p>No search results found.</p></div>`;
    return html;
  }

  html += '<div class="search-results">';
  for (const result of searchResults) {
    html += `
      <div class="search-result">
        <h4><a href="${result.url}" target="_blank">${result.title}</a></h4>
        <p>${result.snippet}</p>
        <small class="source">${result.source}</small>
      </div>`;
  }
  html += "</div>";

  try {
    const content = searchResults
      .map((r) => `${r.title}: ${r.snippet}`)
      .join("\n\n");

    const messages = [
      {
        role: "system",
        content: `You are a search results analyzer. Your task is to synthesize search results into an informative, objective summary.

When analyzing search results:
1. Focus on factual information
2. Identify common themes and key points
3. Present information clearly and objectively
4. Acknowledge if the information appears limited or outdated
5. Do not invent or assume facts that aren't in the search results
6. If the search results are insufficient to answer the query, acknowledge this fact`,
      },
      {
        role: "user",
        content: `Based on these search results, provide a comprehensive answer to the question: "${originalQuery}"\n\n${content}`,
      },
    ];

    const response = await askOpenAI(messages);
    const summary = response.choices[0].message.content;

    html += `
      <div class="search-summary">
        <h4>Summary:</h4>
        <div class="summary-content">${formatSummaryAsHTML(summary)}</div>
      </div>`;
  } catch (error) {
    console.error("Error during summarization:", error);
    html += `<div class="search-summary"><p><em>Could not create summary.</em></p></div>`;
  }

  return html;
}

/**
 * Formats summary with basic HTML
 */
function formatSummaryAsHTML(text) {
  return text
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>");
}
