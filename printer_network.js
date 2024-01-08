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

'use strict';
// const escpos = require('..');
const path = require('path');
const escpos = require('escpos')

const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

escpos.Network = require('escpos-network');
const EventEmitter = require('events');
class PrinterEmitter extends EventEmitter { }
const printerEmitter = new PrinterEmitter();

function printer_network(networkIp, fileName, queue) {
  console.log(fileName)
  const sec = fileName.substring(36, fileName.length - 4);
  console.log(sec)

  const device = new escpos.Network(networkIp);

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
    });
  });

  //printer end
}

module.exports = {
  printer_network: printer_network,
  printerEmitter // Export the emitter

};