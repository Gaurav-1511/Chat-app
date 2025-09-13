
import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";
import { io , userSocketMap } from "../server.js";

// get all user expect  the loggin user

export const getUserForSidebar = async (req,res)=>{
    try { 
        const userId = req.user._id;
        const filterUsers = await User.find({_id : {$ne : userId}}).select("-password");

        //count number of message not seen

        const unSeenMessages = {}
        const promises = filterUsers.map(async (user)=>{
            const messages = await Message.find({senderId : user._id , receiverId : userId,  seen : false})
            if(messages.length > 0)
            {
                unSeenMessages[user._id] = messages.length
            }

        })
        await Promise.all(promises);
        res.json({
            success : true ,
            users: filterUsers ,
            unSeenMessages
        })
    } catch (error) {
        console.log(error.message);
        res.json({
            success : false,
            message : error.message
        })
        
    }
}

//get all message for selected user

export const getMessages = async (req , res)=> {
    try {
        const { id : selectedUserId} = req.params;
        const myId = req.user._id;

        const message = await Message.find({
            $or :[
                {senderId : myId ,
                    receiverId : selectedUserId
                },
                {
                    senderId : selectedUserId,
                    receiverId : myId
                }
            ]
        })

        await Message.updateMany({senderId : selectedUserId , receiverId : myId} , {seen : true});
        res.json({success : true , message})
        
    } catch (error) {
         console.log(error.message);
        res.json({
            success : false,
            message : error.message
        })
    }
}

//api to mark message as seen using message id

export const markMessageSeen = async (req, res) => {
    try {
        const {id} = req.params;
        await Message.findByIdAndUpdate(id , {seen: true})
        res.json({success : true})
    } catch (error) {
        console.log(error.message)
        res.json({success : false , message : error.message})
    }
}

// send message to selected user

export const  sendMessage = async (req,res)=>{
    try {
        const{text,image} = req.body
        const receiverId = req.params.id;
        const senderId = req.user._id;

        let imageUrl;
        if(image){
          const UploadResponse = await cloudinary.uploader.upload(image)
          imageUrl = UploadResponse.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,image : imageUrl
        })
        // emit the new message to receiver's socket

        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId){
            io.to(receiverSocketId).emit("newMessage" , newMessage)
        }

        res.json({success : true , newMessage});


    } catch (error) {
        console.log(error.message)
        res.json({success : false , message : error.message})
    }
}