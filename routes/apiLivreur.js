'use strict';

var express = require('express');

var routerApiLivreur = express.Router();
var url_base = "http://localhost:8090";

//ORM Mongoose
var mongoose = require('mongoose');

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/ubereat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation du modèle Livreur
var livreurModels = require('../models/livreurModels').livreurModels;


// Création d'un livreur
// =======================================================
routerApiLivreur.route('/livreurs')
    .post(function (req, res) {
        if (req.body.nom && req.body.prenom && req.body.voiture && req.body.quartier){
            // Création du modèle à partir du body de la requête    
            var livreur = new livreurModels(req.body);
            res.setHeader("Location", url_base + "/livreurs/" + livreur._id);
            // On sauvegarde dans la BD
            livreur.save(function (err) {
                if (err) throw err;
                res.status(201).json(livreur);
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

//Route pour accéder à un livreur selon son id. (/livreurs/<No:livreur_id>)
// =======================================================
routerApiLivreur.route('/livreurs/:livreur_id')
    //Obtenir un usager
    .get(function (req, res) {
        livreurModels.findById(req.params.livreur_id, function (err, livreur) {
            if (err) throw err;
            if (livreur) res.json(livreur);
            else res.status(404).end();
        });
    })
    .delete(function (req, res){
        livreurModels.findByIdAndDelete(req.params.livreur_id, function (err) {
            if (err) throw err;
            res.status(204).end();
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });

//exportation de routerAPI
module.exports = routerApiLivreur;