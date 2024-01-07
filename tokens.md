# Tokens

Identifier ::= Letter (Letter|Digit){0, 1} | Letter (Letter|Digit){3,}

Digit ::= [0-9]

Letter ::= [A-Za-z]

IntegerLitteral ::= Digit+

StringLitteral ::= "(.\*)"

Operator ::= add | sub | div | mul | mod | eql | grt | lst | and | orr | not

Type ::= int | bol | str | arr

Keyword ::= Operator | Type | eof

## Keywords

-   let
-   ass
-   arr
-   iff
-   thn
-   end
-   els
-   for
-   out
-   ret
-   fun
-   get
-   run
-   %
