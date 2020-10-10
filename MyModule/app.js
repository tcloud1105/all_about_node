'use strict'

const Enigma = require('./enigma');
const eng = new Enigma('magrathea');

let encodeString = eng.encode("Don't panic");
let decodeString = eng.decode(encodeString);

let qr = eng.qrgen('https://www.npmjs.com', "outImage.png");
 qr?console.log('QR Code created!') : console.log('Qr Code Failed');

console.log("Encoded Value",encodeString);
console.log("Decoded Value",decodeString);

