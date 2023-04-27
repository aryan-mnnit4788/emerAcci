const express= require('express')
const path= require('path')
const hbs = require('hbs')
const { findById } = require('./models/user')
require('./mongoose')
const User= require('./models/user')
const Hospital= require('./models/hospital')
const userRouter= require('./routers/user')
const hospitalRouter= require('./routers/hospital')
const app= express()


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








app.listen(3000, ()=>{
    console.log('app is listening at port 3000')
})