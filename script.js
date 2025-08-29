// Connect to the server using Socket.IO
const socket = io.connect();

// UI elements
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const statusDiv = document.getElementById('status');
const outputDiv = document.getElementById('output');
const copyButton = document.getElementById('copyButton');

// Start recording
startButton.addEventListener('click', function() {
    fetch('/start_recording', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "Recording started") {
            statusDiv.textContent = "Status: Listening...";
            startButton.disabled = true;
            stopButton.disabled = false;
            copyButton.disabled = true;  // Disable copy button while recording
        }
    });
});

// Stop recording
stopButton.addEventListener('click', function() {
    fetch('/stop_recording', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "Recording stopped") {
            statusDiv.textContent = "Status: Idle";
            stopButton.disabled = true;
            startButton.disabled = false;
            copyButton.disabled = false;  // Enable copy button after recording stops
        }
    });
});

// Listen for real-time recognized text
socket.on('recognized_text', function(data) {
    outputDiv.textContent = "Recognized Text: " + data.text;
});

// Copy to clipboard functionality
copyButton.addEventListener('click', function() {
    // Get the recognized text from the output div
    const textToCopy = outputDiv.textContent.replace("Recognized Text: ", "");

    // Create a temporary input element to use for copying
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = textToCopy;  // Set the value to the recognized text
    tempInput.select();  // Select the text in the input field
    document.execCommand("copy");  // Execute the copy command
    document.body.removeChild(tempInput);  // Remove the temporary input field

    // Optionally, display a message to let the user know it's copied
    alert("Text copied to clipboard!");
});

