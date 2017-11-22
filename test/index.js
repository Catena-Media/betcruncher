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


// Trixie

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

test("Trixie Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: false}, runners);

    assert.equal(40, result.totalStake, "Expect total stake to be 40");
    assert.equal(350, result.returns, "Expect return to be 350");
    assert.equal(310, result.profit, "Expect profit to be 310");

    assert.end();
});

test("Trixie Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: false}, runners);

    assert.equal(40, result.totalStake, "Expect total stake to be 40");
    assert.equal(40, result.returns, "Expect return to be 40");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Trixie Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: false}, runners);

    assert.equal(40, result.totalStake, "Expect total stake to be 40");
    assert.equal(310, result.returns, "Expect return to be 3240");
    assert.equal(270, result.profit, "Expect profit to be 3200");

    assert.end();
});


test("Each Way Trixie", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "200/1", terms: "1/5", position: 1},
        {odds: "2/3", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: true}, runners);

    assert.equal(80, result.totalStake, "Expect total stake to be 80");
    assert.equal(66017.22, result.returns, "Expect return to be 66017.22");
    assert.equal(65937.22, result.profit, "Expect profit to be 64937.22");

    assert.end();
});

test("Each Way Trixie Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "7/2", terms: "1/5", position: 1},
        {odds: "1/2", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: true}, runners);

    assert.equal(80, result.totalStake, "Expect total stake to be 80");
    assert.equal(86.20, result.returns, "Expect return to be 86.20");
    assert.equal(6.20, result.profit, "Expect profit to be 6.20");

    assert.end();
});

test("Each Way Trixie Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: true}, runners);

    assert.equal(80, result.totalStake, "Expect total stake to be 80");
    assert.equal(80, result.returns, "Expect return to be 80");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Trixie Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "trixie", stake: 10, eachWay: true}, runners);

    assert.equal(80, result.totalStake, "Expect total stake to be 80");
    assert.equal(65, result.returns, "Expect return to be 65");
    assert.equal(-15, result.profit, "Expect profit to be -15");

    assert.end();
});

// Yankee
test("Yankee", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "yankee", stake: 12, eachWay: false}, runners);

    assert.equal(132, result.totalStake, "Expect total stake to be 132");
    assert.equal(5568.00, result.returns, "Expect return to be 5568.00");
    assert.equal(5436.00, result.profit, "Expect profit to be 5436.00");
    assert.end();
});

test("Yankee Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "yankee", stake: 5, eachWay: false}, runners);

    assert.equal(55, result.totalStake, "Expect total stake to be 55");
    assert.equal(245.00, result.returns, "Expect return to be 245");
    assert.equal(190, result.profit, "Expect profit to be 190");

    assert.end();
});

test("Yankeee Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "yankee", stake: 10, eachWay: false}, runners);

    assert.equal(110, result.totalStake, "Expect total stake to be 110");
    assert.equal(110, result.returns, "Expect return to be 110");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Yankee Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "yankee", stake: 12, eachWay: false}, runners);

    assert.equal(132, result.totalStake, "Expect total stake to be 132");
    assert.equal(840, result.returns, "Expect return to be 840");
    assert.equal(708, result.profit, "Expect profit to be 708");

    assert.end();
});


test("Each Way Yankee", assert => {

    assert.plan(3);

    const runners = [
        {odds: "75/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/5", position: 1},
        {odds: "10/3", terms: "1/5", position: 1},
        {odds: "20/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "yankee", stake: 2, eachWay: true}, runners);

    assert.equal(44, result.totalStake, "Expect total stake to be 80");
    assert.equal(73426.90, result.returns, "Expect return to be 73426.90");
    assert.equal(73382.90, result.profit, "Expect profit to be 73382.90");

    assert.end();
});

test("Each Way Yankee Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "1/2", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "yankee", stake: 7, eachWay: true}, runners);

    assert.equal(154, result.totalStake, "Expect total stake to be 154.00");
    assert.equal(66.15, result.returns, "Expect return to be 66.15");
    assert.equal(-87.85, result.profit, "Expect profit to be -87.85");

    assert.end();
});

test("Each Way Yankee Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "yankee", stake: 1, eachWay: true}, runners);

    assert.equal(22, result.totalStake, "Expect total stake to be 22");
    assert.equal(22, result.returns, "Expect return to be 22");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Yankee Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "yankee", stake: 13.50, eachWay: true}, runners);

    assert.equal(297.00, result.totalStake, "Expect total stake to be 297");
    assert.equal(531.56, result.returns, "Expect return to be 531.56");
    assert.equal(234.56, result.profit, "Expect profit to be 234.56");

    assert.end();
});

// Super Yankee

test("Super Yankee", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "10/7", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "superyankee", stake: 2.60, eachWay: false}, runners);

    assert.equal(67.60, result.totalStake, "Expect total stake to be 67.60");
    assert.equal(6365.17, result.returns, "Expect return to be 6365.17");
    assert.equal(6297.57, result.profit, "Expect profit to be 6297.57");
    assert.end();
});

test("Super Yankee Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/3", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "9/2", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "superyankee", stake: 6.66, eachWay: false}, runners);

    assert.equal(173.16, result.totalStake, "Expect total stake to be 173.16");
    assert.equal(1608.39, result.returns, "Expect return to be 1608.39");
    assert.equal(1435.23, result.profit, "Expect profit to be 1435.23");

    assert.end();
});

test("Super Yankee Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "superyankee", stake: 2.33, eachWay: false}, runners);

    assert.equal(60.58, result.totalStake, "Expect total stake to be 60.58");
    assert.equal(60.58, result.returns, "Expect return to be 60.58");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Super Yankee Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "superyankee", stake: 2.33, eachWay: false}, runners);

    assert.equal(60.58, result.totalStake, "Expect total stake to be 60.58");
    assert.equal(715.31, result.returns, "Expect return to be 715.31");
    assert.equal(654.73, result.profit, "Expect profit to be 654.73");

    assert.end();
});


test("Each Way Super Yankee", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "2/1", terms: "1/5", position: 1},
        {odds: "14/3", terms: "1/4", position: 1},
        {odds: "10/3", terms: "1/5", position: 1},
        {odds: "21/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "superyankee", stake: 21, eachWay: true}, runners);

    assert.equal(1092.00, result.totalStake, "Expect total stake to be 1092");
    assert.equal(417280.73, result.returns, "Expect return to be 417280.73");
    assert.equal(416188.73, result.profit, "Expect profit to be 416188.73");

    assert.end();
});

test("Each Way Super Yankee Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "1/2", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "superyankee", stake: 1, eachWay: true}, runners);

    assert.equal(52, result.totalStake, "Expect total stake to be 52");
    assert.equal(9.45, result.returns, "Expect return to be 9.45");
    assert.equal(-42.55, result.profit, "Expect profit to be -42.55");

    assert.end();
});

test("Each Way Super Yankee Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "superyankee", stake: 2, eachWay: true}, runners);

    assert.equal(104, result.totalStake, "Expect total stake to be 22");
    assert.equal(104, result.returns, "Expect return to be 22");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Super Yankee Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "superyankee", stake: 4, eachWay: true}, runners);

    assert.equal(208.00, result.totalStake, "Expect total stake to be 208.00");
    assert.equal(395.25, result.returns, "Expect return to be 395.25");
    assert.equal(187.25, result.profit, "Expect profit to be 187.25");

    assert.end();
});

// Heinz
test("Heinz", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "heinz", stake: 1, eachWay: false}, runners);

    assert.equal(57, result.totalStake, "Expect total stake to be 57");
    assert.equal(117612.00, result.returns, "Expect return to be 117612.00");
    assert.equal(117555.00, result.profit, "Expect profit to be 117555.00");
    assert.end();
});

test("Heinz Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "heinz", stake: 2.20, eachWay: false}, runners);

    assert.equal(125.40, result.totalStake, "Expect total stake to be 125.40");
    assert.equal(697.40, result.returns, "Expect return to be 697.40");
    assert.equal(572, result.profit, "Expect profit to be 572");

    assert.end();
});

test("Heinz Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "heinz", stake: 30, eachWay: false}, runners);

    assert.equal(1710.00, result.totalStake, "Expect total stake to be 1710.00");
    assert.equal(1710.00, result.returns, "Expect return to be 1710.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Heinz Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "heinz", stake: 6.11, eachWay: false}, runners);

    assert.equal(348.27, result.totalStake, "Expect total stake to be 348.27");
    assert.equal(24.44, result.returns, "Expect return to be 24.44");
    assert.equal(-323.83, result.profit, "Expect profit to be -323.83");

    assert.end();
});


test("Each Way Heinz", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/3", terms: "1/6", position: 1},
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "1/3", terms: "1/4", position: 1},
        {odds: "12/3", terms: "1/5", position: 1},
        {odds: "12/3", terms: "1/6", position: 1},
        {odds: "2/1", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "heinz", stake: 12, eachWay: true}, runners);

    assert.equal(1368.00, result.totalStake, "Expect total stake to be 1368.00");
    assert.equal(82904.75, result.returns, "Expect return to be 82904.75");
    assert.equal(81536.75, result.profit, "Expect profit to be 81536.75");

    assert.end();
});

test("Each Way Heinz Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "16/1", terms: "1/5", position: 0},
        {odds: "14/1", terms: "1/5", position: 1},
        {odds: "12/2", terms: "1/5", position: 0},
        {odds: "8/2", terms: "1/5", position: 0},
        {odds: "4/2", terms: "1/5", position: 1},
        {odds: "3/2", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "heinz", stake: 6.11, eachWay: true}, runners);

    assert.equal(696.54, result.totalStake, "Expect total stake to be 696.52");
    assert.equal(307.46, result.returns, "Expect return to be 307.46");
    assert.equal(-389.08, result.profit, "Expect profit to be -389.08");

    assert.end();
});

test("Each Way Heinz Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "heinz", stake: 13, eachWay: true}, runners);

    assert.equal(1482.00, result.totalStake, "Expect total stake to be 1482.00");
    assert.equal(1482.00, result.returns, "Expect return to be 1482.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Heinz Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "7/2", terms: "1/4", position: -1},
        {odds: "20/1", terms: "1/6", position: 2},
        {odds: "4000/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/6", position: 2},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "9/5", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "heinz", stake: 5, eachWay: true}, runners);

    assert.equal(570.00, result.totalStake, "Expect total stake to be 570.00");
    assert.equal(329480.74, result.returns, "Expect return to be 329480.74");
    assert.equal(328910.74, result.profit, "Expect profit to be 328910.74");

    assert.end();
});

// Super Heinz
test("Super Heinz", assert => {

    assert.plan(3);

    const runners = [
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "5/2", terms: "1/4", position: 1},
        {odds: "5/3", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "superheinz", stake: 5, eachWay: false}, runners);

    assert.equal(600, result.totalStake, "Expect total stake to be 600");
    assert.equal(554239.17, result.returns, "Expect return to be 554239.17");
    assert.equal(553639.17, result.profit, "Expect profit to be 553639.17");
    assert.end();
});

test("Super Heinz Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/1", terms: "1/4", position: 1},
        {odds: "14/2", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "8/3", terms: "1/4", position: 0},
        {odds: "26/3", terms: "1/4", position: 0},
        {odds: "6/4", terms: "1/4", position: 0},
        {odds: "7/1", terms: "1/4", position: 0}

    ];

    const result = betcruncher({type: "superheinz", stake: 2.40, eachWay: false}, runners);

    assert.equal(288.00, result.totalStake, "Expect total stake to be 288.00");
    assert.equal(2049.60, result.returns, "Expect return to be 2049.60");
    assert.equal(1761.60, result.profit, "Expect profit to be 1761.60");

    assert.end();
});

test("Super Heinz Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "superheinz", stake: 4, eachWay: false}, runners);

    assert.equal(480, result.totalStake, "Expect total stake to be 480");
    assert.equal(480, result.returns, "Expect return to be 480");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Super Heinz Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "12/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "superheinz", stake: 3.50, eachWay: false}, runners);

    assert.equal(420.00, result.totalStake, "Expect total stake to be 348.27");
    assert.equal(1498.00, result.returns, "Expect return to be 1498.00");
    assert.equal(1078.00, result.profit, "Expect profit to be 1078.00");

    assert.end();
});


test("Each Way Super Heinz", assert => {

    assert.plan(3);

    const runners = [
        {odds: "30/1", terms: "1/6", position: 1},
        {odds: "14/2", terms: "1/6", position: 1},
        {odds: "9/3", terms: "1/6", position: 1},
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "4/3", terms: "1/6", position: 1},
        {odds: "2/1", terms: "1/6", position: 1},
        {odds: "12/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "superheinz", stake: 3.50, eachWay: true}, runners);

    assert.equal(840.00, result.totalStake, "Expect total stake to be 840.00");
    assert.equal(5655229.29, result.returns, "Expect return to be 82904.75");
    assert.equal(5654389.29, result.profit, "Expect profit to be 81536.75");

    assert.end();
});

test("Each Way Super Heinz Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "8/3", terms: "1/5", position: 0},
        {odds: "8/3", terms: "1/5", position: 1},
        {odds: "8/4", terms: "1/5", position: 0},
        {odds: "8/2", terms: "1/5", position: 0},
        {odds: "8/1", terms: "1/5", position: 1},
        {odds: "8/7", terms: "1/5", position: 0},
        {odds: "8/9", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "superheinz", stake: 12, eachWay: true}, runners);

    assert.equal(2880.00, result.totalStake, "Expect total stake to be 2880.00");
    assert.equal(443.84, result.returns, "Expect return to be 443.84");
    assert.equal(-2436.16, result.profit, "Expect profit to be -2436.16");

    assert.end();
});

test("Each Way Super Heinz Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "superheinz", stake: 12, eachWay: true}, runners);

    assert.equal(2880.00, result.totalStake, "Expect total stake to be 2880.00");
    assert.equal(2880.00, result.returns, "Expect return to be 2880.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Super Heinz Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "20/1", terms: "1/6", position: 2},
        {odds: "22/1", terms: "1/6", position: 2},
        {odds: "13/3", terms: "1/6", position: 2},
        {odds: "14/2", terms: "1/4", position: -1},
        {odds: "9/5", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "superheinz", stake: 19, eachWay: true}, runners);

    assert.equal(4560.00, result.totalStake, "Expect total stake to be 4560.00");
    assert.equal(33777.03, result.returns, "Expect return to be 33777.03");
    assert.equal(29217.03, result.profit, "Expect profit to be 29217.03");

    assert.end();
});




// Goliath

test("Goliath", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: 1},
        {odds: "5/3", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "13/7", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1},
        {odds: "11/2", terms: "1/4", position: 1},
        {odds: "5/4", terms: "1/4", position: 1},
        {odds: "14/5", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "goliath", stake: 1.42, eachWay: false}, runners);

    assert.equal(350.74, result.totalStake, "Expect total stake to be 350.74");
    assert.equal(125277.64, result.returns, "Expect return to be 125277.64");
    assert.equal(124926.90, result.profit, "Expect profit to be 124926.90");
    assert.end();
});

test("Goliath Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: 1},
        {odds: "5/3", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "13/7", terms: "1/4", position: 0},
        {odds: "2/3", terms: "1/4", position: 1},
        {odds: "11/2", terms: "1/4", position: 0},
        {odds: "5/4", terms: "1/4", position: 1},
        {odds: "14/5", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "goliath", stake: 4.32, eachWay: false}, runners);

    assert.equal(1067.04, result.totalStake, "Expect total stake to be 1067.04");
    assert.equal(697.32, result.returns, "Expect return to be 697.32");
    assert.equal(-369.72, result.profit, "Expect profit to be -369.72");

    assert.end();
});

test("Goliath Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1}

    ];

    const result = betcruncher({type: "goliath", stake: 7, eachWay: false}, runners);

    assert.equal(1729.00, result.totalStake, "Expect total stake to be 1729.00");
    assert.equal(1729.00, result.returns, "Expect return to be 1729.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Goliath Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: -1},
        {odds: "5/3", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "13/7", terms: "1/4", position: 0},
        {odds: "2/3", terms: "1/4", position: 1},
        {odds: "11/2", terms: "1/4", position: 0},
        {odds: "5/4", terms: "1/4", position: 1},
        {odds: "14/5", terms: "1/4", position: 0}
    ];


    const result = betcruncher({type: "goliath", stake: 9.20, eachWay: false}, runners);

    assert.equal(2272.40, result.totalStake, "Expect total stake to be 2272.40");
    assert.equal(555.83, result.returns, "Expect return to be 555.83");
    assert.equal(-1716.57, result.profit, "Expect profit to be -1716.57");

    assert.end();
});


test("Each Way Goliath", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: 1},
        {odds: "5/3", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "13/7", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1},
        {odds: "11/2", terms: "1/4", position: 1},
        {odds: "5/4", terms: "1/4", position: 1},
        {odds: "14/5", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "goliath", stake: 10.00, eachWay: true}, runners);

    assert.equal(4940.00, result.totalStake, "Expect total stake to be 4940.00");
    assert.equal(900793.58, result.returns, "Expect return to be 900793.58");
    assert.equal(895853.58, result.profit, "Expect profit to be 895853.58");

    assert.end();
});

test("Each Way Goliath Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: 0},
        {odds: "5/3", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "13/7", terms: "1/4", position: 1},
        {odds: "2/3", terms: "1/4", position: 1},
        {odds: "11/2", terms: "1/4", position: 1},
        {odds: "5/4", terms: "1/4", position: 1},
        {odds: "14/5", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "goliath", stake: 15, eachWay: true}, runners);

    assert.equal(7410.00, result.totalStake, "Expect total stake to be 7410.00");
    assert.equal(75951.07, result.returns, "Expect return to be75951.07");
    assert.equal(68541.07, result.profit, "Expect profit to be 68541.07");

    assert.end();
});

test("Each Way Goliath Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "12/4", terms: "1/4", position: -1},
        {odds: "5/3", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1},
        {odds: "13/7", terms: "1/4", position: -1},
        {odds: "2/3", terms: "1/4", position: -1},
        {odds: "11/2", terms: "1/4", position: -1},
        {odds: "5/4", terms: "1/4", position: -1},
        {odds: "14/5", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "goliath", stake: 42, eachWay: true}, runners);

    assert.equal(20748.00, result.totalStake, "Expect total stake to be 20748.00");
    assert.equal(20748.00, result.returns, "Expect return to be 20748.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Goliath Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "20/1", terms: "1/6", position: 2},
        {odds: "22/1", terms: "1/6", position: 2},
        {odds: "13/3", terms: "1/6", position: 2},
        {odds: "14/2", terms: "1/4", position: -1},
        {odds: "9/5", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "9/5", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "goliath", stake: 1, eachWay: true}, runners);

    assert.equal(494.00, result.totalStake, "Expect total stake to be 494.00");
    assert.equal(3578.87, result.returns, "Expect return to be 3578.87");
    assert.equal(3084.87, result.profit, "Expect profit to be 3084.87");

    assert.end();
});


// Patent

test("Patent", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "21/2", terms: "1/4", position: 1},
        {odds: "3/2", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "patent", stake: 1, eachWay: false}, runners);

    assert.equal(7, result.totalStake, "Expect total stake to be 7.00");
    assert.equal(524, result.returns, "Expect return to be 524.00");
    assert.equal(517, result.profit, "Expect profit to be 517.00");

    assert.end();
});

test("Patent Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "patent", stake: 10, eachWay: false}, runners);

    assert.equal(70, result.totalStake, "Expect total stake to be 70.00");
    assert.equal(470, result.returns, "Expect return to be 470.00");
    assert.equal(400, result.profit, "Expect profit to be 400.00");

    assert.end();
});

test("Patent Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "patent", stake: 10, eachWay: false}, runners);

    assert.equal(70, result.totalStake, "Expect total stake to be 70");
    assert.equal(70, result.returns, "Expect return to be 70");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Patent Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "patent", stake: 12, eachWay: false}, runners);

    assert.equal(84, result.totalStake, "Expect total stake to be 40");
    assert.equal(468, result.returns, "Expect return to be 468.00");
    assert.equal(384, result.profit, "Expect profit to be 384.00");

    assert.end();
});


test("Each Way Patent", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/1", terms: "1/4", position: 1},
        {odds: "200/1", terms: "1/5", position: 1},
        {odds: "2/3", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "patent", stake: 3.33, eachWay: true}, runners);

    assert.equal(46.62, result.totalStake, "Expect total stake to be 46.62");
    assert.equal(22847.13, result.returns, "Expect return to be 22847.13");
    assert.equal(22800.51, result.profit, "Expect profit to be 22800.51");

    assert.end();
});

test("Each Way Patent Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "7/3", terms: "1/5", position: 1},
        {odds: "1/3", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "patent", stake: 4.77, eachWay: true}, runners);

    assert.equal(66.78, result.totalStake, "Expect total stake to be 66.78");
    assert.equal(63.01, result.returns, "Expect return to be 63.01");
    assert.equal(-3.77, result.profit, "Expect profit to be -3.77");

    assert.end();
});

test("Each Way Patent Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "patent", stake: 5.5, eachWay: true}, runners);

    assert.equal(77, result.totalStake, "Expect total stake to be 77.00");
    assert.equal(77, result.returns, "Expect return to be 77.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Patent Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "patent", stake: 10, eachWay: true}, runners);

    assert.equal(140, result.totalStake, "Expect total stake to be 140.00");
    assert.equal(120, result.returns, "Expect return to be 120.00");
    assert.equal(-20, result.profit, "Expect profit to be -20.00");

    assert.end();
});

// Lucky 15

test("Lucky 15", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "lucky15", stake: 12, eachWay: false}, runners);

    assert.equal(180, result.totalStake, "Expect total stake to be 180.00");
    assert.equal(5748.00, result.returns, "Expect return to be 5568.00");
    assert.equal(5568.00, result.profit, "Expect profit to be 5436.00");
    assert.end();
});

test("Lucky 15 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "lucky15", stake: 5, eachWay: false}, runners);

    assert.equal(75, result.totalStake, "Expect total stake to be 75.00");
    assert.equal(315, result.returns, "Expect return to be 315.00");
    assert.equal(240, result.profit, "Expect profit to be 240.00");

    assert.end();
});

test("Lucky 15 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky15", stake: 10, eachWay: false}, runners);

    assert.equal(150, result.totalStake, "Expect total stake to be 150.00");
    assert.equal(150, result.returns, "Expect return to be 150.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Lucky 15 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "lucky15", stake: 12, eachWay: false}, runners);

    assert.equal(180, result.totalStake, "Expect total stake to be 180.00");
    assert.equal(948, result.returns, "Expect return to be 948.00");
    assert.equal(768, result.profit, "Expect profit to be 768.00");

    assert.end();
});


test("Each Way Lucky 15", assert => {

    assert.plan(3);

    const runners = [
        {odds: "75/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/5", position: 1},
        {odds: "10/3", terms: "1/5", position: 1},
        {odds: "20/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "lucky15", stake: 2, eachWay: true}, runners);

    assert.equal(60.00, result.totalStake, "Expect total stake to be 60.00");
    assert.equal(73689.87, result.returns, "Expect return to be 73689.87");
    assert.equal(73629.87, result.profit, "Expect profit to be 73629.87");

    assert.end();
});

test("Each Way Lucky 15 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "1/2", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "lucky15", stake: 20, eachWay: true}, runners);

    assert.equal(600.00, result.totalStake, "Expect total stake to be 600");
    assert.equal(376.67, result.returns, "Expect return to be 376.67");
    assert.equal(-223.33, result.profit, "Expect profit to be -223.33");

    assert.end();
});

test("Each Way Lucky 15 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky15", stake: 1, eachWay: true}, runners);

    assert.equal(30, result.totalStake, "Expect total stake to be 30.00");
    assert.equal(30, result.returns, "Expect return to be 30.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Lucky 15 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky15", stake: 13.50, eachWay: true}, runners);

    assert.equal(405, result.totalStake, "Expect total stake to be 405.00");
    assert.equal(710.44, result.returns, "Expect return to be 710.44");
    assert.equal(305.44, result.profit, "Expect profit to be 305.44");

    assert.end();
});


// Lucky 31

test("Lucky 31", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "10/7", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "lucky31", stake: 2.60, eachWay: false}, runners);

    assert.equal(80.60, result.totalStake, "Expect total stake to be 80.60");
    assert.equal(6415.69, result.returns, "Expect return to be 6415.69");
    assert.equal(6335.09, result.profit, "Expect profit to be 6335.09");
    assert.end();
});

test("Lucky 31 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "10/3", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "8/1", terms: "1/4", position: 1},
        {odds: "9/2", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "lucky31", stake: 6.66, eachWay: false}, runners);

    assert.equal(206.46, result.totalStake, "Expect total stake to be 206.46");
    assert.equal(1724.94, result.returns, "Expect return to be 1724.94");
    assert.equal(1518.48, result.profit, "Expect profit to be 1518.48");

    assert.end();
});

test("Lucky 31 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky31", stake: 2.33, eachWay: false}, runners);

    assert.equal(72.23, result.totalStake, "Expect total stake to be 72.23");
    assert.equal(72.23, result.returns, "Expect return to be 72.23");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Lucky 31 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1},
        {odds: "2/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "lucky31", stake: 2.33, eachWay: false}, runners);

    assert.equal(72.23, result.totalStake, "Expect total stake to be 72.23");
    assert.equal(743.27, result.returns, "Expect return to be 743.27");
    assert.equal(671.04, result.profit, "Expect profit to be 671.04");

    assert.end();
});


test("Each Way Lucky 31", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "2/1", terms: "1/5", position: 1},
        {odds: "14/3", terms: "1/4", position: 1},
        {odds: "10/3", terms: "1/5", position: 1},
        {odds: "21/1", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "lucky31", stake: 21, eachWay: true}, runners);

    assert.equal(1302.00, result.totalStake, "Expect total stake to be 1092");
    assert.equal(418360.13, result.returns, "Expect return to be 418360.13");
    assert.equal(417058.13, result.profit, "Expect profit to be 417058.13");

    assert.end();
});

test("Each Way Lucky 31 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 0},
        {odds: "4/1", terms: "1/5", position: 1},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "7/2", terms: "1/5", position: 0},
        {odds: "1/2", terms: "1/6", position: 1}
    ];

    const result = betcruncher({type: "lucky31", stake: 1, eachWay: true}, runners);

    assert.equal(62.00, result.totalStake, "Expect total stake to be 62.00");
    assert.equal(18.83, result.returns, "Expect return to be 18.83");
    assert.equal(-43.17, result.profit, "Expect profit to be -43.17");

    assert.end();
});

test("Each Way Lucky 31 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky31", stake: 2, eachWay: true}, runners);

    assert.equal(124, result.totalStake, "Expect total stake to be 124");
    assert.equal(124, result.returns, "Expect return to be 124");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Lucky 31 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/6", position: 2},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky31", stake: 4, eachWay: true}, runners);

    assert.equal(248.00, result.totalStake, "Expect total stake to be 248.00");
    assert.equal(454.25, result.returns, "Expect return to be 454.25");
    assert.equal(206.25, result.profit, "Expect profit to be 206.25");

    assert.end();
});

// Lucky 63
test("Lucky 63", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1}
    ];

    const result = betcruncher({type: "lucky63", stake: 1, eachWay: false}, runners);

    assert.equal(63.00, result.totalStake, "Expect total stake to be 63.00");
    assert.equal(117648.00, result.returns, "Expect return to be 117648.00");
    assert.equal(117585.00, result.profit, "Expect profit to be 117585.00");
    assert.end();
});

test("Lucky 63 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "6/1", terms: "1/4", position: 1},
        {odds: "5/1", terms: "1/4", position: 1},
        {odds: "4/1", terms: "1/4", position: 1},
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "6/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "lucky63", stake: 2.20, eachWay: false}, runners);

    assert.equal(138.60, result.totalStake, "Expect total stake to be 138.60");
    assert.equal(737.00, result.returns, "Expect return to be 737.00");
    assert.equal(598.40, result.profit, "Expect profit to be 572");

    assert.end();
});

test("Lucky 63 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky63", stake: 30, eachWay: false}, runners);

    assert.equal(1890.00, result.totalStake, "Expect total stake to be 1890.00");
    assert.equal(1890.00, result.returns, "Expect return to be 1890.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Lucky 63 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0},
        {odds: "2/1", terms: "1/4", position: 0}
    ];

    const result = betcruncher({type: "lucky63", stake: 6.11, eachWay: false}, runners);

    assert.equal(384.93, result.totalStake, "Expect total stake to be 384.93");
    assert.equal(42.77, result.returns, "Expect return to be 42.77");
    assert.equal(-342.16, result.profit, "Expect profit to be -342.16");

    assert.end();
});


test("Each Way Lucky 63", assert => {

    assert.plan(3);

    const runners = [
        {odds: "4/3", terms: "1/6", position: 1},
        {odds: "4/1", terms: "1/6", position: 1},
        {odds: "1/3", terms: "1/4", position: 1},
        {odds: "12/3", terms: "1/5", position: 1},
        {odds: "12/3", terms: "1/6", position: 1},
        {odds: "2/1", terms: "1/5", position: 1}
    ];

    const result = betcruncher({type: "lucky63", stake: 12, eachWay: true}, runners);

    assert.equal(1512.00, result.totalStake, "Expect total stake to be 1512.00");
    assert.equal(83270.81, result.returns, "Expect return to be 83270.81");
    assert.equal(81758.81, result.profit, "Expect profit to be 81758.81");

    assert.end();
});

test("Each Way Lucky 63 Loser", assert => {

    assert.plan(3);

    const runners = [
        {odds: "16/1", terms: "1/5", position: 0},
        {odds: "14/1", terms: "1/5", position: 1},
        {odds: "12/2", terms: "1/5", position: 0},
        {odds: "8/2", terms: "1/5", position: 0},
        {odds: "4/2", terms: "1/5", position: 1},
        {odds: "3/2", terms: "1/5", position: 0}
    ];

    const result = betcruncher({type: "lucky63", stake: 6.11, eachWay: true}, runners);

    assert.equal(769.86, result.totalStake, "Expect total stake to be 769.86");
    assert.equal(449.21, result.returns, "Expect return to be 449.21");
    assert.equal(-320.65, result.profit, "Expect profit to be -320.65");

    assert.end();
});

test("Each Way Lucky 63 Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "5/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "3/1", terms: "1/4", position: -1},
        {odds: "2/1", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky63", stake: 13, eachWay: true}, runners);

    assert.equal(1638.00, result.totalStake, "Expect total stake to be 1638.00");
    assert.equal(1638.00, result.returns, "Expect return to be 1638.00");
    assert.equal(0, result.profit, "Expect profit to be 0");

    assert.end();
});

test("Each Way Lucky 63 Part Void", assert => {

    assert.plan(3);

    const runners = [
        {odds: "7/2", terms: "1/4", position: -1},
        {odds: "20/1", terms: "1/6", position: 2},
        {odds: "4000/1", terms: "1/6", position: 2},
        {odds: "2/1", terms: "1/6", position: 2},
        {odds: "4/1", terms: "1/4", position: -1},
        {odds: "9/5", terms: "1/4", position: -1}
    ];

    const result = betcruncher({type: "lucky63", stake: 5, eachWay: true}, runners);

    assert.equal(630.00, result.totalStake, "Expect total stake to be 630.00");
    assert.equal(332877.41, result.returns, "Expect return to be 332877.41");
    assert.equal(332247.41, result.profit, "Expect profit to be 332247.41");

    assert.end();
});

// Not going to make tests for Lucky 127, 255. Can't calculate quickly, and Lucky 15, 31 and 63 imply they are working.
// Lucky 127
// Lucky 255
