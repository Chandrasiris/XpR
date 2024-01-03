let videoStream;

function initializeCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
            const video = document.getElementById('video');
            videoStream = stream;
            video.srcObject = stream;
        })
        .catch((error) => {
            console.error('Error accessing camera:', error);
        });
}

function toggleCamera() {
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('video');

    if (videoContainer.style.display === 'none') {
        // Display the video container
        videoContainer.style.display = 'block';

        // Initialize the camera stream
        initializeCamera();
    } else {
        // Capture the image
        captureImage();
    }
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Ensure that the video has a current frame before capturing
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedImage = canvas.toDataURL('image/png');
    displayCapturedImage(capturedImage);
}

function openFileInput() {
    document.getElementById('file-input').click();
}

function uploadImage(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const capturedImage = e.target.result;
            displayCapturedImage(capturedImage);
        };
        reader.readAsDataURL(file);
    }
}

function displayCapturedImage(imageData) {
    const outputDiv = document.getElementById('output');
    const image = document.createElement('img');
    image.src = imageData;

    // Send the captured image data to the server for OCR processing
    fetch('/process_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_data: imageData }),
    })
    .then(response => response.json())
    .then(data => {
        outputDiv.innerHTML = `<p>Extracted Text:</p><p>${data.result}</p>`;
    })
    .catch(error => console.error('Error processing image:', error))
    .finally(() => {
        // Reinitialize the camera stream for the next capture
        initializeCamera();
    });
}