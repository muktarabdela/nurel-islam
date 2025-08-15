import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    }).format(date)
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount)
}

export function formatNumber(number: number) {
    return new Intl.NumberFormat("en-US").format(number)
}

export function formatPercentage(percentage: number) {
    return new Intl.NumberFormat("en-US", {
        style: "percent",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(percentage / 100)
}

export function truncateString(str: string, length: number) {
    if (str.length <= length) return str
    return str.substring(0, length) + "..."
}
