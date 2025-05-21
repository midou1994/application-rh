const express = require('express');
const router = express.Router();
const Conge = require('../models/conge.model');

// Get all congés
router.get('/getAllConge', async (req, res) => {
  try {
    const conges = await Conge.find().populate('employe');
    res.json(conges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get congés by employee ID
router.get('/getCongesByEmployee/:employeeId', async (req, res) => {
  try {
    const conges = await Conge.find({ employe: req.params.employeeId })
      .populate('employe')
      .sort({ date_debut: -1 });
    res.json(conges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new congé
router.post('/addconge', async (req, res) => {
  const conge = new Conge({
    date_debut: req.body.date_debut,
    date_fin: req.body.date_fin,
    nombre_jrs: req.body.nombre_jrs,
    type_conge: req.body.type_conge,
    etat_conge: req.body.etat_conge,
    employe: req.body.employe,
    motif: req.body.motif
  });

  try {
    const newConge = await conge.save();
    res.status(201).json(newConge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update congé
router.put('/updateConge/:id', async (req, res) => {
  try {
    const conge = await Conge.findById(req.params.id);
    if (!conge) {
      return res.status(404).json({ message: 'Congé non trouvé' });
    }

    Object.assign(conge, req.body);
    const updatedConge = await conge.save();
    res.json(updatedConge);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete congé
router.delete('/deleteConge/:id', async (req, res) => {
  try {
    const conge = await Conge.findById(req.params.id);
    if (!conge) {
      return res.status(404).json({ message: 'Congé non trouvé' });
    }

    await conge.remove();
    res.json({ message: 'Congé supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 