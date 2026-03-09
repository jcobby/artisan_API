import swaggerJsdoc from "swagger-jsdoc";

export const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Your API Name",
      version: "1.0.0",
      description: "API documentation for your backend",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
      {
        url: "https://your-production-url.com",
        description: "Production server",
      },
    ],
  },

  apis: ["./src/routes/*.ts", "./src/controllers/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);