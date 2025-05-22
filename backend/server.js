const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/rh_system', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Routes
app.use('/users', require('./routes/user.routes'));
app.use('/employe', require('./routes/employe.routes'));
app.use('/conge', require('./routes/conge.routes'));
app.use('/demandeconge', require('./routes/demandeconge.routes'));
app.use('/jourferie', require('./routes/jourferie.routes'));
app.use('/candidat', require('./routes/candidat.routes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 