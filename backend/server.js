const mongoose = require('mongoose');
const dbInit = require('./Database/dbInit');
const express = require('express');
const cors = require('cors');

const doctorRouter = require('./Database/api/doctor');
const patientRouter = require('./Database/api/patient');
const appointmentRouter = require('./Database/api/appointment');
const prescriptionRouter = require('./Database/api/prescription');
const emailRouter = require('./Database/api/email');

// New routers for medical store
const productRouter = require('./Database/api/product');
const cartRouter = require('./Database/api/cart');
const orderRouter = require('./Database/api/order');

const app = express();

app.use(cors());
app.use(express.json());
const port = 6969;

dbInit();

app.use('/doctor', doctorRouter);
app.use('/patient', patientRouter);
app.use('/appointment', appointmentRouter);
app.use('/prescription', prescriptionRouter);
app.use('/email', emailRouter);

// New routes for medical store
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});

module.exports = app;