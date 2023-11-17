const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline Ticketing API',
      version: '1.0.0',
      description: 'API for ticketing transactions in a fictitious airline company.',
    },
  },
  apis: ['app.js'], 
};

const specs = swaggerJsdoc(options);
module.exports = specs;