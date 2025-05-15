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
        content: "There was a problem processing your request.",
      });
    } finally {
      setLoading(false);
    }
  };

  // New function that puts the example in the input field
  const handleExampleClick = (example) => {
    setUserInput(example);
  };

  // Examples with associated tools
  const examples = [
    {
      query: "If I save 60 € per month for 5 years, how much will I have?",
      tool: "calculateSavings",
    },
    {
      query:
        "If I eat 3 apples every day for 3 months and an apple costs 1.20€, how much will I have spent?",
      tool: "calculateGeneral",
    },
    {
      query: "What is the current status of CO₂ legislation in Germany?",
      tool: "webSearch",
    },
    {
      query:
        "What do these two statements have in common: 'The sun is shining' and 'It is bright outside'",
      tool: "compareTexts",
    },
    {
      query: "How many calories does a pizza have?",
      tool: "webSearch",
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
            placeholder="Ask a question or input a task..."
            className="chat-input"
          />
          <button type="submit" className="send-button">
            Send
          </button>
        </div>
      </form>

      <div className="example-queries">
        <p>
          <strong>Examples:</strong>
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
