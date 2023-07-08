require('dotenv').config();
const express= require('express');
const auth= require('../middleware/auth')
const router =new express.Router();
const User= require('../models/user')
const Hospital= require('../models/hospital')
const Message= require('../models/message')
const Blood=require('../models/blood')
const jwt= require('jsonwebtoken');
const { findById } = require('../models/user');
const multer= require('multer')


///////////////////////////multer setup/////////////


const multerStorage= multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'../public/files');
    },
    filename: (req,file,cb)=>{
        const ext= file.mimetype.split('/')[1]
        cb(null, `admin-${file.fieldname}-${Date.now()}.${ext}`)
    }
});

const multerFilter= (req,file,cb)=>{
    if(file.mimetype.split('/')[1] === 'jpeg' || file.mimetype.split('/')[1] === 'jpg' || file.mimetype.split('/')[1] === 'png'){
        cb(null,true);
    }
    else{
        cb(new Error('Not a suitable file type',false))
    }
};

const upload = multer({
storage: multerStorage,
fileFilter: multerFilter

});







//home

router.get('/users/home',auth,async (req, res)=>{
    console.log(process.env.NAME)
    res.render('userHome');
})


// nearby blood Bank

router.get('/users/nearbyBloodBanks',auth,async (req,res)=>{
    const user=req.user;
    const longitude= user.location.coordinates[0];
    const latitude= user.location.coordinates[1];
    
    const data= await Hospital.searchNearbyHospitals(longitude,latitude);
console.log(data)
    let allHospitals=[];
    var a;
   
    for (const d of data) {
        //console.log(d.hospitalName)
        //console.log(d.location)

        if(d){
            const hospital=await Hospital.findById(d._id)
       
       const a = {
         hospitalName: hospital.hospitalName,
         longitude: hospital.location.coordinates[0],
         latitude: hospital.location.coordinates[1],
         hospitalId: d._id.toString()
       };
       allHospitals = allHospitals.concat(a);
       
     }
    }
    //console.log(allHospitals)
//return res.send(allHospitals);
res.render('nearbyBloodBanks',{allHospitals})

    
})


// signup get
router.get('/users/signup',async (req, res)=>{
    try{
    const t= req.cookies.jwtToken;
    if(t){
        console.log(t)
        
        //const t= req.header('Authorization').replace('Bearer ','');
        
        
        const decoded= await jwt.verify(t,process.env.SECRET);
        const user= await User.findOne({_id: decoded._id, 'tokens.token': t})
        
        if(user){
           
            return res.redirect('/users/home');
    
        }
    }
    res.render("userSignup");
    } catch(e){
        console.log(e)
        res.status(400).send(e);
    }
})







// login get route

router.get('/users/login',async (req, res)=>{
    
    try{
        const t= req.cookies.jwtToken;
        if(t){
        console.log(t)
        
        //const t= req.header('Authorization').replace('Bearer ','');
        
        
        const decoded= await jwt.verify(t,process.env.SECRET);
        const user= await User.findOne({_id: decoded._id, 'tokens.token': t})
        
        if(user){
           
            return res.redirect('/users/home');
    
        }
    }
        
   res.render('userSignin');
        
    
    
    } catch (e){
        console.log(e)
        res.status(400).send(e);
    }
    

    
    })


// help page

router.get('/users/help',auth,(req,res)=>{
    res.render('helpPage')

})


//blood-need page

router.get('/users/blood_need',auth,(req,res)=>{
    res.render('blood_needPage');

})



// update get page

router.get('/users/update/me',auth,async (req,res)=>{

    res.render("userUpdate");
    
    
    })
    







///////////////////////////////// get all accepted blood donations request

router.get('/users/savedBloodMessages',auth,async (req,res)=>{
    try{
        
    const a=req.user.savedMessages
    let allMessages=[];
    for(const i of a){
        const message=await Blood.findOne({_id:i.id});
        if(message){
await message.populate('owner');


const x = {
name: message.owner.firstName + " " + message.owner.lastName,
ownerId: message.owner,
longitude: message.longitude,
latitude: message.latitude,
phoneNumber: message.phoneNumber,
bloodGroup: message.bloodGroup,
message: message.content,
address: message.siteAddress,
messageId: message._id.toString()
};
allMessages = allMessages.concat(x);



    }
}

res.render('savedBloodMessages',{allMessages});


} catch(e){
    console.log(e);
    res.status(400).send(e)

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
               
                sort: {
                    createdAt : -1
                }
            }
        });
    const data=user.messages;


    let allMessages=[];
    var a;
   
    for (const d of data) {
        if(d){
       await d.populate('owner')
       const a = {
         name: d.owner.firstName + " " + d.owner.lastName,
         ownerId: d.owner,
         longitude: d.longitude,
         latitude: d.latitude,
         phoneNumber: d.phoneNumber,
         message: d.content,
         address: d.siteAddress,
         status: d.status,
         messageId: d._id.toString()
       };
       allMessages = allMessages.concat(a);
       
     }
    }
console.log(allMessages)
     res.render('userMessages',{allMessages});


       
        
        }
        catch(e){
            console.log(e);
            res.status(400).send(e.message);
        }
    })





// ----- listing all blood donation messages to a user ------
router.get('/users/donationMessages',auth,async (req,res)=>{
    const userBloodGroup=req.user.bloodGroup
     
    
     if(userBloodGroup=='O-')
     {
                 try{                                         
         const data= await Blood.find({status: "Not Accepted", 'nearby.places':req.user._id}).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});


        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
 
     } 
     else if(userBloodGroup=='O+')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['AB+', 'A+','B+','O+'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     } 
     else if(userBloodGroup=='A-')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['A+','O-','AB+','AB-'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     }  
     else if(userBloodGroup=='A+')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['A+'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     }
     
     




     else if(userBloodGroup=='B-')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['AB+', 'AB-','B+','B-'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     } 
     
     



     else if(userBloodGroup=='B+')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['B+','AB+'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     } 
     else if(userBloodGroup=='AB-')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['AB+', 'AB-'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     }  
     
     

     else if(userBloodGroup=='AB+')
     {
        try{
         const bloodfinder={
          status: "Not Accepted",
          'nearby.places':req.user._id,
          bloodGroup: { $in: ['AB+'] }
         }
         const data= await Blood.find(bloodfinder).sort({_id: -1});
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
              bloodGroup: d.bloodGroup,
              message: d.content,
              address: d.siteAddress,
              messageId: d._id.toString()
            };
            allMessages = allMessages.concat(a);
            
          }

          res.render('incomingBloodDonationMessages',{allMessages});

          
        } catch(e){
            console.log(e);
            res.status(400).send(e);
        }
     }  

     
 
    
    
 })
 
 
 ////------- Listing all blood donation requests posted by a user ---------


router.get('/users/yourDonationMessages',auth, async (req,res)=>{
    try{
        const user= await User.findOne({_id:req.user._id})
    //const data=await Message.find({owner:req.user._id}).sort({_id:-1})
    await user.populate({
        path: 'donationMessages',
        options: {
            
            sort: {
                createdAt : -1
            }
        }
    });
    const data=user.donationMessages;
    let allMessages=[];
    var a;
   
    for (const d of data) {
        if(d){
       await d.populate('owner')
       const a = {
         name: d.owner.firstName + " " + d.owner.lastName,
         ownerId: d.owner,
         longitude: d.longitude,
         latitude: d.latitude,
         phoneNumber: d.phoneNumber,
         bloodGroup: d.bloodGroup,
         message: d.content,
         status: d.status,
         address: d.siteAddress,
         messageId: d._id.toString()
       };
       allMessages = allMessages.concat(a);
       
     }
    }

     res.render('userBloodMessages',{allMessages});

    
    
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
        res.cookie("jwtToken",token,{
            expires: new Date(Date.now()+25892000000),
            httpOnly: true
        
        });
        console.log(user);
        res.redirect("/users/home");
        
       // res.status(201).send({user:await user.getPublicProfile(),token})
    } catch(e){
        console.log(e);
        res.status(400).send(e);
    }
    
   
})


// user dashbord

router.get('/users/me',auth,async (req,res)=>{
    try{
   const data=await req.user.getPublicProfile()
   //return res.send(data)
   
    res.render('userProfile',data);
    }
   catch(e){
        res.status(400).send(e)
   }
        
})




router.get('/users/:id',async(req,res)=>{
    try{
const user=await User.findById(req.params.id);
if(!user)
{
    console.log("No user found");
    return res.status(404).send("Not found")
}
const data=await user.getPublicProfile()
res.render('userProfile',data);
    }
    catch(err){
        console.log('error',err)
        return res.status(400).send(err)
    }
})


//dashbord update

router.post('/users/update/me',auth,async (req,res)=>{
    const updates= Object.keys(req.body);
    const allowedUpdates= ['firstName','lastName','password','location'];
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
res.redirect('/users/home');

    }
    catch(e){
        res.status(400).send(e);
    }
})









//// login 




router.post('/users/login',async (req,res)=>{

try{
   
    
    
const user= await User.findByCredentials(req.body.email,req.body.password)

 const token= await user.generateAuthToken();
    
 res.cookie("jwtToken",token,{
    expires: new Date(Date.now()+25892000000),
    httpOnly: true

});
console.log(user);
res.redirect("/users/home");


//res.status(200).send({user:await user.getPublicProfile(),token})

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



router.post('/users/help',auth,upload.single('avatar'),async (req,res)=>{
    try{
    
    const data= await Hospital.searchNearbyHospitals(req.body.longitude,req.body.latitude);
    const a=[];
    
    const message= new Message({
        owner: req.user._id,
        content: req.body.content,
        nearby: a,
        siteAddress: req.body.place,
        phoneNumber: req.body.phoneNumber,
        longitude: req.body.longitude,
        latitude: req.body.latitude,
        fileName: req.file.filename
        


    })
    data.forEach((d)=>{
        message.nearby=message.nearby.concat({places: d._id.toString(),distance: d.distanceField})
    })
    
    await message.save();
    
console.log(message);
     res.redirect('/users/home');
    }
     catch(e){
        console.log(e)
        res.status(400).send(e);
     }
 })


/// delete particular message
router.post('/users/message/delete/:id',auth,async (req,res)=>{
    try{
    const messageId= req.params.id
    const message= await Message.findOneAndDelete({_id:messageId});
    res.redirect('/users/yourMessages');
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})

/////////////////////////////////////////// BLOOD /////////////////////////////////////////////////////////









//------posting blood request---------//


router.post('/users/blood_need',auth,async (req,res)=>{
    try {
      const data=await User.searchNearbyUser(req.body.longitude,req.body.latitude)
     
      const new_blood=new Blood({
        owner: req.user._id,
        bloodGroup:req.body.bloodGroup,
        nearby:[],
        siteAddress:req.body.place,
        content:req.body.content,
        phoneNumber: req.body.phoneNumber,
        longitude: req.body.longitude,
        latitude: req.body.latitude

        
      })  
      const nearbyUsers=data.filter((d)=>req.user._id.toString() !== d._id.toString())
 
      


      nearbyUsers.forEach((d)=>{
          new_blood.nearby=new_blood.nearby.concat({places: d._id.toString(),distance: d.distanceField})
      })
      new_blood.save()
      res.redirect('/users/home')
    }
    catch (e){
        console.log(e);
        res.status(400).send(e)

    }

})






//---- Ignoring a particular donation request -------


router.post('/users/donationMessages/ignore/:messageId',auth, async (req,res)=>{
    try{
        const userId=req.user._id;
       
const messageId=req.params.messageId
const message= await Blood.findOne({_id: messageId});


message.nearby= message.nearby.filter((p)=>  p.places !== userId.toString())


   
    await message.save();
    

    
    res.redirect('/users/donationMessages')

}
    catch(e){
        console.log(e);
        res.status(400).send(e);
    }


})

//------Accepting a particular donation request ------


router.post('/users/donationMessages/accept/:messageId',auth, async (req,res)=>{
    try{
    const messageId=req.params.messageId
    const message= await Blood.findOne({_id: messageId});
    const user=req.user
    message.status= "Accepted By "+req.user.firstName+" "+req.user.lastName;
    user.savedMessages= user.savedMessages.concat({id:message._id});
        await user.save();
    await message.save();
    console.log(user);
    res.redirect('/users/donationMessages')
    }
    catch(e){
        console.log(e);
        res.status(400).send(e);
    }

})



////------- delete your particular bloodDonation Message---------------

router.post('/users/donationMessage/delete/:id',auth,async (req,res)=>{
    try{
    const messageId= req.params.id
    const message= await Blood.findOneAndDelete({_id:messageId});
    res.redirect('/users/yourDonationMessages');
    } catch(e){
        console.log(e)
        res.status(400).send(e)
    }
})




////// remove a particular accepted blood donation request

router.post('/users/savedBloodMessages/delete/:messageId',auth,async (req,res)=>{
    try{
     const messageId=req.params.messageId
     const user=req.user
     user.savedMessages= user.savedMessages.filter((d)=>{
        return d.id!==messageId;
    })
    
    await user.save();
    console.log('Success')
    res.redirect('/users/savedBloodMessages')
    
    
    
    
    
    } catch(e){
        console.log(e);
            res.status(400).send(e) 
    }
    
    
    
        })
    





module.exports= router;