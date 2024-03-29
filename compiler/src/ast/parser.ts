import { ExpressionTypeKind } from "../checker/expression-types";
import { Scanner } from "../scanner/scanner";
import { Token, TokenKind } from "../scanner/tokens";
import { DEFAULT_INT_VALUE } from "../type-defaults";
import { Block } from "./block";
import {
    Declaration,
    FunctionDeclaration,
    GetDelcaration,
    VariableDeclaration,
} from "./declarations";
import {
    BinaryExpression,
    BooleanLiteralExpression,
    CallExpression,
    ExpressionResult,
    ExpressionList,
    IntLiteralExpression,
    StringLiteralExpression,
    UnaryExpression,
    VariableExpression,
    ArrayExperession,
} from "./expression";
import { Identifier } from "./identifier";
import { BooleanLiteral, IntegerLiteral, StringLiteral } from "./literals";
import { Operator } from "./operator";
import { Program } from "./program";
import {
    AssStatement,
    BreakStatement,
    ForStatement,
    IffStatement,
    IndexType,
    OutStatement,
    RetStatement,
    Statement,
    Statements,
} from "./statements";
import { Type } from "./types";

export class Parser {
    private scanner: Scanner;
    private currentTerminal: Token;

    constructor(scanner: Scanner) {
        this.scanner = scanner;
        this.currentTerminal = this.scanner.scan();
    }

    public parseProgram(): Program {
        const block = this.parseBlock();

        if (this.currentTerminal.kind != TokenKind.EOF) {
            console.log(this.scanner.getRemainingSource());
            this.reportError(
                `Incorrectly terminated program. Expected EOF, but got ${this.currentTerminal.kind}`
            );
        }
        return new Program(block);
    }

    private parseBlock(): Block {
        const statements = this.parseStatements();
        return new Block(statements);
    }

    private parseStatements(): Statements {
        const statements = [] as Statement[];
        while (
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
        ) {
            statements.push(this.parseStatement());
        }

        return new Statements(statements);
    }

    private parseStatement(): Statement {
        switch (this.currentTerminal.kind) {
            case TokenKind.GET:
            case TokenKind.FUNCTION:
            case TokenKind.LET:
                return this.parseDeclaration();
            case TokenKind.INTEGER_LITTERAL:
            case TokenKind.STRING_LITTERAL:
            case TokenKind.BOOLEAN_LITTERAL:
            case TokenKind.OPERATOR:
            case TokenKind.RUN:
            case TokenKind.IDENTIFIER:
                return this.parseExpressionResult();
            case TokenKind.IFF:
                return this.parseIffStatment();
            case TokenKind.FOR:
                return this.parseForStatement();
            case TokenKind.OUT:
                return this.parseOutStatement();
            case TokenKind.ASSIGN:
                return this.parseAssStatement();
            case TokenKind.RETURN:
                return this.parseRetStatement();
            case TokenKind.BREAK:
                this.accept(TokenKind.BREAK);
                this.accept(TokenKind.PERCENT);
                return new BreakStatement();
            default:
                this.reportError(
                    `Failed to parse statement from kind ${this.currentTerminal.kind}`
                );
                throw new Error("Unreachable");
        }
    }

    private parseDeclaration(): Declaration {
        switch (this.currentTerminal.kind) {
            case TokenKind.GET:
                return this.parseGetDeclaration();
            case TokenKind.FUNCTION:
                return this.parseFunctionDelcaration();
            case TokenKind.LET:
                return this.parseVariableDeclaration();
            default:
                this.reportError(
                    `Failed to parse declaration from kind ${this.currentTerminal.kind}`
                );
                throw new Error("Unreachable");
        }
    }

    private parsePrimaryExpression(): ExpressionResult {
        switch (this.currentTerminal.kind) {
            case TokenKind.INTEGER_LITTERAL:
                const intLiteral = this.parseIntegerLiteral();
                return new IntLiteralExpression(intLiteral);
            case TokenKind.STRING_LITTERAL:
                const stringLiteral = this.parseStringLiteral();
                return new StringLiteralExpression(stringLiteral);
            case TokenKind.BOOLEAN_LITTERAL:
                const booleanLiteral = this.parseBooleanLiteral();
                return new BooleanLiteralExpression(booleanLiteral);
            case TokenKind.RUN:
                this.accept(TokenKind.RUN);
                const expression = this.parseExpressionResult();
                this.accept(TokenKind.END);
                return expression;
            case TokenKind.IDENTIFIER:
                const identifierToken = this.accept(TokenKind.IDENTIFIER);
                const identifier = new Identifier(identifierToken.spelling);
                if (this.isExpressionToken()) {
                    const expressionList = this.parseExpressionList();
                    return new CallExpression(identifier, expressionList);
                    // @ts-ignore
                } else if (this.currentTerminal.kind === TokenKind.INDEX) {
                    const indexList = this.parseIndex();
                    return new ArrayExperession(identifier, indexList);
                }
                return new VariableExpression(identifier);
        }

        this.reportError(
            `Unable to parse expression from token kind: ${this.currentTerminal.kind}`
        );

        throw new Error("Unreachable");
    }

    private parseIffStatment(): IffStatement {
        this.accept(TokenKind.IFF);
        const ifExpResult = this.parseExpressionResult();
        this.accept(TokenKind.THEN);
        const ifStatements = this.parseStatements();
        let elseStatements = undefined;
        // @ts-ignore
        if (this.currentTerminal.kind === TokenKind.ELSE) {
            this.accept(TokenKind.ELSE);
            elseStatements = this.parseStatements();
        }
        this.accept(TokenKind.END);
        return new IffStatement(ifExpResult, ifStatements, elseStatements);
    }

    private parseForStatement(): ForStatement {
        this.accept(TokenKind.FOR);
        const exppressionResult = this.parseExpressionResult();
        this.accept(TokenKind.THEN);
        const statements = this.parseStatements();
        this.accept(TokenKind.END);
        return new ForStatement(exppressionResult, statements);
    }

    private parseOutStatement(): OutStatement {
        this.accept(TokenKind.OUT);
        const expResult = this.parseExpressionResult();
        this.accept(TokenKind.PERCENT);
        return new OutStatement(expResult);
    }

    private parseAssStatement(): AssStatement {
        this.accept(TokenKind.ASSIGN);
        const assIdentifierToken = this.accept(TokenKind.IDENTIFIER);
        const assIdentifier = new Identifier(assIdentifierToken.spelling);
        let indexes = [] as IndexType[];
        // @ts-ignore
        if (this.currentTerminal.kind === TokenKind.INDEX) {
            indexes = this.parseIndex();
        }
        const assExpression = this.parseExpressionResult();
        this.accept(TokenKind.PERCENT);
        return new AssStatement(assIdentifier, assExpression, indexes);
    }

    private parseRetStatement(): RetStatement {
        this.accept(TokenKind.RETURN);
        const retExpression = this.parseExpressionResult();
        this.accept(TokenKind.PERCENT);
        return new RetStatement(retExpression);
    }

    private parseExpressionList(): ExpressionList {
        const expressions = [this.parseExpression6()];

        while (this.isExpressionToken()) {
            expressions.push(this.parseExpression6());
        }

        return new ExpressionList(expressions);
    }

    private parseExpressionResult(): ExpressionResult {
        let res: ExpressionResult = this.parseExpression6();

        while (this.currentTerminal.isBooleanOperator()) {
            const operator = this.parseOperator();
            const expression = this.parseExpressionResult();

            res = new BinaryExpression(res, operator, expression);
        }

        return res;
    }

    private parseIndex(): IndexType[] {
        this.accept(TokenKind.INDEX);
        let token = [] as IndexType[];
        token.push(this.parseIndexType());
        while (this.currentTerminal.kind === TokenKind.INDEX) {
            this.accept(TokenKind.INDEX);
            token.push(this.parseIndexType());
        }
        return token;
    }

    private parseIndexType(): IndexType {
        if (this.currentTerminal.kind === TokenKind.INTEGER_LITTERAL) {
            return new IntegerLiteral(
                this.accept(TokenKind.INTEGER_LITTERAL).spelling
            );
        } else {
            return new Identifier(this.accept(TokenKind.IDENTIFIER).spelling);
        }
    }

    private parseExpression6(): ExpressionResult {
        let res = this.parseExpression5();

        if (this.currentTerminal.spelling === "eql") {
            const operator = this.parseOperator();
            const expression = this.parseExpression5();

            res = new BinaryExpression(res, operator, expression);
        }

        return res;
    }

    private parseExpression5(): ExpressionResult {
        let res = this.parseExpression4();

        if (this.currentTerminal.isCompareOperator()) {
            const operator = this.parseOperator();
            const expression = this.parseExpression4();

            res = new BinaryExpression(res, operator, expression);
        }

        return res;
    }

    private parseExpression4(): ExpressionResult {
        let res = this.parseExpression3();

        if (this.currentTerminal.isAddOperator()) {
            const operator = this.parseOperator();
            const expression = this.parseExpression3();

            res = new BinaryExpression(res, operator, expression);
        }

        return res;
    }

    private parseExpression3(): ExpressionResult {
        let res = this.parseExpression2();

        if (this.currentTerminal.isMultOperator()) {
            const operator = this.parseOperator();
            const expression = this.parseExpression2();

            res = new BinaryExpression(res, operator, expression);
        }

        return res;
    }

    private parseExpression2(): ExpressionResult {
        if (this.currentTerminal.isUnaryOperand()) {
            const operator = this.parseOperator();
            const expression = this.parsePrimaryExpression();
            return new UnaryExpression(operator, expression);
        }
        return this.parsePrimaryExpression();
    }

    private parseGetDeclaration(): GetDelcaration {
        this.accept(TokenKind.GET);
        const varIdentifier = new Identifier(
            this.accept(TokenKind.IDENTIFIER).spelling
        );
        this.accept(TokenKind.PERCENT);
        return new GetDelcaration(varIdentifier);
    }
    private parseFunctionDelcaration(): FunctionDeclaration {
        this.accept(TokenKind.FUNCTION);
        const functionNameToken = this.accept(TokenKind.IDENTIFIER);
        const functionName = new Identifier(functionNameToken.spelling);

        const funcArguments = [] as Identifier[];
        const funcArgumentTypes = [] as Type[];
        // @ts-ignore
        while (this.currentTerminal.kind === TokenKind.IDENTIFIER) {
            const token = this.accept(TokenKind.IDENTIFIER);
            let typeToken: Token;
            // @ts-ignore
            if (this.currentTerminal.kind === TokenKind.TYPE) {
                typeToken = this.accept(TokenKind.TYPE);
                // @ts-ignore
            } else if (this.currentTerminal.kind === TokenKind.ARRAY) {
                typeToken = this.accept(TokenKind.ARRAY);
            } else {
                this.reportError(
                    "Type was not declared for function parameter"
                );
            }

            const identifier = new Identifier(token.spelling);
            funcArguments.push(identifier);
            funcArgumentTypes.push(new Type(typeToken!.spelling));
        }

        this.accept(TokenKind.THEN);
        const statements = this.parseStatements();
        this.accept(TokenKind.END);
        return new FunctionDeclaration(
            functionName,
            funcArguments,
            funcArgumentTypes,
            statements
        );
    }

    private parseVariableDeclaration(): VariableDeclaration {
        this.accept(TokenKind.LET);
        const identifierToken = this.accept(TokenKind.IDENTIFIER);

        if (this.currentTerminal.kind === TokenKind.ARRAY) {
            this.accept(TokenKind.ARRAY);
            let expressionList;
            // @ts-ignore
            if (this.currentTerminal.kind === TokenKind.INDEX) {
                const indexes = this.parseIndex();
                this.accept(TokenKind.PERCENT);
                return new VariableDeclaration(
                    new Identifier(identifierToken.spelling),
                    undefined,
                    undefined,
                    indexes
                );
            } else {
                expressionList = this.parseExpressionList();
                this.accept(TokenKind.PERCENT);
                return new VariableDeclaration(
                    new Identifier(identifierToken.spelling),
                    undefined,
                    expressionList,
                    undefined
                );
            }
        } else {
            const expression = this.parseExpressionResult();
            this.accept(TokenKind.PERCENT);

            return new VariableDeclaration(
                new Identifier(identifierToken.spelling),
                expression,
                undefined,
                undefined
            );
        }
    }

    private parseOperator(): Operator {
        if (this.currentTerminal.kind === TokenKind.OPERATOR) {
            const operator = new Operator(this.currentTerminal.spelling);
            this.accept(TokenKind.OPERATOR);
            return operator;
        }

        throw new Error("unreachable branch has been reached");
    }

    private parseIntegerLiteral(): IntegerLiteral {
        const token = this.accept(TokenKind.INTEGER_LITTERAL);
        return new IntegerLiteral(token.spelling);
    }

    private parseStringLiteral(): StringLiteral {
        const token = this.accept(TokenKind.STRING_LITTERAL);
        return new StringLiteral(token.spelling);
    }

    private parseBooleanLiteral(): BooleanLiteral {
        const token = this.accept(TokenKind.BOOLEAN_LITTERAL);
        return new BooleanLiteral(token.spelling);
    }

    private isExpressionToken() {
        return (
            this.currentTerminal.kind === TokenKind.INTEGER_LITTERAL ||
            this.currentTerminal.kind === TokenKind.STRING_LITTERAL ||
            this.currentTerminal.kind === TokenKind.RUN ||
            this.currentTerminal.kind === TokenKind.IDENTIFIER ||
            this.currentTerminal.kind === TokenKind.BOOLEAN_LITTERAL
        );
    }

    private accept(expectedTokenKind: TokenKind): Token {
        let acceptedToken = this.currentTerminal;
        if (this.currentTerminal.kind === expectedTokenKind) {
            this.currentTerminal = this.scanner.scan();
        } else {
            this.reportError(
                `unable to find token kind ${expectedTokenKind}, got ${this.currentTerminal.kind}`
            );
        }

        return acceptedToken;
    }

    private acceptEither(expectedTokenKind: TokenKind): Token {
        let acceptedToken = this.currentTerminal;
        if (this.currentTerminal.kind === expectedTokenKind) {
            this.currentTerminal = this.scanner.scan();
        } else {
            this.reportError(
                `unable to find token kind ${expectedTokenKind}, got ${this.currentTerminal.kind}`
            );
        }

        return acceptedToken;
    }

    private reportError(message: string) {
        throw new Error(
            message + " at position: " + this.scanner.currentReadIdx
        );
    }
}
