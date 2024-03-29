/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from "crypto";
import { SHA256 } from "crypto-js";

// eslint-disable-next-line
export const DeepCopy = (obj: any) => {
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

export const Random = (min: number, max: number) => {
    return Math.random() * (max - min) + min
}

export const GenCustomId = () => SHA256(randomBytes(32).toString()).toString()

export const HandleAwait = async (promise: Promise<any>) => {
    try {
        const val = await promise
        return [val, null]
    } catch (err) {
        return [null, err]
    }
}