import { Scanner } from "./scanner";

console.log("Hello world!");

const scanner = new Scanner("let        myVar               5       %");
console.log(scanner.scan());
console.log(scanner.scan());
console.log(scanner.scan());
console.log(scanner.scan());

const scanner2 = new Scanner("");
console.log(scanner2.scan());

const scanner3 = new Scanner("    ");
console.log(scanner3.scan());
