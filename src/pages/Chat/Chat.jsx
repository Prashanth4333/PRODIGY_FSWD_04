import React, { useContext, useEffect, useState } from "react";
import "./Chat.css";
import LeftSideBar from "../../components/LeftSidebar/LeftSidebar";
import ChatBox from "../../components/ChatBox/ChatBox";
import RightSidebar from "../../components/RightSidebar/RightSidebar";
import { AppContext } from "../../context/AppContext";
import assets from "../../assets/assets";
const Chat = () => {
  const { chatData, userData } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    console.log("Chat Data:", chatData);
    console.log("User Data:", userData);

    if (chatData && userData ) {
      setLoading(false);
    }
  }, [chatData, userData]);

  return (
    <div className="chat">
      {loading ? (
        <>
        <p className="loading">Loading</p>
        <img src={assets.loading} alt="" />
        </>
      ) : (
        <div className="chat-container">
          <LeftSideBar />
          <ChatBox />
          <RightSidebar />
        </div>
      )}
    </div>
  );
};

export default Chat;
