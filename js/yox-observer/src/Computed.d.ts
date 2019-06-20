import { getter, setter, watcher, WatcherOptions, Computed as ComputedInterface, Observer as ObserverInterface } from '../../yox-type/src/type';
/**
 * 计算属性
 *
 * 可配置 cache、deps、get、set 等
 */
export default class Computed implements ComputedInterface {
    static current?: Computed;
    /**
     * 对外的构造器，把用户配置的计算属性对象转换成内部对象
     *
     * @param keypath
     * @param observer
     * @param options
     */
    static build(keypath: string, observer: ObserverInterface, options: any): Computed | void;
    keypath: string;
    value: any;
    deps: string[];
    cache: boolean;
    fixed: boolean;
    context: any;
    observer: ObserverInterface;
    getter: getter;
    setter: setter | void;
    watcher: watcher;
    watcherOptions: WatcherOptions;
    unique: Record<string, boolean>;
    private constructor();
    /**
     * 读取计算属性的值
     *
     * @param force 是否强制刷新缓存
     */
    get(force?: boolean): any;
    set(value: any): void;
    /**
     * 添加依赖
     *
     * 这里只是为了保证依赖唯一，最后由 bind() 实现绑定
     *
     * @param dep
     */
    add(dep: string): void;
    /**
     * 绑定依赖
     */
    bind(): void;
    /**
     * 解绑依赖
     */
    unbind(): void;
}
//# sourceMappingURL=Computed.d.ts.map