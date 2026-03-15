import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()
const connect = mongoose.connect(process.env.MONGO_URI)

connect
    .then(()=>{
        console.log("database connected")
    })
    .catch((e)=>{
        console.log("Database error",e)
    })

export default connect