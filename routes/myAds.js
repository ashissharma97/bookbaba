const express = require('express');
const router = express.Router();

const Ads = require('../schema/Ads');

const {ensureAuthenticated}=require('../config/auth');

router.get('/',ensureAuthenticated,function(req, res, next) {
  Ads.find({postedUser:req.user.email},(err,ads)=>{
    if(err){
      console.log(err)
    }
    else{
      res.render('myAds', {layout:'loginLayout', title: 'My Books',name:req.user.name,ads:ads,cartVal:req.user.cart.length});
    }
  })
});


router.get('/delete/:id',ensureAuthenticated,(req,res)=>{
  Ads.findOneAndUpdate({_id:req.params.id},{$set:{active:false}},(err,response)=>{
      if(err){
          console.log(err)
      }
      else{
          res.redirect('back')
      }
  })
})

module.exports = router;
