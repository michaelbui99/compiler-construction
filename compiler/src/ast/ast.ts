import { RuntimeEntity } from "../codegen/runtime-entity";
import { IVisitor } from "./visitor";

export abstract class AST {
    entity?: RuntimeEntity;
    constructor() {
        this.entity = undefined;
    }

    abstract accept(visitor: IVisitor, arg: any): any;
}
