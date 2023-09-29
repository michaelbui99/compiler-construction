import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner";
import { Parser } from "../src/parser";
import { Token, TokenKind } from "../src/tokens";

describe("Scan tokens", () => {
    test("should not be error for a good program", () => {
        let source = "let a 1 add 2 %";
        let scanner = new Scanner(source);

        let parser = new Parser(scanner);

        parser.parseProgram();
    });

    test("should be error for a bad program", () => {
        let source = "let a 1 add 2";
        let scanner = new Scanner(source)

        let parser = new Parser(scanner);

        expect(() => {
            parser.parseProgram();
        }).toThrow("unable to find token kind PERCENT, got EOF at position: 13")
    })
})