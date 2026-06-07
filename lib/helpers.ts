import { Currencies } from '@/lib/currencies';
import { addDays, addMonths, addYears } from 'date-fns';

export function DateToUTCDate(date: Date): Date {
    // return new Date(
    //     Date.UTC(
    //         date.getFullYear(),
    //         date.getMonth(),
    //         date.getDate(),
    //         date.getHours(),
    //         date.getMinutes(),
    //         date.getSeconds(),
    //         date.getMilliseconds()
    //     )
    // )
    return date
}

export function calculateFirstNextRunAt(
    startDate: Date,
    intervalUnit: string,
    weekDay?: number | null
): Date {
    if (intervalUnit !== 'weeks' || weekDay === undefined || weekDay === null) {
        return startDate
    }
    const startDayOfWeek = startDate.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
    const daysUntilTarget = (weekDay - startDayOfWeek + 7) % 7
    return daysUntilTarget === 0 ? startDate : addDays(startDate, daysUntilTarget)
}

export function calculateNextRunAt(
    current: Date,
    intervalValue: number,
    intervalUnit: string
): Date {
    switch (intervalUnit) {
        case 'days': return addDays(current, intervalValue)
        case 'weeks': return addDays(current, intervalValue * 7)
        case 'months': return addMonths(current, intervalValue)
        case 'years': return addYears(current, intervalValue)
        default: throw new Error(`Unknown intervalUnit: ${intervalUnit}`)
    }
}

export function GetFormatterForCurrency(currency: string): Intl.NumberFormat {
    const locale = Currencies.find(c => c.value === currency)?.locale || 'it-IT';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    });
}
