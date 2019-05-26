const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Payment = require('../schema/Payment');
const Ads = require('../schema/Ads');
const Orders = require('../schema/Orders');
const User = require('../schema/User');
const Admin = require('../schema/Admin');

const privateKey = require('../config/privateKey');

router.get('/register',function(req, res, next) {
  res.render('adminRegister', { title: 'Admin Registration' });
});

router.get('/login',function(req, res, next) {
  res.render('adminLogin', { title: 'Admin Login' });
});

router.post('/login',function(req,res){
  const {email,password} = req.body;
  let errors = [];
  if(!email || !password){
    errors.push({msg:"Enter All Fields"})
  }
  if(errors.length > 0){
    res.render('login',{
      title: 'Admin Login',
      errors,
      email,
      password,
    })
  }
  else{
    Admin.findOne({$and:[{email:email},{active:true}]},(err,user)=>{
      if(err) throw err;
      if(!user){
        req.flash('error','You are not Registered')
        res.redirect('/admin/login')
      }
      else{
        bcrypt.compare(password,user.password,(err,isMatched)=>{
          if(err){
            console.log(err)
          }
          if(isMatched){
            let token =jwt.sign({id:user._id},privateKey.privateKey)
            req.session.token = token;
            res.redirect('/admin/dashboard')
          }
          else{
            req.flash('error_msg','Email or Password is Incorrect');
            res.redirect('/admin/login');
          }
        })
      }
    })
  }
})
router.post('/register',function(req,res){
  const {name,email,mobile_no,password,confirm_password} = req.body;
  let errors = [];
  if(!name || !email || !mobile_no || !password || !confirm_password ){
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
      title: 'Admin Registration',
      errors,
      name,
      email,
      mobile_no,
      password,
      confirm_password
    })
  }
  else{
    Admin.findOne({email:email})
    .then(user =>{
      if(user){
        req.flash('error','Email is already registred')
        res.redirect('back')
      }
      else{
        const newUser = new Admin({
          name,
          email,
          mobile_no,
          password
        })
        bcrypt.genSalt(10,(err,salt)=>bcrypt.hash(newUser.password,salt,(err,hash)=>{
          if(err) throw err;
          newUser.password = hash;
          newUser.admin = true;
          newUser.save()
          req.flash('success_msg',`Yeppie you are now Registered and Please Request Your Super Admin to Verify You.`)
          res.redirect('/admin/login')
        }))
      }
    })
  } 
})
router.get('/logout',(req,res)=>{
  req.session.token = '';
  req.flash('success','You are Successfully Logged Out');
  res.redirect('/admin/login')
})

router.get('/dashboard',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    if(err){
      req.flash('error','Please Login to view this Page');
      res.redirect('/admin/login');
    }
    else{
      Payment.find({dispatch:false},(err,details)=>{
        if(err)throw err;
        res.render('adminDashboard',{layout:'adminLayout',title:"Admin Payments",payments:details})
      })
    }
  })
})

router.get('/ordersdelivery',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    if(err){
      req.flash('error','Please Login to view this Page');
      res.redirect('/admin/login');
    }
    else{
      Orders.find({status:'Payment Successfull'},(error,orders)=>{
        if(error) throw error;
        console.log(orders)
        res.render('adminDeliveryD',{layout:'adminLayout',title:"Admin Delivery Update",orders:orders})
      })
    }
  })
})

router.get('/payment/detail/:id',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    if(err){
      req.flash('error','Please Login to view this Page');
      res.redirect('/admin/login');
    }
    else{
      Payment.find({_id: req.params.id},(err,payment)=>{
        payment.forEach((pay)=>{
          let ads = pay.ads;
          ads.forEach((ad)=>{
            Ads.findOne({_id:ad})
            .then((details)=>{
              res.render('adminPaymentDetail',{layout:'adminLayout',title:'Payment Details',ad:details,payment:pay})
            })
          })
        })    
      })
    }
  })
})

router.get('/delivery/update/:id',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    Orders.findOne({_id:req.params.id},(err,order)=>{
      if(err){
        res.render('403',{title:'Forbidden'})
      }
      else{
        res.render('adminDeliveryU',{layout:'adminLayout',title:'Delivery Status Update',order:order})
      }
    })
  })
})


router.post('/delivery/update/:id',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    Orders.findOne({_id:req.params.id},(err,order)=>{
      if(err){
        res.render('403',{title:'Forbidden'})
      }
      else{
        order.status = req.body.status;
        order.save();
        res.redirect('/admin/ordersdelivery')
      }
    })
  })
})

router.post('/payment/dispatch/:id',(req,res)=>{
  jwt.verify(req.session.token,privateKey.privateKey,(err,decodedString)=>{
    Payment.findOne({_id:req.params.id},(err,payment)=>{
      if(err)throw err;
      if(!payment){
        res.render('403',{title:'Forbidden'})
      }
      else{
        payment.dispatch = true;
        payment.referece_no = req.body.reference;
        payment.admin = decodedString.id;
        payment.save();
        req.flash('success','Details Saved')
        res.redirect('/admin/dashboard')
      }
    })
  })
})
module.exports = router;
