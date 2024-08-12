import express from 'express';
import { json } from 'body-parser';
import cors from 'cors';
import routes from './routes';
import errorHandler from './middlewares/error.middleware';
import cookieParser from 'cookie-parser';

const app = express();
app.use(json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.use('/api', routes);
app.use(errorHandler);

export default app;
