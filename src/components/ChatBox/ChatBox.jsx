import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";
import upload from "../../lib/upload";

const ChatBox = () => {
  const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible, isUserOnline, setIsUserOnline, lastSeenTime, setLastSeenTime } =
    useContext(AppContext);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            text: input,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });

        setInput(""); 
      }
    } catch (error) {
      toast.error(error.message);
    }
    setInput("");
  };

  const sendImage = async (e) => {
    try {
      const fileUrl = await upload(e.target.files[0]);

      if (fileUrl && messagesId) {
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
          }),
        });

        const userIDs = [chatUser.rId, userData.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = doc(db, "chats", id);
          const userChatsSnapshot = await getDoc(userChatsRef);

          if (userChatsSnapshot.exists()) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === messagesId
            );
            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();
            if (userChatData.chatsData[chatIndex].rId === userData.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await updateDoc(userChatsRef, {
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const convertTimestamp = (timestamp) => {
  let date = timestamp.toDate();
  let hour = date.getHours();
  let minute = date.getMinutes();

  minute = minute < 10 ? "0" + minute : minute;

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12; 

  return hour + ":" + minute + " " + ampm;
};


  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        const data = res.data();
        
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages.reverse());
        } else {
          setMessages([]); // 
        }
      });
      return () => {
        unSub();
      };
    }
  }, [messagesId, setMessages]);
  

  return chatUser ? (
    <div className={`chat-box ${chatVisible?"":"hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}
          { Date.now()-chatUser.userData.lastSeen <= 7000 ? <img className="dot" src={assets.green_dot} alt="" /> : null } 
        </p>
        <h3>
          {isUserOnline ? (
            <>
              <img src={assets.green_dot} className='dot' alt="" />
              <small style={{ display: 'block', fontSize: '0.8em', color: 'gray' }}>
                Online
              </small>
            </>
          ) : (
            <>
              <small style={{ display: 'block', fontSize: '0.8em', color: 'gray' }}>
                {lastSeenTime}
              </small>
            </>
          )}
          
        </h3>
        
        <img src={assets.help_icon} className="help" alt="" />
        <img onClick={()=>setChatVisible(false)} src={assets.arrow_icon} className="arrow" alt="" />
      </div>

      <div className="chat-msg">
  {Array.isArray(messages) && messages.length > 0 ? (
    messages.map((msg, index) => (
      <div
        key={index}
        className={msg.sId === userData.id ? "s-msg" : "r-msg"}
      >
        {msg.image ? (
          <img className="msg-img" src={msg.image} alt="" />
        ) : (
          <p className="msg">{msg.text}</p>
        )}

        <div>
          <img
            src={
              msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar
            }
            alt=""
          />
          <p className="time">{convertTimestamp(msg.createdAt)}</p>
        </div>
      </div>
    ))
  ) : (
    <p>No messages to show</p>
  )}
</div>



      <div className="chat-input">
        <input
          onChange={(e) => setInput(e.target.value)}
          value={input}
          type="text"
          placeholder="Send a message"

          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
        />
        <input
          onChange={sendImage}
          className="input-p"
          type="file"
          id="image"
          accept="image/png, image/jpeg"
          hidden
        />
        <label htmlFor="image">
          <img src={assets.gallery_icon} alt="" />
        </label>
        <img onClick={sendMessage} src={assets.send_button} alt="" />
      </div>
    </div>
  ) : (
    <div className={`chat-welcome ${chatVisible?" " : "hidden"}`}>
      <img src={assets.logo_big} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;  


// New Code //

