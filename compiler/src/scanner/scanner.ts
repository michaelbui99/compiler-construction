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
        return new Token(this.scanToken(), this.currentSpelling);
    }

    private scanToken(): TokenKind {
        if (this.isDigit(this.currentChar)) {
            while (this.isDigit(this.currentChar)) {
                this.consumeCurrentChar();
            }
            return TokenKind.INTEGER_LITTERAL;
        } else if (this.isLetter(this.currentChar)) {
            while (this.isLetter(this.currentChar)) {
                this.consumeCurrentChar();
            }
            // User defined identifiers cannot have length of 3,
            // thus it must be a keywords or operator.
            // User defined identifiers with length of 3 are treated as errors.
            if (this.currentSpelling.length === 3) {
                let tokenKind = Token.keywordOf(this.currentSpelling);
                if (!tokenKind) {
                    tokenKind = Token.operatorOf(this.currentSpelling);
                }
                return tokenKind ? tokenKind : TokenKind.ERROR;
            } else {
                return TokenKind.IDENTIFIER;
            }
        }

        if (this.currentChar === '"') {
            // Don't include the " in the spelling
            this.currentChar = this.getNextChar();
            while (this.currentChar !== '"' && !this.isAtEnd()) {
                this.consumeCurrentChar();
            }

            if (this.isAtEnd()) {
                // Only reached on unterminated string litteral
                // e.g. let myVar "test
                return TokenKind.ERROR;
            }

            // Don't include the " in the spelling
            this.currentChar = this.getNextChar();
            return TokenKind.STRING_LITTERAL;
        }

        if (this.currentChar === "#") {
            while (
                (this.currentChar === "#" ||
                    this.isLetter(this.currentChar) ||
                    this.isDigit(this.currentChar)) &&
                !this.isAtEnd()
            ) {
                this.consumeCurrentChar();
            }

            return TokenKind.INDEX;
        }

        if (this.currentChar === "%") {
            this.consumeCurrentChar();
            return TokenKind.PERCENT;
        }

        if (this.isAtEnd()) {
            return TokenKind.EOF;
        }

        this.consumeCurrentChar();
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

    private isAtEnd(): boolean {
        return this.currentReadIdx >= this.sourceCode.length;
    }

    private skipGarbage(): void {
        while (/\s/.test(this.currentChar) && !this.isAtEnd()) {
            this.currentChar = this.getNextChar();
        }
    }
}
