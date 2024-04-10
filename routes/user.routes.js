const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');

// Auth
router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.get("/logout", authController.logout);

// User display : "block"
router.get("/", userController.getAllUsers); // get parce que on récupère
router.get("/:id", userController.userInfo);
router.put('/:id', userController.updateUser); // put parce que on modifie donc on envoie
router.delete('/:id', userController.deleteUser); // delete parce que on supprime
router.patch('/follow/:id', userController.follow); // patch parce que on modifie partiellement
router.patch('/unfollow/:id', userController.unfollow) // patch parce que on modifie partiellement

module.exports = router;