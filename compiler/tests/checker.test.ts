import { describe, expect, test } from "@jest/globals";
import { Scanner } from "../src/scanner/scanner";
import { Parser } from "../src/ast/parser";
import { Checker } from "../src/checker/checker";
import { CompilerError } from "../src/checker/exceptions";

describe("Checker tests", () => {
    test("Array of mixed types should throw exception", () => {
        const source = "let myArr arr 2 3 tru%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => {
            checker.visitProgram(ast, undefined);
        }).toThrowError();
    });

    test("Array of same types should not throw exception", () => {
        const source = "let myArr arr 2 3 4%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        checker.visitProgram(ast, undefined);
    });

    test("A name must be defined before use - failing", () =>{
        const source = "out a%";
        expect(checkerHelper(source)).toThrow(new CompilerError("No variable of name a has been declared"));
    })

    test("A name must be defined before use - correct", () =>{
        const source = "let a 5 % out a%";
        checkerHelper(source)();
    })

    test("declare variable twice in a scope", () => {
        const source = "let a 5 % let a 8 %";
        expect(checkerHelper(source)).toThrow(new CompilerError("Id a has already been declared in current scope level of 1"));
    });

    test("declare variable twice in a different scope", () => {
        const source = "let a 5 % iff tru thn let a 8 % end";
        checkerHelper(source);
    });

    test("access variable in an outer scope is illegal", () => {
        const source = "iff tru thn let a 8 % end ass a 9 %";
        expect(checkerHelper(source)).toThrow(new CompilerError("can not assign value to a."));
    });

    test("assign value has to be same type", () => {
        const source = "let a 25 % ass a \"Hi\" %";
        expect(checkerHelper(source)).toThrow(new CompilerError("type 3 can not be assigned to 0"));
    });

    test("binary operations are possible on binary variables", () =>{
        const source = "out tru and tru %"
        checkerHelper(source)();
    });

    test("binary operations are not possible on non binary variables", ()=>{
        const source = "out tru and 5 %"
        expect(checkerHelper(source)).toThrow(new CompilerError("operatior and can not be applies to tru and 5"));
    });

    test("function can not be used as variable", () => {
        const source = "fun void thn get a end";
        checkerHelper(source); 
        // TODO: this is throwing an error, prior to checking
    });

    test("integers are not indexable", () =>{
        const source = "let a 5 % ass a # 1 8 %";
        expect(checkerHelper(source)).toThrow(new CompilerError("just arrays can be indexable, not variable a"));
    });

    test("arrays are indexable", () =>{
        const source = "let a arr 5 11 % ass a # 1 8 %";
        checkerHelper(source);
    });
});

function checkerHelper(source: string): ()=>void {
    const scanner = new Scanner(source);
    const parser = new Parser(scanner);
    const ast = parser.parseProgram();
    const checker = new Checker();

    return () => {checker.visitProgram(ast, undefined)};
}