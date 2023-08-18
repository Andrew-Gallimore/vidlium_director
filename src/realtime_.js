import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";


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


// Signing in

// const auth = getAuth();
// signInAnonymously(auth)
//   .then(() => {
//     console.log("signed in")
//     // console.log(user)
//     // var idToken = await user.getIdTokenResult(true);
//     // console.log(idToken)
//     // getData()
//   })
//   .catch((error) => {
//     console.log(error)
//   });

// onAuthStateChanged(auth, async (user) => {
//   if (user) {
//     console.log("User signed rin")
//     // console.log(user)
//     var idToken = await user.getIdTokenResult(true);
//     console.log(idToken.claims)
//     // const uid = user.uid;
//     getData();
//     // ...
//   } else {
//     console.log("User signed out")
//     // User is signed out
//     // ...
//   }
// });
