import { describe, expect, test } from "@jest/globals";
import { Block } from "../src/ast/block";
import { VariableDeclaration } from "../src/ast/declarations";
import { ExpressionResult, IntLiteralExpression, VariableExpression } from "../src/ast/expression";
import { Identifier } from "../src/ast/identifier";
import { IntegerLiteral } from "../src/ast/literals";
import { Parser } from "../src/ast/parser";
import { Program } from "../src/ast/program";
import { OutStatement, RetStatement, Statements } from "../src/ast/statements";
import { Scanner } from "../src/scanner/scanner";

import { Token, TokenKind } from "../src/scanner/tokens";

describe("Scan tokens", () => {
    test("should not be error for a good program", () => {
        let source = "let a 1 add 2 %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        parser.parseProgram();
    });

    test("should be error for a bad program", () => {
        let source = "let a 1 add 2";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        expect(() => {
            parser.parseProgram();
        }).toThrow(
            "unable to find token kind PERCENT, got EOF at position: 13"
        );
    });

    test("should return tree for a good simple program", () => {
        let source = "ret 5 % ";//out a % get b % out a add b %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(new Block(new Statements([new RetStatement(new IntLiteralExpression(new IntegerLiteral("5")))])))
        );
    });

    test("should return tree for a good longer program", () => {
        let source = "let a 8 % out a % ";//out a % get b % out a add b %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(new Block(new Statements([
                new VariableDeclaration(new Identifier("a"),new IntLiteralExpression(new IntegerLiteral("8")), undefined),
                new OutStatement(new VariableExpression(new Identifier("a")))
            ])))
        );
    });

    test("make an array and assign osmehting to an index", ()=>{
        let source = "let myArr arr 1 5 8 % ass myArr #0 2 %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(new Block(new Statements()))
        );
    });
});
