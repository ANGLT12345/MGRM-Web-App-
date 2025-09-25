// server.js (Firebase Version)

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const admin = require('firebase-admin');
const admin = require('firebase-admin');

// --- Initialize Firebase Admin SDK ---
const serviceAccountString = process.env.FIREBASE_CREDENTIALS;
if (!serviceAccountString) {
  throw new Error('The FIREBASE_CREDENTIALS environment variable is not set!');
}
const serviceAccount = JSON.parse(serviceAccountString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- API Endpoint to Add Points ---
app.post('/api/add-points', async (req, res) => {
  const { customerId, pointsToAdd } = req.body;

  if (!customerId || !pointsToAdd) {
    return res.status(400).json({ message: 'Customer ID and points are required.' });
  }

  // Get a reference to the customer's document in Firestore
  const customerRef = db.collection('customers').doc(customerId);

  try {
    const doc = await customerRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    const customerData = doc.data();
    const previousPoints = customerData.points;

    // Use Firebase's special FieldValue to atomically increment the points
    await customerRef.update({
      points: admin.firestore.FieldValue.increment(pointsToAdd)
    });

    // Get the updated data to send back
    const updatedDoc = await customerRef.get();
    const updatedData = updatedDoc.data();

    res.json({
      message: 'Points added successfully!',
      customerName: updatedData.name,
      previousPoints: previousPoints,
      pointsAdded: pointsToAdd,
      newPoints: updatedData.points
    });

  } catch (error) {
    console.error("Firebase error:", error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Firebase server is running on http://localhost:${PORT}`);
});