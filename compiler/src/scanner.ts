import { Token, TokenKind } from "./tokens";

export class Scanner {
    sourceCode: string;
    currentChar: string = "";
    currentSpelling: string = "";
    currentReadIdx = -1;
    totalLength = 0;

    constructor(sourceCode: string) {
        this.sourceCode = sourceCode;
        this.currentChar = this.getNextChar();
        this.totalLength = sourceCode.length;
    }

    public scanAll(): Token[] {
        const tokens = [] as Token[];
        let token = this.scan();
        while (token.kind !== TokenKind.EOF) {
            tokens.push(token);
            token = this.scan();
        }
        tokens.push(token);
        return tokens;
    }

    public scan(): Token {
        this.skipGarbage();
        this.currentSpelling = "";
        return {
            kind: this.scanToken(),
            spelling: this.currentSpelling,
        };
    }

    private scanToken(): TokenKind {
        if (this.isDigit(this.currentChar)) {
            while (this.isDigit(this.currentChar)) {
                this.consumeCurrentChar();
            }
            return TokenKind.INTEGER_LITTERAL;
        } else if (this.isLetter(this.currentChar)) {
            this.consumeCurrentChar();
            while (this.isLetter(this.currentChar)) {
                this.consumeCurrentChar();
            }
            if (this.currentSpelling.length === 3) {
                const tokenKind = Token.keywordOf(this.currentSpelling);
                return tokenKind ? tokenKind : TokenKind.ERROR;
            } else {
                return TokenKind.IDENTIFIER;
            }
        }

        if (this.currentChar === "%") {
            this.consumeCurrentChar();
            return TokenKind.PERCENT;
        }

        if (this.currentReadIdx >= this.totalLength) {
            return TokenKind.EOF;
        }

        return TokenKind.ERROR;
    }

    private consumeCurrentChar(): void {
        this.currentSpelling += this.currentChar;
        this.currentChar = this.getNextChar();
    }

    private getNextChar(): string {
        this.currentReadIdx++;
        return this.sourceCode.charAt(this.currentReadIdx);
    }

    private isLetter(letter: string): boolean {
        return /[A-Za-z]/.test(letter);
    }

    private isDigit(digit: string): boolean {
        return /[0-9]/.test(digit);
    }

    private skipGarbage(): void {
        while (
            /\s/.test(this.currentChar) &&
            this.currentReadIdx < this.totalLength
        ) {
            this.currentChar = this.getNextChar();
        }
    }
}
