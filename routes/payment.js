const express = require('express');
const router = express.Router();
const insta= require('instamojo-nodejs');
const url = require('url');

const Payment = require('../schema/Payment');
const Ads = require('../schema/Ads');
const Orders = require('../schema/Orders');

const {ensureAuthenticated} = require('../config/auth');

router.post('/order/:id',ensureAuthenticated,(req,res)=>{
    insta.setKeys('test_fab997d5e3fe932e45dc4fb2185','test_b34b759e7f6f00adaedc9273777')
    var data = new insta.PaymentData();
    insta.isSandboxMode(true);

    data.purpose= "Book Buying";
    data.amount = req.body.price;
    data.buyer_name= req.user.name;
    data.redirect_url= `http://${req.headers.host}/payment/${req.params.id}`;
    data.email= req.user.email;
    data.phone = req.user.mobile_no;
    data.send_email = false;
    data.send_sms= false;
    data.allow_repeated_payments = false;

    insta.createPayment(data, function(error, response) {
        if (error) {
          console.log(error)
        } else {
          let newRes =JSON.parse(response)
          res.redirect(newRes.payment_request.longurl)
        }
      })
})

router.get('/',ensureAuthenticated,(req,res)=>{
  let payload = url.parse(req.url,true)
  if(payload.query.payment_status=='Failed'){
    res.redirect(`/payment/failed`)
  }
  else{
    res.redirect(`/payment/success`)
  }
})

router.get('/:id',ensureAuthenticated,(req,res)=>{
  let payload = url.parse(req.url,true)
  if(payload.query.payment_status=='Failed'){
    res.redirect('/cart/checkout/failed')
  }
  else{
    Orders.findOne({_id:req.params.id},(err,order)=>{
      if(err) throw err;
      order.status = 'Payment Successfull';
      order.save();
      Ads.findOne({_id:order.Ad_id},(err,ad)=>{
        ad.quantity = ad.quantity - order.quantity;
        ad.save()
        let from = req.user.email,ads=order.Ad_id,paymentPrice = order.price,payment_id=payload.query.payment_id,request_id=payload.query.payment_request_id;
        const newPayment = new Payment({  
        from, 
        ads,
        paymentPrice,
        payment_id,
        request_id,
      })
      newPayment.save();
      res.redirect('/cart/checkout/success')
      })
    })
  }
})
module.exports = router
