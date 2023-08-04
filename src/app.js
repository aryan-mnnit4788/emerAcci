require('dotenv').config();
const express= require('express')
const path= require('path')
const hbs = require('hbs')
const { findById } = require('./models/user')
require('./mongoose')
const User= require('./models/user')
const Hospital= require('./models/hospital')
const Blood= require('./models/blood')
//const bloodRouter=require('./routers/blood')
const hospitalRouter= require('./routers/hospital')
const postRouter=require('./routers/post')
const userRouter= require('./routers/user')
const bodyParser = require("body-parser");
const cookieParser= require('cookie-parser')

const app= express()
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());


//Define paths for express config
const publicDirectoryPath= path.join(__dirname, '../public')
const viewsPath= path.join(__dirname,'../templates/views')
const partialsPath= path.join(__dirname,'../templates/partials')

//Setup handlebars engine and views location

app.set('view engine', 'hbs')
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)

// Setup static directory to serve

app.use(express.static(publicDirectoryPath))


///////////////

app.use(express.json())
app.use(userRouter)
app.use(hospitalRouter)
//app.use(bloodRouter)
app.use(postRouter)








app.listen(3000, ()=>{
    console.log('app is listening at port 3000')
})