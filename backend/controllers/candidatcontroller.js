const Candidat = require('../models/candidatschema');

// Get all candidates
module.exports.getAllCandidats = async (req, res) => {
    try {
        const candidatList = await Candidat.find();
        res.status(200).json(candidatList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get candidate by ID
module.exports.getCandidatsBYID = async (req, res) => {
    try {
        const candidat = await Candidat.findById(req.params.id);
        if (!candidat) return res.status(404).json({ message: 'Candidat non trouvé' });
        res.status(200).json(candidat);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add new candidate
module.exports.addCandidats = async (req, res) => {
    try {
        // Debug logs
        console.log('=== Controller Debug Info ===');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('===========================');

        // Validate required fields
        const requiredFields = ['nom', 'prenom', 'email', 'cin', 'telephone', 'date_naissance', 'adresse', 'post', 'niveau_etude', 'experience'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            console.log('Missing fields:', missingFields);
            return res.status(400).json({
                message: 'Champs requis manquants',
                missingFields: missingFields
            });
        }

        // Create candidate data object with explicit field mapping
        const candidatData = {
            nom: req.body.nom || '',
            prenom: req.body.prenom || '',
            email: req.body.email || '',
            cin: req.body.cin || '',
            date_naissance: req.body.date_naissance || null,
            adresse: req.body.adresse || '',
            telephone: req.body.telephone || '',
            post: req.body.post || '',
            niveau_etude: req.body.niveau_etude || '',
            experience: req.body.experience || '',
            annee_obtention: req.body.annee_obtention || ''
        };

        // Handle file uploads if they exist
        if (req.files) {
            if (req.files.cv) candidatData.cv = req.files.cv[0].path;
            if (req.files.lettre_motivation) candidatData.lettre_motivation = req.files.lettre_motivation[0].path;
            if (req.files.diplome) candidatData.diplome = req.files.diplome[0].path;
        }

        // Debug log for final data
        console.log('Processed candidate data:', candidatData);

        // Create and save the candidate
        const candidat = new Candidat(candidatData);
        const savedCandidat = await candidat.save();
        
        res.status(201).json(savedCandidat);
    } catch (error) {
        console.error('Error adding candidate:', error);
        res.status(400).json({ 
            message: 'Erreur lors de l\'ajout du candidat',
            error: error.message 
        });
    }
};

// Update candidate
module.exports.updateCandidatsBYID = async (req, res) => {
    try {
        const {id} = req.params;
        console.log('Updating candidate with ID:', id);
        console.log('Update data:', req.body);

        const updateData = {
            nom: req.body.nom,
            prenom: req.body.prenom,
            email: req.body.email,
            cin: req.body.cin,
            date_naissance: req.body.date_naissance,
            adresse: req.body.adresse,
            telephone: req.body.telephone,
            post: req.body.post,
            niveau_etude: req.body.niveau_etude,
            experience: req.body.experience,
            annee_obtention: req.body.annee_obtention
        };

        // Handle file uploads if they exist
        if (req.files) {
            if (req.files.cv) updateData.cv = req.files.cv[0].path;
            if (req.files.lettre_motivation) updateData.lettre_motivation = req.files.lettre_motivation[0].path;
            if (req.files.diplome) updateData.diplome = req.files.diplome[0].path;
        }

        const updatedCandidat = await Candidat.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedCandidat) {
            return res.status(404).json({ message: 'Candidat non trouvé' });
        }

        res.status(200).json(updatedCandidat);
    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ message: error.message });
    }
};

// Delete candidate
module.exports.deletCandidatsBYID = async (req, res) => {
    try {
        const {id} = req.params;
        console.log('Deleting candidate with ID:', id);
        await Candidat.findByIdAndDelete(id);
        res.status(200).json({ message: "Candidat supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 