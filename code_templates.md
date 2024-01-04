## Notes

Execute = Execute Instructions, but don't expand or shrink the stack

Evaluate = Evaluate Expression and push result on to the stack top.

Elaborate = Elaborate by expanding the stack and make space for any variables and constants

Fetch = Push the value of the constant or variable on to the stack top.

Asssign = Pop value from stack and store it in variable.

annotations:

-   t: -> true
-   d: -> done
-   f: -> false

Notes:
Static link -> Where was the function declared?
Dyanmic link -> Where was the funcion called from?

```
function c() {
    # LB
}
function b(){
    # L1
    c()
}
function a(){
    #L2
    b()
}

a();
```

LB -> Base of topmost stack frame.

L1 -> Encloses LB

L2 -> Encloses L1, L2(L1(LB))

LOAD d[LB] -> Fetch variable with displacement d in local scope

LOAD d[L1] -> Fetch variable with displacement d in L1 scope (Caller of LB)

LOAD d[L2] -> Fetch variable with offset d in L2 scope (Caller of L1)

# Code Templates

## **Run\[[Program]]=**

> Execute\[[Block]]

> HALT

## **Execute\[[Block]] =**

> Execute\[[Statements]]

## **Execute\[[Statements]] =**

> Execute\[[Statement1]]

> Execute\[[Statement2]]

> Execute\[[Statement3]]

> ...

> Execute\[[StatementN]]

## **Execute\[[Expression]] =**

> Evaluate\[[Expression]]

> POP 1

## **Execute\[[**iff** ExpressionResult **thn** $Statements_1$ **els** $Statements_2$]] =**

> Evaluate\[[ExpressionResult]]

> JUMPIF (0) f

> Execute\[[$Statements_1$]]

> JUMP d

> f: Execute\[[$Statements_2$]]

> d:

## **Execute\[[**iff** ExpressionResult **thn** Statements **end**]]=**

> t: Evalute\[[ExpressionResult]]

> JUMPIF (0) d

> Execute\[[Statements]]

> d:

## **Execute\[[**for** ExpressionResult **thn** Statements **end**]]=**

> t: Evalute\[[ExpressionResult]]

> JUMPIF (0) d

> Execute\[[Statements]]

> JUMP t

> d:

## **Execute[[**out** ExpressionResult **%**]]=**

int and boolean case

> Evaluate ExpressionResult

> putint

> puteol

## <strong>Execute[[**ass** **Identifier** ExpressionResult **%**]]=<strong>

> Evaluate\[[ExpressionResult]]

> STORE (resultSize) displacement\[varreg]

## <strong>Execute[[**ass** **Identifier** Index ExpressionResult **%**]]=<strong>

Arrays can only contain integers, so the result is always 1 word size.

> Evaluate\[[ExpressionResult]]

> STORE (1) displacement + index\[varreg]

## **Execute\[[**ret** ExpressionResult **%**]] =**

> Evaluate\[[ExpressionResult]]

> RETURN resultSize paramSize

## **Execute\[[**brk**]]=**

root level case

> HALT

## Execute\[[**get** **Identifier** **%**]] =

int case

> getint displacement\[varreg]

## Elaborate\[[**fun** **Identifier** (**Identifier** (**Type** | **arr**))\* **thn** Statements **end**]] =

> JUMP g

> Elaborate\[[**Identifier1**]]

> Elaborate\[[**Identifier2**]]

> Elaborate\[[**Identifier3**]]

> ...

> Elaborate\[[**IdentifierN**]]

> Execute\[[Statements]]

> RETURN resultSize paramSize

> g:

## Elaborate\[[**let** **Identifier** ExpressionResult **%**]]

> Evaluate\[[ExpressionResult]]
> Assign[[Identifier]]

## Elaborate\[[**let** **Identifier** **arr** Index **%**]]

> PUSH
> STORE displacement[varreg]

## Evaluate \[[**Identifier**]] =

> LOAD (size) displacement\[varreg]

## Evaluate [[**Identifier** ExpressionList]]

> Evaluate [[ExpressionList]]

> CALL (funcreg) funcadr[CB]

## Evaluate [[Expression1 **Operator** Expression2]]

> Evaluate [[Expression1]]

> Evauluate [[Expression2]]

> CALL Operator

## Evaluate [[IntegerLiteral]]

> LOADL Literal

## Evaluate [[BooleanLiteral]]

true

> LOADL 1

## Evaluate [[BooleanLiteral]]

false

> LOADL 0

## Assign[[**Identifier**]] =

> STORE displacement[varreg]

> LOAD (size) displacement[varreg]
