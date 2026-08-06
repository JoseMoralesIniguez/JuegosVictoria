import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./firebase-applet-config.json', 'utf-8'));
const firebaseConfig = {
  apiKey: config.apiKey,
  projectId: config.projectId,
  authDomain: config.authDomain
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function test() {
  try {
    await signInAnonymously(auth);
    console.log("Anon Auth Success");
  } catch(e) {
    console.log("Anon Auth Error code:", e.code);
  }
}
test();
