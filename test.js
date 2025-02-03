// insertTestData.js
const mongoose = require('mongoose');

// Подключение к MongoDB
mongoose.connect('mongodb+srv://bya20102005:1234@analyticalplatform.zfbow.mongodb.net/?retryWrites=true&w=majority&appName=analyticalPlatform')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Определение схемы и модели
        const measurementSchema = new mongoose.Schema({
            timestamp: { type: Date, required: true },
            field1: { type: Number },
            field2: { type: Number },
            field3: { type: Number },
        });

        const Measurement = mongoose.model('Measurement', measurementSchema);

        // Добавление тестовых данных
        await Measurement.insertMany([
            { timestamp: new Date('2023-10-01T12:00:00Z'), field1: 22.5, field2: 45.3, field3: 1200 },
            { timestamp: new Date('2023-10-01T13:00:00Z'), field1: 23.1, field2: 46.0, field3: 1250 },
            { timestamp: new Date('2023-10-01T14:00:00Z'), field1: 24.0, field2: 47.2, field3: 1300 },
            { timestamp: new Date('2023-10-02T12:00:00Z'), field1: 25.5, field2: 48.0, field3: 1350 },
            { timestamp: new Date('2023-10-02T13:00:00Z'), field1: 26.0, field2: 49.1, field3: 1400 },
        ]);

        console.log('Test data inserted');
        mongoose.connection.close();
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });