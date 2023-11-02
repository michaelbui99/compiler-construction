import { AST } from "./ast";
import { ExpressionList, ExpressionResult } from "./expression";
import { Identifier } from "./identifier";
import { Statement, Statements } from "./statements";
import { Type } from "./types";
import { IVisitor } from "./visitor";

export abstract class Declaration extends Statement {
    constructor(public identifier: Identifier) {
        super();
    }
}

export class VariableDeclaration extends Declaration {
    constructor(
        public identifier: Identifier,
        public expression?: ExpressionResult,
        public expressionList?: ExpressionList
    ) {
        super(identifier);
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class GetDelcaration extends Declaration {
    constructor(public identifier: Identifier) {
        super(identifier);
    }
    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}

export class FunctionDeclaration extends Declaration {
    constructor(
        public identifier: Identifier,
        public params: Identifier[],
        public paramTypes: Type[],
        public statments: Statements
    ) {
        super(identifier);
    }

    accept(visitor: IVisitor, arg: any): void {
        throw new Error("Method not implemented.");
    }
}
