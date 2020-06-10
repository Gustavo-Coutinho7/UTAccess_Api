const { Router} = require('express');
const router = Router();

const { Favoritos, createUser, authUser, updateUser, Token, Unique, createFavorito, addFavorito, addRecente, Recentes, Destino, AuthToken} = require('../controllers/index.controller');


router.post('/insert', Unique, createUser, createFavorito);
router.post('/auth', authUser);
router.put('/update', Token, updateUser);
router.post('/addFavorito/:id', Token, addFavorito);
router.post('/favoritos/:id', Token, Favoritos );
router.post('/addRecente/:id', Token, addRecente);
router.post('/recentes/:id', Token, Recentes);
router.post('/destino/:id', Token, Destino);
router.post('/token', Token, AuthToken);
module.exports = router;