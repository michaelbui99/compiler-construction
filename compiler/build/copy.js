const args = process.argv.slice(2);

const src = args[0];
const dest = args[1];

const fs = require("fs");

fs.cpSync(src, dest, { recursive: true });
