import { data, valueHolder } from '../type';
export default interface objectUtil {
    keys(object: data): string[];
    sort(object: data, desc?: boolean): string[];
    each(object: data, callback: (value: any, key: string) => boolean | void): void;
    clear(object: data): void;
    extend(original: data, object: data): data;
    merge(object1: data | void, object2: data | void): data | void;
    copy(object: any, deep?: boolean): any;
    get(object: any, keypath: string): valueHolder | undefined;
    set(object: data, keypath: string, value: any, autofill?: boolean): void;
    has(object: data, key: string | number): boolean;
    falsy(object: any): boolean;
}
//# sourceMappingURL=object.d.ts.map