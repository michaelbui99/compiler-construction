# Grammar

Program ::= Block

Block ::= Statements | Ø

Statements ::= Statement | Statements Statement

Statement ::= Expression **%**
| Declaration
| **iff** Expression **thn** Statements **end**
| **iff** Expression **thn** Statements **els** Statements **end**
| **for** Expressions **thn** Statements **end**
| **out** Expression **%**
| **ass** Expression **%**
| **ret** Expression **%**
| Ø

Declaration ::= get **Identifier** **%**
| **fun** **Identifier** IdList **thn** Statements **end**
| **let** **Identifier** Expression **%**

IdList ::= **Identifier** IdList | Ø

Expression ::= **IntegerLiteral**
| **StringLiteral**
| Expression **operator** Expression
| **not** Expression
| **run** Expression **end**
| **Identifier**
| **Identifier** ExpressionList **%**

ExpressionList ::= ExpressionList Expression | Expression
