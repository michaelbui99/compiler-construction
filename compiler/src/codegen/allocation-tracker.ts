import { ExpressionType } from "../checker/expression-types";

export type Allocation = {
    identifier: string;
    displacement: number;
    type?: ExpressionType;
};

export class AllocationTracker {
    private nextDisplacement = 0;
    private currentLevel = 0;
    private allocations = new Map<number, Allocation[]>();

    constructor() {}

    beginNewScope() {
        this.nextDisplacement = 0;
        this.currentLevel++;
        if (!this.allocations.has(this.currentLevel)) {
            this.allocations.set(this.currentLevel, []);
        }
    }

    allocate(id: string, type?: ExpressionType): number {
        this.allocations.set(this.currentLevel, [
            ...(this.allocations.get(this.currentLevel) as Allocation[]),
            {
                identifier: id,
                displacement: this.nextDisplacement,
                type,
            },
        ]);
        const allocatedAt = this.nextDisplacement;
        this.nextDisplacement++;
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
        this.allocations.set(this.currentLevel, []);
        this.currentLevel--;
    }
}
