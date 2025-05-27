const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: [true, 'Le nom est requis']
  },
  prenom: {
    type: String,
    required: [true, 'Le prénom est requis']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis']
  },
  role: {
    type: String,
    enum: ['Admin', 'Employe'],
    default: 'Employe'
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema); 