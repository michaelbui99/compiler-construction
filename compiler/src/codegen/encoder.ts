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
import { Instruction } from "./tam/instruction";
import { Machine } from "./tam/machine";

export class Encoder implements IVisitor {
    private nextAddress: number = Machine.CB;
    private currentLevel: number = 0;

    ecnode(program: Program, toFile: string) {
        Machine.code = new Array(1024);
        program.accept(this, null);

        console.log(toFile);
        console.log(Machine.code);
        // did not found out how to print it into file
        //writeFile(toFile, JSON.stringify(Machine.code) + 'hallo', 'utf-8', (err)=>{});
    }

    visitProgram(node: Program, args: any) {
        this.currentLevel = 0;
        node.block.accept(this, Address.newDefault());
        this.emit(Machine.HALTop, 0, 0, 0);
        return null;
    }

    visitBlock(node: Block, args: any) {
        node.statements.accept(this, args);
        return null;
    }
    visitStatements(node: Statements, args: any) {
        node.statements.forEach((statement) => statement.accept(this, args));
        return null;
    }
    visitExpressionResultStatement(node: ExpressionResult, args: any) {
        // why is it not going here ever??
        throw new Error("Method not implemented.");
    }
    visitIffStatement(node: IffStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitForStatement(node: ForStatement, args: any) {
        throw new Error("Method not implemented.");
    }
    visitOutStatement(node: OutStatement, args: any) {
        const exprs = node.expression.accept(this,args);
        this.emit(Machine.CALLop,0,Machine.PBr,Machine.putintDisplacement);
        this.emit(Machine.CALLop,0,Machine.PBr,Machine.puteolDisplacement);
        //throw new Error("Method not implemented.");
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
        if (node.expression){
            node.address = Address.fromAdressAndIncrement(args as Address,1);
            node.expression?.accept(this,args);
            this.emit(Machine.STOREop,
                1,
                this.displayRegister((args as Address).level,node.address.level),
                node.address.displacement);
        } else {
            throw new Error("Method not implemented.");
        }
    }
    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any) {
        this.emit(Machine.LOADLop, 0, 0, node.intLiteral.accept(this,args));
        return null;
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
        const varAddress = node.varDec?.address;
        if (varAddress == undefined){
            return null; // this should be already checked by checker
        }
        this.emit(Machine.LOADop,
            1,
            this.displayRegister((args as Address).level,varAddress?.level),
            varAddress?.displacement);
        // not sure if we don't want expression to return something like type
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
        return parseInt(node.spelling);
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
