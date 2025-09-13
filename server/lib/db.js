import mongoose from "mongoose";

// function to connect to the mongodb database

export const connectDb = async ()=>{
    try{
        mongoose.connection.on('connected' , ()=> console.log("database is connected"));
        await mongoose.connect(`${process.env.MONGODB_URL}/chat-app`)
    }
    catch(error){
     console.log(error);
    }
}