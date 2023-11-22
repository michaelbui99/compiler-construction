Execute = Execute Instructions
Evaluate = Evaluate Expression
Elaborate = Elaborate by expanding the stack and make space for any variables and constants

annotations:

-   t: -> true
-   d: -> done
-   f: -> false

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

Execute\[[**out** ExpressionResult **%**]]=

> initialize variable for counter of words \[len] // int will have size 1
> initialize something to have index 0
> t: LOAD (1) \[len]
> LOAD (1) \[index]
> call gt
> JUMPIF (0) d
> putint varoffset\[[varreg + index]]
> LOAD (1) \[index]
> call succ
> STORE (1) \[index]
> JUMP t
> d:


Execute\[[**ass** **Identifier** (Ø | Index) ExpressionResult **%**]] =

> Evaluate\[[ExpressionResult]]
> 
> // do this for each index variable (if indexes for 2 dimensional make it twice)
> LOADA varoffset\[varreg]
> LOAD (1) varoffset\[index]
> CALL add
> 
> 
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

Elaborate\[[**let** **Identifier** **arr** Index **%**]]=

> PUSH 1
> //for each index / dimension
> PUSH expression|integerliteral
> CALL mult 
> STORE (1) varoffset\[[someCounter]] // not sure if we can run PUSH "the thing on the stack"
> t: LOAD (1) varoffset\[[someCounter]]
> JUPMIF (0) d:
> PUSH 1
> LOAD (1) varoffset\[[someCounter]]
> CALL pred
> STORE (1) varoffset\[[someCounter]]
> JUMP t: 
> d:

Evaluate \[[**Identifier**]] =

> LOAD varoffset\[varreg]
