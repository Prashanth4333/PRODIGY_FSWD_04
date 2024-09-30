/*import React, { useContext, useEffect, useState } from 'react'
import './RightSidebar.css'
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'


const RightSidebar = () => {

   const {chatUser,messages} = useContext(AppContext)
   const [msgImages,setMsgImages] = useState([])
   

   useEffect(() =>{
    
     let tempVar = [];
     messages.map((msg) =>{
      if (msg.image) {
        tempVar.push(msg.image)
      }
     })
      setMsgImages(tempVar);
   }, [messages])

  return chatUser ? (
    <div className='rs'>
       <div className="rs-profile">
          <img src={chatUser.userData.avatar} alt="" />
          <h3>{Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} className='dot' alt="" /> : null}{chatUser.userData.name} </h3>
          <p>{chatUser.userData.bio}</p>
       </div>
       <hr/>
       <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages.map((url,index)=>(<img onClick={()=>window.open(url)} key={index} src={url} alt='' />))}
         {/* <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />
          <img src={assets.pic3} alt="" />
          <img src={assets.pic4} alt="" />
          <img src={assets.pic1} alt="" />
          <img src={assets.pic2} alt="" />  */
      /*  </div>
       </div>
       <button onClick={()=>logout()}>Logout</button>
    </div>
  )
  : (
    <div className='rs'>
       <button onClick={()=>logout()}>Logout</button>
    </div>
  )
}

export default RightSidebar */

// New Code //

/*import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [isUserOnline, setIsUserOnline] = useState(false);

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  useEffect(() => {
    if (chatUser) {
      // Check if the user is online
      const userIsOnline = Date.now() - chatUser.userData.lastSeen <= 7000;
      setIsUserOnline(userIsOnline);

      // If the user goes offline, keep the dot for 20 seconds
      if (!userIsOnline) {
        const timer = setTimeout(() => {
          setIsUserOnline(false); // Disable green dot after 20 seconds
        }, 2000); // 20 seconds in milliseconds

        return () => clearTimeout(timer);
      }
    }
  }, [chatUser]);

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
        <h3>
          {isUserOnline ? <img src={assets.green_dot} className='dot' alt="" /> : null}
          {chatUser.userData.name}
        </h3>
        <p>{chatUser.userData.bio}</p>
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
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar; */

import React, { useContext, useEffect, useState } from 'react';
import './RightSidebar.css';
import assets from '../../assets/assets';
import { logout } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';

const RightSidebar = () => {
  const { chatUser, messages } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);
  const [isUserOnline, setIsUserOnline] = useState(false);
  const [lastSeenTime, setLastSeenTime] = useState('');

  useEffect(() => {
    let tempVar = [];
    messages.map((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  // Convert timestamp to readable format (e.g., "Last seen at 2:30 PM")
  const convertLastSeen = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `Last seen at ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (chatUser) {
      const lastSeenTimestamp = chatUser.userData.lastSeen;
      const userIsOnline = Date.now() - lastSeenTimestamp <= 7000;

      setIsUserOnline(userIsOnline);
      setLastSeenTime(convertLastSeen(lastSeenTimestamp));

      
      if (!userIsOnline) {
        const timer = setTimeout(() => {
          setIsUserOnline(false); 
        }, 2000); 

        
        return () => clearTimeout(timer);
      }
    }
  }, [chatUser]);

  return chatUser ? (
    <div className='rs'>
      <div className="rs-profile">
        <img src={chatUser.userData.avatar} alt="" />
       <p></p> {chatUser.userData.name}
        <p>{chatUser.userData.bio}</p>
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
      <button onClick={() => logout()}>Logout</button>
    </div>
  ) : (
    <div className='rs'>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSidebar;


