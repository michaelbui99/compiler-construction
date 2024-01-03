import fs from "fs";

export class Instruction {
    op: number; // Opcode;
    r: number; // RegisterNumber;
    n: number; // Length / size;
    d: number; // Operand / displacements;

    constructor() {
        this.op = 0;
        this.r = 0;
        this.n = 0;
        this.d = 0;
    }

    write(output: fs.WriteStream): Promise<void> {
        return new Promise((resolve, reject) => {
            const buffer = Buffer.alloc(16);
            buffer.writeInt32BE(this.op, 0);
            buffer.writeInt32BE(this.r, 4);
            buffer.writeInt32BE(this.n, 8);
            buffer.writeInt32BE(this.d, 12);
            output.write(buffer, (err) => {
                if (err) {
                    console.log(
                        `Error occured while writing binary output: ${err.message}`
                    );
                    console.log(`${err.stack}`);
                    reject(err.message);
                } else {
                    resolve();
                }
            });
        });
    }
}
