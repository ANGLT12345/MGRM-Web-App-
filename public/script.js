// script.js (Updated for custom points)

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
    // Get references to all our HTML elements
    const resultDiv = document.getElementById('result');
    const pointsEntryDiv = document.getElementById('points-entry');
    const scannedIdSpan = document.getElementById('scanned-id');
    const pointsInput = document.getElementById('points-input');
    const addPointsBtn = document.getElementById('add-points-btn');
    const qrReaderDiv = document.getElementById('my-qr-reader');

    // Variable to hold the scanned customer ID
    let scannedCustomerId = null;

    let htmlscanner = new Html5QrcodeScanner(
        "my-qr-reader",
        { fps: 10, qrbox: 250 }
    );

    // This function now just handles the scan itself
    function onScanSuccess(decodeText, decodeResult) {
        // Stop the scanner
        try {
            htmlscanner.clear();
        } catch (error) {
            console.error("Failed to clear html5QrcodeScanner.", error);
        }

        // Hide the QR scanner and show the points entry form
        qrReaderDiv.classList.add('hidden');
        pointsEntryDiv.classList.remove('hidden');

        // Store the scanned ID and display it
        scannedCustomerId = decodeText;
        scannedIdSpan.innerText = scannedCustomerId;
        resultDiv.innerHTML = ''; // Clear previous results
    }

    // This function handles the API call when the button is clicked
    async function creditPoints() {
        const pointsToAdd = parseInt(pointsInput.value, 10);

        if (!scannedCustomerId) {
            alert("Error: No customer ID was scanned.");
            return;
        }

        if (isNaN(pointsToAdd) || pointsToAdd <= 0) {
            alert("Please enter a valid number of points.");
            return;
        }

        resultDiv.style.color = "#333";
        resultDiv.innerHTML = `Processing...`;

        const data = {
            customerId: scannedCustomerId,
            pointsToAdd: pointsToAdd
        };

        try {
            const response = await fetch('/api/add-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const responseData = await response.json();

            if (response.ok) {
                resultDiv.style.backgroundColor = '#d4edda';
                resultDiv.style.color = '#155724';
                resultDiv.innerHTML = `
                    <div style="text-align: left; padding: 10px;">
                        <strong>Transaction Complete!</strong><br><br>
                        Customer: ${responseData.customerName}<br>
                        Previous Balance: ${responseData.previousPoints} points<br>
                        <strong style="color: green;">Points Credited: +${responseData.pointsAdded}</strong><br>
                        <hr>
                        <strong>New Balance: ${responseData.newPoints} points</strong>
                    </div>
                `;
                // Optionally, reset the form after a short delay
                setTimeout(() => location.reload(), 5000);

            } else {
                resultDiv.style.backgroundColor = '#f8d7da';
                resultDiv.style.color = '#721c24';
                resultDiv.innerHTML = `<strong>Error:</strong> ${responseData.message}`;
            }
        } catch (error) {
            resultDiv.style.backgroundColor = '#f8d7da';
            resultDiv.style.color = '#721c24';
            resultDiv.innerHTML = `<strong>Connection Error:</strong> Could not connect to the server.`;
        }
    }

    // Add the event listener to our new button
    addPointsBtn.addEventListener('click', creditPoints);

    // Render the scanner to start the process
    htmlscanner.render(onScanSuccess);
});