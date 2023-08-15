const express= require('express');
const multer= require('multer');
const auth= require('../middleware/auth')
const router =new express.Router();
const User= require('../models/user')
const Hospital= require('../models/hospital')
const Blood=require('../models/blood')
const jwt= require('jsonwebtoken');
const { findById } = require('../models/user');


/*const multerStorage= multer.diskStorage({
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

*/
////////////////////




//blood-need page

router.get('/users/blood_need',auth,(req,res)=>{
    res.render('blood_needPage');

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
});






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





