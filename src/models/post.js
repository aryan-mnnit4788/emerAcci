const mongoose=require('mongoose')

const imageSchema= new mongoose.Schema({
    url: { type: String},
    cloudinary_id:{ type: String}
})
   
    

const postSchema=new mongoose.Schema({
    content :{
        type: String,
          trim: true
        
    },
    imgurls: [imageSchema]
    ,
   
    owner :{
       type : mongoose.Schema.Types.ObjectId,
       ref: 'Hospital'

    },
    ownerName:{type:String},
    createdAt: {
        type: Date,
        default: Date.now
    }
})


postSchema.methods.getPublicPost= function(){
    const post=this
    const postObject=post.toObject()
    delete postObject.owner
    return userObject
 }

const Post=mongoose.model('Post',postSchema)
const Image=mongoose.model('Image',imageSchema)
module.exports={Post,Image}