const { printPngFile } = require('node-brother-label-printer');
const fs = require('fs');
const path = require('path');

const qrcodeFolder = path.join(__dirname, 'qrcode');
const label_vendorId = 0x04f9 //for ur brother label printer
const label_productId = 0x209D

const ensureFolderExists = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
};

ensureFolderExists(qrcodeFolder);

fs.readdir(qrcodeFolder, (err, files) => {
    if (err) {
        console.error('Error reading directory:', err);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(qrcodeFolder, file);

        printPngFile({
            vendorId: label_vendorId,
            productId: label_productId,
            filename: filePath,
            options: { landscape: false, labelWidth: "62-mm-wide continuous" }, // or "102-mm-wide continuous"
            compression: { enable: true }
        });
    });
});
