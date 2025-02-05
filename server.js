const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Добавьте этот модуль
const app = express();
const PORT = 3000;
const dotenv = require('dotenv');
dotenv.config();

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

// Схема для коллекции measurements
const measurementSchema = new mongoose.Schema({
    timestamp: { type: Date, required: true },
    field1: { type: Number },
    field2: { type: Number },
    field3: { type: Number },
});

const Measurement = mongoose.model('Measurement', measurementSchema);

// Middleware для обработки JSON
app.use(express.json());

// Отдача статических файлов (например, index.html)
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для корневого пути
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Эндпоинт для получения временных данных
app.get('/api/measurements', async (req, res) => {
    const { field, start_date, end_date } = req.query;

    // Валидация входных данных
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

// Эндпоинт для получения метрик
app.get('/api/measurements/metrics', async (req, res) => {
    const { field } = req.query;

    // Валидация входных данных
    if (!field) {
        return res.status(400).json({ error: 'Missing required parameter: field' });
    }

    try {
        const data = await Measurement.find({}, { [field]: 1, _id: 0 });
        const values = data.map((d) => d[field]);

        // Расчет метрик
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const stdDev = Math.sqrt(values.map((x) => Math.pow(x - avg, 2)).reduce((a, b) => a + b) / values.length);

        res.json({ avg, min, max, stdDev });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});