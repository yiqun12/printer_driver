//printer
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