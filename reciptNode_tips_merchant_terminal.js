// var admin = require("firebase-admin");
// const express = require('express');
const fs = require('fs')
const { createCanvas, loadImage } = require('canvas')
// const app = express();
function reciptNode_tips_merchant_terminal(receipt_JSON,selectedTable) {

    // the standard paper print is 58 mm
    // the kitchen printer is 80 mm
    // use the below ratio to convert
    const standard_size = 58;
    const kitchen_size = 80;
    const ratio = kitchen_size / standard_size;

    /**generate new png picture receipt */
    // the offset from the FEC TP-100 printer
    const offset = 18
    const width = 205 * ratio - offset
    let y = 20;
    let subtotal = 0
    let total = 0;
    let lines = 0;
    const lineHeight = 20;
    const taxRate = 0.0825;
    
    // drawDashedLine will draw you a line (dotted or solid)
    function drawDashedLine(pattern, startx = 0 , endx = 185 * ratio - 6, height = y) {
        context.beginPath();
        context.setLineDash(pattern);
        context.moveTo(startx, height);
        context.lineTo(endx, height);
        context.stroke();
      }
    
    // for name shortening for menu item
    function shortenName(name) {
        const maxLength = 13;
    
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
      
    // section to add template text
    let meal_option = "DINE-IN"
    let restaurant_name = "TAISHAN RESAURANT"
    let restaurant_address_1 = "622 JACKSON"
    let restaurant_address_2 = "SAN FRANCISCO, CA 94133"
    let restaurant_phone = "415-288-2888"
    lines += 5
    
    // adding dotted lines
    lines += 0.5
    
    // adding solid lines
    lines += 0.5
    
    // adding the subtotal, tax, tips, and total section
    lines += 4
    
    // // adding the tips section
    // lines += 5
    
    // // adding the Merchant Copy message
    // lines += 1.5
    
    // adding the signature section
    lines += 2.5
    
    // // deleting lines to cut down on space (saves money)
    // lines -= 3
    
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
    
    // console.log(products)
    
    const newItems = products.map(item => {
      return { name: item.name,CHI:item.CHI, quantity: item.quantity, subtotal: item.subtotal,item_Total:  parseFloat(item.itemTotalPrice), item_attributes:item?.attributeSelected}
    });
    
    // const total_price = products.reduce((acc, product) => acc + (product.quantity * product.subtotal), 0);
    // console.log(total_price)
    // console.log(newItems);
    
    const product = newItems
    
    // adding holder for table number
    const tableNumber = selectedTable
    
    // const user = {name:change.doc.data().charges.data[0].billing_details.name}
    const user = {name:tableNumber}
    
    // adding lines for attributes
    product.forEach(item => {
        if (item.item_attributes !== null) {
            lines += 2;
        }
    })
    
    // adding lines for the original item
    product.forEach(item => {
        lines += 2;
        subtotal += item.item_Total;
    })
    lines += 1; 
    const canvas = createCanvas(width, lines * lineHeight + 20 )
    const context = canvas.getContext('2d')
    
    context.fillStyle = '#fff'
    context.fillRect(0, 0, width, lines * lineHeight + 20)
    
    context.font = '10pt Sans'
    // context.textAlign = 'left'
    context.fillStyle = '#000'
    
    // filling in the template text for restaurant information
    context.textAlign = 'center';
    context.fillText(restaurant_name, width/2 - 6, y);
    context.fillText(restaurant_address_1, width/2 - 6, y + lineHeight);
    context.fillText(restaurant_address_2, width/2 - 6, y + lineHeight*2);
    context.fillText(restaurant_phone, width/2 - 6, y + lineHeight*3);
    y += lineHeight* 3
    
    // y+= lineHeight
    
    // draw a dotted line
    y += lineHeight * 0.5
    drawDashedLine([5,15])
    y += lineHeight
    
    context.textAlign = 'left';

    // putting in the paymentIntent ID
    context.font = 'bold 10pt Sans'
    context.fillText(`PAID`, 0, y);
    
    context.font = '10pt Sans'
    context.textAlign = 'end'
    context.fillText(`ID: ABCD`, 185 * ratio - 6, y);
    context.textAlign = 'left'
    
    y += lineHeight

    // putting in the name and DINE-IN or TAKE-OUT option
    context.fillText(`${user.name}`, 0, y);
    
    context.textAlign = 'end'
    context.fillText(`${meal_option}`, 185 * ratio - 6, y);
    context.textAlign = 'left'
    
    y += lineHeight * 0.5;
    
    
    // draw a solid line
    drawDashedLine([])
    y += lineHeight;
    
    
    product.forEach(item => {
    
        // changing the name so that it can only be 13 characters
        let name = shortenName(item.name)
        context.fillText(`${item.quantity}  ${name}`, 0, y);
        // context.fillText(`${item.name}`, 100, y);
        context.textAlign = "end"
        context.fillText(`$${item.item_Total.toFixed(2)}`, 185 * ratio - 6, y)
        // context.fillText(`${item.name}:`, 20, y);
        context.textAlign = "left"
        // context.fillText(`${item.quantity}*$${item.subtotal} = $${item.item_Total}`, 20, y+lineHeight);
        y += lineHeight;
        //total += item.item_Total;
        let CHI = shortenName(item.CHI)
        context.fillText(`${CHI}`, 0, y);
    
        //adding the attributes (go through everything and then print out all the leaf nodes child values)
    
    
        // change fonts to smaller font
        context.font = '9pt Sans'
    
        // attributes string
        let x = ""
    
        for (let key in item.item_attributes) {
            const value = item.item_attributes[key];
            // console.log(value)
            // Check if the value is an array
            if (Array.isArray(value)) {
                value.forEach(item => {
                    // console.log(item)
                    x += item + " ";
                });
            }
            // Check if the value is an object (but not an array)
            else if (typeof value === 'object' && value !== null) {
                for (let subkey in value) {
                    // console.log(value[subkey]);
                    x += value[subkey] + " ";
                }
            } 
            else {
                // console.log(value);
                x += value + " ";
            }
        }
        // console.log(x)
        context.fillText(`${x}`, 40 * ratio - 20, y);
    
        y += lineHeight;
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
    context.fillText(`$${subtotal.toFixed(2)}`, 185 * ratio - 6, y)
    context.textAlign = 'left'
    y += lineHeight;
    
    context.fillText(`Tax:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$${(subtotal * taxRate).toFixed(2)}`, 185 * ratio - 6, y)
    context.textAlign = 'left'
    y += lineHeight;
    
    // tips section here
    context.fillText(`Tips:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$1`, 185 * ratio - 6, y)
    context.textAlign = 'left'
    y += lineHeight;
    
    context.font = "bold 10pt Sans";
    context.fillText(`Total:`, 0, y)
    context.textAlign = 'end'
    context.fillText(`$12`, 185 * ratio - 6, y)
    context.textAlign = 'left'
    context.font = '10pt Sans'
    y += lineHeight;
    
    //additional line for spacing
    y += lineHeight
    
    // merchant copy message
    
    // signature message
    context.font = "15pt Sans";
    context.textAlign = 'center'
    context.fillText("Merchant Copy", width/2 - 6, y)
    y += lineHeight * 1.5

    context.font = "10pt Sans";
    context.fillText(`POWERED BY EATIFYDASH`, width/2 - 6, y);

    // // more space for signature
    // y += lineHeight
    
    // context.font = "10pt Sans";
    // // signature
    // context.fillText(`x`, 20 * 1.5 * ratio - 20, y)
    // drawDashedLine([5,15], 40 * ratio - 20)
    // y += lineHeight
    
    // context.font = "10pt Sans";
    // context.fillText("SIGNATURE", width/2 - 6, y)
    // context.textAlign = 'left'
    // y += lineHeight * 1.5
    // context.font = "10pt Sans";
    
    
    // // const totalText = `Total: $${total}`;
    // // const totalWidth = context.measureText(totalText).width;
    // // if (totalWidth > width) {
    // //     context.textAlign = 'center';
    // // }
    // // context.fillText(totalText, width / 2, y - 5);
    // // y += lineHeight; 
    
    // // tips section
    // context.textAlign = 'center';
    // context.fillText(`Tips Suggestions`, width/2 - 6, y)
    // context.fillText(`18%: $${(subtotal * .18).toFixed(2)}`, width/2 - 6, y + lineHeight);
    // context.fillText(`20%: $${(subtotal * .20).toFixed(2)}`, width/2 - 6, y + lineHeight*2);
    // context.fillText(`25%: $${(subtotal * .25).toFixed(2)}`, width/2 - 6, y + lineHeight*3);
    // context.fillText(`POWERED BY EATIFYDASH`, width/2 - 6, y + lineHeight*4);
    // y += lineHeight* 4
    
    
    
    const buffer = canvas.toBuffer('image/png')
    fs.writeFileSync('./merchant_terminal.png', buffer)
    //picture generation ends
    
    }
    
    module.exports = {
        reciptNode_tips_merchant_terminal: reciptNode_tips_merchant_terminal
    };