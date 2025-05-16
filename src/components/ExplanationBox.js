import React from "react";
import "./ExplanationBox.css"; // Create this file for CSS

function ExplanationBox({ explanation }) {
  if (!explanation) return null;

  return (
    <div className="explanation-box">
      <h3 className="explanation-title">
        <span role="img" aria-label="Light bulb">
          💡
        </span>{" "}
        How I worked:
      </h3>
      <p className="explanation-content">{explanation}</p>
    </div>
  );
}

export default ExplanationBox;
