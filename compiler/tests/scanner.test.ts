import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner";
import { Token, TokenKind } from "../src/tokens";

describe("Scan tokens", () => {
    test("Whitespace and empty source is scanned correctly", () => {
        const scanner = new Scanner("");
        const scanner2 = new Scanner("    ");

        let tokens = scanner.scanAll();
        expect(tokens).toHaveLength(1);
        expect(tokens[0].kind).toEqual(TokenKind.EOF);

        tokens = scanner2.scanAll();
        expect(tokens).toHaveLength(1);
        expect(tokens[0].kind).toEqual(TokenKind.EOF);
    });

    test("Correct tokens are scanned from source", () => {
        let source = "let a 1 add 2 %";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.LET, spelling: "let" },
            { kind: TokenKind.IDENTIFIER, spelling: "a" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.OPERATOR, spelling: "add" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "2" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Correct tokens are scanned from source 2", () => {
        let source = "fun addNums a b thn ret a add b% end";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.FUNCTION, spelling: "fun" },
            { kind: TokenKind.IDENTIFIER, spelling: "addNums" },
            { kind: TokenKind.IDENTIFIER, spelling: "a" },
            { kind: TokenKind.IDENTIFIER, spelling: "b" },
            { kind: TokenKind.THEN, spelling: "thn" },
            { kind: TokenKind.RETURN, spelling: "ret" },
            { kind: TokenKind.IDENTIFIER, spelling: "a" },
            { kind: TokenKind.OPERATOR, spelling: "add" },
            { kind: TokenKind.IDENTIFIER, spelling: "b" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.END, spelling: "end" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });
});
