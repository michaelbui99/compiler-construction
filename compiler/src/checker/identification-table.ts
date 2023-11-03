import { Declaration } from "../ast/declarations";
import { CompilerError } from "./exceptions";

export type IdEntry = {
    scopeLevel: number;
    id: string;
    declaration: Declaration;
};

export class IdentificationTable {
    private table: IdEntry[];
    private scopeLevel: number;

    constructor() {
        this.table = [];
        this.scopeLevel = 0;
    }

    declare(id: string, declaration: Declaration): void {
        const entry = this.find(id);

        if (entry && entry.scopeLevel === this.scopeLevel) {
            throw new CompilerError(
                `Id ${id} has already been declared in current scope level of ${this.scopeLevel}`
            );
        }

        this.table.push({
            id,
            declaration,
            scopeLevel: this.scopeLevel,
        });
    }

    retrieveDeclaration(id: string): Declaration | null {
        const entry = this.find(id);

        if (!entry) {
            return null;
        }

        return entry.declaration;
    }

    openScope(): void {
        this.scopeLevel += 1;
    }

    closeScope(): void {
        const currentScope = this.scopeLevel;
        this.table = this.table.filter(
            (entry) => entry.scopeLevel < currentScope
        );
        this.scopeLevel -= 1;
    }

    private find(id: String): IdEntry | null {
        for (let i = this.table.length - 1; i >= 0; i--) {
            const entry = this.table[i];
            if (entry.id === id) {
                return entry;
            }
        }

        return null;
    }
}
