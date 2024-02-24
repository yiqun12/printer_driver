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

const app = express();
// const { reciptNode_tips_customer } = require('./reciptNode_tips_customer');
const { reciptNode_tips_copy } = require('./reciptNode_tips_copy');
// const { reciptNode_tips_merchant_terminal } = require('./reciptNode_tips_merchant_terminal')
const { reciptNode_print_order_list } = require('./reciptNode_print_order_list')

const { reciptNode_kitchen } = require('./reciptNode_kitchen')
const { bankReceipt } = require('./bankReceipt')
const { reciptNode_kitchen_cancel_item } = require('./reciptNode_kitchen_cancel_item')

const { printer_cashdraw } = require('./printer_cashdraw')
const { printer_network } = require('./printer_network')
const { printer_usb, printerEmitter } = require('./printer_usb')
const { v4: uuidv4 } = require('uuid');

const back_vendorID = 0x0FE6
const back_productId = 0x811E
const front_vendorID = 0x04B8
const front_productId = 0x0202



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
    //console.log('Queue updated:', updatedQueue);
    updatedQueue.forEach(item => {
        // Pass the queue itself to the printer_usb function
        //console.log(updatedQueue.length)
        if (updatedQueue.length === 1) {
            //console.log(item.vendorId)
            //console.log(item.productId)

            printer_usb(item.vendorId, item.productId, item.fileName, updatedQueue);
        }
    });
    // Perform any additional actions needed when the queue updates
});
printerEmitter.on('deleted', (fileName, queue) => {
    //console.log(`Item with filename ${fileName} was deleted from the queue.`);
    console.log(queue)
    // Pass the queue itself to the printer_usb function
    console.log(queue.length)
    if (queue.length !== 0) {
        //console.log(item.vendorId)
        //console.log(item.productId)
        printer_usb(queue[0].vendorId, queue[0].productId, queue[0].fileName, queue);
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

        //printer_usb(0x0FE6, 0x0FE6, "merchant.png")
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_tips_copy(
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
            )
        });
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/CustomerReceipt', (req, res) => {
    const data = req.body;
    console.log("CustomerReceipt")
    // const updatedJsonString = JSON.stringify(req.body.data.map(obj => ({ ...obj, itemTotalPrice: parseFloat(obj.itemTotalPrice) })));
    // console.log(updatedJsonString)
    const randomUuid = uuidv4();
    let restaurant_name_CHI = req.body.storeNameCHI
    let restaurant_name = req.body.storeName
    let restaurant_address_1 = req.body.storeAddress
    let restaurant_address_2 = req.body.storeCityAddress + ' ' + req.body.storeState + ' ' + req.body.storeZipCode
    let restaurant_phone = req.body.storePhone
    if (req.body.data && req.body.data.length !== 0) {//empty
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_tips_copy(
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
            )
        });
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/SendToKitchen', (req, res) => {
    const data = req.body;
    //console.log(JSON.stringify(req.body.data))
    const randomUuid = uuidv4();
    //console.log(randomUuid);
    // printer_network('192.168.1.204', "kitchen.png")
    const currentDate = new Date();
    if (req.body.data && req.body.data.length !== 0) {//empty

        const picname = reciptNode_kitchen(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable, currentDate)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname
        });//front desk
        const randomUuid2 = uuidv4();
        const picname2 = reciptNode_kitchen(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable, currentDate)
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: picname2
        });//back desk

        const randomUuid3 = uuidv4();
        const picname3 = reciptNode_kitchen(randomUuid3, JSON.stringify(req.body.data), req.body.selectedTable, currentDate)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname3
        });//back desk
        // printQueue.push({
        //     vendorId: 0x0FE6, productId: 0x811E, fileName: reciptNode_kitchen(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable,
        //     )
        // });//back desk
        //console.log("SendToKitchen:", data);
    }
    res.send({ success: true, message: "Data received successfully" });
});
app.post('/listOrder', (req, res) => {
    const data = req.body;
    //console.log(JSON.stringify(req.body.data))
    const randomUuid = uuidv4();
    console.log(data)
    //console.log(randomUuid);
    // printer_network('192.168.1.204', "kitchen.png")
    if (req.body.data && req.body.data.length !== 0) {//empty

        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_print_order_list(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable)
        });

    }
    //front desk
    // printQueue.push({
    //     vendorId: 0x0FE6, productId: 0x811E, fileName: reciptNode_kitchen(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable,
    //     )
    // });//back desk
    console.log("good")
    //console.log("SendToKitchen:", data);
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/DeletedSendToKitchen', (req, res) => {
    const data = req.body;
    //console.log(JSON.stringify(req.body.data))
    const randomUuid = uuidv4();
    const currentDate = new Date();
    console.log(currentDate)
    if (req.body.data && req.body.data.length !== 0) {//empty

        const picname = reciptNode_kitchen_cancel_item(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable, currentDate)
        printQueue.push({
            vendorId: back_vendorID, productId: back_productId, fileName: picname
        });//back desk
        const randomUuid2 = uuidv4();
        const picname2 = reciptNode_kitchen_cancel_item(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable, currentDate)
        printQueue.push({
            vendorId: front_vendorID, productId: front_productId, fileName: picname2
        });//back desk
    }
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/bankReceipt', (req, res) => {
    const data = req.body;
    console.log("bankReceipt")
    //console.log(req.body)
    const randomUuid = uuidv4();

    let restaurant_name_CHI = req.body.storeNameCHI
    let restaurant_name = req.body.storeName
    let restaurant_address_1 = req.body.storeAddress
    let restaurant_address_2 = req.body.storeCityAddress + ' ' + req.body.storeState + ' ' + req.body.storeZipCode
    let restaurant_phone = req.body.storePhone

    //printer_usb(0x0FE6, 0x0FE6, "merchant.png")
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: bankReceipt(
            randomUuid,
            req.body, req.body.metadata.selectedTable,
            restaurant_name_CHI,
            restaurant_name,
            restaurant_address_1,
            restaurant_address_2,
            formatPhoneNumber(restaurant_phone))
    });
    res.send({ success: true, message: "Data received successfully" });
});


app.post('/OpenCashDraw', (req, res) => {
    const data = req.body;
    printer_cashdraw(front_vendorID, front_productId)
    console.log("OpenCashDraw:", data);
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/init', (req, res) => {
    const data = req.body;
    console.log("init:", data.id);

    opn(`https://eatify-22231.web.app/account#code?store=${data.id}`).then(() => {
        res.send({ success: true, message: "Data received successfully and browser opened" });
    }).catch(err => {
        console.error(err);
        res.status(500).send({ success: false, message: "Failed to open browser" });
    });
});


app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
    opn(`https://eatify-22231.web.app/account`).then(() => {
    }).catch(err => {
        console.error(err);
    });
});