const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

const User = require('../schema/User')

function random(length) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < length; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

router.get('/', function(req, res, next) {
  res.render('forgotpassword', { title: 'Forgot Password' });
});

router.post('/', function(req, res) {
  let token = random(20);
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
      subject: 'Forgot Password link from Bookbaba',
      html: `Hey there, use the following link to reset your password \n http://${req.headers.host}/forgotpassword/verification?user=${req.body.email}&token=${token}`,
  };
  
  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error.message);
      }
  });
  }
  main()
  User.findOneAndUpdate({email:req.body.email},{$set:{token:token}},(err,result)=>{
    if(err) throw err;
  })
  req.flash('success_msg',`Forgot Password link has been sent to your email`)
  res.redirect('/login')
});

router.get('/verification',(req,res)=>{
  User.findOne({email:req.query.user},(err,user)=>{
    if(err) throw err;
    req.session.email = req.query.user;
    if(user.token == req.query.token){
        req.flash('success_msg','You are successfully verified')
        res.redirect('/changepassword')
    }
    else{
        res.render('400',{title:'Bad Request'})
    }
  })
})
// router.post('/verification',(req,res)=>{
//   let errors = []
//   const {password,confirm_password}= req.body;
//   if(!password){
//       errors.push({msg:'Enter Password'})
//   }
//   if(!confirm_password){
//       errors.push({msg:'Enter Confirm Password'})
//   }
//   if(password != confirm_password){
//       errors.push({msg:'Password and Confirm Password not Matched'})
//   }
//   if(errors.length > 0){
//     res.render('changepassword',{
//       title: 'Change Password',
//       errors,
//       password,
//       confirm_password
//     })
//   }
//   else{
//       bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(password,salt,(err,hash)=>{
//           if(err) throw err;
//           console.log(req.query)
//           User.findOneAndUpdate({email:req.query.user},{$set:{password:hash}},(err,response)=>{
//             if(err)throw err;
//             req.flash('success_msg','Your Password is Changed')
//             res.redirect('/login')
            
//           })
//       }))
//   }
// })
module.exports = router;
