# Grammar

Program ::= Block

Block ::= Statements

Statements ::= (Statement)\*

Statement ::= ExpressionResult
| Declaration
| **iff** ExpressionResult **thn** Statements (Ø | **els** Statements )**end**
| **for** ExpressionResult **thn** Statements **end**
| **out** ExpressionResult **%**
| **ass** **Identifier** (Ø | Index) ExpressionResult **%**
| **ret** ExpressionResult **%**
| **brk**

Declaration ::= **get** **Identifier** **%**
| **fun** **Identifier** (**Identifier** (**Type** | **arr**) )\* **thn** Statements **end**
| **let** **Identifier** (**arr** Index | ExpressionList) | ExpressionResult **%**

ExpressionResult ::= Expression6 (**BooleanOperator** Expression6 )\*

ExpressionList ::= (Expression6 )+

BooleanOperator ::= **and** | **or**

CompareOperator ::= **grt** | **lst**

AddOperator ::= **add** | **sub**

MultOperator ::= **mul** | **div** | **mod**

PrimaryExpression ::= **run** ExpressionResult **end**
| **IntegerLiteral**
| **BooleanLiteral**
| **StringLiteral**
| **Identifier** (Ø | ExpressionList | Index)

Expression6 ::= Expression5 | Expression5 **eql** Expression5

Expression5 ::= Expression4 | Expression4 CompareOperator Expression4

Expression4 ::= Expression3 | Expression3 AddOperator Expression3

Expression3 ::= Expression2 | Expression2 MultOperator Expression2

Expression2 ::= PrimaryExpression | **not** PrimaryExpression | **len** PrimaryExpression

Index ::= (#(**InterLitteral**)|(**Identifier**))+

Type ::= **bol** | **int** | **str**

<!-- ```
NOTE: Indexing arrays:

let myArr arr 1 2 3 4
let x myArr #0 --- x is now 1
ass myArr #0 2
out myArr #0 --- prints 2

len myArr

6 * 5

``` -->
