const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
function reciptNode_kitchen(randomUuid, receipt_JSON, selectedTable) {

    // drawDashedLine will draw you a line (dotted or solid)
    function drawDashedLine(pattern, startx = 20, endx = 400, height = y) {
        context.beginPath();
        context.setLineDash(pattern);
        context.moveTo(startx, height);
        context.lineTo(endx, height);
        context.stroke();
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

    console.log(products)

    const newItems = products.map(item => {
        return { name: item.name, CHI: item.CHI, quantity: item.quantity, subtotal: item.subtotal, item_Total: item.itemTotalPrice, item_attributes: item?.attributeSelected }
    });

    // const total_price = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
    // console.log(total_price)
    console.log(newItems);

    const width = 285;
    let y = 20;
    let total = 0;
    let lines = 0;
    const lineHeight = 40;
    const taxRate = 0.0825;

    // adding holder for table number
    const tableNumber = selectedTable

    // const user = {name:change.doc.data().charges.data[0].billing_details.name}
    const user = { name: tableNumber }

    // // add a line for the tablename
    lines += 1;

    // add a line for ripping
    lines += 1;

    const product = newItems
    //const user = {name:change.doc.data().charges.data[0].billing_details.name}
    product.forEach(item => {
        // Check if item.attributeSelected exists and is not null, and it's not an empty object or an empty array
        if (item.item_attributes && (typeof item.item_attributes === 'object') && !Array.isArray(item.item_attributes) && Object.keys(item.item_attributes).length > 0) {
            lines += 1.5;
        } else {
            lines += 1;
        }
        total += item.item_Total;
    });

    const canvas = createCanvas(width, lines * lineHeight + 20)
    const context = canvas.getContext('2d')

    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, lines * lineHeight + 20)

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
    const currentDate = new Date();

    // Format the date and time as "mm/dd/yy hr:minute:seconds"
    const formattedDateTime =
        `#${formatWithLeadingZero(currentDate.getHours())}${formatWithLeadingZero(currentDate.getMinutes())}`;

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
        let name = shortenName(item.CHI)

        context.fillText(`${name} x ${item.quantity}`, 10, y);
        y += 0.5 * lineHeight;

        // Check if there are attributes
        if (item.item_attributes && (typeof item.item_attributes === 'object') && !Array.isArray(item.item_attributes) && Object.keys(item.item_attributes).length > 0) {
            // change fonts to smaller font
            context.font = '15pt Sans'

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

            console.log(x)
            context.fillText(`${x}`, 45, y);
            y += 1 * lineHeight;
            context.font = '20pt Sans'
        } else {
            // No attributes, add a line of text
            y += 0.5 * lineHeight;
        }
    })



    const height = canvas.height
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./' + randomUuid + parseInt(height * 4.05).toString() + '.png', buffer)

    return randomUuid + parseInt(height * 4.05).toString() + '.png'

    //picture generation ends

}

module.exports = {
    reciptNode_kitchen: reciptNode_kitchen
};