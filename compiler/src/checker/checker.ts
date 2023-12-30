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
import { Token, TokenKind } from "../scanner/tokens";
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
        return node.accept(this, args);
    }

    visitIffStatement(node: IffStatement, args: any) {
        this.idTable.openScope();
        node.expression.accept(this, args);
        node.thnPart.accept(this, args);
        node.elsPart?.accept(this, args);
        this.idTable.closeScope();
        return null;
    }
    visitForStatement(node: ForStatement, args: any) {
        this.idTable.openScope();
        node.expression.accept(this, args);
        node.statements.accept(this, args);
        this.idTable.closeScope();

        return null;
    }
    visitOutStatement(node: OutStatement, args: any) {
        const type: ExpressionType = node.expression.accept(this, args);
        node.expressionType = type;

        return null;
    }
    visitAssStatement(node: AssStatement, args: any) {
        const id = node.identifier.accept(this, args);
        const existingDeclaration = this.idTable.retrieveDeclaration(id);
        if (!existingDeclaration) {
            throw new CompilerError(
                `Cannot reassign ${id} as it has never been declared`
            );
        }

        if (!(existingDeclaration instanceof VariableDeclaration)) {
            throw new CompilerError(`Identifier ${id} is not a variable`);
        }

        node.declaration = existingDeclaration;
        const assignToType = node.expression.accept(
            this,
            args
        ) as ExpressionType;

        let variableType: ExpressionType | undefined = undefined;
        if (existingDeclaration.expressionList) {
            const definedIndexes: ExpressionType =
                existingDeclaration.expressionList.expressions[0].accept(
                    this,
                    args
                );
            const askedIndexes = node.index?.length ?? 0;
            const finalIndexes = (definedIndexes.depth ?? 0) + 1 - askedIndexes;
            variableType = {
                kind:
                    finalIndexes === 0
                        ? ExpressionTypeKind.INTEGER
                        : ExpressionTypeKind.ARRAY,
                depth: finalIndexes,
            } as ExpressionType;
        } else if (existingDeclaration.indexList) {
            const definedIndexes = existingDeclaration.indexList.length;
            const askedIndexes = node.index?.length ?? 0;
            const finalIndexes = definedIndexes - askedIndexes;
            variableType = {
                kind:
                    finalIndexes === 0
                        ? ExpressionTypeKind.INTEGER
                        : ExpressionTypeKind.ARRAY,
                depth: finalIndexes,
            } as ExpressionType;
        } else {
            variableType = existingDeclaration.expression?.accept(this, args);
            if (variableType === undefined)
                throw new CompilerError("internal error");
            if (variableType.depth == undefined) {
                variableType.depth = 0;
            }
            variableType.depth -= node.index?.length ?? 0;
        }

        if (assignToType.kind !== variableType?.kind) {
            throw new CompilerError(
                `Assignment of type ${assignToType.kind} not possible to type ${variableType?.kind}`
            );
        }

        if ((assignToType.depth ?? 0) != (variableType?.depth ?? 0)) {
            throw new CompilerError(
                "Depth of variable does not correspont to indexes"
            );
        }

        // TODO: Handle checking reassigning values for arrays
        node.index?.forEach((idx) => idx.accept(this, args));

        return null;
    }
    visitRetStatement(node: RetStatement, args: any) {
        const type: ExpressionType = node.expression.accept(this, args);
        return type;
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
        this.idTable.openScope();
        node.params.forEach((param, idx) => {
            // Params of function are treated as variables inside the function
            let type = node.paramTypes[idx];
            let expresionType: ExpressionType | undefined = undefined;
            let expression;
            // We need this so the check can perform type checking in call expression
            switch (type.spelling) {
                case "int":
                    expression = new IntLiteralExpression(
                        new IntegerLiteral("0")
                    );
                    expresionType = {
                        depth: 0,
                        kind: ExpressionTypeKind.INTEGER,
                        spelling: "int",
                    };

                    break;
                case "bol":
                    expression = new BooleanLiteralExpression(
                        new BooleanLiteral("tru")
                    );
                    expresionType = {
                        depth: 0,
                        kind: ExpressionTypeKind.BOOLEAN,
                        spelling: "bol",
                    };
                    break;
                default:
                    break;
            }
            this.idTable.declare(
                param.spelling,
                new VariableDeclaration(
                    param,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    expresionType
                )
            );
        });
        node.params.forEach((param) => param.accept(this, args));
        node.paramTypes.forEach((paramType) => paramType.accept(this, args));
        node.statments.accept(this, args);

        // Ensure that every return is of same type.
        const retStatements: RetStatement[] = [];
        for (let statement of node.statments.statements) {
            if (statement instanceof RetStatement) {
                retStatements.push(statement);
            }
        }

        const returnTypes: ExpressionType[] =
            (retStatements.map((statement) =>
                statement.accept(this, null)
            ) as unknown as ExpressionType[]) ?? [];

        if (returnTypes.length > 0) {
            const expectedType = returnTypes[0];
            const allReturnsAreOfSameType = returnTypes.every(
                (t) => t.kind === expectedType.kind
            );
            if (!allReturnsAreOfSameType) {
                throw new CompilerError(
                    "Function must return same type in every branch"
                );
            }

            node.returnType = expectedType;
        }
        this.idTable.closeScope();

        return null;
    }

    visitVariableDeclaration(node: VariableDeclaration, args: any) {
        const id = node.identifier.accept(this, args);
        const type: ExpressionType = node.expression?.accept(this, args);
        if (type) {
            node.type = type;
        }
        this.idTable.declare(id, node);
        // Elements in ExpressionList indicates that it is an array declaration.
        if (node.expressionList !== undefined) {
            let firstType: ExpressionType =
                node.expressionList.expressions[0].accept(this, args);
            node.expressionList.expressions.forEach((expression) => {
                let type: ExpressionType = expression.accept(this, args);
                if (firstType.kind !== type.kind) {
                    throw new CompilerError(
                        "all expressions of array has to have the same type"
                    );
                }
                if (
                    // type.kind !== ExpressionTypeKind.ARRAY && Only allow single level integer arrays.
                    type.kind !== ExpressionTypeKind.INTEGER
                ) {
                    throw new CompilerError(
                        "Arrays can have elements of type array or integer only."
                    );
                }
            });
            node.expressionList?.accept(this, args);
        } else if (node.indexList !== undefined) {
            return null;
        }

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
        const token = node.operator.accept(this, args) as Token;
        const operand = node.operand.accept(this, args) as ExpressionType;
        if (token.isUnaryOperand()) {
            if (token.spelling === "len") {
                return {
                    kind: ExpressionTypeKind.INTEGER,
                    spelling: token.spelling, // TODO: not sure how to hava this
                } as ExpressionType;
            } else if (token.spelling === "not") {
                if (
                    operand.kind === ExpressionTypeKind.BOOLEAN ||
                    operand.kind === ExpressionTypeKind.INTEGER
                ) {
                    return {
                        kind: operand.kind,
                        spelling: token.spelling, // TODO: not sure what to have this
                    } as ExpressionType;
                }
            }
        }
        throw new CompilerError(
            `Unable to parse unary expression ${token.spelling} onto ${operand.spelling}`
        );
    }
    visitBinaryExpression(node: BinaryExpression, args: any) {
        const operand1 = node.operand1.accept(this, args) as ExpressionType;
        const token = node.operator.accept(this, args) as Token;
        const operand2 = node.operand2.accept(this, args) as ExpressionType;
        if (token.isBooleanOperator()) {
            if (
                operand1.kind === ExpressionTypeKind.BOOLEAN &&
                operand2.kind === ExpressionTypeKind.BOOLEAN
            ) {
                return {
                    kind: ExpressionTypeKind.BOOLEAN,
                    spelling: token.spelling, // TODO: what this should actually be
                } as ExpressionType;
            }
        } else if (token.isAddOperator() || token.isMultOperator()) {
            if (
                operand1.kind === ExpressionTypeKind.INTEGER &&
                operand2.kind === ExpressionTypeKind.INTEGER
            ) {
                return {
                    kind: ExpressionTypeKind.INTEGER,
                    spelling: token.spelling, // TODO: what this should actually be
                } as ExpressionType;
            }
        } else if (token.isCompareOperator()) {
            if (
                operand1.kind === ExpressionTypeKind.INTEGER &&
                operand2.kind === ExpressionTypeKind.INTEGER
            ) {
                return {
                    kind: ExpressionTypeKind.BOOLEAN,
                    spelling: token.spelling, // TODO: what this should actually be
                } as ExpressionType;
            }
        }
        throw new CompilerError(
            `operatior ${token.spelling} can not be applies to ${operand1.spelling} of kind ${operand1.kind} and ${operand2.spelling} of kind ${operand2.kind}`
        );
    }
    visitVariableExpression(node: VariableExpression, args: any) {
        const id = node.identifier.accept(this, args);

        const existingDeclaration = this.idTable.retrieveDeclaration(id);
        if (!existingDeclaration) {
            throw new CompilerError(
                `No variable of name ${id} has been declared`
            );
        }
        if (!(existingDeclaration instanceof VariableDeclaration)) {
            throw new CompilerError(`Identifier ${id} is not a variable`);
        }

        node.declaration = existingDeclaration;
        if (existingDeclaration.expressionList !== undefined) {
            return {
                kind: ExpressionTypeKind.ARRAY,
                spelling: node.identifier.spelling,
            } as ExpressionType;
        } else {
            return {
                kind: existingDeclaration.expression?.accept(this, args).kind,
                spelling: node.identifier.spelling,
            } as ExpressionType;
        }
    }
    visitCallExpression(node: CallExpression, args: any) {
        const id = node.identifier.accept(this, args);

        // Check if function has been declared
        const existingDeclaration = this.idTable.retrieveDeclaration(id);
        if (!existingDeclaration) {
            throw new CompilerError(
                `No function of name ${id} has been declared`
            );
        }
        // Check if identifier being call is a function
        if (!(existingDeclaration instanceof FunctionDeclaration)) {
            throw new CompilerError(`Identifier ${id} is not a function`);
        }
        node.declaration = existingDeclaration;
        const callArgumentCount = node.args.expressions.length;
        const definedArgumentCount = existingDeclaration.params.length;

        // Check if call argument count is equal to arugment count in function definition.
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
            const definedType: ExpressionType = existingDeclaration.paramTypes[
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
        const types = node.expressions.map((expression) =>
            expression.accept(this, args)
        );

        return types as ExpressionType[];
    }
    visitArrayExpression(node: ArrayExperession, args: any) {
        const id = node.identifier.accept(this, args);
        const declaration = this.idTable.retrieveDeclaration(id);
        if (!declaration) {
            throw new CompilerError(`Identifier ${id} has not been declared`);
        }

        // let myArr arr 2 3 4%
        // let myArr arr #2 #3%
        // let a myArr #2 #4%

        if (!(declaration instanceof VariableDeclaration)) {
            throw new CompilerError(`No array with id ${id} has been declared`);
        }

        if (
            declaration.expressionList === undefined &&
            declaration.indexList === undefined
        ) {
            throw new CompilerError(`Identifier ${id} is not an array`);
        }

        // ass myArr #1 #1 5 %
        node.indexes.forEach((index) => {
            const type = index.accept(this, args);
            if (typeof type === "string") {
                // It is an identifier
                const declaration = this.idTable.retrieveDeclaration(type);
                if (!declaration) {
                    throw new CompilerError(
                        `Identifier ${type} has not been declared.`
                    );
                } else {
                    if (!(declaration instanceof VariableDeclaration)) {
                        throw new CompilerError("stupid");
                    } else {
                        if (declaration.expression === undefined) {
                            throw new CompilerError("stupid");
                        }
                        const type: ExpressionType =
                            declaration.expression.accept(this, args);
                        if (type.kind !== ExpressionTypeKind.INTEGER) {
                            throw new CompilerError(
                                "Only integer type is allowed as index"
                            );
                        }
                    }
                }
            }
        });
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
        return new Token(TokenKind.OPERATOR, node.spelling);
    }
    visitType(node: Type, args: any) {
        switch (node.spelling) {
            case "bol":
                return {
                    kind: ExpressionTypeKind.BOOLEAN,
                } as ExpressionType;
            case "int":
                return {
                    kind: ExpressionTypeKind.INTEGER,
                } as ExpressionType;
            case "str":
                return {
                    kind: ExpressionTypeKind.STRING,
                } as ExpressionType;
            case "arr":
                return {
                    kind: ExpressionTypeKind.ARRAY,
                } as ExpressionType;
            default:
                throw new CompilerError("unknown type");
        }
    }
}
