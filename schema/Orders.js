const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
    Ad_id:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Ads'
    },
    from:{
        type:String,
        required:true
    },
    requestedTo:{
        type:String,
    },
    deliveryAddress:{
        type:String,
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
    orderedOn:{
        type:Date,
        default:Date.now
    },
    status:{
        type:String,
        default:'pending'
    }
})

const Orders = mongoose.model('Order',orderSchema)

module.exports = Orders