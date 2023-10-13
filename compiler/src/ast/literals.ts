import { AST } from "./ast";
import { Terminal } from "./terminal";
import { IVisitor } from "./visitor";

export class StringLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class IntegerLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }
}

export class BooleanLiteral extends Terminal {
    constructor(public spelling: string) {
        super(spelling);
    }
}
