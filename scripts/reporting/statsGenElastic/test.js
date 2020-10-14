const CryptoJS = require("crypto-js");

const hashCode = function(s) {
  return CryptoJS.MD5(s).toString();
}
const expired = 'false'
const body = {
  "Teamspace": "user.user",
  "Type": "type",
  "User Count": "user.numUsers",
  "Max Users": 5,
  "Max Data(GB)": 5,
  "Expiry Date": "dateString",
  "expired": expired ? 'Yes' : '',
}
console.log(Object.values(body));
console.log(Object.values(body).toString())

console.log(hashCode(Object.values(body).toString()));
