const express=require('express')
// require('../db/mongo')
const hauth=require('../middleware/hauth')
const auth=require('../middleware/auth')
const User=require('../models/user')
//support file uploads// uploading its binary data
const multer=require('multer')
const {Post,Image}=require('../models/post')
const Comment=require('../models/comment')
const fs=require('fs')
//const jwt=require('jsonwebtoken')
const router= new express.Router()


const upload=multer({
    // dest : 'avatar',
    storage: multer.diskStorage({}),
    limits:{
        //sets the max file size allowed in bytes//
        fileSize:10000000,
        
    },
    //cb is a callback function in multer 
    fileFilter(req,file,cb){

        //   $ shows the end of word // 
        if(!file.originalname.match(/\.(doc|docx|pdf|jpg|png|jpeg)$/))
        {
            return cb(new Error('file must be a doc pdf jpg'))
        }   
               //for throwinf error
            //  cb(new Error('file must be a pdf'))
            //for accepting upload it is TRUE
              cb(undefined,true)
            //  cb(undefined,false)

    }
})
// const errormiddleware=(req,res,next)=>{
//     throw new Error('from my middleware')
// }
//----avatar is a key to upload profile pic--//



const cloudinary=require('cloudinary').v2

cloudinary.config({ 
    cloud_name: 'dptzpowj9', 
    api_key: '263497211627211', 
    api_secret: '3K5G4vaTcIQNC1u3c5yf5VGzbWM' 
  });




router.get('/post/hospitals/advertise',hauth,async (req,res)=>{
    res.render('postAdvertisment');
})






  
router.post('/hospitals/advertise',hauth,upload.array('avatar',5),async  (req, res) =>{

     try{
        const files=req.files;
        console.log(req)
        const imgurls=[]
        for( const file of files)
        {     console.log(file.path)
               const result= await cloudinary.uploader.upload(file.path)
               
                const a=new Image({
                    url:result.secure_url,
                    cloudinary_id: result.public_id
                })
               imgurls.push(a)
               fs.unlinkSync(file.path)
        }
          
          
       //    console.log(req.file.path)
       //    const result= await cloudinary.uploader.upload(req.file.path)
          //const imgurl=result.secure_url
           // console.log(result)
           const ownerName=req.user.hospitalName
          const p= new Post({
           imgurls: imgurls,
           content: req.body.content,
           owner: req.user._id,
           ownerName:ownerName
   
          })
          await p.save()
          res.send(p)
            
     }  catch(e){
        res.send(e)
     }
        
   
    

})




router.get('/post/hospitals/allAdvertisements',hauth,async (req,res)=>{
    const posts= await Post.find({owner:req.user._id}).sort({_id: -1});
   
    res.render('hospitalAllAdvertisement',{posts});
});



router.post('/post/hospitals/advertise/:id',hauth,async (req,res)=>{
    try{

       const post= await Post.findByIdAndDelete(req.params.id)
       console.log(post.imgurls)
       for(const img of post.imgurls)
       {    console.log(img)
            const publicid=img.cloudinary_id
           await cloudinary.uploader.destroy(publicid, (error, result) => {
                if (error) {
                  console.log('Error:', error);
                } else {
                  console.log('Result:', result);
                }})
       }
        res.redirect('/post/hospitals/allAdvertisements')

    }catch(e){
        console.log(e)
         res.send("error")
    }
})


router.post('/post/users/comment',auth,async (req,res)=>{
   try{
   
   

    const newcomment=new Comment({

        text: req.body.text,
        post_id: req.body.postId,
        owner_id:req.user._id,
        owner_name:req.user.firstName+" "+req.user.lastName


     })
   await newcomment.save()
   console.log(req.body)
   res.send(newcomment)
   
   }catch(e){
    console.log(e);
    res.status(400).send(e)
   }

})


router.post('/post/hospitals/comment',hauth,async (req,res)=>{
    try{
    
    
 
     const newcomment=new Comment({
 
         text: req.body.text,
         post_id: req.body.postId,
         owner_id:req.user._id,
         owner_name:req.user.hospitalName
 
 
      })
    await newcomment.save()
    console.log(req.body)
    res.send(newcomment)
    
    }catch(e){
     console.log(e);
     res.status(400).send(e)
    }
 
 })



router.get('/post/allComments/:postId',async (req,res)=>{

const post_id=req.params.postId;
const comments= await Comment.find({post_id}).sort({_id: -1});
res.render('allComments',{comments});


})


router.get('/post/advertisement/advertise',auth,async(req,res)=>{
    
    try{
        const posts=await Post.find().sort({_id: -1});
        res.render('allPosts',{posts})
    } catch(e)
    {
        res.status(400).send("error")
    }


})
router.get('/advertisement/allPostWithComment',hauth,async (req,res)=>{
    console.log("yes")
    try{
        const allpost=await Post.find()
        const array=[]
        for(const post of allpost)
        {
            const allcomment=await Comment.find({post_id:post._id})
            
            const publicComment=[]
            for(const comment of allcomment)

            {   console.log(comment)
                 const p= await comment.getPublicComment()
                
                     publicComment.push(p)
            }

             array.push({post,publicComment})
        }
        res.send(array)
    }catch(e){
        res.send(e)

    }
})
router.get('/advertisement/advertise/:id',hauth,async(req,res)=>{


    try{
        const post=await Post.findById(req.params.id)
        
            const allcomment=await Comment.find({post_id:post._id})
            
            const publicComment=[]
            for(const comment of allcomment)

            {   //console.log(comment)
                 const p= await comment.getPublicComment()
                
                     publicComment.push(p)
            }

             
        
        res.send({post,publicComment})
    }catch(e){
        res.send(e)

    }
})
router.delete('/advertisement/comment/:id',hauth,async (req,res)=>{

   try{
        await Comment.findByIdAndDelete(req.params.id)
        res.send()
   }
   catch(e)
   {
    res.send(e)
   }

})














module.exports=router