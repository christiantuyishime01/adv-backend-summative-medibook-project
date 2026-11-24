require('dotenv').config();
const pool = require('./src/config/db');

const express = require('express');

const patientRoutes = require('./src/routes/patientRoutes');

const doctorRoutes = require('./src/routes/doctorRoutes');

const appointmentRoutes = require('./src/routes/appointmentRoutes');

const { notFound, errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = 3000;

app.use(express.json());

app.use('/appointments', appointmentRoutes);

app.use('/doctors', doctorRoutes);

app.use('/patients', patientRoutes);

app.get('/', (req, res) => { 
    res.send('MediBook API is running'); });

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`); });
