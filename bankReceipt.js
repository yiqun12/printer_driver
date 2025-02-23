
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
// const app = express();
function toFixTwo(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
}
function bankReceipt(randomUuid, receipt_JSON, selectedTable, restaurant_name_CHI,
    restaurant_name,
    restaurant_address_1,
    restaurant_address_2,
    restaurant_phone) {
    /**generate new png picture receipt */
    const width = 300
    let y = 20;
    let subtotal = 0
    // let total = 0;
    let lines = 18;
    const lineHeight = 15;

    const horrizontal_max_right = 255;

    // drawDashedLine will draw you a line (dotted or solid)
    function drawDashedLine(context, pattern, y, lineHeight, textDrawingFunctions, startx = 0, endx = horrizontal_max_right) {
        // Increment the callCount to allocate space for the dashed line
        textDrawingFunctions.incrementCallCount();

        context.beginPath();
        context.setLineDash(pattern);

        // Calculate the middle of the lineHeight space allocated for the dashed line
        let lineY = y + lineHeight * (textDrawingFunctions.getCallCount() - 0.25);

        context.moveTo(startx, lineY);
        context.lineTo(endx, lineY);
        context.stroke();
    }

    // section to add template text
    let meal_option = "DINE-IN"

    // lines += 1;
    const canvas = createCanvas(width, lines * lineHeight+40)
    const context = canvas.getContext('2d')

    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, lines * lineHeight)

    context.font = '10pt Sans'
    // context.textAlign = 'left'
    context.fillStyle = '#000'

    function formatWithLeadingZero(number) {
        return number.toString().padStart(2, '0');
    }
    // Get the current date and time
    const currentDate = new Date();

    // Format the date and time as "mm/dd/yy hr:minute:seconds"
    const formattedDateTime = `${formatWithLeadingZero(currentDate.getMonth() + 1)}/` +
        `${formatWithLeadingZero(currentDate.getDate())}/` +
        `${formatWithLeadingZero(currentDate.getFullYear() % 100)}` +
        ` ${formatWithLeadingZero(currentDate.getHours())}:${formatWithLeadingZero(currentDate.getMinutes())}`;

    function createTextDrawingFunction(context, y, lineHeight, horrizontal_max_right) {
        let callCount = 0;

        return {
            drawText: function (textLeft, textRight, alignLeft = 'left', alignRight = 'end') {
                callCount++;

                // Draw the left text
                context.textAlign = alignLeft;
                if (textLeft) {
                    context.fillText(textLeft, alignLeft === 'center' ? horrizontal_max_right / 2 : 0, y + lineHeight * callCount);
                }

                // Draw the right text
                context.textAlign = alignRight;
                if (textRight) {
                    context.fillText(textRight, alignRight === 'center' ? horrizontal_max_right / 2 : horrizontal_max_right, y + lineHeight * callCount);
                }
            },
            incrementCallCount: function (increment = 1) {
                callCount += increment;
            },
            getCallCount: function () {
                return callCount;
            }
        };
    }

    const myDrawTextOnCanvas = createTextDrawingFunction(context, y, lineHeight, horrizontal_max_right);
    myDrawTextOnCanvas.drawText(restaurant_name_CHI, '', 'center');
    myDrawTextOnCanvas.drawText(restaurant_name, '', 'center');
    myDrawTextOnCanvas.drawText(restaurant_address_1, '', 'center');
    myDrawTextOnCanvas.drawText(restaurant_address_2, '', 'center');
    myDrawTextOnCanvas.drawText(restaurant_phone, '', 'center');
    myDrawTextOnCanvas.drawText(`${selectedTable}`, receipt_JSON.displayDate);
    // drawDashedLine(context, [5, 15], y, lineHeight, myDrawTextOnCanvas);
    let paymentMethodDetails = receipt_JSON.payment_method_details;
    let type = paymentMethodDetails.type; // 'card_present'
    myDrawTextOnCanvas.drawText('Card#', 'XXXXXXXXXXXX' + paymentMethodDetails[type]?.last4);
    myDrawTextOnCanvas.drawText('Card Type', paymentMethodDetails[type]?.brands?.toUpperCase());
    myDrawTextOnCanvas.drawText('Card Holder', paymentMethodDetails[type]?.cardholder_name);
    myDrawTextOnCanvas.drawText('Final Charge', "$"+((paymentMethodDetails[type]?.amount_authorized ?? 0) / 100).toFixed(2));
    myDrawTextOnCanvas.drawText('Auth Code:', receipt_JSON.authorization_code);
    myDrawTextOnCanvas.drawText('CH:', receipt_JSON?.id?.substring(3));
    myDrawTextOnCanvas.drawText('FB:', receipt_JSON.docId);
    
    myDrawTextOnCanvas.drawText('', '', 'center');
    myDrawTextOnCanvas.drawText('POWERED BY 7DOLLAR.DELIVERY', '', 'center');
    const height = canvas.height
    const buffer = canvas.toBuffer('image/png')
    //fs.writeFileSync('./merchant.png', buffer)
    fs.writeFileSync('./' + randomUuid + parseInt(height * 4.05).toString() + '.png', buffer)
    return randomUuid + parseInt(height * 4.05).toString() + '.png'
}

module.exports = {
    bankReceipt: bankReceipt
};
