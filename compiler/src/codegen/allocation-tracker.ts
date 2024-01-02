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
    private displacements = new Map<number, number>();

    constructor() {}

    beginNewScope() {
        this.nextDisplacement = 0;
        this.currentLevel++;
        if (!this.allocations.has(this.currentLevel)) {
            this.allocations.set(this.currentLevel, []);
        }
        if (!this.displacements.has(this.currentLevel)) {
            this.displacements.set(this.currentLevel, 0);
        }
    }

    allocate(id: string, type?: ExpressionType, wordSize?: number): number {
        if (!this.allocations.has(this.currentLevel)) {
            this.allocations.set(this.currentLevel, []);
            this.displacements.set(this.currentLevel, 0);
        }
        this.allocations.set(this.currentLevel, [
            ...(this.allocations.get(this.currentLevel) as Allocation[]),
            {
                identifier: id,
                displacement: this.displacements.get(this.currentLevel)!,
                type,
                wordSize,
            },
        ]);
        console.log("Allocated new identifier");
        console.log(this.allocations);
        const allocatedAt = this.displacements.get(this.currentLevel)!;
        this.displacements.set(
            this.currentLevel,
            this.displacements.get(this.currentLevel)! + 1
        );
        return allocatedAt;
    }

    incrementDisplacement(level: number, amount: number) {
        if (!this.displacements.has(level)) {
            this.displacements.set(level, 0);
        }

        this.displacements.set(level, this.displacements.get(level)! + amount);
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

    getAllocations(level: number): Allocation[] {
        if (!this.allocations.has(level)) {
            return [];
        }

        return this.allocations.get(level)!;
    }

    endScope() {
        this.clearAllocationsForCurrentScope();
        this.resetDisplacementsForCurrentScope();
        if (this.currentLevel === 0) {
            return;
        } else {
            this.currentLevel--;
        }
    }

    printAllocations() {
        console.log(this.allocations);
    }
    printDisplacements() {
        console.log(this.displacements);
    }

    private clearAllocationsForCurrentScope() {
        this.allocations.set(this.currentLevel, []);
    }
    private resetDisplacementsForCurrentScope() {
        this.displacements.set(this.currentLevel, 0);
    }
}
