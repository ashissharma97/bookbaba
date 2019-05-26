const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const User = require('../schema/User');
const {ensureAuthenticated}= require('../config/auth');
router.get('/',ensureAuthenticated,function(req, res, next) {
  User.find({email:req.user.email},(err,user)=>{
    if(user){
      res.render('dashboard', 
      { 
        layout:'loginLayout',
        title: 'Dashboard',
        name:req.user.name,
        user:user,
        orders:user.orders,
        cartVal:req.user.cart.length
      }
      )
    }
  })
});


module.exports = router;
