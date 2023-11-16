import { AST } from "./ast";
import { ExpressionResult } from "./expression";
import { Identifier } from "./identifier";
import { IntegerLiteral } from "./literals";
import { IVisitor } from "./visitor";

export abstract class Statement extends AST {}

export class Statements extends AST {
    constructor(public statements: Statement[] = []) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitStatements(this, arg);
    }
}

export class IffStatement extends Statement {
    constructor(
        public expression: ExpressionResult,
        public thnPart: Statements,
        public elsPart: Statements | undefined
    ) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitIffStatement(this, arg);
    }
}

export class ForStatement extends Statement {
    constructor(
        public expression: ExpressionResult,
        public statements: Statements
    ) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitForStatement(this, arg);
    }
}

export class OutStatement extends Statement {
    constructor(public expression: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitOutStatement(this, arg);
    }
}

export type IndexType = Identifier | IntegerLiteral;

export class AssStatement extends Statement {
    constructor(
        public identifier: Identifier,
        public expression: ExpressionResult,
        public index: IndexType[] | undefined = undefined
    ) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitAssStatement(this, arg);
    }
}

export class RetStatement extends Statement {
    constructor(public expression: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitRetStatement(this, arg);
    }
}

export class BreakStatement extends Statement {
    constructor() {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitBreakStatement(this, arg);
    }
}
