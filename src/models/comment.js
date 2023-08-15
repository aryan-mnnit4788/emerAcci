const mongoose=require('mongoose')
const commentSchema=new mongoose.Schema({
         text:{
            type: String,
            trim: true,
            require: true
         },
         post_id:{
               type: mongoose.Schema.Types.ObjectId,
               ref:'Post'
         },
         owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
         },
         owner_name:{
                   type: String,
                   require: true
         },
         createdAt: { type: Date, default: Date.now}


})
commentSchema.methods.getPublicComment= function(){
   const comment=this
   const commentObject=comment.toObject()
   delete commentObject.owner_id
   delete commentObject.post_id
   delete commentObject._id
   return commentObject
}

const Comment=mongoose.model('Comment',commentSchema)
module.exports=Comment