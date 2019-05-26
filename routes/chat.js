const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const server = require('../app');
const io = server.getIO();

const User = require('../schema/User');
const Ads = require('../schema/Ads');
const Chats = require('../schema/Chats');

const {ensureAuthenticated}= require('../config/auth');

var users ={};

var email,ad_id,postedUser,lastChat;

router.get('/',ensureAuthenticated,(req,res)=>{
    email=req.user.email;
    Chats.find({$or:[{to:email},{from:email}]},(err,chats)=>{
        if(chats.length ==0){
            res.render('chat',{layout:'loginLayout',title:'Chats',ads:null,chats:null,email:req.user.email,talkingTo:null,name:req.user.name,cartVal:req.user.cart.length});
        }
        else{
            let chatUsers= [];
            let tempAds= [];
            chats.forEach(function(chat){
                chatUsers.push(chat.to)
                chatUsers.push(chat.from)
                tempAds.push(chat.Ad_id)
            })
            let ads = [...new Set(tempAds.map(ad => ad))]
            let userEmail = [...new Set(chatUsers.map(chat => chat))]        
            let index = userEmail.indexOf(req.user.email)
            userEmail.splice(index,1)
            let ids= [];
            let finalAd= [];
            let user = new Promise((resolve,reject)=>{
                if(ids=[]){
                    ads.forEach(function(ad){
                        Ads.findOne({_id:ad})
                        .then(userAd =>finalAd.push(userAd))
                    })
                    userEmail.forEach(function(userId){
                        User.findOne({email:userId})
                        .then(userID =>{
                            ids.push(userID)
                            if(userEmail.length==ids.length && finalAd.length == ads.length){
                                resolve(userId)
                            }
                        })
                    })
                }
            })
            user.then(() =>{
                res.render('chat',{layout:'loginLayout',title:'Chats',ads:finalAd,chats:null,email:req.user.email,talkingTo:null,name:req.user.name,cartVal:req.user.cart.length});
            })
        }
    })
})

router.get('/:id',ensureAuthenticated,(req,res)=>{
    ad_id = req.params.id;
    email= req.user.email;
    Chats.find({$and:[{Ad_id:req.params.id},{$or:[{to:req.user.email},{from:req.user.email}]}]},(err,chats)=>{
        if(err){
            res.render('400')
            console.log(err)
        }
        else{
            if(chats.length == 0){
                let ads = new Promise((resolve,reject)=>{
                    Ads.findOne({_id:req.params.id},(err,ad)=>{
                        if(err){
                            console.log(err)
                        }
                        else{
                            postedUser= ad.postedUser
                        }
                        resolve()
                    })
                })
                ads.then(()=>{
                    if(postedUser== req.user.email){
                    res.render('403',{layout:'loginLayout',title:'Forbidden',message:'You cannot chat with yourself',name:req.user.name,cartVal:req.user.cart.length})
                    }
                    else{
                        res.render('chat',{layout:'loginLayout',title:'Chats',ads:null,chats:null,email:req.user.email,talkingTo:postedUser,name:req.user.name,cartVal:req.user.cart.length})
                    }
                })
            }
            else{
                let chatUsers= [];
                let tempAds= [];
                chats.forEach(function(chat){
                    chatUsers.push(chat.to)
                    chatUsers.push(chat.from)
                    tempAds.push(chat.Ad_id)
                })
                let ads = [...new Set(tempAds.map(ad => ad))]
                let userEmail = [...new Set(chatUsers.map(chat => chat))]
                let index = userEmail.indexOf(req.user.email)
                userEmail.splice(index,1)
                let ids= [];
                let finalAd= [];
                let user = new Promise((resolve,reject)=>{
                    if(ids=[]){
                        Ads.findOne({_id:ad_id},(err,ad)=>{
                            if(err){
                                console.log(err)
                                res.render('400')
                            }
                            else{
                                postedUser=ad.postedUser
                            }
                        })
                        ads.forEach(function(ad){
                            Ads.findOne({_id:ad})
                            .then(userAd =>finalAd.push(userAd))
                        })
                        userEmail.forEach(function(userId){
                            User.findOne({email:userId})
                            .then(userID =>{
                                ids.push(userID)
                                if(userEmail.length==ids.length && finalAd.length == ads.length){
                                    resolve(userId)
                                }
                            })
                            .catch((err)=>console.log(err))
                        })
                    }
                })
                user.then(()=>{
                    let popChat = chats.slice();
                    lastChat=popChat.pop()
                    if(!lastChat){
                        return
                    }
                    else{
                        if(lastChat.from == email){
                            postedUser=lastChat.to;
                        }
                        else{
                            postedUser= lastChat.from;
                        }
                    }
                    res.render('chat',{layout:'loginLayout',title:'Chats',ads:finalAd,chats:chats,email:req.user.email,talkingTo:postedUser,name:req.user.name,cartVal:req.user.cart.length});
                })
                .catch((err)=>console.log(err))
            }
        }
    })
})

io.on('connection',(socket)=>{
    socket.username= email;
    users[socket.username]= socket;
    console.log(`Usr with ${socket.username} connected`)
    socket.on('input',(data)=>{
        let to= data.to;
        let message = data.message;
        let from = data.from;
        const newChat = new Chats({
            to:to,
            message:message,
            from:from,
        })
            newChat.Ad_id= ad_id;
            newChat.save();
            if(newChat.to in users){
                users[newChat.to].emit('rOutput',[newChat])
                users[newChat.from].emit('output',[newChat])
            }
            else{
                users[newChat.from].emit('output',[newChat])
            }
        })
    socket.on('disconnect',function(){
        console.log(`Usr with ${socket.username} Disconnected`)
        delete users[socket.username]
    })
})

module.exports= router;