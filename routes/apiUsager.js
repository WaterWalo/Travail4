'use strict';

var express = require('express');

var routerApiUsager = express.Router();
var url_base = "https://travail3.herokuapp.com/";

//ORM Mongoose
var mongoose = require('mongoose');

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb+srv://Anthony:<travail3>@cluster0.ar7yk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/ubereat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation du modèle usager
var usagerModels = require('../models/usagerModels').usagerModels;


// Création d'un usager
// =======================================================
routerApiUsager.route('/usagers')
    .post(function (req, res) {
        // Condition si tout les champs sont présents.
        if (req.body.nom && req.body.prenom && req.body.pseudo && req.body.motDePasse && req.body.adresse){
            var usager = new usagerModels(req.body);
            res.setHeader("Location", url_base + "/usagers/" + usager._id);
            // On sauvegarde dans la BD
            usager.save(function (err) {
                if (err) throw err;
                res.status(201).json(usager);
            });
        }
        else{
            res.status(404).end();
        }
        
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        res.statusCode(405).end();
    });

//Route pour accéder aux usagers selon leur id. (/usagers/<No:usager_id>)
// =======================================================
routerApiUsager.route('/usagers/:usager_id')
    //Obtenir un usager
    .get(function (req, res) {
        usagerModels.findById(req.params.usager_id, function (err, usager) {
            if (err) throw err;
            //res.status(201).json(usager);
            if (usager) res.json(usager);
            else res.status(404).end();
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });

//exportation de routerAPI
module.exports = routerApiUsager;