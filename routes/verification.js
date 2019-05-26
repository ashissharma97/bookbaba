const express = require('express');
const router = express.Router();

const User = require('../schema/User');

router.get('/', function(req, res, next) {
    User.findOne({email:req.query.user},(err,user)=>{
        if(err){
            console.log(err)
        }
        if(user.verified == true){
            req.flash('error_msg','You are already verified')
            res.redirect('/login');
        }
        if(user.token == req.query.token){
            user.verified = true;
            user.token = '';
            user.save();
            req.flash('success_msg','You are successfully verified')
            res.redirect('/login');
        }
        else{
            req.flash('error_msg','Invalid Link')
            res.redirect('/login');
        }
    })
});

module.exports = router;
