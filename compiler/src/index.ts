import { Parser } from "./parser";
import { Scanner } from "./scanner";

const scanner = new Scanner('let myVar "test"');
console.log(scanner.scanAll());

let source = "let a 1 add 2 %";
let scanner2 = new Scanner(source);

let parser = new Parser(scanner2);

parser.parseProgram();