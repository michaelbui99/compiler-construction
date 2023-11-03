import { Block } from "../ast/block";
import {
    GetDelcaration,
    FunctionDeclaration,
    VariableDeclaration,
} from "../ast/declarations";
import {
    ExpressionResult,
    IntLiteralExpression,
    StringLiteralExpression,
    BooleanLiteralExpression,
    UnaryExpression,
    BinaryExpression,
    VariableExpression,
    CallExpression,
    ExpressionList,
    ArrayExperession,
} from "../ast/expression";
import { Identifier } from "../ast/identifier";
import { IntegerLiteral, BooleanLiteral, StringLiteral } from "../ast/literals";
import { Operator } from "../ast/operator";
import { Program } from "../ast/program";
import {
    Statements,
    IffStatement,
    ForStatement,
    OutStatement,
    AssStatement,
    RetStatement,
    BreakStatement,
} from "../ast/statements";
import { Type } from "../ast/types";
import { IVisitor } from "../ast/visitor";
import { CompilerError } from "./exceptions";
import { ExpressionType, ExpressionTypeKind } from "./expression-types";
import { IdentificationTable } from "./identification-table";

export class Checker implements IVisitor {
    private idTable = new IdentificationTable();

    public check(program: Program): void {
        program.accept(this, null);
    }

    visitProgram(node: Program, args: any) {
        this.idTable.openScope();
        node.block.accept(this, args);
        this.idTable.closeScope();

        return null;
    }

    visitBlock(node: Block, args: any) {
        node.statements.accept(this, args);
        return null;
    }

    visitStatements(node: Statements, args: any) {
        node.statements.forEach((statement) => statement.accept(this, args));
        return null;
    }

    visitExpressionResultStatement(node: ExpressionResult, args: any) {
        node.accept(this, args);
        return null;
    }

    visitIffStatement(node: IffStatement, args: any) {
        node.expression.accept(this, args);
        node.thnPart.accept(this, args);
        node.elsPart?.accept(this, args);

        return null;
    }
    visitForStatement(node: ForStatement, args: any) {
        node.expression.accept(this, args);
        node.statements.accept(this, args);

        return null;
    }
    visitOutStatement(node: OutStatement, args: any) {
        node.expression.accept(this, args);

        return null;
    }
    visitAssStatement(node: AssStatement, args: any) {
        node.identifier.accept(this, args);
        node.expression.accept(this, args);
        node.index?.forEach((idx) => idx.accept(this, args));

        return null;
    }
    visitRetStatement(node: RetStatement, args: any) {
        node.expression.accept(this, args);
    }
    visitBreakStatement(node: BreakStatement, args: any) {
        return null;
    }
    visitGetDeclaration(node: GetDelcaration, args: any) {
        // for ... thn get myNumber% out myNumber% end
        const id = node.identifier.accept(this, args) as string;
        this.idTable.declare(id, node);
        return null;
    }
    visitFunctionDeclaration(node: FunctionDeclaration, args: any) {
        const id = node.identifier.accept(this, args);
        this.idTable.declare(id, node);
        node.params.forEach((param) => param.accept(this, args));
        node.paramTypes.forEach((paramType) => paramType.accept(this, args));
        node.statments.accept(this, args);

        return null;
    }

    visitVariableDeclaration(node: VariableDeclaration, args: any) {
        node.identifier.accept(this, args);
        node.expression?.accept(this, args);
        node.expressionList?.accept(this, args);

        return null;
    }
    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any) {
        return node.intLiteral.accept(this, args);
    }
    visitStringLiteralExpression(node: StringLiteralExpression, args: any) {
        return node.stringLitteral.accept(this, args);
    }
    visitBooleanLiteralExpression(node: BooleanLiteralExpression, args: any) {
        return node.booleanLiteral.accept(this, args);
    }
    visitUnaryExpression(node: UnaryExpression, args: any) {
        node.operator.accept(this, args);
        node.operand.accept(this, args);

        return null;
    }
    visitBinaryExpression(node: BinaryExpression, args: any) {
        node.operand1.accept(this, args);
        node.operator.accept(this, args);
        node.operand2.accept(this, args);

        return null;
    }
    visitVariableExpression(node: VariableExpression, args: any) {
        node.identifier.accept(this, args);
        return null;
    }
    visitCallExpression(node: CallExpression, args: any) {
        const id = node.identifier.accept(this, args);

        const existingDeclaration = this.idTable.retrieveDeclaration(id);
        if (!existingDeclaration) {
            throw new CompilerError(
                `No function of name ${id} has been declared`
            );
        }
        if (!(existingDeclaration instanceof FunctionDeclaration)) {
            throw new CompilerError(`Identifier ${id} is not a function`);
        }

        const callArgumentCount = node.args.expressions.length;
        const definedArgumentCount = existingDeclaration.params.length;

        if (callArgumentCount != definedArgumentCount) {
            throw new CompilerError(
                `Function ${id} expected ${definedArgumentCount} arguments, but was passed ${callArgumentCount}`
            );
        }

        for (let i = 0; i < node.args.expressions.length; i++) {
            const callType: ExpressionType = node.args.expressions[i].accept(
                this,
                null
            );
            const definedType: ExpressionType = existingDeclaration.params[
                i
            ].accept(this, null);

            if (callType.kind != definedType.kind) {
                throw new CompilerError(
                    `Argument type mismatch, expected ${definedType.kind}, but got ${callType.kind}`
                );
            }
        }

        node.args.accept(this, args);
        return null;
    }
    visitExpressionList(node: ExpressionList, args: any) {
        node.expressions.forEach((expression) => expression.accept(this, args));
        return null;
    }
    visitArrayExpression(node: ArrayExperession, args: any) {
        node.identifier.accept(this, args);
        node.indexes.forEach((index) => index.accept(this, args));
        return null;
    }
    visitIdentifier(node: Identifier, args: any) {
        return node.spelling;
    }
    visitIntegerLiteral(node: IntegerLiteral, args: any) {
        return {
            kind: ExpressionTypeKind.INTEGER,
            spelling: node.spelling,
        } as ExpressionType;
    }
    visitBooleanLiteral(node: BooleanLiteral, args: any) {
        return {
            kind: ExpressionTypeKind.BOOLEAN,
            spelling: node.spelling,
        } as ExpressionType;
    }
    visitStringLiteral(node: StringLiteral, args: any) {
        return {
            kind: ExpressionTypeKind.STRING,
            spelling: node.spelling,
        } as ExpressionType;
    }
    visitOperator(node: Operator, args: any) {
        return node.spelling;
    }
    visitType(node: Type, args: any) {
        return null;
    }
}
