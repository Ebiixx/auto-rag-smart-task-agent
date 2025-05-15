import React from "react";

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

      case "search":
      case "text":
      default:
        return (
          <div className="text-result">
            <div dangerouslySetInnerHTML={{ __html: response.content }} />
          </div>
        );
    }
  };

  return (
    <div className="response-display">
      {renderResponse()}

      <style jsx>{`
        .response-display {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        h3 {
          margin-top: 0;
          color: #444;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .calculation-result .result-box {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }

        .calculation-result .amount {
          font-size: 2rem;
          font-weight: bold;
          color: #2c7be5;
          display: block;
          margin-bottom: 10px;
        }

        .calculation-result .details {
          color: #666;
          font-style: italic;
        }

        .python-calculation-result .result-box {
          background-color: #f0f8ff;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
        }

        .python-calculation-result .result {
          font-size: 1.1rem;
          line-height: 1.5;
          white-space: pre-line;
        }

        .python-calculation-result .explanation-box {
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
          margin-top: 15px;
        }

        .python-calculation-result .explanation-box h4 {
          margin-top: 0;
          color: #444;
        }

        .python-code-details {
          margin-top: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .python-code-details summary {
          padding: 10px 15px;
          background-color: #f5f5f5;
          cursor: pointer;
          font-weight: 500;
        }

        .python-code-details summary:hover {
          background-color: #ececec;
        }

        .code-block {
          margin: 0;
          padding: 15px;
          background-color: #2d2d2d;
          color: #f8f8f2;
          overflow-x: auto;
          font-family: "Courier New", monospace;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .comparison-result .texts-container {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .comparison-result .text-box {
          flex: 1;
          padding: 15px;
          background-color: #f5f5f5;
          border-radius: 8px;
        }

        .comparison-result .comparison-analysis {
          padding: 15px;
          background-color: #f0f8ff;
          border-radius: 8px;
          border-left: 4px solid #2c7be5;
        }

        .text-result {
          line-height: 1.6;
        }

        .text-result p {
          margin-top: 0;
        }

        .search-results {
          margin-bottom: 20px;
        }

        .search-result {
          padding: 15px;
          border-bottom: 1px solid #eee;
          margin-bottom: 10px;
        }

        .search-result h4 {
          margin-top: 0;
          margin-bottom: 8px;
        }

        .search-result a {
          color: #1a0dab;
          text-decoration: none;
        }

        .search-result a:hover {
          text-decoration: underline;
        }

        .search-result p {
          margin: 8px 0;
          color: #4d5156;
          font-size: 0.95rem;
        }

        .search-result .source {
          display: block;
          color: #70757a;
          font-size: 0.8rem;
          margin-top: 5px;
        }

        .search-summary {
          margin-top: 25px;
          padding: 20px;
          background-color: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #4285f4;
        }

        .search-summary h4 {
          margin-top: 0;
          margin-bottom: 12px;
          color: #1a0dab;
        }

        .summary-content {
          line-height: 1.6;
        }

        .error-message {
          padding: 15px;
          background-color: #fff3f3;
          border-left: 4px solid #f44336;
          border-radius: 4px;
          margin: 10px 0;
        }
      `}</style>
    </div>
  );
}

export default ResponseDisplay;
