//printer
'use strict';
// const escpos = require('..');
const path = require('path');
const escpos = require('escpos')
escpos.USB = require('escpos-usb');

const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

escpos.Network = require('escpos-network');
const EventEmitter = require('events');
class PrinterEmitter extends EventEmitter { }
const printerEmitter = new PrinterEmitter();


function printer_usb(hex1, hex2, fileName, queue) {
  console.log(fileName)
  const sec = fileName.substring(36, fileName.length - 4);
  console.log(sec)
  //const device  = new escpos.Network(networkIp);
  //const device = new escpos.USB(0x0FE6, 0x811E);
  const device = new escpos.USB(hex1, hex2);
  // console.log("hello")

  // const device = new escpos.USB()
  const options = { encoding: "GB18030" }
  // const device  = new escpos.RawBT();
  // const device  = new escpos.Network('localhost');
  // const device  = new escpos.Serial('/dev/usb/lp0');
  // const printer = new escpos.Printer(device, options);
  const printer = new escpos.Printer(device, options);

  // const tux = path.join(__dirname, 'tux.png');
  const tux = path.join(__dirname, fileName);
  //end of printer


  //printer start

  return new Promise((resolve, reject) => {
    escpos.Image.load(tux, function (image) {
      device.open(function () {
        printer
          .align('ct')
          .size(2, 2)
          .image(image, 's8')
          .then(() => {
            printer.cut('PARTIAL').close(() => resolve());
            setTimeout(function () {
              // Assuming 'queue' is the array containing your print jobs
              // Remove an item with fileName
              try {
                fs.unlinkSync(fileName);
                console.log('File successfully deleted');
              } catch (err) {
                console.error("Error deleting file:", err);
              }
              const index = queue.findIndex(item => item.fileName === fileName);
              if (index !== -1) {
                queue.splice(index, 1);
              }
              printerEmitter.emit('deleted', fileName, queue);

            }, parseInt(sec));

          })
          .catch(err => {
            reject(err);
            device.close();
          });
      });
      const statusCommand = Buffer.from([0x1B, 0x76]); // ESC v
      device.write(statusCommand, function (err) {
        if (err) {
          console.error("Error sending status command:", err);
        } else {
          // The response should be handled here
          // You need to read from the device to get the status
          // This might be tricky as it depends on how the escpos module and your printer handle responses
        }
      });
    });
  });


  //printer end
}



module.exports = {
  printer_usb: printer_usb,
  printerEmitter // Export the emitter
};

