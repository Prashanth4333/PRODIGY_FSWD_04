import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import MessageReactions from "./MessageReactions"; // Import your new component
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
  const {
    userData,
    messagesId,
    chatUser,
    messages,
    setMessages,
    chatVisible,
    setChatVisible,
  } = useContext(AppContext);
  const [input, setInput] = useState("");
  const [selectedMessageId, setSelectedMessageId] = useState(null); // Track the message clicked
  const [activeMessage, setActiveMessage] = useState(null); // Add this line to define activeMessage

  const handleMessageClick = (messageId) => {
    if (selectedMessageId === messageId) {
      setSelectedMessageId(null); // Hide reactions if already showing
    } else {
      setSelectedMessageId(messageId); // Show reactions for the clicked message
    }
  };

  const handleReactionClick = (messageId) => {
    console.log("Clicked message ID:", messageId);
    setActiveMessage((prev) => (prev === messageId ? null : messageId)); // Toggle emoji picker on click
  };

  const handleReaction = async (messageId, emoji) => {
    try {
      const messageDocRef = doc(db, "messages", messagesId);
      const messageSnapshot = await getDoc(messageDocRef);
      const messageData = messageSnapshot.data();
  
      const updatedMessages = messageData.messages.map((msg) => {
        if (msg.id === messageId) {
          // If the same emoji is clicked again, remove the reaction
          if (msg.reactions && msg.reactions.includes(emoji)) {
            return {
              ...msg,
              reactions:msg.reactions.filter((reaction) => reaction !== emoji), // Remove the reaction
            };
          } else {
            // Add the new emoji or replace the old one
            return {
              ...msg,
              reactions: [emoji], // Only one reaction at a time
            };
          }
        }
        return msg; // Return unchanged message for others
      });

       // Sort the messages by the createdAt field after updating reactions
    const sortedMessages = updatedMessages.sort((a, b) => {
      return b.createdAt.seconds - a.createdAt.seconds; // Ensure messages are sorted by timestamp
    });
  
      await updateDoc(messageDocRef, { messages: sortedMessages });
      setMessages(sortedMessages);
      setActiveMessage(null);
    } catch (error) {
      toast.error(error.message);
    }
  };
  

  const sendMessage = async () => {
    try {
      if (input && messagesId) {
        const messageId = new Date().getTime(); // Generate a unique ID for each message
  
        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            id: messageId,  // Assign the unique message ID
            sId: userData.id,
            text: input,
            createdAt: new Date(),
            reactions: [],  // Initialize reactions as an empty array
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
        const messageId = new Date().getTime(); // Generate a unique ID for each image message

        await updateDoc(doc(db, "messages", messagesId), {
          messages: arrayUnion({
            id: messageId,
            sId: userData.id,
            image: fileUrl,
            createdAt: new Date(),
            reactions: [], // Initialize reactions as an empty array for images too
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
    // Check if the timestamp is a Firestore Timestamp
    if (timestamp && timestamp.toDate) {
      timestamp = timestamp.toDate(); // Convert to Date object
    } else if (typeof timestamp === "string") {
      // If it's a string, attempt to parse it
      timestamp = new Date(timestamp);
    } else {
      // If it's already a Date object, use it directly
      timestamp = new Date(timestamp);
    }

    let hour = timestamp.getHours();
    let minute = timestamp.getMinutes();
    minute = minute < 10 ? "0" + minute : minute;

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;

    return hour + ":" + minute + " " + ampm;
  };

  useEffect(() => {
    // Set user as online when chat is opened
    const setOnlineStatus = async () => {
      if (chatUser) {
        await updateDoc(doc(db, "users", userData.id), {
          isOnline: true,
          lastSeen: null, // Reset lastSeen when user is online
        });
      }
    };

    // Update the last seen status when the chat is closed
    const setLastSeenStatus = async () => {
      if (chatUser) {
        await updateDoc(doc(db, "users", userData.id), {
          isOnline: false,
          lastSeen: new Date(), // Set the current time as lastSeen
        });
      }
    };

    if (chatVisible) {
      setOnlineStatus();
    } else {
      setLastSeenStatus();
    }

    return () => {
      // Cleanup function to set the user as offline
      if (chatUser) {
        setLastSeenStatus();
      }
    };
  }, [chatVisible, chatUser, userData.id]);

  useEffect(() => {
    if (messagesId) {
      const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
        const data = res.data();

        if (data && Array.isArray(data.messages)) {
          // Sort messages by createdAt timestamp before setting them in state
          const sortedMessages = data.messages.sort((a, b) => {
            return b.createdAt.seconds - a.createdAt.seconds;
          });
          setMessages(sortedMessages); // Set sorted messages to state
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
    <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
      <div className="chat-user">
        <img src={chatUser.userData.avatar} alt="" />
        <p>
          {chatUser.userData.name}
          {chatUser.userData.isOnline ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : (
            <p className="last-seen">
              Last seen:{" "}
              {chatUser.userData.lastSeen
                ? convertTimestamp(chatUser.userData.lastSeen)
                : "N/A"}
            </p>
          )}
        </p>
        <img src={assets.help_icon} className="help" alt="" />
        <img
          onClick={() => setChatVisible(false)}
          src={assets.arrow_icon}
          className="arrow"
          alt=""
        />
      </div>

      <div className="chat-msg">
        {Array.isArray(messages) && messages.length > 0 ? (
          messages.map((msg) => (
            <div
              key={msg.id} //Use unique ID as the key
              className={msg.sId === userData.id ? "s-msg" : "r-msg"}
               // Show emojis on click
            >
              {msg.image ? (
                <img className="msg-img" src={msg.image} alt="Uploaded" onClick={() => handleReactionClick(msg.id)} />

              ) : (
                <p className="msg" onClick={() => handleReactionClick(msg.id)}>

                  {msg.text}
                </p>
              )}

             {/* Display reactions */}
             {msg.reactions && msg.reactions.length > 0 &&(
                <div className="reactions-display">
                  {msg.reactions.map((reaction, idx) => (
                    <span key={idx} className="reaction">{reaction}</span>
                  ))}
                </div>
              )}

              {/* Show reactions */}
              {activeMessage === msg.id && (
                <MessageReactions
                  messageId={msg.id}
                  onReactionClick={handleReaction}
                />
              )}

              <div>
                <img
                  src={
                    msg.sId === userData.id
                      ? userData.avatar
                      : chatUser.userData.avatar
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
    <div className={`chat-welcome ${chatVisible ? " " : "hidden"}`}>
      <img src={assets.logo_big} alt="" />
      <p>Chat anytime, anywhere</p>
    </div>
  );
};

export default ChatBox;
