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

Execute\[[Statements]] =

> Execute\[[Statement1]]
> Execute\[[Statement2]]
> Execute\[[Statement3]]
> ...
> Execute\[[StatementN]]

Execute\[[Expression]] =

> Evaluate\[[Expression]]
> POP 1

Execute\[[**iff** ExpressionResult **thn** $Statements_1$ else $Statements_2$]] =

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

Execute\[[**brk**]]=

> JUMP d
