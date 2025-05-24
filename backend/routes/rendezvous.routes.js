const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Route pour ajouter un rendez-vous et envoyer un email
router.post('/addRendezVous', async (req, res) => {
  try {
    const { date, heure, type_entretien, notes, candidat, email, nom, prenom } = req.body;

    // Créer le rendez-vous dans la base de données
    const rendezVous = new RendezVous({
      date,
      heure,
      type_entretien,
      notes,
      candidat,
      statut: 'En attente',
      isActive: true
    });

    await rendezVous.save();

    // Formater la date pour l'email
    const dateFormatted = new Date(date).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Préparer le contenu de l'email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirmation de votre entretien',
      html: `
        <h2>Confirmation de votre entretien</h2>
        <p>Cher(e) ${prenom} ${nom},</p>
        <p>Nous vous confirmons votre entretien qui aura lieu :</p>
        <ul>
          <li><strong>Date :</strong> ${dateFormatted}</li>
          <li><strong>Heure :</strong> ${heure}h</li>
          <li><strong>Type d'entretien :</strong> ${type_entretien}</li>
        </ul>
        <p>${notes ? `<strong>Notes :</strong> ${notes}` : ''}</p>
        <p>Nous vous remercions de votre intérêt pour notre entreprise et nous nous réjouissons de vous rencontrer.</p>
        <p>Cordialement,<br>L'équipe RH</p>
      `
    };

    // Envoyer l'email
    await transporter.sendMail(mailOptions);

    res.status(201).json({ message: 'Rendez-vous créé et email envoyé avec succès', rendezVous });
  } catch (error) {
    console.error('Erreur lors de la création du rendez-vous:', error);
    res.status(500).json({ message: 'Erreur lors de la création du rendez-vous', error: error.message });
  }
});

// Autres routes existantes...

module.exports = router; 