const axios = require('axios');

// A helper function to fetch stock data from the proxy
const fetchStockData = async (stock) => {
  const url = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`;
  const response = await axios.get(url);
  return response.data;
};

module.exports = function (app, db) {
  
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const stock = req.query.stock; // Get the stock symbol(s) from the query

      // Handle a single stock symbol
      if (typeof stock === 'string') {
        try {
          // Fetch stock data for the single stock
          const stockData = await fetchStockData(stock.toUpperCase());
          const stockPrice = stockData.latestPrice; // Adjusted to reflect correct property

          // Check if user wants to like the stock
          let likes = 0;
          const like = req.query.like === 'true'; // Ensure we get a boolean

          // If 'like' is true, increment likes (ensure IP address is anonymized)
          if (like) {
            const userIP = req.ip; // Capture user IP
            const anonymizedIP = anonymizeIP(userIP);
            
            // Logic to save likes and IP to the database goes here
            // For example, you would query the database to save likes per IP
            // likes = await db.collection('likes').findOneAndUpdate(...) // Increment logic
            likes = 1; // Increment likes if saved (this is a placeholder)
          }

          res.json({
            stock: stock.toUpperCase(),
            price: stockPrice,
            likes: likes
          });
        } catch (err) {
          console.error(err); // Log the error for debugging
          res.status(500).json({ error: 'Failed to fetch stock data' });
        }
      }

      // Handle two stock symbols for comparison
      else if (Array.isArray(stock)) {
        try {
          // Fetch stock data for both stocks
          const stockData1 = await fetchStockData(stock[0].toUpperCase());
          const stockData2 = await fetchStockData(stock[1].toUpperCase());
          
          const price1 = stockData1.latestPrice; // Adjusted to reflect correct property
          const price2 = stockData2.latestPrice;

          // Logic to handle likes for both stocks
          let likes1 = 0, likes2 = 0;

          // Return response comparing two stocks
          res.json({
            stockData: [
              { stock: stock[0].toUpperCase(), price: price1, likes: likes1 },
              { stock: stock[1].toUpperCase(), price: price2, likes: likes2 }
            ]
          });
        } catch (err) {
          console.error(err); // Log the error for debugging
          res.status(500).json({ error: 'Failed to fetch stock data' });
        }
      }
    });

  // Helper function to anonymize IP (just an example)
  function anonymizeIP(ip) {
    return ip.split('.').slice(0, 3).join('.') + '.0';
  }

};
