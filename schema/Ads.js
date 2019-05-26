const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdsSchema = new Schema({
    book_name:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    author_name:{
        type:String,
        required:true
    },
    publishedYear:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    account_number:{
        type:Number,
        required:true
    },
    account_name:{
        type:String,
        required:true
    },
    ifsc:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    description:{
        type:String,
        required:true
    },
    postedDate:{
        type:Date,
        default:Date.now
    },
    postedUser:{
        type:String,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    }

})

const Ads = mongoose.model('Ads',AdsSchema)

module.exports = Ads