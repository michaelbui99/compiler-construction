# Semantic constraint

name = variable | function | array

-   A name must be defined before use
-   A name must only be defined once each scope level.
-   A name declared as function cannot be used as a variable or array
-   A name declared as a variable cannot be used a function or array
-   A parameter of a function is a variable inside the scope of the function
-   Only a name declared as array are indexable.
-   A function is part of its own function scope.
-   A name may be defined on different scope levels. Only the inner most definition is visible. (shadowing)
-   The number of arguments in a function call must be the same as the number of parameters in the function definition.
-   the only unary operator is `not` and only be used on both booleans and integers.
-   A name declared as variable can only be reassigned to a new value of the same type that it was declared as.

# TODO: Update grammar with types bol, int and arr
