const escpos = require('escpos');
escpos.USB = require('escpos-usb');

// console.log(escpos.USB.findPrinter())
//const device = new escpos.USB(0x0FE6, 0x811E);
const device = new escpos.Network('17.253.83.205');

const options = { encoding: "GB18030" /* default */ }
// encoding is optional

const printer = new escpos.Printer(device, options);
//http://17.253.83.205/
device.open(function(error){
  printer
  .font('sans')
  .align('ct')
  .style('bu')
  .size(1, 1)
  .text('The quick brown fox jumps over the lazy dog')
  .text('敏捷的棕色狐狸跳过懒狗')
  .barcode('1234567', 'EAN8')
  .table(["One", "Two", "Three"])
  .tableCustom(
    [
      { text:"Left", align:"LEFT", width:0.33, style: 'B' },
      { text:"Center", align:"CENTER", width:0.33},
      { text:"Right", align:"RIGHT", width:0.33 }
    ],
    { encoding: 'cp857', size: [1, 1] } // Optional
  )
  .qrimage('https://github.com/song940/node-escpos', function(err){
    this.cut();
    this.close();
  });
});