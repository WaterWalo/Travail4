'use strict';

var express = require('express');

var routerApiCommande = express.Router();
var url_base = "http://localhost:8090";

//ORM Mongoose
var mongoose = require('mongoose');
// Token JWT
var jwt = require('jsonwebtoken');

// Connexion à MongoDB avec Mongoose
mongoose.connect('mongodb://localhost:27017/ubereat', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    poolSize: 10
});

//Importation du modèle usager et commande
var usagerModels = require('../models/usagerModels').usagerModels;
var commandeModels = require('../models/commandeModels').commandeModels;
var livreurModels = require('../models/livreurModels').livreurModels;
var platsModels = require('../models/platsModels').platsModels;

/**
 * Vérifie si l'utilisateur est authentifié à l'aide d'un jwt.
 * @param {Object} req Requête HTTP.
 * @param {Function} callback Fonction de callback.
 */
 function verifierAuthentification(req, callback) {
    // Récupération du jeton JWT dans l'en-tête HTTP "Authorization".
    var auth = req.headers.authorization;
    if (!auth) {
        // Condition si il n'est pas connecté.
        callback(false, null);
    } else {
        // Pour le déboggage.
        console.log("Authorization : " + auth);
        // Structure de l'en-tête "Authorization" : "Bearer jeton-jwt"
        var authArray = auth.split(' ');
        if (authArray.length !== 2) {
            // Mauvaise structure pour l'en-tête "Authorization".
            callback(false, null);
        } else {
            // Le jeton est après l'espace suivant "Bearer".
            var jetonEndode = authArray[1];
            // Vérification du jeton.
            jwt.verify(jetonEndode, req.app.get('jwt-secret'), function (err, jetonDecode) {
                if (err) {
                    // Jeton invalide.
                    callback(false, null);
                } else {
                    // Jeton valide.
                    callback(true, jetonDecode);
                }
            });
        }
    }
}

// Ajout d'un middleware qui intercepte toutes les requêtes.
routerApiCommande.use(function (req, res, next) {
// Vérification de l'authorisation.
    verifierAuthentification(req, function (estAuthentifie, jetonDecode) {
    if (!estAuthentifie) {
        // Utilisateur NON authentifié.
            res.status(401).end();
        } else {
            // Utilisateur authentifié.
            // Sauvegarde du jeton décodé dans la requête pour usage ultérieur.
            req.jeton = jetonDecode;
            // Pour le déboggage.
            console.log("Jeton : " + JSON.stringify(jetonDecode));
            // Poursuite du traitement de la requête.
            next();
    }
    });
});

// Création d'une commande
// =======================================================
routerApiCommande.route('/usagers/:usager_id/commandes')
    .post(function (req, res) {
        // Vérifie que l'usager_id correspond bien à celui du token 
        if (JSON.stringify(req.jeton._id) !== JSON.stringify(req.params.usager_id)){
            res.status(403).end();
        }
        else{
            // Création du modèle à partir du body de la requête
            var commande = new commandeModels();
            usagerModels.findById(req.params.usager_id, function (err, usager) {
                if (err) throw err;
                if (usager !== null);
                else res.status(404).end();
                commande.usager = usager;
                res.setHeader("Location", url_base + "/usagers/" + usager._id +"/commandes/" + commande._id);
                // On sauvegarde dans la BD
                commande.save(function (err) {
                    if (err) throw err;
                    res.status(201).json(commande);
                });
            });
        }   
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        res.statusCode(405).end();
    });

//Route pour accéder à la commande d'un usager selon l'id de sa commande. (/usagers/<No:usager_id>/commandes/<No:commande_id>)
// =======================================================
routerApiCommande.route('/usagers/:usager_id/commandes/:commande_id')
    //Obtenir une commande
    .get(function (req, res) {
        if (req.params.commande_id && req.params.usager_id){
            // Vérifie que l'usager_id correspond bien à celui du token 
            if (JSON.stringify(req.jeton._id) !== JSON.stringify(req.params.usager_id)){
                res.status(403).end();
            }
            else{
                commandeModels.findById(req.params.commande_id, function (err, commande) {
                    if (err) throw err;
                    if (commande) res.json(commande);
                    else res.status(404).end();
                });
            }
        }
        else{
            res.status(404).end();
        }
       
    })
    .put(function (req, res) {
        if (req.body.dateArrivee && req.params.commande_id && req.params.usager_id && req.params.commande_id){
            // Vérifie que l'usager_id correspond bien à celui du token 
            if (JSON.stringify(req.jeton._id) !== JSON.stringify(req.params.usager_id)){
                res.status(403).end();
            }
            else{
                if (req.params.commande_id.length === 24){
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        // Condition modification de la commande
                        if (commande !== null) {
                            console.log(req.body.livreur);
                            // Condition si il y a des éléments autres que la date de modifié.
                            if (req.body.livreur !== undefined || req.body.usager !== undefined || req.body.plats !== undefined){
                                res.status(403).end();
                            }
                            commande.dateArrivee = req.body.dateArrivee;
                            commande.save(function (err) {
                                if (err) throw err;
                                res.status(201).json(commande);
                            });
                        } 
                        // Condition création de la commande
                        else {
                            var newCommande = commandeModels();
                            usagerModels.findById(req.params.usager_id, function (err, usager){
                                newCommande.usager = usager;
                                newCommande.save(function (err) {
                                    if (err) throw err;
                                    res.status(200).json(newCommande);
                                });
                            });
                        }
                    });
                }
                // Condition création de la commande
                else{
                    var newCommande = commandeModels();
                    usagerModels.findById(req.params.usager_id, function (err, usager){
                        if (err) throw err; 
                        newCommande.usager = usager;
                        newCommande.save(function (err) {
                            if (err) throw err; 
                            res.status(200).json(newCommande);
                        });
                    });
                }
            }
        }
        else{
            res.status(404).end();
        }
        
    })
    .delete(function (req, res){
        // Vérifie que l'usager_id correspond bien à celui du token 
        if (JSON.stringify(req.jeton._id) !== JSON.stringify(req.params.usager_id)){
            res.status(403).end();
        }
        else{
            commandeModels.findByIdAndDelete(req.params.commande_id, function (err) {
                if (err) throw err;
                res.status(204).end();
            });
        }
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });

//Route pour modifier le livreur d'une commande
// =======================================================
routerApiCommande.route('/usagers/:usager_id/commandes/:commande_id/livreur')
    .put(function (req, res){
        console.log(req.body);
        if (req.body.nom && req.body.prenom && req.body.voiture && req.body.quartier && req.params.usager_id && req.params.commande_id){
            // Vérifie que l'usager_id correspond bien à celui du token 
            if (JSON.stringify(req.jeton._id) !== JSON.stringify(req.params.usager_id)){
                res.status(403).end();
            }
            else{
                // Condition qui détermine si la commande existe ou non
                if (req.params.commande_id.length === 24){
                    commandeModels.findById(req.params.commande_id, function (err, commande) {
                        if (err) throw err;
                        console.log(commande);
                        // Condition modification de la commande
                        if (commande !== null) {
                            livreurModels.findOne({nom: req.body.nom, prenom:req.body.prenom, voiture:req.body.voiture, quartier:req.body.quartier}, function (err, livreur){
                                if(err) throw err;
                                if (livreur !== null){
                                    //Condition Modification commande
                                    commande.livreur = livreur;
                                    commande.save(function (err){
                                        if(err) throw err;
                                        res.status(201).json(commande);
                                    });
                                }
                                // Condition Création du livreur.
                                else{
                                    var newLivreur = livreurModels(req.body);
                                    newLivreur.save(function (err){
                                        if(err) throw err;
                                        commande.livreur = newLivreur;
                                        commande.save(function (err){
                                            if(err) throw err;
                                            res.status(201).json(commande).end();
                                        });
                                    });
                                }
                            });
                        } 
                        // Condition création de la commande
                        else {
                            var newCommande = commandeModels();
                            usagerModels.findById(req.params.usager_id, function (err, usager) {
                                if (err) throw err;
                                newCommande.usager = usager;
                                newCommande._id = req.params.commande_id;
                                newCommande.save(function (err) {
                                    if (err) throw err;
                                    res.status(200).json(newCommande).end();
                                });
                            });
                        }
                    });
                }
                //Condition de création.
                else{
                    var newCommande = commandeModels();
                    usagerModels.findById(req.params.usager_id, function (err, usager) {
                        if (err) throw err;
                        var livreur = livreurModels(req.body);
                        newCommande.livreur = livreur;
                        newCommande.usager = usager;
                        newCommande.save(function (err) {
                            if (err) throw err;
                            res.status(200).json(newCommande);
                        });
                    });
                }
            }
        }
        else{
            req.status(404).end();
        }
        
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });
// Route permettant de consulter les plats dans la commande selon l'id.
// =======================================================
routerApiCommande.route('/usagers/:usager_id/commandes/:commande_id/plats')
    .get(function (req, res){
        commandeModels.findById(req.params.commande_id, function (err, commande) {
            if (err) throw err;
            if(commande !== null){
                if(commande.plats !== null){
                    res.status(200).json(commande.plats);
                }
                else{
                    res.status(404).end();
                }
            }
            res.status(404).end();
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        res.statusCode(405).end();
    });

//Route pour consulter et modifier la liste de plats d'un utilisateur.
// =======================================================
routerApiCommande.route('/usagers/:usager_id/commandes/:commande_id/plats/:plat_id')
    .put(function (req, res){
        if(req.params.usager_id && req.params.commande_id && req.params.plat_id){
            // Condition qui détermine si la commande existe ou non
            if (req.params.commande_id.length === 24){
                commandeModels.findById(req.params.commande_id, function (err, commande) {
                    if (err) throw err;

                    // Condition modification de la commande
                    if (commande !== null) {
                        platsModels.findById(req.params.plat_id, function (err, plat){
                            if(err) throw err;
                            if (plat !== null){
                                //Condition Modification commande
                                commande.plats.push(plat);
                                commande.save(function (err){
                                    if(err) throw err;
                                    res.status(201).json(commande);
                                });
                            }
                            // Condition Création du plat.
                            else{
                                var newPlat = platsModels(req.body);
                                newPlat.save(function (err){
                                    if(err) throw err;
                                    commande.plats.push(newPlat);
                                    commande.save(function (err){
                                        if(err) throw err;
                                        res.status(200).json(commande);
                                    });
                                });
                            }
                        });
                    } 
                    // Condition création de la commande
                    else {
                        var newCommande = commandeModels();
                        usagerModels.findById(req.params.usager_id, function (err, usager) {
                            if (err) throw err;
                            newCommande.usager = usager;
                            newCommande.save(function (err) {
                                if (err) throw err;
                                res.status(200).json(newCommande);
                            });
                        });
                    }
                });
            }
            //Condition de création.
            else{
                var newCommande = commandeModels();
                usagerModels.findById(req.params.usager_id, function (err, usager) {
                    if (err) throw err;
                    var plat = platsModels(req.body);
                    newCommande.plats.push(plat);
                    newCommande.usager = usager;
                    newCommande.save(function (err) {
                        if (err) throw err;
                        res.status(200).json(newCommande);
                    });
                });
            }
        }
        else{
            res.status(404).end();
        }
       
    })
    .delete(function (req, res){
        commandeModels.findById(req.params.commande_id, function (err, commande) {
            if (err) throw err;
            if (commande.plats !== null){
                console.log(commande.plats);
                platsModels.findById(req.params.plat_id, function (err, plat){
                    console.log(plat);
                    if (err) throw err;
                    if (plat !== null){
                        var iteration = 0;
                        commande.plats.forEach(unPlat => {
                            if (JSON.stringify(unPlat.nom) === JSON.stringify(plat.nom)){
                                commande.plats.splice(iteration,1);
                                commande.save(function (err) {
                                    if (err) throw err;
                                    res.status(204).end();
                                });
                            }
                            iteration++;
                        });
                    }
                    else{
                        res.status(404).end();
                    }
                });
            }
            else{
                res.status(404).end();
            }
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });
//exportation de routerAPI
module.exports = routerApiCommande;