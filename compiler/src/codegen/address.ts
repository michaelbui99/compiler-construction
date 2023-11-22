export class Address {
    public level: number;
    public displacement: number;

    constructor(level: number = 0, displacement: number = 0) {
        this.level = level;
        this.displacement = displacement;
    }

    static newDefault(): Address {
        return new Address(0, 0);
    }

    static fromAdressAndIncrement(
        address: Address,
        increment: number
    ): Address {
        return new Address(address.level, address.displacement + increment);
    }

    static fromAdress(address: Address): Address {
        return new Address(address.level + 1, 0);
    }
}
