import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { GoogleLoginButton } from "react-social-login-buttons";
import { auth } from "./App";

//google auth
const provider = new GoogleAuthProvider();
//signIn google
export const SignUpGoogle = () => {
    const [isSigned, setIsSigned] = useState(JSON.parse(localStorage.getItem('is-signedIn')!) || false);
    const signIn = () => signInWithPopup(auth, provider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential!.accessToken;
            // The signed-in user info.
            const user = result.user;
            // ...
            setIsSigned(localStorage.setItem('is-signedIn', JSON.stringify(true)));
        }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
        });
    return (<GoogleLoginButton onClick={signIn} />);
}

