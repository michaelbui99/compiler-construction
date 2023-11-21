import { Address } from "../codegen/address";
import { AST } from "./ast";
import { ExpressionList, ExpressionResult } from "./expression";
import { Identifier } from "./identifier";
import { IndexType, Statement, Statements } from "./statements";
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
        public expressionList?: ExpressionList,
        public indexList?: IndexType[],
        public address?: Address
    ) {
        super(identifier);
    }

    accept(visitor: IVisitor, arg: any): void {
        visitor.visitVariableDeclaration(this, arg);
    }
}

// NOTE: No longer a declaration, must read to an existing variable.
export class GetDelcaration extends Declaration {
    constructor(public identifier: Identifier) {
        super(identifier);
    }
    accept(visitor: IVisitor, arg: any): void {
        visitor.visitGetDeclaration(this, arg);
    }
}

export class FunctionDeclaration extends Declaration {
    constructor(
        public identifier: Identifier,
        public params: Identifier[],
        public paramTypes: Type[],
        public statments: Statements,
        public address?: Address
    ) {
        super(identifier);
    }

    accept(visitor: IVisitor, arg: any): void {
        return visitor.visitFunctionDeclaration(this, arg);
    }
}
