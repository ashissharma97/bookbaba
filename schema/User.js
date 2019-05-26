const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile_no:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    },
    cart:{
        type:Array,
        required:false,
    },
    orders:{
        type:Array,
        required:false
    },
    ads:{
        type:Array,
        required:false
    },
    token:{
        type:String,
    },
    creationDate:{
        type:Date,
        default:Date.now
    },
    verified:{
        type:Boolean,
        default:false
    },
    admin:{
        type:Boolean,
        default:false
    }
})

const User = mongoose.model('User',UserSchema)

module.exports = User