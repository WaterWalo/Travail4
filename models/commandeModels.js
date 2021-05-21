'use strict';

//ORM Mongoose
var mongoose = require('mongoose');

var usagerSchema = require('../models/usagerModels').usagerSchema;
var livreurSchema = require('../models/livreurModels').livreurSchema;
var platsSchema = require('../models/platsModels').platsSchema;

// Création du schéma d'une commande
var commandeSchema = new mongoose.Schema({
    dateArrivee: {
        type: Date
    },
    livreur: {
        type: livreurSchema
    },
    usager: {
        type: usagerSchema,
        required: true
    },
    plats: {
        type: [platsSchema],
    }
});
// Crée le modèle à partir du schéma et l'Exporte pour pouvoir l'utiliser dans le reste du projet
module.exports.commandeModels = mongoose.model('Commande', commandeSchema);