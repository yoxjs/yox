export default interface stringUtil {
    camelize(str: string): string;
    hyphenate(str: string): string;
    capitalize(str: string): string;
    trim(str: any): string;
    slice(str: string, start: number, end?: number): string;
    indexOf(str: string, part: string, start?: number): number;
    lastIndexOf(str: string, part: string, end?: number): number;
    startsWith(str: string, part: string): boolean;
    endsWith(str: string, part: string): boolean;
    charAt(str: string, index?: number): string;
    codeAt(str: string, index?: number): number;
    upper(str: string): string;
    lower(str: string): string;
    has(str: string, part: string): boolean;
    falsy(str: any): boolean;
}
//# sourceMappingURL=string.d.ts.map