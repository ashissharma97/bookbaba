const router = require('express').Router();
const url = require('url');

const User = require('../schema/User');
const Ads = require('../schema/Ads');
const Payment = require('../schema/Payment');
const Orders = require('../schema/Orders');

const {ensureAuthenticated}= require('../config/auth');

router.get('/',ensureAuthenticated,(req,res)=>{
    User.findOne({email:req.user.email})
    .then(user =>{
        if(user){
            let price = 0;
            Ads.find({_id:user.cart})
            .then(ads=>{
                let pPrice = new Promise((resolve,reject)=>{
                    ads.forEach(function(adPrice){
                        price+=adPrice.price
                    })
                    resolve()
                })
                pPrice.then(()=>{
                    res.render('cart',{layout:'loginLayout',title:'My Cart',ads:ads,totalPrice:price,name:req.user.name,cartVal:req.user.cart.length})
                })
            })
        }
    })
})

router.get('/checkout',ensureAuthenticated,(req,res)=>{
    console.log(req.query.address)
    let payload = url.parse(req.url,true)
    if(payload.payment_status == 'Failed'){
        res.redirect('/cart/checkout/failed')
    }
    else{
        let from = req.user.email,ads=req.user.cart,price = 0,payment_id=payload.query.payment_id,request_id=payload.query.payment_request_id;
        let cartItems = req.user.cart;
        let loop = new Promise((resolve,reject)=>{
            cartItems.forEach(function(items,i){
                Ads.findOne({_id:items},(err,ad)=>{
                    price+=ad.price;
                    if(cartItems.length == i+1){
                        resolve()
                    }
                })
            })
        })
        loop.then(()=>{
            cartItems.forEach((ad)=>{
                Ads.findOne({_id:ad},(err,ad)=>{
                    let paymentPrice =ad.price,ads = ad._id;
                    const newPayment = new Payment({
                        from, 
                        ads,
                        paymentPrice,
                        payment_id,
                        request_id,
                    })
                    newPayment.save();
                    let Ad_id =ads,price = paymentPrice,deliveryAddress= req.query.address;
                    const newOrder = new Orders({
                        Ad_id,
                        from,
                        price,
                        deliveryAddress
                      })
                      newOrder.status ='Payment Successfull';
                      newOrder.save()
                })
            })
        })
        req.session.address = '';
        cartItems.forEach(function(items){
            Ads.findOneAndUpdate({_id:items},{$set:{active:false}},(err,updateDetails)=>{
                if(err) throw err;
            })
        })
        User.findOneAndUpdate({email:req.user.email},{$set:{cart:[]}},(err,response)=>{
            if(err) throw err;
            res.redirect('/cart/checkout/success')
        })
    }
    
})

router.get('/checkout/success',ensureAuthenticated,(req,res)=>{
    res.render('pSuccess',{layout:'loginLayout',title:'Payment Successful',name:req.user.name,cartVal:req.user.cart.length})
  })
  
  router.get('/checkout/failed',ensureAuthenticated,(req,res)=>{
    res.render('pFailure',{layout:'loginLayout',title:'Payment Failed',name:req.user.name,cartVal:req.user.cart.length})
  })
  

module.exports= router
