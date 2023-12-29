import { ExpressionType } from "../checker/expression-types";

export type Allocation = {
    identifier: string;
    displacement: number;
    type?: ExpressionType;
    wordSize?: number;
};

export class AllocationTracker {
    private nextDisplacement = 0;
    public currentLevel = 0;
    private allocations = new Map<number, Allocation[]>();

    constructor() {}

    beginNewScope() {
        this.nextDisplacement = 0;
        this.currentLevel++;
        if (!this.allocations.has(this.currentLevel)) {
            this.allocations.set(this.currentLevel, []);
        }
    }

    allocate(id: string, type?: ExpressionType, wordSize?: number): number {
        if (!this.allocations.has(this.currentLevel)) {
            this.allocations.set(this.currentLevel, []);
        }
        this.allocations.set(this.currentLevel, [
            ...(this.allocations.get(this.currentLevel) as Allocation[]),
            {
                identifier: id,
                displacement: this.nextDisplacement,
                type,
                wordSize,
            },
        ]);
        console.log("Allocated new identifier");
        console.log(this.allocations);
        const allocatedAt = this.nextDisplacement;
        this.nextDisplacement += 1;
        return allocatedAt;
    }

    get(id: string, level: number): Allocation | undefined {
        if (!this.allocations.has(level)) {
            return undefined;
        }

        const allocations = this.allocations.get(level) ?? [];

        for (let allocation of allocations) {
            if ((allocation.identifier = id)) {
                return allocation;
            }
        }

        return undefined;
    }

    endScope() {
        this.clearAllocationsForCurrentScope();
        if (this.currentLevel === 0) {
            return;
        } else {
            this.currentLevel--;
        }
    }

    private clearAllocationsForCurrentScope() {
        this.allocations.set(this.currentLevel, []);
    }
}
