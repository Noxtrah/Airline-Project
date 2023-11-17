Airline Ticketing API
This project implements a simple REST API for an airline company, allowing clients to perform ticketing transactions using web services.

API Endpoints
QUERY TICKET
Endpoint: /api/flights

Method: GET

Parameters:

date: Date of the flight
from: Departure location
to: Destination location
numberOfPeople: Number of people
page: Page number for pagination
Response:

Returns a list of flights (date, flight number, price) based on the provided parameters. Supports paging.
BUY TICKET
Endpoint: /api/buy-ticket

Method: POST

Parameters:

date: Date of the flight
from: Departure location
to: Destination location
passengerName: Name of the passenger
Response:

Performs a buy transaction, books one seat from the flight, and returns the status.
Data Model
The data model consists of an array of flights, each containing the following information:

date: Date of the flight
flightNo: Flight number
price: Ticket price
availableSeats: Number of available seats
How to Run Locally
Install Node.js and npm.
Clone the repository.
Navigate to the project folder in the terminal.
Run npm install to install dependencies.
Run node app.js to start the server.
Access the API endpoints using tools like Postman or curl.
Troubleshooting
If you encounter issues, ensure that the data in the data model aligns with the parameters you're using in your queries. Adjust the data or query parameters as needed.

Contributions
Contributions are welcome. Feel free to open issues or submit pull requests.

Video Presentation
[Link to Video Presentation]
