import { AST } from "./ast";
import { Block } from "./block";
import {
    FunctionDeclaration,
    GetDelcaration,
    VariableDeclaration,
} from "./declarations";
import {
    ArrayExperession,
    BinaryExpression,
    BooleanLiteralExpression,
    CallExpression,
    ExpressionList,
    ExpressionResult,
    IntLiteralExpression,
    StringLiteralExpression,
    UnaryExpression,
    VariableExpression,
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
    OutStatement,
    RetStatement,
    Statements,
} from "./statements";
import { Type } from "./types";

// TODO: Substitute alle the AST to actual types.
export interface IVisitor {
    visitProgram(node: Program, args: any): any;
    visitBlock(node: Block, args: any): any;
    visitStatements(node: Statements, args: any): any;

    // Statements
    visitExpressionResultStatement(node: ExpressionResult, args: any): any;
    visitIffStatement(node: IffStatement, args: any): any;
    visitForStatement(node: ForStatement, args: any): any;
    visitOutStatement(node: OutStatement, args: any): any;
    visitAssStatement(node: AssStatement, args: any): any;
    visitRetStatement(node: RetStatement, args: any): any;
    visitBreakStatement(node: BreakStatement, args: any): any;

    // Delcarations
    visitGetDeclaration(node: GetDelcaration, args: any): any;
    visitFunctionDeclaration(node: FunctionDeclaration, args: any): any;
    visitVariableDeclaration(node: VariableDeclaration, args: any): any;

    // Expressions
    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any): any;
    visitStringLiteralExpression(node: StringLiteralExpression, args: any): any;
    visitBooleanLiteralExpression(
        node: BooleanLiteralExpression,
        args: any
    ): any;
    visitUnaryExpression(node: UnaryExpression, args: any): any;
    visitBinaryExpression(node: BinaryExpression, args: any): any;
    visitVariableExpression(node: VariableExpression, args: any): any;
    visitCallExpression(node: CallExpression, args: any): any;
    visitExpressionList(node: ExpressionList, args: any): any;
    visitArrayExpression(node: ArrayExperession, args: any): any;

    // Terminals
    visitIdentifier(node: Identifier, args: any): any;

    // Literals
    visitIntegerLiteral(node: IntegerLiteral, args: any): any;
    visitBooleanLiteral(node: BooleanLiteral, args: any): any;
    visitStringLiteral(node: StringLiteral, args: any): any;

    // Operator
    visitOperator(node: Operator, args: any): any;

    // Type
    visitType(node: Type, args: any): any;
}
