import { Mods } from "./Constants"

export const RoundFixed = (num: number, digits = 2): string => {
    return (Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits)
}

export function CommaFormat(num: number | string): string {
    const n: number = typeof num == "number" ? num : parseFloat(num)
    return n.toLocaleString()
}

export const ZeroFill = (num: number): string => {
    return num.toString().length > 1 ? num.toString() : "0" + num
}

export const Clamp = (val: number, min: number, max: number) => {
    return Math.min(Math.max(val, min), max)
}

export const DeepCopy = (obj: unknown) => {
    // eslint-disable-next-line
    let copy: any

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = DeepCopy(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (const attr in obj) {
            // eslint-disable-next-line
            if (obj.hasOwnProperty(attr)) copy[attr] = DeepCopy(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

export const GetDiffMods = (mods: number) => {
    return (mods & Mods.DoubleTime | mods & Mods.HalfTime | mods & Mods.HardRock | mods & Mods.Easy)
}