const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const measurementSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    field1: { type: Number },
    field2: { type: Number },
    field3: { type: Number },
});

const Measurement = mongoose.model('Measurement', measurementSchema);

app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/measurements', async (req, res) => {
    const { field, start_date, end_date } = req.query;

    if (!field || !start_date || !end_date) {
        return res.status(400).json({ error: 'Missing required parameters: field, start_date, end_date' });
    }

    try {
        const data = await Measurement.find({
            timestamp: { $gte: new Date(start_date), $lte: new Date(end_date) },
        }, { [field]: 1, timestamp: 1, _id: 0 });

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/measurements/metrics', async (req, res) => {
    const { field } = req.query;

    if (!field) {
        return res.status(400).json({ error: 'Missing required parameter: field' });
    }

    try {
        const data = await Measurement.find({}, { [field]: 1, _id: 0 });
        const values = data.map((d) => d[field]);

        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const stdDev = Math.sqrt(values.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length);

        res.json({ avg, min, max, stdDev });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});