const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const User = require('../schema/User');

router.get('/', function(req, res) {
    if(req.session.email==null){
        res.render('404',{title:'Bad Request'})
    }
    else{
        res.render('changepassword', { title: 'Change Password' });
    }
});

router.post('/',(req,res)=>{
    const {password,confirm_password}= req.body;
    if(!password){
        req.flash('error_msg','Enter Password')
    }
    if(!confirm_password){
        req.flash('error_msg','Enter Confirm Password')
    }
    if(password != confirm_password){
        req.flash('error_msg','Password and Confirm Password not Matched')
    }
    else{
        bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(password,salt,(err,hash)=>{
            if(err) throw err;
            User.findOne({email:req.session.email},(er,result)=>{
                if(er) throw er;
                result.password = hash;
                result.token =  '';
                req.flash('success_msg','Your Password is Changed')
                res.redirect('/login')
            })
        }))
    }
})

module.exports = router;