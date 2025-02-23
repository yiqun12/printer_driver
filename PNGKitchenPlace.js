
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
function PNGKitchenPlace(randomUuid, receipt_JSON, selectedTable, currentDate, BilanguageMode) {
    // drawDashedLine will draw you a line (dotted or solid)
    function drawDashedLine(pattern, startx = 20, endx = 400, height = y) {
        context.beginPath();
        context.setLineDash(pattern);
        context.moveTo(startx, height);
        context.lineTo(endx, height);
        context.stroke();
    }
    function calculateTotalLines(font, text, maxWidth) {
        // Create a canvas to measure text width
        const canvas = createCanvas(400, maxWidth)
        const context = canvas.getContext('2d');

        context.font = font;

        let chars = text.split(''); // Split the text into characters
        let currentLine = '';
        let lines = 0;

        for (let char of chars) {
            let testLine = currentLine + char;
            let testWidth = context.measureText(testLine).width;

            if (testWidth > maxWidth && currentLine.length > 0) {
                lines++;
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        // Account for the last line
        if (currentLine.length > 0) {
            lines++;
        }

        return lines;
    }


    // for name shortening for menu item
    function shortenName(name) {
        const maxLength = 8;

        // Split name into individual words
        const words = name.split(' ');

        // If only one word and its length is more than maxLength
        if (words.length === 1 && words[0].length > maxLength) {
            return words[0].slice(0, maxLength - 2) + '..';
        }

        // If multiple words
        let result = '';
        for (let word of words) {
            // If adding the next word exceeds maxLength
            if ((result + word).length > maxLength) {
                if (result.length > 0) {
                    return result.trim();
                } else {
                    return word.slice(0, maxLength - 2) + '..';
                }
            }
            result += word + ' ';
        }

        return result.trim();
    }

    // let products = JSON.parse(`[{"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46","name":"Kung Pao Chicken","subtotal":"1","image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":4,"attributeSelected":{"size":["big"]},"count":"ec842841-afeb-4f42-93f7-0d2b5ae2dc9b","itemTotalPrice":8}]`)
    // let products = JSON.parse(`[{"id":"8d2579fc-bd3a-4df0-bde5-8884bcbd2919","name":"Rib Eye Steak","subtotal":1,"image":"https://img2.baidu.com/it/u=3430421176,2577786938&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500","quantity":5,"attributeSelected":{"Weight":["18 oz","20oz"],"size":"bg"},"count":"9224d939-2223-4820-b802-f61ddd9b2879","itemTotalPrice":90},{"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46","name":"Kung Pao Chicken","subtotal":"1","image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":4,"attributeSelected":{"size":["big"]},"count":"81e85da6-c0b4-47e8-aa6a-4ee34fc6be6f","itemTotalPrice":8}]`)
    let products = JSON.parse(receipt_JSON)


    const newItems = products.map(item => {
        return { name: item.name, CHI: item.CHI, quantity: item.quantity, subtotal: item.subtotal, item_Total: item.itemTotalPrice, item_attributes: item?.attributeSelected }
    });


    const width = 285;
    let y = 20;
    let total = 0;
    let lines = 0;
    const lineHeight = 40;

    // adding holder for table number
    const tableNumber = selectedTable

    // const user = {name:change.doc.data().charges.data[0].billing_details.name}
    const user = { name: tableNumber }

    // // add a line for the tablename
    lines += 1;

    // add a line for ripping
    lines += 1;

    const product = newItems
    let extra_line = 0
    //const user = {name:change.doc.data().charges.data[0].billing_details.name}
    product.forEach(item => {
        let name = BilanguageMode ? item.CHI : item.name

        // Check if item.attributeSelected exists and is not null, and it's not an empty object or an empty array
        let x = ""

        for (let key in item.item_attributes) {
            const value = item.item_attributes[key];
            // Check if the value is an array
            if (Array.isArray(value)) {
                value.forEach(item => {
                    x += item + " ";
                });
            }
            // Check if the value is an object (but not an array)
            else if (typeof value === 'object' && value !== null) {
                for (let subkey in value) {
                    x += value[subkey] + " ";
                }
            }
            else {
                x += value + " ";
            }
        }
        let text = item.quantity + " X " + name + " " + x
        if (calculateTotalLines('20pt Sans', text, width) != 1) {
            lines += 1 + 0.5 * (calculateTotalLines('20pt Sans', text, width));
            extra_line += 1
        } else {
            lines += 1;
            //console.log("no")
            //extra_line += 1;
        }
        total += item.item_Total;
    });
    console.log(extra_line, y, lines * lineHeight - 20 * extra_line + 40)
    const canvas = createCanvas(width, lines * lineHeight - 20 * extra_line + 40)
    const context = canvas.getContext('2d')

    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, lines * lineHeight - 20 * extra_line + 40)

    context.font = '20pt Sans'
    context.textAlign = 'left'
    context.fillStyle = '#000'

    // changing font for tableName to be big and bold
    context.font = 'bold 30pt Sans'

    y += 0.5 * lineHeight;

    // putting in the tableName
    context.fillText(`${tableNumber}`, 40, y);

    // puttingn the time
    context.font = '30pt Sans'
    // y -= 0.25 * lineHeight;

    function formatWithLeadingZero(number) {
        return number.toString().padStart(2, '0');
    }
    function getLastDigit(number) {
        const numberString = number.toString();
        return numberString.charAt(numberString.length - 1);
    }

    // Get the current date and time
    //const currentDate = new Date();

    // Format the date and time as "mm/dd/yy hr:minute:seconds"
    const formattedDateTime =
        `#${formatWithLeadingZero(currentDate.getHours())}:${formatWithLeadingZero(currentDate.getMinutes())}`;

    context.textAlign = 'end'
    y += lineHeight;

    // context.fillText(`${meal_option}`, 255, y);
    context.fillText(`${formattedDateTime}`, 120, y);
    context.textAlign = 'left'

    // y += 0.25 * lineHeight;


    // changing back the font
    context.font = '20pt Sans'

    //context.fillText(`${tableNumber}`, 20, y);
    y += lineHeight;

    product.forEach(item => {
        // changing the name so that it can only be 20 characters
        let name = BilanguageMode ? item.CHI : item.name

        //context.fillText(`${name} x ${item.quantity}`, 10, y);
        //y += 0.5 * lineHeight;

        // Check if there are attributes
        // change fonts to smaller font
        context.font = '20pt Sans'
        // attributes string
        let x = ""

        for (let key in item.item_attributes) {
            const value = item.item_attributes[key];

            // Check if the value is an array
            if (Array.isArray(value)) {
                value.forEach(item => {
                    x += item + " ";
                });
            }
            // Check if the value is an object (but not an array)
            else if (typeof value === 'object' && value !== null) {
                for (let subkey in value) {
                    x += value[subkey] + " ";
                }
            }
            else {
                x += value + " ";
            }
        }

        //Adjust the loop to concatenate characters until the line width exceeds the limit.
        let attributesChar = item.quantity + " X " + name + " " + x
        let chars = attributesChar.split(''); // Split the text into characters
        let currentLine = '';
        let lines = [];
        for (let char of chars) {
            let testLine = currentLine + char;
            let testWidth = context.measureText(testLine).width;

            if (testWidth > width && currentLine.length > 0) {
                lines.push(currentLine);
                currentLine = char;
            } else {
                currentLine = testLine;
            }
        }

        // Push the last line if any
        if (currentLine.length > 0) {
            lines.push(currentLine);
        }

        // Print each line
        for (let line of lines) {
            context.fillText(line, 0, y);
            y += 0.5 * lineHeight; // Move to the next line
        }
        y += 0.5 * lineHeight;
        context.font = '20pt Sans'
    })
    console.log(y)

    const height = canvas.height
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./' + randomUuid + parseInt(height * 4.05).toString() + '.png', buffer)

    return randomUuid + parseInt(height * 4.05).toString() + '.png'

    //picture generation ends

}

module.exports = {
    PNGKitchenPlace: PNGKitchenPlace
};