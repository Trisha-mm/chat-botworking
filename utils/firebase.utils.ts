import { doc, setDoc, deleteDoc } from "firebase/firestore";
import { deleteUser } from "firebase/auth";
import { db, auth } from "../firebaseConfig"; // or "@/firebaseConfig" if using alias

/**
 * Adds or updates a user document in Firestore under `users/{userId}`
 * @param userId Firebase UID
 * @param email User email
 * @param username A custom username (e.g. from email or user input)
 */
export const addOrUpdateUser = async (
  userId: string,
  email: string,
  username: string
): Promise<void> => {
  try {
    if (!userId || !email) {
      console.warn("Invalid user data passed to addOrUpdateUser");
      return;
    }

    const userRef = doc(db, "users", userId);
    await setDoc(
      userRef,
      {
        email,
        username,
        updatedAt: new Date().toISOString(),
      },
      { merge: true } // merge with existing doc if exists
    );
  } catch (error) {
    console.error("Error in addOrUpdateUser:", error);
    throw error; // let your login page handle this with an alert
  }
};

/**
 * Completely deletes user account from both Firestore and Firebase Auth
 * @param userId Firebase UID
 */
export const deleteUserAccount = async (userId: string): Promise<void> => {
  try {
    if (!userId) {
      console.warn("Invalid userId passed to deleteUserAccount");
      return;
    }

    // Delete user document from Firestore
    const userRef = doc(db, "users", userId);
    await deleteDoc(userRef);
    
    // Delete user from Firebase Authentication
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.uid === userId) {
      await deleteUser(currentUser);
    }
    
    console.log("User account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    throw error;
  }
};