export default interface arrayUtil {
    each<T>(array: T[], callback: (item: T, index: number, length: number) => boolean | void, reversed?: boolean): void;
    push<T>(array: T[], target: T | T[]): void;
    unshift<T>(array: T[], target: T | T[]): void;
    indexOf<T>(array: T[], target: T, strict?: boolean): number;
    last<T>(array: T[]): T | void;
    pop<T>(array: T[]): T | void;
    remove<T>(array: T[], target: T, strict?: boolean): number;
    has<T>(array: T[], target: T, strict?: boolean): boolean;
    toArray<T>(array: T[] | ArrayLike<T>): T[];
    toObject(array: any[], key?: string | null, value?: any): Object;
    join(array: string[], separator: string): string;
    falsy(array: any): boolean;
}
//# sourceMappingURL=array.d.ts.map