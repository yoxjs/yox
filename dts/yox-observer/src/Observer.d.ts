import { data, getter, watcher, ObserverInterface } from '../../yox-type/src/type';
import { WatcherOptions, ComputedOptions } from '../../yox-type/src/global';
import Emitter from '../../yox-common/src/util/Emitter';
import NextTask from '../../yox-common/src/util/NextTask';
import Computed from './Computed';
interface AsyncChange {
    value: any;
    keypaths: string[];
}
/**
 * 观察者有两种观察模式：
 *
 * 1. 同步监听
 * 2. 异步监听
 *
 * 对于`计算属性`这种需要实时变化的对象，即它的依赖变了，它需要立即跟着变，否则会出现不一致的问题
 * 这种属于同步监听
 *
 * 对于外部调用 observer.watch('keypath', listener)，属于异步监听，它只关心是否变了，而不关心是否是立即触发的
 */
export default class Observer implements ObserverInterface {
    data: data;
    context: any;
    nextTask: NextTask;
    computed?: Record<string, Computed>;
    reversedComputedKeys?: string[];
    syncEmitter: Emitter;
    asyncEmitter: Emitter;
    asyncChanges: Record<string, AsyncChange>;
    pending?: boolean;
    constructor(data?: data, context?: any);
    /**
     * 获取数据
     *
     * @param keypath
     * @param defaultValue
     * @param depIgnore
     * @return
     */
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    /**
     * 更新数据
     *
     * @param keypath
     * @param value
     */
    set(keypath: string | data, value?: any): void;
    /**
     * 同步调用的 diff，用于触发 syncEmitter，以及唤醒 asyncEmitter
     *
     * @param keypath
     * @param newValue
     * @param oldValue
     */
    diff(keypath: string, newValue: any, oldValue: any): void;
    /**
     * 异步触发的 diff
     */
    diffAsync(): void;
    /**
     * 添加计算属性
     *
     * @param keypath
     * @param computed
     */
    addComputed(keypath: string, options: getter | ComputedOptions): Computed | void;
    /**
     * 移除计算属性
     *
     * @param keypath
     */
    removeComputed(keypath: string): void;
    /**
     * 监听数据变化
     *
     * @param keypath
     * @param watcher
     * @param immediate
     */
    watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): void;
    /**
     * 取消监听数据变化
     *
     * @param keypath
     * @param watcher
     */
    unwatch(keypath?: string, watcher?: watcher): void;
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     *
     * @param keypath
     * @return 取反后的布尔值
     */
    toggle(keypath: string): boolean;
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    increase(keypath: string, step?: number, max?: number): number | void;
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    decrease(keypath: string, step?: number, min?: number): number | void;
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    insert(keypath: string, item: any, index: number | boolean): true | void;
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    append(keypath: string, item: any): true | void;
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    prepend(keypath: string, item: any): true | void;
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    removeAt(keypath: string, index: number): true | void;
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    remove(keypath: string, item: any): true | void;
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    copy<T>(data: T, deep?: boolean): T;
    /**
     * 销毁
     */
    destroy(): void;
}
export {};
//# sourceMappingURL=Observer.d.ts.map