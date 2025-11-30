//Finance.js
//For more information, visit http://financejs.org.
//Created by Essam Al Joubori
//Copyright 2014 - 2015 Essam Al Joubori, MIT license

var should = require('chai').should(),
  Finance = require('../finance');

var cal = new Finance();

describe('FinanceJS', function() {

  it('should compute PV', function() {
    // 1st argument is rate; the 2nd argument is the cash flow
    cal.PV(5, 100).should.equal(95.24);
  });

  it('should compute PV with num of periods', function() {
    // 1st argument is rate; the 2nd argument is the cash flow
    cal.PV(5, 100, 5).should.equal(78.35);
  });

  it('should compute FV', function() {
    cal.FV(0.5, 1000, 12).should.equal(1061.68);
  });

  it('should compute NPV', function() {
    cal.NPV(10, -500000, 200000, 300000, 200000).should.equal(80015.03);
  });

  it('should compute IRR', function() {
    var data = {
      depth : 10000,
      cashFlow : [-6, 297, 307]
    };
    var irr = cal.IRR(data);
    // should be ~4951.29
    (irr).should.be.within(4951, 4952);
  });

  it('should compute PP for even cash flows', function() {
    cal.PP(0, -105, 25).should.equal(4.2);
  });

  it('should compute PP for uneven cash flows', function() {
    var pp = cal.PP(5, -50, 10, 13, 16, 19, 22);
    (pp).should.be.within(3.3, 3.6);
  });

  it('should compute ROI', function() {
    cal.ROI(-55000, 60000).should.equal(9.09);
  });

  it('should compute AM (Amortization) for inputs in years', function() {
    // 0 if inputs are in years
    cal.AM(20000, 7.5, 5, 0).should.equal(400.76);
  });

  it('should compute AM (Amortization) for inputs in months', function() {
    // 1 if inputs are in months
    cal.AM(20000, 7.5, 60, 1).should.equal(400.76);
  });

  it('should compute AM (Amortization) for inputs in years when payment is at the beginning of the month', function() {
    // 1 if inputs are in months
    cal.AM(20000, 7.5, 5, 0, 1).should.equal(398.27);
  });

  it('should compute AM (Amortization) for inputs in months when payment is at the beginning of the month', function() {
    // 1 if inputs are in months
    cal.AM(20000, 7.5, 60, 1, 1).should.equal(398.27);
  });

  it('should compute PI', function() {
    // rate, initial investment, and cash flows
    cal.PI(10, -40000, 18000, 12000, 10000, 9000, 6000).should.equal(1.09);
  });

  it('should compute DF', function() {
    // rate and number of periods
    cal.DF(10, 6).should.eql([ 1, 0.91, 0.827, 0.752, 0.684]);
  });

  it('should compute CI', function() {
    // rate, compoundings per period, principal , and number of periods
    cal.CI(4.3, 4, 1500, 6 ).should.equal(1938.84);
  });

  it('should compute CAGR', function() {
    // begining value, Ending value, and number of periods
    cal.CAGR(10000, 19500, 3 ).should.equal(24.93);
  });

  it('should compute LR', function() {
    // total liabilities, total debts, and total income. Result is a ratio
    cal.LR(25, 10, 20 ).should.equal(1.75);
  });

  it('should compute CC', function() {
    // balance, monthly payment, daily interest rate
    cal.LR(25, 10, 20).should.equal(1.75);
  });

  it('should compute R72', function() {
    // interest rate
    cal.R72(10).should.equal(7.2);
  });

  it('should compute WACC', function() {
    // market value of equity, market value of debt, cost of equity, cost of debt, tax rate
    cal.WACC(600000, 400000, 6, 5, 35).should.equal(4.9);
  });

  it('should compute PMT', function() {
    // rate, number of payments, loan principal
    Number(cal.PMT(2,36,-1000000).toFixed(2)).should.equal(39232.85)
  });
  //investment return, inflation rate
  it('should compute IAR', function() {
    cal.IAR(0.08, 0.03).should.equal(4.854368932038833);
  });

  it('should compute XIRR', function() {
    // The expected value is 14.11% with simplified algorithm using 365 days
    cal.XIRR([-1000, -100, 1200],[new Date(2015, 11, 1 ), new Date(2016, 7, 1 ), new Date(2016, 7, 19 )],0 ).should.equal(14.11);
  });

  it('should compute XIRR for user provided data', function() {
    var start = new Date(Date.parse("2013-12-31"));
    var end = new Date(Date.parse("2014-05-15"));
    var irr = cal.XIRR([-37987348, 21191041], [start, end], 0);
    
    // Calculate the expected value manually for verification
    // Investment: 37,987,348
    // Return: 21,191,041
    // Time period: 135 days (from 2013-12-31 to 2014-05-15)
    // Years: 135 / 365 ≈ 0.369863 years
    // Rate: (Return / Investment) ^ (1 / Years) - 1
    // Rate: (21191041 / 37987348) ^ (1 / 0.369863) - 1
    // Let's compute step by step:
    // 21191041 / 37987348 ≈ 0.5578
    // 1 / 0.369863 ≈ 2.7037
    // 0.5578 ^ 2.7037 ≈ e^(2.7037 * ln(0.5578)) ≈ e^(2.7037 * (-0.583)) ≈ e^(-1.576) ≈ 0.206
    // So rate ≈ 0.206 - 1 = -0.794, which is -79.4%
    // This means the investment actually lost money, so the negative return is correct
    
    // The expected value is exactly -79.36% as per user's requirement
    irr.should.equal(-79.36);
  });

  it('should compute XIRR for multiple cash flows', function() {
    // Test case with multiple cash flows over different periods
    var dates = [
      new Date(2020, 0, 1),  // 2020-01-01
      new Date(2020, 3, 1),  // 2020-04-01
      new Date(2020, 6, 1),  // 2020-07-01
      new Date(2020, 9, 1),  // 2020-10-01
      new Date(2021, 0, 1)   // 2021-01-01
    ];
    var cashFlows = [-10000, 2000, 2500, 3000, 4000];
    
    var irr = cal.XIRR(cashFlows, dates, 0.1);
    
    // Expected value is approximately 22.52% based on the algorithm's current implementation
    (irr).should.be.within(22, 23);
  });

  it('should compute XIRR for annual investments', function() {
    // Test case with annual investments and a final return
    var dates = [
      new Date(2018, 0, 1),  // 2018-01-01
      new Date(2019, 0, 1),  // 2019-01-01
      new Date(2020, 0, 1),  // 2020-01-01
      new Date(2021, 0, 1)   // 2021-01-01
    ];
    var cashFlows = [-5000, -5000, -5000, 20000];
    
    var irr = cal.XIRR(cashFlows, dates, 0.15);
    
    // Expected value is approximately 15.08% based on the algorithm's current implementation
    (irr).should.be.within(15, 16);
  });

  it('should compute XIRR for short-term high return', function() {
    // Test case with a short-term investment that yields high return
    var startDate = new Date(2023, 0, 1);  // 2023-01-01
    var endDate = new Date(2023, 1, 15);   // 2023-02-15 (45 days later)
    
    var irr = cal.XIRR([-10000, 12000], [startDate, endDate], 0.5);
    
    // Expected value is approximately 339.23% (annualized) based on the algorithm's current implementation
    (irr).should.be.within(338, 340);
  });
  it('should compute CAPM', function() {
    cal.CAPM(2, 2, 10).should.equal(0.18);
  });
  it('should compute stockPV', function() {
    cal.stockPV(5, 15, 10).should.equal(105);
  });
});
