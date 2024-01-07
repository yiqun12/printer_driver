const usb = require('usb');

const VENDOR_ID = 0x0FE6;
const PRODUCT_ID = 0x811E;

// Find the printer device
const device = usb.findByIds(VENDOR_ID, PRODUCT_ID);
const escpos = require('escpos');
escpos.USB = require('escpos-usb');

console.log(escpos.USB.findPrinter())

if (!device) {
  console.log('Printer not found');
  process.exit();
}

try {
  device.open();

  // Select the appropriate interface
  const interface = device.interface(0);

  // Detach the kernel driver if it's active
  if (interface.isKernelDriverActive()) {
    interface.detachKernelDriver();
  }

  interface.claim();

  // Assuming endpoint 0x02 is correct for your printer
  const endpoint = interface.endpoint(0x02);

  // Status command for the printer
  const statusCommand = Buffer.from([0x1B, 0x76]);

  endpoint.transfer(statusCommand, (error, data) => {
    if (error) {
      console.log('Transfer error:', error);
    } else {
      console.log('Status command sent, awaiting response...');

      // Logic to interpret the response goes here
      // This will vary depending on your printer's protocol
      if (data) {
        console.log('Received data:', data);
        // Check the appropriate bit for "No Paper" status
        // Example: if (data[0] & SOME_BIT) console.log('No Paper');
      }
    }

    // Release the interface and close the device
    interface.release(() => {
      device.close();
      console.log('Device released');
    });
  });

} catch (error) {
  console.error('Error:', error);
}
