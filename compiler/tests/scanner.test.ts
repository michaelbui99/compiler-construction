import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner/scanner";
import { Token, TokenKind } from "../src/scanner/tokens";

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
        let source = "fun addNums a int b int thn ret a add b% end";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.FUNCTION, spelling: "fun" },
            { kind: TokenKind.IDENTIFIER, spelling: "addNums" },
            { kind: TokenKind.IDENTIFIER, spelling: "a" },
            { kind: TokenKind.TYPE, spelling: "int" },
            { kind: TokenKind.IDENTIFIER, spelling: "b" },
            { kind: TokenKind.TYPE, spelling: "int" },
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

    test("Correct tokens are scanned from source 3", () => {
        let source = 'out "hello world"%';
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.OUT, spelling: "out" },
            { kind: TokenKind.STRING_LITTERAL, spelling: "hello world" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Unterminated string is scanned as error", () => {
        let source = 'out "hello world%';
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.OUT, spelling: "out" },
            { kind: TokenKind.ERROR, spelling: "hello world%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("User defined identifier with length of 3 is scanned as error", () => {
        let source = "let myV";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.LET, spelling: "let" },
            { kind: TokenKind.ERROR, spelling: "myV" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Index is scanned correctly", () => {
        let source = "let x myArr # 1 # 2 %";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.LET, spelling: "let" },
            { kind: TokenKind.IDENTIFIER, spelling: "x" },
            { kind: TokenKind.IDENTIFIER, spelling: "myArr" },
            { kind: TokenKind.INDEX, spelling: "#" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.INDEX, spelling: "#" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "2" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Index is scanned correctly", () => {
        let source = "let x myArr # 1 # myIdentifier %";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.LET, spelling: "let" },
            { kind: TokenKind.IDENTIFIER, spelling: "x" },
            { kind: TokenKind.IDENTIFIER, spelling: "myArr" },
            { kind: TokenKind.INDEX, spelling: "#" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.INDEX, spelling: "#" },
            { kind: TokenKind.IDENTIFIER, spelling: "myIdentifier" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Creation of array", () => {
        let source = "let x arr 1 2 3 %";
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.LET, spelling: "let" },
            { kind: TokenKind.IDENTIFIER, spelling: "x" },
            { kind: TokenKind.ARRAY, spelling: "arr" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "2" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "3" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });

    test("Factorial", () => {
        const source = `
            fun factorial n int thn
                iff n lst 1 orr n eql 0 thn 
                    ret 1 %
                end

                ret n mul factorial run n sub 1 end %
            end
        `;
        let scanner = new Scanner(source);

        let tokens = scanner.scanAll();

        expect(tokens).toEqual([
            { kind: TokenKind.FUNCTION, spelling: "fun" },
            { kind: TokenKind.IDENTIFIER, spelling: "factorial" },
            { kind: TokenKind.IDENTIFIER, spelling: "n" },
            { kind: TokenKind.TYPE, spelling: "int" },
            { kind: TokenKind.THEN, spelling: "thn" },
            { kind: TokenKind.IFF, spelling: "iff" },
            { kind: TokenKind.IDENTIFIER, spelling: "n" },
            { kind: TokenKind.OPERATOR, spelling: "lst" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.OPERATOR, spelling: "orr" },
            { kind: TokenKind.IDENTIFIER, spelling: "n" },
            { kind: TokenKind.OPERATOR, spelling: "eql" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "0" },
            { kind: TokenKind.THEN, spelling: "thn" },
            { kind: TokenKind.RETURN, spelling: "ret" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.END, spelling: "end" },
            { kind: TokenKind.RETURN, spelling: "ret" },
            { kind: TokenKind.IDENTIFIER, spelling: "n" },
            { kind: TokenKind.OPERATOR, spelling: "mul" },
            { kind: TokenKind.IDENTIFIER, spelling: "factorial" },
            { kind: TokenKind.RUN, spelling: "run" },
            { kind: TokenKind.IDENTIFIER, spelling: "n" },
            { kind: TokenKind.OPERATOR, spelling: "sub" },
            { kind: TokenKind.INTEGER_LITTERAL, spelling: "1" },
            { kind: TokenKind.END, spelling: "end" },
            { kind: TokenKind.PERCENT, spelling: "%" },
            { kind: TokenKind.END, spelling: "end" },
            { kind: TokenKind.EOF, spelling: "" },
        ] as Token[]);
    });
});
