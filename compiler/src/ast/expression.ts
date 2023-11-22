import {
    ExpressionType,
    ExpressionTypeKind,
} from "../checker/expression-types";
import { AST } from "./ast";
import { FunctionDeclaration, VariableDeclaration } from "./declarations";
import { Identifier } from "./identifier";
import { BooleanLiteral, IntegerLiteral, StringLiteral } from "./literals";
import { Operator } from "./operator";
import { IndexType } from "./statements";
import { IVisitor } from "./visitor";

export abstract class ExpressionResult extends AST {
    constructor(public type?: ExpressionType) {
        super();
    }
}

export class ExpressionList extends ExpressionResult {
    constructor(public expressions: ExpressionResult[] = []) {
        super();
        this.expressions = expressions ?? [];
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitExpressionList(this, arg);
    }
}

export class BinaryExpression extends ExpressionResult {
    constructor(
        public operand1: ExpressionResult,
        public operator: Operator,
        public operand2: ExpressionResult
    ) {
        super(operand1.type);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitBinaryExpression(this, arg);
    }
}

export class UnaryExpression extends ExpressionResult {
    constructor(public operator: Operator, public operand: ExpressionResult) {
        super(operand.type);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitUnaryExpression(this, arg);
    }
}

export class IntLiteralExpression extends ExpressionResult {
    constructor(public intLiteral: IntegerLiteral) {
        super({ depth: 0, kind: ExpressionTypeKind.INTEGER, spelling: "int" });
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitIntegerLiteralExpression(this, arg);
    }
}

export class StringLiteralExpression extends ExpressionResult {
    constructor(public stringLitteral: StringLiteral) {
        super({ depth: 0, kind: ExpressionTypeKind.STRING, spelling: "str" });
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitStringLiteralExpression(this, arg);
    }
}

export class BooleanLiteralExpression extends ExpressionResult {
    constructor(public booleanLiteral: BooleanLiteral) {
        super({ depth: 0, kind: ExpressionTypeKind.BOOLEAN, spelling: "bol" });
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitBooleanLiteralExpression(this, arg);
    }
}

export class CallExpression extends ExpressionResult {
    constructor(
        public identifier: Identifier,
        public args: ExpressionList,
        public declaration?: FunctionDeclaration
    ) {
        super(declaration?.returnType);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitCallExpression(this, arg);
    }
}

export class VariableExpression extends ExpressionResult {
    constructor(
        public identifier: Identifier,
        public declaration?: VariableDeclaration
    ) {
        super(declaration?.type);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitVariableExpression(this, arg);
    }
}

export class ArrayExperession extends ExpressionResult {
    constructor(public identifier: Identifier, public indexes: IndexType[]) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitArrayExpression(this, arg);
    }
}
