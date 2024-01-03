import { Address } from "./address";

export type KnownValue = {
    type: "KNOWN_VALUE";
    value: number;
};

export type UnknownValue = {
    type: "UNKOWN_VALUE";
    address: Address;
};

export type KnownAddress = {
    type: "KNOWN_ADDRESS";
    address: Address;
};

export type RuntimeEntity = KnownValue | UnknownValue | KnownAddress;
