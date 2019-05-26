const express = require('express');
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const url = require('url')

const User = require('../schema/User');

const {notAuthenticated} = require('../config/auth');

function random(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.get('/',notAuthenticated, (req, res, next)=>{
  res.render('registration', { title: 'Registration Form' });
});

router.post('/',(req,res,next)=>{
  const {name,email,mobile_no,password,confirm_password,gender} = req.body;
  let errors = [];
  if(!name || !email || !mobile_no || !password || !confirm_password || !gender ){
    errors.push({msg:'Enter all Fields'})
  }
  if(password != confirm_password){
    errors.push({msg:"Password and Confirm Password is not matching."})
  }
  if(password.length < 8){
    errors.push({msg:"Your Password Should be atlease 6 Characters."})
  }
  if(errors.length > 0){
    res.render('registration',{
      title: 'Registration Form',
      errors,
      name,
      email,
      mobile_no,
      password,
      confirm_password,
      gender
    })
  }
  else{
    User.findOne({email:email})
    .then(user =>{
      if(user){
        req.flash('error','Email is already registred')
        res.redirect('back')
      }
      else{
        const newUser = new User({
          name,
          email,
          mobile_no,
          password,
          gender
        })
        bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>{
          if(err) throw err;
          let token = random(20);
          newUser.token = token;
          newUser.password = hash;
          newUser.save()
          async function main(){
            let transporter = nodemailer.createTransport({
              host: 'smtp.gmail.com',
              port: 587,
              secure: false,
              requireTLS: true,
              auth: {
                  user: 'bookbabamail@gmail.com',
                  pass: 'srmus@2019'
              }
          });
          
          let mailOptions = {
              from: '"Book Baba" bookbabamail@gmail.com',
              to: req.body.email,
              subject: 'Email Verification from BookBaba',
              html: `Hey ${req.body.name} use the following link to verify your email \n http://${req.headers.host}/verification?user=${req.body.email}&token=${token}`,
          };
          
          transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                  return console.log(error.message);
              }
          });
          }
          main()
          req.flash('success_msg',`Yeppie you are now Registered and Please Verify your email before Logging In`)
          res.redirect('/login')
        }))
      }
    })
  }
})

module.exports = router;
