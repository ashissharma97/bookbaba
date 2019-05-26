const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
    Ad_id:{
        type:String,
        required:true
    },
    from:{
        type:String,
        required:true
    },
    to:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    username:{
        type:String,
    },
    sendOn:{
        type:Date,
        default:Date.now
    }
})

const Chats = mongoose.model('Chats',chatSchema)

module.exports = Chats