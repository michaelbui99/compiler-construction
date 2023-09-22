export enum TokenKind {
    IDENTIFIER = "IDENTIFIER",
    OPERATOR = "OPERATOR",
    STRING_LITTERAL = "STRING_LITTERAL",
    INTEGER_LITTERAL = "INTEGER_LITTERAL",

    // Keywords
    LET = "LET",
    ASSIGN = "ASSIGN",
    ARRARY = "ARRAY",
    IFF = "IFF",
    THEN = "THEN",
    ELSE = "ELSE",
    RUN = "RUN",
    END = "END",
    FOR = "FOR",
    GET = "GET",
    OUT = "OUT",
    RETURN = "RETURN",
    FUNCTION = "FUNCTION",

    PERCENT = "PERCENT",
    EOF = "EOF",
    ERROR = "ERROR",
}

const keywordKindMappings = new Map<string, TokenKind>([
    ["let", TokenKind.LET],
    ["ass", TokenKind.ASSIGN],
    ["arr", TokenKind.ARRARY],
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
]);

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
}
