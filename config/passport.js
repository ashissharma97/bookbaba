const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const User = require('../schema/User');

module.exports =(passport) => {
passport.use(new LocalStrategy({usernameField:'email'},(email,password,done)=>{
    User.findOne({email:email})
    .then(user =>{
        if(!user){
            return done(null,false,{message:'Email is not registred'})
        }
        if(user.verified==false){
            return done(null,false,{message:'Please verify your email before logging in'})
        }
        bcrypt.compare(password,user.password,(err,isMatch)=>{
            if(err) throw err;
            if(isMatch){
                return done (null,user)
            }
            else {
                return done (null,false,{message:'Email or Password is Incorrect'})
            }
        })
    })
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
          done(err, user);
        });
      });
})

)}