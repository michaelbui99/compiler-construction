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
