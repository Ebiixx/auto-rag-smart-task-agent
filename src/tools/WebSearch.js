import { askOpenAI } from "../api";

/**
 * Conducts a web search on a topic
 * @param {string} query - The search query
 * @returns {Promise<string>} - An HTML-formatted summary of the search results
 */
export async function webSearch(query) {
  // For a real app, an actual API would be used here
  // In this demo we simulate a web search

  console.log(`Simulating web search for: "${query}"`);

  // For demo purposes, we return pre-formulated responses for specific queries
  const searchResults = getSimulatedResults(query);

  // Summarize web content with TextSummarizer
  const summarizedResult = await summarizeWebContent(searchResults, query);

  return summarizedResult;
}

// Simulated search results for specific queries
function getSimulatedResults(query) {
  const lowerQuery = query.toLowerCase();

  // Pre-defined responses to specific queries
  if (
    lowerQuery.includes("co2") ||
    lowerQuery.includes("co₂") ||
    lowerQuery.includes("legislation")
  ) {
    return [
      {
        title: "Federal Government - Climate Protection Act",
        url: "https://www.bundesregierung.de/breg-de/themen/klimaschutz/klimaschutzgesetz-2021-1913672",
        snippet:
          "The amended Climate Protection Act provides for reducing greenhouse gas emissions by 65% by 2030 compared to 1990. Germany aims to be climate neutral by 2045.",
      },
      {
        title: "Federal Environment Agency - CO₂ Pricing in Germany",
        url: "https://www.umweltbundesamt.de/themen/klima-energie/klimaschutz-energiepolitik-in-deutschland/co2-bepreisung-in-deutschland",
        snippet:
          "Since 2021, CO₂ pricing has been in effect in Germany for the heating and transportation sectors. The entry price was 25 euros per ton of CO₂.",
      },
      {
        title: "BMWK - Questions and Answers on CO₂ Pricing",
        url: "https://www.bmwk.de/Redaktion/DE/FAQ/CO2-Bepreisung/faq-co2-bepreisung.html",
        snippet:
          "CO₂ pricing is an important instrument for achieving climate targets. It creates incentives for climate-friendly technologies and behaviors.",
      },
    ];
  } else if (lowerQuery.includes("pizza") && lowerQuery.includes("calories")) {
    return [
      {
        title: "Federal Center for Nutrition - Caloric Content of Pizza",
        url: "https://www.bzfe.de/ernaehrung/ernaehrungswissen/kalorien-und-naehrwerte/",
        snippet:
          "An average Pizza Margherita (approx. 330g) contains about 700-800 calories. The caloric content can vary greatly depending on toppings.",
      },
      {
        title: "Nutrition Database - Nutritional Values of Various Pizzas",
        url: "https://naehrwertdatenbank.de",
        snippet:
          "Pizza Salami (350g): approx. 900 calories, Pizza with vegetables (340g): approx. 750 calories, Pizza tuna (360g): approx. 830 calories.",
      },
    ];
  } else {
    // Generic response when no specific answer is defined
    return [
      {
        title: `Search results for "${query}"`,
        url: "https://www.example.com/search",
        snippet: `This is a simulation of a web search. In a real application, real search results for "${query}" would appear here.`,
      },
    ];
  }
}

// Simulates summarizing web content
async function summarizeWebContent(searchResults, originalQuery) {
  // In a real application, the summary would be done with the OpenAI API
  // For the demo, we create a simple HTML-formatted summary

  let formattedHtml = `<h3>Search results for "${originalQuery}"</h3>`;

  // Add all search results
  formattedHtml += '<div class="search-results">';
  searchResults.forEach((result) => {
    formattedHtml += `
      <div class="search-result">
        <h4><a href="${result.url}" target="_blank">${result.title}</a></h4>
        <p>${result.snippet}</p>
      </div>
    `;
  });
  formattedHtml += "</div>";

  // Summary of results
  if (searchResults.length > 1) {
    const content = searchResults
      .map((r) => `${r.title}: ${r.snippet}`)
      .join("\n\n");

    try {
      const messages = [
        {
          role: "system",
          content:
            "Summarize the following information into a brief, informative answer.",
        },
        {
          role: "user",
          content: `Based on these search results, answer the question: "${originalQuery}"\n\n${content}`,
        },
      ];

      const response = await askOpenAI(messages);
      const summary = response.choices[0].message.content;

      formattedHtml += `
        <div class="search-summary">
          <h4>Summary:</h4>
          <p>${summary}</p>
        </div>
      `;
    } catch (error) {
      console.error("Error during summarization:", error);
      formattedHtml += `
        <div class="search-summary">
          <p><em>A summary could not be created.</em></p>
        </div>
      `;
    }
  }

  return formattedHtml;
}
