const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline Ticketing API',
      version: '1.0.0', // Keep the overall API version
      description: 'API for ticketing transactions in an airline company.',
    },
  },
  apis: ['app.js'], // Specify the file where your routes are defined
};

const specs = swaggerJsdoc(options);

specs.paths['/api/v1/query-ticket'] = {
  get: {
    summary: 'Retrieve a list of flights based on provided parameters (v1)',
    parameters: [
      {
        name: 'date',
        in: 'query',
        description: 'Date of the flight.',
        required: true,
        schema: {
          type: 'string',
        },
        
      },
      {
        name: 'from',
        in: 'query',
          description: 'Departure location',
         required: true,
         schema:{
           type: 'string',
         }
      },
      {
        name: 'to',
        in: 'query',
          description:  'Destination location',
         required: true,
         schema:{
           type: 'string',
         }
      },
      {
        name: 'numberOfPeople',
        in: 'query',
          description:  'Number Of People',
         required: true,
         schema:{
           type: 'integer',
         }
      },
      {
        name: 'page',
        in: 'query',
          description:  'Page Of Flights List',
         required: false,
         schema:{
           type: 'integer',
         }
      },
      // Include other parameters as needed
    ],
    responses: {
      '200': {
        description: 'A list of flights.',
        content: {
          'application/json': {
            example: [
              {
                date: '2023-11-15',
                from: 'CityA',
                to: 'CityB',
                numberOfPeople: '1',
              },
            ],
          },
        },
      },
    },
  },
};

specs.paths['/api/v1/buy-ticket'] = {
  post: {
    summary: 'Purchase a ticket for a flight (v1)',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              date: {
                type: 'string',
              },
              from: {
                type: 'string',
              },
              to: {
                type: 'string',
              },
              passengerName: {
                type: 'string',
              },
              // Include other properties as needed
            },
            required: ['date', 'from', 'to', 'passengerName'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Ticket purchased successfully.',
        content: {
          'application/json': {
            example: {
              status: 'success',
              message: 'Ticket purchased successfully!',
              flight: {
                date: '2023-11-15',
                from: 'CityA',
                to: 'CityB',
                passengerFullName: 'Hasan Su',
              },
            },
          },
        },
      },
      '404': {
        description: 'No available flights for the selected parameters.',
        content: {
          'application/json': {
            example: {
              status: 'error',
              message: 'No available flights for the selected parameters.',
            },
          },
        },
      },
      '400': {
        description: 'Not enough available seats for the selected flight.',
        content: {
          'application/json': {
            example: {
              status: 'error',
              message: 'Not enough available seats for the selected flight.',
            },
          },
        },
      },
      // Include other response codes and examples as needed
    },
  },
};

specs.paths['/api/v1/login'] = {
  post: {
    summary: 'Login route (v1)',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
            required: ['username', 'password'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'Successful login',
        content: {
          'application/json': {
            example: {
              status: 'success',
              message: 'Login successful',
              token: 'YOUR_JWT_TOKEN',
              login: {
                username: 'HasanSu',
                password: 'HasanSu',
              },
            },
          },
        },
      },
      '401': {
        description: 'Invalid credentials',
        content: {
          'application/json': {
            example: {
              status: 'error',
              message: 'Invalid credentials',
            },
          },
        },
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            example: {
              status: 'error',
              message: 'Internal server error',
            },
          },
        },
      },
      // Include other response codes and examples as needed
    },
  },
};


specs.paths['/api/v1/create-client'] = {
  post: {
    summary: 'Create a new user (v1)',
    requestBody: {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {
                type: 'string',
              },
              password: {
                type: 'string',
              },
            },
            required: ['username', 'password'],
          },
        },
      },
    },
    responses: {
      '200': {
        description: 'User created successfully.',
        content: {
          'application/json': {
            example: {
              message: 'User created successfully.',
              create_client: {
                username: 'HasanSu',
                password: 'HasanSu',
              },
            },
          },
        },
      },
      '400': {
        description: 'Username already exists.',
        content: {
          'application/json': {
            example: {
              message: 'Username already exists.',
            },
          },
        },
      },
      '500': {
        description: 'Internal server error.',
        content: {
          'application/json': {
            example: {
              message: 'Internal server error.',
            },
          },
        },
      },
      // Include other response codes and examples as needed
    },
  },
};

module.exports = specs;