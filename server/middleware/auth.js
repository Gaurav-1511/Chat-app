//middleware to protect routes

import User from "../models/User.js";
import jwt from 'jsonwebtoken'

export const protectRoute = async (req , res , next)=>{
    try{
        const token = req.headers.token;
         if(!token){
            return res.json({
                success : false ,
                message : "User Not Found",
            });
        }

        const deCode = jwt.verify(token , process.env.JWT_SECRET_KEY)

        const user = await User.findById(deCode.userId).select("-password");
        if(!user){
            return res.json({
                success : false ,
                message : "User Not Found",
            });
        }
         req.user = user;
        next();     //controller function
    } catch(error){
        console.log(error.message);
        res.json({
            success: false ,
            message : error.message
        });
    }
}