import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 80,
    color: 'rgba(76, 175, 80, 0.15)',
    textAlign: 'center',
    width: '100%',
    fontWeight: 'bold',
    letterSpacing: 2,
    zIndex: 1,
  },
  content: {
    position: 'relative',
    zIndex: 2,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#2196F3',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    borderBottom: '1pt solid #eee',
    paddingBottom: 5,
  },
  label: {
    width: '40%',
    fontSize: 12,
    color: '#666',
  },
  value: {
    width: '60%',
    fontSize: 12,
    color: '#000',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666',
    fontSize: 10,
  },
});

const CongePDF = ({ conge, employee }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.watermark}>APPROUVÉ</Text>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Attestation de Congé</Text>
          <Text style={styles.subtitle}>Ressources Humaines</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Employé:</Text>
            <Text style={styles.value}>{`${employee?.prenom} ${employee?.nom}`}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Type de congé:</Text>
            <Text style={styles.value}>{conge.type_conge}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date de début:</Text>
            <Text style={styles.value}>{new Date(conge.date_debut).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Date de fin:</Text>
            <Text style={styles.value}>{new Date(conge.date_fin).toLocaleDateString()}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre de jours:</Text>
            <Text style={styles.value}>{conge.nombre_jrs}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Statut:</Text>
            <Text style={styles.value}>{conge.etat_conge}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text>Ce document est généré automatiquement et certifie l'approbation du congé.</Text>
          <Text>Date de génération: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default CongePDF; 