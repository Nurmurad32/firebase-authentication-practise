import React, { useState } from 'react';
import * as firebase from "firebase/app";
import firebaseConfig from './firebase.config';
import { useForm } from 'react-hook-form';
import "firebase/auth";
import './App.css';

firebase.initializeApp(firebaseConfig);

function App() {
  // form hook validation
  const { register, errors, handleSubmit } = useForm();

  //User state
  const [user, setUser] = useState({
    isSignedIn: false,          //For google Sign In
    newUser: false,
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    error: '',
    success: false
  })

  //New User
  const [newUser, setNewUser] = useState(false);

  //User email, password, confirmPassword  validation
  const handleBlur = (e) => {
    let isFieldValid = true;
    const p1 = document.getElementById('pass1').value;

    if (e.target.name === 'email') {
      isFieldValid = /\S+@\S+\.\S+/.test(e.target.value);
    }
    if (e.target.name === 'password') {
      const isPasswordValid = e.target.value.length > 6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFieldValid = isPasswordValid && passwordHasNumber
    }
    if (e.target.name === 'confirmPassword') {
      if (p1 !== "undefined" && e.target.value !== "undefined") {
        if (p1 !== e.target.value) {
          isFieldValid = false;
          const newUserInfo = { ...user }
          newUserInfo.error = 'Confirm Password is incorrect';
          setUser(newUserInfo);
        }
      }
      else isFieldValid = true;
    }
    if (isFieldValid) {
      const newUserInfo = { ...user }
      newUserInfo[e.target.name] = e.target.value;
      newUserInfo.error = '';
      setUser(newUserInfo);
    }
  }

  //User form Submit
  const onSubmit = e => {
    // console.log(user.name, user.email, user.password, user.confirmPassword)
    if (newUser && user.name && user.email && user.password && user.confirmPassword) {
      console.log('Submitted');

      // Registration user
      firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          updateUserName(user.name);
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
          // ..
        });
    }

    // Log in user
    if (!newUser && user.email && user.password) {
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          // Signed in 
          const newUserInfo = { ...user };
          newUserInfo.error = '';
          newUserInfo.success = true;
          setUser(newUserInfo);
          console.log("sign in user info", res.user)
        })
        .catch((error) => {
          const newUserInfo = { ...user };
          newUserInfo.error = error.message;
          newUserInfo.success = false;
          setUser(newUserInfo);
        });
    }
    // e.preventDefault();
  };

  //Username update
  const updateUserName = name => {
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function () {
      // Update successful.
      console.log("User name updated successfully")
    }).catch(function (error) {
      // An error happened.
      console.log(error)
    });
  }


  //Start Google Sign In
  var googleProvider = new firebase.auth.GoogleAuthProvider();
  const handleGoogleSignIn = () => {
    firebase.auth().signInWithPopup(googleProvider)
      .then(res => {
        const { displayName, email } = res.user
        const signedInUser = {
          isSignedIn: true,
          name: displayName,
          email: email,
          error: '',
          success: true
        }
        setUser(signedInUser);
        // console.log(displayName, email);
      })
      .catch(error => {
        const signedInUser = {
          isSignedIn: false,
          error: error.message,
          success: false
        }
        setUser(signedInUser);
      })
  }

  //Google SignOut 
  const handleGoogleSignOut = () => {
    firebase.auth().signOut()
      .then(res => {
        const signedOutUser = {
          isSignedIn: false,
          name: '',
          email: '',
          error: '',
          success: false
        }
        setUser(signedOutUser);
      })
      .catch(err => {
        console.log(err);
      })
  }
  //End Google Sign In Authentication

  return (
    <div className="App">
      <h1 style={{ color: 'red' }}>Using React hook form</h1>


      {/* Show Success message */}
      {user.success && <p style={{ color: 'green' }}> {newUser ? 'User created' : 'Your account Logged In'} successfully</p>}
      {/* Show error message */}
      <p style={{ color: 'red' }}>{user.error}</p>
      {
        user.isSignedIn && <div>
          <p>Welcome, <span style={{ color: "green" }} >{user.name}</span> </p>
          <p>Email: {user.email}</p>
        </div>
      }

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Input name */}
        {newUser && <input name="name" type="name" onBlur={handleBlur} placeholder="Your Name" ref={register({ required: true })} />}<br />
        {errors.name && <span style={{ color: 'red' }} >"*Name is required"<br /></span>}

        {/* Input Email */}
        <input name="email" type="email" onBlur={handleBlur} placeholder="Your Email" ref={register({ required: true })} /><br />
        {errors.email && <span style={{ color: 'red' }} >"*Email is required"<br /></span>}

        {/*Input Password */}
        <input id="pass1" name="password" type="password" onBlur={handleBlur} placeholder="password" ref={register({ required: true })} /><br />
        {errors.password && <span style={{ color: 'red' }} >"*Password is required"<br /></span>}

        {/*Input Confirm Password */}
        {newUser && <input id="pass2" name="confirmPassword" type="password" onBlur={handleBlur} placeholder="Confirm Password" ref={register({ required: true })} />}<br />
        {errors.confirmPassword && <span style={{ color: 'red' }} >"*confirm Password is required"<br /></span>}

        {/* Submit button */}
        <input type="submit" value="submit" />
      </form>

      {/* dynamic button for login and register  */}
      <button style={{ color: 'Red', background: 'yellow' }} onClick={() => setNewUser(!newUser)}>
        {newUser ? <small>Log In</small> : <small>Sign Up</small>}
      </button> <br />

      {/* Google Sign In Button */}
      {user.isSignedIn
        ? <button onClick={handleGoogleSignOut}>Google Sign Out</button>
        : <button onClick={handleGoogleSignIn}>Google Sign In</button>
      }
    </div>
  );
}

export default App;
