## Factorial

```
fun factorial n int thn
    iff run n lst 1 end orr run n eql 0 end thn
        ret 1 %
    end

    ret n mul factorial run n sub 1 end %
end
```

## Simple program

```
let a 1 %
let b 2 %

let c a add b mul 2 %

out c %

out factorial 5 %
```
