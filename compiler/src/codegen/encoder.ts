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
import {
    ExpressionType,
    ExpressionTypeKind,
} from "../checker/expression-types";
import { AllocationTracker } from "./allocation-tracker";
import { CompilerError } from "../checker/exceptions";

const DEFAULT_INT_VALUE = 0;
const DEFAULT_BOOL_VALUE = false;
export class Encoder implements IVisitor {
    // Initialize at the CB / Code Base.
    private nextAddress: number = Machine.CB;
    public currentLevel: number = 0;
    private allocationTracker = new AllocationTracker();

    encode(program: Program, toFile?: string) {
        Machine.code = new Array(1024);
        program.accept(this, null);
        console.log("Final instructions:");
        console.log(Machine.code);
    }

    visitProgram(node: Program, args: any) {
        this.allocationTracker.currentLevel = 0;
        node.block.accept(this, Address.newDefault());
        this.emit(Machine.HALTop, 0, 0, 0);
        return null;
    }

    visitBlock(node: Block, args: any) {
        // NOTE: Fixes a bug where identifiers were not stored correctly, but unsure why...
        this.emit(Machine.PUSHop, 0, 0, 3);
        node.statements.accept(this, args);
        return null;
    }
    visitStatements(node: Statements, args: any) {
        node.statements.forEach((statement) => statement.accept(this, args));
        return null;
    }
    visitExpressionResultStatement(node: ExpressionResult, args: any) {
        const pushValueToStack = false;
        node.accept(this, pushValueToStack);
        return undefined;
    }
    visitIffStatement(node: IffStatement, args: any) {
        this.allocationTracker.beginNewScope();
        const pushValueToStack = true;
        // We need result of expression on the stack.
        node.expression.accept(this, pushValueToStack);

        // We don't know where to jump yet since we don't know the amount of instructions, so just put placeholder and store where we currently are.
        let thenJumpAddress = this.nextAddress;
        // Machine[jump1adr] is now equal to this jump instruction
        this.emit(Machine.JUMPIFop, 0, Machine.CBr, 0);
        // Can modify address, so we need to backpatch later.
        node.thnPart.accept(this, null);
        let elseJumpAddress = this.nextAddress;
        // 0 is just placeholder for now, so actually don't jump.
        // Later Later we backpatch how much to actually jump.
        this.emit(Machine.JUMPop, 0, Machine.CBr, 0);

        if (node.elsPart) {
            node.elsPart.accept(this, null);
        }

        this.backpatchJumpAddress(thenJumpAddress, this.nextAddress);

        if (node.elsPart) {
            this.backpatchJumpAddress(elseJumpAddress, this.nextAddress);
        }

        this.allocationTracker.endScope();
    }
    visitForStatement(node: ForStatement, args: any) {
        const startAddress = this.nextAddress;
        const pushValueToStack = true;
        node.expression.accept(this, pushValueToStack);

        const jumpAddress = this.nextAddress;
        this.emit(Machine.JUMPIFop, 0, Machine.CBr, 0);

        node.statements.accept(this, null);
        this.emit(Machine.JUMPop, 0, Machine.CBr, startAddress);

        this.backpatchJumpAddress(jumpAddress, this.nextAddress);
        return undefined;
    }

    visitOutStatement(node: OutStatement, args: any) {
        const pushValueToStack = true;
        const exprs = node.expression.accept(this, pushValueToStack);
        const type = node.expressionType?.kind;
        console.log("Performing out");
        switch (type) {
            case ExpressionTypeKind.INTEGER:
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
        const allocation = this.allocationTracker.getLatest(
            node.identifier.spelling
        );

        if (!allocation) {
            throw new Error(
                `Allocation for node ${node.identifier} has not been tracked correctly`
            );
        }

        const pushValueToStack = true;
        const returnSize = node.expression.accept(this, pushValueToStack);

        const register = this.displayRegister(
            this.allocationTracker.currentLevel,
            allocation.displacement
        );
        this.emit(
            Machine.STOREop,
            returnSize,
            register,
            allocation.displacement
        );

        return undefined;
    }

    visitRetStatement(node: RetStatement, args: any) {
        const pushValueToStack = true;
        const paramsSize = args;
        node.expression.accept(this, pushValueToStack);
        this.emit(Machine.RETURNop, 1, 0, paramsSize);
        this.allocationTracker.endScope();
    }

    visitBreakStatement(node: BreakStatement, args: any) {
        // throw new Error("Method not implemented.");
        // Syntax allow break anywhere.
        // Break at root level / global scope just halts the program.
        if (this.allocationTracker.currentLevel === 0) {
            this.emit(Machine.HALTop, 0, 0, 0);
        }
    }

    visitGetDeclaration(node: GetDelcaration, args: any) {
        // throw new Error("Method not implemented.");
    }

    visitFunctionDeclaration(node: FunctionDeclaration, args: any) {
        node.address = new Address(
            this.allocationTracker.currentLevel,
            this.nextAddress
        );

        // Begin new scope and push params onto the stack
        this.allocationTracker.beginNewScope();
        let paramSize = 0;
        node.params.forEach((param, idx) => {
            const type = node.paramTypes[idx].spelling;
            switch (type) {
                case "int":
                    const expressionType = {
                        depth: 0,
                        kind: ExpressionTypeKind.INTEGER,
                        spelling: "int",
                    };
                    const varDeclaration = new VariableDeclaration(
                        param,
                        new IntLiteralExpression(
                            new IntegerLiteral(DEFAULT_INT_VALUE + "")
                        ),
                        undefined,
                        undefined,
                        undefined,
                        expressionType
                    );
                    varDeclaration.accept(this, null);
                    paramSize += 1;
                    break;
            }
        });

        // Skipping over link data
        this.allocationTracker.incrementDisplacement(
            this.allocationTracker.currentLevel,
            Machine.linkDataSize
        );
        // Special case for return statements, since function may not always return something.
        let hasReturn = false;
        node.statments.statements.forEach((statement) => {
            if (statement instanceof RetStatement) {
                statement.accept(this, paramSize);
                hasReturn = true;
            } else {
                statement.accept(this, null);
            }
        });

        if (!hasReturn) {
            // Ensuring we actually return in case there is no return statement.
            this.emit(Machine.RETURNop, 0, 0, paramSize);
            this.allocationTracker.endScope();
        }
    }

    visitVariableDeclaration(node: VariableDeclaration, args: any) {
        let size: number = 1;
        const type = node.type!;
        switch (type.kind) {
            case ExpressionTypeKind.BOOLEAN:
            case ExpressionTypeKind.INTEGER:
                size = 1;
                // Pushes value onto stack
                node.expression?.accept(this, true);
                break;
            case ExpressionTypeKind.STRING:
                size = node.expression?.accept(this, true);
                break;
        }

        const nextDisplacement = this.allocationTracker.allocate(
            node.identifier.spelling,
            node.type,
            size
        );

        node.address = new Address(
            this.allocationTracker.currentLevel,
            nextDisplacement
        );

        if (this.allocationTracker.currentLevel == 0) {
            // Global variable. Address i relative displacement to stack base register.
            console.log(
                `Storing IDENTIFIER ${node.identifier.spelling} at REGISTER ${Machine.SBr} with DISPLACEMENT of ${nextDisplacement}`
            );
            this.emit(Machine.STOREop, size, Machine.SBr, nextDisplacement);
        } else {
            // Local variable in scope. Address is relative displacement to the local base register
            console.log(
                `Storing IDENTIFIER ${node.identifier.spelling} at REGISTER ${Machine.LBr} with DISPLACEMENT of ${nextDisplacement}`
            );
            this.emit(Machine.STOREop, size, Machine.LBr, nextDisplacement);
        }
    }

    visitIntegerLiteralExpression(node: IntLiteralExpression, args: any) {
        const pushValueToStack: boolean = args;
        const integerLitteral = node.intLiteral.accept(this, args);

        if (pushValueToStack) {
            // Size of int is 1 word (16 bits).
            this.emit(Machine.LOADLop, 0, 0, integerLitteral);
        }

        return 1;
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

        return stringLitteral.length;
    }
    visitBooleanLiteralExpression(node: BooleanLiteralExpression, args: any) {
        const pushValueToStack: boolean = args;
        const boolLitteral: boolean = node.booleanLiteral.accept(this, null);

        if (pushValueToStack) {
            this.emit(Machine.LOADAop, 1, 0, boolLitteral ? 1 : 0);
        }

        return 1;
    }

    visitUnaryExpression(node: UnaryExpression, args: any) {
        const pushValueToStack = args;

        const operator = node.operator.accept(this, null);

        node.operand.accept(this, pushValueToStack);
        if (pushValueToStack) {
            switch (operator) {
                case "not":
                    const typeKind = node.operand.type?.kind!;
                    if (typeKind === ExpressionTypeKind.BOOLEAN) {
                        this.emit(
                            Machine.CALLop,
                            0,
                            Machine.PBr,
                            Machine.notDisplacement
                        );
                        break;
                    } else if (typeKind === ExpressionTypeKind.INTEGER) {
                        this.emit(
                            Machine.CALLop,
                            0,
                            Machine.PBr,
                            Machine.negDisplacement
                        );
                    }
                // Should never reach here if checker did its job.
                default:
                    throw new Error("Unreachable has been reached");
            }
        }
    }

    visitBinaryExpression(node: BinaryExpression, args: any) {
        const pushValueToStack: boolean = args;
        const operator: string = node.operator.accept(this, null);

        node.operand1.accept(this, pushValueToStack);
        node.operand2.accept(this, pushValueToStack);

        if (pushValueToStack) {
            switch (operator) {
                case "add":
                    console.log(`Performing add`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.addDisplacement
                    );
                    break;
                case "sub":
                    console.log(`Performing sub`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.subDisplacement
                    );
                    break;
                case "mul":
                    console.log(`Performing mul`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.multDisplacement
                    );
                    break;
                case "div":
                    console.log(`Performing div`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.divDisplacement
                    );
                    break;
                case "mod":
                    console.log(`Performing mod`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.modDisplacement
                    );
                    break;
                case "and":
                    console.log(`Performing and`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.andDisplacement
                    );
                    break;
                case "or":
                    console.log(`Performing or`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.orDisplacement
                    );
                    break;
                case "grt":
                    console.log(`Performaing grt`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.gtDisplacement
                    );
                    break;
                case "lst":
                    console.log(`Performaing lst`);
                    this.emit(
                        Machine.CALLop,
                        0,
                        Machine.PBr,
                        Machine.ltDisplacement
                    );
                    break;
            }
        }

        return undefined;
    }
    visitVariableExpression(node: VariableExpression, args: any) {
        const pushValueToStack = args;

        const address = node.declaration?.address!;
        const allocation = this.allocationTracker.getLatest(
            node.identifier.spelling
        );

        if (!allocation) {
            throw new CompilerError(
                `Allocation for node with id ${node.identifier.spelling} has not been tracked correctly.`
            );
        }

        const register = this.displayRegister(
            this.allocationTracker.currentLevel,
            allocation!.displacement!
        );

        const type = node.declaration?.type!;

        if (pushValueToStack) {
            switch (type.kind) {
                case ExpressionTypeKind.STRING:
                    // TODO: Handle special case
                    break;
                case ExpressionTypeKind.INTEGER:
                    console.log(
                        `Pushing IDENTIFIER ${
                            node.identifier.spelling
                        } located at REGISTER ${register} with DISPLACEMENT of ${
                            allocation!.displacement
                        } to the stack`
                    );
                    this.emit(
                        Machine.LOADop,
                        1,
                        register,
                        allocation.displacement
                    );
                    break;
                default:
                    this.emit(
                        Machine.LOADop,
                        1,
                        register,
                        allocation.displacement
                    );
                    break;
            }
        }
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
        return undefined;
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
        return node.spelling;
    }
    visitType(node: Type, args: any) {
        return node.spelling;
    }

    private emit(op: number, n: number, r: number, d: number) {
        if (n > 255) {
            console.log(`Operand too long`);
        }

        if (!n && op === 4) {
            console.log("HERE NO N");
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
