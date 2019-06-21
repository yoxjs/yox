import { WatcherOptions, ComputedOptions, YoxOptions, YoxInterface, DirectiveHooks, TransitionHooks, SpecialEventHooks } from './global';
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
export declare type listener = (event: CustomEventInterface, data?: data) => false | void;
export declare type nativeListener = (event: CustomEventInterface | Event) => false | void;
export declare type enter = (node: HTMLElement) => void;
export declare type leave = (node: HTMLElement, done: () => void) => void;
export declare type bind = (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
export declare type unbind = (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
export declare type on = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type off = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type componentCallback = (options: YoxOptions) => void;
export declare type componentLoader = (callback: componentCallback) => void;
export declare type component = YoxOptions | componentLoader;
export declare type optionsBeforeCreateHook = (options: YoxOptions) => void;
export declare type optionsOtherHook = () => void;
export declare type routerBeforeHook = (to: Location, from: Location | void, next: (value?: false | string | RouteTarget) => void) => void;
export declare type routerAfterHook = (to: Location, from: Location | void) => void;
export interface ValueHolder {
    keypath?: string;
    value: any;
}
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
    parent?: YoxInterface;
    slot?: string;
    readonly keypath: string;
    readonly context: YoxInterface;
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
export interface API {
    createElement(tag: string, isSvg?: boolean): Element;
    createText(text: string): Text;
    createComment(text: string): Comment;
    prop(node: HTMLElement, name: string, value?: string | number | boolean): string | number | boolean | void;
    removeProp(node: HTMLElement, name: string, hint?: hint): void;
    attr(node: HTMLElement, name: string, value?: string): string | void;
    removeAttr(node: HTMLElement, name: string): void;
    before(parentNode: Node, node: Node, beforeNode: Node): void;
    append(parentNode: Node, node: Node): void;
    replace(parentNode: Node, node: Node, oldNode: Node): void;
    remove(parentNode: Node, node: Node): void;
    parent(node: Node): Node | void;
    next(node: Node): Node | void;
    find(selector: string): Element | void;
    tag(node: Node): string | void;
    text(node: Node, text?: string, isStyle?: boolean, isOption?: boolean): string | void;
    html(node: Element, html?: string, isStyle?: boolean, isOption?: boolean): string | void;
    addClass(node: HTMLElement, className: string): void;
    removeClass(node: HTMLElement, className: string): void;
    on(node: HTMLElement | Window | Document, type: string, listener: listener): void;
    off(node: HTMLElement | Window | Document, type: string, listener: listener): void;
    addSpecialEvent(type: string, hooks: SpecialEventHooks): void;
}
export interface Task {
    fn: Function;
    ctx?: any;
}
export interface NextTaskInterface {
    append(func: Function, context?: any): void;
    prepend(func: Function, context?: any): void;
    clear(): void;
    run(): void;
}
export interface EmitterOptions extends Task {
    ns?: string;
    num?: number;
    max?: number;
    count?: number;
}
export interface CustomEventInterface {
    type: string;
    phase: number;
    target?: YoxInterface;
    originalEvent?: CustomEventInterface | Event;
    isPrevented?: true;
    isStoped?: true;
    listener?: Function;
    preventDefault(): CustomEventInterface;
    stopPropagation(): CustomEventInterface;
    prevent(): CustomEventInterface;
    stop(): CustomEventInterface;
}
export declare var CustomEventInterface: {
    prototype: CustomEventInterface;
    PHASE_CURRENT: number;
    PHASE_UPWARD: number;
    PHASE_DOWNWARD: number;
    new (type: string, originalEvent?: CustomEventInterface | Event): CustomEventInterface;
};
export interface EmitterInterface {
    ns: boolean;
    listeners: Record<string, EmitterOptions[]>;
    nativeListeners?: Record<string, nativeListener>;
    fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
    on(type: string, listener?: Function | EmitterOptions): void;
    off(type?: string, listener?: Function): void;
    has(type: string, listener?: Function): boolean;
}
export declare var EmitterInterface: {
    prototype: EmitterInterface;
    new (ns?: boolean): EmitterInterface;
};
export interface ObserverInterface {
    data: data;
    context: any;
    nextTask: NextTaskInterface;
    addComputed(keypath: string, options: getter | ComputedOptions): ComputedInterface | void;
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
export declare var ObserverInterface: {
    prototype: ObserverInterface;
    new (data?: data, context?: any): ObserverInterface;
};
export interface ComputedInterface {
    get(force?: boolean): any;
    set(value: any): void;
}
export declare var ComputedInterface: {
    prototype: ComputedInterface;
    current?: ComputedInterface;
    build(keypath: string, observer: ObserverInterface, options: any): ComputedInterface | void;
    new (keypath: string, sync: boolean, cache: boolean, deps: string[], observer: ObserverInterface, getter: getter, setter: setter | void): ComputedInterface;
};
export interface PropRule {
    type: string | string[] | propType;
    value?: any | propValue;
    required?: boolean;
}
export interface Location {
    path: string;
    url?: string;
    params?: data;
    query?: data;
}
export interface RouteTarget {
    name?: string;
    path?: string;
    params?: data;
    query?: data;
}
//# sourceMappingURL=type.d.ts.map