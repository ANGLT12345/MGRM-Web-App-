// server.js (Final Vercel Version)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Initialize Firebase Admin SDK ---
try {
  const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
  if (!serviceAccountString) {
    throw new Error('Firebase credentials environment variable is not set.');
  }
  const serviceAccount = JSON.parse(serviceAccountString);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('Firebase initialization failed:', error);
  // We will let the server run so we can see the logs, but API calls will fail.
}

const db = admin.firestore();

// --- API Endpoint to Add Points ---
app.post('/api/add-points', async (req, res) => {
  // Check if Firebase initialized correctly
  if (!admin.apps.length) {
      return res.status(500).json({ message: 'Firebase initialization failed. Check server logs.' });
  }

  const { customerId, pointsToAdd } = req.body;
  if (!customerId || !pointsToAdd) {
    return res.status(400).json({ message: 'Customer ID and points are required.' });
  }

  const customerRef = db.collection('customers').doc(customerId);
  try {
    const doc = await customerRef.get();
    if (!doc.exists) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    const previousPoints = doc.data().points;
    await customerRef.update({
      points: admin.firestore.FieldValue.increment(pointsToAdd)
    });
    const updatedDoc = await customerRef.get();
    res.json({
      message: 'Points added successfully!',
      customerName: updatedDoc.data().name,
      previousPoints: previousPoints,
      pointsAdded: pointsToAdd,
      newPoints: updatedDoc.data().points
    });
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({ message: 'An error occurred while processing points.' });
  }
});

// --- Root Endpoint for Health Check ---
app.get('/', (req, res) => {
  res.status(200).send('Server is running.');
});

// Export the app for Vercel
module.exports = app;