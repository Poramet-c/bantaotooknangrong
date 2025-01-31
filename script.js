// Load the saved data from localStorage when the page is loaded
window.onload = function() {
    loadFormData();
};

// Function to load the saved form data
function loadFormData() {
    // Check if the form data is already stored in localStorage
    const prefix = localStorage.getItem('prefix');
    const firstName = localStorage.getItem('firstName');
    const lastName = localStorage.getItem('lastName');
    const studentId = localStorage.getItem('studentId');
    const classValue = localStorage.getItem('class');

    // If saved data exists, populate the form inputs
    if (prefix) document.getElementById('prefix').value = prefix;
    if (firstName) document.getElementById('firstName').value = firstName;
    if (lastName) document.getElementById('lastName').value = lastName;
    if (studentId) document.getElementById('studentId').value = studentId;
    if (classValue) document.getElementById('class').value = classValue;
}

// Function to save form data to localStorage
function saveFormData() {
    const prefix = document.getElementById('prefix').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const studentId = document.getElementById('studentId').value;
    const classValue = document.getElementById('class').value;

    // Save each field to localStorage
    localStorage.setItem('prefix', prefix);
    localStorage.setItem('firstName', firstName);
    localStorage.setItem('lastName', lastName);
    localStorage.setItem('studentId', studentId);
    localStorage.setItem('class', classValue);
}

// Listen for input changes and save form data automatically
document.getElementById('prefix').addEventListener('input', saveFormData);
document.getElementById('firstName').addEventListener('input', saveFormData);
document.getElementById('lastName').addEventListener('input', saveFormData);
document.getElementById('studentId').addEventListener('input', saveFormData);
document.getElementById('class').addEventListener('input', saveFormData);

// Optional: Save form data when the form is submitted or the user generates the image
//document.getElementById('uploadForm').addEventListener('submit', saveFormData);


function generatePattern() {
    const canvas = document.getElementById('resultCanvas');
    const ctx = canvas.getContext('2d');
    const background = new Image();
    background.src = 'A.png';
    
    // When background image is loaded, draw it and then the uploaded images
    background.onload = () => {
        // Draw the background image A
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        const fileInput = document.getElementById('imageUpload');
        const files = Array.from(fileInput.files);

        // Coordinates for the top-left positions of each image
        const positions = [
            { x: 200, y: 370 }, { x: 826, y: 370 },
            { x: 200, y: 673 }, { x: 826, y: 673 },
            { x: 200, y: 976 }, { x: 826, y: 976 },
            { x: 200, y: 1280 }, { x: 826, y: 1280 },
            { x: 200, y: 1580 }, { x: 826, y: 1580 }
        ];

        // Check if there are uploaded files
        if (files.length === 0) {
            alert("Please upload at least one image.");
            return;
        }

        // Load each uploaded image
        Promise.all(files.map(loadImage)).then((images) => {
            images.forEach((img, i) => {
                const { x, y } = positions[i];
                // Draw the image on the canvas at the correct position and size (626x303)
                ctx.drawImage(img, x, y, 626, 303);
            });

            // Draw Thai text after images are placed
            drawThaiText();
            
            // Enable the download button once the images are placed
            document.getElementById('downloadBtn').disabled = false;
        }).catch((error) => {
            alert("Error loading images: " + error);
        });
    };
}


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

function drawThaiText() {
    const ctx = document.getElementById('resultCanvas').getContext('2d');
    
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
    const canvas = document.getElementById('resultCanvas');
    const imgData = canvas.toDataURL('image/png');
    
    // Get the input values (prefix, firstName, lastName)
    const prefix = document.getElementById('prefix').value;
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;

    // Combine คำนำหน้าชื่อ + ชื่อ
    const fullName = prefix + " " + firstName + " " + lastName;

    // Get current date and time
    const now = new Date();
    const date = now.toISOString().split('T')[0];  // Get date in YYYY-MM-DD format
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');  // Get time in HH-MM-SS format

    // Construct the filename with the format: "Name_YYYY-MM-DD_HH-MM-SS.pdf"
    const filename = `${fullName}_${date}_${time}.pdf`;


    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('portrait', 'px', [canvas.width, canvas.height]);

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);

    const pdfBlob = pdf.output('blob');

    const blobUrl = URL.createObjectURL(pdfBlob);

    const newTab = window.open(blobUrl, '_blank');
    if (!newTab) {
        alert('Please allow popups to open the PDF in a new tab.');
    }

    // Optional: Download automatically
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.click();

    // Clean up the blob URL after a short delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
}


