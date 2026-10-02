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
        return snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            passId: d.passId || d.regNumber || doc.id,
            regNumber: d.regNumber || d.passId || doc.id,
            checkedIn: Boolean(d.checkedIn),
            checkedInAt: d.checkedIn ? (d.checkedInAt || null) : null
          };
        });
      }
    } catch (err) {
      console.warn('Firestore fetch failed, reading from local fallback:', err.message);
    }
  }

  const local = readLocalStore();
  return local.map(r => ({
    ...r,
    passId: r.passId || r.regNumber || r.id,
    regNumber: r.regNumber || r.passId || r.id,
    checkedIn: Boolean(r.checkedIn),
    checkedInAt: r.checkedIn ? (r.checkedInAt || null) : null
  }));
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

export async function updateCheckInStatus(target, checkedIn = true) {
  let targetId = '';
  let targetPassId = '';
  
  if (typeof target === 'object' && target !== null) {
    targetId = String(target.id || '').trim();
    targetPassId = String(target.passId || target.regNumber || '').trim();
  } else {
    const raw = String(target || '').trim();
    if (raw.toUpperCase().startsWith('FFP') || raw.toUpperCase().startsWith('MCA')) {
      targetPassId = raw;
    } else {
      targetId = raw;
    }
    if (!targetPassId) targetPassId = raw;
  }

  const normId = targetId.toLowerCase();
  const normPass = targetPassId.toLowerCase();
  const cleanPass = normPass.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();

  if (!normId && !normPass) {
    throw new Error('Valid ID or Pass ID required');
  }

  const nowIso = new Date().toISOString();
  const localList = readLocalStore();

  // 1. Find in local list
  let index = localList.findIndex(item => {
    const itemId = String(item.id || '').toLowerCase();
    const itemReg = String(item.regNumber || '').toLowerCase();
    const itemPass = String(item.passId || '').toLowerCase();
    const itemCleanReg = itemReg.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();
    const itemCleanPass = itemPass.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();

    if (normId && itemId === normId) return true;
    if (normPass && (itemReg === normPass || itemPass === normPass)) return true;
    if (cleanPass && (itemCleanReg === cleanPass || itemCleanPass === cleanPass)) return true;
    return false;
  });

  let updatedRecord = null;
  let docId = null;

  if (index >= 0) {
    localList[index] = {
      ...localList[index],
      checkedIn: Boolean(checkedIn),
      checkedInAt: checkedIn ? (localList[index].checkedInAt || nowIso) : null
    };
    updatedRecord = localList[index];
    docId = updatedRecord.id;
    writeLocalStore(localList);
  }

  // 2. Also update in Firestore if active
  if (isFirebaseActive && db) {
    try {
      let firestoreDocRef = null;
      let existingFirestoreData = null;

      // Check by candidate document IDs (docId from local or targetId)
      const candidateDocIds = [docId, targetId].filter(Boolean);
      for (const cId of candidateDocIds) {
        const snap = await db.collection('mca_registrations').doc(cId).get();
        if (snap.exists) {
          firestoreDocRef = snap.ref;
          existingFirestoreData = { id: snap.id, ...snap.data() };
          break;
        }
      }

      // If not resolved, query by regNumber or passId (exact and uppercase)
      if (!firestoreDocRef && targetPassId) {
        const queries = [
          db.collection('mca_registrations').where('regNumber', '==', targetPassId),
          db.collection('mca_registrations').where('passId', '==', targetPassId),
          db.collection('mca_registrations').where('regNumber', '==', targetPassId.toUpperCase()),
          db.collection('mca_registrations').where('passId', '==', targetPassId.toUpperCase())
        ];

        for (const q of queries) {
          const snap = await q.get();
          if (!snap.empty) {
            firestoreDocRef = snap.docs[0].ref;
            existingFirestoreData = { id: snap.docs[0].id, ...snap.docs[0].data() };
            break;
          }
        }
      }

      // If still not resolved, scan in memory
      if (!firestoreDocRef) {
        const allSnap = await db.collection('mca_registrations').get();
        for (const doc of allSnap.docs) {
          const d = doc.data();
          const dId = String(doc.id).toLowerCase();
          const dReg = String(d.regNumber || '').toLowerCase();
          const dPass = String(d.passId || '').toLowerCase();
          const dClean = dReg.replace(/^(ffp26-|mca26-|ffp-|mca-)/i, '').trim();

          if (
            (normId && dId === normId) ||
            (normPass && (dReg === normPass || dPass === normPass)) ||
            (cleanPass && dClean === cleanPass)
          ) {
            firestoreDocRef = doc.ref;
            existingFirestoreData = { id: doc.id, ...d };
            break;
          }
        }
      }

      if (firestoreDocRef) {
        const updatePayload = {
          checkedIn: Boolean(checkedIn),
          checkedInAt: checkedIn ? ((existingFirestoreData && existingFirestoreData.checkedInAt) || nowIso) : null
        };
        await firestoreDocRef.set(updatePayload, { merge: true });
        console.log(`✏️ [Firestore] Updated check-in for record: ${firestoreDocRef.id}, status: ${checkedIn}`);

        const mergedRecord = {
          ...(existingFirestoreData || {}),
          ...(updatedRecord || {}),
          ...updatePayload,
          id: firestoreDocRef.id
        };

        updatedRecord = mergedRecord;

        // Keep localList in sync with this Firestore document
        const freshLocalList = readLocalStore();
        const lIndex = freshLocalList.findIndex(item => item.id === firestoreDocRef.id);
        if (lIndex >= 0) {
          freshLocalList[lIndex] = { ...freshLocalList[lIndex], ...updatePayload };
        } else {
          freshLocalList.unshift(mergedRecord);
        }
        writeLocalStore(freshLocalList);
      }
    } catch (err) {
      console.error('Firestore check-in update error:', err);
    }
  }

  if (!updatedRecord) {
    throw new Error(`Attendee record not found for key: ${targetPassId || targetId}`);
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
