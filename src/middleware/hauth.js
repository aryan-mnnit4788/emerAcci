const jwt= require('jsonwebtoken')
const Hospital= require('../models/hospital')

const auth= async (req,res,next)=>{

    try{
const token= req.header('Authorization').replace('Bearer ','')

const decoded= await jwt.verify(token,'secret')
const user= await Hospital.findOne({_id: decoded._id, 'tokens.token': token})
if(!user){
throw new Error();
}
req.token= token;
req.user= user;
next();

    } catch(e){
res.status(401).send({error: 'Please Authenticate'})
    }

}

module.exports= auth;