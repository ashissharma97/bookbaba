const express = require('express');
const router = express.Router();
const passport = require('passport')

const {notAuthenticated} = require('../config/auth');

router.get('/',function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.post('/',
  passport.authenticate('local',{ successRedirect: '/dashboard',
  failureRedirect: '/login',
  failureFlash: true,
  })
);
module.exports = router;
