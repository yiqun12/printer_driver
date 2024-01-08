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
escpos.USB = require('escpos-usb');

const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')

escpos.Network = require('escpos-network');


function printer_cashdraw(hex1,hex2) {

//const device  = new escpos.Network(networkIp);
const device = new escpos.USB(hex1, hex2);

// console.log("hello")

// const device = new escpos.USB()
const options = { encoding: "GB18030" }
// const device  = new escpos.RawBT();
// const device  = new escpos.Network('localhost');
// const device  = new escpos.Serial('/dev/usb/lp0');
// const printer = new escpos.Printer(device, options);
const printer = new escpos.Printer(device, options);

      device.open(function () {

        try {
          printer.cashdraw(2).close();
        } catch (error) {
          if (error instanceof CashDrawerError) {
            // handle the cash drawer error here
            console.error("An error occurred while opening the cash drawer:", error);
          } else {
            // handle other errors here
            console.error("An unknown error occurred:", error);
          }
        }

    });

    //printer end
}


module.exports = {
    printer_cashdraw: printer_cashdraw
};