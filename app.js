'use strict';

var express = require('express');
var app = express();
//Permet de récupérer du JSON dans le corps de la requête
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Paramètres de configuration généraux.
var config = require('./config');

var hateoasLinker = require('express-hateoas-links');
app.use(hateoasLinker);

var swaggerUI = require('swagger-ui-express'),
    swaggerDocument = require('./swagger.json');

//Variables JwtToken
var jwt = require('jsonwebtoken');
app.set('jwt-secret', config.secret);

//importe notre routeur du fichier api.js
var routerApiUsager = require('./routes/apiUsager.js');
var routerApiLivreur = require('./routes/apiLivreur');
var routerApiPlats = require('./routes/apiPlats');
var routerApiCommande = require('./routes/apiCommande');

//CORS
var cors = require('cors');

var whitelist = ['https://www.chess.com', 'https://www.delirescalade.com', 'https://cegepgarneau.omnivox.ca'];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.get('/requeteCORSWhitelist',cors(corsOptions), function (req, res) {
    console.log('requeteCORSWhitelist');
      res.json({ message: 'Accepte les requête de GET sur la ressource' });
    });

//Importation du modèle usager
var usagerModels = require('./models/usagerModels').usagerModels;
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//Route qui permet à l'usager de se connecter et de recevoir un token d'identification.
// =======================================================
app.route('/connexions')
    //Obtenir un usager
    .post(function (req, res) {
        usagerModels.findById(req.body._id, function (err, usager) {
            if (err){
                res.status(404).end();
            }
            else{
                var usagerBody = req.body;
                if (JSON.stringify(usager) === JSON.stringify(usagerBody)){
                     var payload = {
                        _id: req.body._id,
                        nom: req.body.nom,
                        prenom: req.body.prenom,
                        adresse: req.body.adresse,
                        pseudo: req.body.pseudo,
                        motDePasse: req.body.motDePasse
                     };
                     var jwtToken = jwt.sign(payload, app.get('jwt-secret'),{
                        expiresIn:86400
                     });
                     res.status(201).json({
                        "token":jwtToken
                     });
                     
                }
                else{
                    res.status(404).end();
                }
            }
        });
    })
    // Permet de gérer les autres Requêtes
    .all(function (req, res) {
        console.log('Méthode HTTP non permise');
        res.statusCode(405).end();
    });

//indique à notre app d'utiliser le routeur pour toutes les requêtes à partir de la racine du site web
app.use('/', routerApiPlats);
app.use('/', routerApiLivreur);
app.use('/', routerApiUsager);
app.use('/', routerApiCommande);

// Gestion de l'erreur 404.
app.all('*', function (req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(404).send('Erreur 404 : Ressource inexistante !');
});

// Démarrage du serveur.
app.listen(8090, function () {
    console.log('Serveur sur port ' + this.address().port);
}); 