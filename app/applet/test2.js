import fs from 'fs';

const txts = [
  "Product Details SKU Size Qty Color Order No. 93_Black 32 1 Black 279235443689056640_1",
  "Product Details SKU Size Qty Color Order No. \"2- BLACK\".. 32 1 Black 279170308220358208_1",
  "Order No. 2--maroon 32 1 Maroon 279295834515494912_1 TAX INVOICE",
  "Order No. 35__black__ 32 1 Black 279323667447076866_1",
  "Product Details SKU Size Qty Color Order No. 64_-maroon 36 1 Purple 278505805786441984_1",
  "Product Details SKU Size Qty Color Order No. Trendy Women's Printed Polycotton Shirt - Multicolor Patchwork Design, Short Sleeves, Casual Wear - M 6109 1 M 1 Brown 279107937078578754_1",
];

const meeshoRegex = /(?:Order\s*No\.?|Order\s*ID)\s+([\s\S]+?)\s+([a-zA-Z0-9\-]+(?:\s+size)?)\s+(\d+)\s+([a-zA-Z\s\/\-&]+?)\s+([0-9A-Z_-]{10,})/i;

txts.forEach(t => {
  const m = t.match(meeshoRegex);
  if (m) console.log("OK", m[1].trim(), "|", m[2].trim(), "|", m[3].trim());
  else console.log("FAIL", t);
});
