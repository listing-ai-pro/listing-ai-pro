const txt1 = "Product Details SKU Size Qty Color Order No. 93_Black 32 1 Black 279235443689056640_1";
const txt2 = "Product Details SKU Size Qty Color Order No. \"2- BLACK\".. 32 1 Black 279170308220358208_1";
const txt3 = "Order No. 2--maroon 32 1 Maroon 279295834515494912_1 TAX INVOICE";
const txt4 = "Order No. 35__black__ 32 1 Black 279323667447076866_1";

const meeshoRegex = /(?:Order\s*No\.?|Order\s*ID)\s+(.+?)\s+([a-zA-Z0-9\-]+(?:\s+size)?)\s+(\d+)\s+([a-zA-Z\s\/\-&]+?)\s+([0-9A-Z_-]{10,})/i;

console.log('txt1', txt1.match(meeshoRegex)?.slice(1));
console.log('txt2', txt2.match(meeshoRegex)?.slice(1));
console.log('txt3', txt3.match(meeshoRegex)?.slice(1));
console.log('txt4', txt4.match(meeshoRegex)?.slice(1));
