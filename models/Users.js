const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Name is required'],

    },
    email : {
        type: String,
        unique:[true,"Email Already Exists !!"],
        required:true,
    },
    password:{
        type:String,
        required: true,
    },
    registered:{
        type:String,
        default:()=>{
            new Date().toLocaleString()
        },
    }
});

const userModel = mongoose.model('User',userSchema);

module.exports=userModel;
