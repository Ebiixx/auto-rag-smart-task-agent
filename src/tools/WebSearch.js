import { askOpenAI } from "../api";

/**
 * Führt eine Websuche zu einem Thema durch
 * @param {string} query - Die Suchanfrage
 * @returns {Promise<string>} - Eine HTML-formatierte Zusammenfassung der Suchergebnisse
 */
export async function WebSearch(query) {
  // Für eine echte App würde hier eine tatsächliche API verwendet werden
  // In dieser Demo simulieren wir eine Websuche

  console.log(`Simuliere Websuche für: "${query}"`);

  // Für Demozwecke geben wir vormulierte Antworten für bestimmte Abfragen zurück
  const searchResults = getSimulatedResults(query);

  // Webinhalte zusammenfassen mit TextSummarizer
  const summarizedResult = await summarizeWebContent(searchResults, query);

  return summarizedResult;
}

// Simulierte Suchergebnisse für bestimmte Anfragen
function getSimulatedResults(query) {
  const lowerQuery = query.toLowerCase();

  // Vordefinierte Antworten auf bestimmte Anfragen
  if (
    lowerQuery.includes("co2") ||
    lowerQuery.includes("co₂") ||
    lowerQuery.includes("gesetzgebung")
  ) {
    return [
      {
        title: "Bundesregierung - Klimaschutzgesetz",
        url: "https://www.bundesregierung.de/breg-de/themen/klimaschutz/klimaschutzgesetz-2021-1913672",
        snippet:
          "Das novellierte Klimaschutzgesetz sieht vor, die Treibhausgasemissionen bis 2030 um 65% gegenüber 1990 zu reduzieren. Bis 2045 soll Deutschland klimaneutral sein.",
      },
      {
        title: "Umweltbundesamt - CO₂-Bepreisung in Deutschland",
        url: "https://www.umweltbundesamt.de/themen/klima-energie/klimaschutz-energiepolitik-in-deutschland/co2-bepreisung-in-deutschland",
        snippet:
          "Seit 2021 gilt in Deutschland eine CO₂-Bepreisung für die Sektoren Wärme und Verkehr. Der Einstiegspreis lag bei 25 Euro pro Tonne CO₂.",
      },
      {
        title: "BMWK - Fragen und Antworten zur CO₂-Bepreisung",
        url: "https://www.bmwk.de/Redaktion/DE/FAQ/CO2-Bepreisung/faq-co2-bepreisung.html",
        snippet:
          "Die CO₂-Bepreisung ist ein wichtiges Instrument zur Erreichung der Klimaziele. Sie schafft Anreize für klimafreundliche Technologien und Verhaltensweisen.",
      },
    ];
  } else if (lowerQuery.includes("pizza") && lowerQuery.includes("kalorien")) {
    return [
      {
        title: "Bundeszentrum für Ernährung - Kaloriengehalt von Pizza",
        url: "https://www.bzfe.de/ernaehrung/ernaehrungswissen/kalorien-und-naehrwerte/",
        snippet:
          "Eine durchschnittliche Pizza Margherita (ca. 330g) enthält etwa 700-800 Kalorien. Je nach Belag kann der Kaloriengehalt stark variieren.",
      },
      {
        title: "Ernährungsdatenbank - Nährwerte verschiedener Pizzen",
        url: "https://naehrwertdatenbank.de",
        snippet:
          "Pizza Salami (350g): ca. 900 Kalorien, Pizza mit Gemüse (340g): ca. 750 Kalorien, Pizza Thunfisch (360g): ca. 830 Kalorien.",
      },
    ];
  } else {
    // Generische Antwort, wenn keine spezifische Antwort definiert ist
    return [
      {
        title: `Suchergebnisse für "${query}"`,
        url: "https://www.example.com/search",
        snippet: `Dies ist eine Simulation einer Websuche. In einer echten Anwendung würden hier echte Suchergebnisse zu "${query}" erscheinen.`,
      },
    ];
  }
}

// Simuliert die Zusammenfassung von Webinhalten
async function summarizeWebContent(searchResults, originalQuery) {
  // In einer echten Anwendung würde hier die Zusammenfassung mit der OpenAI API erfolgen
  // Für die Demo erstellen wir eine einfache HTML-formatierte Zusammenfassung

  let formattedHtml = `<h3>Suchergebnisse zu "${originalQuery}"</h3>`;

  // Füge alle Suchergebnisse hinzu
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

  // Zusammenfassung der Ergebnisse
  if (searchResults.length > 1) {
    const content = searchResults
      .map((r) => `${r.title}: ${r.snippet}`)
      .join("\n\n");

    try {
      const messages = [
        {
          role: "system",
          content:
            "Fasse die folgenden Informationen zu einer kurzen, informativen Antwort zusammen.",
        },
        {
          role: "user",
          content: `Basierend auf diesen Suchergebnissen, beantworte die Frage: "${originalQuery}"\n\n${content}`,
        },
      ];

      const response = await askOpenAI(messages);
      const summary = response.choices[0].message.content;

      formattedHtml += `
        <div class="search-summary">
          <h4>Zusammenfassung:</h4>
          <p>${summary}</p>
        </div>
      `;
    } catch (error) {
      console.error("Fehler bei der Zusammenfassung:", error);
      formattedHtml += `
        <div class="search-summary">
          <p><em>Eine Zusammenfassung konnte nicht erstellt werden.</em></p>
        </div>
      `;
    }
  }

  return formattedHtml;
}
