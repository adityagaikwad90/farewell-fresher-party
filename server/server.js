import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import {
  saveRegistration,
  getAllRegistrations,
  deleteRegistration,
  getDatabaseStatus,
  findExistingRegistration,
  normalizeEmail,
  normalizePhone
} from './firebase.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'mca2026admin';

app.use(cors());
app.use(express.json());

// Admin authentication middleware
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = req.headers['x-admin-passcode'] || (authHeader ? authHeader.replace('Bearer ', '') : req.query.passcode);

  if (token === ADMIN_PASSCODE) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized: Invalid Admin Passcode' });
  }
};

// Health & System Info
app.get('/api/health', (req, res) => {
  const dbStatus = getDatabaseStatus();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    event: 'MCA Fresher & Farewell Celebration 2026',
    database: dbStatus
  });
});

// Admin Passcode Validation Check
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === ADMIN_PASSCODE) {
    return res.json({ success: true, message: 'Admin authentication successful' });
  }
  return res.status(401).json({ success: false, error: 'Incorrect passcode' });
});

// Submit Registration Form
app.post('/api/register', async (req, res) => {
  try {
    const {
      fullName,
      contact,
      email,
      div,
      talent,
      otherTalent,
      partyWishes,
      gameSuggestion
    } = req.body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ error: 'Full Name is required.' });
    }
    if (!contact || !contact.trim()) {
      return res.status(400).json({ error: 'Contact number is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email ID is required.' });
    }
    if (!div || !['A', 'B'].includes(div.toUpperCase())) {
      return res.status(400).json({ error: 'Division (A or B) is required.' });
    }

    // Check if user has already submitted a response (by email or contact number)
    const existing = await findExistingRegistration(email, contact);
    if (existing) {
      const emailMatches = normalizeEmail(existing.email) === normalizeEmail(email);
      const matchedField = emailMatches ? 'email address' : 'contact number';
      return res.status(409).json({
        conflict: true,
        error: `A registration with this ${matchedField} has already been recorded! (Pass ID: ${existing.regNumber}, Name: ${existing.fullName}). Multiple submissions are restricted to avoid conflicts.`,
        existing: {
          id: existing.id,
          regNumber: existing.regNumber,
          fullName: existing.fullName,
          div: existing.div,
          talent: existing.talent,
          createdAt: existing.createdAt
        }
      });
    }

    // Determine finalized talent category
    let finalTalent = talent || 'None';
    if (talent === 'Other' && otherTalent && otherTalent.trim()) {
      finalTalent = `Other: ${otherTalent.trim()}`;
    }

    const registrationData = {
      id: uuidv4(),
      regNumber: `MCA26-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: fullName.trim(),
      contact: contact.trim(),
      email: email.trim().toLowerCase(),
      div: div.toUpperCase(),
      talent: finalTalent,
      partyWishes: partyWishes ? partyWishes.trim() : '',
      gameSuggestion: gameSuggestion ? gameSuggestion.trim() : ''
    };

    const saved = await saveRegistration(registrationData);
    res.status(201).json({
      success: true,
      message: 'Registration submitted successfully!',
      data: saved
    });
  } catch (err) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Server error processing registration.' });
  }
});

// Check if an email or contact is already registered
app.get('/api/check-registration', async (req, res) => {
  try {
    const { email, contact } = req.query;
    if (!email && !contact) {
      return res.json({ registered: false });
    }
    const existing = await findExistingRegistration(email, contact);
    if (existing) {
      return res.json({
        registered: true,
        existing: {
          regNumber: existing.regNumber,
          fullName: existing.fullName,
          div: existing.div,
          talent: existing.talent,
          createdAt: existing.createdAt
        }
      });
    }
    return res.json({ registered: false });
  } catch (err) {
    console.error('Check registration failed:', err);
    res.status(500).json({ error: 'Failed to verify registration status' });
  }
});

// Admin: Get all responses
app.get('/api/responses', requireAdminAuth, async (req, res) => {
  try {
    const records = await getAllRegistrations();
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (err) {
    console.error('Fetch responses failed:', err);
    res.status(500).json({ error: 'Failed to retrieve responses.' });
  }
});

// Admin: Aggregate Stats
app.get('/api/stats', requireAdminAuth, async (req, res) => {
  try {
    const records = await getAllRegistrations();
    const total = records.length;
    
    const divStats = {
      A: records.filter(r => r.div === 'A').length,
      B: records.filter(r => r.div === 'B').length
    };

    const talentStats = {
      SINGING: 0,
      DANCING: 0,
      'STAND UP COMEDY': 0,
      OTHER: 0,
      NONE: 0
    };

    records.forEach(r => {
      const t = (r.talent || '').toUpperCase();
      if (t.includes('SINGING')) talentStats.SINGING++;
      else if (t.includes('DANCING')) talentStats.DANCING++;
      else if (t.includes('STAND UP') || t.includes('COMEDY')) talentStats['STAND UP COMEDY']++;
      else if (t.startsWith('OTHER:')) talentStats.OTHER++;
      else talentStats.NONE++;
    });

    res.json({
      success: true,
      total,
      divStats,
      talentStats,
      estimatedFeePool: {
        min: total * 500,
        max: total * 700
      }
    });
  } catch (err) {
    console.error('Stats computation failed:', err);
    res.status(500).json({ error: 'Failed to compute stats.' });
  }
});

// Admin: Delete Response
app.delete('/api/responses/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    await deleteRegistration(id);
    res.json({ success: true, message: 'Response deleted successfully.' });
  } catch (err) {
    console.error('Delete failed:', err);
    res.status(500).json({ error: 'Failed to delete record.' });
  }
});

// Admin: Export to CSV
app.get('/api/export', requireAdminAuth, async (req, res) => {
  try {
    const records = await getAllRegistrations();
    
    // CSV Header
    const headers = [
      'Registration ID',
      'Pass ID',
      'Full Name',
      'Contact',
      'Email ID',
      'Division',
      'Talent / Event',
      'Wishes for Party',
      'Game / Activity Suggestion',
      'Submitted At'
    ];

    const escapeCsv = (str) => {
      if (!str) return '""';
      const clean = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
      return `"${clean}"`;
    };

    const rows = records.map(r => [
      escapeCsv(r.id),
      escapeCsv(r.regNumber || ''),
      escapeCsv(r.fullName),
      escapeCsv(r.contact),
      escapeCsv(r.email),
      escapeCsv(r.div),
      escapeCsv(r.talent),
      escapeCsv(r.partyWishes),
      escapeCsv(r.gameSuggestion),
      escapeCsv(r.createdAt || new Date(r.timestamp).toISOString())
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="MCA_Fresher_Farewell_2026_Registrations_${Date.now()}.csv"`);
    res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export CSV failed:', err);
    res.status(500).json({ error: 'Failed to generate CSV export.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MCA Celebration Server running on http://localhost:${PORT}`);
  console.log(`🔑 Admin Passcode configured as: "${ADMIN_PASSCODE}"`);
});
