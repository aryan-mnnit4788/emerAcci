require('dotenv').config();
const express= require('express');
const auth= require('../middleware/hauth')
const router =new express.Router();
const Hospital= require('../models/hospital')
const Message= require('../models/message')
const User= require('../models/user')
const jwt= require('jsonwebtoken');
const { findById } = require('../models/hospital');
const {sendConformationEmail}= require('../email/account')
const mongoose= require('mongoose')




/////////////////////////


router.get('/',(req,res)=>{
    res.render('homePage')
})



//////////////////////////////




router.get('/hospitals/messages',auth,async (req,res)=>{


    try{
const data= await Message.find({status: "Not Accepted", 'nearby.places':req.user._id}).sort({_id: -1});

 let allMessages=[];
 var a;

 for (const d of data) {
    await d.populate('owner')
    const a = {
      name: d.owner.firstName + " " + d.owner.lastName,
      ownerId: d.owner._id,
      longitude: d.longitude,
      latitude: d.latitude,
      phoneNumber: d.phoneNumber,
      message: d.content,
      address: d.siteAddress,
      messageId: d._id.toString(),
      fileName: d.fileName
    };
    allMessages = allMessages.concat(a);
    
  }






res.render('incomingHelpMessages',{allMessages});
    } 
    catch(e){
console.log(e);
res.status(400).send(e);

    }



})



////////////////////////////


router.get('/hospitals/update/bloodBank',auth,async (req,res)=>{

res.render('bloodBank')

})








//////////////////////////////////

router.get('/hospitals/savedMessages',auth,async (req,res)=>{
    try{
    const a=req.user.savedMessages
    console.log(a)
    let allMessages=[];
    for(const i of a){
        const message=await Message.findOne({_id:i.id});
        if(message){
await message.populate('owner');


const x = {
name: message.owner.firstName + " " + message.owner.lastName,
ownerId: message.owner._id,
longitude: message.longitude,
latitude: message.latitude,
phoneNumber: message.phoneNumber,
message: message.content,
address: message.siteAddress,
messageId: message._id.toString()
};
allMessages = allMessages.concat(x);



    }
}

res.render('savedMessages',{allMessages});
} catch(e){
    console.log(e);
    res.status(400).send(e)

}

})






// signup get
router.get('/hospitals/signup',async (req, res)=>{
    try{
        const t= req.cookies.jwtToken;
        if(t){
            console.log(t)
            
            //const t= req.header('Authorization').replace('Bearer ','');
            
            console.log(process.env.SECRET);
            const decoded= await jwt.verify(t,process.env.SECRET);
            const user= await Hospital.findOne({_id: decoded._id, 'tokens.token': t})
            
            if(user){
               
                return res.redirect('/hospitals/home');
        
            }
        }
        res.render("hospitalSignup");
        } catch(e){
            console.log(e)
            res.status(400).send(e);
        }
})
// home

router.get('/hospitals/home',auth,async (req, res)=>{
    res.render('hospitalHome');
})


//update
router.get('/hospitals/update/me',auth,async (req,res)=>{

res.render("hospitalUpdate");


})


router.get('/hospitals/login',async (req, res)=>{
    
    try{
        const t= req.cookies.jwtToken;
        if(t){
        console.log(t)
        
        
        const decoded= await jwt.verify(t,process.env.SECRET);
        const user= await Hospital.findOne({_id: decoded._id, 'tokens.token': t})
        
        if(user){
           
            return res.redirect('/hospitals/home');
    
        }
    }
    res.render("hospitalSignin");
        
        
   
        
    
    
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
        res.cookie("jwtToken",token,{
            expires: new Date(Date.now()+25892000000),
            httpOnly: true
        
        });
        console.log(user);
        res.redirect("/hospitals/home");
    } catch(e){
        console.log(e);
        res.status(400).send(e);
    }
    
   
})




router.get('/hospitals/me',auth,async (req,res)=>{
    try{
        
   const data=await req.user.getPublicProfile()
   console.log(data);
    res.render('hospitalProfile',data);
    }
   catch(e){
        res.status(400).send(e)
   }
        
})


////////////////


router.get('/hospitals/:id',async (req,res)=>{
    try{
       const user =await Hospital.findOne ({_id:req.params.id})
   const data=await user.getPublicProfile()
   console.log(data);
    res.render('hospitalProfile',data);
    }
   catch(e){
        res.status(400).send(e)
   }
        
})




//////////////////


router.post('/hospitals/update/me',auth,async (req,res)=>{
    const updates= Object.keys(req.body);
    const allowedUpdates= ['password','location'];
    const isValidOperation= updates.every((update)=> allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send({error:'Invalid update'})
    }
    try{
const user= req.user;
if(!user){
    return res.status(404).send();
    console.log("No user");
 }
updates.forEach((update)=>{
    user[update]= req.body[update];
})

await user.save();
console.log(user);
res.redirect('/hospitals/home');

    }
    catch(e){
        console.log(e)
        res.status(400).send(e);
    }
})














router.post('/hospitals/login',async (req,res)=>{

try{
   
    
const user= await Hospital.findByCredentials(req.body.email,req.body.password)

 const token= await user.generateAuthToken();
 res.cookie("jwtToken",token,{
    expires: new Date(Date.now()+25892000000),
    httpOnly: true

});
    
  res.redirect('/hospitals/home')

//res.status(200).send({user:await user.getPublicProfile(),token})
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
    console.log('Successfully logout')
    res.redirect('/hospitals/login')

} catch(e){
    res.status(500).send(e);
}
})

router.post('/hospitals/logoutAll',auth,async (req,res)=>{

    const user= req.user;
    try{
    user.tokens= [];
    await user.save();
    console.log('Successfully logout from all devices')
    res.redirect('/hospitals/login')

} catch(e){
    res.status(500).send(e);
}
})


router.delete('/hospitals/me',auth,async (req,res)=>{
    try{
const user= req.user;
//await user.remove();
await Hospital.deleteOne({_id: user._id})
console.log('Successfully deleted')
res.redirect('/hospitals/signup')


    } catch(e){
        console.log(e)
        res.status(500).send(e);
    }

})

/////////////////////////////////////////

router.post('/hospitals/messages/ignore/:messageId',auth, async (req,res)=>{
    try{
        const userId=req.user._id;
       
const messageId=req.params.messageId
const message= await Message.findOne({_id: messageId});


message.nearby= message.nearby.filter((p)=>  p.places !== userId.toString())


   
    await message.save();
    

    //console.log(message);
    //console.log(userId)
    console.log('Success');
    
    res.redirect('/hospitals/messages')
}
    catch(e){
        console.log(e);
        res.status(400).send(e);
    }


})

router.post('/hospitals/messages/accept/:messageId',auth, async (req,res)=>{
    try{
        const messageId=req.params.messageId
        const message= await Message.findOne({_id: messageId});
        const user=await Hospital.findOne({_id:req.user._id});
        await message.populate('owner')
        message.status= "Accepted By "+req.user.hospitalName+" hospital";
        user.savedMessages= user.savedMessages.concat({id:message._id});
        await user.save();
        await message.save();

        
        await sendConformationEmail(message.owner.email,message.owner.firstName,req.user.hospitalName)

        console.log(user);
        res.redirect('/hospitals/messages')
        } catch(e){
            console.log(e);
            res.status(400).send(e)
        }
    
    })
    
    

    router.post('/hospitals/messages/delete/:messageId',auth,async (req,res)=>{
try{
 const messageId=req.params.messageId
 const user=req.user
 user.savedMessages= user.savedMessages.filter((d)=>{
    return d.id!==messageId;
})

await user.save();
console.log('Success')
res.redirect('/hospitals/savedMessages')





} catch(e){
    console.log(e);
        res.status(400).send(e) 
}



    })


///////////////blood bank update

router.post('/hospitals/update/bloodBank',auth,async (req,res)=>{
    try{
    const user=req.user;
    user.bloodBank=req.body;
    await user.save();
    console.log(user);
    res.status(200).send('Success')
    } catch(e){
        console.log(e);
        res.status(400).send(e);
    }
})





module.exports= router;
