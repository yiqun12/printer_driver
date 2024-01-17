const fs = require('fs');
const path = require('path');

// Path to the new index.js file
const newIndexJsPath = path.join(__dirname, 'new-escpos-usb.js');

// Path to the index.js in escpos-usb within node_modules
const targetIndexJsPath = path.join(__dirname, 'node_modules', 'escpos-usb', 'index.js');

// Function to copy the new index.js to the target location
function replaceIndexJs() {
    fs.copyFile(newIndexJsPath, targetIndexJsPath, (err) => {
        if (err) {
            console.error('Error while copying file:', err);
            return;
        }
        console.log('index.js replaced successfully.');
    });
}

// Run the replacement function
replaceIndexJs();
