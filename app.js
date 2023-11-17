// app.js
const express = require('express');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swaggerConfig'); 
const app = express();

// Middleware to parse JSON in the request body
app.use(bodyParser.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Define your routes here

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});



// Data model (replace with database connection in a real-world scenario)
const flights = [
    { date: '2023-11-15', flightNo: 'FL123', price: 200, availableSeats: 50 },
  ];
  
  
/**
 * @swagger
 * /api/query-ticket:
 *   get:
 *     summary: Retrieve a list of flights based on provided parameters.
 *     parameters:
 *       - name: date
 *         in: query
 *         description: Date of the flight.
 *         required: true
 *         schema:
 *           type: string
 *       - name: from
 *         in: query
 *         description: Departure location.
 *         required: true
 *         schema:
 *           type: string
 *       - name: to
 *         in: query
 *         description: Destination location.
 *         required: true
 *         schema:
 *           type: string
 *       - name: numberOfPeople
 *         in: query
 *         description: Number of people.
 *         required: true
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: Page number for pagination.
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: A list of flights.
 *         content:
 *           application/json:
 *             example:
 *               - date: '2023-11-15'
 *                 flightNo: 'FL123'
 *                 price: 200
 *               - date: '2023-11-16'
 *                 flightNo: 'FL124'
 *                 price: 250
 */
// QUERY TICKET endpoint
app.get('/api/query-ticket', (req, res) => {
    const { date, from, to, numberOfPeople, page } = req.query;
  
    // Filtering logic based on date, from, to, etc.
    let filteredFlights = flights.filter(flight => flight.date === date && flight.availableSeats >= numberOfPeople);
  
    // Pagination logic
    const pageSize = 10; // You can adjust the page size as needed
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    filteredFlights = filteredFlights.slice(startIndex, endIndex);
  
    res.json(filteredFlights);
  });


/**
 * @swagger
 * /api/buy-ticket:
 *   post:
 *     summary: Purchase a ticket for a flight.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               from:
 *                 type: string
 *               to:
 *                 type: string
 *               passengerName:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Ticket purchased successfully.
 *         content:
 *           application/json:
 *             example:
 *               message: 'Ticket purchased successfully!'
 *               flight:
 *                 date: '2023-11-15'
 *                 flightNo: 'FL123'
 *                 price: 200
 *       '404':
 *         description: No available flights for the selected parameters.
 *         content:
 *           application/json:
 *             example:
 *               message: 'No available flights for the selected parameters.'
 *       '400':
 *         description: Not enough available seats for the selected flight.
 *         content:
 *           application/json:
 *             example:
 *               message: 'Not enough available seats for the selected flight.'
 */
// BUY TICKET endpoint
app.post('/api/buy-ticket', (req, res) => {
    const { date, from, to, passengerName } = req.body;
  
    // Find the appropriate flight
    const selectedFlight = flights.find(flight => flight.date === date && flight.availableSeats > 0);
  
    if (!selectedFlight) {
      return res.status(404).json({ message: 'No available flights for the selected parameters.' });
    }
  
    // Book a seat
    selectedFlight.availableSeats--;
  
    // Return status
    res.json({ message: 'Ticket purchased successfully!', flight: selectedFlight });
  });