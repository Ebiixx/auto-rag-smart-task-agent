# Auto RAG - Smart Task Agent

An intelligent application that recognizes task types and automatically employs the appropriate tools.

## Features

- 🧠 Automatic recognition of task type
- 🔢 Financial and general calculations with high precision
- 📊 Text analysis and comparison
- 🔍 Web search for questions requiring research
- 💬 General AI answers for simple questions

## Available Tools

- **calculateSavings()**: Calculates savings totals with or without interest
- **calculateGeneral()**: Performs precise mathematical calculations with detailed explanations
- **compareTexts()**: Compares two texts for semantic similarities
- **webSearch()**: Searches for current information on the web
- **textSummarizer()**: Summarizes long texts

## How It Works

1. The user submits a query
2. The system analyzes the query to determine the appropriate tool
3. The selected tool processes the query
4. Results are displayed with an explanation of the system's reasoning

### For Calculations

The system uses specialized mathematical algorithms with financial precision. For general calculations, it creates a detailed explanation with step-by-step workings and mathematical reasoning.

## System Architecture

This application implements a smart AI orchestration system that:

1. **Analyzes queries** to identify the underlying task type
2. **Selects specialized tools** appropriate for each task
3. **Routes processing** to task-specific handlers
4. **Provides transparency** by explaining tool selection decisions

While similar to Retrieval-Augmented Generation (RAG) systems, our approach focuses on tool selection and task routing rather than pure knowledge retrieval. This creates a more adaptable system that can handle a diverse range of queries with specialized processing strategies.

## Technologies

- React for the frontend
- Azure OpenAI API for AI functions
- Modern JavaScript with async/await patterns

## Installation

1. Clone the repository
2. Install dependencies with `npm install`
3. Start the application with `npm start`

## Environment Variables

The application requires the following environment variables in a `.env` file:

REACT_APP_GLOBAL_LLM_SERVICE="AzureOpenAI" REACT_APP_AZURE_OPENAI_CHAT_DEPLOYMENT_NAME="gpt-4o-mini" REACT_APP_AZURE_OPENAI_EMBEDDING_DEPLOYMENT_NAME="ada" REACT_APP_AZURE_OPENAI_ENDPOINT="https://your-endpoint.openai.azure.com/" REACT_APP_AZURE_OPENAI_API_KEY="your-api-key"

## Example Queries

- "If I save 60 € per month for 5 years, how much will I have?"
- "What is the current status of CO₂ legislation in Germany?"
- "What do these two statements have in common?"
- "How many calories does a pizza have?"
