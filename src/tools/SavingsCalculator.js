/**
 * Calculate savings growth over time
 * @param {number} monthlyAmount - Amount saved per month
 * @param {number} years - Duration in years
 * @param {number} interestRate - Annual interest rate as decimal (e.g., 0.05 for 5%)
 * @returns {object} - Calculation result with amount and details
 */
export function calculateSavings(monthlyAmount, years, interestRate = 0) {
  console.log(`calculateSavings called with:`, {
    rate: monthlyAmount,
    years,
    interestRate,
  });

  try {
    // Validate inputs
    if (!monthlyAmount || !years) {
      throw new Error(
        "Missing parameters: Please provide a monthly amount and duration."
      );
    }

    // Ensure parameters are numbers
    monthlyAmount = Number(monthlyAmount);
    years = Number(years);
    interestRate = Number(interestRate) || 0;

    if (isNaN(monthlyAmount) || isNaN(years) || isNaN(interestRate)) {
      throw new Error("Invalid parameters: Please provide valid numbers.");
    }

    // Extract relevant values with fallbacks
    const rate =
      monthlyAmount ||
      monthlyAmount ||
      monthlyAmount ||
      monthlyAmount ||
      monthlyAmount ||
      100;

    // Convert interest rate from percentage to decimal if needed
    let effectiveInterestRate = interestRate;
    if (interestRate > 1) {
      effectiveInterestRate = interestRate / 100;
    }

    const totalYears = years || 10;

    // Calculate total contributions
    const months = totalYears * 12;
    const totalContribution = rate * months;

    // Calculate with interest if applicable
    let finalAmount;
    let interestEarned = 0;

    if (effectiveInterestRate > 0) {
      // Monthly interest rate
      const monthlyRate = effectiveInterestRate / 12;

      // Formula for future value of periodic payment
      // FV = PMT × ((1 + r)^n - 1) / r
      // Where: PMT = periodic payment, r = interest rate per period, n = number of periods
      finalAmount =
        rate *
        ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
        (1 + monthlyRate);
      interestEarned = finalAmount - totalContribution;
    } else {
      finalAmount = totalContribution;
    }

    // Format results
    const details =
      effectiveInterestRate > 0
        ? `Total investment: ${totalContribution.toFixed(
            2
          )}€, Interest earned: ${interestEarned.toFixed(2)}€`
        : `Total investment over ${totalYears} years`;

    return {
      amount: finalAmount.toFixed(2),
      totalContribution: totalContribution.toFixed(2),
      interestEarned: interestEarned.toFixed(2),
      years: totalYears,
      monthlyAmount: rate.toFixed(2),
      annualInterestRate: (effectiveInterestRate * 100).toFixed(2),
      details: details,
    };
  } catch (error) {
    console.log("Error in calculateSavings:", error);
    throw new Error(`Invalid inputs for calculation: ${error.message}`);
  }
}
