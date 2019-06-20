import * as config from '../../yox-config/src/config';
import { data, dataGenerator, bind, unbind, on, off, enter, leave, getter, setter, watcher, listener, filter, component, componentCallback, optionsBeforeCreateHook, optionsOtherHook, routerBeforeHook, routerAfterHook, API, PropRule, ComputedInterface, ObserverInterface, EmitterInterface, CustomEventInterface, ValueHolder, VNode } from './type';
declare type YoxClass = typeof YoxInterface;
interface arrayUtil {
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
interface isUtil {
    func(value: any): boolean;
    array(value: any): boolean;
    object(value: any): boolean;
    string(value: any): boolean;
    number(value: any): boolean;
    boolean(value: any): boolean;
    numeric(value: any): boolean;
}
interface loggerUtil {
    DEBUG: number;
    INFO: number;
    WARN: number;
    ERROR: number;
    FATAL: number;
    debug(msg: string, tag?: string): void;
    info(msg: string, tag?: string): void;
    warn(msg: string, tag?: string): void;
    error(msg: string, tag?: string): void;
    fatal(msg: string, tag?: string): void;
}
interface objectUtil {
    keys(object: data): string[];
    sort(object: data, desc?: boolean): string[];
    each(object: data, callback: (value: any, key: string) => boolean | void): void;
    clear(object: data): void;
    extend(original: data, object: data): data;
    merge(object1: data | void, object2: data | void): data | void;
    copy(object: any, deep?: boolean): any;
    get(object: any, keypath: string): ValueHolder | undefined;
    set(object: data, keypath: string, value: any, autofill?: boolean): void;
    has(object: data, key: string | number): boolean;
    falsy(object: any): boolean;
}
interface stringUtil {
    camelize(str: string): string;
    hyphenate(str: string): string;
    capitalize(str: string): string;
    trim(str: any): string;
    slice(str: string, start: number, end?: number): string;
    indexOf(str: string, part: string, start?: number): number;
    lastIndexOf(str: string, part: string, end?: number): number;
    startsWith(str: string, part: string): boolean;
    endsWith(str: string, part: string): boolean;
    charAt(str: string, index?: number): string;
    codeAt(str: string, index?: number): number;
    upper(str: string): string;
    lower(str: string): string;
    has(str: string, part: string): boolean;
    falsy(str: any): boolean;
}
declare global {
    interface ComputedOptions {
        get: getter;
        set?: setter;
        cache?: boolean;
        sync?: boolean;
        deps?: string[];
    }
    interface WatcherOptions {
        watcher: watcher;
        immediate?: boolean;
        sync?: boolean;
        once?: boolean;
    }
    interface YoxOptions {
        name?: string;
        propTypes?: Record<string, PropRule>;
        el?: string | Node;
        data?: data | dataGenerator;
        template?: string | Function;
        model?: string;
        props?: data;
        root?: YoxInterface;
        parent?: YoxInterface;
        context?: YoxInterface;
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
    interface YoxInterface {
        $options: YoxOptions;
        $emitter: EmitterInterface;
        $observer: ObserverInterface;
        $el?: HTMLElement;
        $vnode?: VNode;
        $model?: string;
        $root?: YoxInterface;
        $parent?: YoxInterface;
        $context?: YoxInterface;
        $children?: YoxInterface[];
        $refs?: Record<string, YoxInterface | HTMLElement>;
        addComputed(keypath: string, computed: getter | ComputedOptions): ComputedInterface | void;
        removeComputed(keypath: string): void;
        get(keypath: string, defaultValue?: any, depIgnore?: boolean): any;
        set(keypath: string | data, value?: any): void;
        on(type: string | Record<string, listener>, listener?: listener): YoxInterface;
        once(type: string | Record<string, listener>, listener?: listener): YoxInterface;
        off(type?: string, listener?: listener): YoxInterface;
        fire(type: string | CustomEventInterface, data?: data | boolean, downward?: boolean): boolean;
        watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): YoxInterface;
        unwatch(keypath?: string, watcher?: watcher): YoxInterface;
        loadComponent(name: string, callback: componentCallback): void;
        createComponent(options: YoxOptions, vnode: VNode): YoxInterface;
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
    const YoxInterface: {
        prototype: YoxInterface;
        dom: API;
        is: isUtil;
        array: arrayUtil;
        object: objectUtil;
        string: stringUtil;
        logger: loggerUtil;
        Emitter: typeof EmitterInterface;
        Event: typeof CustomEventInterface;
        new (options?: YoxOptions): YoxInterface;
        use(plugin: YoxPlugin): void;
        nextTick(task: Function, context?: any): void;
        compile(template: string, stringify?: boolean): Function | string;
        directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
        transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
        component(name: string | Record<string, component>, component?: component): component | void;
        partial(name: string | Record<string, string>, partial?: string): Function | void;
        filter(name: string | Record<string, filter>, filter?: filter): filter | void;
    };
    interface YoxPlugin {
        version: string;
        install(Yox: YoxClass): void;
    }
    interface DirectiveHooks {
        once?: true;
        bind: bind;
        unbind?: unbind;
    }
    interface SpecialEventHooks {
        on: on;
        off: off;
    }
    interface TransitionHooks {
        enter?: enter;
        leave?: leave;
    }
}
export {};
//# sourceMappingURL=global.d.ts.map