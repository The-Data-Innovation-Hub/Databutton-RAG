// Re-export the official Firebase app and auth from the Databutton extension
import { firebaseApp, firebaseAuth } from "app";

// For backwards compatibility with existing code
export const auth = firebaseAuth;
export const app = firebaseApp;

console.log("Firebase utils importing official Firebase instance", { 
  auth: firebaseAuth, 
  app: firebaseApp 
});
