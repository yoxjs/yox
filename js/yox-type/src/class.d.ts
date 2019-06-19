import * as config from '../../yox-config/src/config';
import * as type from './type';
import { VNode } from './vnode';
import API from './util/API';
import isUtil from './util/is';
import arrayUtil from './util/array';
import objectUtil from './util/object';
import stringUtil from './util/string';
import loggerUtil from './util/logger';
export interface ValueHolder {
    keypath?: string;
    value: any;
}
export interface Task {
    fn: Function;
    ctx?: any;
}
export interface NextTask {
    append(func: Function, context?: any): void;
    prepend(func: Function, context?: any): void;
    clear(): void;
    run(): void;
}
export interface ComputedOptions {
    get: type.getter;
    set?: type.setter;
    cache?: boolean;
    sync?: boolean;
    deps?: string[];
}
export interface WatcherOptions {
    watcher: type.watcher;
    immediate?: boolean;
    sync?: boolean;
    once?: boolean;
}
export interface EmitterOptions extends Task {
    ns?: string;
    num?: number;
    max?: number;
    count?: number;
}
export interface YoxOptions {
    propTypes?: Record<string, PropRule>;
    el?: string | Node;
    data?: type.data | type.dataGenerator;
    template?: string | Function;
    model?: string;
    props?: type.data;
    root?: Yox;
    parent?: Yox;
    context?: Yox;
    replace?: true;
    vnode?: VNode;
    slots?: Record<string, VNode[]>;
    computed?: Record<string, type.getter | ComputedOptions>;
    watchers?: Record<string, type.watcher | WatcherOptions>;
    transitions?: Record<string, TransitionHooks>;
    components?: Record<string, YoxOptions>;
    directives?: Record<string, DirectiveHooks>;
    partials?: Record<string, string>;
    filters?: Record<string, type.filter>;
    events?: Record<string, type.listener>;
    methods?: Record<string, Function>;
    extensions?: type.data;
    [config.HOOK_BEFORE_CREATE]?: type.yoxOptionsBeforeCreateHook;
    [config.HOOK_AFTER_CREATE]?: type.yoxOptionsOtherHook;
    [config.HOOK_BEFORE_MOUNT]?: type.yoxOptionsOtherHook;
    [config.HOOK_AFTER_MOUNT]?: type.yoxOptionsOtherHook;
    [config.HOOK_BEFORE_UPDATE]?: type.yoxOptionsOtherHook;
    [config.HOOK_AFTER_UPDATE]?: type.yoxOptionsOtherHook;
    [config.HOOK_BEFORE_DESTROY]?: type.yoxOptionsOtherHook;
    [config.HOOK_AFTER_DESTROY]?: type.yoxOptionsOtherHook;
    [config.HOOK_BEFORE_ROUTE_ENTER]?: type.yoxRouterBeforeHook;
    [config.HOOK_AFTER_ROUTE_ENTER]?: type.yoxRouterAfterHook;
    [config.HOOK_BEFORE_ROUTE_UPDATE]?: type.yoxRouterBeforeHook;
    [config.HOOK_AFTER_ROUTE_UPDATE]?: type.yoxRouterAfterHook;
    [config.HOOK_BEFORE_ROUTE_LEAVE]?: type.yoxRouterBeforeHook;
    [config.HOOK_AFTER_ROUTE_LEAVE]?: type.yoxRouterAfterHook;
}
export interface CustomEvent {
    type: string;
    phase: number;
    target?: Yox;
    originalEvent?: CustomEvent | Event;
    isPrevented?: true;
    isStoped?: true;
    listener?: Function;
    preventDefault(): CustomEvent;
    stopPropagation(): CustomEvent;
    prevent(): CustomEvent;
    stop(): CustomEvent;
}
export declare var CustomEvent: {
    prototype: CustomEvent;
    PHASE_CURRENT: number;
    PHASE_UPWARD: number;
    PHASE_DOWNWARD: number;
    new (type: string, originalEvent?: CustomEvent | Event): CustomEvent;
};
export interface Emitter {
    ns: boolean;
    listeners: Record<string, EmitterOptions[]>;
    nativeListeners?: Record<string, type.nativeListener>;
    fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
    on(type: string, listener?: Function | EmitterOptions): void;
    off(type?: string, listener?: Function): void;
    has(type: string, listener?: Function): boolean;
}
export declare var Emitter: {
    prototype: Emitter;
    new (ns?: boolean): Emitter;
};
export interface Observer {
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
export declare var Observer: {
    prototype: Observer;
    new (data?: type.data, context?: any): Observer;
};
export interface Computed {
    get(force?: boolean): any;
    set(value: any): void;
}
export declare var Computed: {
    prototype: Computed;
    current?: Computed;
    build(keypath: string, observer: Observer, options: any): Computed | void;
    new (keypath: string, sync: boolean, cache: boolean, deps: string[], observer: Observer, getter: type.getter, setter: type.setter | void): Computed;
};
export interface Yox {
    $options: YoxOptions;
    $emitter: Emitter;
    $observer: Observer;
    $el?: HTMLElement;
    $vnode?: VNode;
    $model?: string;
    $root?: Yox;
    $parent?: Yox;
    $context?: Yox;
    $children?: Yox[];
    $refs?: Record<string, Yox | HTMLElement>;
    addComputed(keypath: string, computed: type.getter | ComputedOptions): Computed | void;
    removeComputed(keypath: string): void;
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    set(keypath: string | type.data, value?: any): void;
    on(type: string | Record<string, type.listener>, listener?: type.listener): Yox;
    once(type: string | Record<string, type.listener>, listener?: type.listener): Yox;
    off(type?: string, listener?: type.listener): Yox;
    fire(type: string | CustomEvent, data?: type.data | boolean, downward?: boolean): boolean;
    watch(keypath: string | Record<string, type.watcher | WatcherOptions>, watcher?: type.watcher | WatcherOptions, immediate?: boolean): Yox;
    unwatch(keypath?: string, watcher?: type.watcher): Yox;
    loadComponent(name: string, callback: type.componentCallback): void;
    createComponent(options: YoxOptions, vnode: VNode): Yox;
    directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
    transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
    component(name: string | Record<string, type.component>, component?: type.component): type.component | void;
    partial(name: string | Record<string, string>, partial?: string): Function | void;
    filter(name: string | Record<string, type.filter>, filter?: type.filter): type.filter | void;
    checkProps(props: type.data): void;
    checkProp(key: string, value: any): void;
    forceUpdate(data?: type.data): void;
    destroy(): void;
    nextTick(task: Function): void;
    toggle(keypath: string): boolean;
    increase(keypath: string, step?: number, max?: number): number | void;
    decrease(keypath: string, step: number, min?: number): number | void;
    insert(keypath: string, item: any, index: number | boolean): true | void;
    append(keypath: string, item: any): true | void;
    prepend(keypath: string, item: any): true | void;
    removeAt(keypath: string, index: number): true | void;
    remove(keypath: string, item: any): true | void;
    copy<T>(data: T, deep?: boolean): T;
}
export declare var Yox: {
    prototype: Yox;
    dom: API;
    is: isUtil;
    array: arrayUtil;
    object: objectUtil;
    string: stringUtil;
    logger: loggerUtil;
    Emitter: typeof Emitter;
    Event: typeof CustomEvent;
    new (options?: YoxOptions): Yox;
    use(plugin: YoxPlugin): void;
    nextTick(task: Function, context?: any): void;
    compile(template: string, stringify?: boolean): Function | string;
    directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
    transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
    component(name: string | Record<string, type.component>, component?: type.component): type.component | void;
    partial(name: string | Record<string, string>, partial?: string): Function | void;
    filter(name: string | Record<string, type.filter>, filter?: type.filter): type.filter | void;
};
declare type YoxClass = typeof Yox;
export interface YoxPlugin {
    version: string;
    install(Yox: YoxClass): void;
}
export interface PropRule {
    type: string | string[] | type.propType;
    value?: any | type.propValue;
    required?: boolean;
}
export interface DirectiveHooks {
    once?: true;
    bind: type.bind;
    unbind?: type.unbind;
}
export interface SpecialEventHooks {
    on: type.on;
    off: type.off;
}
export interface TransitionHooks {
    enter?: type.enter;
    leave?: type.leave;
}
export {};
//# sourceMappingURL=class.d.ts.map