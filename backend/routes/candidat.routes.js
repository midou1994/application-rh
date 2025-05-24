const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const candidatController = require('../controllers/candidatcontroller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

// Configure multiple file uploads
const uploadFields = upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'lettre_motivation', maxCount: 1 },
  { name: 'diplome', maxCount: 1 }
]);

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log('=== Request Debug Info ===');
  console.log('Headers:', req.headers);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);
  console.log('========================');
  next();
};

// Routes
router.get('/getAllCandidats', candidatController.getAllCandidats);
router.get('/getCandidatsBYID/:id', candidatController.getCandidatsBYID);

// Route pour ajouter un candidat avec gestion des erreurs multer
router.post('/addCandidats', (req, res, next) => {
  uploadFields(req, res, function(err) {
    if (err instanceof multer.MulterError) {
      // Une erreur Multer s'est produite lors du téléchargement
      return res.status(400).json({ message: 'Erreur lors du téléchargement des fichiers', error: err.message });
    } else if (err) {
      // Une erreur inconnue s'est produite
      return res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
    // Tout s'est bien passé
    next();
  });
}, debugMiddleware, candidatController.addCandidats);

router.put('/updateCandidatsBYID/:id', uploadFields, debugMiddleware, candidatController.updateCandidatsBYID);
router.delete('/deletCandidatsBYID/:id', candidatController.deletCandidatsBYID);

module.exports = router; 