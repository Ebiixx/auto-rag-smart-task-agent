import React from "react";
import "./ResponseDisplay.css"; // Create this file for the CSS
import { formatGPTResponse } from "../utils/toolExecutor";

function ResponseDisplay({ response }) {
  if (!response) return null;

  const renderResponse = () => {
    switch (response.type) {
      case "calculation":
        return (
          <div className="calculation-result">
            <h3>Calculation Result</h3>
            <div className="result-box">
              <span className="amount">{response.content.amount} €</span>
              {response.content.details && (
                <div className="details">{response.content.details}</div>
              )}
            </div>
          </div>
        );

      case "pythonCalculation":
        return (
          <div className="python-calculation-result">
            <h3>Calculation Result</h3>
            <div className="result-box">
              <div className="result">{response.content.result}</div>
            </div>

            <div className="explanation-box">
              <h4>Explanation</h4>
              <p>{response.content.explanation}</p>
            </div>

            <details className="python-code-details">
              <summary>Show Python Code</summary>
              <pre className="code-block">
                <code>{response.content.pythonCode}</code>
              </pre>
            </details>
          </div>
        );

      case "comparison":
        return (
          <div className="comparison-result">
            <h3>Text Comparison</h3>
            <div className="texts-container">
              <div className="text-box">
                <h4>Text 1:</h4>
                <p>{response.content.text1}</p>
              </div>
              <div className="text-box">
                <h4>Text 2:</h4>
                <p>{response.content.text2}</p>
              </div>
            </div>
            <div className="comparison-analysis">
              <h4>Similarities:</h4>
              <p>{response.content.similarities}</p>
            </div>
          </div>
        );

      case "dynamicChain":
        const formattedContent = formatGPTResponse(response.content || "");
        return (
          <div className="dynamic-chain-result">
            <h3>Dynamic Tool Chaining Result</h3>
            <div className="result-box">
              <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
            </div>
            {response.steps && (
              <div className="chain-steps">
                <h4>Tool Chain Steps:</h4>
                <ol>
                  {response.steps.map((step, idx) => (
                    <li key={idx}>
                      <strong>{step.tool}</strong>
                      {step.output && (
                        <details>
                          <summary>Show Output</summary>
                          <pre style={{ whiteSpace: "pre-wrap" }}>
                            {typeof step.output === "string"
                              ? step.output
                              : JSON.stringify(step.output, null, 2)}
                          </pre>
                        </details>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        );

      case "search":
      case "text":
      default:
        const defaultFormattedContent = formatGPTResponse(
          response.content || ""
        );
        return (
          <div className="text-result">
            <div
              dangerouslySetInnerHTML={{ __html: defaultFormattedContent }}
            />
          </div>
        );
    }
  };

  return <div className="response-display">{renderResponse()}</div>;
}

export default ResponseDisplay;
