export enum ExpressionTypeKind {
    INTEGER = "INTEGER",
    BOOLEAN = "BOOLEAN",
    ARRAY = "ARRAY",
    STRING = "STRING",
}

export type ExpressionType = {
    kind: ExpressionTypeKind;
    depth: number | undefined;
    spelling: string;
};
