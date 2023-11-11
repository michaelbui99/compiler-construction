import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner/scanner";
import { Parser } from "../src/ast/parser";
import { Checker } from "../src/checker/checker";

describe("Checker tests", () => {
    test("Array of mixed types should throw exception", () => {
        const source = "let myArr arr 2 3 tru%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => {
            checker.visitProgram(ast, undefined);
        }).toThrowError();
    });

    test("Array of same types should not throw exception", () => {
        const source = "let myArr arr 2 3 4%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("Function with incorrect amount of arguments should throw exception", () => {
        const source = "fun myFunc a int b bol thn ret a% end myFunc 2%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Function with correct amount of arguments should not throw exception", () => {
        const source = "fun myFunc a int b bol thn ret a% end myFunc 2 tru%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
});
