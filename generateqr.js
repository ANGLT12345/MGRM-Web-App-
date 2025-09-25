// generateQR.js
const QRCode = require('qrcode');

async function createQRCode(customerId, fileName) {
  try {
    await QRCode.toFile(`./${fileName}.png`, customerId, {
      color: {
        dark: '#000000',  // QR code color
        light: '#FFFFFF' // Background color
      }
    });
    console.log(`Successfully created QR code for ${customerId} at ${fileName}.png`);
  } catch (err) {
    console.error(err);
  }
}

// --- USAGE ---
// Run this script with node to generate a QR code for a new customer
// Example: Add a new customer with the ID "CUST-12345"
createQRCode('CUST-12345', 'customer-12345-qr');
// Example: Add another customer with the ID "CUST-ABCDE"
createQRCode('CUST-ABCDE', 'customer-abcde-qr');