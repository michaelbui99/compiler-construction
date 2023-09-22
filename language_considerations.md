# Name

The name of the programming language will be `tre for lan`

# Concept

All keywords are 3 letters. Variables name must have different length than 3.

# Types

-   int
-   bol

# Assignment

Initialization

```
let a 1 add 3 mul 2 /// In java this would be int a = 1+3*2
```

Assigning to new value

```
ass a 1 add 2 /// In java this would be a = 1 + 2, where a is already declared and initialized
```

# Natural operations for types

-   add (addition)
-   sub (subtraction)
-   div (division)
-   mul (multiplication)
-   mod (modulo)
-   eql (equals)
-   grt (greater than)
-   lst (less than)
-   grt eql (>=)
-   lst eql (<=)
-   and (boolean and)
-   orr (boolean or???)

# Structured data type

-   arr (an array)
-   str (a string)
-   obj (an object, maybe)

let a arr 4 5 18 68
# Selection statement

-   iff (if and only if)

# Repetition statement

Only one type of repitition in this language - `for`. This would function as a while loop. To exit the loop, the user must use `brk`.

```
let a 1;
for condition thn
    a add 1;;;
    iff a eql 3 thn
        brk;;;
    end
end
```

# Subroutines

```
fun addNums a b thn
    ret a add b;
end

let firstNum 1
let secondNum 2

let result addNums firstNum secondNum
```

# Console input and output

## Read from input

```
out "Enter guess" // Wr
get a /// User enters a number
out "User guessed: " add a /// This prints the number to console
```

## Write to console

```
let a "myString"%
out a%
```

# Examples

## Fibonacci

```
fun fibonacci n thn
    iff n eql 0 thn
        ret 0%
    end

    iff n eql 1 orr n eql 2 thn
        ret 1%
    end

    ret fibonacci run n sub 1 end add fibonacci run n sub 2 end%
end


let fib_8 fibonacci run fibbonacci 6 end %

out "The eighth fibonacci number is: " add fib_8%
```
