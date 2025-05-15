/**
 * Calculates the total amount after regular saving
 * @param {number|string} rate - Monthly savings amount in euros
 * @param {number|string} years - Number of years
 * @param {number|string} interestRate - Annual interest rate in percentage (optional)
 * @returns {object} - Calculated result with amount and details
 */
export function calculateSavings(rate, years, interestRate = 0) {
  console.log("calculateSavings called with:", {
    rate,
    years,
    interestRate,
  });

  try {
    // Validate inputs
    if (
      rate === undefined ||
      rate === null ||
      years === undefined ||
      years === null
    ) {
      throw new Error(
        "Missing parameters: Please provide a monthly amount and duration."
      );
    }

    // Convert strings to numbers and remove € signs or commas if necessary
    if (typeof rate === "string") {
      rate = rate.replace("€", "").replace(",", ".").trim();
    }
    rate = parseFloat(rate);

    if (typeof years === "string") {
      years = parseInt(years.replace("years", "").trim(), 10);
    } else {
      years = parseInt(years, 10);
    }

    if (typeof interestRate === "string") {
      interestRate = interestRate.replace("%", "").replace(",", ".").trim();
    }
    interestRate = parseFloat(interestRate || 0);

    // Check if conversion was successful
    if (isNaN(rate) || isNaN(years) || isNaN(interestRate)) {
      console.error("Invalid values after conversion:", {
        rate,
        years,
        interestRate,
      });
      throw new Error("Invalid inputs for calculation");
    }

    if (rate <= 0 || years <= 0) {
      throw new Error("Amount and years must be greater than 0");
    }

    // Simple sum without interest
    const basicSum = rate * 12 * years;

    // Calculate with interest if interest rate > 0
    if (interestRate <= 0) {
      return {
        amount: basicSum.toFixed(2),
        details: `${rate} € × 12 months × ${years} years = ${basicSum.toFixed(
          2
        )} €`,
      };
    } else {
      // Monthly interest rate
      const monthlyRate = interestRate / 100 / 12;
      let totalAmount = 0;

      // Calculate for each month
      for (let month = 0; month < years * 12; month++) {
        // Add the saved amount
        totalAmount += rate;
        // Calculate and add interest for this month
        totalAmount *= 1 + monthlyRate;
      }

      const interestGain = totalAmount - basicSum;

      return {
        amount: totalAmount.toFixed(2),
        details: `Basic amount: ${basicSum.toFixed(
          2
        )} € + Interest gain: ${interestGain.toFixed(
          2
        )} € at ${interestRate}% interest p.a.`,
      };
    }
  } catch (error) {
    console.error("Error in calculateSavings:", error);
    throw new Error(`Invalid inputs for calculation: ${error.message}`);
  }
}
