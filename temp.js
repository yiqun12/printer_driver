const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const { reciptNode_tips_customer } = require('./reciptNode_tips_customer');
const { reciptNode_tips_merchant } = require('./reciptNode_tips_merchant');
const { reciptNode_tips_merchant_terminal } = require('./reciptNode_tips_merchant_terminal')
const { reciptNode_print_order_list } = require('./reciptNode_print_order_list')

const { reciptNode_kitchen } = require('./reciptNode_kitchen')
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
    console.log(randomUuid);

    //printer_usb(0x0FE6, 0x0FE6, "merchant.png")
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_tips_merchant(
            randomUuid, JSON.stringify(req.body.data), req.body.selectedTable,
            req.body.discount,
            req.body.service_fee,
            req.body.total,
        )
    });
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/CustomerReceipt', (req, res) => {
    const data = req.body;
    console.log("CustomerReceipt")
    // const updatedJsonString = JSON.stringify(req.body.data.map(obj => ({ ...obj, itemTotalPrice: parseFloat(obj.itemTotalPrice) })));
    // console.log(updatedJsonString)
    const randomUuid = uuidv4();
    console.log(randomUuid);
    reciptNode_tips_customer(
        randomUuid,
        JSON.stringify(req.body.data), req.body.selectedTable,
        req.body.discount,
        req.body.service_fee,
        req.body.total,
    )
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_tips_customer(
            randomUuid,
            JSON.stringify(req.body.data), req.body.selectedTable,
            req.body.discount,
            req.body.service_fee,
            req.body.total,
        )
    });
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/SendToKitchen', (req, res) => {
    const data = req.body;
    //console.log(JSON.stringify(req.body.data))
    const randomUuid = uuidv4();
    //console.log(randomUuid);
    // printer_network('192.168.1.204', "kitchen.png")
    const picname = reciptNode_kitchen(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable)
    printQueue.push({
        vendorId: back_vendorID, productId: back_productId, fileName: picname
    });//front desk
    const randomUuid2 = uuidv4();
    const picname2 = reciptNode_kitchen(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable)
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: picname2
    });//back desk

    const randomUuid3 = uuidv4();
    const picname3 = reciptNode_kitchen(randomUuid3, JSON.stringify(req.body.data), req.body.selectedTable)
    printQueue.push({
        vendorId: back_vendorID, productId: back_productId, fileName: picname3
    });//back desk

    res.send({ success: true, message: "Data received successfully" });
});
app.post('/listOrder', (req, res) => {
    const data = req.body;
    //console.log(JSON.stringify(req.body.data))
    const randomUuid = uuidv4();
    console.log(data)
    //console.log(randomUuid);
    // printer_network('192.168.1.204', "kitchen.png")
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: reciptNode_print_order_list(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable)
    });//front desk
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
    //console.log(randomUuid);
    const picname = reciptNode_kitchen_cancel_item(randomUuid, JSON.stringify(req.body.data), req.body.selectedTable)
    printQueue.push({
        vendorId: back_vendorID, productId: back_productId, fileName: picname
    });//back desk
    const randomUuid2 = uuidv4();
    const picname2 = reciptNode_kitchen_cancel_item(randomUuid2, JSON.stringify(req.body.data), req.body.selectedTable)
    printQueue.push({
        vendorId: front_vendorID, productId: front_productId, fileName: picname2
    });//back desk
    res.send({ success: true, message: "Data received successfully" });
});

app.post('/OpenCashDraw', (req, res) => {
    const data = req.body;
    printer_cashdraw(front_vendorID, front_productId)
    console.log("OpenCashDraw:", data);
    res.send({ success: true, message: "Data received successfully" });
});

app.listen(3001, () => {
    console.log('Server is running on http://localhost:3001');
});