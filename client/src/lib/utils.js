export function messageTime(date){
    return new Date(date).toLocaleTimeString({
        hour:"2-digit",
        minute:"2-digit",
        
    })

}