# Grammar

Program ::= Block

Block ::= Statements

Statements ::= (Statement)\*

Statement ::= ExpressionResult **%**
| Declaration
| **iff** ExpressionResult **thn** Statements (Ø | **els** Statements )**end**
| **for** ExpressionResult **thn** Statements **end**
| **out** ExpressionResult **%**
| **ass** **Identifier** ExpressionResult **%**
| **ret** ExpressionResult **%**
| **brk**

Declaration ::= **get** **Identifier** **%**
| **fun** **Identifier** (**Identifier**)\* **thn** Statements **end**
| **let** **Identifier** ExpressionResult **%**

Expression ::= **IntegerLiteral**
| **StringLiteral**
| **BooleanLiteral**
| **operator** ExpressionResult
| **run** (ExpressionResult) **end**
| **Identifier** (Ø | ExpressionList **%** )

ExpressionResult ::= Expression (**operator** Expression)\*

ExpressionList ::= (Expression)+
