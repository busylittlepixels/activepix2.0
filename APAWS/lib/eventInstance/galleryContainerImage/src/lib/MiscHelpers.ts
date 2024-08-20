export namespace MiscHelpers {
    export function niceDate(date: string | Date | null | undefined): string {
        if(
            date === null
            || date === undefined
        ) {
            return 'Unknown date';
        }
        if(typeof date === 'string') {
            date = new Date(date);
        }
        //Date in format "August 1st, 2021"
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
}