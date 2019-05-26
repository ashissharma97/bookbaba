const express = require('express');
const router = express.Router();

const {notAuthenticated} = require('../config/auth');

const User = require('../schema/User')
const Ads = require('../schema/Ads')

router.get('/',function(req, res, next) {
    if(req.isAuthenticated()){
        res.render('search', {layout:'loginLayout', title: 'Search'});
    }
    else{
        res.render('search', { title: 'Search'});
    }
});

router.post('/',(req,res,next)=>{
    Ads.find({$and:[{book_name:{ $regex: req.body.value, $options: 'i'}},{active:true}]},(err,result)=>{
        if(err){
            console.log(err)
        }
        else{
            if(req.isAuthenticated()){
                res.render('search', {layout:'loginLayout', title: 'Search',keyword:req.body.value,results:result,name:req.user.name,cartVal:req.user.cart.length});
            }
            else{
                res.render('search', { title: 'Search',keyword:req.body.value,results:result});
            }
        }
    })
})

module.exports = router;
