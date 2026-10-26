import dns from "dns"
dns.setServers(['8.8.8.8','8.8.4.4'])
import {app} from "./app.js"
import dotenv from 'dotenv' //! ispe dhyan do, dotenv ko import karne ka tarika
//import mongoose from "mongoose";
//import { DB_NAME } from "./constants.js";
import connectDB from './db/index.js';
dotenv.config({
    path: './.env'
})
connectDB()
.then(()=>{
    app.listen(process.env.PORT, ()=>{
        console.log(`Server connected at port ${process.env.PORT}`);
    })

    app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
    })
})
.catch((error)=>{
    console.log("MONGO db connection error: ",error);
})
/*
; async function connectDB(){
    try{
        await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)

        app.on("error", ()=>{
            console.log("ERROR: ",error);
            throw error
        })
        app.listen(process.env.PORT, ()=>{
            console.log(`app is listening on port ${process.env.PORT}`)
        })
    }
    catch(error){
        console.error("ERROR: ",error);
    }
}*/
