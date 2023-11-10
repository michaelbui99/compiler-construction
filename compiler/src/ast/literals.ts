import { AST } from "./ast";
import { Terminal } from "./terminal";
import { IVisitor } from "./visitor";

export class StringLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitStringLiteral(this, arg);
    }
}

export class IntegerLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any) {
        return visitor.visitIntegerLiteral(this, arg);
    }
}

export class BooleanLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any) {
        return visitor.visitBooleanLiteral(this, arg);
    }
}
