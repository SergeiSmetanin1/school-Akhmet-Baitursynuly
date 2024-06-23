const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Подключение к MongoDB без устаревших параметров
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

// Middleware для обработки JSON
app.use(express.json());

// Настройка CORS
const allowedOrigins = ['https://akhmet-baitursynuly-school-2571435000c8.herokuapp.com'];

const corsOptions = {
    origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
};

app.use(cors(corsOptions));

// Устанавливаем статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '')));

const currentPath = (page) => {
    return path.resolve(__dirname, `${page}.html`);
};

// Модель данных для новостей
const News = mongoose.model('News', {
    title: String,
    content: String,
    photoUrl: String,
    description: String,
    date: {
        type: Date,
        default: Date.now
    }
});

// Модель данных для мероприятий
const Event = mongoose.model('Event', {
    title: String,
    description: String,
    photoUrl: String,
    date: Date
});

// Настройка multer для хранения файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Обработка маршрутов
app.get(['/', '/index', '/home'], (req, res) => {
    res.sendFile(currentPath('index'));
});

app.get('/about', (req, res) => {
    res.sendFile(currentPath('about'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(currentPath('contacts'));
});

app.get('/news', (req, res) => {
    res.sendFile(currentPath('news'));
});

app.get('/news_detail', (req, res) => {
    res.sendFile(currentPath('news_detail'));
});

app.get('/events', (req, res) => {
    res.sendFile(currentPath('events'));
});

app.get('/education', (req, res) => {
    res.sendFile(currentPath('education'));
});

app.get('/admin', (req, res) => {
    res.sendFile(currentPath('admin'));
});

// Маршрут для загрузки файлов
app.post('/upload', upload.single('photo'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    res.status(201).json({
        message: 'File uploaded successfully',
        photoUrl: `/uploads/${req.file.filename}`
    });
});

// Маршрут для добавления новостей
app.post('/news', async (req, res) => {
    try {
        const { title, description, photoUrl } = req.body;
        const news = new News({ title, description, photoUrl });
        await news.save();
        res.json({ message: 'Новость успешно добавлена!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для добавления мероприятий
app.post('/events', async (req, res) => {
    try {
        const { title, description, photoUrl, date } = req.body;
        const event = new Event({ title, description, photoUrl, date });
        await event.save();
        res.json({ message: 'Событие успешно добавлено!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Получение всех новостей с включением даты
app.get('/all_news', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 }); 
        res.json(news);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Получение всех мероприятий с включением даты
app.get('/all_events', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: -1 }); // Сортировка по убыванию даты
        res.json(events);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление новости
app.delete('/news/:id', async (req, res) => {
    const newsId = req.params.id;

    try {
        const news = await News.findByIdAndDelete(newsId);
        if (!news) {
            return res.status(404).json({ error: 'Новость не найдена' });
        }
        // Удаление фотографии из папки
        const photoPath = news.photoUrl.replace('/uploads/', '');
        fs.unlinkSync(path.join(__dirname, 'uploads', photoPath));
        res.json({ message: 'Новость успешно удалена' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Удаление мероприятия
app.delete('/events/:id', async (req, res) => {
    const eventId = req.params.id;

    try {
        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        // Удаление фотографии из папки
        const photoPath = event.photoUrl.replace('/uploads/', '');
        fs.unlinkSync(path.join(__dirname, 'uploads', photoPath));
        res.json({ message: 'Мероприятие успешно удалено' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Изменение новости
app.put('/news/:id', async (req, res) => {
    const newsId = req.params.id;
    const { title, content, description, photoUrl } = req.body;

    try {
        const news = await News.findByIdAndUpdate(newsId, { title, content, description, photoUrl }, { new: true });
        if (!news) {
            return res.status(404).json({ error: 'Новость не найдена' });
        }
        res.json({ message: 'Новость успешно обновлена', news });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Изменение мероприятия
app.put('/events/:id', async (req, res) => {
    const eventId = req.params.id;
    const { title, description, photoUrl, date } = req.body;

    try {
        const event = await Event.findByIdAndUpdate(eventId, { title, description, photoUrl, date }, { new: true });
        if (!event) {
            return res.status(404).json({ error: 'Мероприятие не найдено' });
        }
        res.json({ message: 'Мероприятие успешно обновлено', event });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Middleware для обработки ошибок
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

