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
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
// const app = express();
function toFixTwo(n) {
    return (Math.round(n * 100) / 100).toFixed(2)
}
function calculateTotalLines(font, text, maxWidth) {
    // Create a canvas to measure text width
    const canvas = createCanvas(400, maxWidth);
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

function PNGMerchantReceipt(randomUuid, receipt_JSON, selectedTable, discount, service_fee, total, restaurant_name_CHI,
    restaurant_name,
    restaurant_address_1,
    restaurant_address_2,
    restaurant_phone, receiptCopyMode) {

    /**generate new png picture receipt */
    const width = 300
    let y = 20;
    let subtotal = 0
    // let total = 0;
    let lines = 0;
    const lineHeight = 15;
    const taxRate = 0.0825;

    const horrizontal_max_right = 255;

    // drawDashedLine will draw you a line (dotted or solid)
    function drawDashedLine(pattern, startx = 0, endx = horrizontal_max_right, height = y) {
        context.beginPath();
        context.setLineDash(pattern);
        context.moveTo(startx, height);
        context.lineTo(endx, height);
        context.stroke();
    }

    // for name shortening for menu item
    function shortenName(name) {
        const maxLength = 25;

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
                    return result.trim() + ' ..';
                } else {
                    return word.slice(0, maxLength - 2) + '..';
                }
            }
            result += word + ' ';
        }

        return result.trim();
    }

    // section to add template text
    let meal_option = "DINE-IN"
    // let restaurant_name_CHI = "台山风味点心"
    // let restaurant_name = "Taishan Taste Dim Sum"
    // let restaurant_address_1 = "1343 Powell Street"
    // let restaurant_address_2 = "SAN FRANCISCO, CA 94133"
    // let restaurant_phone = "415-398-1888"
    lines += 5

    // adding dotted lines
    lines += 0.5

    // adding solid lines
    lines += 0.5

    // adding the subtotal, tax, tips, and total section
    lines += 4

    // add tips section

    lines += 5

    // adding the discount, service_fee
    if (discount != 0) {
        lines += 1
    }

    if (service_fee != 0) {
        lines += 1
    }

    // adding the Merchant Copy message
    lines += 1.5

    // adding the signature section
    lines += 2.5

    // // deleting lines to cut down on space (saves money)
    // lines -= 3

    // dotted lines
    lines += 4

    // for ripping
    lines += 2

    // // const product =newItems
    // const product = [{
    //     name: "eel clay pot",
    //     quantity: 2,
    //     subtotal: 20.00,
    //     item_Total: 40.00,
    //     // chinese: "煎饼"
    // },
    // {
    //     name: "egg fried rice",
    //     quantity: 3,
    //     subtotal: 30.00,
    //     item_Total: 90.00,
    //     // chinese: "麻婆豆腐"
    // }];

    // let products = JSON.parse(`[{"id":"3f3b415b-88cd-4f5b-8683-591fa3391d46","name":"Kung Pao Chicken","subtotal":"1","image":"https://img1.baidu.com/it/u=1772848420,3755938574&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":4,"attributeSelected":{"size":["big"]},"count":"ec842841-afeb-4f42-93f7-0d2b5ae2dc9b","itemTotalPrice":8}]`)
    let products = JSON.parse(receipt_JSON)

    const newItems = products.map(item => {
        return { name: item.name, CHI: item.CHI, quantity: item.quantity, subtotal: item.subtotal, item_Total: parseFloat(item.itemTotalPrice), item_attributes: item?.attributeSelected }
    });

    // const total_price = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);

    const product = newItems

    // adding holder for table number
    const tableNumber = selectedTable

    // const user = {name:change.doc.data().charges.data[0].billing_details.name}
    const user = { name: tableNumber }

    // adding lines for the original item
    product.forEach(item => {
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
        let text = item.CHI + " " + x
        if (calculateTotalLines('15pt Sans', text, horrizontal_max_right) != 1) {
            lines += 1 + calculateTotalLines('15pt Sans', text, horrizontal_max_right);
        } else {
            lines += 2;
        }
        subtotal += item.item_Total;
    })
    // lines += 1;
    const canvas = createCanvas(width, lines * lineHeight)
    const context = canvas.getContext('2d')

    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, lines * lineHeight)

    context.font = '10pt Sans'
    // context.textAlign = 'left'
    context.fillStyle = '#000'

    // filling in the template text for restaurant information
    context.textAlign = 'center';
    context.fillText(restaurant_name_CHI, horrizontal_max_right / 2, y);
    context.fillText(restaurant_name, horrizontal_max_right / 2, y + lineHeight);
    context.fillText(restaurant_address_1, horrizontal_max_right / 2, y + lineHeight * 2);
    context.fillText(restaurant_address_2, horrizontal_max_right / 2, y + lineHeight * 3);
    context.fillText(restaurant_phone, horrizontal_max_right / 2, y + lineHeight * 4);
    y += lineHeight * 4

    context.textAlign = 'left';

    // draw a dotted line
    y += lineHeight * 0.5
    drawDashedLine([5, 15])
    y += lineHeight

    // putting in the name and DINE-IN or TAKE-OUT option
    context.fillText(`${user.name}`, 0, y);

    // Create a function to format a number with leading zeros
    // Create a function to format a number with leading zeros
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

    context.textAlign = 'end'
    // context.fillText(`${meal_option}`, horrizontal_max_right, y);
    context.fillText(`${formattedDateTime}`, horrizontal_max_right, y);
    context.textAlign = 'left'

    y += lineHeight * 0.5;


    // draw a solid line
    drawDashedLine([])
    y += lineHeight;

    function extractAndRemoveInteger(str) {
        const regex = /#@%(\d+)#@%/;
        const match = str.match(regex);

        if (match) {
            // Extracted integer
            const extractedInt = parseInt(match[1], 10);

            // Remove the pattern from the string
            const updatedString = str.replace(regex, '');

            return { extractedInt, updatedString };
        }

        // If the string does not match the pattern, return null for the integer and the original string
        return { extractedInt: null, updatedString: str };
    }

    product.forEach(item => {

        // changing the name so that it can only be 13 characters
        let name = shortenName(item.name)
        const { extractedInt, updatedString } = extractAndRemoveInteger(item.name);

        if (extractedInt !== null) {//split
            context.fillText(`${Math.round(item.quantity / extractedInt * 100) / 100} x ${updatedString}`, 0, y);
        } else {
            context.fillText(`${item.quantity} x ${name}`, 0, y);
        }
        // context.fillText(`${item.name}`, 100, y);
        context.textAlign = "end"
        context.fillText(`$${toFixTwo(item.item_Total)}`, horrizontal_max_right, y)
        // context.fillText(`${item.name}:`, 20, y);
        context.textAlign = "left"
        // context.fillText(`${item.quantity}*$${item.subtotal} = $${item.item_Total}`, 20, y+lineHeight);
        y += lineHeight;
        //total += item.item_Total;
        let CHI = item.CHI
        //context.fillText(`${CHI}`, 0, y);

        //adding the attributes (go through everything and then print out all the leaf nodes child values)


        // change fonts to smaller font
        context.font = '9pt Sans'

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
        let attributesChar = CHI + " " + x
        let chars = attributesChar.split(''); // Split the text into characters
        let currentLine = '';
        let lines = [];
        for (let char of chars) {
            let testLine = currentLine + char;
            let testWidth = context.measureText(testLine).width;

            if (testWidth > horrizontal_max_right && currentLine.length > 0) {
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
            y += lineHeight; // Move to the next line
        }
        //context.fillText(`${x}`, 55, y);
        context.font = '10pt Sans'

    })

    // minor height adjustment for line
    y = y - lineHeight * 0.5

    // draw a solid line
    drawDashedLine([])
    y += lineHeight;

    // adding the subtotals, tax, and total
    context.fillText(`Subtotal:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$${toFixTwo(subtotal)}`, horrizontal_max_right, y)
    context.textAlign = 'left'
    y += lineHeight;

    context.fillText(`Tax:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$${toFixTwo(subtotal * taxRate)}`, horrizontal_max_right, y)
    context.textAlign = 'left'
    y += lineHeight;

    if (discount != 0) {
        context.fillText(`Discount:`, 0, y)
        context.textAlign = 'end'
        context.fillText(`$${toFixTwo(discount)}`, horrizontal_max_right, y)
        context.textAlign = 'left'
        y += lineHeight;
    }

    if (service_fee != 0) {
        context.fillText(`Tips(${Math.round(service_fee / subtotal * 100)}%):`, 0, y)
        context.textAlign = 'end'
        context.fillText(`$${toFixTwo(service_fee)}`, horrizontal_max_right, y)
        context.textAlign = 'left'
        y += lineHeight;
    }

    context.fillText(`Total:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$${toFixTwo(total)}`, horrizontal_max_right, y)
    context.textAlign = 'left'
    context.font = '10pt Sans'
    y += lineHeight;
    context.font = "bold 10pt Sans";

    // tips section here
    // context.fillText(`Tips:`, 0, y)
    // context.textAlign = 'end'
    // context.fillText(`$________`, horrizontal_max_right, y)
    // context.textAlign = 'left'
    // y += lineHeight;
    // context.font = "bold 10pt Sans";

    // context.fillText(`Total:`, 0, y)
    // context.textAlign = 'end'
    // context.fillText(`$________`, horrizontal_max_right, y)
    // context.textAlign = 'left'
    // y += lineHeight;

    //additional line for spacing
    y += lineHeight

    // merchant copy message

    // signature message
    context.font = "15pt Sans";
    context.textAlign = 'center'
    context.fillText(receiptCopyMode, horrizontal_max_right / 2, y)//merchant copy
    y += lineHeight * 1.5

    // more space for signature
    y += lineHeight

    context.font = "10pt Sans";
    // signature
    context.fillText(`x`, 28, y)
    drawDashedLine([5, 15], 55)
    y += lineHeight

    context.font = "bold 10pt Sans";

    context.fillText("SIGNATURE", horrizontal_max_right / 2, y)
    context.textAlign = 'left'
    y += lineHeight * 1.5
    context.font = "10pt Sans";


    // const totalText = `Total: $${total}`;
    // const totalWidth = context.measureText(totalText).width;
    // if (totalWidth > width) {
    //     context.textAlign = 'center';
    // }
    // context.fillText(totalText, width / 2, y - 5);
    // y += lineHeight;

    // tips section
    context.textAlign = 'center';
    context.fillText(`Add Additional Tips`, horrizontal_max_right / 2, y)
    context.fillText(`⬜ 15%: $${toFixTwo(subtotal * .10)} Total: $${toFixTwo(total + subtotal * .15)}`, horrizontal_max_right / 2, y + lineHeight);
    context.fillText(`⬜ 18%: $${toFixTwo(subtotal * .15)} Total: $${toFixTwo(total + subtotal * .18)}`, horrizontal_max_right / 2, y + lineHeight * 2);
    context.fillText(`⬜ 20%: $${toFixTwo(subtotal * .18)} Total: $${toFixTwo(total + subtotal * .20)}`, horrizontal_max_right / 2, y + lineHeight * 3);
    context.fillText(`⬜ Custom: $________ Total: $________`, horrizontal_max_right / 2, y + lineHeight * 4);

    context.fillText(`POWERED BY EATIFYDASH.COM`, horrizontal_max_right / 2, y + lineHeight * 5);
    y += lineHeight * 6


    const height = canvas.height
    const buffer = canvas.toBuffer('image/png')
    //fs.writeFileSync('./merchant.png', buffer)
    fs.writeFileSync('./' + randomUuid + parseInt(height * 4.05).toString() + '.png', buffer)
    return randomUuid + parseInt(height * 4.05).toString() + '.png'
}

// reciptNode_tips_merchant(2321, `[{"id":"22b2e9fb-eac9-43da-b053-bc498307c951","name":"1/2 Salted Pork And Egg Claypot Rice","subtotal":"7.50","image":"https://img1.baidu.com/it/u=3553466282,3760543442&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":2,"attributeSelected":{},"count":"1a365b9c-7bbd-47d9-844b-336b64cf1238","itemTotalPrice":"15.00","CHI":"咸猪肉鸡蛋煲仔饭 / 2"},{"id":"6931fd34-62e6-4fba-9403-a4d7c89cec97","name":"1/2 Mustard Beef Claypot Rice","subtotal":"7.50","image":"https://img2.baidu.com/it/u=2686239804,2732453889&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":2,"attributeSelected":{},"count":"5f7c5203-c350-4191-8aa0-36037e1f41da","itemTotalPrice":"15.00","CHI":"榨菜牛肉煲仔饭 / 2"},{"id":"c2cb3c36-b9e3-45b2-8d16-58a6fb66ce27","name":"Braised Pig Tail Soup With Herbs / 2","subtotal":"6.00","image":"https://img0.baidu.com/it/u=1012952787,2134557708&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=666","quantity":4,"attributeSelected":{},"count":"dfbaa825-e675-4730-b7fd-5fe4baba9122","itemTotalPrice":"24.00","CHI":"药材炖猪尾汤 / 2"}]`, "A2", 0, 0, 100)

module.exports = {
    PNGMerchantReceipt: PNGMerchantReceipt
};