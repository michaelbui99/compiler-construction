# Semantic constraints

name = variable | function | array

-   A name must be defined before use
-   A name must only be defined once each scope level.
-   A name declared as function cannot be used as a variable or array
-   A name declared as a variable cannot be used a function or array
-   A parameter of a function is a variable inside the scope of the function
-   Only a name declared as array is indexable.
-   A function is part of its own function scope.
-   A name may be defined on different scope levels. Only the inner most definition is visible. (shadowing)
-   The number of arguments in a function call must be the same as the number of parameters in the function definition.
-   The types of arguments passed in a function call must match the types declared in the function declaration.
-   the only unary operator is `not` and can only be used on booleans and integers.
-   A name declared as variable can only be reassigned to a new value of the same type that it was declared as.
-   There are no operators available for `str` type
-   All arrays are assumed to be `int` arrays and arrays can only be initialized with integer values.
-   `grt`, `lst`, `add`, `sub`, `mul`, `mod`, and `div` are only allowed to be used on integer values.
-   `and` and `orr` are only allowed to be used on boolean values.
-   `eql` can be used on integer and boolean values.
-   `len` can be used on integers, booleans and arrays. `len` will return the amount of elements in the array and returns 1 for integers and booleans.
-   Expressions evaluated in `for` and `iff` statements has to return a boolean.

-   `get` assigns a new value to the variable. It reads string is the variable is of type string, it reads integer if the variable is of type integer. It is not possible to read into an array.
