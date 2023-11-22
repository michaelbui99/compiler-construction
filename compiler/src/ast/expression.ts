import { AST } from "./ast";
import { VariableDeclaration } from "./declarations";
import { Identifier } from "./identifier";
import { BooleanLiteral, IntegerLiteral, StringLiteral } from "./literals";
import { Operator } from "./operator";
import { IndexType } from "./statements";
import { IVisitor } from "./visitor";

export abstract class ExpressionResult extends AST {}

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
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitBinaryExpression(this, arg);
    }
}

export class UnaryExpression extends ExpressionResult {
    constructor(public operator: Operator, public operand: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitUnaryExpression(this, arg);
    }
}

export class IntLiteralExpression extends ExpressionResult {
    constructor(public intLiteral: IntegerLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitIntegerLiteralExpression(this, arg);
    }
}

export class StringLiteralExpression extends ExpressionResult {
    constructor(public stringLitteral: StringLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitStringLiteralExpression(this, arg);
    }
}

export class BooleanLiteralExpression extends ExpressionResult {
    constructor(public booleanLiteral: BooleanLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitBooleanLiteralExpression(this, arg);
    }
}

export class CallExpression extends ExpressionResult {
    constructor(public identifier: Identifier, public args: ExpressionList) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitCallExpression(this, arg);
    }
}

export class VariableExpression extends ExpressionResult {
    public varDec?: VariableDeclaration;
    constructor(public identifier: Identifier) {
        super();
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
