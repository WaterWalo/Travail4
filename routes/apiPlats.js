'use strict';

var express = require('express');

var routerApiPlats = express.Router();
var url_base = "https://travail3.herokuapp.com/";

//ORM Mongoose
var mongoose = require('mongoose');

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb+srv://Anthony:travail3@cluster0.ar7yk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority/ubereat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation du modèle Livreur
var platsModels = require('../models/platsModels').platsModels;


// Création d'un plat
// =======================================================
routerApiPlats.route('/plats')
    .post(function (req, res) {
        if(req.body.nom && req.body.nbrPortions){
            // Création du modèle à partir du body de la requête
            var plat = new platsModels(req.body);
            res.setHeader("Location", url_base + "/plats/" + plat._id);
            // On sauvegarde dans la BD
            plat.save(function (err) {
                if (err) throw err;
                res.status(201).json(plat,[
                    { rel: "get", method: "GET", href: "http://localhost:8090/plats/"+plat._id.toString() },
                    { rel: "delete", method: "DELETE", href: "http://localhost:8090/plats/"+plat._id.toString()}
                    ]);
            });
        }
        else{
            res.status(404).end();
        }
        
    })
    .get(function (req, res){
        platsModels.find({}, function (err, plats) {
            if (err) throw err;
            var dict = [];
            plats.forEach(plat => {
                    dict.push(plat, [
                    { rel: "get", method: "GET", href: "http://localhost:8090/plats/"+plat._id.toString() },
                    { rel: "delete", method: "DELETE", href: "http://localhost:8090/plats/"+plat._id.toString()}
                    ]);
            });
            res.status(200).json(dict);
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        res.statusCode(405).end();
    });

//Route pour accéder à un plats selon son id. (/plats/<No:plat_id>)
// =======================================================
routerApiPlats.route('/plats/:plat_id')
    //Obtenir un usager
    .get(function (req, res) {
        platsModels.findById(req.params.plat_id, function (err, plat) {
            if (err) throw err;
            if (plat) res.json(plat);
            else res.status(404).end();
        });
    })
    .delete(function (req, res){
        platsModels.findByIdAndDelete(req.params.plat_id, function (err) {
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
module.exports = routerApiPlats;