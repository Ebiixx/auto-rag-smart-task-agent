import React, { useState } from "react";
import { processUserQuery } from "../utils/toolRecognition";
import { dynamicToolChain } from "../core/dynamicToolChaining";
import "./ChatInterface.css"; // Add this import

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
    {
      query:
        "Compare these two sentences and analyze their emotional tone: 'I love this product!' and 'This product is acceptable.'",
      tool: "dynamicChain",
      expected: true,
    },
    {
      query:
        "Calculate the monthly payments on a 300,000€ mortgage over 30 years at 3.5% interest and explain the amortization",
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
                } else {
                  setUseDynamicChain(false);
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
                      <span
                        className="chain-icon"
                        role="img"
                        aria-label="Chain"
                      >
                        ⛓️
                      </span>{" "}
                      Tool Chain
                    </>
                  ) : example.expected ? (
                    <>
                      <span className="tool-icon" role="img" aria-label="Tool">
                        🛠️
                      </span>{" "}
                      {example.tool}
                    </>
                  ) : (
                    <>
                      <span
                        className="general-icon"
                        role="img"
                        aria-label="Chat"
                      >
                        💬
                      </span>{" "}
                      General AI
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
