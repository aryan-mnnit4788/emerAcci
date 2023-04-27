const express= require('express');
const auth= require('../middleware/auth')
const router =new express.Router();
const User= require('../models/user')
const Hospital= require('../models/hospital')
const Message= require('../models/message')
const jwt= require('jsonwebtoken');
const { findById } = require('../models/user');




// login get route

router.get('/users/login',async (req, res)=>{
    
    try{
        const x= req.header('Authorization');
        console.log(x)
        if(x){
        const t= req.header('Authorization').replace('Bearer ','');
        
        
        const decoded= await jwt.verify(t,'secret');
        const user= await User.findOne({_id: decoded._id, 'tokens.token': t})
        
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
    

// List your all messages


    router.get('/users/yourMessages',auth, async (req,res)=>{
        try{
            const user= await User.findOne({_id:req.user._id})
        //const data=await Message.find({owner:req.user._id}).sort({_id:-1})
        await user.populate({
            path: 'messages',
            options: {
                limit: 2,
                sort: {
                    createdAt : -1
                }
            }
        });
    
        res.send(user.messages)
        
        }
        catch(e){
            console.log(e);
            res.status(400).send(e.message);
        }
    })




//signup 


router.post('/users/signup',async (req, res)=>{

    const user= new User(req.body)
    try{
        await user.save()
        const token= await user.generateAuthToken();
        res.status(201).send({user:await user.getPublicProfile(),token})
    } catch(e){
        res.status(400).send(e);
    }
    
   
})


// user dashbord

router.get('/users/me',auth,async (req,res)=>{

   res.send(await req.user.getPublicProfile())
        
})



router.get('/users/:id',async(req,res)=>{
    try{
const user=await User.findById(req.params.id);
if(!user)
{
    console.log("No user found");
    return res.status(404).send("Not found")
}
res.status(202).send(user);
    }
    catch(err){
        console.log('error',err)
        return res.status(400).send(err)
    }
})


//dashbord update

router.patch('/users/me',auth,async (req,res)=>{
    const updates= Object.keys(req.body);
    const allowedUpdates= ['email','password'];
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









//// login 




router.post('/users/login',async (req,res)=>{

try{
    const x=req.header('Authorization');
    console.log(x)
    if(x){
    const t= req.header('Authorization').replace('Bearer ','');
    
    
    const decoded= await jwt.verify(t,'secret');
    const user= await User.findOne({_id: decoded._id, 'tokens.token': t})
    
    if(user){
        const token= await user.generateAuthToken();
        user.tokens= [];
        //await user.save();
        user.tokens= user.tokens.concat({token});
    await user.save();
        return res.status(200).send({user:await user.getPublicProfile(),token: token,message: 'Already loged in'})

    }
    }
    
const user= await User.findByCredentials(req.body.email,req.body.password)

 const token= await user.generateAuthToken();
    

res.status(200).send({user:await user.getPublicProfile(),token})
} catch (e){
    console.log(e)
    res.status(400).send(e.message);
}



})


// logout 



router.post('/users/logout',auth,async (req,res)=>{

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

/// logout from all devices

router.post('/users/logoutAll',auth,async (req,res)=>{

    const user= req.user;
    try{
    user.tokens= [];
    await user.save();
    res.send('Successfully logout from all devices')

} catch(e){
    res.status(500).send(e);
}
})


// delete account 


router.delete('/users/me',auth,async (req,res)=>{
    try{
const user= req.user;
//await user.remove();
await User.deleteOne({_id: user._id})
await Message.deleteMany({owner: user._id})
res.send('Successfully deleted')


    } catch(e){
        console.log(e)
        res.status(500).send(e);
    }

})






/// post help message



router.post('/users/help',auth,async (req,res)=>{
    try{
    const data= await Hospital.searchNearbyHospitals(req.body.longitude,req.body.lattitude);
    const a=[];
    
    const message= new Message({
        owner: req.user._id,
        content: req.body.content,
        nearby: a,
        siteAddress: req.body.place

    })
    data.forEach((d)=>{
        message.nearby=message.nearby.concat({places: d._id.toString(),distance: d.dist.calculated})
    })
    
    await message.save();
    

     res.send(message);}
     catch(e){
        res.status(400).send(e);
     }
 })


/// delete particular message
router.delete('/users/message/delete/:id',auth,async (req,res)=>{
    try{
    const messageId= req.params.id
    const message= await Message.findOneAndDelete({_id:messageId});
    res.send(message);
    } catch(e){
        console.log(e)
        rs.status(400).send(e)
    }
})






module.exports= router;