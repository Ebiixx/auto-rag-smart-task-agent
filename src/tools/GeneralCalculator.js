import { askOpenAI } from "../api";

/**
 * Performs a general calculation by generating an explanation and solution
 * @param {string} query - The calculation request
 * @returns {Promise<object>} - The calculation result and additional information
 */
export async function calculateGeneral(query) {
  console.log("calculateGeneral called with:", { query });

  try {
    // Generate an explanation and calculation with OpenAI
    const result = await generateCalculationResult(query);

    return {
      result: result.answer,
      pythonCode: result.pythonCode,
      explanation: result.explanation,
      query,
    };
  } catch (error) {
    console.error("Error in calculateGeneral:", error);
    throw new Error(`Error during calculation: ${error.message}`);
  }
}

/**
 * Generates a calculation and explanation for the mathematical task
 * @param {string} query - The calculation request
 * @returns {Promise<object>} - Result with answer, code and explanation
 */
async function generateCalculationResult(query) {
  try {
    const messages = [
      {
        role: "system",
        content: `Act like an elite-level mathematician, specialized in financial and algebraic calculations with exact decimal precision. You always double-check each result logically, mathematically, and in practical context.

You must now analyze a mathematical question and solve it with absolute accuracy and detail.

Your goal is to:
1. Identify all variables and constants clearly.
2. Use only mathematically precise operations (avoid approximations unless rounding is explicitly requested).
3. If the result involves money, apply **financial rounding rules** (e.g., round to 2 decimal places using **standard bank rounding**, not Python's \`round()\`).
4. If the question includes terms like 'after how many years', ensure your answer includes:
   - both the precise decimal solution
   - and the rounded integer year that reaches or exceeds the target amount
   - and a comparison of the final balance in the year **before and after** that rounded year to justify your decision.
5. Always check whether the computed result fulfills the actual question asked (e.g. "when does it exceed 8000 €?" – not just when it mathematically equals ~12.09).
6. Use logarithms correctly and with full decimal precision. If needed, show intermediate calculations (e.g., log(1.6)/log(1.037) = ...).
7. Format your answer in exact JSON like this:

{
  "answer": "The capital of 5000 € grows to 8000 € after exactly 12.94 years. Since the question is about when 8000 € is exceeded, the practical answer is: after 13 years.",
  "pythonCode": "import math\\n\\nK_start = 5000\\nK_end = 8000\\np = 3.7\\nn = math.log(K_end / K_start) / math.log(1 + p / 100)\\nprint(n)  # exact years\\n\\n# Check rounding to whole years\\nK_12 = K_start * (1 + p / 100) ** 12\\nK_13 = K_start * (1 + p / 100) ** 13\\nprint(round(K_12, 2))\\nprint(round(K_13, 2))",
  "explanation": "The task requires determining when 5000 € becomes 8000 € at 3.7% interest. We use the compound interest formula: K_end = K_start * (1 + p)^n. To calculate n, we rearrange and substitute: log(1.6) / log(1.037) = 12.94 years. Since the capital only exceeds 8000 € after 13 years, the correct answer is: after 13 years. Before that (at year 12) it's only about 7732 €."
}`,
      },
      {
        role: "user",
        content: `Calculate precisely: ${query}`,
      },
    ];

    const response = await askOpenAI(messages);

    try {
      // Try to parse the JSON response
      return JSON.parse(response.choices[0].message.content.trim());
    } catch (parseError) {
      console.error("Error parsing the calculation:", parseError);
      console.error("Raw response:", response.choices[0].message.content);

      // Try to extract JSON from the response if it contains markdown code blocks
      const jsonMatches = response.choices[0].message.content.match(
        /```(?:json)?\s*(\{[\s\S]*?\})\s*```/
      );
      if (jsonMatches && jsonMatches[1]) {
        try {
          return JSON.parse(jsonMatches[1].trim());
        } catch (nestedParseError) {
          console.error("Error parsing extracted JSON:", nestedParseError);
        }
      }

      // Fallback if the JSON response cannot be parsed
      return {
        answer: "The calculation could not be performed automatically.",
        pythonCode:
          "# The calculation could not be translated into Python code",
        explanation: response.choices[0].message.content.trim(),
      };
    }
  } catch (error) {
    console.error("Error during calculation:", error);
    throw error;
  }
}
