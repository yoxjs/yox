import * as type from '../type';
import { ValueHolder } from '../class';
export default interface objectUtil {
    keys(object: type.data): string[];
    sort(object: type.data, desc?: boolean): string[];
    each(object: type.data, callback: (value: any, key: string) => boolean | void): void;
    clear(object: type.data): void;
    extend(original: type.data, object: type.data): type.data;
    merge(object1: type.data | void, object2: type.data | void): type.data | void;
    copy(object: any, deep?: boolean): any;
    get(object: any, keypath: string): ValueHolder | undefined;
    set(object: type.data, keypath: string, value: any, autofill?: boolean): void;
    has(object: type.data, key: string | number): boolean;
    falsy(object: any): boolean;
}
//# sourceMappingURL=object.d.ts.map