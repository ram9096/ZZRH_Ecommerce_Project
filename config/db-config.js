import mongoose from "mongoose";

const connect = mongoose.connect('mongodb://localhost:27017/')

connect
    .then(()=>{
        console.log("database connected")
    })
    .catch(()=>{
        console.log("Databse error")
    })

export default connect