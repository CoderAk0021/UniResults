import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { protect } from './middleware/authMiddleware.js';
import connectDB from './utility/connection.js';
import AuthRoute from './routes/auth.routes.js';
import AdminRoute from './routes/admin.routes.js';
import PublicRoute from './routes/public.routes.js';

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.ENV == 'Development' ? 'http://localhost:5173' : process.env.ORIGIN,
  credentials: true
}));



app.use('/api/auth',AuthRoute);
app.use('/api/admin',protect,AdminRoute);
app.use('/api',PublicRoute);

connectDB();
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
