const mongoose = require('mongoose');

const congeSchema = new mongoose.Schema({
  date_debut: {
    type: Date,
    required: true
  },
  date_fin: {
    type: Date,
    required: true
  },
  nombre_jrs: {
    type: Number,
    required: true
  },
  type_conge: {
    type: String,
    enum: ['Annuel', 'Maladie', 'Maternité', 'Exceptionnel'],
    required: true
  },
  etat_conge: {
    type: String,
    enum: ['En attente', 'Approuvé', 'Rejeté'],
    default: 'En attente'
  },
  employe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employe',
    required: true
  },
  motif: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Conge', congeSchema); 