import { Scanner } from "./scanner";

const scanner = new Scanner('let myVar "test"');
console.log(scanner.scanAll());
