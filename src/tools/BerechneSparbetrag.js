/**
 * Berechnet den Gesamtbetrag nach regelmäßigem Sparen
 * @param {number|string} rate - Monatlicher Sparbetrag in Euro
 * @param {number|string} years - Anzahl der Jahre
 * @param {number|string} interestRate - Jährlicher Zinssatz in Prozent (optional)
 * @returns {object} - Berechnetes Ergebnis mit Betrag und Details
 */
export function BerechneSparbetrag(rate, years, interestRate = 0) {
  console.log("BerechneSparbetrag aufgerufen mit:", {
    rate,
    years,
    interestRate,
  });

  try {
    // Validiere die Eingaben
    if (
      rate === undefined ||
      rate === null ||
      years === undefined ||
      years === null
    ) {
      throw new Error(
        "Fehlende Parameter: Bitte geben Sie einen monatlichen Betrag und eine Laufzeit an."
      );
    }

    // Konvertiere Strings zu Zahlen und entferne €-Zeichen oder Kommas wenn nötig
    if (typeof rate === "string") {
      rate = rate.replace("€", "").replace(",", ".").trim();
    }
    rate = parseFloat(rate);

    if (typeof years === "string") {
      years = parseInt(years.replace("Jahre", "").trim(), 10);
    } else {
      years = parseInt(years, 10);
    }

    if (typeof interestRate === "string") {
      interestRate = interestRate.replace("%", "").replace(",", ".").trim();
    }
    interestRate = parseFloat(interestRate || 0);

    // Überprüfe, ob die Umwandlung erfolgreich war
    if (isNaN(rate) || isNaN(years) || isNaN(interestRate)) {
      console.error("Ungültige Werte nach Konvertierung:", {
        rate,
        years,
        interestRate,
      });
      throw new Error("Ungültige Eingaben für die Berechnung");
    }

    if (rate <= 0 || years <= 0) {
      throw new Error("Betrag und Jahre müssen größer als 0 sein");
    }

    // Einfache Summe ohne Zinsen
    const basicSum = rate * 12 * years;

    // Mit Zinsen berechnen, falls Zinssatz > 0
    if (interestRate <= 0) {
      return {
        amount: basicSum.toFixed(2),
        details: `${rate} € × 12 Monate × ${years} Jahre = ${basicSum.toFixed(
          2
        )} €`,
      };
    } else {
      // Monatlicher Zinssatz
      const monthlyRate = interestRate / 100 / 12;
      let totalAmount = 0;

      // Für jeden Monat berechnen
      for (let month = 0; month < years * 12; month++) {
        // Hinzufügen des gesparten Betrags
        totalAmount += rate;
        // Zinsen für diesen Monat berechnen und hinzufügen
        totalAmount *= 1 + monthlyRate;
      }

      const interestGain = totalAmount - basicSum;

      return {
        amount: totalAmount.toFixed(2),
        details: `Grundbetrag: ${basicSum.toFixed(
          2
        )} € + Zinsgewinn: ${interestGain.toFixed(
          2
        )} € bei ${interestRate}% Zinsen p.a.`,
      };
    }
  } catch (error) {
    console.error("Fehler in BerechneSparbetrag:", error);
    throw new Error(`Ungültige Eingaben für die Berechnung: ${error.message}`);
  }
}
