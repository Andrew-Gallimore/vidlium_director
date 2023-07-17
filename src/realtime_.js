import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, onValue } from "firebase/database";


// Director-Systems Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAcZ-iCdSwdb7eZXRRtqltdRtJwZV7xiQw",
  authDomain: "director-systems.firebaseapp.com",
  projectId: "director-systems",
  storageBucket: "director-systems.appspot.com",
  messagingSenderId: "885380867411",
  appId: "1:885380867411:web:07ae2737988d27c77dada6",
  measurementId: "G-TXNLX2HSZ5"
};

// Initializeing Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


function createStream(userId, name, email, imageUrl) {
    const db = getDatabase();
    set(ref(db, 'users/' + userId), {
      username: name,
      email: email,
      profile_picture : imageUrl
    });
}

const db = getDatabase();
var cvalue = "2oly66sp3";

// Getting stream name
var streamNameRef = ref(db, 'streams/' + cvalue + '/stream_name');
onValue(streamNameRef, (snapshot) => {
  const data = snapshot.val();
  console.log(data)
});

var streams = ref(db, 'streams');
onValue(streams, (snapshot) => {
  const data = snapshot.val();
  console.log(data)
});