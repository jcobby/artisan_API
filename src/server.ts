import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
dotenv.config();
import userRoutes from './routes/userRoutes';
import searchRoutes from './routes/searchRoutes';
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

// app initialization
const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.get('/status-check', (req:Request, res:Response) => {
  res.send('Hello World!');
});
app.use('/api/users', userRoutes);
app.use('/api/search', searchRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port: http://localhost:${process.env.PORT}`);
});