import React from "react";

function ResponseDisplay({ response }) {
  if (!response) return null;

  const renderResponse = () => {
    switch (response.type) {
      case "calculation":
        return (
          <div className="calculation-result">
            <h3>Berechnungsergebnis</h3>
            <div className="result-box">
              <span className="amount">{response.content.amount} €</span>
              {response.content.details && (
                <div className="details">{response.content.details}</div>
              )}
            </div>
          </div>
        );

      case "comparison":
        return (
          <div className="comparison-result">
            <h3>Textvergleich</h3>
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
              <h4>Gemeinsamkeiten:</h4>
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
      `}</style>
    </div>
  );
}

export default ResponseDisplay;
