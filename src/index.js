const express=require("express")
const bodyparser=require("body-parser")
const route=require("./routes/route.js")
const multer=require("multer")
const app=express()


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(multer().any())

const mongoose=require("mongoose")

mongoose.connect("mongodb+srv://prakash:prakash@cluster0.4qxv0.mongodb.net/E-commerce?authSource=admin&replicaSet=atlas-13sjqg-shard-0&w=majority&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=true",{useNewUrlParser:true})
.then(()=>console.log("mongoose running and  connected"))
.catch(err=>console.log(err))

app.use("/",route)


app.listen(process.env.PORT || 3000,function(){
    console.log(`express port running` + (process.env.PORT || 3000))
})




