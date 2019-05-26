const express = require('express');
const router = express.Router();

const Orders = require('../schema/Orders');
const Ads = require('../schema/Ads');
const {ensureAuthenticated} = require('../config/auth');

router.get('/',ensureAuthenticated,(req, res)=> {
    Orders.aggregate([{
        $match:{
            requestedTo:req.user.email
        }
    },{
        $lookup:{
            from:'ads',
            localField:'Ad_id',
            foreignField:'_id',
            as:'ad'
        }
    }
],(err,result)=>{
    if(err) throw err;
    if(result.length == 0 ){
        res.render('requestedOrders',{layout:'loginLayout',title:'Requested Orders',orders:null,name:req.user.name,cartVal:req.user.cart.length})
    }
    else{
        res.render('requestedOrders',{layout:'loginLayout',title:'Requested Orders',orders:result,name:req.user.name,cartVal:req.user.cart.length})
    }
})
    // Orders.find({requestedTo:req.user.email},(err,docs)=>{
    //     if(docs.length == 0){
    //         res.render('requestedOrders',{layout:'loginLayout',title:'Requested Orders',orders:null,ads:null,name:req.user.name,cartVal:req.user.cart.length})
    //     }
    //     if(err){
    //         console.log(err)
    //     }
    //     else{
    //         let newDocs =[];
    //         let promise = new Promise((resolve,reject)=>{
    //             if(newDocs=[]){
    //                 docs.forEach((doc)=>{
    //                     Ads.findOne({_id:doc.Ad_id},(err,result)=>{
    //                         newDocs.push(result)
    //                         if(docs.length == newDocs.length){
    //                             resolve()
    //                         }
    //                     })
    //                 })
    //             }
    //         })
    //         promise.then(()=>{
    //             res.render('requestedOrders',{layout:'loginLayout',title:'Requested Orders',orders:docs,ads:newDocs,name:req.user.name,cartVal:req.user.cart.length})
    //         })
    //     }
    // })
});

router.get('/approve/:id',ensureAuthenticated,(req,res)=>{
    Orders.findOneAndUpdate({_id:req.params.id},{$set:{status:'approved'}},(err,response)=>{
        if(err){
            console.log(err)
        }
        else{
            Ads.findOneAndUpdate({_id:response.Ad_id},{$set:{active:false}},(err,updateDetails)=>{
                if(err) throw err;
                res.redirect('back')
                req.flash('success_msg','Approved Successful')
            })
        }
    })
})

router.get('/reject/:id',ensureAuthenticated,(req,res)=>{
    Orders.findOneAndUpdate({_id:req.params.id},{$set:{status:'rejected'}},(err,response)=>{
        if(err){
            console.log(err)
        }
        else{
            req.flash('info','Rejected Successful')
            res.redirect('back')
        }
    })
})

module.exports = router;