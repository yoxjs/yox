import * as config from '../../yox-config/src/config';
import Location from './router/Location';
import RouteTarget from './router/RouteTarget';
import API from './util/API';
import isUtil from './util/is';
import arrayUtil from './util/array';
import objectUtil from './util/object';
import stringUtil from './util/string';
import loggerUtil from './util/logger';
export declare type hint = 1 | 2 | 3;
export declare type lazy = number | true;
export declare type propType = (key: string, value: any) => void;
export declare type propValue = () => any;
export declare type data = Record<string, any>;
export declare type dataGenerator = (options: YoxOptions) => data;
export declare type getter = () => any;
export declare type setter = (value: any) => void;
export declare type formater = (...args: any) => string | number | boolean;
export declare type filter = formater | Record<string, formater>;
export declare type watcher = (newValue: any, oldValue: any, keypath: string) => void;
export declare type listener = (event: CustomEvent, data?: data) => false | void;
export declare type nativeListener = (event: CustomEvent | Event) => false | void;
export declare type enter = (node: HTMLElement) => void;
export declare type leave = (node: HTMLElement, done: () => void) => void;
export declare type bind = (node: HTMLElement | Yox, directive: Directive, vnode: VNode) => void;
export declare type unbind = (node: HTMLElement | Yox, directive: Directive, vnode: VNode) => void;
export declare type on = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type off = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type componentCallback = (options: YoxOptions) => void;
export declare type componentLoader = (callback: componentCallback) => void;
export declare type component = YoxOptions | componentLoader;
export declare type optionsBeforeCreateHook = (options: YoxOptions) => void;
export declare type optionsOtherHook = () => void;
export declare type routerBeforeHook = (to: Location, from: Location | void, next: (value?: false | string | RouteTarget) => void) => void;
export declare type routerAfterHook = (to: Location, from: Location | void) => void;
export declare type valueHolder = {
    keypath?: string;
    value: any;
};
export interface Attribute {
    readonly name: string;
    readonly value: string;
}
export interface Property {
    readonly name: string;
    readonly value: any;
    readonly hint: hint;
}
export interface Directive {
    readonly ns: string;
    readonly name: string;
    readonly key: string;
    readonly value?: string | number | boolean;
    readonly hooks: DirectiveHooks;
    readonly getter?: getter | void;
    readonly handler?: listener | void;
    readonly binding?: string | void;
    readonly hint?: hint | void;
}
export interface VNode {
    data: data;
    node: Node;
    parent?: Yox;
    slot?: string;
    readonly keypath: string;
    readonly context: Yox;
    readonly tag?: string | void;
    readonly isComponent?: boolean;
    readonly isComment?: boolean;
    readonly isText?: boolean;
    readonly isSvg?: boolean;
    readonly isStyle?: boolean;
    readonly isOption?: boolean;
    readonly isStatic?: boolean;
    readonly props?: data;
    readonly slots?: Record<string, VNode[]>;
    readonly nativeProps?: Record<string, Property>;
    readonly nativeAttrs?: Record<string, Attribute>;
    readonly directives?: Record<string, Directive>;
    readonly lazy?: Record<string, lazy>;
    readonly transition?: TransitionHooks;
    readonly ref?: string;
    readonly key?: string;
    readonly text?: string;
    readonly html?: string;
    readonly children?: VNode[];
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
    get: getter;
    set?: setter;
    cache?: boolean;
    sync?: boolean;
    deps?: string[];
}
export interface WatcherOptions {
    watcher: watcher;
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
    data?: data | dataGenerator;
    template?: string | Function;
    model?: string;
    props?: data;
    root?: Yox;
    parent?: Yox;
    context?: Yox;
    replace?: true;
    vnode?: VNode;
    slots?: Record<string, VNode[]>;
    computed?: Record<string, getter | ComputedOptions>;
    watchers?: Record<string, watcher | WatcherOptions>;
    transitions?: Record<string, TransitionHooks>;
    components?: Record<string, YoxOptions>;
    directives?: Record<string, DirectiveHooks>;
    partials?: Record<string, string>;
    filters?: Record<string, filter>;
    events?: Record<string, listener>;
    methods?: Record<string, Function>;
    extensions?: data;
    [config.HOOK_BEFORE_CREATE]?: optionsBeforeCreateHook;
    [config.HOOK_AFTER_CREATE]?: optionsOtherHook;
    [config.HOOK_BEFORE_MOUNT]?: optionsOtherHook;
    [config.HOOK_AFTER_MOUNT]?: optionsOtherHook;
    [config.HOOK_BEFORE_UPDATE]?: optionsOtherHook;
    [config.HOOK_AFTER_UPDATE]?: optionsOtherHook;
    [config.HOOK_BEFORE_DESTROY]?: optionsOtherHook;
    [config.HOOK_AFTER_DESTROY]?: optionsOtherHook;
    [config.HOOK_BEFORE_ROUTE_ENTER]?: routerBeforeHook;
    [config.HOOK_AFTER_ROUTE_ENTER]?: routerAfterHook;
    [config.HOOK_BEFORE_ROUTE_UPDATE]?: routerBeforeHook;
    [config.HOOK_AFTER_ROUTE_UPDATE]?: routerAfterHook;
    [config.HOOK_BEFORE_ROUTE_LEAVE]?: routerBeforeHook;
    [config.HOOK_AFTER_ROUTE_LEAVE]?: routerAfterHook;
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
    nativeListeners?: Record<string, nativeListener>;
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
    data: data;
    context: any;
    nextTask: NextTask;
    addComputed(keypath: string, options: getter | ComputedOptions): Computed | void;
    removeComputed(keypath: string): void;
    diff(keypath: string, newValue: any, oldValue: any): void;
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    set(keypath: string | data, value?: any): void;
    watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): void;
    unwatch(keypath?: string, watcher?: watcher): void;
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
    new (data?: data, context?: any): Observer;
};
export interface Computed {
    get(force?: boolean): any;
    set(value: any): void;
}
export declare var Computed: {
    prototype: Computed;
    current?: Computed;
    build(keypath: string, observer: Observer, options: any): Computed | void;
    new (keypath: string, sync: boolean, cache: boolean, deps: string[], observer: Observer, getter: getter, setter: setter | void): Computed;
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
    addComputed(keypath: string, computed: getter | ComputedOptions): Computed | void;
    removeComputed(keypath: string): void;
    get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
    set(keypath: string | data, value?: any): void;
    on(type: string | Record<string, listener>, listener?: listener): Yox;
    once(type: string | Record<string, listener>, listener?: listener): Yox;
    off(type?: string, listener?: listener): Yox;
    fire(type: string | CustomEvent, data?: data | boolean, downward?: boolean): boolean;
    watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): Yox;
    unwatch(keypath?: string, watcher?: watcher): Yox;
    loadComponent(name: string, callback: componentCallback): void;
    createComponent(options: YoxOptions, vnode: VNode): Yox;
    directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
    transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
    component(name: string | Record<string, component>, component?: component): component | void;
    partial(name: string | Record<string, string>, partial?: string): Function | void;
    filter(name: string | Record<string, filter>, filter?: filter): filter | void;
    checkProps(props: data): void;
    checkProp(key: string, value: any): void;
    forceUpdate(data?: data): void;
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
    component(name: string | Record<string, component>, component?: component): component | void;
    partial(name: string | Record<string, string>, partial?: string): Function | void;
    filter(name: string | Record<string, filter>, filter?: filter): filter | void;
};
declare type YoxClass = typeof Yox;
export interface YoxPlugin {
    version: string;
    install(Yox: YoxClass): void;
}
export interface PropRule {
    type: string | string[] | propType;
    value?: any | propValue;
    required?: boolean;
}
export interface DirectiveHooks {
    once?: true;
    bind: bind;
    unbind?: unbind;
}
export interface SpecialEventHooks {
    on: on;
    off: off;
}
export interface TransitionHooks {
    enter?: enter;
    leave?: leave;
}
export {};
//# sourceMappingURL=type.d.ts.map