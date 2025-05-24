import React, { useState, useEffect } from 'react';
import {
    Container,
    TextField,
    Button,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Avatar,
    MenuItem
} from '@mui/material';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';

const validationSchema = Yup.object({
    matricule: Yup.string()
        .required('Matricule obligatoire')
        .matches(/^[A-Z0-9]+$/, 'Matricule invalide'),
    nom: Yup.string().required('Nom obligatoire'),
    prenom: Yup.string().required('Prénom obligatoire'),
    cin: Yup.string()
        .required('CIN obligatoire')
        .matches(/^\d{8}$/, 'CIN doit avoir 8 chiffres'),
    date_naissance: Yup.date()
        .required('Date de naissance obligatoire')
        .max(new Date(), 'Date invalide'),
    adresse: Yup.string().required('Adresse obligatoire'),
    telephone: Yup.string()
        .required('Téléphone obligatoire')
        .matches(/^\d{8}$/, 'Numéro invalide'),
    post: Yup.string().required('Poste obligatoire'),
    email: Yup.string().email('Email invalide').required('Email obligatoire')
});

const EmployeeForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');

    const formik = useFormik({
        initialValues: {
            matricule: '',
            nom: '',
            prenom: '',
            cin: '',
            date_naissance: null,
            adresse: '',
            telephone: '',
            post: '',
            email: '',
            photo: ''
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            setLoading(true);
            try {
                const formData = new FormData();
                const formattedDate = format(values.date_naissance || new Date(), 'yyyy-MM-dd');

                Object.entries(values).forEach(([key, value]) => {
                    if (key !== 'photo' && key !== 'date_naissance') {
                        formData.append(key, value);
                    }
                });

                formData.append('date_naissance', formattedDate);
                if (file) formData.append('photo', file);

                const config = {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                };

                const url = id
                    ? `http://localhost:5000/employe/updateEmployeWithImage/${id}`
                    : 'http://localhost:5000/employe/addEmployeWithImage';

                await axios[id ? 'put' : 'post'](url, formData, config);

                navigate('/employes');
            } catch (error) {
                console.error('Erreur:', error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        },
    });

    useEffect(() => {
        const fetchEmployee = async () => {
            if (!id) return;

            try {
                const { data } = await axios.get(`http://localhost:5000/employe/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                const dateNaissance = data.date_naissance ? parseISO(data.date_naissance) : null;

                formik.setValues({
                    ...data,
                    date_naissance: dateNaissance
                });

                setPreview(data.photo ?
                    `http://localhost:5000/images/${data.photo}` : '');
            } catch (error) {
                console.error('Erreur:', error);
                navigate('/employes');
            }
        };

        fetchEmployee();
    }, [id, navigate]);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom>
                {id ? 'Modifier Employé' : 'Nouvel Employé'}
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
                        <label htmlFor="photo-upload">
                            <input
                                accept="image/*"
                                id="photo-upload"
                                type="file"
                                hidden
                                onChange={handleFileChange}
                            />
                            <Avatar
                                src={preview}
                                sx={{
                                    width: 150,
                                    height: 150,
                                    cursor: 'pointer',
                                    margin: 'auto',
                                    bgcolor: 'grey.200'
                                }}
                            />
                            <Typography variant="caption" color="textSecondary">
                                Cliquez pour télécharger une photo
                            </Typography>
                        </label>
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Matricule"
                                    name="matricule"
                                    value={formik.values.matricule}
                                    onChange={formik.handleChange}
                                    error={formik.touched.matricule && Boolean(formik.errors.matricule)}
                                    helperText={formik.touched.matricule && formik.errors.matricule}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom"
                                    name="nom"
                                    value={formik.values.nom}
                                    onChange={formik.handleChange}
                                    error={formik.touched.nom && Boolean(formik.errors.nom)}
                                    helperText={formik.touched.nom && formik.errors.nom}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Prénom"
                                    name="prenom"
                                    value={formik.values.prenom}
                                    onChange={formik.handleChange}
                                    error={formik.touched.prenom && Boolean(formik.errors.prenom)}
                                    helperText={formik.touched.prenom && formik.errors.prenom}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="CIN"
                                    name="cin"
                                    value={formik.values.cin}
                                    onChange={formik.handleChange}
                                    error={formik.touched.cin && Boolean(formik.errors.cin)}
                                    helperText={formik.touched.cin && formik.errors.cin}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Date de naissance"
                                    name="date_naissance"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={formik.values.date_naissance ? format(new Date(formik.values.date_naissance), 'yyyy-MM-dd') : ''}
                                    onChange={formik.handleChange}
                                    error={formik.touched.date_naissance && Boolean(formik.errors.date_naissance)}
                                    helperText={formik.touched.date_naissance && formik.errors.date_naissance}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Téléphone"
                                    name="telephone"
                                    value={formik.values.telephone}
                                    onChange={formik.handleChange}
                                    error={formik.touched.telephone && Boolean(formik.errors.telephone)}
                                    helperText={formik.touched.telephone && formik.errors.telephone}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Adresse"
                                    name="adresse"
                                    value={formik.values.adresse}
                                    onChange={formik.handleChange}
                                    error={formik.touched.adresse && Boolean(formik.errors.adresse)}
                                    helperText={formik.touched.adresse && formik.errors.adresse}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Poste"
                                    name="post"
                                    value={formik.values.post}
                                    onChange={formik.handleChange}
                                    error={formik.touched.post && Boolean(formik.errors.post)}
                                    helperText={formik.touched.post && formik.errors.post}
                                >
                                    <MenuItem value="Développeur">Développeur</MenuItem>
                                    <MenuItem value="Chef de projet">Chef de projet</MenuItem>
                                    <MenuItem value="Designer">Designer</MenuItem>
                                    <MenuItem value="Responsable RH">Responsable RH</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: 'right' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            sx={{ mr: 2 }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Enregistrer'}
                        </Button>
                        <Button variant="outlined" onClick={() => navigate('/employes')}>
                            Annuler
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default EmployeeForm;