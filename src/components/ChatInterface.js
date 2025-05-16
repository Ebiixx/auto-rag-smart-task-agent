import React, { useState } from "react";
import { processUserQuery } from "../utils/toolRecognition";
import { dynamicToolChain } from "../core/dynamicToolChaining";

function ChatInterface({ setResponse, setExplanation, setLoading }) {
  const [userInput, setUserInput] = useState("");
  const [useDynamicChain, setUseDynamicChain] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setLoading(true);
    setResponse(null);
    setExplanation(null);

    try {
      if (useDynamicChain) {
        // Use dynamic tool chaining for complex queries
        const { result, steps } = await dynamicToolChain(userInput);

        setResponse({
          type: "dynamicChain",
          content: result,
          steps: steps,
        });

        setExplanation(
          "Dynamic Tool Chaining was used to process your request step by step."
        );
      } else {
        // Use the standard single-tool approach
        const { response, explanation } = await processUserQuery(userInput);
        setResponse(response);
        setExplanation(explanation);
      }
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
      expected: true,
    },
    {
      query:
        "If I eat 3 apples every day for 3 months and an apple costs 1.20€, how much will I have spent?",
      tool: "calculateGeneral",
      expected: true,
    },
    {
      query: "What is the current status of CO₂ legislation in Germany?",
      tool: "webSearch",
      expected: true,
    },
    {
      query:
        "What do these two statements have in common: 'The sun is shining' and 'It is bright outside'",
      tool: "compareTexts",
      expected: true,
    },
    {
      query: "How many calories does a pizza have?",
      tool: "webSearch",
      expected: true,
    },
    {
      query: "What is the meaning of life?",
      tool: "GPTIntern",
      expected: false,
    },
    {
      query: "Tell me a short story about a robot learning to paint",
      tool: "GPTIntern",
      expected: false,
    },
    // Removed: "What are the three laws of robotics?"

    // Examples that benefit from tool chaining
    {
      query:
        "Search for the latest electric car models and calculate the average price",
      tool: "dynamicChain",
      expected: true,
    },
    {
      query: "Look up the health benefits of apples and summarize them",
      tool: "dynamicChain",
      expected: true,
    },
    // New non-web search tool chain examples
    {
      query:
        "Compare and summarize the differences between saving 100€ monthly for 10 years with 2% vs 4% interest",
      tool: "dynamicChain",
      expected: true,
    },
    {
      query:
        "Calculate my BMI if I'm 180cm tall and weigh 75kg, then interpret what it means",
      tool: "dynamicChain",
      expected: true,
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
        <div className="dynamic-chain-toggle">
          <label>
            <input
              type="checkbox"
              checked={useDynamicChain}
              onChange={() => setUseDynamicChain(!useDynamicChain)}
            />
            <span className="toggle-label">
              Enable Dynamic Tool Chaining
              <span className="beta-badge">BETA</span>
            </span>
          </label>
          <span className="toggle-description">
            Automatically combine multiple tools to solve complex tasks
          </span>
        </div>
      </form>

      <div className="example-section">
        <h3 className="examples-title">Example Queries</h3>
        <div className="example-cards">
          {examples.map((example, index) => (
            <div
              key={index}
              className={`example-card ${
                example.tool === "dynamicChain"
                  ? "chain-card"
                  : example.expected
                  ? "tool-card"
                  : "general-card"
              }`}
              onClick={() => {
                handleExampleClick(example.query);
                if (example.tool === "dynamicChain") {
                  setUseDynamicChain(true);
                }
              }}
            >
              <div className="card-content">
                <p className="example-query">{example.query}</p>
                <div
                  className={`tool-badge ${
                    example.tool === "dynamicChain"
                      ? "chain-tool"
                      : example.expected
                      ? "expected-tool"
                      : "general-tool"
                  }`}
                >
                  {example.tool === "dynamicChain" ? (
                    <>
                      <span className="chain-icon">⛓️</span> Tool Chain
                    </>
                  ) : example.expected ? (
                    <>
                      <span className="tool-icon">🛠️</span> {example.tool}
                    </>
                  ) : (
                    <>
                      <span className="general-icon">💬</span> General AI
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .chat-interface {
          margin-bottom: 30px;
        }

        .input-container {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .dynamic-chain-toggle {
          display: flex;
          align-items: center;
          margin-bottom: 25px;
          padding: 10px;
          background-color: rgba(110, 142, 251, 0.1);
          border-radius: 8px;
        }

        .dynamic-chain-toggle input {
          margin-right: 8px;
        }

        .toggle-label {
          font-weight: 500;
          color: #4361ee;
          display: flex;
          align-items: center;
          margin-right: 12px;
        }

        .beta-badge {
          background-color: #ff9800;
          color: white;
          font-size: 0.6rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 8px;
        }

        .toggle-description {
          font-size: 0.8rem;
          color: #666;
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

        .example-section {
          margin-top: 30px;
        }

        .examples-title {
          margin-bottom: 15px;
          color: #333;
          font-size: 1.1rem;
        }

        .example-cards {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .example-card {
          background-color: #fff;
          border-radius: 8px;
          padding: 15px;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }

        .tool-card {
          border-left: 4px solid #4361ee;
        }

        .general-card {
          border-left: 4px solid #6c757d;
        }

        .chain-card {
          border-left: 4px solid #ff9800;
        }

        .example-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .card-content {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .example-query {
          margin: 0 0 15px 0;
          font-size: 0.95rem;
          color: #333;
          flex-grow: 1;
        }

        .tool-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 500;
          align-self: flex-start;
        }

        .expected-tool {
          background-color: rgba(67, 97, 238, 0.1);
          color: #4361ee;
          border: 1px solid rgba(67, 97, 238, 0.2);
        }

        .general-tool {
          background-color: rgba(108, 117, 125, 0.1);
          color: #6c757d;
          border: 1px solid rgba(108, 117, 125, 0.2);
        }

        .chain-tool {
          background-color: rgba(255, 152, 0, 0.1);
          color: #ff9800;
          border: 1px solid rgba(255, 152, 0, 0.2);
        }

        .tool-icon,
        .general-icon,
        .chain-icon {
          margin-right: 5px;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}

export default ChatInterface;
