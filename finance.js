//Finance.js
//For more information, visit http://financejs.org
//Copyright 2014 - 2015 Essam Al Joubori, MIT license

// Instantiate a Finance class
var Finance = function() {};

// Present Value (PV)
Finance.prototype.PV = function (rate, cf1, numOfPeriod) {
  numOfPeriod = typeof numOfPeriod !== 'undefined' ? numOfPeriod : 1;
  var rate = rate/100, pv;
  pv = cf1 / Math.pow((1 + rate),numOfPeriod);
  return Math.round(pv * 100) / 100;
};

// Future Value (FV)
Finance.prototype.FV = function (rate, cf0, numOfPeriod) {
  var rate = rate/100, fv;
  fv = cf0 * Math.pow((1 + rate), numOfPeriod);
  return Math.round(fv * 100) / 100;
};

// Net Present Value (NPV)
Finance.prototype.NPV = function (rate) {
  var rate = rate/100, npv = arguments[1];
  for (var i = 2; i < arguments.length; i++) {
    npv +=(arguments[i] / Math.pow((1 + rate), i - 1));
  }
  return Math.round(npv * 100) / 100;
};

// seekZero seeks the zero point of the function fn(x) using the bisection method for higher precision.
// fn(x) must be continuous and have a sign change in the interval [low, high].
function seekZero(fn, low, high, precision) {
  var mid, fmid, flow = fn(low), fhigh = fn(high);
  
  // Check if there's a sign change in the interval
  if (flow * fhigh >= 0) {
    throw new Error('No sign change in the interval, cannot find zero');
  }
  
  while ((high - low) > precision) {
    mid = (low + high) / 2;
    fmid = fn(mid);
    
    if (fmid === 0) {
      // Exact zero found
      return mid;
    } else if (flow * fmid < 0) {
      // Zero is in the lower half
      high = mid;
      fhigh = fmid;
    } else {
      // Zero is in the upper half
      low = mid;
      flow = fmid;
    }
  }
  
  // Return the midpoint of the final interval as the approximation
  return (low + high) / 2;
}

// Internal Rate of Return (IRR)
Finance.prototype.IRR = function(cfs) {
  var depth = cfs.depth || 1000;
  var args = cfs.cashFlow;
  var numberOfTries = 0;
  // Cash flow values must contain at least one positive value and one negative value
  var positive, negative;
  Array.prototype.slice.call(args).forEach(function (value) {
    if (value > 0) positive = true;
    if (value < 0) negative = true;
  })
  if (!positive || !negative) throw new Error('IRR requires at least one positive value and one negative value');
  
  function npv(rate) {
    numberOfTries++;
    if (numberOfTries > depth) {
      throw new Error('IRR can\'t find a result');
    }
    var rrate = (1 + rate/100);
    var npv = args[0];
    for (var i = 1; i < args.length; i++) {
      npv += (args[i] / Math.pow(rrate, i));
    }
    return npv;
  }
  
  // Find an initial interval that contains the zero
  var low = -100; // Start with a low rate of -100%
  var high = 100; // Start with a high rate of 100%
  var fhigh = npv(high);
  
  // If fhigh is positive, we need to increase the high rate until fhigh becomes negative
  // This handles cases with very high IRR
  while (fhigh > 0 && high < 10000) {
    high += 100; // Increase by larger increments for very high IRR
    fhigh = npv(high);
  }
  
  // If we still haven't found a negative fhigh, try a different approach
  // Start with a very high rate and work our way down
  if (fhigh > 0) {
    high = 10000; // Set to a very high rate
    fhigh = npv(high);
    
    // If it's still positive, the IRR is extremely high or doesn't exist
    if (fhigh > 0) {
      // Try to find a rate where fhigh becomes negative by doubling the rate
      while (fhigh > 0 && high < 1000000) {
        high *= 2;
        fhigh = npv(high);
      }
    }
  }
  
  // Use bisection method with high precision (0.00001%)
  var irr = seekZero(npv, low, high, 0.00001);
  
  // Return the result with higher precision (6 decimal places)
  return Math.round(irr * 1000000) / 1000000;
};

// Payback Period (PP)
Finance.prototype.PP = function(numOfPeriods, cfs) {
  // for even cash flows
  if (numOfPeriods === 0) {
    return Math.abs(arguments[1]) / arguments[2];
  }
  // for uneven cash flows
  var cumulativeCashFlow = arguments[1];
  var yearsCounter = 1;
  for (i = 2; i < arguments.length; i++) {
    cumulativeCashFlow += arguments[i];
    if (cumulativeCashFlow > 0) {
      yearsCounter += (cumulativeCashFlow - arguments[i]) / arguments[i];
      return yearsCounter;
    } else {
      yearsCounter++;
    }
  }
};

// Return on Investment (ROI)
Finance.prototype.ROI = function(cf0, earnings) {
  var roi = (earnings - Math.abs(cf0)) / Math.abs(cf0) * 100;
  return Math.round(roi * 100) / 100;
};

// Amortization
Finance.prototype.AM = function (principal, rate, period, yearOrMonth, payAtBeginning) {
  var numerator, denominator, am;
  var ratePerPeriod = rate / 12 / 100;

  // for inputs in years
  if (!yearOrMonth) {
    numerator = buildNumerator(period * 12);
    denominator = Math.pow((1 + ratePerPeriod), period * 12) - 1;

    // for inputs in months
  } else if (yearOrMonth === 1) {
    numerator = buildNumerator(period)
    denominator = Math.pow((1 + ratePerPeriod), period) - 1;

  } else {
    console.log('not defined');
  }
  am = principal * (numerator / denominator);
  return Math.round(am * 100) / 100;

  function buildNumerator(numInterestAccruals) {
    if (payAtBeginning) {
      //if payments are made in the beginning of the period, then interest shouldn't be calculated for first period
      numInterestAccruals -= 1;
    }
    return ratePerPeriod * Math.pow((1 + ratePerPeriod), numInterestAccruals);
  }
};

// Profitability Index (PI)
Finance.prototype.PI = function(rate, cfs) {
  var totalOfPVs = 0, PI;
  for (var i = 2; i < arguments.length; i++) {
    var discountFactor;
    // calculate discount factor
    discountFactor = 1 / Math.pow((1 + rate/100), (i - 1));
    totalOfPVs += arguments[i] * discountFactor;
  }
  PI = totalOfPVs/Math.abs(arguments[1]);
  return Math.round(PI * 100) / 100;
};

// Discount Factor (DF)
Finance.prototype.DF = function(rate, numOfPeriods) {
  var dfs = [], discountFactor;
  for (var i = 1; i < numOfPeriods; i++) {
    discountFactor = 1 / Math.pow((1 + rate/100), (i - 1));
    roundedDiscountFactor = Math.ceil(discountFactor * 1000)/1000;
    dfs.push(roundedDiscountFactor);
  }
  return dfs;
};

// Compound Interest (CI)
Finance.prototype.CI = function(rate, numOfCompoundings, principal, numOfPeriods) {
  var CI = principal * Math.pow((1 + ((rate/100)/ numOfCompoundings)), numOfCompoundings * numOfPeriods);
  return Math.round(CI * 100) / 100;
};

// Compound Annual Growth Rate (CAGR)
Finance.prototype.CAGR = function(beginningValue, endingValue, numOfPeriods) {
  var CAGR = Math.pow((endingValue / beginningValue), 1 / numOfPeriods) - 1;
  return Math.round(CAGR * 10000) / 100;
};

// Leverage Ratio (LR)
Finance.prototype.LR = function(totalLiabilities, totalDebts, totalIncome) {
  return (totalLiabilities  + totalDebts) / totalIncome;
};

// Rule of 72
Finance.prototype.R72 = function(rate) {
  return 72 / rate;
};

// Weighted Average Cost of Capital (WACC)
Finance.prototype.WACC = function(marketValueOfEquity, marketValueOfDebt, costOfEquity, costOfDebt, taxRate) {
  var E = marketValueOfEquity;
  var D = marketValueOfDebt;
  var V =  marketValueOfEquity + marketValueOfDebt;
  var Re = costOfEquity;
  var Rd = costOfDebt;
  var T = taxRate;

  var WACC = ((E / V) * Re/100) + (((D / V) * Rd/100) * (1 - T/100));
  return Math.round(WACC * 1000) / 10;
};

/**
 * Loan Payment calculation.
 * @param rate Rate of interest, 100-based (15% = 15), per period
 * @param principal Loan amount
 * @param numOfPayments
 * @see http://www.financeformulas.net/Loan_Payment_Formula.html
 */
Finance.prototype.PMT = function (rate, numOfPayments, principal) {
  var rate = rate/100, pmt;
  pmt = -(principal * rate) / (1 - Math.pow(1 + rate, -numOfPayments))
  return Math.round(pmt * 100) / 100;
};

// IAR calculates the Inflation-adjusted return
Finance.prototype.IAR = function(investmentReturn, inflationRate){
  return 100 * (((1 + investmentReturn) / (1 + inflationRate)) - 1);
}

// XIRR - IRR for irregular intervals
Finance.prototype.XIRR = function(cfs, dts, guess) {
  if (cfs.length != dts.length) throw new Error('Number of cash flows and dates should match');

  var positive, negative;
  Array.prototype.slice.call(cfs).forEach(function (value) {
    if (value > 0) positive = true;
    if (value < 0) negative = true;
  });

  if (!positive || !negative) throw new Error('XIRR requires at least one positive value and one negative value');


  guess = !!guess ? guess : 0;

  var limit = 100; //loop limit
  var guess_last;
  var durs = [];

  durs.push(0);

  //Create Array of durations from First date
  for(var i = 1; i < dts.length; i++) {
    durs.push(durYear(dts[0], dts[i]));
  }

  do {
    guess_last = guess;
    guess = guess_last - sumEq(cfs, durs, guess_last);
    limit--;

  }while(guess_last.toFixed(5) != guess.toFixed(5) && limit > 0);

  var xirr = guess_last.toFixed(5) != guess.toFixed(5) ? null : guess*100;

  return Math.round(xirr * 100) / 100;
}

//CAPM calculates expected return of an asset.
Finance.prototype.CAPM = function (rf, beta, emr, err) {
  var ans = rf/100 + beta * (emr/100 - rf/100);
  return ans;
}

//Returns the Value of stock with dividend growing at a 
//constant growth rate to perpetuity.
Finance.prototype.stockPV = function (g, ke, D0) {
  var valueOfStock = (D0 * (1 + g/100))/((ke/100) - (g/100))
  return Math.round(valueOfStock)
}

//Returns Sum of f(x)/f'(x)
function sumEq(cfs, durs, guess) {
  var sum_fx = 0;
  var sum_fdx = 0;
  for (var i = 0; i < cfs.length; i++) {
    sum_fx = sum_fx + (cfs[i] / Math.pow(1 + guess, durs[i]));
  }
  for ( i = 0; i < cfs.length; i++) {
    sum_fdx = sum_fdx + (-cfs[i] * durs[i] * Math.pow(1 + guess, -1 - durs[i]));
  }
  return sum_fx / sum_fdx;
}

//Returns duration in years between two dates
function durYear(first, last) {
  return (Math.abs(last.getTime() - first.getTime()) / (1000 * 3600 * 24 * 365));
}

if (typeof exports !== 'undefined' && typeof module !== 'undefined' && module.exports) {
  module.exports = Finance;
  module.exports.Finance = Finance;
}
