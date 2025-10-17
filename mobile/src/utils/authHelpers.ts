import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { getAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

export function useGoogleSignIn() {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        const credential = GoogleAuthProvider.credential(id_token);
        signInWithCredential(auth, credential)
          .then(userCred => {
            console.log("Signed in:", userCred.user?.displayName);
          })
          .catch(err => {
            console.error("Firebase sign-in error:", err);
          });
      }
    }
  }, [response]);

  return { request, promptAsync };
}
