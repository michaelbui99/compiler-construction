import { AST } from "./ast";
import { Block } from "./block";
import { Program } from "./program";

// TODO: Substitute alle the AST to actual types.
export interface IVisitor {
    visitProgram(node: Program, args: any): any;
    visitBlock(node: Block, args: any): any;
    visitStatements(node: AST, args: any): any;

    // Statements
    visitExpressionResultStatement(node: AST, args: any): any;
    visitIfStatement(node: AST, args: any): any;
    visitForStatement(node: AST, args: any): any;
    visitOutStatement(node: AST, args: any): any;
    visitAssignStatement(node: AST, args: any): any;
    visitReturnStatement(node: AST, args: any): any;
    visitBreakStatement(node: AST, args: any): any;

    // Delcarations
    visitInputDeclaration(node: AST, args: any): any;
    visitFunctionDeclaration(node: AST, args: any): any;
    visitVariableDeclaration(node: AST, args: any): any;

    // Expressions
    visitIntegerLiteralExpression(node: AST, args: any): any;
    visitStringLiteralExpression(node: AST, args: any): any;
    visitBooleanLiteralExpression(node: AST, args: any): any;
    visitUnaryExpression(node: AST, args: any): any;
    visitBinaryExpression(node: AST, args: any): any;
    visitVariableExpression(node: AST, args: any): any;
    visitCallExpression(node: AST, args: any): any;
}
