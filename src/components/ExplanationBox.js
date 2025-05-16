import React from "react";

function ExplanationBox({ explanation }) {
  if (!explanation) return null;

  return (
    <div className="explanation-box">
      <h3>
        <span role="img" aria-label="Light bulb">
          💡
        </span>{" "}
        How I worked:
      </h3>
      <p>{explanation}</p>

      <style jsx>{`
        .explanation-box {
          background-color: #f9f1ff;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          border-left: 4px solid #a777e3;
        }

        h3 {
          margin-top: 0;
          color: #6e41a3;
        }

        p {
          margin-bottom: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

export default ExplanationBox;
