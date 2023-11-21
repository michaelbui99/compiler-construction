## Notes

Execute = Execute Instructions
Evaluate = Evaluate Expression
Elaborate = Elaborate by expanding the stack and make space for any variables and constants

annotations:

-   t: -> true
-   d: -> done
-   f: -> false

Notes:

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

LOAD d[LB] -> Fetch variable with varoffset d in local scope

LOAD d[L1] -> Fetch variable with varoffset d in L1 scope (Caller of LB)

LOAD d[L2] -> Fetch variable with offset d in L2 scope (Caller of L1)

# Code Templates

Run\[[Program]]=

> Execute\[[Block]]
> HALT

Execute\[[Block]]

> Execute\[[Statements]]

Execute\[[Statements]] =

> Execute\[[Statement1]]
> Execute\[[Statement2]]
> Execute\[[Statement3]]
> ...
> Execute\[[StatementN]]

Execute\[[Expression]] =

> Evaluate\[[Expression]]
> POP 1

Execute\[[**iff** ExpressionResult **thn** $Statements_1$ **els** $Statements_2$]] =

> Evaluate\[[ExpressionResult]]
> JUMPIF (0) f
> Execute\[[$Statements_1$]]
> JUMP d
> f: Execute\[[$Statements_2$]]
> d:

Execute\[[**iff** ExpressionResult **thn** Statements **end**]]=

> t: Evalute\[[ExpressionResult]]
> JUMPIF (0) d
> Execute\[[Statements]]
> JUMP t
> d:

Execute\[[**for** ExpressionResult **thn** Statements **end**]]=

> t: Evalute\[[ExpressionResult]]
> JUMPIF (0) d
> Execute\[[Statements]]
> JUMP t
> d:

Execute\[[**ass** **Identifier** (Ø | Index) ExpressionResult **%**]] =

> Evaluate\[[ExpressionResult]]
> STORE varoffset\[varreg]
> LOAD varoffset\[varreg]

Execute\[[**ret** ExpressionResult **%**]] =

> RETURN (1) paramsize

Execute\[[**brk**]]=

> JUMP d

Execute\[[**get** **Identifier** **%**]] =

<!-- We handle the int case first to simplify everything -->

> getint varoffset\[varreg]

Elaborate\[[**fun** **Identifier** (**Identifier** (**Type** | **arr**))\* **thn** Statements **end**]] =

> Elaborate\[[**Identifier1**]]
> Elaborate\[[**Identifier2**]]
> Elaborate\[[**Identifier3**]]
> ...
> Elaborate\[[**IdentifierN**]]

> Execute\[[Statements]]
> RETURN (1) paramsize

Elaborate\[[**let** **Identifier** ExpressionResult **%**]]

> Evaluate\[[ExpressionResult]]
> STORE varoffset[varreg]

Elaborate\[[**let** **Identifier** **arr** Index **%**]]

> PUSH
> STORE varoffset[varreg]

Evaluate \[[**Identifier**]] =

> LOAD varoffset\[varreg]
