// script.js (Updated)
function domReady(fn) {
    if (
        document.readyState === "complete" ||
        document.readyState === "interactive"
    ) {
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

domReady(function () {
    const resultDiv = document.getElementById('result');
    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 } // Corrected typo 'qrbos' to 'qrbox'
    );

    // This function runs when a QR code is successfully scanned
    async function onScanSuccess(decodeText, decodeResult) {
        // Stop scanning to prevent multiple submissions
        htmlscanner.clear();

        // Show a processing message to the user
        resultDiv.style.color = "#333";
        resultDiv.innerHTML = `Processing Customer ID: ${decodeText}...`;

        // The data we will send to our backend API
        const data = {
            customerId: decodeText,
            pointsToAdd: 10 // Example: Add 10 points per scan. You can change this.
        };

        try {
            // Use the fetch API to send a POST request to your running server
            // Make sure your Node.js server is running on http://localhost:3000
            const response = await fetch('http://localhost:3000/api/add-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                // Style and display a success message
                resultDiv.style.backgroundColor = '#d4edda';
                resultDiv.style.color = '#155724';
                resultDiv.innerHTML = `<strong>Success!</strong> ${responseData.customerName} now has ${responseData.newPoints} points.`;
            } else {
                // Style and display an error message from the server
                resultDiv.style.backgroundColor = '#f8d7da';
                resultDiv.style.color = '#721c24';
                resultDiv.innerHTML = `<strong>Error:</strong> ${responseData.message}`;
            }
        } catch (error) {
            // Style and display a network error if the server can't be reached
            resultDiv.style.backgroundColor = '#f8d7da';
            resultDiv.style.color = '#721c24';
            resultDiv.innerHTML = `<strong>Connection Error:</strong> Could not connect to the server. Is it running?`;
        }
    }

    // Start the scanner
    htmlscanner.render(onScanSuccess);
});