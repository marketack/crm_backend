const swaggerJsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "CRM API Documentation",
      version: "1.0.0",
      description: "API documentation for the CRM backend system.",
    },
    servers: [{ url: "http://localhost:3001" }],
  },
  apis: ["./routes/*.js"], // Ensure all routes are documented
};

const swaggerSpecs = swaggerJsDoc(options);
module.exports = swaggerSpecs;
