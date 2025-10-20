import express from 'express';
import dotenv from 'dotenv';
import courseRoutes from './routes/course.route.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Root Route
app.get('/', (req, res) => {
  res.send('Hello! Server is running properly 🚀');
});

app.use('/api/courses', courseRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


