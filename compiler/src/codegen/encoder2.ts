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
import { ExpressionTypeKind } from "../checker/expression-types";
import { OperatorToken } from "../scanner/tokens";
import { Address } from "./address";
import { Instruction } from "./tam/instruction";
import { Machine } from "./tam/machine";
import { AllocationTracker } from "./allocation-tracker";

type ExpressionInformation = {
    resultSize: number;
    type: ExpressionTypeKind;
};

// NOTE: Expressions return size and type
//       Declarations return storage used.

export class CodeEncoder implements IVisitor {
    // Initialize at the CB / Code Base.
    private nextAddress: number = Machine.CB;
    public currentLevel: number = 0;
    private allocationTracker = new AllocationTracker();

    encode(program: Program, toFile?: string) {
        Machine.code = new Array(1024);
        program.accept(this, new Address());
        console.log("Final instructions:");
        console.log(Machine.code);
    }

    visitProgram(node: Program, args: any) {
        this.allocationTracker.currentLevel = 0;
        node.block.accept(this, args);
        this.emit(Machine.HALTop, 0, 0, 0);
    }

    visitBlock(node: Block, args: any) {
        node.statements.accept(this, args);
        return undefined;
    }
    visitStatements(node: Statements, args: any) {
        node.statements.forEach((statement) => statement.accept(this, args));
        return undefined;
    }

    visitExpressionResultStatement(node: ExpressionResult, args: any) {
        const pushValueToStack = false;
        return node.accept(this, pushValueToStack);
    }

    visitIffStatement(node: IffStatement, args: any) {
        const pushValueToStack = true;
        const e = node.expression.accept(this, pushValueToStack);
        if (node.elsPart) {
            // We need to generate a jump, but we don't know to where yet
            // use 0 as placeholder for now.
            const jumpF = this.nextAddress;
            this.emit(Machine.JUMPIFop, 0, Machine.CBr, 0);
            node.thnPart.accept(this, args);
            const f = this.nextAddress;
            this.backpatchJumpAddress(jumpF, f);

            const jumpD = this.nextAddress;
            // We don't know how where the else part ends, so we patch it later
            this.emit(Machine.JUMPop, 0, Machine.CBr, 0);
            node.elsPart.accept(this, args);
            const d = this.nextAddress;
            this.backpatchJumpAddress(jumpD, d);
        } else {
            const jumpD = this.nextAddress;
            this.emit(Machine.JUMPIFop, 0, Machine.CBr, 0);
            node.thnPart.accept(this, args);
            const d = this.nextAddress;
            this.backpatchJumpAddress(jumpD, d);
        }
    }

    visitForStatement(node: ForStatement, args: any) {
        const t = this.nextAddress;
        const pushValueToStack = true;
        node.expression.accept(this, pushValueToStack);

        const jumpD = this.nextAddress;
        this.emit(Machine.JUMPIFop, 0, Machine.CBr, 0);
        node.statements.accept(this, args);
        this.emit(Machine.JUMPop, 0, Machine.CBr, t);
        const d = this.nextAddress;
        this.backpatchJumpAddress(jumpD, d);
    }
    visitOutStatement(node: OutStatement, args: any) {
        const pushValueToStack = true;
        const e: ExpressionInformation = node.expression.accept(
            this,
            pushValueToStack
        );
        switch (e.type) {
            case ExpressionTypeKind.INTEGER:
            case ExpressionTypeKind.BOOLEAN:
                this.emit(
                    Machine.CALLop,
                    0,
                    Machine.PBr,
                    Machine.putintDisplacement
                );
                break;
            default:
                console.log("TODO");
                break;
        }
        this.emit(Machine.CALLop, 0, Machine.PBr, Machine.puteolDisplacement);
    }
    visitAssStatement(node: AssStatement, args: any) {
        const address: Address = node.declaration?.address!;
        const pushValueToStack = true;
        const e: ExpressionInformation = node.expression.accept(
            this,
            pushValueToStack
        );

        const register = this.displayRegister(
            this.allocationTracker.currentLevel,
            address.level
        );
        this.emit(
            Machine.STOREop,
            e.resultSize,
            register,
            address.displacement
        );
    }
    visitRetStatement(node: RetStatement, args: any) {
        const pushValueToStack = true;
        const paramsSizeInWords = args;
        const e: ExpressionInformation = node.expression.accept(
            this,
            pushValueToStack
        );
        this.emit(Machine.RETURNop, e.resultSize, 0, paramsSizeInWords);
        this.allocationTracker.endScope();
    }
    visitBreakStatement(node: BreakStatement, args: any) {
        // Syntax allow break anywhere.
        // Break at root level / global scope just halts the program.
        if (this.currentLevel === 0) {
            this.emit(Machine.HALTop, 0, 0, 0);
        }
    }

    visitGetDeclaration(node: GetDelcaration, args: any) {
        throw new Error("Method not implemented.");
    }
    visitFunctionDeclaration(node: FunctionDeclaration, args: any) {
        throw new Error("Method not implemented.");
    }
    visitVariableDeclaration(node: VariableDeclaration, args: any) {
        let size: number = 1;
        const type = node.type!;
        let e: ExpressionInformation | undefined = undefined;
        switch (type.kind) {
            case ExpressionTypeKind.BOOLEAN:
            case ExpressionTypeKind.INTEGER:
            case ExpressionTypeKind.STRING:
                e = node.expression?.accept(this, true);
                size = e!.resultSize;
                break;
            case ExpressionTypeKind.ARRAY:
                throw new Error("TODO");
        }

        const address = this.allocationTracker.allocateAddress(
            node.identifier.spelling,
            type,
            size
        );
        node.address = address;

        const register = this.displayRegister(this.currentLevel, address.level);

        this.emit(Machine.STOREop, size, register, address.displacement);
        this.emit(Machine.LOADop, size, register, address.displacement);
    }

    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any) {
        const pushValueToStack: boolean = args;
        const value = this.valuation(node.intLiteral.spelling);

        if (pushValueToStack) {
            // Size of int is 1 word (16 bits).
            this.emit(Machine.LOADLop, 0, 0, value);
        }

        return {
            resultSize: 1,
            type: ExpressionTypeKind.INTEGER,
        } as ExpressionInformation;
    }

    visitStringLiteralExpression(node: StringLiteralExpression, args: any) {
        const pushValueToStack: boolean = args;
        const stringLitteral: string = node.stringLitteral.accept(this, null);

        if (pushValueToStack) {
            // Push all chars as unicode onto stack. Reverse order so when we pop it, we can retrieve it correctly.
            for (let i = stringLitteral.length - 1; i >= 0; i--) {
                this.emit(Machine.LOADop, 1, 0, stringLitteral.charCodeAt(i));
            }
        }

        return {
            resultSize: stringLitteral.length,
            type: ExpressionTypeKind.STRING,
        } as ExpressionInformation;
    }

    visitBooleanLiteralExpression(node: BooleanLiteralExpression, args: any) {
        const pushValueToStack: boolean = args;
        const boolLitteral: boolean = node.booleanLiteral.accept(this, null);

        if (pushValueToStack) {
            this.emit(Machine.LOADAop, 1, 0, boolLitteral ? 1 : 0);
        }

        return {
            resultSize: 1,
            type: ExpressionTypeKind.BOOLEAN,
        } as ExpressionInformation;
    }

    visitUnaryExpression(node: UnaryExpression, args: any) {
        const pushValueToStack = args as boolean;

        const operatorDisplacement = node.operator.accept(this, null);

        const e: ExpressionInformation = node.operand.accept(
            this,
            pushValueToStack
        );
        if (pushValueToStack) {
            this.emit(Machine.CALLop, 0, Machine.PBr, operatorDisplacement);
        }

        return e;
    }

    visitBinaryExpression(node: BinaryExpression, args: any) {
        const pushValueToStack = args as boolean;
        const e1: ExpressionInformation = node.operand1.accept(this, args);
        const e2: ExpressionInformation = node.operand1.accept(this, args);
        console.log(node);
        console.log(e1);
        const operatorDisplacement = node.operator.accept(this, e1.type);

        if (pushValueToStack) {
            this.emit(Machine.CALLop, 0, Machine.PBr, operatorDisplacement);
        }

        // Result of expression with a boolean always result in boolean
        // e.g. tru eql tru, tru orr tru
        if (e1.type === ExpressionTypeKind.BOOLEAN) {
            return {
                resultSize: 1,
                type: ExpressionTypeKind.BOOLEAN,
            } as ExpressionInformation;
        }

        // If we are comparing, it probably is an boolean as well.
        if (operatorDisplacement === Machine.eqDisplacement) {
            return {
                resultSize: 1,
                type: ExpressionTypeKind.BOOLEAN,
            } as ExpressionInformation;
        }

        return {
            resultSize: 1,
            type: ExpressionTypeKind.INTEGER,
        } as ExpressionInformation;
    }

    visitVariableExpression(node: VariableExpression, args: any) {
        const pushValueToStack = args as boolean;
        const address = node.declaration!.address;
        const register = this.displayRegister(
            this.currentLevel,
            address!.level
        );

        if (pushValueToStack) {
            this.emit(Machine.LOADop, 1, register, address!.displacement);
        }

        const kind = node.declaration!.type!.kind;
        let size = 1;
        switch (kind) {
            case ExpressionTypeKind.BOOLEAN:
            case ExpressionTypeKind.INTEGER:
                size = 1;
                break;
            default:
                throw new Error("TODO");
        }

        return {
            resultSize: size,
            type: kind,
        } as ExpressionInformation;
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
        return node.spelling;
    }

    visitIntegerLiteral(node: IntegerLiteral, args: any) {
        return Number(node.spelling);
    }
    visitBooleanLiteral(node: BooleanLiteral, args: any) {
        return node.spelling;
    }
    visitStringLiteral(node: StringLiteral, args: any) {
        return node.spelling;
    }

    visitOperator(node: Operator, args: any) {
        const type = args as ExpressionTypeKind;

        switch (node.spelling as OperatorToken) {
            case "add":
                return Machine.addDisplacement;
            case "sub":
                return Machine.subDisplacement;
            case "and":
                return Machine.andDisplacement;
            case "div":
                return Machine.divDisplacement;
            case "eql":
                return Machine.eqDisplacement;
            case "grt":
                return Machine.gtDisplacement;
            case "lst":
                return Machine.ltDisplacement;
            case "mod":
                return Machine.modDisplacement;
            case "mul":
                return Machine.multDisplacement;
            case "not":
                return type === ExpressionTypeKind.BOOLEAN
                    ? Machine.notDisplacement
                    : Machine.negDisplacement;
            case "orr":
                return Machine.orDisplacement;
        }
    }
    visitType(node: Type, args: any) {
        return node.spelling;
    }

    private emit(op: number, n: number, r: number, d: number) {
        if (n > 255) {
            console.log(`Operand too long`);
        }

        if (!n && op === 4) {
            console.log(new Error().stack);
        }

        const instruction = new Instruction();
        instruction.op = op;
        instruction.n = n;
        instruction.r = r;
        instruction.d = d;

        if (this.nextAddress >= Machine.PB) {
            console.log("Program is too large");
        } else {
            Machine.code[this.nextAddress] = instruction;
            this.nextAddress++;
        }
    }

    private backpatchJumpAddress(address: number, d: number) {
        Machine.code[address].d = d;
    }

    private displayRegister(currentLevel: number, entityLevel: number) {
        if (entityLevel === 0) {
            // Global scope, SBr -> current stack position.
            return Machine.SBr;
        } else if (currentLevel - entityLevel <= 6) {
            // Local Scope, LBr -> Current stack frame / currnet local position.
            return Machine.LBr + currentLevel - entityLevel;
        } else {
            console.log("Accessing across to many levels");
            return Machine.L6r;
        }
    }

    private valuation(intLit: string): number {
        return Number(intLit);
    }

    public async saveTargetProgram(fileName: string): Promise<void> {
        try {
            console.log(`Saving program to ${path.resolve(fileName)}`);
            const writeStream = fs.createWriteStream(path.resolve(fileName));

            for (let i = Machine.CB; i < this.nextAddress; i++) {
                await Machine.code[i].write(writeStream);
            }

            writeStream.close();
        } catch (err) {
            console.log(`Failed to write program to ${path.resolve(fileName)}`);
        }
    }
}
