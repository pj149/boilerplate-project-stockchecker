const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const { expect } = chai;
const nock = require('nock');

// Use chai-http for HTTP assertions
chai.use(chaiHttp);

// Mocking the external stock API response
before(() => {
  nock('https://api.yourstockapi.com') // Replace with your actual API base URL
    .get('/stock-prices')
    .query({ stock: 'GOOG' })
    .reply(200, {
      stock: 'GOOG',
      price: 164.52,
      likes: 0,
    });

  nock('https://api.yourstockapi.com') // Mocking for liking a stock
    .get('/stock-prices')
    .query({ stock: 'GOOG', like: 'true' })
    .reply(200, {
      stock: 'GOOG',
      price: 164.52,
      likes: 1,
    });

  nock('https://api.yourstockapi.com') // Mocking for two stocks
    .get('/stock-prices')
    .query({ stock: 'GOOG', stock: 'MSFT' })
    .reply(200, {
      stockData: [
        { stock: 'GOOG', price: 164.52, likes: 1 },
        { stock: 'MSFT', price: 310.00, likes: 0 },
      ],
    });
});

describe('Functional Tests', function () {
  // Test 1: Viewing one stock (without a like)
  it('Viewing one stock: GET /api/stock-prices?stock=GOOG', function (done) {
    this.timeout(10000); // Increase timeout to 10 seconds
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        console.log('Response for single stock:', res.body); // Log the response
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.stock).to.equal('GOOG');
        done();
      });
  });

  // Test 2: Viewing one stock and liking it
  it('Viewing one stock and liking it: GET /api/stock-prices?stock=GOOG&like=true', function (done) {
    this.timeout(10000); // Increase timeout to 10 seconds
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        console.log('Response for liking stock:', res.body); // Log the response
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.stock).to.equal('GOOG');
        expect(res.body.likes).to.equal(1);
        done();
      });
  });

  // Test 3: Ensuring only 1 like per IP
  it('Ensuring only 1 like per IP: GET /api/stock-prices?stock=GOOG&like=true', function (done) {
    this.timeout(10000); // Increase timeout to 10 seconds
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        console.log('Response for second like attempt:', res.body); // Log the response
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.likes).to.equal(1); // Should not increase again
        done();
      });
  });

  // Test 4: Viewing two stocks
  it('Viewing two stocks: GET /api/stock-prices?stock=GOOG&stock=MSFT', function (done) {
    this.timeout(10000); // Increase timeout to 10 seconds
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        console.log('Response for viewing two stocks:', res.body); // Log the response
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.stockData).to.be.an('array').with.length(2);
        done();
      });
  });

  // Test 5: Viewing two stocks and liking them
  it('Viewing two stocks and liking them: GET /api/stock-prices?stock=GOOG&stock=MSFT&like=true', function (done) {
    this.timeout(10000); // Increase timeout to 10 seconds
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&stock=MSFT&like=true')
      .end((err, res) => {
        if (err) {
          console.error(err);
          return done(err);
        }
        console.log('Response for liking two stocks:', res.body); // Log the response
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('object');
        expect(res.body.stockData).to.be.an('array').with.length(2);
        done();
      });
  });
});
