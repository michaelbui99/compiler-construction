import fs from "fs";
import path from "path";
import { Block } from "../ast/block";
import {
    GetDelcaration,
    FunctionDeclaration,
    VariableDeclaration,
} from "../ast/declarations";
import {
    ExpressionResult,
    IntLiteralExpression,
    StringLiteralExpression,
    BooleanLiteralExpression,
    UnaryExpression,
    BinaryExpression,
    VariableExpression,
    CallExpression,
    ExpressionList,
    ArrayExperession,
} from "../ast/expression";
import { Identifier } from "../ast/identifier";
import { IntegerLiteral, BooleanLiteral, StringLiteral } from "../ast/literals";
import { Operator } from "../ast/operator";
import { Program } from "../ast/program";
import {
    Statements,
    IffStatement,
    ForStatement,
    OutStatement,
    AssStatement,
    RetStatement,
    BreakStatement,
} from "../ast/statements";
import { Type } from "../ast/types";
import { IVisitor } from "../ast/visitor";
import { Address } from "./address";
import { Instruction } from "./tam/Instruction";
import { Machine } from "./tam/Machine";

export class Encoder implements IVisitor {
    private nextAddress: number = Machine.CB;
    private currentLevel: number = 0;

    ecnode(program: Program) {
        program.accept(this, null);
    }

    visitProgram(node: Program, args: any) {
        this.currentLevel = 0;
        node.block.accept(this, Address.newDefault());
        this.emit(Machine.HALTop, 0, 0, 0);
        return null;
    }

    visitBlock(node: Block, args: any) {
        throw new Error("Method not implemented.");
    }
    visitStatements(node: Statements, args: any) {
        node.statements.forEach((statement) => statement.accept(this, null));
        return null;
    }
    visitExpressionResultStatement(node: ExpressionResult, args: any) {
        throw new Error("Method not implemented.");
    }
    visitIffStatement(node: IffStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitForStatement(node: ForStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitOutStatement(node: OutStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitAssStatement(node: AssStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitRetStatement(node: RetStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitBreakStatement(node: BreakStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitGetDeclaration(node: GetDelcaration, args: any) {
        throw new Error("Method not implemented.");
    }
    visitFunctionDeclaration(node: FunctionDeclaration, args: any) {
        throw new Error("Method not implemented.");
    }
    visitVariableDeclaration(node: VariableDeclaration, args: any) {
        throw new Error("Method not implemented.");
    }
    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitStringLiteralExpression(node: StringLiteralExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitBooleanLiteralExpression(node: BooleanLiteralExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitUnaryExpression(node: UnaryExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitBinaryExpression(node: BinaryExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitVariableExpression(node: VariableExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitCallExpression(node: CallExpression, args: any) {
        throw new Error("Method not implemented.");
    }
    visitExpressionList(node: ExpressionList, args: any) {
        throw new Error("Method not implemented.");
    }
    visitArrayExpression(node: ArrayExperession, args: any) {
        throw new Error("Method not implemented.");
    }
    visitIdentifier(node: Identifier, args: any) {
        throw new Error("Method not implemented.");
    }
    visitIntegerLiteral(node: IntegerLiteral, args: any) {
        throw new Error("Method not implemented.");
    }
    visitBooleanLiteral(node: BooleanLiteral, args: any) {
        throw new Error("Method not implemented.");
    }
    visitStringLiteral(node: StringLiteral, args: any) {
        throw new Error("Method not implemented.");
    }
    visitOperator(node: Operator, args: any) {
        throw new Error("Method not implemented.");
    }
    visitType(node: Type, args: any) {
        throw new Error("Method not implemented.");
    }

    private emit(op: number, n: number, r: number, d: number) {
        if (n > 255) {
            console.log(`Operand too long`);
        }

        const instruction = new Instruction();
        instruction.op = op;
        instruction.n = n;
        instruction.r = r;
        instruction.d = d;

        if (this.nextAddress >= Machine.PB) {
            console.log("Program is too large");
        } else {
            Machine.code[this.nextAddress++] = instruction;
        }
    }

    private patch(address: number, d: number) {
        Machine.code[address].d = d;
    }

    private displayRegister(currentLevel: number, entityLevel: number) {
        if (entityLevel === 0) {
            return Machine.SBr;
        } else if (currentLevel - entityLevel <= 6) {
            return Machine.LBr + currentLevel - entityLevel;
        } else {
            console.log("Accessing across to many levels");
            return Machine.L6r;
        }
    }

    private saveTargetProgram(fileName: string) {
        try {
            const writeStream = fs.createWriteStream(path.resolve(fileName));

            for (let i = Machine.CB; i < this.nextAddress; i++) {
                Machine.code[i].write(writeStream);
            }

            writeStream.close();
        } catch (err) {
            console.log(`Failed to write program to ${path.resolve(fileName)}`);
        }
    }
}
