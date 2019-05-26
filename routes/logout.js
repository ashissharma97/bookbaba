const express = require('express');
const router = express.Router();


router.get('/', function(req, res, next) {
  req.logOut();
  req.flash('success_msg','You are successfully Logged Out')
  res.redirect('/login')
});

module.exports = router;
