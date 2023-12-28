import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner/scanner";
import { Parser } from "../src/ast/parser";
import { Checker } from "../src/checker/checker";
import { CompilerError } from "../src/checker/exceptions";
import { Encoder } from "../src/codegen/encoder";

describe("Check compiler", () => {
    test("test empty program", () => {
        const source = "";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();
        checker.visitProgram(ast, undefined);
        const encoder = new Encoder();
        encoder.encode(ast, "../code/code-1.txt");
    });

    test("test expression result of literal", () => {
        const source = "5";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();
        checker.visitProgram(ast, undefined);
        const encoder = new Encoder();
        encoder.encode(ast, "../code/code-2.txt");
    });

    test("test expression result of literal", () => {
        const source = "out 5 %";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();
        checker.visitProgram(ast, undefined);
        const encoder = new Encoder();
        encoder.encode(ast, "code-3");
    });

    test("test making variable", () => {
        const source = "let a 5 %";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();
        checker.visitProgram(ast, undefined);
        const encoder = new Encoder();
        encoder.encode(ast, "code-4");
    });

    test("test making out var", () => {
        const source = "let a 5 % out a %";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();
        checker.visitProgram(ast, undefined);
        const encoder = new Encoder();
        encoder.encode(ast, "code-4");
    });
});
