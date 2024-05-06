const jwt = require('jsonwebtoken')
const UserModel = require('../models/user.model')

module.exports.checkUser = (req, res, next) => {
  const token = req.cookies.jwt
  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        res.locals.user = null
        res.cookie('jwt', '', { maxAge: 1 })
        res.status(401).send('No token')
      } else {
        let user = await UserModel.findById(decodedToken.id)
        res.locals.user = user
        next()
      }
    })
  } else {
    res.locals.user = null
    res.status(401).send('No token')
  }
}

module.exports.requireAuth = (req, res, next) => {
  const token = req.cookies.jwt

  if (token) {
    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decodedToken) => {
      if (err) {
        console.log(err);
      } else{ 
        console.log(decodedToken.id);
        next();
      }
    });
  } else{
    console.log("No token");
  }
}