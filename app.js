// app.js
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig'); 
const { authenticateJWT, secretKey } = require('./authMiddleware');
const jwt = require('jsonwebtoken');
const sql = require('mssql');
const bcrypt = require('bcrypt');

const app = express();

// Middleware to parse JSON in the request body
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


// Database configuration
const dbConfig = {
  user: 'Noxtra', //AirlineAppLogin
  password: 'AirlineAppPassword3', //AirlineAppPassword
  server: 'airline-app.database.windows.net', //'DESKTOP-S3KH1J1',
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
app.post('/api/v1/login', async (req, res) => {
  const { username, password } = req.body;

  // Example: Replace this with your actual authentication logic
  const credentialsResult = await isValidCredentials(username, password);

  if (credentialsResult.isValid) {
    // If credentials are valid, generate a JWT
    const token = jwt.sign({ username: req.body.username }, secretKey, { expiresIn: '1h' });

    // Send the token back to the client
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});


async function isValidCredentials(username, password) {
  try {
    // Query the database to get the user's hashed password
    const result = await pool.request()
      .query(`SELECT Password FROM Clients_Table WHERE Username = '${username}'`);

    // Check if the user exists and the password matches
    if (result.recordset.length > 0) {
      const hashedPasswordFromDB = result.recordset[0].Password;

      // Compare the provided password with the hashed password from the database
      const passwordMatch = await bcrypt.compare(password, hashedPasswordFromDB);
      if (passwordMatch) {
        console.log("Passwords are matched");
        return {isValid: true};
      } 
      else {
        console.log("Passwords are not matched");
        return { isValid: false, message: 'Invalid credentials' };
      }
    } else {
      return { isValid: false, message: 'User not found' };
    }
  } catch (error) {
      console.error('Error during login:', error);
      return { isValid: false, message: 'Internal server error' };
    }
  };

//Create Client Route
app.post('/api/v1/create-client', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if the username already exists
    const existingUser = await pool.request()
      .query(`SELECT * FROM Clients_Table WHERE Username = '${username}'`);

    if (existingUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Generate a salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    await pool.request().query(`
      INSERT INTO Clients_Table (Username, Password)
      VALUES ('${username}', '${hashedPassword}')
    `);

    res.json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
  
// QUERY TICKET endpoint
app.get('/api/v1/query-ticket', async (req, res) => {
  try {
    const { date, from, to, numberOfPeople, page = 1, pageSize = 10 } = req.query;

    // Calculate the offset based on the page number and page size
    const offset = (page - 1) * pageSize;

    // Count total number of available flights
    const countQuery = `
      SELECT COUNT(*) AS TotalCount
      FROM Flights_Table 
      WHERE Date = '${date}' 
        AND [From] = '${from}' 
        AND [To] = '${to}' 
        AND AvailableSeats >= ${numberOfPeople}
    `;

    const countResult = await pool.request().query(countQuery);
    const totalCount = countResult.recordset[0].TotalCount;

    // Filtering logic based on date, from, to, etc.
    const query = `
      SELECT * 
      FROM Flights_Table 
      WHERE Date = '${date}' 
        AND [From] = '${from}' 
        AND [To] = '${to}' 
        AND AvailableSeats >= ${numberOfPeople}
      ORDER BY Date
      OFFSET ${offset} ROWS
      FETCH NEXT ${pageSize} ROWS ONLY;
    `;

    const result = await pool.request().query(query);
    
    // Return the result along with total count and pagination info
    res.json({
      flights: result.recordset,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      pageSize,
    });
  } catch (err) {
    console.error('Error querying the database:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// BUY TICKET endpoint
app.post('/api/v1/buy-ticket', authenticateJWT, async (req, res) => {
  try {
    const { date, from, to, passengerName } = req.body;

    // Find the appropriate flight
    const result = await pool
      .request()
      .query(
        `SELECT TOP 1 FlightID FROM Flights_Table WHERE Date = '${date}' AND AvailableSeats > 0 ORDER BY Date`
      );

    if (!result.recordset || result.recordset.length === 0) {
      return res.status(404).json({
        message: 'No available flights for the selected parameters.',
      });
    }

    const flightID = result.recordset[0].FlightID;

    // Inserting a new transaction
    await pool
      .request()
      .query(`
      INSERT INTO Transactions_Table (FlightID, TransactionDate, PassengerName, NumberOfPeople)
      VALUES (${flightID}, GETDATE(), '${passengerName}', 1)
    `);

    // Update available seats
    await pool
      .request()
      .query(
        `UPDATE Flights_Table SET AvailableSeats = AvailableSeats - 1 WHERE FlightID = ${flightID}`
      );

    // Return information about the purchased ticket
    const ticketResult = await pool
      .request()
      .query(
        `SELECT * FROM Transactions_Table WHERE SCOPE_IDENTITY() = TransactionID`
      );
    res.json({
      message: 'Ticket purchased successfully!',
      result: ticketResult.recordset,
    });
  } catch (err) {
    console.error('Error purchasing ticket:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Serve Swagger UI
app.use('', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => console.error('Database connection failed:', err));
