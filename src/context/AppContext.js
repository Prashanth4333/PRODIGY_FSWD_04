import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState();
  const [chatData, setChatData] = useState([]); // Fixed typo
  const [messagesId,setMessagesId] = useState();
  const [messages,setMessages] = useState([]);
  const [chatUser,setChatUser] = useState();
  const [chatVisible,setChatVisible] = useState(false);
  
  const loadUserData = async (uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      setUserData(userData);
      if (userData.avatar && userData.name) {
        navigate("/chat");
      } else {
        navigate("/Profile");
      }
      await updateDoc(userRef, {
        lastSeen: Date.now(),
      });
      setInterval(() => {
        if (auth.chatUser) {
          updateDoc(userRef, {
            lastSeen: Date.now(),
          });
        }
      }, 600000);
    } catch (error) {}
  };

  useEffect(() => {
    if (userData) {
      const chatRef = doc(db, "chats", userData.id);
      const unSub = onSnapshot(chatRef, async (res) => {
       /* console.log(res.data()); */ 
        const chatItems = res.data()?.chatsData; 
        if (chatItems) {
          const tempData = [];
          for (const item of chatItems) {
            const userRef = doc(db, "users", item.rId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            tempData.push({ ...item, userData });
          }
          setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
        } else {
          console.error("chatItems is null or undefined"); 
         /* setChatData([]) */
        }
      });

      return () => {
        unSub();
      };
    }
  }, [userData]);

  const value = {
    userData,
    setUserData,
    chatData, // Fixed typo
    setChatData,
    loadUserData,
    messages,
    setMessages,
    messagesId,
    setMessagesId,
    chatUser,
    setChatUser,
    chatVisible,
    setChatVisible
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
