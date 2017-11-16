"use strict";

const test = require("tape");

const converter = require("../lib/oddsconverter");
const betcruncher = require("../lib/betcruncher");

// Odds conversion tests
test("Convert Fractions", assert => {

    assert.plan(4);

    const converted = converter("10/1");

    assert.equal(converted.originalFormat, "fractional", "Detect fractional odds");
    assert.equal(converted.fractional, "10/1", "Converts fractional to fractional");
    assert.equal(converted.decimal, 11.0, "Converts fractional to decimal");
    assert.equal(converted.american, "+1000", "Converts fractional to american");

    assert.end();
});

test("Convert Bogus Fractions", assert => {

    assert.plan(7);

    assert.throws(_ => converter("a/f"), "Bogus fraction throws: a/f");
    assert.throws(_ => converter("a/1"), "Bogus fraction throws: a/1");
    assert.throws(_ => converter("10/z"), "Bogus fraction throws: 10/z");
    assert.throws(_ => converter("/1"), "Bogus fraction throws: /1");
    assert.throws(_ => converter("10/"), "Bogus fraction throws: 10/");
    assert.throws(_ => converter("/"), "Bogus fraction throws: /");
    assert.throws(_ => converter("0/0"), "Bogus fraction throws: 0/0");

    assert.end();
});

test("Convert Decimal", assert => {

    assert.plan(4);

    const converted = converter(6);

    assert.equal(converted.originalFormat, "decimal", "Detect decimal odds");
    assert.equal(converted.fractional, "5/1", "Convert decimal to fractional");
    assert.equal(converted.decimal, 6.0, "Convert decimal to decimal");
    assert.equal(converted.american, "+500", "Convert decimal to american");

    assert.end();
});

test("Convert Small Decimals", assert => {

    assert.plan(4);

    const converted = converter(1.5);

    assert.equal(converted.originalFormat, "decimal", "Detect decimal odds");
    assert.equal(converted.fractional, "1/2", "Convert decimal to fractional");
    assert.equal(converted.decimal, 1.5, "Convert decimal to decimal");
    assert.equal(converted.american, "-200", "Convert decimal to american");

    assert.end();
});

test("Convert String Decimals", assert => {

    assert.plan(4);

    const converted = converter("3.5");

    assert.equal(converted.originalFormat, "decimal", "Detect decimal odds");
    assert.equal(converted.fractional, "5/2", "Convert decimal to fractional");
    assert.equal(converted.decimal, 3.5, "Convert decimal to decimal");
    assert.equal(converted.american, "+250", "Convert decimal to american");

    assert.end();
});

test("Convert Small String Decimals", assert => {

    assert.plan(4);

    const converted = converter("1.25");

    assert.equal(converted.originalFormat, "decimal", "Detect decimal odds");
    assert.equal(converted.fractional, "1/4", "Convert decimal to fractional");
    assert.equal(converted.decimal, 1.25, "Convert decimal to decimal");
    assert.equal(converted.american, "-400", "Convert decimal to american");

    assert.end();
});

test("Convert Bogus Decimals", assert => {

    assert.plan(4);

    assert.throws(_ => converter("..3"), "Bogus fraction throws: ..3");
    assert.throws(_ => converter("3.."), "Bogus fraction throws: 3..");
    assert.throws(_ => converter(1), "Bogus fraction throws: 1");
    assert.throws(_ => converter(0.1), "Bogus fraction throws: 0.1");

    assert.end();
});

test("Convert Positive Moneyline", assert => {

    assert.plan(4);

    const converted = converter("+800");

    assert.equal(converted.originalFormat, "american", "Detect american odds");
    assert.equal(converted.fractional, "8/1", "Convert american to fractional");
    assert.equal(converted.decimal, 9.0, "Convert american to decimal");
    assert.equal(converted.american, "+800", "Convert american to american");

    assert.end();
});

test("Convert Negative Moneyline", assert => {

    assert.plan(4);

    const converted = converter("-400");

    assert.equal(converted.originalFormat, "american", "Detect negative american odds");
    assert.equal(converted.fractional, "1/4", "Convert negative american to fractional");
    assert.equal(converted.decimal, 1.25, "Convert negative american to decimal");
    assert.equal(converted.american, "-400", "Convert negative american to american");

    assert.end();
});

test("Convert Negative Moneyline Numeric", assert => {

    assert.plan(4);

    const converted = converter(-400);

    assert.equal(converted.originalFormat, "american", "Detect negative american odds from number");
    assert.equal(converted.fractional, "1/4", "Convert negative american from number to fractional");
    assert.equal(converted.decimal, 1.25, "Convert negative american from number to decimal");
    assert.equal(converted.american, "-400", "Convert negative american from number to american");

    assert.end();
});

test("Convert Bogus Moneyline", assert => {

    assert.plan(4);

    assert.throws(_ => converter("+10B"), "Bogus fraction throws: +10B");
    assert.throws(_ => converter("-XYZ"), "Bogus fraction throws: -XYZ");
    assert.throws(_ => converter(-Infinity), "Bogus fraction throws: -Infinity");
    assert.throws(_ => converter("+ABC"), "Bogus fraction throws: +ABC");

    assert.end();
});

// Bet calculation tests
test("No Stake", assert => {

    assert.plan(3);

    const result = betcruncher({type: "single", stake: 0, eachWay: false}, []);

    assert.equal(0, result.totalStake, "Return 0 stake from 0 stake");
    assert.equal(0, result.returns, "Return 0 returns from 0 stake");
    assert.equal(0, result.profit, "Return 0 profit from 0 stake");

    assert.end();
});

test("Single", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "single", stake: 5, eachWay: false}, runners);

    assert.equal(5, result.totalStake, "Total stake returns 5");
    assert.equal(55, result.returns, "Returns are 55");
    assert.equal(50, result.profit, "Profit is 50");

    assert.end();
});

test("Double", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "double", stake: 8, eachWay: false}, runners);

    assert.equal(8, result.totalStake, "Expect total stake to be 8");
    assert.equal(160, result.returns, "Expect return to be 160");
    assert.equal(152, result.profit, "Expect profit to be 152");

    assert.end();
});

test("Treble", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "7/2", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "treble", stake: 13, eachWay: false}, runners);

    assert.equal(13, result.totalStake, "Expect total stake to be 13");
    assert.equal(1170, result.returns, "Expect return to be 1170");
    assert.equal(1157, result.profit, "Expect profit to be 1157");

    assert.end();
});

test("Fourfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "100/30", terms: "1/4", position: 1},
        {odds: "1/4", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fourfold", stake: 12, eachWay: false}, runners);

    assert.equal(12, result.totalStake, "Expect total stake to be 12");
    assert.equal(4290, result.returns, "Expect return to be 4290");
    assert.equal(4278, result.profit, "Expect profit to be 4278");

    assert.end();
});

test("Fivefold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "2/5", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fivefold", stake: 4, eachWay: false}, runners);

    assert.equal(4, result.totalStake, "Expect total stake to be 4");
    assert.equal(1512, result.returns, "Expect return to be 1512");
    assert.equal(1508, result.profit, "Expect profit to be 1508");

    assert.end();
});

test("Sixfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "7/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sixfold", stake: 2, eachWay: false}, runners);

    assert.equal(2, result.totalStake, "Expect total stake to be 2");
    assert.equal(120960, result.returns, "Expect return to be 120960");
    assert.equal(120958, result.profit, "Expect profit to be 120958");

    assert.end();
});

test("Sevenfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "7/1", terms: "1/4", position: 1},
        {odds: "9/1", terms: "1/4", position: 1},
        {odds: "11/1", terms: "1/4", position: 1},
        {odds: "15/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 5.5, eachWay: false}, runners);

    assert.equal(5.5, result.totalStake, "Expect total stake to be 5.5");
    assert.equal(4055040, result.returns, "Expect return to be 4055040");
    assert.equal(4055034.5, result.profit, "Expect profit to be 4055034.5");

    assert.end();
});

test("Eightfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "7/2", terms: "1/4", position: 1},
        {odds: "5/2", terms: "1/4", position: 1},
        {odds: "3/2", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(6201562.5, result.returns, "Expect return to be 6201562.5");
    assert.equal(6201462.5, result.profit, "Expect profit to be 6201462.5");

    assert.end();
});

// Losing wagers

test("Single Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "single", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Double Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "double", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Treble Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/4", position: 0},
        {odds: "7/2", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "treble", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Fourfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "100/30", terms: "1/4", position: 0},
        {odds: "1/4", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fourfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Fivefold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "1/1", terms: "1/4", position: 0},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "2/5", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fivefold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Sixfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "7/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sixfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Sevenfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "7/1", terms: "1/4", position: 1},
        {odds: "9/1", terms: "1/4", position: 1},
        {odds: "11/1", terms: "1/4", position: 0},
        {odds: "15/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

test("Eightfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "7/2", terms: "1/4", position: 0},
        {odds: "5/2", terms: "1/4", position: 1},
        {odds: "3/2", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-100, result.profit, "Expect profit to be -100");

    assert.end();
});

// Void wagers

test("Single Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "single", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Double Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "double", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Treble Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "7/2", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "treble", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Fourfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "100/30", terms: "1/4", position: -1},
        {odds: "1/4", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "fourfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Fivefold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "1/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/4", position: -1},
        {odds: "2/5", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "fivefold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Sixfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "6/1", terms: "1/4", position: -1},
        {odds: "7/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "sixfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Sevenfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "7/1", terms: "1/4", position: -1},
        {odds: "9/1", terms: "1/4", position: -1},
        {odds: "11/1", terms: "1/4", position: -1},
        {odds: "15/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Eightfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "6/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/4", position: -1},
        {odds: "7/2", terms: "1/4", position: -1},
        {odds: "5/2", terms: "1/4", position: -1},
        {odds: "3/2", terms: "1/4", position: -1},
        {odds: "2/3", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(100, result.returns, "Expect return to be 100");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});


// Part void wagers

test("Double Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "double", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(500, result.returns, "Expect return to be 500");
    assert.equal(400, result.profit, "Expect profit to be 40080");

    assert.end();
});

test("Treble Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "7/2", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "treble", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(450, result.returns, "Expect return to be 450");
    assert.equal(350, result.profit, "Expect profit to be 350");

    assert.end();
});

test("Fourfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "100/30", terms: "1/4", position: -1},
        {odds: "1/4", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fourfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(8250, result.returns, "Expect return to be 8250");
    assert.equal(8150, result.profit, "Expect profit to be 8150");

    assert.end();
});

test("Fivefold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "2/5", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "fivefold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(2520, result.returns, "Expect return to be 2520");
    assert.equal(2420, result.profit, "Expect profit to be 2420");

    assert.end();
});

test("Sixfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "7/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sixfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(31500, result.returns, "Expect return to be 31500");
    assert.equal(31400, result.profit, "Expect profit to be 31400");

    assert.end();
});

test("Sevenfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "7/1", terms: "1/4", position: -1},
        {odds: "9/1", terms: "1/4", position: 1},
        {odds: "11/1", terms: "1/4", position: 1},
        {odds: "15/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(2304000, result.returns, "Expect return to be 2304000");
    assert.equal(2303900, result.profit, "Expect profit to be 2303900");

    assert.end();
});

test("Eightfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "7/2", terms: "1/4", position: 1},
        {odds: "5/2", terms: "1/4", position: -1},
        {odds: "3/2", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: false}, runners);

    assert.equal(100, result.totalStake, "Expect total stake to be 100");
    assert.equal(253125, result.returns, "Expect return to be 253125");
    assert.equal(253025, result.profit, "Expect profit to be 253025");

    assert.end();
});

// Each way winning bets

test("Each Way Single", assert => {

    assert.plan(3);

    const runners = [
        {odds: "9/2", terms: "1/5", position: 2}
    ];

    const result = betcruncher({type: "single", stake: 15, eachWay: true}, runners);

    assert.equal(30, result.totalStake, "Expect total stake to be 30");
    assert.equal(28.5, result.returns, "Expect return to be 28.5");
    assert.equal(-1.5, result.profit, "Expect profit to be -1.5");

    assert.end();
});

test("Each Way Double", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 2}
    ];

    const result = betcruncher({type: "double", stake: 8, eachWay: true}, runners);

    assert.equal(16, result.totalStake, "Expect total stake to be 16");
    assert.equal(25.2, result.returns, "Expect return to be 25.2");
    assert.equal(9.2, result.profit, "Expect profit to be 9.2");

    assert.end();
});

test("Each Way Treble", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 2},
        {odds: "7/2", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "treble", stake: 13, eachWay: true}, runners);

    assert.equal(26, result.totalStake, "Expect total stake to be 26");
    assert.equal(76.78, result.returns, "Expect return to be 76.78");
    assert.equal(50.78, result.profit, "Expect profit to be 50.78");

    assert.end();
});

test("Each Way Fourfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/5", position: 2},
        {odds: "100/30", terms: "1/4", position: 1},
        {odds: "1/4", terms: "1/5", position: 2}
    ];

    const result = betcruncher({type: "fourfold", stake: 12, eachWay: true}, runners);

    assert.equal(24, result.totalStake, "Expect total stake to be 24");
    assert.equal(161.70, result.returns, "Expect return to be 161.70");
    assert.equal(137.70, result.profit, "Expect profit to be 137.70");

    assert.end();
});

test("Each Way Fivefold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "1/1", terms: "1/5", position: 2},
        {odds: "8/1", terms: "1/6", position: 1},
        {odds: "2/5", terms: "1/5", position: 2},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "fivefold", stake: 4, eachWay: true}, runners);

    assert.equal(8, result.totalStake, "Expect total stake to be 8");
    assert.equal(36.29, result.returns, "Expect return to be 36.29");
    assert.equal(28.29, result.profit, "Expect profit to be 28.29");

    assert.end();
});

test("Each Way Sixfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 2},
        {odds: "5/1", terms: "1/4", position: 2},
        {odds: "6/1", terms: "1/6", position: 1},
        {odds: "7/1", terms: "1/4", position: 2},
        {odds: "8/1", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "sixfold", stake: 2, eachWay: true}, runners);

    assert.equal(4, result.totalStake, "Expect total stake to be 4");
    assert.equal(202.7, result.returns, "Expect return to be 202.7");
    assert.equal(198.7, result.profit, "Expect profit to be 198.7");

    assert.end();
});

test("Each Way Sevenfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 2},
        {odds: "3/1", terms: "1/5", position: 2},
        {odds: "5/1", terms: "1/6", position: 2},
        {odds: "7/1", terms: "1/5", position: 2},
        {odds: "9/1", terms: "1/6", position: 2},
        {odds: "11/1", terms: "1/4", position: 2},
        {odds: "15/1", terms: "1/4", position: 2}
    ];

    const result = betcruncher({type: "sevenfold", stake: 5.5, eachWay: true}, runners);

    assert.equal(11, result.totalStake, "Expect total stake to be 11");
    assert.equal(2155.31, result.returns, "Expect return to be 2155.31");
    assert.equal(2144.31, result.profit, "Expect profit to be 2144.31");

    assert.end();
});

test("Each Way Eightfold", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "6/1", terms: "1/6", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "7/2", terms: "1/5", position: 1},
        {odds: "5/2", terms: "1/6", position: 1},
        {odds: "3/2", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: true}, runners);

    assert.equal(200, result.totalStake, "Expect total stake to be 200");
    assert.equal(6207642.34, result.returns, "Expect return to be 6207642.34");
    assert.equal(6207442.34, result.profit, "Expect profit to be 6207442.34");

    assert.end();
});


// Each way losing bets

test("Each Way Single Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "9/2", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "single", stake: 15, eachWay: true}, runners);

    assert.equal(30, result.totalStake, "Expect total stake to be 30");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-30, result.profit, "Expect profit to be -30");

    assert.end();
});

test("Each Way Double Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "double", stake: 8, eachWay: true}, runners);

    assert.equal(16, result.totalStake, "Expect total stake to be 16");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-16, result.profit, "Expect profit to be -16");

    assert.end();
});

test("Each Way Treble Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 0},
        {odds: "7/2", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "treble", stake: 13, eachWay: true}, runners);

    assert.equal(26, result.totalStake, "Expect total stake to be 26");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-26, result.profit, "Expect profit to be -26");

    assert.end();
});

test("Each Way Fourfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 0},
        {odds: "5/1", terms: "1/5", position: 0},
        {odds: "100/30", terms: "1/4", position: 0},
        {odds: "1/4", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "fourfold", stake: 12, eachWay: true}, runners);

    assert.equal(24, result.totalStake, "Expect total stake to be 24");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-24, result.profit, "Expect profit to be -24");

    assert.end();
});

test("Each Way Fivefold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "1/1", terms: "1/5", position: 0},
        {odds: "8/1", terms: "1/6", position: 0},
        {odds: "2/5", terms: "1/5", position: 0},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "fivefold", stake: 4, eachWay: true}, runners);

    assert.equal(8, result.totalStake, "Expect total stake to be 8");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-8, result.profit, "Expect profit to be -8");

    assert.end();
});

test("Each Way Sixfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 0},
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/6", position: 1},
        {odds: "7/1", terms: "1/4", position: 2},
        {odds: "8/1", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "sixfold", stake: 2, eachWay: true}, runners);

    assert.equal(4, result.totalStake, "Expect total stake to be 4");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-4, result.profit, "Expect profit to be -4");

    assert.end();
});

test("Each Way Sevenfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 0},
        {odds: "3/1", terms: "1/5", position: 2},
        {odds: "5/1", terms: "1/6", position: 0},
        {odds: "7/1", terms: "1/5", position: 2},
        {odds: "9/1", terms: "1/6", position: 0},
        {odds: "11/1", terms: "1/4", position: 2},
        {odds: "15/1", terms: "1/4", position: 2}
    ];

    const result = betcruncher({type: "sevenfold", stake: 5.5, eachWay: true}, runners);

    assert.equal(11, result.totalStake, "Expect total stake to be 11");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-11, result.profit, "Expect profit to be -11");

    assert.end();
});

test("Each Way Eightfold Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 0},
        {odds: "6/1", terms: "1/6", position: 0},
        {odds: "8/1", terms: "1/4", position: 0},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "5/2", terms: "1/6", position: 0},
        {odds: "3/2", terms: "1/4", position: 0},
        {odds: "2/3", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: true}, runners);

    assert.equal(200, result.totalStake, "Expect total stake to be 200");
    assert.equal(0, result.returns, "Expect return to be 0");
    assert.equal(-200, result.profit, "Expect profit to be -200");

    assert.end();
});


// Each way void bets

test("Each Way Single Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "9/2", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "single", stake: 15, eachWay: true}, runners);

    assert.equal(30, result.totalStake, "Expect total stake to be 30");
    assert.equal(30, result.returns, "Expect return to be 30");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Double Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "double", stake: 8, eachWay: true}, runners);

    assert.equal(16, result.totalStake, "Expect total stake to be 16");
    assert.equal(16, result.returns, "Expect return to be 16");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Treble Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: -1},
        {odds: "7/2", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "treble", stake: 13, eachWay: true}, runners);

    assert.equal(26, result.totalStake, "Expect total stake to be 26");
    assert.equal(26, result.returns, "Expect return to be 26");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Fourfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/5", position: -1},
        {odds: "100/30", terms: "1/4", position: -1},
        {odds: "1/4", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "fourfold", stake: 12, eachWay: true}, runners);

    assert.equal(24, result.totalStake, "Expect total stake to be 24");
    assert.equal(24, result.returns, "Expect return to be 24");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Fivefold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "1/1", terms: "1/5", position: -1},
        {odds: "8/1", terms: "1/6", position: -1},
        {odds: "2/5", terms: "1/5", position: -1},
        {odds: "4/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "fivefold", stake: 4, eachWay: true}, runners);

    assert.equal(8, result.totalStake, "Expect total stake to be 8");
    assert.equal(8, result.returns, "Expect return to be 8");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Sixfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "6/1", terms: "1/6", position: -1},
        {odds: "7/1", terms: "1/4", position: -1},
        {odds: "8/1", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "sixfold", stake: 2, eachWay: true}, runners);

    assert.equal(4, result.totalStake, "Expect total stake to be 4");
    assert.equal(4, result.returns, "Expect return to be 4");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Sevenfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/5", position: -1},
        {odds: "5/1", terms: "1/6", position: -1},
        {odds: "7/1", terms: "1/5", position: -1},
        {odds: "9/1", terms: "1/6", position: -1},
        {odds: "11/1", terms: "1/4", position: -1},
        {odds: "15/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 5.5, eachWay: true}, runners);

    assert.equal(11, result.totalStake, "Expect total stake to be 11");
    assert.equal(11, result.returns, "Expect return to be 11");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Eightfold Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: -1},
        {odds: "6/1", terms: "1/6", position: -1},
        {odds: "8/1", terms: "1/4", position: -1},
        {odds: "7/2", terms: "1/5", position: -1},
        {odds: "5/2", terms: "1/6", position: -1},
        {odds: "3/2", terms: "1/4", position: -1},
        {odds: "2/3", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: true}, runners);

    assert.equal(200, result.totalStake, "Expect total stake to be 200");
    assert.equal(200, result.returns, "Expect return to be 200");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});


// Each way part-void bets

test("Each Way Double Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "double", stake: 8, eachWay: true}, runners);

    assert.equal(16, result.totalStake, "Expect total stake to be 16");
    assert.equal(54.4, result.returns, "Expect return to be 54.4");
    assert.equal(38.4, result.profit, "Expect profit to be 38.4");

    assert.end();
});

test("Each Way Treble Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "7/2", terms: "1/4", position: 2}
    ];

    const result = betcruncher({type: "treble", stake: 13, eachWay: true}, runners);

    assert.equal(26, result.totalStake, "Expect total stake to be 26");
    assert.equal(43.88, result.returns, "Expect return to be 43.88");
    assert.equal(17.88, result.profit, "Expect profit to be 17.88");

    assert.end();
});

test("Each Way Fourfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 2},
        {odds: "5/1", terms: "1/5", position: -1},
        {odds: "100/30", terms: "1/4", position: 1},
        {odds: "1/4", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "fourfold", stake: 12, eachWay: true}, runners);

    assert.equal(24, result.totalStake, "Expect total stake to be 24");
    assert.equal(77, result.returns, "Expect return to be 77");
    assert.equal(53, result.profit, "Expect profit to be 53");

    assert.end();
});

test("Each Way Fivefold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "1/1", terms: "1/5", position: 2},
        {odds: "8/1", terms: "1/6", position: -1},
        {odds: "2/5", terms: "1/5", position: 2},
        {odds: "4/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "fivefold", stake: 4, eachWay: true}, runners);

    assert.equal(8, result.totalStake, "Expect total stake to be 8");
    assert.equal(7.78, result.returns, "Expect return to be 7.78");
    assert.equal(-0.22, result.profit, "Expect profit to be -0.22");

    assert.end();
});

test("Each Way Sixfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 2},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "6/1", terms: "1/6", position: -1},
        {odds: "7/1", terms: "1/4", position: 2},
        {odds: "8/1", terms: "1/5", position: -1}
    ];

    const result = betcruncher({type: "sixfold", stake: 2, eachWay: true}, runners);

    assert.equal(4, result.totalStake, "Expect total stake to be 4");
    assert.equal(17.32, result.returns, "Expect return to be 17.32");
    assert.equal(13.32, result.profit, "Expect profit to be 13.32");

    assert.end();
});

test("Each Way Sevenfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "1/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/5", position: -1},
        {odds: "5/1", terms: "1/6", position: 2},
        {odds: "7/1", terms: "1/5", position: -1},
        {odds: "9/1", terms: "1/6", position: 2},
        {odds: "11/1", terms: "1/4", position: -1},
        {odds: "15/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "sevenfold", stake: 5.5, eachWay: true}, runners);

    assert.equal(11, result.totalStake, "Expect total stake to be 11");
    assert.equal(149.67, result.returns, "Expect return to be 149.67");
    assert.equal(138.67, result.profit, "Expect profit to be 138.67");

    assert.end();
});

test("Each Way Eightfold Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/5", position: 2},
        {odds: "6/1", terms: "1/6", position: -1},
        {odds: "8/1", terms: "1/4", position: -1},
        {odds: "7/2", terms: "1/5", position: 2},
        {odds: "5/2", terms: "1/6", position: -1},
        {odds: "3/2", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "eightfold", stake: 100, eachWay: true}, runners);

    assert.equal(200, result.totalStake, "Expect total stake to be 200");
    assert.equal(715.28, result.returns, "Expect return to be 715.28");
    assert.equal(515.28, result.profit, "Expect profit to be 515.28");

    assert.end();
});

test("Trixie", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: false}, runners);

    assert.equal(40, result.totalStake, "Expect total stake to be 40");
    assert.equal(3240, result.returns, "Expect return to be 3240");
    assert.equal(3200, result.profit, "Expect profit to be 3200");

    assert.end();
});

// And now we have to do all the same again, for the bet types below.

// Trixie
// Yankee
// Super Yankee
// Heinz
// Super Heinz
// Goliath

// Patent
// Lucky 15
// Lucky 31
// Lucky 63
// Lucky 127
// Lucky 255
