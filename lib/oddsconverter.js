"use strict";

module.exports = (function () {

    function greatestCommonFactor(a, b) {

        var remainder;

        while (b !== 0) {
            remainder = a % b;
            a = b;
            b = remainder;
        }

        return Math.abs(a);
    }

    // Formats a USA-style price
    function formatAmerican(odds) {
        return odds.toString().substring(0, 1) + parseInt(Math.abs(odds), 10);
    }

    // Formats a UK-style fractional price
    function formatFractional(odds, separator) {

        var split, numerator, denominator;

        split = odds.split(/[\/\-\:]/);
        numerator = Math.round(split[0]);
        denominator = Math.round(split[1]);

        if (denominator <= 0) {
            throw new Error("Invalid price: " + odds);
        }

        return numerator.toString() + separator + denominator.toString();
    }

    // Converts a fraction to a decimal
    function fractionalToDecimal(odds) {

        var split, numerator, denominator;

        split = odds.split(/[\/\-\:]/, 2);

        numerator = parseInt(split[0], 10);
        denominator = parseInt(split[1], 10);

        if (denominator <= 0) {
            throw new Error("Invalid price: " + odds);
        }

        return 1 + (numerator / denominator);
    }

    // Converts a US price to a decimal
    function americanToDecimal(odds) {

        var decimalOdds;

        odds = odds.toString();
        decimalOdds = 0;

        if (odds.substring(0, 1) === "+") {

            decimalOdds = (parseInt(odds, 10) + 100) / 100;

            if (isNaN(odds) || decimalOdds < 2) {
                throw new Error("Invalid price:" + odds);
            }
            return decimalOdds;
        }

        if (odds.substring(0, 1) === "-") {

            odds = Math.abs(parseInt(odds, 10));
            decimalOdds = (odds + 100) / odds;

            if (isNaN(decimalOdds) || decimalOdds >= 2) {
                throw new Error("Invalid price: " + odds);
            }

            return decimalOdds;
        }

        throw new Error("Invalid price: " + odds);
    }

    // Converts decimal odds into US format
    function decimalToAmerican(odds) {
        if (odds < 2) {
            odds = Math.round(100 / (1 - odds));
        } else {
            odds = "+" + Math.round(100 * (odds - 1));
        }
        return formatAmerican(odds);
    }

    // Converts decimal odds into fractional format
    function decimalToFractional(odds) {

        var numerator, denominator, factor;

        if (isNaN(odds)) {
            throw new Error("Invalid price: " + odds);
        }

        // A decimal price <= 1 is not valid.
        odds = parseFloat(odds);
        if (odds <= 1) {
            throw new Error("Invalid price: " + odds);
        }

        // Set up a denominator and multiply up the numerator
        denominator = Math.pow(10, 8);
        numerator = Math.round((odds - 1) * denominator);

        // Divide down by common factors
        factor = greatestCommonFactor(numerator, denominator);
        while (factor > 1) {
            numerator /= factor;
            denominator /= factor;
            factor = greatestCommonFactor(numerator, denominator);
        }

        // Return a string
        return formatFractional(numerator + "/" + denominator, "/");
    }

    // Detects the odds format
    function whichFormatIs(odds) {

        // Check if this is fractional odds
        if (odds.toString().match(/^\d+[\/\-\:]\d+$/)) {
            return "fractional";
        }

        // Test if this is American odds
        if (odds.toString().match(/^[\+\-]/)) {
            return "american";
        }

        // Test for decimal odds
        if (!isNaN(odds)) {
            return "decimal";
        }

        // Cannot fathom odds format
        throw new Error("Cannot fathom odds format");
    }

    // Public API

    /**
     * Work out the format, and then give standard versions of, the provided odds.
     *
     * @param {mixed} odds - The price to convert
     * @throws {Error} If the odds are not valid
     * @return {object} Inforamtion about the odds
     */
    return function convert(odds) {

        var converted;

        converted = {
            originalFormat: whichFormatIs(odds)
        };

        switch (converted.originalFormat) {
        case "fractional":
            converted.fractional = formatFractional(odds, "/");
            converted.decimal = fractionalToDecimal(odds);
            converted.american = decimalToAmerican(converted.decimal);
            break;

        case "american":
            converted.decimal = americanToDecimal(odds);
            converted.american = formatAmerican(odds);
            converted.fractional = decimalToFractional(converted.decimal);
            break;

        case "decimal":
            converted.fractional = decimalToFractional(odds);
            converted.decimal = parseFloat(odds);
            converted.american = decimalToAmerican(converted.decimal);
            break;
        default:
            throw new Error("Cannot fathom odds format");
        }

        return converted;
    };
}());
