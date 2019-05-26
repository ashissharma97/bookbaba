const express = require('express');
const logger = require('morgan');
const path = require('path');
const layout = require('express-ejs-layouts');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const app = express();
const http=require('http').Server(app);
const server = http.listen(process.env.PORT || 3000);

const io = require('socket.io')(server);

module.exports.getIO =function(){
    return io;
}

const mongooseURI = 'mongodb+srv://ashissharma:123ashis@bookbaba-akp6i.mongodb.net/test?retryWrites=true';

require('./config/passport')(passport)

mongoose.connect(mongooseURI,{useNewUrlParser:true})
.then(()=> console.log('MongoDB Connected'))
.catch(err => console.log(err))
app.set('io', io);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(layout)
// app.use(logger('dev'))   
app.use(express.json());
app.use(session({
    secret:"srmus2019",
    resave: true,
    saveUninitialized: true
}))
app.use(passport.initialize());
app.use(passport.session())

app.use(flash())
app.use(function(req,res,next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.info = req.flash('info');
    next()
})

app.use(express.urlencoded({ extended: false}));
app.use('/public', express.static(__dirname + '/public' ));
app.use('/image', express.static(__dirname + '/image' ));

app.use('/', require('./routes/index'));
app.use('/login', require('./routes/login'));
app.use('/registration',require('./routes/registration'));
app.use('/book',require('./routes/book'));
app.use('/forgotpassword',require('./routes/forgotpassword'));
app.use('/dashboard',require('./routes/dashboard'));
app.use('/postads',require('./routes/postads'));
app.use('/cart',require('./routes/cart'));
app.use('/chat',require('./routes/chat'));
app.use('/verification',require('./routes/verification'));
app.use('/search',require('./routes/search'));
app.use('/logout',require('./routes/logout'));
app.use('/order',require('./routes/order'));
app.use('/mybooks',require('./routes/myAds'));
app.use('/requestedorders',require('./routes/requestedorders'));
app.use('/payment',require('./routes/payment'));
app.use('/admin',require('./routes/admin'));
app.use('/changepassword',require('./routes/changePassword'));
app.get('*',function (req, res) {
    if(req.isAuthenticated()){
        res.render('404',{layout:'loginLayout',title:'Not Found',name:req.user.name,cartVal:req.user.cart.length})
    }
    else{
        res.render('404',{title:'Not Found'})
    }
  })
