const mongoose= require('mongoose')
const validator= require('validator')


const messageSchema= new mongoose.Schema({
    owner:{
        type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
    },

content:{
    type:String,
    required: true
},
nearby:[
    
   { places:
        {type: String,
    required: true,
    ref: 'Hospital'
},
distance:{
    type:Number
}

}
],
status: {
    type: String,
    default: "Not Accepted"
},
siteAddress:{
    required:true,
    type: String
}




},{timestamps:true});



const Message= mongoose.model('Message',messageSchema);
module.exports= Message;