import { askOpenAI } from "../api";

/**
 * Interprets health metrics and provides explanations
 * @param {object} metrics - Health metric data to interpret
 * @returns {Promise<string>} - Interpretation results
 */
export async function interpretHealthMetrics(metrics) {
  try {
    // Construct the metrics string based on the input object
    let metricsStr = "";
    if (typeof metrics === "string") {
      metricsStr = metrics;
    } else {
      for (const [key, value] of Object.entries(metrics)) {
        metricsStr += `${key}: ${value}\n`;
      }
    }

    const messages = [
      {
        role: "system",
        content: `You are a health metrics interpreter that provides clear, factual interpretations of common health measurements. 
For each metric:
1. Explain what the metric means in plain language
2. Indicate the standard healthy/normal ranges
3. Interpret the provided value within those ranges
4. Provide general health implications (but avoid personal medical advice)
5. Include brief, practical suggestions for maintaining or improving these metrics

Always include appropriate disclaimers that this is for informational purposes only and not medical advice.`,
      },
      {
        role: "user",
        content: `Interpret the following health metrics:\n${metricsStr}`,
      },
    ];

    const response = await askOpenAI(messages);
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error interpreting health metrics:", error);
    return "Error interpreting health metrics: " + error.message;
  }
}

/**
 * Calculates Body Mass Index (BMI)
 * @param {number|string} heightCm - Height in centimeters
 * @param {number|string} weightKg - Weight in kilograms
 * @returns {object} - BMI value and category
 */
export function calculateBMI(heightCm, weightKg) {
  try {
    // Convert string inputs to numbers if needed
    if (typeof heightCm === "string") {
      heightCm = parseFloat(heightCm.replace("cm", "").trim());
    }

    if (typeof weightKg === "string") {
      weightKg = parseFloat(weightKg.replace("kg", "").trim());
    }

    // Validate inputs
    if (isNaN(heightCm) || isNaN(weightKg) || heightCm <= 0 || weightKg <= 0) {
      throw new Error("Invalid height or weight values");
    }

    // BMI formula: weight(kg) / height(m)²
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);

    // Determine BMI category
    let category = "";
    if (bmi < 18.5) {
      category = "underweight";
    } else if (bmi < 25) {
      category = "normal weight";
    } else if (bmi < 30) {
      category = "overweight";
    } else {
      category = "obese";
    }

    return {
      bmi: bmi.toFixed(2),
      category,
      heightCm,
      weightKg,
    };
  } catch (error) {
    console.error("Error calculating BMI:", error);
    throw new Error(`BMI calculation error: ${error.message}`);
  }
}
