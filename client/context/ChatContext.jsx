import { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";



export const ChatContext = createContext();



export const ChatProvider = ({children})=>{

     const [messages , setMessages] = useState([]);
     const [users , setUsers] = useState([]);
     const [selectUser ,setSelectUser] = useState(null);
     const [unseenMessages , setUnseenMessages] = useState({}) 
     
     const {socket , axios} = useContext(AuthContext);

     // function to get all users for sidebar

     const getUsers = async ()=>{
        try {
            const {data } = await axios.get("/api/messages/users");
            if(data.success){
                setUsers(data.users)
                setUnseenMessages(data.unseenMessages || {});

            }
            
        } catch (error) {
            toast.error(error.message)
            
        }
     }

     // function to get messages for selected user

     const getMessages = async (userId) =>{
        try {
            const {data} = await axios.get(`/api/messages/${userId}`);
            if(data.success){
                setMessages(data.messages)
            }
        } catch (error) {
             toast.error(error.message)
        }
     }

     // function to send message to selected user

     const sendMessage = async (messagesData) =>{
        try {
            const {data} = await axios.post (`/api/messages/send/${selectUser._id}` , messagesData)
            if(data.success){
                setMessages((prevMessages = [])=>[...prevMessages , data.newMessage])
            } else{
                 toast.error(<error className="messages"></error> || "failed to send message")
            }
        } catch (error) {
             toast.error(error.message)
        }
     }

     // function to subscribe to message for select user

     const subscribeToMessages = async ()=>{
        if(!socket) return;

        socket.on("newMessage" , (newMessage=>{
            if(selectUser && newMessage.senderId === selectUser._id){
                newMessage.seen = true ;
                setMessages((prevMessages= [])=>[...prevMessages , newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`)
            }
            else{
                setUnseenMessages((prevUnseenMessages)=>({
                    ...prevUnseenMessages, 
                    [newMessage.senderId] :
                     prevUnseenMessages[newMessage.senderId] ? 
                     prevUnseenMessages[newMessage.senderId] + 1 : 1,
                }));
            }
        }))
     }

     // function  to unsuscribe from messages

     const unsubscribeFromMessages = ()=>{
        if(socket) socket.off("newMessage");
     }

     useEffect(()=>{
        subscribeToMessages();
        return ()=> unsubscribeFromMessages();
     } , [socket , selectUser])

     const value = {
        messages,
        users,
        selectUser,
        getUsers,
        getMessages,
        sendMessage,
        setSelectUser,
        setUnseenMessages,
        unseenMessages

    }
    return(
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    )
}