export const RoundFixed = (num: number, digits = 2): string => {
    return (Math.round(num * Math.pow(10, digits)) / Math.pow(10, digits)).toFixed(digits)
}

export function CommaFormat(num: number | string): string {
    const n: number = typeof num == "number" ? num : parseFloat(num)
    return n.toLocaleString()
}

export function ZeroFill(num: number): string {
    return num.toString().length > 1 ? num.toString() : "0" + num
}