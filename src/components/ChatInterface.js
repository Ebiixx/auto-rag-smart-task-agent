import React, { useState } from "react";
import { processUserQuery } from "../utils/toolRecognition";

function ChatInterface({ setResponse, setExplanation, setLoading }) {
  const [userInput, setUserInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setResponse(null);
    setExplanation(null);

    try {
      const { response, explanation } = await processUserQuery(userInput);
      setResponse(response);
      setExplanation(explanation);
    } catch (error) {
      console.error("Error processing query:", error);
      setResponse({
        type: "error",
        content: "Es gab ein Problem bei der Verarbeitung deiner Anfrage.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Neue Funktion, die das Beispiel in das Eingabefeld setzt
  const handleExampleClick = (example) => {
    setUserInput(example);
  };

  // Beispiele mit zugehörigen Tools
  const examples = [
    {
      query:
        "Wenn ich pro Monat 60 € für 5 Jahre spare, wie viel habe ich dann?",
      tool: "BerechneSparbetrag",
    },
    {
      query: "Was ist der aktuelle Stand der CO₂-Gesetzgebung in Deutschland?",
      tool: "WebSearch",
    },
    {
      query:
        "Was haben diese beiden Aussagen gemeinsam: 'Die Sonne scheint' und 'Es ist hell draußen'",
      tool: "VergleicheTexte",
    },
    {
      query: "Wie viele Kalorien hat eine Pizza?",
      tool: "WebSearch",
    },
  ];

  return (
    <div className="chat-interface">
      <form onSubmit={handleSubmit}>
        <div className="input-container">
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Stelle eine Frage oder gib eine Aufgabe ein..."
            className="chat-input"
          />
          <button type="submit" className="send-button">
            Senden
          </button>
        </div>
      </form>

      <div className="example-queries">
        <p>
          <strong>Beispiele:</strong>
        </p>
        <ul>
          {examples.map((example, index) => (
            <li key={index} onClick={() => handleExampleClick(example.query)}>
              <span className="example-text">{example.query}</span>
              <span className="example-tool">[Tool: {example.tool}]</span>
            </li>
          ))}
        </ul>
      </div>

      <style jsx>{`
        .chat-interface {
          margin-bottom: 30px;
        }

        .input-container {
          display: flex;
          gap: 10px;
        }

        .chat-input {
          flex: 1;
          padding: 15px;
          border: 2px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        .chat-input:focus {
          border-color: #a777e3;
          outline: none;
        }

        .send-button {
          padding: 0 25px;
          background-color: #6e8efb;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-size: 1rem;
          font-weight: bold;
          transition: background-color 0.3s;
        }

        .send-button:hover {
          background-color: #5670d8;
        }

        .example-queries {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f5ff;
          border-radius: 8px;
          font-size: 0.9rem;
        }

        .example-queries ul {
          margin: 0;
          padding-left: 20px;
        }

        .example-queries li {
          margin-bottom: 12px;
          color: #444;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .example-queries li:hover .example-text {
          color: #6e8efb;
          text-decoration: underline;
        }

        .example-tool {
          margin-top: 3px;
          font-size: 0.75rem;
          color: #666;
          margin-left: 5px;
          font-style: italic;
          background-color: rgba(110, 142, 251, 0.1);
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

export default ChatInterface;
