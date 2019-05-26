const express = require('express');
const router = express.Router();

const Ads = require('../schema/Ads');
const User = require('../schema/User');
const Orders = require('../schema/Orders');

const {ensureAuthenticated} = require('../config/auth');

router.get('/',ensureAuthenticated,function(req, res, next) {
  Orders.aggregate([{
    $match:{
      from:req.user.email
    }
  },{
    $lookup:{
      from:'ads',
      localField:'Ad_id',
      foreignField:'_id',
      as:'ad',
    }
  }],(err,results)=>{
    if(err) throw err;
    if(results == []){
      res.render('orders',{layout:'loginLayout',title:'Orders List',orders:null,name:req.user.name,cartVal:req.user.cart.length})
    }
    else{
      res.render('orders',{layout:'loginLayout',title:'Orders List',orders:results,name:req.user.name,cartVal:req.user.cart.length})
    }
  })
});

router.get('/:id',ensureAuthenticated, function(req, res, next) {
  Ads.findOne({_id:req.params.id},(err,ad)=>{
    if(err){
      res.render('404',{title:'Not Found'})
    }
    else{
      res.render('order',{layout:'loginLayout',title:'Request Orders',ads:ad,name:req.user.name,cartVal:req.user.cart.length,price:ad.price})
    }
  })
});
router.post('/:id',function(req,res){
  Ads.findOne({_id:req.params.id},(err,ad)=>{
    if(err){
      res.render('404',{title:'Not Found'})
      console.log(err)
    }
    else{
      Orders.findOne({$and:[{Ad_id:req.params.id},{from:req.user.email}]},(err,result)=>{
        if(err){
          console.log(err)
        }
        else{
          let Ad_id= req.params.id
          let from = req.user.email
          let requestedTo = ad.postedUser
          let price = req.body.price,deliveryAddress =req.body.deliveryAddress,quantity = req.body.quantity;
          if(quantity>ad.quantity){
            req.flash('error','Please Enter Correct Quantity')
            res.redirect('back')
          }
          else{
            if(result== null){
              let newOrder = new Orders({
                Ad_id,
                from,
                requestedTo,
                quantity,
                price,
                deliveryAddress
              })
            if(newOrder.requestedTo == req.params.email){
              req.flash('error','You Cannot Request Order to You')
              res.redirect('back')
            }
            else{
              newOrder.save();
              User.findOne({email:req.user.email},(error,user)=>{
                user.cart.pop(req.params.id)
                user.save()
              })
              req.flash('success_msg','Your Request Has Been Succesfully Subbmitted. Happy Reading')
              res.redirect('back')
            }
          }
          else if(result.price !=req.body.price){
            Orders.updateOne({Ad_id:Ad_id,from:from},{$set:{price:price}},(err,results)=>{
              if(err){
                console.log(err)
              }
              else{
                req.flash('success_msg','Your Request Has Been Succesfully Updated. Happy Reading')
                res.redirect('back')
              }
            })
          }
          else{
            req.flash('error_msg','Your Order Request is already pending')
            res.redirect('back')
          }
          }
        }
      })
    }
  })
})

router.get('/withdrawrequest/:id',(req,res)=>{
  Orders.findOne({_id:req.params.id},(err,order)=>{
    if(err){
      res.render('403',{title:'Forbidden'})
    }
    else{
      Orders.remove({_id:req.params.id},(error,response)=>{
        req.flash('success_msg','Your Order is Successfully Withdrawn')
        res.redirect('/book')
      })
    }
  })
})


module.exports = router;
