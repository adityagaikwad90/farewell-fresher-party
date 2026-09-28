import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const LOCAL_DB_PATH = path.join(DATA_DIR, 'responses.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(LOCAL_DB_PATH)) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify([], null, 2));
}

let db = null;
let isFirebaseActive = false;
let firebaseInitError = null;

// Initialize Firebase if credentials exist
try {
  let credential = null;
  const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  }

  if (credential) {
    admin.initializeApp({ credential });
    db = admin.firestore();
    isFirebaseActive = true;
    console.log('🔥 [Firebase] Successfully connected to Firebase Cloud Firestore!');
  } else {
    console.log('ℹ️ [Firebase] No serviceAccountKey.json or FIREBASE_env found. Falling back to local data store (data/responses.json).');
  }
} catch (error) {
  firebaseInitError = error.message;
  console.warn('⚠️ [Firebase] Initialization failed:', error.message);
  console.log('ℹ️ [Firebase] Continuing with local persistent storage fallback.');
}

// Local File Helper Functions
function readLocalStore() {
  try {
    const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return [];
  }
}

function writeLocalStore(data) {
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2));
}

// Helper Normalization Functions
export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

export function normalizePhone(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

// Check for existing registration by email or phone
export async function findExistingRegistration(email, contact) {
  const normEmail = normalizeEmail(email);
  const normPhone = normalizePhone(contact);

  const allRecords = await getAllRegistrations();
  return allRecords.find(record => {
    const recordEmail = normalizeEmail(record.email);
    const recordPhone = normalizePhone(record.contact);
    
    const emailMatches = Boolean(normEmail && recordEmail && normEmail === recordEmail);
    const phoneMatches = Boolean(normPhone && recordPhone && normPhone === recordPhone);
    
    return emailMatches || phoneMatches;
  });
}

// Data Access Layer
export async function saveRegistration(record) {
  const enrichedRecord = {
    ...record,
    createdAt: record.createdAt || new Date().toISOString(),
    timestamp: record.timestamp || Date.now()
  };

  // Save to local store without adding duplicate IDs
  const localList = readLocalStore();
  const existingIndex = localList.findIndex(item => item.id === enrichedRecord.id);
  if (existingIndex >= 0) {
    localList[existingIndex] = enrichedRecord;
  } else {
    localList.unshift(enrichedRecord);
  }
  writeLocalStore(localList);

  if (isFirebaseActive && db) {
    try {
      const docRef = db.collection('mca_registrations').doc(enrichedRecord.id);
      await docRef.set(enrichedRecord);
      console.log(`✅ [Firestore] Saved response id: ${enrichedRecord.id}`);
    } catch (err) {
      console.error('Firestore save failed, stored in local fallback:', err);
    }
  }

  return enrichedRecord;
}

export async function getAllRegistrations() {
  if (isFirebaseActive && db) {
    try {
      const snapshot = await db.collection('mca_registrations').orderBy('timestamp', 'desc').get();
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (err) {
      console.warn('Firestore fetch failed, reading from local fallback:', err.message);
    }
  }

  return readLocalStore();
}

export async function deleteRegistration(id) {
  // Delete from local
  let localList = readLocalStore();
  localList = localList.filter(item => item.id !== id);
  writeLocalStore(localList);

  if (isFirebaseActive && db) {
    try {
      await db.collection('mca_registrations').doc(id).delete();
      console.log(`🗑️ [Firestore] Deleted record: ${id}`);
    } catch (err) {
      console.error('Firestore delete failed:', err);
    }
  }

  return { success: true };
}

export async function updateCheckInStatus(idOrPassId, checkedIn = true) {
  const normKey = String(idOrPassId || '').trim().toLowerCase();
  if (!normKey) throw new Error('Valid ID or Pass ID required');

  const localList = readLocalStore();
  const index = localList.findIndex(item => 
    (item.id && String(item.id).toLowerCase() === normKey) ||
    (item.regNumber && String(item.regNumber).toLowerCase() === normKey) ||
    (item.passId && String(item.passId).toLowerCase() === normKey)
  );

  let updatedRecord = null;
  const nowIso = new Date().toISOString();

  if (index >= 0) {
    localList[index] = {
      ...localList[index],
      checkedIn: Boolean(checkedIn),
      checkedInAt: checkedIn ? (localList[index].checkedInAt || nowIso) : null
    };
    updatedRecord = localList[index];
    writeLocalStore(localList);
  }

  // Also update in Firestore if active
  if (isFirebaseActive && db) {
    try {
      let docId = updatedRecord ? updatedRecord.id : null;
      if (!docId) {
        const regSnap = await db.collection('mca_registrations').where('regNumber', '==', idOrPassId.trim()).get();
        if (!regSnap.empty) {
          docId = regSnap.docs[0].id;
          updatedRecord = { id: docId, ...regSnap.docs[0].data() };
        } else {
          const passSnap = await db.collection('mca_registrations').where('passId', '==', idOrPassId.trim()).get();
          if (!passSnap.empty) {
            docId = passSnap.docs[0].id;
            updatedRecord = { id: docId, ...passSnap.docs[0].data() };
          }
        }
      }

      if (docId) {
        const updatePayload = {
          checkedIn: Boolean(checkedIn),
          checkedInAt: checkedIn ? ((updatedRecord && updatedRecord.checkedInAt) || nowIso) : null
        };
        await db.collection('mca_registrations').doc(docId).set(updatePayload, { merge: true });
        console.log(`✏️ [Firestore] Updated check-in for record: ${docId}, status: ${checkedIn}`);
        if (!updatedRecord) {
          const fresh = await db.collection('mca_registrations').doc(docId).get();
          updatedRecord = { id: docId, ...fresh.data() };
        } else {
          updatedRecord = { ...updatedRecord, ...updatePayload };
        }
      }
    } catch (err) {
      console.error('Firestore check-in update error:', err);
    }
  }

  if (!updatedRecord) {
    throw new Error('Attendee record not found');
  }

  return updatedRecord;
}

export function getDatabaseStatus() {
  return {
    isFirebaseActive,
    storageType: isFirebaseActive ? 'Firebase Firestore' : 'Local Persistent Storage (data/responses.json)',
    error: firebaseInitError
  };
}
