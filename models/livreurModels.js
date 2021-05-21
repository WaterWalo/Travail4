'use strict';

//ORM Mongoose
var mongoose = require('mongoose');

// Création du schéma d'un livreur
var livreurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    prenom: {
        type: String,
        required: true
    },
    voiture: {
        type: String,
        required: true
    },
    quartier: {
        type: String,
        required: true
    }
});

// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.livreurModels = mongoose.model('Livreur', livreurSchema);
module.exports.livreurSchema = mongoose.Schema(livreurSchema);