import { data, getter, filter, component, componentCallback, watcher, listener, VNode } from '../../yox-type/src/type';
import { WatcherOptions, ComputedOptions, YoxOptions, YoxInterface, YoxPlugin, DirectiveHooks, TransitionHooks } from '../../yox-type/src/global';
import CustomEvent from '../../yox-common/src/util/CustomEvent';
import Emitter from '../../yox-common/src/util/Emitter';
import * as is from '../../yox-common/src/util/is';
import * as array from '../../yox-common/src/util/array';
import * as string from '../../yox-common/src/util/string';
import * as object from '../../yox-common/src/util/object';
import * as logger from '../../yox-common/src/util/logger';
import * as domApi from '../../yox-dom/src/dom';
import Computed from '../../yox-observer/src/Computed';
import Observer from '../../yox-observer/src/Observer';
export default class Yox implements YoxInterface {
    $options: YoxOptions;
    $observer: Observer;
    $emitter: Emitter;
    $el?: HTMLElement;
    $template?: Function;
    $refs?: Record<string, YoxInterface | HTMLElement>;
    $model?: string;
    $root?: YoxInterface;
    $parent?: YoxInterface;
    $context?: YoxInterface;
    $children?: YoxInterface[];
    $vnode: VNode | undefined;
    $directives?: Record<string, DirectiveHooks>;
    $components?: Record<string, YoxOptions>;
    $transitions?: Record<string, TransitionHooks>;
    $partials?: Record<string, Function>;
    $filters?: Record<string, filter>;
    /**
     * core 版本
     */
    static version: string | undefined;
    /**
     * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
     */
    static is: typeof is;
    static array: typeof array;
    static object: typeof object;
    static string: typeof string;
    static logger: typeof logger;
    static Event: typeof CustomEvent;
    static Emitter: typeof Emitter;
    static dom: typeof domApi;
    /**
     * 安装插件
     *
     * 插件必须暴露 install 方法
     */
    static use(plugin: YoxPlugin): void;
    /**
     * 创建组件对象
     */
    static create(options: YoxOptions): YoxOptions;
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    static nextTick(task: Function, context?: any): void;
    /**
     * 编译模板，暴露出来是为了打包阶段的模板预编译
     */
    static compile(template: string, stringify?: boolean): Function | string;
    static directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
    static transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
    static component(name: string | Record<string, component>, component?: component): component | void;
    static partial(name: string | Record<string, string>, partial?: string): Function | void;
    static filter(name: string | Record<string, filter>, filter?: filter): filter | void;
    constructor(options: YoxOptions | void);
    /**
     * 添加计算属性
     */
    addComputed(keypath: string, computed: getter | ComputedOptions): Computed | void;
    /**
     * 删除计算属性
     */
    removeComputed(keypath: string): void;
    /**
     * 取值
     */
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    /**
     * 设值
     */
    set(keypath: string | data, value?: any): void;
    /**
     * 监听事件
     */
    on(type: string | Record<string, listener>, listener?: listener): YoxInterface;
    /**
     * 监听一次事件
     */
    once(type: string | Record<string, listener>, listener?: listener): YoxInterface;
    /**
     * 取消监听事件
     */
    off(type?: string, listener?: listener): YoxInterface;
    /**
     * 发射事件
     */
    fire(type: string | CustomEvent, data?: data | boolean, downward?: boolean): boolean;
    /**
     * 监听数据变化
     */
    watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): YoxInterface;
    /**
     * 取消监听数据变化
     */
    unwatch(keypath?: string, watcher?: watcher): YoxInterface;
    /**
     * 加载组件，组件可以是同步或异步，最后会调用 callback
     *
     * @param name 组件名称
     * @param callback 组件加载成功后的回调
     */
    loadComponent(name: string, callback: componentCallback): void;
    /**
     * 创建子组件
     *
     * @param options 组件配置
     * @param vnode 虚拟节点
     */
    createComponent(options: YoxOptions, vnode: VNode): YoxInterface;
    directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
    transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
    component(name: string | Record<string, component>, component?: component): component | void;
    partial(name: string | Record<string, string>, partial?: string): Function | void;
    filter(name: string | Record<string, filter>, filter?: filter): filter | void;
    /**
     * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
     * 而你非常确定需要更新模板，强制刷新正是你需要的
     */
    forceUpdate(data?: data): void;
    /**
     * 把模板抽象语法树渲染成 virtual dom
     */
    render(): any;
    /**
     * 更新 virtual dom
     *
     * @param vnode
     * @param oldVnode
     */
    update(vnode: VNode, oldVnode: VNode): void;
    /**
     * 校验组件参数
     *
     * @param props
     */
    checkProps(props: data): void;
    checkProp(key: string, value: any): void;
    /**
     * 销毁组件
     */
    destroy(): void;
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    nextTick(task: Function): void;
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
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
}
//# sourceMappingURL=Yox.d.ts.map