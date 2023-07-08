const mongoose=require('mongoose')
//const validator=require('validator')
const bloodSchema=new mongoose.Schema({
       
   


        bloodGroup:{
            type:String,
            require:true,
            trim: true,
            // validator(value)
            // {    const type= value
            //     if(type=='A+'||type=='A-'||type=='B-'||type=='B+'||type=='AB+'||type=='AB-'||type =='O+'||type=='O-')
            //     {
            //         console.log('blood group is correct')
            //     }
            //     else throw new Error('Please enter a valid Blood group')

            // }
        },

        owner:{
            type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
        },
    
    content:{
        type:String
        
    },
    nearby:[
        
       { places:
            {type: String,
        required: true,
        ref: 'User'
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
    },
    phoneNumber:{
        required:true,
        type: Number
    },
    longitude:{
        required:true,
        type: Number
    },
    latitude:{
        required:true,
        type: Number
    }
    
    
    
    
    },{timestamps:true});




bloodSchema.methods.getPublicData=async function(){
   const blood=this;
   const bloodobject=blood.toObject()
   delete bloodobject.nearby
   return bloodobject


}
const Blood=mongoose.model('Blood',bloodSchema)
module.exports=Blood
