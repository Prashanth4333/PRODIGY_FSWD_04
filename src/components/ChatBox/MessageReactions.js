/*import React, { useState, useEffect } from "react";
import { arrayUnion, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../config/firebase";
import "./MessageReactions.css";

const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const App = () => {
  const [messages, setMessages] = useState(({msg.text}));
  const [activeMessage, setActiveMessage] = useState(null);

  const handleReaction = (messageId, reaction) => {
      setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, reaction } : msg
      ));
      setActiveMessage(null);
  };

}

export default MessageReactions; */


import React from "react";
import "./MessageReactions.css";

// Array of reactions you want to support
const reactions = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MessageReactions = ({ messageId, onReactionClick }) => {
  return (
    <div className="reactions-container">
      {reactions.map((reaction, index) => (
        <span
          key={index}
          className="reaction"
          onClick={() => onReactionClick(messageId, reaction)}
        >
          {reaction}
        </span>
      ))}
    </div>
  );
};

export default MessageReactions;
