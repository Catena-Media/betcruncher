"use strict";

module.exports = (function () {

    var winAmount, amounts, eachWayAmounts, totalStake, betTypes, nullResult;

    // Polyfill isArray
    Array.isArray = Array.isArray || function (arg) {
        return Object.prototype.toString.call(arg) === "[object Array]";
    };

    // Set up the bet types
    betTypes = {

        // The basics
        single: {selections: 1, accumulator: false, singles: true},
        double: {selections: 2, accumulator: false, singles: false},
        treble: {selections: 3, accumulator: false, singles: false},

        // Simple accumulators
        fourfold: {selections: 4, accumulator: false, singles: false},
        fivefold: {selections: 5, accumulator: false, singles: false},
        sixfold: {selections: 6, accumulator: false, singles: false},
        sevenfold: {selections: 7, accumulator: false, singles: false},
        eightfold: {selections: 8, accumulator: false, singles: false},

        // Full covers
        trixie: {selections: 3, accumulator: true, singles: false},
        yankee: {selections: 4, accumulator: true, singles: false},
        superyankee: {selections: 5, accumulator: true, singles: false},
        heinz: {selections: 6, accumulator: true, singles: false},
        superheinz: {selections: 7, accumulator: true, singles: false},
        goliath: {selections: 8, accumulator: true, singles: false},

        // Full covers with singles
        patent: {selections: 3, accumulator: true, singles: true},
        lucky15: {selections: 4, accumulator: true, singles: true},
        lucky31: {selections: 5, accumulator: true, singles: true},
        lucky63: {selections: 6, accumulator: true, singles: true},
        lucky127: {selections: 7, accumulator: true, singles: true},
        lucky255: {selections: 8, accumulator: true, singles: true}
    };

    // Some bets don't make sense
    nullResult = {
        totalStake: 0,
        returns: 0,
        profit: 0
    };

    // Round to 2 decimal places
    function round(number) {
        return Math.round(number * 100) / 100;
    }

    // Work out a single
    function doSingle(stake, price, finishpos) {

        // Win
        if (finishpos === 1) {
            return stake * price;
        }

        // Void
        if (finishpos < 0) {
            return stake;
        }

        // Lose
        return 0;
    }

    // Work out an each way single
    function doEachWay(stake, price, terms, finishpos) {

        var eachWayOdds;

        // Placed
        if (finishpos > 0) {
            eachWayOdds = (price - 1) * (terms - 1);
            return stake + (eachWayOdds * stake);
        }

        // Void
        if (finishpos < 0) {
            return stake;
        }

        // Lose
        return 0;
    }

    function doRound(stake, type, num, isEachWay, runner) {

        var shouldDoAccumulator;

        // Calculate this round of bets
        amounts[num] = doSingle(amounts[num - 1], runner.odds, runner.position);
        if (isEachWay) {
            eachWayAmounts[num] = doEachWay(eachWayAmounts[num - 1], runner.odds, runner.terms, runner.position);
        }

        // Voodoo...
        shouldDoAccumulator = !(betTypes[type].selections === 1 && !betTypes[type].singles) &&
            (betTypes[type].accumulator || betTypes[type].selections === num);

        // Add to the accumulator, if appropriate
        if (shouldDoAccumulator) {
            totalStake += stake;
            winAmount += amounts[num];
            if (isEachWay) {
                totalStake += stake;
                winAmount += eachWayAmounts[num];
            }
        }
    }

    /**
     * calculator()
     * Calculate a given bet
     *
     * @param {object} betslip - An object of the form: { stake: 10, type: "single", eachWay: false }
     * @param {array} runners - An array of runner data: [ { odds: "10/1", terms: "1/4", position: 1 } ]
     * @return {object} Expected returns for this bet
     * @throws {Error} For invalid parameters
     */
    function calculator(betslip, runners) {

        var i, j, k, l, m, n, o, p, convert;

        // Validate the betslip is there
        if (!betslip) {
            throw new Error("No betslip data provided");
        }

        // Validate the stake
        betslip.stake = parseFloat(betslip.stake);
        if (isNaN(betslip.stake)) {
            throw new Error("Stake must be a number");
        }

        // Short circuit here: nothing ventured, nothing gained
        if (betslip.stake === 0) {
            return nullResult;
        }

        // Validate the bet type
        betslip.type = (betslip.type || "").toString().toLowerCase();
        if (betTypes.hasOwnProperty(betslip.type) === false) {
            throw new Error("Unrecognised bet type " + betslip.type);
        }

        // Force to a boolean type
        betslip.eachWay = !!betslip.eachWay;

        // No runners, then you definitely didn't win anything
        if (!runners) {
            return nullResult;
        }

        // Is there an array of runners?
        if (Array.isArray(runners) === false) {
            throw new Error("Expected an array of runners");
        }

        // Do we have enough runners for this type?
        if (betTypes[betslip.type].selections !== runners.length) {
            throw new Error(
                "Wrong number of runners for bet type. Expected "
                    + betTypes[betslip.type].selections
                    + ", found: "
                    + runners.length
            );
        }

        // Convert all the runners to the correct odds format
        convert = require("./oddsconverter");
        for (i = 0; i < runners.length; i += 1) {
            runners[i].odds = convert(runners[i].odds).decimal;
            runners[i].terms = convert(runners[i].terms).decimal;
            runners[i].position = parseInt(runners[i].position, 10);
        }

        // Reset previous values
        totalStake = 0;
        winAmount = 0;
        amounts = [betslip.stake];
        eachWayAmounts = [betslip.stake];

        // these loops go through all possible combinations with these selections without any duplicates
        for (i = 0; i < runners.length; i += 1) {
            doRound(betslip.stake, betslip.type, 1, betslip.eachWay, runners[i]); // single
            for (j = i + 1; j < betTypes[betslip.type].selections; j += 1) {
                doRound(betslip.stake, betslip.type, 2, betslip.eachWay, runners[j]); // double
                for (k = j + 1; k < betTypes[betslip.type].selections; k += 1) {
                    doRound(betslip.stake, betslip.type, 3, betslip.eachWay, runners[k]); // treble
                    for (l = k + 1; l < betTypes[betslip.type].selections; l += 1) {
                        doRound(betslip.stake, betslip.type, 4, betslip.eachWay, runners[l]); // 4-way
                        for (m = l + 1; m < betTypes[betslip.type].selections; m += 1) {
                            doRound(betslip.stake, betslip.type, 5, betslip.eachWay, runners[m]); // 5-way
                            for (n = m + 1; n < betTypes[betslip.type].selections; n += 1) {
                                doRound(betslip.stake, betslip.type, 6, betslip.eachWay, runners[n]); // 6-way
                                for (o = n + 1; o < betTypes[betslip.type].selections; o += 1) {
                                    doRound(betslip.stake, betslip.type, 7, betslip.eachWay, runners[o]); // 7-way
                                    for (p = o + 1; p < betTypes[betslip.type].selections; p += 1) {
                                        doRound(betslip.stake, betslip.type, 8, betslip.eachWay, runners[p]); // 8-way
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Format the return the result
        return {
            totalStake: round(totalStake),
            returns: round(winAmount),
            profit: round(winAmount - totalStake)
        };
    }

    // Expose the calculator interface
    return calculator;

}());
