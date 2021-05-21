'use strict';

//ORM Mongoose
var mongoose = require('mongoose');

// Création du schéma d'un plat
var platsSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    nbrPortions: {
        type: Number,
        required: true
    }
});
// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.platsModels = mongoose.model('Plats', platsSchema);
module.exports.platsSchema = mongoose.Schema(platsSchema);