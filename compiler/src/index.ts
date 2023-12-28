import fs from "fs";
import path from "path";
import { command, positional, string, run, option } from "cmd-ts";
import { Parser } from "./ast/parser";
import { Scanner } from "./scanner/scanner";
import { exec } from "child_process";
import { Encoder } from "./codegen/encoder";

// const TAM_JAR_PATH = path.resolve(__dirname, "vm", "TAM.jar");

const app = command({
    args: {
        file: positional({ type: string, displayName: "file" }),
        out: option({
            long: "out",
            short: "o",
            type: string,
            defaultValue: () => path.resolve(process.cwd(), "program.tam"),
        }),
    },
    handler: ({ file, out }) => {
        // read the file to the screen
        const source = fs.readFileSync(file, "utf-8");
        const scanner = new Scanner(source);
        const parser = new Parser(scanner);
        const encoder = new Encoder();
        if (file && !file.endsWith(".tam")) {
            file = `${file}.tam`;
        }
        encoder.saveTargetProgram(
            file ?? path.resolve(process.cwd(), "program.tam")
        );

        const program = parser.parseProgram();
        encoder.encode(program, out);
    },
    name: "treforlan",
});

// parse arguments
run(app, process.argv.slice(2));
