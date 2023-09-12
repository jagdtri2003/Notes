const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type:String,
        required:[true,"Title is required"],
    },
    content:{
        type : String ,
        required:[true,"Content is required"]
    },
    time:{
        type:String,
        default:new Date().toLocaleString()
    },
    email:{
        type:String,
        required:true,
        lowercase:true
    }
});

const noteModel = mongoose.model("Note",noteSchema);

module.exports=noteModel;