export enum ExpressionTypeKind {
    INTEGER,
    BOOLEAN,
    ARRAY,
    STRING,
}

export type ExpressionType = {
    kind: ExpressionTypeKind;
    spelling: string;
};
