// Firestore Service for TravelTales
// Initializes Firebase and synchronizes user profiles & uploaded media to Cloud Firestore

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, deleteDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { getFirebaseConfig, isFirebaseConnected } from './firebaseConfig.js';

let appInstance = null;
let dbInstance = null;

/**
 * Initializes and returns the Firestore instance if valid config is present
 */
export function getDb() {
  if (dbInstance) return dbInstance;

  if (!isFirebaseConnected()) {
    console.info('Firestore: Live credentials not configured yet. Changes saved to LocalStorage cache.');
    return null;
  }

  try {
    const config = getFirebaseConfig();
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    return dbInstance;
  } catch (error) {
    console.error('Error initializing Firebase/Firestore:', error);
    return null;
  }
}

/**
 * Saves or updates user profile data in Firestore (collection: "users")
 * @param {string} userId - User identifier
 * @param {object} profileData - Profile details including photoUrl (from Cloudinary)
 */
export async function saveUserProfileToFirestore(userId, profileData) {
  const db = getDb();
  if (!db) {
    return {
      syncedWithFirestore: false,
      message: 'Saved locally. Configure Firebase credentials to sync automatically with cloud Firestore.'
    };
  }

  try {
    const userDocRef = doc(db, 'users', userId);
    const dataToSave = {
      ...profileData,
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, dataToSave, { merge: true });

    return {
      syncedWithFirestore: true,
      message: 'Profile and Cloudinary photo URL successfully saved to Firestore!'
    };
  } catch (err) {
    console.error('Firestore saveUserProfile error:', err);
    return {
      syncedWithFirestore: false,
      error: err.message
    };
  }
}

/**
 * Records an uploaded image in Firestore (collection: "images")
 * @param {object} imageRecord - { url, publicId, userId, fileName, caption }
 */
export async function recordImageInFirestore(imageRecord) {
  const db = getDb();
  if (!db) return null;

  try {
    const imgCol = collection(db, 'images');
    const docRef = await addDoc(imgCol, {
      ...imageRecord,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (err) {
    console.warn('Could not record image in Firestore collection:', err);
    return null;
  }
}

/**
 * Fetches user profile data from Firestore
 */
export async function getUserProfileFromFirestore(userId) {
  const db = getDb();
  if (!db) return null;

  try {
    const userDocRef = doc(db, 'users', userId);
    const snapshot = await getDoc(userDocRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (err) {
    console.error('Firestore getUserProfile error:', err);
    return null;
  }
}

/**
 * Saves a planned trip to Firestore (collection: "trips")
 * @param {object} tripData - Full trip object (id, title, days, attractions, dateRange, etc.)
 * @param {string} userId - Associated user ID
 */
export async function saveTripToFirestore(tripData, userId = 'guest') {
  const db = getDb();
  if (!db) {
    return {
      syncedWithFirestore: false,
      message: 'Saved to local storage cache.'
    };
  }

  try {
    const tripId = tripData.id || `trip_${Date.now()}`;
    const tripDocRef = doc(db, 'trips', tripId);
    
    // Clean any undefined fields before sending to Firestore
    const cleanData = JSON.parse(JSON.stringify({
      ...tripData,
      id: tripId,
      userId: userId || 'anonymous',
      updatedAt: new Date().toISOString()
    }));

    await setDoc(tripDocRef, cleanData, { merge: true });

    return {
      syncedWithFirestore: true,
      tripId,
      message: 'Trip itinerary successfully synced to Cloud Firestore database!'
    };
  } catch (err) {
    console.warn('Firestore saveTrip error:', err);
    return {
      syncedWithFirestore: false,
      error: err.message
    };
  }
}

/**
 * Fetches all saved trips for a user from Cloud Firestore
 * @param {string} userId
 */
export async function getUserTripsFromFirestore(userId) {
  const db = getDb();
  if (!db || !userId) return [];

  try {
    const tripsCol = collection(db, 'trips');
    const q = query(tripsCol, where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    const trips = [];
    querySnapshot.forEach((doc) => {
      trips.push({ id: doc.id, ...doc.data() });
    });
    return trips;
  } catch (err) {
    console.warn('Firestore getUserTrips error:', err);
    return [];
  }
}

/**
 * Deletes a trip from Firestore
 * @param {string} tripId
 */
export async function deleteTripFromFirestore(tripId) {
  const db = getDb();
  if (!db || !tripId) return false;

  try {
    const tripDocRef = doc(db, 'trips', tripId);
    await deleteDoc(tripDocRef);
    return true;
  } catch (err) {
    console.warn('Firestore deleteTrip error:', err);
    return false;
  }
}

