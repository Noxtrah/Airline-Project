// app.js
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig'); 
const { authenticateJWT, secretKey } = require('./authMiddleware');
const jwt = require('jsonwebtoken');
const sql = require('mssql');

const app = express();

// Middleware to parse JSON in the request body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Database configuration
const dbConfig = {
  user: 'Noxtra', //AirlineAppLogin
  password: 'AirlineAppPassword3', //AirlineAppPassword
  server: 'airline-app.database.windows.net',//'DESKTOP-S3KH1J1',
  database: 'AirlineAppDB',
  options: {
    encrypt: true, // For Azure SQL Database
  },
};

// SQL Server connection pool
const pool = new sql.ConnectionPool(dbConfig);
const poolConnect = pool.connect();

poolConnect.then(() => {
  console.log('Connected to the database');


// Protected route
app.get('/api/v1/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Define your routes here

// Your login route
app.post('/api/v1/login', (req, res) => {
  console.log('Using secret key:', secretKey);
  // Validate user credentials (replace with your authentication logic)

  // If credentials are valid, generate a JWT
  const token = jwt.sign({ username: req.body.username }, secretKey, { expiresIn: '1h' });

  // Send the token back to the client
  res.json({ token });
});


// Data model (replace with database connection in a real-world scenario)
const flights = [
    { date: '2023-11-15', flightNo: 'FL123', price: 200, availableSeats: 50 },
  ];
  
  
// QUERY TICKET endpoint
app.get('/api/v1/query-ticket', async (req, res) => {
  try {
    const { date, from, to, numberOfPeople } = req.query;

    // Filtering logic based on date, from, to, etc.
    const query = `
      SELECT * 
      FROM Flights_Table 
      WHERE Date = '${date}' 
        AND [From] = '${from}' 
        AND [To] = '${to}' 
        AND AvailableSeats >= ${numberOfPeople}
      ORDER BY Date
    `;

    const result = await pool.request().query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});
// BUY TICKET endpoint
app.post('/api/v1/buy-ticket', async (req, res) => {
  try {
    const { date, from, to, passengerName } = req.body;

    // Find the appropriate flight
    const result = await pool.request().query(`SELECT TOP 1 FlightID FROM Flights_Table WHERE Date = '${date}' AND AvailableSeats > 0 ORDER BY Date`);

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({ message: 'No available flights for the selected parameters.' });
    }

    const flightID = result.recordset[0].FlightID;

    // Inserting a new transaction
    await pool.request().query(`
      INSERT INTO Transactions_Table (FlightID, TransactionDate, PassengerName, NumberOfPeople)
      VALUES (${flightID}, GETDATE(), '${passengerName}', 1)
    `);

    // Update available seats
    await pool.request().query(`UPDATE Flights_Table SET AvailableSeats = AvailableSeats - 1 WHERE FlightID = ${flightID}`);

    // Return information about the purchased ticket
    const ticketResult = await pool.request().query(`SELECT * FROM Transactions_Table WHERE SCOPE_IDENTITY() = TransactionID`);
    res.json({ message: 'Ticket purchased successfully!', result: ticketResult.recordset });
  } catch (err) {
    console.error('Error purchasing ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection failed:', err));
