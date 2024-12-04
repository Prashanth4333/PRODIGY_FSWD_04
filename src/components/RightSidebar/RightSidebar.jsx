import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { auth, db, logout } from '../../config/firebase'; // Import modified logout
import { AppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';  // Import useNavigate
import { toast } from 'react-toastify';
import { getAuth, signOut } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { rtdb } from '../../config/firebase';  // Import rtdb


const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  const convertTimestamp = (timestamp) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    let hour = date.getHours();
    let minute = date.getMinutes();
    minute = minute < 10 ? '0' + minute : minute;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return hour + ':' + minute + ' ' + ampm;
  };

  const handleLogout = async () => {
    const auth = getAuth(); // Initialize Firebase Auth instance
    try {
      await signOut(auth);  // Sign out the user
      console.log("User successfully logged out!");
      // Redirect or clear state after logout if necessary
    } catch (error) {
      console.error("Logout error: ", error);
    }
  };
  

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <p>{chatUser.userData.name}</p>
        <p>{chatUser.userData.bio}</p>
        <p>
          {chatUser.userData.isOnline ? (
            <img className="dot" src={assets.green_dot} alt="" />
          ) : (
            <span className="last-seen">
              Last seen: {chatUser.userData.lastSeen ? convertTimestamp(chatUser.userData.lastSeen) : 'N/A'}
            </span>
          )}
        </p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url, index) => (
            <img onClick={() => window.open(url)} key={index} src={url} alt='' />
          ))}
        </div>
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
       <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default RightSidebar;


   

