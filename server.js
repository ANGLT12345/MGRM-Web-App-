// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const Customer = require('./Customer');

const app = express();
const PORT = 3000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- Database Connection ---
// Replace with your MongoDB connection string (e.g., from MongoDB Atlas)
mongoose.connect('YOUR_MONGODB_CONNECTION_STRING')
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => console.error(err));

// --- API Endpoint to Add Points ---
app.post('/api/add-points', async (req, res) => {
  const { customerId, pointsToAdd } = req.body;

  if (!customerId || !pointsToAdd) {
    return res.status(400).json({ message: 'Customer ID and points are required.' });
  }

  try {
    // Find the customer and add points in one atomic operation
    const updatedCustomer = await Customer.findOneAndUpdate(
      { customerId: customerId },
      { $inc: { points: pointsToAdd } },
      { new: true, upsert: false } // 'new: true' returns the updated doc
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    res.json({
      message: 'Points added successfully!',
      customerName: updatedCustomer.name,
      newPoints: updatedCustomer.points
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});