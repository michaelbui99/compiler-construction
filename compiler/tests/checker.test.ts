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

    test("Function cannot be used as argument to another function", () => {
        const source = `
            fun myFunc a int thn out a% end
            fun identity a int thn ret a% end

            myFunc identity%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });

    test("Name must be defined before use", () => {
        const source = `
            myFunc 1 %
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Name must be defined before use 2", () => {
        const source = `
            let a 1%
            out a%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });

    test("Name must only be defined once each scope level", () => {
        const source = `
            let a 1%
            let a 2%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Name must only be defined once each scope level - 2", () => {
        const source = `
            let a 1%
            fun myFunc a int thn ret a% end
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("Only a name declared as array is indexeable ", () => {
        const source = `
            let a 1%
            let b run a #2 end%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Only a name declared as array is indexeable 2", () => {
        const source = `
            let a arr 1%
            let b run a #0 end%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("The only unary operator is 'not' and can only be used on booleans and integers", () => {
        const source = `
            let a not 1 %
            let b not tru %
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("A name declared as variable can only be reassigned to a new value of the same type that it was declared as", () => {
        const source = `
            let a 1%
            ass a tru%
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("A name declared as variable can only be reassigned to a new value of the same type that it was declared as - 2", () => {
        const source = `
            let a 1%
            ass a 2%
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
});
