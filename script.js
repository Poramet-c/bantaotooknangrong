// Function to save form data to localStorage
function saveFormData() {
    const prefix = document.getElementById('prefix').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('studentId').value;
    const className = document.getElementById('class').value;

    // Save each input field to localStorage
    localStorage.setItem('prefix', prefix);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('class', className);
}

// Function to load saved form data from localStorage
function loadFormData() {
    // Get saved data from localStorage and set the form fields
    if (localStorage.getItem('prefix')) {
        document.getElementById('prefix').value = localStorage.getItem('prefix');
    }
    if (localStorage.getItem('firstName')) {
        document.getElementById('firstName').value = localStorage.getItem('firstName');
    }
    if (localStorage.getItem('lastName')) {
        document.getElementById('lastName').value = localStorage.getItem('lastName');
    }
    if (localStorage.getItem('studentId')) {
        document.getElementById('studentId').value = localStorage.getItem('studentId');
    }
    if (localStorage.getItem('class')) {
        document.getElementById('class').value = localStorage.getItem('class');
    }
}

// Automatically save form data when any input field is changed
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', saveFormData);
});

// Load form data on page load
window.onload = function() {
    loadFormData();
};

document.getElementById('imageUpload').addEventListener('input', function() {
    const fileInput = document.getElementById('imageUpload');
    const files = fileInput.files;
    
    // Update the file count display
    const fileCountDisplay = document.getElementById('fileCount');
    if (files.length > 0) {
        fileCountDisplay.textContent = `${files.length} file(s) selected`;
    } else {
        fileCountDisplay.textContent = 'No files selected';
    }
});

function generatePattern() {
    const fileInput = document.getElementById('imageUpload');
    const files = Array.from(fileInput.files);

    // Check if there are uploaded files
    if (files.length === 0) {
        alert("Please upload at least one image.");
        return;
    }

    // Split the images into chunks of 10
    const chunkedFiles = chunkArray(files, 10);

    // Clear previous canvases
    document.getElementById('canvas-container').innerHTML = '';

    // Generate a canvas for each chunk of 10 images
    Promise.all(chunkedFiles.map((fileChunk, index) => createCanvasWithImages(fileChunk, index)))
        .then(() => {
            // Enable the download button after all canvases are created
            document.getElementById('downloadBtn').disabled = false;
        })
        .catch((error) => {
            alert("Error generating images: " + error);
        });
}

// Function to chunk an array into smaller arrays of a specified size
function chunkArray(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

// Function to create a canvas and place it in the DOM for each chunk of images
function createCanvasWithImages(files, chunkIndex) {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1654;
        canvas.height = 2339;
        const ctx = canvas.getContext('2d');

        const background = new Image();
        background.src = 'A.png';

        background.onload = () => {
            // Draw the background image A
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

            // Coordinates for the top-left positions of each image
            const positions = [
                { x: 200, y: 370 }, { x: 826, y: 370 },
                { x: 200, y: 673 }, { x: 826, y: 673 },
                { x: 200, y: 976 }, { x: 826, y: 976 },
                { x: 200, y: 1280 }, { x: 826, y: 1280 },
                { x: 200, y: 1580 }, { x: 826, y: 1580 }
            ];

            // Load each uploaded image and draw it on the canvas
            Promise.all(files.map(loadImage)).then((images) => {
                images.forEach((img, i) => {
                    const { x, y } = positions[i];
                    ctx.drawImage(img, x, y, 626, 303);
                });

                // Draw Thai text on the canvas
                drawThaiText(ctx);

                // Append the canvas to the canvas-container
                const canvasContainer = document.getElementById('canvas-container');
                canvasContainer.appendChild(canvas);

                resolve();
            }).catch(reject);
        };
    });
}

// Function to load an image file and return a Promise
function loadImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function drawThaiText(ctx) {
    // Get the input values
    const prefix = document.getElementById('prefix').value;  // คำนำหน้าชื่อ
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('studentId').value;
    const classValue = document.getElementById('class').value;

    // Combine คำนำหน้าชื่อ + ชื่อ
    const fullName = prefix + " " + firstName;

    // Set text properties (font, color, etc.)
    ctx.font = "24pt TH Sarabun";  // You can choose another Thai font if you prefer
    ctx.fillStyle = "black"; // Text color

    // Draw the text at the specified positions
    ctx.fillText(fullName, 256, 200);  // ชื่อ (combined with คำนำหน้า)
    ctx.fillText(lastName, 830, 200);   // นามสกุล
    ctx.fillText(studentId, 1270, 200); // เลขที่
    ctx.fillText(classValue, 1400, 200); // ชั้น

    // Draw the combined "ชื่อ นามสกุล" with 4 spaces between them
    const fullNameWithSpaces = fullName + "    " + lastName;  // Adding 4 spaces

    // Define the box coordinates (top-left: 580, 1995) and (bottom-right: 1075, 2025)
    const boxX = 580;
    const boxY = 1995;
    const boxWidth = 1075 - 580;  // Width of the box
    const boxHeight = 2025 - 1995; // Height of the box

    // Measure the width of the text to center it
    const textWidth = ctx.measureText(fullNameWithSpaces).width;

    // Calculate the x position to center the text inside the box
    const xPos = boxX + (boxWidth - textWidth) / 2;
    const yPos = boxY + (boxHeight / 2) + 8;  // Adjusted vertically to center the text within the box

    // Draw the text centered within the box
    ctx.fillText(fullNameWithSpaces, xPos, yPos);
}

function downloadAsPDF() {
    const canvases = document.querySelectorAll('#canvas-container canvas');
    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF('portrait', 'px', [1654, 2339]);

    canvases.forEach((canvas, i) => {
        if (i > 0) pdf.addPage();
        const imgData = canvas.toDataURL('image/jpeg');
        pdf.addImage(imgData, 'JPEG', 0, 0, 1654, 2339);
    });

    // Get the first name and last name from the input fields
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    // Get the current time (formatted as yyyy-mm-dd_hhmmss)
    const currentTime = new Date().toISOString().replace(/[:.]/g, '').replace('T', '_').slice(0, 15);

    // Create the file name in the format "FIRSTNAME-LASTNAME-TIME.pdf"
    const fileName = `${firstName}-${lastName}-${currentTime}.pdf`;

    // Save the PDF with the dynamic file name
    pdf.save(fileName);
}

