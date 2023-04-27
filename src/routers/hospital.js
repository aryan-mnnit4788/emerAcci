const express= require('express');
const auth= require('../middleware/hauth')
const router =new express.Router();
const Hospital= require('../models/hospital')
const Message= require('../models/message')
const jwt= require('jsonwebtoken');
const { findById } = require('../models/hospital');
const mongoose= require('mongoose')







router.get('/hospitals/login',async (req, res)=>{
    
    try{
        const x= req.header('Authorization');
        console.log(x)
        if(x){
        const t= req.header('Authorization').replace('Bearer ','');
        
        
        const decoded= await jwt.verify(t,'secret');
        const user= await Hospital.findOne({_id: decoded._id, 'tokens.token': t})
        
        if(user){
           
            return res.send('Redirecting to home page');
    
        }
        }
        
   res.send('Login page');
        
    
    
    } catch (e){
        console.log(e)
        res.status(400).send(e);
    }
    

    
    })
    











router.post('/hospitals/signup',async (req, res)=>{

    const user= new Hospital(req.body)
    try{
        await user.save()
        const token= await user.generateAuthToken();
        res.status(201).send({user:await user.getPublicProfile(),token})
    } catch(e){
        res.status(400).send(e);
    }
    
   
})




router.get('/hospitals/me',auth,async (req,res)=>{
    try{
   
    res.send(await req.user.getPublicProfile());
    }
   catch(e){
        res.status(400).send(e)
   }
        
})





router.patch('/hospitals/me',auth,async (req,res)=>{
    const updates= Object.keys(req.body);
    const allowedUpdates= ['email','password','hospitalName'];
    const isValidOperation= updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send({error:'Invalid update'})
    }
    try{
const user= req.user;
if(!user){
    return res.status(404).send();
 }
updates.forEach((update)=>{
    user[update]= req.body[update];
})

await user.save();
res.send(user);

    }
    catch(e){
        res.status(400).send(e);
    }
})














router.post('/hospitals/login',async (req,res)=>{

try{
    const x=req.header('Authorization');
    console.log(x)
    if(x){
    const t= req.header('Authorization').replace('Bearer ','');
    
    
    const decoded= await jwt.verify(t,'secret');
    const user= await Hospital.findOne({_id: decoded._id, 'tokens.token': t})
    
    if(user){
        const token= await user.generateAuthToken();
        user.tokens= [];
        //await user.save();
        user.tokens= user.tokens.concat({token});
    await user.save();
        return res.status(200).send({user:await user.getPublicProfile(),token: token,message: 'Already loged in'})

    }
    }
    
const user= await Hospital.findByCredentials(req.body.email,req.body.password)

 const token= await user.generateAuthToken();
    

res.status(200).send({user:await user.getPublicProfile(),token})
} catch (e){
    console.log(e)
    res.status(400).send(e);
}



})






router.post('/hospitals/logout',auth,async (req,res)=>{

    const user= req.user;
    try{
    user.tokens= user.tokens.filter((token)=>{
        return token.token!==req.token;
    })
    await user.save();
    res.send('Successfully logout')

} catch(e){
    res.status(500).send(e);
}
})

router.post('/hospitals/logoutAll',auth,async (req,res)=>{

    const user= req.user;
    try{
    user.tokens= [];
    await user.save();
    res.send('Successfully logout from all devices')

} catch(e){
    res.status(500).send(e);
}
})


router.delete('/hospitals/me',auth,async (req,res)=>{
    try{
const user= req.user;
//await user.remove();
await Hospital.deleteOne({_id: user._id})
res.send('Successfully deleted')


    } catch(e){
        console.log(e)
        res.status(500).send(e);
    }

})

router.get('/hospitals/messages',auth,async (req,res)=>{
const data= await Message.find({status: "Not Accepted", 'nearby.places':req.user.id}).sort({_id: -1});
res.send(data);




})

router.post('/hospitals/messages/ignore/:messageId',auth, async (req,res)=>{
    try{
        const userId=req.user._id;
       
const messageId=req.params.messageId
const message= await Message.findOne({_id: messageId});


message.nearby= message.nearby.filter((p)=>  p.places !== userId.toString())


   
    await message.save();
    

    console.log(message);
    console.log(userId)
    res.send("Success")
}
    catch(e){
        console.log(e);
        res.status(400).send(e);
    }


})

router.post('/hospitals/messages/accept/:messageId',auth, async (req,res)=>{
    const messageId=req.params.messageId
    const message= await Message.findOne({_id: messageId});
    message.status= "Accepted By "+req.user.hospitalName+" hospital";
    await message.save();
    res.send(message)

})






module.exports= router;
