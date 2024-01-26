import axios from 'axios'
import React, { useEffect, useState } from 'react'

const Chatpage = ()=> {
    const [chats,setChat] = useState([]);
    const fetchChats = async ()=>{
        const data = await axios.get("/api/chat");

        setChat(data);
    };
    useEffect(()=>{
        fetchChats();
    },[]);
  return (
    <div>
        {chats.map((chat)=> (
            <div>{chat.chatName}</div>
        ))}
    </div>
  )
}

export default Chatpage;