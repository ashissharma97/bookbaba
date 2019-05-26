const express = require('express');
const router = express.Router();
const multer = require('multer');
const mongoose = require('mongoose');
const crypto = require('crypto');
const GridFsStorage = require('multer-gridfs-storage');
const grid = require('gridfs-stream');
const path = require('path');

const Ads = require('../schema/Ads');
const User = require('../schema/User');

const {ensureAuthenticated}= require('../config/auth');
const mongooseURI = 'mongodb+srv://ashissharma:123ashis@bookbaba-akp6i.mongodb.net/test?retryWrites=true';

const storage = new GridFsStorage({
  url:'mongodb+srv://ashissharma:123ashis@bookbaba-akp6i.mongodb.net/test?retryWrites=true',
  file:(req,file) =>{
      return new Promise((resolve,reject)=>{
          crypto.randomBytes(16,(err,buf)=>{
              if(err){
                  return reject(err);
              }
              const filename = buf.toString('hex')+path.extname(file.originalname);
              const fileInfo ={
                  filename:filename,
                  bucketName:'ads'
              }
              resolve(fileInfo);
          })
      })
  }
})
const upload = multer({storage});


mongoose.connect(mongooseURI,{useNewUrlParser:true});
mongoose.Promise = global.Promise;
grid.mongo= mongoose.mongo;
var connection = mongoose.connection;
connection.on('error',console.error.bind(console,'conection error'));
connection.once('open',function (){
  var gfs = grid(connection.db);
  gfs.collection('ads')
  
  router.get('/',ensureAuthenticated,(req, res, next) => {
    res.render('postads', 
    { layout:'loginLayout',title: 'Post Ads' ,name:req.user.name,cartVal:req.user.cart.length});
  });
  
  router.post('/',ensureAuthenticated,upload.single('file'),(req,res,next) =>{
    const {book_name,category,description,author_name,publishedYear,quantity,price,account_number,confirm_account_number,ifsc,account_name,pickupAddress} = req.body;
    const file = req.file;
    let errors=[];
    let date = new Date();
    if(!book_name || !category || !description || !pickupAddress || !author_name || !publishedYear|| !quantity || !price ||!account_number || !confirm_account_number ||!ifsc ||!account_name){
      req.flash('error_msg','Please enter all fields.')
      res.redirect('back')    
    }
    if(req.file == undefined){
      req.flash('error_msg','Please Attach Image')
      res.redirect('back')
    }
    if(publishedYear.length!= 4 || publishedYear > date.getFullYear() ){
      req.flash('error_msg','Published Year is incorrect.')
      res.redirect('back')    
    }
    if(account_number!=confirm_account_number){
      req.flash('error_msg','Account Number an Confirm Account Number not matched.')
      res.redirect('back')    
    }
    if(quantity<=0){
      req.flash('error_msg','Quantity Should Not be Zero.')
      res.redirect('back')    
    }
    else{
      const newAds = new Ads({
        book_name,
        category,
        author_name,
        publishedYear,
        quantity,
        price,
        account_number,
        ifsc,
        account_name,
        description,
        pickupAddress
      })
      newAds.image = file.filename;
      newAds.postedUser = req.user.email;
      User.findOne({email:req.user.email})
      .then(user =>{
        if(user){
          User.findOneAndUpdate({email:req.user.email},{$push:{ads:newAds._id}},(err,res)=>{
            if(err){
              console.log(err)
            }
          })
        }
      })
      .catch(err =>{
        console.log(err)
      })
      newAds.save();
      req.flash('success_msg','Yeppie your Ads in now Posted')
      res.redirect('/postads')
    }
  })

})

module.exports = router;
