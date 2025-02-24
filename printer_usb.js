
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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


function printer_usb(hex1, hex2, fileName, queue, networkIp) {

  const sec = fileName.substring(36, fileName.length - 4);
  console.log("time")
  console.log(parseInt(sec) + 1000)
  let device
  //const device  = new escpos.Network(networkIp);
  //const device = new escpos.USB(0x0FE6, 0x811E);
  console.log("🖨️ Printing:", fileName);
  try {
    if (networkIp) {
      console.log("🌐 Using network printer:", networkIp);
      device = new escpos.Network(networkIp);

    } else {
      console.log("🔌 Using USB printer:", hex1, hex2);
      device = new escpos.USB(hex1, hex2);
    }

    // const device = new escpos.USB()
    const options = { encoding: "GB18030" }


    const printer = new escpos.Printer(device, options);

    // const tux = path.join(__dirname, 'tux.png');
    const tux = path.join(__dirname, fileName);
    //end of printer
    // **设置 device.open() 超时**
    let openTimedOut = false;
    const openTimeoutId = setTimeout(() => {
      console.error("⏳ Device open timeout! Skipping task...");
      openTimedOut = true;
      queue.shift(); // **移除当前任务**
      printerEmitter.emit('deleted', fileName, queue);
      if (device) device.close();
    }, parseInt(sec) + 1000); // **2秒超时**

    //printer start
    return new Promise((resolve, reject) => {
      escpos.Image.load(tux, function (image) {
        console.log("⌛ Waiting for device.open()...");

        device.open(function () {
          if (openTimedOut) {
            console.warn("⚠️ Device opened after timeout, ignoring...");
            return;
          }
          clearTimeout(openTimeoutId); // **成功打开设备，清除超时**

          console.log("✅ Device opened successfully!");
          printer
            .align('ct')
            .size(2, 2)
            .image(image, 's8')
            .then(() => {
              console.log("🖨️ Printing completed");
              printer.beep(3, 2);
              printer.cut('PARTIAL').close(() => resolve());
              setTimeout(function () {
                console.log("🗑️ Deleting file:", fileName);

                // Assuming 'queue' is the array containing your print jobs
                // Remove an item with fileName
                try {
                  fs.unlinkSync(fileName);
                  console.log('File successfully deleted' + fileName);
                } catch (err) {
                  console.error("Error deleting file:", err);
                }
                const index = queue.findIndex(item => item.fileName === fileName);
                if (index !== -1) {//didnt find, go next
                  queue.splice(index, 1);
                }
                printerEmitter.emit('deleted', fileName, queue);

              }, parseInt(sec));

            })
            .catch(err => {
              console.error("🚨 Printing error:", err);
              clearTimeout(timeoutId); // **清除超时**
              queue.shift(); // **移除当前任务**
              printerEmitter.emit('deleted', fileName, queue);
              if (device) device.close();
            });
        })

          ;

      });
    });
  } catch (err) {
    console.error("An error occurred in printer_usb:", err);
    const index = queue.findIndex(item => item.fileName === fileName);
    if (index !== -1) {//didnt find, go next
      queue.splice(index, 1);
    }
    printerEmitter.emit('deleted', fileName, queue);
    if (device) device.close();
    //reject(err);

    //printerEmitter.emit('deleted', fileName, queue);
  }
  //printer end
}



module.exports = {
  printer_usb: printer_usb,
  printerEmitter // Export the emitter
};

