const mongoose = require('mongoose');

const candidatSchema = new mongoose.Schema({
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
  cin: {
    type: String,
    required: [true, 'Le CIN est requis'],
    unique: true
  },
  date_naissance: {
    type: Date,
    required: [true, 'La date de naissance est requise']
  },
  adresse: {
    type: String,
    required: [true, 'L\'adresse est requise']
  },
  telephone: {
    type: String,
    required: [true, 'Le téléphone est requis']
  },
  post: {
    type: String,
    required: [true, 'Le poste est requis']
  },
  niveau_etude: {
    type: String,
    required: [true, 'Le niveau d\'étude est requis']
  },
  experience: {
    type: String,
    required: [true, 'L\'expérience est requise']
  },
  cv: {
    type: String
  },
  lettre_motivation: {
    type: String
  },
  diplome: {
    type: String
  },
  annee_obtention: {
    type: String
  },
  date_creation: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Candidat', candidatSchema); 