import { Instruction } from "./instruction";

export class Machine {
    public static readonly maxRoutineLevel = 7;

    // Instructions

    //  --- Opcodes
    public static readonly LOADop = 0;
    public static readonly LOADAop = 1;
    public static readonly LOADIop = 2;
    public static readonly LOADLop = 3;
    public static readonly STOREop = 4;
    public static readonly STOREIop = 5;
    public static readonly CALLop = 6;
    public static readonly CALLIop = 7;
    public static readonly RETURNop = 8;
    public static readonly PUSHop = 10;
    public static readonly POPop = 11;
    public static readonly JUMPop = 12;
    public static readonly JUMPIop = 13;
    public static readonly JUMPIFop = 14;
    public static readonly HALTop = 15;

    // CODE STORE

    public static code: Instruction[] = new Array(1024);

    // CODE STORE REGISTERS
    public static readonly CB = 0;
    public static readonly PB = 1024; // = upper bound of code array + 1
    public static readonly PT = 1052; // = PB + 28

    // REGISTER NUMBERS

    public static readonly CBr = 0;
    public static readonly CTr = 1;
    public static readonly PBr = 2;
    public static readonly PTr = 3;
    public static readonly SBr = 4;
    public static readonly STr = 5;
    public static readonly HBr = 6;
    public static readonly HTr = 7;
    public static readonly LBr = 8;
    public static readonly L1r = Machine.LBr + 1;
    public static readonly L2r = Machine.LBr + 2;

    public static readonly L3r = Machine.LBr + 3;
    public static readonly L4r = Machine.LBr + 4;
    public static readonly L5r = Machine.LBr + 5;
    public static readonly L6r = Machine.LBr + 6;
    public static readonly CPr = 15;

    // DATA REPRESENTATION

    public static readonly booleanSize = 1;
    public static readonly characterSize = 1;
    public static readonly integerSize = 1;
    public static readonly addressSize = 1;
    public static readonly closureSize = 2 * Machine.addressSize;

    public static readonly linkDataSize = 3 * Machine.addressSize;

    public static readonly falseRep = 0;
    public static readonly trueRep = 1;
    public static readonly maxintRep = 32767;

    public static readonly idDisplacement = 1;
    public static readonly notDisplacement = 2;
    public static readonly andDisplacement = 3;
    public static readonly orDisplacement = 4;
    public static readonly succDisplacement = 5;
    public static readonly predDisplacement = 6;
    public static readonly negDisplacement = 7;
    public static readonly addDisplacement = 8;
    public static readonly subDisplacement = 9;
    public static readonly multDisplacement = 10;
    public static readonly divDisplacement = 11;
    public static readonly modDisplacement = 12;
    public static readonly ltDisplacement = 13;
    public static readonly leDisplacement = 14;
    public static readonly geDisplacement = 15;
    public static readonly gtDisplacement = 16;
    public static readonly eqDisplacement = 17;
    public static readonly neDisplacement = 18;
    public static readonly eolDisplacement = 19;
    public static readonly eofDisplacement = 20;
    public static readonly getDisplacement = 21;
    public static readonly putDisplacement = 22;
    public static readonly geteolDisplacement = 23;
    public static readonly puteolDisplacement = 24;
    public static readonly getintDisplacement = 25;
    public static readonly putintDisplacement = 26;
    public static readonly newDisplacement = 27;
    public static readonly disposeDisplacement = 28;
}
