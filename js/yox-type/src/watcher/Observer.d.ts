import * as type from '../type';
import Computed from './Computed';
import NextTask from '../interface/NextTask';
import ComputedOptions from '../options/Computed';
import WatcherOptions from '../options/Watcher';
export default interface Observer {
    data: type.data;
    context: any;
    nextTask: NextTask;
    addComputed(keypath: string, options: type.getter | ComputedOptions): Computed | void;
    removeComputed(keypath: string): void;
    diff(keypath: string, newValue: any, oldValue: any): void;
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    set(keypath: string | type.data, value?: any): void;
    watch(keypath: string | Record<string, type.watcher | WatcherOptions>, watcher?: type.watcher | WatcherOptions, immediate?: boolean): void;
    unwatch(keypath?: string, watcher?: type.watcher): void;
    toggle(keypath: string): boolean;
    increase(keypath: string, step?: number, max?: number): number | void;
    decrease(keypath: string, step: number, min?: number): number | void;
    insert(keypath: string, item: any, index: number | boolean): true | void;
    append(keypath: string, item: any): true | void;
    prepend(keypath: string, item: any): true | void;
    removeAt(keypath: string, index: number): true | void;
    remove(keypath: string, item: any): true | void;
    copy<T>(data: T, deep?: boolean): T;
    destroy(): void;
}
//# sourceMappingURL=Observer.d.ts.map