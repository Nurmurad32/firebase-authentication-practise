import React, { useState } from 'react';
import * as firebase from "firebase/app";
import firebaseConfig from './firebase.config';
import { useForm } from 'react-hook-form';
import "firebase/auth";


firebase.initializeApp(firebaseConfig);

const EmailPass = () => {
    const { register, errors, handleSubmit } = useForm();
    const [newUser, setNewUser] = useState(false);
    const [user, setUser] = useState({
        newUser: false,
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        error: '',
        success: false
    })
    const handleBlur = (e) => {
        let isFieldValid = true;
        const p1 = document.getElementById('pass1').value;

        console.log(e.target.name, e.target.value);

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
                    newUserInfo.error = 'Password did not match';
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

    const onSubmit = e => {
        console.log(user.name, user.email, user.password, user.confirmPassword)
        if (newUser && user.name && user.email && user.password && user.confirmPassword) {
            console.log('Submitted');
            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
                .then((user) => {
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
        if (!newUser && user.email && user.password) {
            firebase.auth().signInWithEmailAndPassword(user.email, user.password)
                .then((user) => {
                    // Signed in 
                    const newUserInfo = { ...user };
                    newUserInfo.error = '';
                    newUserInfo.success = true;
                    setUser(newUserInfo);
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
    return (
        <div className="App">
            <h1 style={{ color: 'red' }}>Using React hook form</h1>
            {/* <h3>Name:{user.name}</h3>
      <p>Email:{user.email}</p>
      <p>Password:{user.password}</p>
      <p>Confirm Password:{user.confirmPassword}</p> */}
            {user.success && <p style={{ color: 'green' }}>User {newUser ? 'created' : 'Logged In'} successfully</p>}
            <p style={{ color: 'red' }}>{user.error}</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* Input name */}
                {newUser && <input name="name" type="name" onBlur={handleBlur} placeholder="Your Name" ref={register({ required: true })} />}<br />
                {errors.name && <span style={{ color: 'red' }} >"*Name is required"<br /></span>}
                {/* Input Email */}
                <input name="email" type="email" onBlur={handleBlur} placeholder="Your Email" ref={register({ required: true })} /><br />
                {errors.email && <span style={{ color: 'red' }} >"*Email is required"<br /></span>}
                {/* Password */}
                <input id="pass1" name="password" type="password" onBlur={handleBlur} placeholder="password" ref={register({ required: true })} /><br />
                {errors.password && <span style={{ color: 'red' }} >"*Password is required"<br /></span>}
                {/* Confirm Password */}
                {newUser && <input id="pass2" name="confirmPassword" type="password" onBlur={handleBlur} placeholder="Confirm Password" ref={register({ required: true })} />}<br />
                {errors.confirmPassword && <span style={{ color: 'red' }} >"*confirm Password is required"<br /></span>}

                <input type="submit" value="submit" />
            </form>
            <button style={{ color: 'Red', background: 'yellow' }} onClick={() => setNewUser(!newUser)}>{newUser ? <small>Log In</small> : <small>Sign Up</small>}</button>
        </div>
    );
};

export default EmailPass;