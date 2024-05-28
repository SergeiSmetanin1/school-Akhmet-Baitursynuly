const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB', err);
    });

// Модель данных для новостей
const News = mongoose.model('News', {
    title: String,
    content: String,
    photoUrl: String,
    description: String, // Добавлено поле для описания
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
    date: {
        type: Date,
        default: Date.now
    }
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

// Middleware для обработки JSON
app.use(express.json());

// Middleware для разрешения CORS
app.use(cors());

// Устанавливаем статические файлы
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '')));

const currentPath = (page) => {
    return path.resolve(__dirname, `${page}.html`);
};

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
        return res.status(400).send('No file uploaded.');
    }
    res.status(201).json({
        message: 'File uploaded successfully',
        photoUrl: `/uploads/${req.file.filename}`
    });
});

// Добавление новости
app.post('/news', async (req, res) => {
    const { title, content, description, photoUrl } = req.body;

    try {
        const news = new News({ title, content, description, photoUrl });
        await news.save();
        res.status(201).json({ message: 'Новость успешно добавлена' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Добавление мероприятия
app.post('/events', async (req, res) => {
    const { title, description, photoUrl } = req.body;

    try {
        const event = new Event({ title, description, photoUrl });
        await event.save();
        res.status(201).json({ message: 'Мероприятие успешно добавлено' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Получение всех новостей с включением даты
app.get('/all_news', async (req, res) => {
    try {
        const news = await News.find().sort({ date: -1 }); // Сортировка по убыванию даты
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
