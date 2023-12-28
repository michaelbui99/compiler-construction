import { describe, expect, test } from "@jest/globals";
import { Block } from "../src/ast/block";
import {
    FunctionDeclaration,
    VariableDeclaration,
} from "../src/ast/declarations";
import {
    ArrayExperession,
    BinaryExpression,
    CallExpression,
    ExpressionList,
    ExpressionResult,
    IntLiteralExpression,
    VariableExpression,
} from "../src/ast/expression";
import { Identifier } from "../src/ast/identifier";
import { IntegerLiteral } from "../src/ast/literals";
import { Parser } from "../src/ast/parser";
import { Program } from "../src/ast/program";
import {
    AssStatement,
    IffStatement,
    IndexType,
    OutStatement,
    RetStatement,
    Statements,
} from "../src/ast/statements";
import { Scanner } from "../src/scanner/scanner";

import { Token, TokenKind } from "../src/scanner/tokens";
import { Type } from "../src/ast/types";
import { Operator } from "../src/ast/operator";

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
        let source = "ret 5 % "; //out a % get b % out a add b %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new RetStatement(
                            new IntLiteralExpression(new IntegerLiteral("5"))
                        ),
                    ])
                )
            )
        );
    });

    test("should return tree for a good longer program", () => {
        let source = "let a 8 % out a % "; //out a % get b % out a add b %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new VariableDeclaration(
                            new Identifier("a"),
                            new IntLiteralExpression(new IntegerLiteral("8")),
                            undefined
                        ),
                        new OutStatement(
                            new VariableExpression(new Identifier("a"))
                        ),
                    ])
                )
            )
        );
    });

    test("make an array and assign somehting to an index", () => {
        let source = "let myArr arr 1 5 8 % ass myArr # 0 2 %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new VariableDeclaration(
                            new Identifier("myArr"),
                            undefined,
                            new ExpressionList([
                                new IntLiteralExpression(
                                    new IntegerLiteral("1")
                                ),
                                new IntLiteralExpression(
                                    new IntegerLiteral("5")
                                ),
                                new IntLiteralExpression(
                                    new IntegerLiteral("8")
                                ),
                            ])
                        ),
                        new AssStatement(
                            new Identifier("myArr"),
                            new IntLiteralExpression(new IntegerLiteral("2")),
                            [new IntegerLiteral("0")]
                        ),
                    ])
                )
            )
        );
    });

    test("make an array and assign osmehting to an index", () => {
        let source = "let myArr arr 1 5 8 % let a myArr #0%";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new VariableDeclaration(
                            new Identifier("myArr"),
                            undefined,
                            new ExpressionList([
                                new IntLiteralExpression(
                                    new IntegerLiteral("1")
                                ),
                                new IntLiteralExpression(
                                    new IntegerLiteral("5")
                                ),
                                new IntLiteralExpression(
                                    new IntegerLiteral("8")
                                ),
                            ])
                        ),
                        new VariableDeclaration(
                            new Identifier("a"),
                            new ArrayExperession(new Identifier("myArr"), [
                                new IntegerLiteral("0"),
                            ])
                        ),
                    ])
                )
            )
        );
    });

    test("function declaration", () => {
        let source = "fun myPrint a int thn out a% end";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new FunctionDeclaration(
                            new Identifier("myPrint"),
                            [new Identifier("a")],
                            [new Type("int")],
                            new Statements([
                                new OutStatement(
                                    new VariableExpression(new Identifier("a"))
                                ),
                            ])
                        ),
                    ])
                )
            )
        );
    });

    test("static array of size declaration", () => {
        let source = "let myArr arr #2 #2%";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new VariableDeclaration(
                            new Identifier("myArr"),
                            undefined,
                            undefined,
                            [new IntegerLiteral("2"), new IntegerLiteral("2")]
                        ),
                    ])
                )
            )
        );
    });

    test("Empty source code", () => {
        let source = "";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        const program = parser.parseProgram();
        expect(program).toEqual(new Program(new Block(new Statements([]))));
    });

    test("try to make a function", () => {
        const source = "fun void a int thn get a % end";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        parser.parseProgram();
    });

    test("integers are not indexable", () => {
        const source = "ass a # 1 8 %";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const program = parser.parseProgram();

        expect(program).toEqual(
            new Program(
                new Block(
                    new Statements([
                        new AssStatement(
                            new Identifier("a"),
                            new IntLiteralExpression(new IntegerLiteral("8")),
                            [new IntegerLiteral("1") as IndexType]
                        ),
                    ])
                )
            )
        );
    });

    test("factorial parsed correctly", () => {
        const source = `
            fun factorial n int thn
                iff run n lst 1 end orr run n eql 0 end thn 
                    ret 1 %
                end

                ret n mul factorial run n sub 1 end %
            end
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const program = parser.parseProgram();

        const expected = new Program(
            new Block(
                new Statements([
                    new FunctionDeclaration(
                        new Identifier("factorial"),
                        [new Identifier("n")],
                        [new Type("int")],
                        new Statements([
                            new IffStatement(
                                new BinaryExpression(
                                    new BinaryExpression(
                                        new VariableExpression(
                                            new Identifier("n")
                                        ),
                                        new Operator("lst"),
                                        new IntLiteralExpression(
                                            new IntegerLiteral("1")
                                        )
                                    ),
                                    new Operator("orr"),
                                    new BinaryExpression(
                                        new VariableExpression(
                                            new Identifier("n")
                                        ),
                                        new Operator("eql"),
                                        new IntLiteralExpression(
                                            new IntegerLiteral("0")
                                        )
                                    )
                                ),
                                new Statements([
                                    new RetStatement(
                                        new IntLiteralExpression(
                                            new IntegerLiteral("1")
                                        )
                                    ),
                                ]),
                                undefined
                            ),

                            new RetStatement(
                                new BinaryExpression(
                                    new VariableExpression(new Identifier("n")),
                                    new Operator("mul"),
                                    new CallExpression(
                                        new Identifier("factorial"),
                                        new ExpressionList([
                                            new BinaryExpression(
                                                new VariableExpression(
                                                    new Identifier("n")
                                                ),
                                                new Operator("sub"),
                                                new IntLiteralExpression(
                                                    new IntegerLiteral("1")
                                                )
                                            ),
                                        ])
                                    )
                                )
                            ),
                        ])
                    ),
                ])
            )
        );

        expect(program).toEqual(expected);
    });
});
