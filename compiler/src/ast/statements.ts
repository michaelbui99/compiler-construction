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
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
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
        throw new Error("Method not implemented.");
    }
}

export class OutStatement extends Statement {
    constructor(public expression: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export type IndexType = Identifier|IntegerLiteral;

export class AssStatement extends Statement {
    constructor(
        public identifier: Identifier,
        public expression: ExpressionResult,
        public index: IndexType[]|undefined = undefined
    ) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class RetStatement extends Statement {
    constructor(public expression: ExpressionResult) {
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class BreakStatement extends Statement{
    constructor(){
        super();
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
    
}
