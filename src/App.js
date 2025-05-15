import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import ResponseDisplay from "./components/ResponseDisplay";
import ExplanationBox from "./components/ExplanationBox";
import "./styles/App.css";

function App() {
  const [response, setResponse] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  return (
    <div className="app">
      <header className="app-header">
        <h1>🧠 Smart Task Agent</h1>
        <p>Ich verstehe deine Aufgabe und wähle das passende Tool</p>
      </header>

      <main className="app-content">
        <ChatInterface
          setResponse={setResponse}
          setExplanation={setExplanation}
          setLoading={setLoading}
        />

        {loading && (
          <div className="loading-indicator">
            <p>Denke nach...</p>
          </div>
        )}

        {response && <ResponseDisplay response={response} />}

        {explanation && <ExplanationBox explanation={explanation} />}
      </main>

      <footer className="app-footer">
        <p>Smart Task Agent demonstriert KI-Toolauswahl nach Aufgabentyp</p>
      </footer>
    </div>
  );
}

export default App;
