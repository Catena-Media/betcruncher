Betcruncher
===========

Betcruncher is a bet calculator engine for JavaScript. This readme needs work!

```javascript
var betcruncher, slip, selections;

betcruncher = require("betcruncher");

slip = {
    type: "single",
    stake: 10,
    eachWay: false
};

selections = [
    { odds: "10/1", terms: "1/4", position: 1 }
];

console.log(betcruncher(slip, selections)); // { totalStake: 10, returns: 110, profit: 100 }
```

## Notes

Position can be either < 0 for void bet, 0 for lose, 1 for win, or > 1 for place.

Each way terms specifies the fraction of the odds given for each-way bets. This is usually one quarter.
