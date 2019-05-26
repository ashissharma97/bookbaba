const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    from:{
        type:String,
        required:true
    },
    ads:{
        type:Array,
        required:true
    },
    paymentPrice:{
        type:Number,
        required:true
    },
    payment_id:{
        type:String,
        required:true
    },
    request_id:{
        type:String,
        required:true
    },
    paymentDate:{
        type:Date,
        default:Date.now
    },
    dispatch:{
        type:Boolean,
        default:false
    },
    referece_no:{
        type:String,
    },
    admin:{
        type:String,
    }
})

const Payment = mongoose.model('Payment',paymentSchema)

module.exports = Payment