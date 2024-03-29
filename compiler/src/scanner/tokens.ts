export enum TokenKind {
    IDENTIFIER = "IDENTIFIER",
    OPERATOR = "OPERATOR",
    STRING_LITTERAL = "STRING_LITTERAL",
    INTEGER_LITTERAL = "INTEGER_LITTERAL",
    BOOLEAN_LITTERAL = "BOOLEAN_LITTERAL",

    // Keywords
    LET = "LET",
    ASSIGN = "ASSIGN",
    ARRAY = "ARRAY",
    IFF = "IFF",
    THEN = "THEN",
    ELSE = "ELSE",
    RUN = "RUN",
    END = "END",
    FOR = "FOR",
    BREAK = "BRK",
    GET = "GET",
    OUT = "OUT",
    INDEX = "INDEX",
    RETURN = "RETURN",
    FUNCTION = "FUNCTION",

    PERCENT = "PERCENT",
    EOF = "EOF",
    ERROR = "ERROR",

    TYPE = "TYPE",
}

const keywordKindMappings = new Map<string, TokenKind>([
    ["let", TokenKind.LET],
    ["ass", TokenKind.ASSIGN],
    ["arr", TokenKind.ARRAY],
    ["iff", TokenKind.IFF],
    ["thn", TokenKind.THEN],
    ["els", TokenKind.ELSE],
    ["run", TokenKind.RUN],
    ["end", TokenKind.END],
    ["for", TokenKind.FOR],
    ["get", TokenKind.GET],
    ["out", TokenKind.OUT],
    ["ret", TokenKind.RETURN],
    ["fun", TokenKind.FUNCTION],
    ["brk", TokenKind.BREAK],
    ["tru", TokenKind.BOOLEAN_LITTERAL],
    ["bol", TokenKind.TYPE],
    ["int", TokenKind.TYPE],
    ["str", TokenKind.TYPE],
]);

const operators = new Map<string, TokenKind>([
    ["add", TokenKind.OPERATOR],
    ["sub", TokenKind.OPERATOR],
    ["div", TokenKind.OPERATOR],
    ["mul", TokenKind.OPERATOR],
    ["mod", TokenKind.OPERATOR],
    ["eql", TokenKind.OPERATOR],
    ["grt", TokenKind.OPERATOR],
    ["lst", TokenKind.OPERATOR],
    ["and", TokenKind.OPERATOR],
    ["orr", TokenKind.OPERATOR],
    ["not", TokenKind.OPERATOR],
    ["len", TokenKind.OPERATOR],
]);

export type OperatorToken =
    | "add"
    | "sub"
    | "div"
    | "mul"
    | "mod"
    | "eql"
    | "grt"
    | "lst"
    | "and"
    | "orr"
    | "not"
    | "len";
export class Token {
    kind: TokenKind;
    spelling: string;

    constructor(kind: TokenKind, spelling: string) {
        this.kind = kind;
        this.spelling = spelling;
    }

    static keywordOf(spelling: string): TokenKind | undefined {
        return keywordKindMappings.get(spelling);
    }

    static operatorOf(spelling: string): TokenKind | undefined {
        return operators.get(spelling);
    }

    public isBooleanOperator(): boolean {
        return this.isKindAndHasEitherSpelling(TokenKind.OPERATOR, [
            "and",
            "orr",
        ]);
    }

    public isCompareOperator(): boolean {
        return this.isKindAndHasEitherSpelling(TokenKind.OPERATOR, [
            "grt",
            "lst",
            "eql",
        ]);
    }

    public isAddOperator(): boolean {
        return this.isKindAndHasEitherSpelling(TokenKind.OPERATOR, [
            "add",
            "sub",
        ]);
    }

    public isMultOperator(): boolean {
        return this.isKindAndHasEitherSpelling(TokenKind.OPERATOR, [
            "mul",
            "div",
            "mod",
        ]);
    }

    public isUnaryOperand(): boolean {
        return this.isKindAndHasEitherSpelling(TokenKind.OPERATOR, [
            "not",
            "len",
        ]);
    }

    private isKindAndHasEitherSpelling(kind: TokenKind, spellings: string[]) {
        return this.kind === kind && spellings.includes(this.spelling);
    }
}
