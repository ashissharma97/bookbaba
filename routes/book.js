const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const grid = require('gridfs-stream');
const path = require('path');

const User = require('../schema/User');
const Ads = require('../schema/Ads');
const {ensureAuthenticated}= require('../config/auth');
const mongooseURI = 'mongodb+srv://ashissharma:123ashis@bookbaba-akp6i.mongodb.net/test?retryWrites=true';

mongoose.connect(mongooseURI,{useNewUrlParser:true});
mongoose.Promise = global.Promise;
grid.mongo= mongoose.mongo;
var connection = mongoose.connection;
connection.on('error',console.error.bind(console,'conection error'));
connection.once('open',function (){

  var gfs = grid(connection.db);
  gfs.collection('ads')

  router.get('/',function(req, res, next) {
    Ads.find({$and:[{active:true},{quantity:{$gt:0}}]},(err,ads)=>{
      if(req.isAuthenticated()){
        res.render('book',{layout:'loginLayout',title:'Books',ads:ads,name:req.user.name,cartVal:req.user.cart.length})
      }
      else{
        res.render('book',{title:'Books',ads:ads,orders:null})
      }
      })
    });
  router.get('/image/:filename', (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
      if (!file || file.length === 0) {
        return res.status(404).json({
          err: 'No file exists'
        });
      }
  
      if (file.contentType === 'image/jpeg' || file.contentType === 'image/png') {
        const readstream = gfs.createReadStream(file.filename);
        readstream.pipe(res);
      } else {
        res.status(404).json({
          err: 'Not an image'
        });
      }
    });
  });
  router.get('/:id', (req, res) => {
    Ads.findOne({_id:req.params.id},(err,ad)=>{
      if(ad){
        if(req.isAuthenticated()){
          res.render('individual',{layout:'loginLayout',title:'Book',ad:ad,name:req.user.name,cartVal:req.user.cart.length});
        }else{
          res.render('individual',{title:'Book',ad:ad,name:null});
        }
      }
      else{
        res.render('404',{title:'Not Found'})
      }
    })
  });
  router.get('/cart/:id',ensureAuthenticated,(req,res) =>{
    Ads.findOne({_id:req.params.id})
    .then(id =>{
      if(req.user.cart.indexOf(id._id)){
        User.findOne({email:req.user.email},(err,result)=>{
          if(err){
            console.log(err)
          }
          if(id.postedUser == req.user.email){
            req.flash('error','Sorry this book is posted by You.')
            res.redirect('back')
          }
          else{
            result.cart.push(id._id)
            result.save()
            req.flash('success_msg','Added Successfull')
            res.redirect('back')
          }
        })
      }
      else{
        req.flash('error','Already in Your Cart')
        res.redirect('back')
      }
    })
    .catch(err =>{
      console.log(err)
    })
  })
  router.get('/cart/delete/:id',ensureAuthenticated,(req,res) =>{
    Ads.findOne({_id:req.params.id})
    .then(id =>{
      if(id){
        User.findOne({email:req.user.email},(err,result)=>{
          if(err){
            console.log(err)
          }
          else{
            result.cart.pop(req.params.id)
            result.save()
            req.flash('success_msg','Removed Successful')
            res.redirect('back')
          }
        })
      }
      else{
        res.redirect('back')
      }
    })
    .catch(err =>{
      console.log(err)
    })
  })
})

module.exports = router;
