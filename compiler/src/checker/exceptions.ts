export class CompilerError extends Error {
    constructor(msg?: string) {
        super(msg);
    }
}

export class MultipleDeclarationException extends CompilerError {
    constructor(msg?: string) {
        super(msg);
    }
}
