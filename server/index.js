const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middlewares
app.use(cors());
app.use(express.json());

const postRoutes = require('./routes/posts');
app.use('/api', postRoutes);

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/bookworm', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Mongoose Schema
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  content: String,
});

const Book = mongoose.model('Book', bookSchema);

// POST route
app.post('/api/books', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    const saved = await newBook.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET route
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().sort({ _id: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
