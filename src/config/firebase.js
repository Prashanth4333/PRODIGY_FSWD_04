import { initializeApp } from "firebase/app"; 
import { 
    createUserWithEmailAndPassword, 
    getAuth, 
    sendPasswordResetEmail, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged // Import the auth state listener
} from "firebase/auth";
import { 
    collection, 
    doc, 
    getDocs, 
    getFirestore, 
    query, 
    setDoc, 
    updateDoc, 
    where,
    arrayUnion 
} from "firebase/firestore";
import { 
    getDatabase, 
    ref, 
    set, 
    onDisconnect 
} from "firebase/database";  // Realtime Database imports
import { toast } from "react-toastify";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "chat-application-48e93.firebaseapp.com",
  projectId: "chat-application-48e93",
  storageBucket: "chat-application-48e93.appspot.com",
  messagingSenderId: "443106891513",
  appId: "1:443106891513:web:7ce3e193386eda66c9b428"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const rtdb = getDatabase(app);  // Initialize Realtime Database

// Function to update user's online/offline status
const updateUserStatus = (userId) => {
    const userStatusRef = ref(rtdb, `status/${userId}`);

    const isOnline = {
        state: "online",
        lastChanged: new Date().toISOString(),
    };

    const isOffline = {
        state: "offline",
        lastChanged: new Date().toISOString(),
    };

    // Set the user as online
    set(userStatusRef, isOnline);

    // Set them as offline when they disconnect
    onDisconnect(userStatusRef).set(isOffline);

    // Also update Firestore with last seen time
    onDisconnect(doc(db, "users", userId)).update({
        lastSeen: new Date(),
    });
};

// Signup with presence tracking
const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Create user record in Firestore
        await setDoc(doc(db, "users", user.uid), {
            id: user.uid,
            username: username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            lastSeen: new Date().toISOString(),  // Initialize last seen
        });

        // Create empty chat record
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: [],
        });

        // Update online status in Realtime Database
        updateUserStatus(user.uid);

    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
};

// Login with presence tracking
const login = async (email, password) => {
    try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        const user = res.user;

        // Update online status
        updateUserStatus(user.uid);
        const emailParts = user.email ? user.email.split('@') : [];

    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
};

// Logout with last seen update
const logout = async (navigate) => {
    try {
        const user = auth.currentUser;

        if (user) {
            await updateDoc(doc(db, "users", user.uid), {
                lastSeen: new Date(),
            });

            const userStatusRef = ref(rtdb, `status/${user.uid}`);
            await set(userStatusRef, {
                state: "offline",
                lastChanged: new Date().toISOString(),
            });

            await signOut(auth);  // Ensure this promise resolves
            navigate('/'); // Redirect after successful logout
        }
    } catch (error) {
        console.error("Error during logout: ", error);
        toast.error(error.code.split('/')[1].split('-').join(" "));
    }
};

// Password reset
const resetPass = async (email) => {
    if (!email) {
        toast.error("Enter your email");
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where("email", "==", email));
        const querySnap = await getDocs(q);

        if (!querySnap.empty) { // Check if the query returned any documents
            await sendPasswordResetEmail(auth, email);
            toast.success("Reset Email Sent");
        } else {
            toast.error("Email doesn't exist");
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
};

// Function to add reaction to a message
const addReaction = async (messageId, reaction) => {
    try {
        await updateDoc(doc(db, "messages", messageId), {
            reactions: arrayUnion(reaction), // Add the reaction to the reactions array
        });
    } catch (error) {
        console.error("Error adding reaction: ", error);
        toast.error(error.message);
    }
};

export { signup, login, logout, auth, db, resetPass, addReaction, onAuthStateChanged, rtdb }; // Export onAuthStateChanged for global listener

