import { AST } from "./ast";
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
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    }
}

export class UnaryExpression extends ExpressionResult {
    constructor(public operator: Operator, public operand: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class IntLiteralExpression extends ExpressionResult {
    constructor(public intLiteral: IntegerLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class StringLiteralExpression extends ExpressionResult {
    constructor(public stringLitteral: StringLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class BooleanLiteralExpression extends ExpressionResult {
    constructor(public booleanLiteral: BooleanLiteral) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class CallExpression extends ExpressionResult {
    constructor(public identifier: Identifier, public args: ExpressionList) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class VariableExpression extends ExpressionResult {
    constructor(public identifier: Identifier) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class ArrayExperession extends ExpressionResult {
    constructor(public identifier: Identifier, public indexes: IndexType[]){
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}
