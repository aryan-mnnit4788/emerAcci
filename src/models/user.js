require('dotenv').config();
const mongoose= require('mongoose')
const Hospital= require('../models/hospital')
const Blood= require('../models/blood')
const validator= require('validator')
const bcrypt= require('bcryptjs')
const jwt= require('jsonwebtoken')

const secret="hbfvrhbfiuh"
const userSchema= new mongoose.Schema({

firstName:{
type: String,
required: true,
trim: true
},
lastName:{
    type: String,
    
    trim: true
    },

email:{
        type: String,
        unique: true,
        required: true,
        trim: true
        
    },
    password:{
        type: String,
        required:true,
        trim:true,
        minlength:7
    
    },
    
    location:{
        type:{
            type:String,
            enum: ['Point'],
            default:"Point"

        },
        coordinates: {
            type: [Number],
            required: true,
            index: '2dsphere'
          

        }
    },
    
        bloodGroup:{
            type:String,
            require:true,
            trim: true,
            validator(value)
            {    const type= value.toUpperCase()
                if(type=='A+'||type=='A-'||type=='B-'||type=='B+'||type=='AB+'||type=='AB-'||type =='O+'||type=='O-')
                {
                    console.log('blood group is correct')
                }
                else throw new Error('Please enter a valid Blood group')

            }
        },

    
    tokens:[{
token:{
    type: String,
    required: true
}
    }],
    savedMessages:[{
        id:{
            type: String
           
        }
            }],
});

userSchema.index({location: "2dsphere"});


//----- virtual field for message--------
userSchema.virtual('messages', {
    ref: 'Message',
    localField: '_id',
    foreignField: 'owner'
})


//---adding virtual field for blood associated--''
userSchema.virtual('donationMessages',{
    ref: 'Blood',
    localField: '_id',
    foreignField: 'owner'
})








userSchema.methods.getPublicProfile=async function(){
    const user= this;
    const userObject= user.toObject();
    delete userObject.password
    delete userObject.tokens
    //console.log(userObject.username)
    return userObject;
}



userSchema.methods.generateAuthToken= async function(){
    const user= this;
    const token= await jwt.sign({_id: user._id.toString()}, process.env.SECRET);
    user.tokens= user.tokens.concat({token});
    await user.save();
    return token;

}



userSchema.statics.findByCredentials= async (email,password)=>{
    const user= await User.findOne({email: email})
    if(!user){
        throw new Error('Unable to login')
    }
    const isMatch= await bcrypt.compare(password, user.password)
    if(!isMatch){
        throw new Error('Unable to login') 
    }

    return user;
}
userSchema.statics.searchNearbyUser= async (longitude,latitude)=>{

    const data = await User.find(
        {
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
              },
              $maxDistance: 30000       // in KM
            }
          }
        },
        {
          name: 1,
          address: 1,
          distanceField: { $multiply: [{ $meta: "geoNearDistance" }, 0.00062137119] } // Convert meters to miles
        }
      ).lean({ virtuals: true });
      
      return data;
      
}










userSchema.pre('save',async function(next){
const user= this;
if(user.isModified('password')){
    user.password= await bcrypt.hash(user.password,8)
}

    next();
})

const User= mongoose.model('User',userSchema);
module.exports= User
