const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  if(req.isAuthenticated()){
  res.render('Home', {layout:'loginLayout',title: 'Bookbaba' ,name:req.user.name,cartVal:req.user.cart.length});
  }
  else{
  res.render('Home', {title: 'Bookbaba' });
  }
});

module.exports = router;
