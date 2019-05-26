const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
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
    creationDate:{
        type:Date,
        default:Date.now
    },
    verified:{
        type:String,
        default:false
    }
})

const Admin = mongoose.model('Admin',AdminSchema)

module.exports = Admin