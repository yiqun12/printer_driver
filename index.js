// Copyright 2024 Eatifydash

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const opn = require('opn');
const open = require('open');
const { exec } = require('child_process');
const { printPngFile } = require('node-brother-label-printer');
//const QRCode = require('qrcode');
//const path = require('path');
const QRCode = require('qr-image');
const sharp = require('sharp');
const fs = require('fs');

const app = express();
// const { reciptNode_tips_customer } = require('./reciptNode_tips_customer');
const { PNGMerchantReceipt } = require('./PNGMerchantReceipt');
// const { reciptNode_tips_merchant_terminal } = require('./reciptNode_tips_merchant_terminal')
const { PNGOrderList } = require('./PNGOrderList')

const { PNGKitchenPlace } = require('./PNGKitchenPlace')
const { bankReceipt } = require('./bankReceipt')
const { PNGKitchenCancel } = require('./PNGKitchenCancel')

const { printer_cashdraw } = require('./printer_cashdraw')
//const { printer_network } = require('./printer_network')
const { printer_usb, printerEmitter } = require('./printer_usb')

const { v4: uuidv4 } = require('uuid');
var Ptouch = require('node-ptouch');
var usb = require('usb');
//To Do: 以下几个变量可以变成dynamic
const back_vendorID = 0x04B8
const back_productId = 0x0E20
const front_vendorID = 0x04B8
const front_productId = 0x0202

const back_networkIp = false
const front_networkIp = false
const kiosk = false
const BilanguageMode = true
const label_vendorId = 0x04f9 //for ur brother label printer
const label_productId = 0x209D

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Route to serve the EJS view
app.get('/', (req, res) => {
    res.render('index');
});

let printQueue = [];
const EventEmitter = require('events');
class QueueEmitter extends EventEmitter { }
const queueEmitter = new QueueEmitter();
// Override the push method of printQueue
const originalPush = printQueue.push;
printQueue.push = function (...args) {
    originalPush.apply(this, args);
    queueEmitter.emit('updated', this);
};

function formatPhoneNumber(phoneNumber) {
    // Extract the first 3, next 3, and last 4 digits
    var part1 = phoneNumber.slice(0, 3);
    var part2 = phoneNumber.slice(3, 6);
    var part3 = phoneNumber.slice(6);

    // Combine the parts with dashes
    return part1 + '-' + part2 + '-' + part3;
}
// Listener function to react to changes in printQueue
queueEmitter.on('updated', (updatedQueue) => {
    console.log('Queue updated:', updatedQueue);
    updatedQueue.forEach(item => {
        console.log(updatedQueue.length)
        if (updatedQueue.length === 1) {
            //console.log(item.vendorId)
            //console.log(item.productId)

            printer_usb(item.vendorId, item.productId, item.fileName, updatedQueue, item?.networkIp);
        }
    });
    // Perform any additional actions needed when the queue updates
});
printerEmitter.on('deleted', (fileName, queue) => {
    console.log(`Item with filename ${fileName} is going to be deleted from the queue.`);
    console.log(queue)
    console.log(queue.length)
    if (queue.length !== 0) {
        //console.log(item.vendorId)
        //console.log(item.productId)
        printer_usb(queue[0].vendorId, queue[0].productId, queue[0].fileName, queue, queue[0]?.networkIp);
    }

    // Perform additional actions if necessary
});

// Endpoint to accept data from the client
app.post('/MerchantReceipt', (req, res) => {
    const data = req.body;
    console.log("MerchantReceipt")
    const randomUuid = uuidv4();

    let restaurant_name_CHI = req.body.storeNameCHI
    let restaurant_name = req.body.storeName
    let restaurant_address_1 = req.body.storeAddress
    let restaurant_address_2 = req.body.storeCityAddress + ' ' + req.body.storeState + ' ' + req.body.storeZipCode
    let restaurant_phone = req.body.storePhone
    if (req.body.data && req.body.data.length !== 0) {//empty

        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: PNGMerchantReceipt(
                randomUuid,
                JSON.stringify(req.body.data), req.body.selectedTable,
                req.body.discount,
                req.body.service_fee,
                req.body.total,
                restaurant_name_CHI,
                restaurant_name,
                restaurant_address_1,
                restaurant_address_2,
                formatPhoneNumber(restaurant_phone),
                "Merchant Copy"
            ), networkIp: front_networkIp
        });
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/CustomerReceipt', (req, res) => {
    const data = req.body;
    console.log("CustomerReceipt")
    // const updatedJsonString = JSON.stringify(req.body.data.map(obj => ({ ...obj, itemTotalPrice: parseFloat(obj.itemTotalPrice) })));
    const randomUuid = uuidv4();
    let restaurant_name_CHI = req.body.storeNameCHI
    let restaurant_name = req.body.storeName
    let restaurant_address_1 = req.body.storeAddress
    let restaurant_address_2 = req.body.storeCityAddress + ' ' + req.body.storeState + ' ' + req.body.storeZipCode
    let restaurant_phone = req.body.storePhone
    if (req.body.data && req.body.data.length !== 0) {//empty
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: PNGMerchantReceipt(
                randomUuid,
                JSON.stringify(req.body.data), req.body.selectedTable,
                req.body.discount,
                req.body.service_fee,
                req.body.total,
                restaurant_name_CHI,
                restaurant_name,
                restaurant_address_1,
                restaurant_address_2,
                formatPhoneNumber(restaurant_phone),
                "Customer Copy"
            ), networkIp: front_networkIp
        });
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/SendToKitchen', (req, res) => {
    const data = req.body;
    console.log("sendToKitchen")
    const randomUuid = uuidv4();
    // printer_network('192.168.1.204', "kitchen.png")
    const currentDate = new Date();
    if (req.body.data && req.body.data.length !== 0) {//empty
        for (let item of req.body.data) {
            for (let i = 0; i < item.quantity; i++) {
                //console.log(item.name)
            }
        }
        const picname = PNGKitchenPlace(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)

        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname, networkIp: back_networkIp
        });//front desk


        const randomUuid2 = uuidv4();
        const picname2 = PNGKitchenPlace(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: picname2, networkIp: front_networkIp
        });//back desk
        //enable this if you need a extra print in the backend
        const randomUuid3 = uuidv4();
        const picname3 = PNGKitchenPlace(randomUuid3, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname3, networkIp: back_networkIp
        });//back desk
        const randomUuid4 = uuidv4();
        const picname4 = PNGKitchenPlace(randomUuid4, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname4, networkIp: back_networkIp
        });//back desk
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/PrintQRcode', (req, res) => {
    const data = req.body;
    console.log("PrintQRcode");

    const ensureFolderExists = (folderPath) => {
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }
    };

    const qrcodeFolder = path.join(__dirname, 'qrcode');
    ensureFolderExists(qrcodeFolder);

    data.forEach((item, index) => {
        const tableParam = item.split('-');
        const prefix = tableParam[0];
        const suffix = tableParam[1];
        const url = `https://eatifydash.com/store?store=${prefix}&table=${suffix}`;
        const outputFilePath = path.join(qrcodeFolder, `sample-qrcode-${index}.png`);
        const options = {
            width: 720,
            height: 720,
            textHeight: 100,
            sampleHeight: 870, // sample.png height (720px) + 150px extra height
        };

        const qrSvg = QRCode.image(url, { type: 'png', size: options.width / 10 });
        const qrPngBuffer = [];

        qrSvg.on('data', chunk => qrPngBuffer.push(chunk));
        qrSvg.on('end', async () => {
            const qrBuffer = Buffer.concat(qrPngBuffer);

            const qrImage = sharp(qrBuffer)
                .resize(options.width, options.height);

            const textImage = sharp({
                create: {
                    width: options.width,
                    height: options.textHeight,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                }
            })
            .composite([{
                input: Buffer.from(`<svg width="${options.width}" height="${options.textHeight}">
                    <text x="50%" y="50%" font-size="40" text-anchor="middle" fill="black">${suffix}</text>
                </svg>`),
                top: 0,
                left: 0
            }]);

            const combinedQrImage = await qrImage
                .extend({
                    top: 0,
                    bottom: options.textHeight,
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .composite([{ input: await textImage.png().toBuffer(), top: options.height, left: 0 }])
                .toBuffer();

            const sampleImagePath = path.join(__dirname, 'sample.png');
            const sampleImage = sharp(sampleImagePath)
                .resize(options.width, options.sampleHeight);

            const finalImage = await sharp({
                create: {
                    width: options.width,
                    height: options.sampleHeight + options.height + options.textHeight,
                    channels: 4,
                    background: { r: 255, g: 255, b: 255, alpha: 1 }
                }
            })
            .composite([
                { input: await sampleImage.png().toBuffer(), top: 0, left: 0 },
                { input: combinedQrImage, top: options.sampleHeight, left: 0 }
            ])
            .png()
            .toBuffer();

            await sharp(finalImage).toFile(outputFilePath);

            console.log('Sample image and QR code combined and saved to', outputFilePath);

            // Assuming printPngFile is a function defined elsewhere in your code
            printPngFile({
                vendorId: label_vendorId,
                productId: label_productId,
                filename: outputFilePath,
                options: { landscape: false, labelWidth: "62-mm-wide continuous" },
                compression: { enable: true }
            });
        });
    });

    res.send({ success: true, message: "Data received successfully" });
});

app.post('/listOrder', (req, res) => {
    const data = req.body;
    console.log("listOrder")
    const randomUuid = uuidv4();
    if (req.body.data && req.body.data.length !== 0) {//empty

        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: PNGOrderList(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable),
            networkIp: front_networkIp
        });

    }
    //front desk
    // printQueue.push({
    //     vendorId: 0x0FE6, productId: 0x811E, fileName: PNGKitchenPlace(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable,
    //     )
    // });//back desk
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/DeletedSendToKitchen', (req, res) => {
    const data = req.body;
    const randomUuid = uuidv4();
    const currentDate = new Date();
    console.log("DeletedSendToKitchen")
    if (req.body.data && req.body.data.length !== 0) {//empty

        const picname = PNGKitchenCancel(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname, networkIp: back_networkIp
        });//back desk
        const randomUuid2 = uuidv4();
        const picname2 = PNGKitchenCancel(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable, currentDate, BilanguageMode)
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: picname2, networkIp: front_networkIp
        });//back desk
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/bankReceipt', (req, res) => {
    const data = req.body;
    console.log("bankReceipt")
    const randomUuid = uuidv4();

    let restaurant_name_CHI = req.body.storeNameCHI
    let restaurant_name = req.body.storeName
    let restaurant_address_1 = req.body.storeAddress
    let restaurant_address_2 = req.body.storeCityAddress + ' ' + req.body.storeState + ' ' + req.body.storeZipCode
    let restaurant_phone = req.body.storePhone

    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: bankReceipt(
            randomUuid,
            req.body, req.body.metadata.selectedTable,
            restaurant_name_CHI,
            restaurant_name,
            restaurant_address_1,
            restaurant_address_2,
            formatPhoneNumber(restaurant_phone)), networkIp: front_networkIp
    });
    res.send({ success: true, message: "Data received successfully" });
});


app.post('/OpenCashDraw', (req, res) => {
    const data = req.body;
    printer_cashdraw(front_vendorID, front_productId, front_networkIp)
    console.log("OpenCashDraw:");
    res.send({ success: true, message: "Data received successfully" });
});


app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
    if (kiosk) {
        open('https://eatify-22231.web.app/account', {
            app: {
                name: open.apps.edge,
                arguments: [
                    '--no-sandbox',
                    '--kiosk',
                    '--force-device-scale-factor=1.0' // Adjusts zoom level to 150%
                ]
            }
        })
            .then(() => {
                console.log('Browser opened in kiosk mode');
            })
            .catch(err => {
                console.error('Failed to open browser in kiosk mode:', err);
            });
    }


    open('https://eatify-22231.web.app/account#code?store=bubbleshop', {
        app: {
            name: open.apps.chrome,
            arguments: [
                '--no-sandbox',
                '--kiosk',
                '--force-device-scale-factor=1.75' // Adjusts zoom level to 150%
            ]
        }
    })
        .then(() => {
            console.log('Browser opened in kiosk mode with Microsoft Edge');
        })
        .catch(err => {
            console.error('Failed to open Microsoft Edge in kiosk mode:', err);
        });
});



