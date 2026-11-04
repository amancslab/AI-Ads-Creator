import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Setup Google Auth Provider with Workspace scopes for Classroom, Drive/Picker, Forms, and Chat
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.addScope('https://www.googleapis.com/auth/classroom.courses.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleAuthProvider.addScope('https://www.googleapis.com/auth/drive.metadata.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/forms.body.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.spaces.readonly');
googleAuthProvider.addScope('https://www.googleapis.com/auth/chat.messages.create');

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onSuccess: (user: User, token: string | null) => void,
  onFailure: () => void
) => {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onSuccess(user, cachedAccessToken);
    } else {
      cachedAccessToken = null;
      onFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleAuthProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Validate connection on boot
export async function validateFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
