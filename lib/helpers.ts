import { Currencies } from '@/lib/currencies';

export function DateToUTCDate(date: Date): Date {
    return new Date(
        Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds()
        )
    )
}

export function GetFormatterForCurrency(currency: string): Intl.NumberFormat {
    const locale = Currencies.find(c => c.value === currency)?.locale || 'it-IT';
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
    });
}
