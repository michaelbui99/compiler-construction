export class Instruction {
    op: number; // Opcode;
    r: number; // RegisterNumber;
    n: number; // Length;
    d: number; // Operand;

    constructor() {
        this.op = 0;
        this.r = 0;
        this.n = 0;
        this.d = 0;
    }
}
