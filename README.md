# Smart Task Agent

Eine intelligente Anwendung, die Aufgabentypen erkennt und die passenden Tools automatisch einsetzt.

## Features

- 🧠 Automatische Erkennung des Aufgabentyps
- 🔢 Berechnung von Sparbeträgen
- 📊 Textanalyse und Vergleich
- 🔍 Websuche für recherchebedürftige Fragen
- 💬 Allgemeine KI-Antworten für einfache Fragen

## Verfügbare Tools

- **BerechneSparbetrag()**: Berechnet Spartotale mit oder ohne Zinsen
- **VergleicheTexte()**: Vergleicht zwei Texte auf semantische Ähnlichkeiten
- **WebSearch()**: Sucht nach aktuellen Informationen im Web
- **GPTZusammenfassen()**: Fasst lange Texte zusammen

## Technologien

- React für das Frontend
- Azure OpenAI für KI-Funktionen
- Node.js für die Serverkomponenten

## Installation

1. Klonen Sie das Repository
2. Installieren Sie die Abhängigkeiten mit `npm install`
3. Starten Sie die Anwendung mit `npm start`

## Umgebungsvariablen

Die Anwendung benötigt die folgenden Umgebungsvariablen in einer `.env`-Datei:

REACT_APP_GLOBAL_LLM_SERVICE="AzureOpenAI" REACT_APP_AZURE_OPENAI_CHAT_DEPLOYMENT_NAME="gpt-4o-mini" REACT_APP_AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME="ada" REACT_APP_AZURE_OPENAI_ENDPOINT="https://your-endpoint.openai.azure.com/" REACT_APP_AZURE_OPENAI_API_KEY="your-api-key"

## Beispielanfragen

- "Wenn ich pro Monat 60 € für 5 Jahre spare, wie viel habe ich dann?"
- "Was ist der aktuelle Stand der CO₂-Gesetzgebung in Deutschland?"
- "Was haben diese beiden Aussagen gemeinsam?"
- "Wie viele Kalorien hat eine Pizza?"
