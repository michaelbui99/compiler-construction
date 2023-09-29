import { Scanner } from "./scanner";
import { Token, TokenKind } from "./tokens";

export class Parser {
    private scanner: Scanner;
    private currentTerminal: Token;

    constructor(scanner : Scanner){
        this.scanner = scanner;
        this.currentTerminal = this.scanner.scan();
    }

    public parseProgram(): void{
        this.parseBlock();

        if (this.currentTerminal.kind != TokenKind.EOF){
            this.reportError("incorrectly terminated program");
        }
    }

    private parseBlock() : void{
        this.parseStatements();
    }

    private parseStatements(){
        while(
            this.currentTerminal.kind === TokenKind.IFF ||
            this.currentTerminal.kind === TokenKind.FOR ||
            this.currentTerminal.kind === TokenKind.OUT ||
            this.currentTerminal.kind === TokenKind.ASSIGN ||
            this.currentTerminal.kind === TokenKind.RETURN ||
            this.currentTerminal.kind === TokenKind.BREAK ||
            
            // declarations
            this.currentTerminal.kind === TokenKind.GET ||
            this.currentTerminal.kind === TokenKind.FUNCTION ||
            this.currentTerminal.kind === TokenKind.LET ||

            // expression
            this.isExpressionToken()
        ){
            this.parseStatement();
        }
    }

    private parseStatement(){
        switch (this.currentTerminal.kind){
            case TokenKind.GET:
            case TokenKind.FUNCTION:
            case TokenKind.LET:
                this.parseDeclaration();
                break;
            case TokenKind.INTEGER_LITTERAL:
            case TokenKind.STRING_LITTERAL:
            case TokenKind.BOOLEAN_LITTERAL:
            case TokenKind.OPERATOR:
            case TokenKind.RUN:
            case TokenKind.IDENTIFIER:
                this.parseExpressionResult();
                break;
            case TokenKind.IFF:
                this.accept(TokenKind.IFF);
                this.parseExpressionResult();
                this.accept(TokenKind.THEN);
                this.parseStatements();
                // @ts-ignore
                if (this.currentTerminal.kind === TokenKind.ELSE){
                    this.parseStatements();
                }
                this.accept(TokenKind.END);
                break;
            case TokenKind.FOR: 
                this.accept(TokenKind.FOR);
                this.parseExpressionResult();
                this.accept(TokenKind.THEN);
                this.parseStatements();
                this.accept(TokenKind.END);
                break;
            case TokenKind.OUT:
                this.accept(TokenKind.OUT);
                this.parseExpressionResult();
                this.accept(TokenKind.PERCENT);
                break;
            case TokenKind.ASSIGN:
                this.accept(TokenKind.ASSIGN);
                this.accept(TokenKind.IDENTIFIER);
                this.parseExpressionResult();
                this.accept(TokenKind.PERCENT);
                break;
            case TokenKind.RETURN:
                this.accept(TokenKind.RETURN);
                this.parseExpressionResult();
                this.accept(TokenKind.PERCENT);
                break;
            case TokenKind.BREAK:
                this.accept(TokenKind.BREAK);
                break;
        }
    }

    private parseDeclaration(){
        switch (this.currentTerminal.kind){
            case TokenKind.GET:
                this.accept(TokenKind.GET);
                this.accept(TokenKind.IDENTIFIER);
                this.accept(TokenKind.PERCENT);
                break;
            case TokenKind.FUNCTION:
                this.accept(TokenKind.FUNCTION);
                this.accept(TokenKind.IDENTIFIER);
                // @ts-ignore
                while (this.currentTerminal.kind === TokenKind.IDENTIFIER){
                    this.accept(TokenKind.IDENTIFIER);
                }
                this.accept(TokenKind.THEN);
                this.parseStatements();
                this.accept(TokenKind.END);
                break;
            case  TokenKind.LET:
                this.accept(TokenKind.LET);
                this.accept(TokenKind.IDENTIFIER);
                this.parseExpressionResult();
                this.accept(TokenKind.PERCENT);
                break;
        }
    }

    private parseExpression(){
        switch (this.currentTerminal.kind){
            case TokenKind.INTEGER_LITTERAL:
                this.accept(TokenKind.INTEGER_LITTERAL);
                break;
            case TokenKind.STRING_LITTERAL:
                this.accept(TokenKind.STRING_LITTERAL);
                break;
            case TokenKind.BOOLEAN_LITTERAL:
                this.accept(TokenKind.BOOLEAN_LITTERAL);
                break;
            case TokenKind.OPERATOR:
                this.accept(TokenKind.OPERATOR);
                this.parseExpressionResult();
                break;
            case TokenKind.RUN:
                this.accept(TokenKind.RUN);
                this.parseExpressionResult();
                this.accept(TokenKind.END);
                break;
            case TokenKind.IDENTIFIER:
                this.accept(TokenKind.IDENTIFIER);
                if (this.isExpressionToken())
                {
                    this.parseExpressionList();
                    this.accept(TokenKind.PERCENT);
                }
                break;
        }
    }

    private parseExpressionList(){
        this.parseExpression();
        while(this.isExpressionToken()){
            this.parseExpression();
        }
    }

    private parseExpressionResult(){
        this.parseExpression();
        while (this.currentTerminal.kind === TokenKind.OPERATOR) {
            this.accept(TokenKind.OPERATOR);
            this.parseExpression();
        }
    }

    private isExpressionToken(){
        return this.currentTerminal.kind === TokenKind.INTEGER_LITTERAL ||
        this.currentTerminal.kind === TokenKind.STRING_LITTERAL ||
        this.currentTerminal.kind === TokenKind.OPERATOR ||
        this.currentTerminal.kind === TokenKind.RUN ||
        this.currentTerminal.kind === TokenKind.IDENTIFIER ||
        this.currentTerminal.kind === TokenKind.BOOLEAN_LITTERAL
    }

    private accept(expectedTokenKind :TokenKind) : void{
        if (this.currentTerminal.kind === expectedTokenKind){
            this.currentTerminal = this.scanner.scan();
        } else {
            this.reportError(`unable to find token kind ${expectedTokenKind}, got ${this.currentTerminal.kind}`);
        }
    }

    private reportError(message: string){
        throw new Error(message + " at position: " + this.scanner.currentReadIdx);
    }
}