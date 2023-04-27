const express= require('express')
const { findById } = require('./models/user')
require('./mongoose')
const User= require('./models/user')
const userRouter= require('./routers/user')
const app= express()




app.use(express.json())
app.use(userRouter)






app.listen(3000, ()=>{
    console.log('app is listening at port 3000')
})