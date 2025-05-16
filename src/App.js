import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import ResponseDisplay from "./components/ResponseDisplay";
import ExplanationBox from "./components/ExplanationBox";
import ToolChainResult from "./components/ToolChainResult";
import "./styles/App.css";

function App() {
  const [response, setResponse] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <span role="img" aria-label="Brain">
            🧠
          </span>{" "}
          Smart Task Agent
        </h1>
        <p>I understand your task and choose the appropriate tool</p>
      </header>

      <main className="app-content">
        <ChatInterface
          setResponse={setResponse}
          setExplanation={setExplanation}
          setLoading={setLoading}
        />

        {loading && (
          <div className="loading-indicator">
            <p>Thinking...</p>
          </div>
        )}

        {response && <ResponseDisplay response={response} />}

        {explanation && <ExplanationBox explanation={explanation} />}

        {result && (
          <ToolChainResult
            result={result.result}
            steps={result.steps}
            explanation={result.explanation}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>
          Smart Task Agent demonstrates AI tool selection based on task type
        </p>
      </footer>
    </div>
  );
}

export default App;
