/*jslint node: true, maxlen: 120 */

"use strict";

var betcruncher, converter;

converter   = require("../lib/oddsconverter");
betcruncher = require("../lib/betcruncher");

// Odds conversion tests
exports.testFractional = function (test) {

    var converted;

    test.expect(4);

    converted = converter("10/1");

    test.strictEqual(converted.originalFormat, "fractional", "Failed to detect fractional odds");
    test.strictEqual(converted.fractional, "10/1", "Failed to convert fractional to fractional");
    test.strictEqual(converted.decimal, 11.0, "Failed to convert fractional to decimal");
    test.strictEqual(converted.american, "+1000", "Failed to convert fractional to american");

    test.done();
};

exports.testBogusFractional = function (test) {

    test.expect(7);

    test.throws(function () {
        converter("a/f");
    }, Error, "Bogus fraction failed to throw: a/f");

    test.throws(function () {
        converter("a/1");
    }, Error, "Bogus fraction failed to throw: a/1");

    test.throws(function () {
        converter("10/z");
    }, Error, "Bogus fraction failed to throw: 10/z");

    test.throws(function () {
        converter("/1");
    }, Error, "Bogus fraction failed to throw: /1");

    test.throws(function () {
        converter("10/");
    }, Error, "Bogus fraction failed to throw: 10/");

    test.throws(function () {
        converter("/");
    }, Error, "Bogus fraction failed to throw: /");

    test.throws(function () {
        converter("0/0");
    }, Error, "Bogus fraction failed to throw: 0/0");

    test.done();
};

exports.testDecimal = function (test) {

    var converted;

    test.expect(4);

    converted = converter(6);

    test.strictEqual(converted.originalFormat, "decimal", "Failed to detect decimal odds");
    test.strictEqual(converted.fractional, "5/1", "Failed to convert decimal to fractional");
    test.strictEqual(converted.decimal, 6.0, "Failed to convert decimal to decimal");
    test.strictEqual(converted.american, "+500", "Failed to convert decimal to american");

    test.done();
};

exports.testSmallDecimal = function (test) {

    var converted;

    test.expect(4);

    converted = converter(1.5);

    test.strictEqual(converted.originalFormat, "decimal", "Failed to detect decimal odds");
    test.strictEqual(converted.fractional, "1/2", "Failed to convert decimal to fractional");
    test.strictEqual(converted.decimal, 1.5, "Failed to convert decimal to decimal");
    test.strictEqual(converted.american, "-200", "Failed to convert decimal to american");

    test.done();
};

exports.testStringDecimal = function (test) {

    var converted;

    test.expect(4);

    converted = converter("3.5");

    test.strictEqual(converted.originalFormat, "decimal", "Failed to detect decimal odds");
    test.strictEqual(converted.fractional, "5/2", "Failed to convert decimal to fractional");
    test.strictEqual(converted.decimal, 3.5, "Failed to convert decimal to decimal");
    test.strictEqual(converted.american, "+250", "Failed to convert decimal to american");

    test.done();
};

exports.testSmallStringDecimal = function (test) {

    var converted;

    test.expect(4);

    converted = converter("1.25");

    test.strictEqual(converted.originalFormat, "decimal", "Failed to detect decimal odds");
    test.strictEqual(converted.fractional, "1/4", "Failed to convert decimal to fractional");
    test.strictEqual(converted.decimal, 1.25, "Failed to convert decimal to decimal");
    test.strictEqual(converted.american, "-400", "Failed to convert decimal to american");

    test.done();
};

exports.testBogusDecimal = function (test) {

    test.expect(4);

    test.throws(function () {
        converter("..3");
    }, Error, "Bogus fraction failed to throw: ..3");

    test.throws(function () {
        converter("3..");
    }, Error, "Bogus fraction failed to throw: 3..");

    test.throws(function () {
        converter(1);
    }, Error, "Bogus fraction failed to throw: 1");

    test.throws(function () {
        converter(0.1);
    }, Error, "Bogus fraction failed to throw: 0.1");

    test.done();
};

exports.testAmericanPositive = function (test) {

    var converted;

    test.expect(4);

    converted = converter("+800");

    test.strictEqual(converted.originalFormat, "american", "Failed to detect american odds");
    test.strictEqual(converted.fractional, "8/1", "Failed to convert american to fractional");
    test.strictEqual(converted.decimal, 9.0, "Failed to convert american to decimal");
    test.strictEqual(converted.american, "+800", "Failed to convert american to american");

    test.done();
};

exports.testAmericanNegative = function (test) {

    var converted;

    test.expect(4);

    converted = converter("-400");

    test.strictEqual(converted.originalFormat, "american", "Failed to detect negative american odds");
    test.strictEqual(converted.fractional, "1/4", "Failed to convert negative american to fractional");
    test.strictEqual(converted.decimal, 1.25, "Failed to convert negative american to decimal");
    test.strictEqual(converted.american, "-400", "Failed to convert negative american to american");

    test.done();
};

exports.testAmericanNegativeNumber = function (test) {

    var converted;

    test.expect(4);

    converted = converter(-400);

    test.strictEqual(converted.originalFormat, "american", "Failed to detect negative american odds from number");
    test.strictEqual(converted.fractional, "1/4", "Failed to convert negative american from number to fractional");
    test.strictEqual(converted.decimal, 1.25, "Failed to convert negative american from number to decimal");
    test.strictEqual(converted.american, "-400", "Failed to convert negative american from number to american");

    test.done();
};

exports.testBogusAmerican = function (test) {

    test.expect(4);

    test.throws(function () {
        converter("+10B");
    }, Error, "Bogus fraction failed to throw: +10B");

    test.throws(function () {
        converter("-XYZ");
    }, Error, "Bogus fraction failed to throw: -XYZ");

    test.throws(function () {
        converter(-Infinity);
    }, Error, "Bogus fraction failed to throw: -Infinity");

    test.throws(function () {
        converter("+ABC");
    }, Error, "Bogus fraction failed to throw: +ABC");

    test.done();
};

// Bet calculation tests
exports.testNoStake = function (test) {

    var result;

    test.expect(3);

    result = betcruncher({ type: "single", stake: 0, eachWay: false }, []);

    test.strictEqual(0, result.totalStake, "Unexpected stake from 0 stake");
    test.strictEqual(0, result.returns, "Unexpected returns from 0 stake");
    test.strictEqual(0, result.profit, "Unexpected profit from 0 stake");

    test.done();
};

exports.testSingle = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "single", stake: 5, eachWay: false }, runners);

    test.strictEqual(5, result.totalStake, "Unexpected total stake value. Expected 5, saw " + result.totalStake);
    test.strictEqual(55, result.returns, "Unexpected return value. Expected 55, saw " + result.returns);
    test.strictEqual(50, result.profit, "Unexpected profit value. Expected 50, saw " + result.profit);

    test.done();
};

exports.testDouble = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "double", stake: 8, eachWay: false }, runners);

    test.strictEqual(8, result.totalStake, "Unexpected total stake value. Expected 8, saw " + result.totalStake);
    test.strictEqual(160, result.returns, "Unexpected return value. Expected 160, saw " + result.returns);
    test.strictEqual(152, result.profit, "Unexpected profit value. Expected 152, saw " + result.profit);

    test.done();
};

exports.testTreble = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 },
        { odds: "7/2", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "treble", stake: 13, eachWay: false }, runners);

    test.strictEqual(13, result.totalStake, "Unexpected total stake value. Expected 13, saw " + result.totalStake);
    test.strictEqual(1170, result.returns, "Unexpected return value. Expected 1170, saw " + result.returns);
    test.strictEqual(1157, result.profit, "Unexpected profit value. Expected 1157, saw " + result.profit);

    test.done();
};

exports.testFourFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "100/30", terms: "1/4", position: 1 },
        { odds: "1/4", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 12, eachWay: false }, runners);

    test.strictEqual(12, result.totalStake, "Unexpected total stake value. Expected 12, saw " + result.totalStake);
    test.strictEqual(4290, result.returns, "Unexpected return value. Expected 4290, saw " + result.returns);
    test.strictEqual(4278, result.profit, "Unexpected profit value. Expected 4278, saw " + result.profit);

    test.done();
};

exports.testFiveFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "2/5", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 4, eachWay: false }, runners);

    test.strictEqual(4, result.totalStake, "Unexpected total stake value. Expected 4, saw " + result.totalStake);
    test.strictEqual(1512, result.returns, "Unexpected return value. Expected 1512, saw " + result.returns);
    test.strictEqual(1508, result.profit, "Unexpected profit value. Expected 1508, saw " + result.profit);

    test.done();
};

exports.testSixFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "6/1", terms: "1/4", position: 1 },
        { odds: "7/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 2, eachWay: false }, runners);

    test.strictEqual(2, result.totalStake, "Unexpected total stake value. Expected 2, saw " + result.totalStake);
    test.strictEqual(120960, result.returns, "Unexpected return value. Expected 120960, saw " + result.returns);
    test.strictEqual(120958, result.profit, "Unexpected profit value. Expected 120958, saw " + result.profit);

    test.done();
};

exports.testSevenFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "7/1", terms: "1/4", position: 1 },
        { odds: "9/1", terms: "1/4", position: 1 },
        { odds: "11/1", terms: "1/4", position: 1 },
        { odds: "15/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 5.5, eachWay: false }, runners);

    test.strictEqual(5.5, result.totalStake, "Unexpected total stake value. Expected 5.5, saw " + result.totalStake);
    test.strictEqual(4055040, result.returns, "Unexpected return value. Expected 4055040, saw " + result.returns);
    test.strictEqual(4055034.5, result.profit, "Unexpected profit value. Expected 4055034.5, saw " + result.profit);

    test.done();
};

exports.testEightFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 },
        { odds: "6/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "7/2", terms: "1/4", position: 1 },
        { odds: "5/2", terms: "1/4", position: 1 },
        { odds: "3/2", terms: "1/4", position: 1 },
        { odds: "2/3", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(6201562.5, result.returns, "Unexpected return value. Expected 6201562.5, saw " + result.returns);
    test.strictEqual(6201462.5, result.profit, "Unexpected profit value. Expected 6201462.5, saw " + result.profit);

    test.done();
};

// Losing wagers

exports.testSingleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 0 }
    ];

    result = betcruncher({ type: "single", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testDoubleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 0 }
    ];

    result = betcruncher({ type: "double", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testTrebleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 0 },
        { odds: "4/1", terms: "1/4", position: 0 },
        { odds: "7/2", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "treble", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testFourFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "100/30", terms: "1/4", position: 0 },
        { odds: "1/4", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testFiveFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "1/1", terms: "1/4", position: 0 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "2/5", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testSixFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 0 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "6/1", terms: "1/4", position: 1 },
        { odds: "7/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testSevenFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 0 },
        { odds: "7/1", terms: "1/4", position: 1 },
        { odds: "9/1", terms: "1/4", position: 1 },
        { odds: "11/1", terms: "1/4", position: 0 },
        { odds: "15/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

exports.testEightFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 0 },
        { odds: "6/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "7/2", terms: "1/4", position: 0 },
        { odds: "5/2", terms: "1/4", position: 1 },
        { odds: "3/2", terms: "1/4", position: 1 },
        { odds: "2/3", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-100, result.profit, "Unexpected profit value. Expected -100, saw " + result.profit);

    test.done();
};

// Void wagers

exports.testSingleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "single", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testDoubleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "double", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testTrebleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 },
        { odds: "7/2", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "treble", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testFourFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: -1 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "100/30", terms: "1/4", position: -1 },
        { odds: "1/4", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testFiveFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: -1 },
        { odds: "1/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/4", position: -1 },
        { odds: "2/5", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testSixFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "6/1", terms: "1/4", position: -1 },
        { odds: "7/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testSevenFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: -1 },
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "7/1", terms: "1/4", position: -1 },
        { odds: "9/1", terms: "1/4", position: -1 },
        { odds: "11/1", terms: "1/4", position: -1 },
        { odds: "15/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEightFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 },
        { odds: "6/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/4", position: -1 },
        { odds: "7/2", terms: "1/4", position: -1 },
        { odds: "5/2", terms: "1/4", position: -1 },
        { odds: "3/2", terms: "1/4", position: -1 },
        { odds: "2/3", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(100, result.returns, "Unexpected return value. Expected 100, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};


// Part void wagers

exports.testDoublePartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "double", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(500, result.returns, "Unexpected return value. Expected 500, saw " + result.returns);
    test.strictEqual(400, result.profit, "Unexpected profit value. Expected 40080, saw " + result.profit);

    test.done();
};

exports.testTreblePartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 },
        { odds: "7/2", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "treble", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(450, result.returns, "Unexpected return value. Expected 450, saw " + result.returns);
    test.strictEqual(350, result.profit, "Unexpected profit value. Expected 350, saw " + result.profit);

    test.done();
};

exports.testFourFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "100/30", terms: "1/4", position: -1 },
        { odds: "1/4", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(8250, result.returns, "Unexpected return value. Expected 8250, saw " + result.returns);
    test.strictEqual(8150, result.profit, "Unexpected profit value. Expected 8150, saw " + result.profit);

    test.done();
};

exports.testFiveFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: -1 },
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "2/5", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(2520, result.returns, "Unexpected return value. Expected 2520, saw " + result.returns);
    test.strictEqual(2420, result.profit, "Unexpected profit value. Expected 2420, saw " + result.profit);

    test.done();
};

exports.testSixFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "6/1", terms: "1/4", position: 1 },
        { odds: "7/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(31500, result.returns, "Unexpected return value. Expected 31500, saw " + result.returns);
    test.strictEqual(31400, result.profit, "Unexpected profit value. Expected 31400, saw " + result.profit);

    test.done();
};

exports.testSevenFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "5/1", terms: "1/4", position: 1 },
        { odds: "7/1", terms: "1/4", position: -1 },
        { odds: "9/1", terms: "1/4", position: 1 },
        { odds: "11/1", terms: "1/4", position: 1 },
        { odds: "15/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(2304000, result.returns, "Unexpected return value. Expected 2304000, saw " + result.returns);
    test.strictEqual(2303900, result.profit, "Unexpected profit value. Expected 2303900, saw " + result.profit);

    test.done();
};

exports.testEightFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/4", position: 1 },
        { odds: "6/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "7/2", terms: "1/4", position: 1 },
        { odds: "5/2", terms: "1/4", position: -1 },
        { odds: "3/2", terms: "1/4", position: 1 },
        { odds: "2/3", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: false }, runners);

    test.strictEqual(100, result.totalStake, "Unexpected total stake value. Expected 100, saw " + result.totalStake);
    test.strictEqual(253125, result.returns, "Unexpected return value. Expected 253125, saw " + result.returns);
    test.strictEqual(253025, result.profit, "Unexpected profit value. Expected 253025, saw " + result.profit);

    test.done();
};

// Each way winning bets

exports.testEachWaySingle = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "9/2", terms: "1/5", position: 2 }
    ];

    result = betcruncher({ type: "single", stake: 15, eachWay: true }, runners);

    test.strictEqual(30, result.totalStake, "Unexpected total stake value. Expected 30, saw " + result.totalStake);
    test.strictEqual(28.5, result.returns, "Unexpected return value. Expected 28.5, saw " + result.returns);
    test.strictEqual(-1.5, result.profit, "Unexpected profit value. Expected -1.5, saw " + result.profit);

    test.done();
};

exports.testEachWayDouble = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 2 }
    ];

    result = betcruncher({ type: "double", stake: 8, eachWay: true }, runners);

    test.strictEqual(16, result.totalStake, "Unexpected total stake value. Expected 16, saw " + result.totalStake);
    test.strictEqual(25.2, result.returns, "Unexpected return value. Expected 25.2, saw " + result.returns);
    test.strictEqual(9.2, result.profit, "Unexpected profit value. Expected 9.2, saw " + result.profit);

    test.done();
};

exports.testEachWayTreble = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 2 },
        { odds: "7/2", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "treble", stake: 13, eachWay: true }, runners);

    test.strictEqual(26, result.totalStake, "Unexpected total stake value. Expected 26, saw " + result.totalStake);
    test.strictEqual(76.78, result.returns, "Unexpected return value. Expected 76.78, saw " + result.returns);
    test.strictEqual(50.78, result.profit, "Unexpected profit value. Expected 50.78, saw " + result.profit);

    test.done();
};

exports.testEachWayFourFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 1 },
        { odds: "5/1", terms: "1/5", position: 2 },
        { odds: "100/30", terms: "1/4", position: 1 },
        { odds: "1/4", terms: "1/5", position: 2 }
    ];

    result = betcruncher({ type: "fourfold", stake: 12, eachWay: true }, runners);

    test.strictEqual(24, result.totalStake, "Unexpected total stake value. Expected 24, saw " + result.totalStake);
    test.strictEqual(161.70, result.returns, "Unexpected return value. Expected 161.70, saw " + result.returns);
    test.strictEqual(137.70, result.profit, "Unexpected profit value. Expected 137.70, saw " + result.profit);

    test.done();
};

exports.testEachWayFiveFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "1/1", terms: "1/5", position: 2 },
        { odds: "8/1", terms: "1/6", position: 1 },
        { odds: "2/5", terms: "1/5", position: 2 },
        { odds: "4/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 4, eachWay: true }, runners);

    test.strictEqual(8, result.totalStake, "Unexpected total stake value. Expected 8, saw " + result.totalStake);
    test.strictEqual(36.29, result.returns, "Unexpected return value. Expected 36.29, saw " + result.returns);
    test.strictEqual(28.29, result.profit, "Unexpected profit value. Expected 28.29, saw " + result.profit);

    test.done();
};

exports.testEachWaySixFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 2 },
        { odds: "5/1", terms: "1/4", position: 2 },
        { odds: "6/1", terms: "1/6", position: 1 },
        { odds: "7/1", terms: "1/4", position: 2 },
        { odds: "8/1", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 2, eachWay: true }, runners);

    test.strictEqual(4, result.totalStake, "Unexpected total stake value. Expected 4, saw " + result.totalStake);
    test.strictEqual(202.7, result.returns, "Unexpected return value. Expected 202.7, saw " + result.returns);
    test.strictEqual(198.7, result.profit, "Unexpected profit value. Expected 198.7, saw " + result.profit);

    test.done();
};

exports.testEachWaySevenFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 2 },
        { odds: "3/1", terms: "1/5", position: 2 },
        { odds: "5/1", terms: "1/6", position: 2 },
        { odds: "7/1", terms: "1/5", position: 2 },
        { odds: "9/1", terms: "1/6", position: 2 },
        { odds: "11/1", terms: "1/4", position: 2 },
        { odds: "15/1", terms: "1/4", position: 2 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 5.5, eachWay: true }, runners);

    test.strictEqual(11, result.totalStake, "Unexpected total stake value. Expected 11, saw " + result.totalStake);
    test.strictEqual(2155.31, result.returns, "Unexpected return value. Expected 2155.31, saw " + result.returns);
    test.strictEqual(2144.31, result.profit, "Unexpected profit value. Expected 2144.31, saw " + result.profit);

    test.done();
};

exports.testEachWayEightFold = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 1 },
        { odds: "6/1", terms: "1/6", position: 1 },
        { odds: "8/1", terms: "1/4", position: 1 },
        { odds: "7/2", terms: "1/5", position: 1 },
        { odds: "5/2", terms: "1/6", position: 1 },
        { odds: "3/2", terms: "1/4", position: 1 },
        { odds: "2/3", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: true }, runners);

    test.strictEqual(200, result.totalStake, "Unexpected total stake value. Expected 200, saw " + result.totalStake);
    test.strictEqual(6207642.34, result.returns, "Unexpected return value. Expected 6207642.34, saw " + result.returns);
    test.strictEqual(6207442.34, result.profit, "Unexpected profit value. Expected 6207442.34, saw " + result.profit);

    test.done();
};


// Each way losing bets

exports.testEachWaySingleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "9/2", terms: "1/5", position: 0 }
    ];

    result = betcruncher({ type: "single", stake: 15, eachWay: true }, runners);

    test.strictEqual(30, result.totalStake, "Unexpected total stake value. Expected 30, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-30, result.profit, "Unexpected profit value. Expected -30, saw " + result.profit);

    test.done();
};

exports.testEachWayDoubleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 0 },
        { odds: "4/1", terms: "1/5", position: 0 }
    ];

    result = betcruncher({ type: "double", stake: 8, eachWay: true }, runners);

    test.strictEqual(16, result.totalStake, "Unexpected total stake value. Expected 16, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-16, result.profit, "Unexpected profit value. Expected -16, saw " + result.profit);

    test.done();
};

exports.testEachWayTrebleLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 0 },
        { odds: "4/1", terms: "1/5", position: 0 },
        { odds: "7/2", terms: "1/4", position: 0 }
    ];

    result = betcruncher({ type: "treble", stake: 13, eachWay: true }, runners);

    test.strictEqual(26, result.totalStake, "Unexpected total stake value. Expected 26, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-26, result.profit, "Unexpected profit value. Expected -26, saw " + result.profit);

    test.done();
};

exports.testEachWayFourFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 0 },
        { odds: "5/1", terms: "1/5", position: 0 },
        { odds: "100/30", terms: "1/4", position: 0 },
        { odds: "1/4", terms: "1/5", position: 0 }
    ];

    result = betcruncher({ type: "fourfold", stake: 12, eachWay: true }, runners);

    test.strictEqual(24, result.totalStake, "Unexpected total stake value. Expected 24, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-24, result.profit, "Unexpected profit value. Expected -24, saw " + result.profit);

    test.done();
};

exports.testEachWayFiveFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 0 },
        { odds: "1/1", terms: "1/5", position: 0 },
        { odds: "8/1", terms: "1/6", position: 0 },
        { odds: "2/5", terms: "1/5", position: 0 },
        { odds: "4/1", terms: "1/4", position: 0 }
    ];

    result = betcruncher({ type: "fivefold", stake: 4, eachWay: true }, runners);

    test.strictEqual(8, result.totalStake, "Unexpected total stake value. Expected 8, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-8, result.profit, "Unexpected profit value. Expected -8, saw " + result.profit);

    test.done();
};

exports.testEachWaySixFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 0 },
        { odds: "4/1", terms: "1/5", position: 0 },
        { odds: "5/1", terms: "1/4", position: 0 },
        { odds: "6/1", terms: "1/6", position: 1 },
        { odds: "7/1", terms: "1/4", position: 2 },
        { odds: "8/1", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 2, eachWay: true }, runners);

    test.strictEqual(4, result.totalStake, "Unexpected total stake value. Expected 4, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-4, result.profit, "Unexpected profit value. Expected -4, saw " + result.profit);

    test.done();
};

exports.testEachWaySevenFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 0 },
        { odds: "3/1", terms: "1/5", position: 2 },
        { odds: "5/1", terms: "1/6", position: 0 },
        { odds: "7/1", terms: "1/5", position: 2 },
        { odds: "9/1", terms: "1/6", position: 0 },
        { odds: "11/1", terms: "1/4", position: 2 },
        { odds: "15/1", terms: "1/4", position: 2 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 5.5, eachWay: true }, runners);

    test.strictEqual(11, result.totalStake, "Unexpected total stake value. Expected 11, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-11, result.profit, "Unexpected profit value. Expected -11, saw " + result.profit);

    test.done();
};

exports.testEachWayEightFoldLoser = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 0 },
        { odds: "6/1", terms: "1/6", position: 0 },
        { odds: "8/1", terms: "1/4", position: 0 },
        { odds: "7/2", terms: "1/5", position: 0 },
        { odds: "5/2", terms: "1/6", position: 0 },
        { odds: "3/2", terms: "1/4", position: 0 },
        { odds: "2/3", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: true }, runners);

    test.strictEqual(200, result.totalStake, "Unexpected total stake value. Expected 200, saw " + result.totalStake);
    test.strictEqual(0, result.returns, "Unexpected return value. Expected 0, saw " + result.returns);
    test.strictEqual(-200, result.profit, "Unexpected profit value. Expected -200, saw " + result.profit);

    test.done();
};


// Each way void bets

exports.testEachWaySingleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "9/2", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "single", stake: 15, eachWay: true }, runners);

    test.strictEqual(30, result.totalStake, "Unexpected total stake value. Expected 30, saw " + result.totalStake);
    test.strictEqual(30, result.returns, "Unexpected return value. Expected 30, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWayDoubleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "double", stake: 8, eachWay: true }, runners);

    test.strictEqual(16, result.totalStake, "Unexpected total stake value. Expected 16, saw " + result.totalStake);
    test.strictEqual(16, result.returns, "Unexpected return value. Expected 16, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWayTrebleVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: -1 },
        { odds: "7/2", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "treble", stake: 13, eachWay: true }, runners);

    test.strictEqual(26, result.totalStake, "Unexpected total stake value. Expected 26, saw " + result.totalStake);
    test.strictEqual(26, result.returns, "Unexpected return value. Expected 26, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWayFourFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: -1 },
        { odds: "5/1", terms: "1/5", position: -1 },
        { odds: "100/30", terms: "1/4", position: -1 },
        { odds: "1/4", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 12, eachWay: true }, runners);

    test.strictEqual(24, result.totalStake, "Unexpected total stake value. Expected 24, saw " + result.totalStake);
    test.strictEqual(24, result.returns, "Unexpected return value. Expected 24, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWayFiveFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: -1 },
        { odds: "1/1", terms: "1/5", position: -1 },
        { odds: "8/1", terms: "1/6", position: -1 },
        { odds: "2/5", terms: "1/5", position: -1 },
        { odds: "4/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 4, eachWay: true }, runners);

    test.strictEqual(8, result.totalStake, "Unexpected total stake value. Expected 8, saw " + result.totalStake);
    test.strictEqual(8, result.returns, "Unexpected return value. Expected 8, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWaySixFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: -1 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "6/1", terms: "1/6", position: -1 },
        { odds: "7/1", terms: "1/4", position: -1 },
        { odds: "8/1", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 2, eachWay: true }, runners);

    test.strictEqual(4, result.totalStake, "Unexpected total stake value. Expected 4, saw " + result.totalStake);
    test.strictEqual(4, result.returns, "Unexpected return value. Expected 4, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWaySevenFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: -1 },
        { odds: "3/1", terms: "1/5", position: -1 },
        { odds: "5/1", terms: "1/6", position: -1 },
        { odds: "7/1", terms: "1/5", position: -1 },
        { odds: "9/1", terms: "1/6", position: -1 },
        { odds: "11/1", terms: "1/4", position: -1 },
        { odds: "15/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 5.5, eachWay: true }, runners);

    test.strictEqual(11, result.totalStake, "Unexpected total stake value. Expected 11, saw " + result.totalStake);
    test.strictEqual(11, result.returns, "Unexpected return value. Expected 11, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};

exports.testEachWayEightFoldVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: -1 },
        { odds: "6/1", terms: "1/6", position: -1 },
        { odds: "8/1", terms: "1/4", position: -1 },
        { odds: "7/2", terms: "1/5", position: -1 },
        { odds: "5/2", terms: "1/6", position: -1 },
        { odds: "3/2", terms: "1/4", position: -1 },
        { odds: "2/3", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: true }, runners);

    test.strictEqual(200, result.totalStake, "Unexpected total stake value. Expected 200, saw " + result.totalStake);
    test.strictEqual(200, result.returns, "Unexpected return value. Expected 200, saw " + result.returns);
    test.strictEqual(0, result.profit, "Unexpected profit value. Expected 0, saw " + result.profit);

    test.done();
};


// Each way part-void bets

exports.testEachWayDoublePartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "double", stake: 8, eachWay: true }, runners);

    test.strictEqual(16, result.totalStake, "Unexpected total stake value. Expected 16, saw " + result.totalStake);
    test.strictEqual(54.4, result.returns, "Unexpected return value. Expected 54.4, saw " + result.returns);
    test.strictEqual(38.4, result.profit, "Unexpected profit value. Expected 38.4, saw " + result.profit);

    test.done();
};

exports.testEachWayTreblePartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: -1 },
        { odds: "4/1", terms: "1/5", position: 1 },
        { odds: "7/2", terms: "1/4", position: 2 }
    ];

    result = betcruncher({ type: "treble", stake: 13, eachWay: true }, runners);

    test.strictEqual(26, result.totalStake, "Unexpected total stake value. Expected 26, saw " + result.totalStake);
    test.strictEqual(43.88, result.returns, "Unexpected return value. Expected 43.88, saw " + result.returns);
    test.strictEqual(17.88, result.profit, "Unexpected profit value. Expected 17.88, saw " + result.profit);

    test.done();
};

exports.testEachWayFourFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "10/1", terms: "1/4", position: 2 },
        { odds: "5/1", terms: "1/5", position: -1 },
        { odds: "100/30", terms: "1/4", position: 1 },
        { odds: "1/4", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "fourfold", stake: 12, eachWay: true }, runners);

    test.strictEqual(24, result.totalStake, "Unexpected total stake value. Expected 24, saw " + result.totalStake);
    test.strictEqual(77, result.returns, "Unexpected return value. Expected 77, saw " + result.returns);
    test.strictEqual(53, result.profit, "Unexpected profit value. Expected 53, saw " + result.profit);

    test.done();
};

exports.testEachWayFiveFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "1/1", terms: "1/5", position: 2 },
        { odds: "8/1", terms: "1/6", position: -1 },
        { odds: "2/5", terms: "1/5", position: 2 },
        { odds: "4/1", terms: "1/4", position: -1 }
    ];

    result = betcruncher({ type: "fivefold", stake: 4, eachWay: true }, runners);

    test.strictEqual(8, result.totalStake, "Unexpected total stake value. Expected 8, saw " + result.totalStake);
    test.strictEqual(7.78, result.returns, "Unexpected return value. Expected 7.78, saw " + result.returns);
    test.strictEqual(-0.22, result.profit, "Unexpected profit value. Expected -0.22, saw " + result.profit);

    test.done();
};

exports.testEachWaySixFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "3/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 2 },
        { odds: "5/1", terms: "1/4", position: -1 },
        { odds: "6/1", terms: "1/6", position: -1 },
        { odds: "7/1", terms: "1/4", position: 2 },
        { odds: "8/1", terms: "1/5", position: -1 }
    ];

    result = betcruncher({ type: "sixfold", stake: 2, eachWay: true }, runners);

    test.strictEqual(4, result.totalStake, "Unexpected total stake value. Expected 4, saw " + result.totalStake);
    test.strictEqual(17.32, result.returns, "Unexpected return value. Expected 17.32, saw " + result.returns);
    test.strictEqual(13.32, result.profit, "Unexpected profit value. Expected 13.32, saw " + result.profit);

    test.done();
};

exports.testEachWaySevenFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "1/1", terms: "1/4", position: 1 },
        { odds: "3/1", terms: "1/5", position: -1 },
        { odds: "5/1", terms: "1/6", position: 2 },
        { odds: "7/1", terms: "1/5", position: -1 },
        { odds: "9/1", terms: "1/6", position: 2 },
        { odds: "11/1", terms: "1/4", position: -1 },
        { odds: "15/1", terms: "1/4", position: 1 }
    ];

    result = betcruncher({ type: "sevenfold", stake: 5.5, eachWay: true }, runners);

    test.strictEqual(11, result.totalStake, "Unexpected total stake value. Expected 11, saw " + result.totalStake);
    test.strictEqual(149.67, result.returns, "Unexpected return value. Expected 149.67, saw " + result.returns);
    test.strictEqual(138.67, result.profit, "Unexpected profit value. Expected 138.67, saw " + result.profit);

    test.done();
};

exports.testEachWayEightFoldPartVoid = function (test) {

    var runners, result;

    test.expect(3);

    runners = [
        { odds: "2/1", terms: "1/4", position: 1 },
        { odds: "4/1", terms: "1/5", position: 2 },
        { odds: "6/1", terms: "1/6", position: -1 },
        { odds: "8/1", terms: "1/4", position: -1 },
        { odds: "7/2", terms: "1/5", position: 2 },
        { odds: "5/2", terms: "1/6", position: -1 },
        { odds: "3/2", terms: "1/4", position: 1 },
        { odds: "2/3", terms: "1/5", position: 1 }
    ];

    result = betcruncher({ type: "eightfold", stake: 100, eachWay: true }, runners);

    test.strictEqual(200, result.totalStake, "Unexpected total stake value. Expected 200, saw " + result.totalStake);
    test.strictEqual(715.28, result.returns, "Unexpected return value. Expected 715.28, saw " + result.returns);
    test.strictEqual(515.28, result.profit, "Unexpected profit value. Expected 515.28, saw " + result.profit);

    test.done();
};

// And now we have to do all the same again, for the bet types below.
// I'm tired. It's my birthday. I'm not going to do it right now, sorry.

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
