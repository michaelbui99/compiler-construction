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

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("Function with incorrect amount of arguments should throw exception", () => {
        const source =
            "fun myFunc a int b bol thn ret a% end let result myFunc 2%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Function with correct amount of arguments should not throw exception", () => {
        const source =
            "fun myFunc a int b bol thn ret a% end let result run myFunc 2 tru end%";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });

    test("Function cannot be used as argument to another function", () => {
        const source = `
            fun myFunc a int thn out a% end
            fun identity a int thn ret a% end

            let a run myFunc identity end%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });

    test("Name must be defined before use", () => {
        // Expressions as bare statement oes not need % at end
        const source = `
            myFunc 1 
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Name must be defined before use 2", () => {
        const source = `
            let a 1%
            out a%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });

    test("Name must only be defined once each scope level", () => {
        const source = `
            let a 1%
            let a 2%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Name must only be defined once each scope level - 2", () => {
        const source = `
            let a 1%
            fun myFunc a int thn ret a% end
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("Only a name declared as array is indexeable ", () => {
        const source = `
            let a 1%
            let b run a #2 end%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("Only a name declared as array is indexeable 2", () => {
        const source = `
            let a arr 1%
            let b run a #0 end%
        `;
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("The only unary operator is 'not' and can only be used on booleans and integers", () => {
        const source = `
            let a not 1 %
            let b not tru %
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });
    test("A name declared as variable can only be reassigned to a new value of the same type that it was declared as", () => {
        const source = `
            let a 1%
            ass a tru%
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).toThrowError();
    });
    test("A name declared as variable can only be reassigned to a new value of the same type that it was declared as - 2", () => {
        const source = `
            let a 1%
            ass a 2%
        `.trim();
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        expect(() => checker.visitProgram(ast, undefined)).not.toThrowError();
    });

    test("A name must be defined before use - failing", () => {
        const source = "out a%";
        expect(checkerHelper(source)).toThrow(
            new CompilerError("No variable of name a has been declared")
        );
    });

    test("A name must be defined before use - correct", () => {
        const source = "let a 5 % out a%";
        checkerHelper(source)();
    });

    test("declare variable twice in a scope", () => {
        const source = "let a 5 % let a 8 %";
        expect(checkerHelper(source)).toThrow(
            new CompilerError(
                "Id a has already been declared in current scope level of 1"
            )
        );
    });

    test("declare variable twice in a different scope", () => {
        const source = "let a 5 % iff tru thn let a 8 % end";
        checkerHelper(source);
    });

    test("access variable in an outer scope is illegal", () => {
        const source = "iff tru thn let a 8 % end ass a 9 %";
        expect(checkerHelper(source)).toThrow(
            new CompilerError("Cannot reassign a as it has never been declared")
        );
    });

    test("assign value has to be same type", () => {
        const source = 'let a 25 % ass a "Hi" %';
        expect(checkerHelper(source)).toThrow(
            new CompilerError(
                "Assignment of type STRING not possible to type INTEGER"
            )
        );
    });

    test("binary operations are possible on binary variables", () => {
        const source = "out tru and tru %";
        checkerHelper(source)();
    });

    test("binary operations are not possible on non binary variables", () => {
        const source = "out tru and 5 %";
        expect(checkerHelper(source)).toThrow(
            new CompilerError("operatior and can not be applies to tru and 5")
        );
    });

    test("function can not be used as variable", () => {
        const source = "fun void thn get a % end";
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const ast = parser.parseProgram();
        const checker = new Checker();

        checker.visitProgram(ast, undefined);
        //checkerHelper(source);
        // TODO: this is throwing an error, prior to checking
    });

    test("integers are not indexable", () => {
        const source = "let a 5 % ass a # 1 8 %";
        expect(checkerHelper(source)).toThrow(
            new CompilerError(
                "Depth of variable does not correspont to indexes"
            )
        );
    });

    test("arrays are indexable", () => {
        const source = "let a arr 5 11 % ass a # 1 8 %";
        checkerHelper(source);
    });

    test("no operators possible for strings", () => {
        const source = 'let myStr "hallo" and " world"%';
        expect(checkerHelper(source)).toThrow(
            new CompilerError(
                "operatior and can not be applies to hallo and  world"
            )
        );
    });

    test("equals not possible on strings", () => {
        const source = 'iff "hi" eql "Hi" thn end';
        expect(checkerHelper(source)).toThrow(
            new CompilerError("operatior eql can not be applies to hi and Hi")
        );
    });

    test("equals possible on  booleans", () => {
        const source = "iff tru eql tru thn end";
        checkerHelper(source);
    });

    test("equals possible on integers", () => {
        const source = "iff 8 eql 8 thn end";
        checkerHelper(source);
    });

    test("equals possible on integers", () => {
        const source = "let a 8 % iff 8 eql a thn end";
        checkerHelper(source);
    });

    test("equals possible on integers", () => {
        const source = "let a 8 % iff a eql a thn end";
        checkerHelper(source);
    });

    test("all arrays are just integers", () => {
        const source = 'let a arr "hi" tru tru %';
        expect(checkerHelper(source)).toThrow(
            new CompilerError(
                "Arrays can have elements of type array or integer only."
            )
        );
    });

    test("len can be used on anything except of strings", () => {
        const source =
            "let a 8 % let b run len a end % let myArr arr 1 2 3 4 % ass b len myArr% ass b run len tru end %";
        checkerHelper(source);
    });

    test("len can be used on anything except of strings", () => {
        const source = "let a run len 8 end %";
        checkerHelper(source);
    });

    test("test simple thing", () => {
        const source = "tru and tru";
        checkerHelper(source);
    });

    test("test simple thing", () => {
        const source = "tru and tru orr tru";
        checkerHelper(source);
    });
    test("Access to outer scope from function", () => {
        const source = `
            let a 1%
            fun myFunc b int thn
                ret a add b%
            end
            let c run myFunc 2 end%
        `.trim();
        expect(() => checkerHelper(source)).not.toThrowError();
    });

    test("Nested function declarations", () => {
        const source = `
            fun outerFunc a int thn
                fun innerFunc b int thn
                    ret a add b%
                end

                ret a add b%
            end

            let result run outerFunc 1 end%
        `.trim();
        expect(() => checkerHelper(source)).not.toThrowError();
    });
});

function checkerHelper(source: string): () => void {
    const scanner = new Scanner(source);
    const parser = new Parser(scanner);
    const ast = parser.parseProgram();
    const checker = new Checker();

    return () => {
        checker.visitProgram(ast, undefined);
    };
}
