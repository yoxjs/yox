declare const HOOK_BEFORE_CREATE = "beforeCreate";
declare const HOOK_AFTER_CREATE = "afterCreate";
declare const HOOK_BEFORE_MOUNT = "beforeMount";
declare const HOOK_AFTER_MOUNT = "afterMount";
declare const HOOK_BEFORE_UPDATE = "beforeUpdate";
declare const HOOK_AFTER_UPDATE = "afterUpdate";
declare const HOOK_BEFORE_DESTROY = "beforeDestroy";
declare const HOOK_AFTER_DESTROY = "afterDestroy";
declare const HOOK_BEFORE_ROUTE_ENTER = "beforeRouteEnter";
declare const HOOK_AFTER_ROUTE_ENTER = "afterRouteEnter";
declare const HOOK_BEFORE_ROUTE_UPDATE = "beforeRouteUpdate";
declare const HOOK_AFTER_ROUTE_UPDATE = "afterRouteUpdate";
declare const HOOK_BEFORE_ROUTE_LEAVE = "beforeRouteLeave";
declare const HOOK_AFTER_ROUTE_LEAVE = "afterRouteLeave";
export interface EmitterInterface {
	ns: boolean;
	listeners: Record<string, EmitterOptions[]>;
	nativeListeners?: Record<string, NativeListener>;
	fire(type: string | Namespace, args: any[] | void, filter?: (namespace: Namespace, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
	on(type: string, listener: Function | EmitterOptions): void;
	off(type?: string, listener?: Function): void;
	has(type: string, listener?: Function): boolean;
	parse(type: string): Namespace;
}
export interface CustomEventInterface {
	type: string;
	phase: number;
	ns?: Namespace;
	target?: YoxInterface;
	originalEvent?: CustomEventInterface | Event;
	isPrevented?: true;
	isStoped?: true;
	listener?: Function;
	preventDefault(): this;
	stopPropagation(): this;
	prevent(): this;
	stop(): this;
}
export interface NextTaskInterface {
	append(func: Function, context?: any): void;
	prepend(func: Function, context?: any): void;
	clear(): void;
	run(): void;
}
export interface YoxInterface {
	$options: ComponentOptions;
	$el?: HTMLElement;
	$vnode?: VNode;
	$model?: string;
	$root?: YoxInterface;
	$parent?: YoxInterface;
	$context?: YoxInterface;
	$children?: YoxInterface[];
	$refs?: Record<string, YoxInterface | HTMLElement>;
	get(keypath: string, defaultValue?: any): any;
	set(keypath: string | Data, value?: any): void;
	on(type: string | Record<string, Listener<this>>, listener?: Listener<this>): this;
	once(type: string | Record<string, Listener<this>>, listener?: Listener<this>): this;
	off(type?: string, listener?: Function): this;
	fire(type: string | CustomEventInterface, data?: Data | boolean, downward?: boolean): boolean;
	watch(keypath: string | Record<string, Watcher<this> | WatcherOptions<this>>, watcher?: Watcher<this> | WatcherOptions<this>, immediate?: boolean): this;
	unwatch(keypath?: string, watcher?: Watcher<this>): this;
	loadComponent(name: string, callback: ComponentCallback): void;
	createComponent(options: ComponentOptions, vnode: VNode): YoxInterface;
	directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
	transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
	component(name: string | Record<string, Component>, component?: Component): Component | void;
	partial(name: string | Record<string, string>, partial?: string): Function | void;
	filter(name: string | Record<string, Filter>, filter?: Filter): Filter | void;
	checkProp(key: string, value: any): void;
	forceUpdate(data?: Data): void;
	destroy(): void;
	nextTick(task: Function): void;
	toggle(keypath: string): boolean;
	increase(keypath: string, step?: number, max?: number): number | void;
	decrease(keypath: string, step?: number, min?: number): number | void;
	insert(keypath: string, item: any, index: number | boolean): true | void;
	append(keypath: string, item: any): true | void;
	prepend(keypath: string, item: any): true | void;
	removeAt(keypath: string, index: number): true | void;
	remove(keypath: string, item: any): true | void;
	copy<T>(data: T, deep?: boolean): T;
}
export interface DirectiveHooks {
	once?: true;
	bind: (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
	unbind?: (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
}
export interface SpecialEventHooks {
	on: (node: HTMLElement | Window | Document, listener: NativeListener) => void;
	off: (node: HTMLElement | Window | Document, listener: NativeListener) => void;
}
export interface TransitionHooks {
	enter?: (node: HTMLElement) => void;
	leave?: (node: HTMLElement, done: () => void) => void;
}
export interface Attribute {
	readonly name: string;
	readonly value: string;
}
export interface Property {
	readonly name: string;
	readonly value: any;
	readonly hint: PropertyHint;
}
export interface Directive extends Namespace {
	readonly modifier: string | void;
	readonly value?: string | number | boolean;
	readonly hooks: DirectiveHooks;
	readonly getter?: () => any | void;
	readonly handler?: Listener | void;
	readonly hint?: PropertyHint | void;
}
export interface VNode {
	data: Data;
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
	readonly props?: Data;
	readonly slots?: Record<string, VNode[]>;
	readonly nativeProps?: Record<string, Property>;
	readonly nativeAttrs?: Record<string, Attribute>;
	readonly directives?: Record<string, Directive>;
	readonly lazy?: Record<string, LazyValue>;
	readonly transition?: TransitionHooks;
	readonly ref?: string;
	readonly key?: string;
	readonly text?: string;
	readonly html?: string;
	readonly children?: VNode[];
}
export interface ComputedOptions {
	get: ComputedGetter;
	set?: ComputedSetter;
	cache?: boolean;
	sync?: boolean;
	deps?: string[];
}
export interface WatcherOptions<T = any> {
	watcher: Watcher<T>;
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
export declare type DataGenerator = (this: {
	get(keypath: string, defaultValue?: any): any;
}, options: ComponentOptions) => Data;
export declare type Accessors<T, V> = {
	[K in keyof T]: V;
};
export interface ComponentOptions<Computed = any, Watchers = any, Events = any, Methods = any> {
	name?: string;
	propTypes?: Record<string, PropRule>;
	el?: string | Node;
	data?: Data | DataGenerator;
	template?: string | Function;
	model?: string;
	props?: Data;
	root?: YoxInterface;
	parent?: YoxInterface;
	context?: YoxInterface;
	replace?: true;
	vnode?: VNode;
	slots?: Record<string, VNode[]>;
	computed?: Accessors<Computed, ComputedGetter | ComputedOptions>;
	watchers?: Accessors<Watchers, Watcher | WatcherOptions>;
	events?: Accessors<Events, Listener>;
	methods?: Methods;
	transitions?: Record<string, TransitionHooks>;
	components?: Record<string, ComponentOptions>;
	directives?: Record<string, DirectiveHooks>;
	partials?: Record<string, string>;
	filters?: Record<string, Filter>;
	extensions?: Data;
	[HOOK_BEFORE_CREATE]?: OptionsBeforeCreateHook;
	[HOOK_AFTER_CREATE]?: OptionsOtherHook;
	[HOOK_BEFORE_MOUNT]?: OptionsOtherHook;
	[HOOK_AFTER_MOUNT]?: OptionsOtherHook;
	[HOOK_BEFORE_UPDATE]?: OptionsOtherHook;
	[HOOK_AFTER_UPDATE]?: OptionsOtherHook;
	[HOOK_BEFORE_DESTROY]?: OptionsOtherHook;
	[HOOK_AFTER_DESTROY]?: OptionsOtherHook;
	[HOOK_BEFORE_ROUTE_ENTER]?: RouterBeforeHook;
	[HOOK_AFTER_ROUTE_ENTER]?: RouterAfterHook;
	[HOOK_BEFORE_ROUTE_UPDATE]?: RouterBeforeHook;
	[HOOK_AFTER_ROUTE_UPDATE]?: RouterAfterHook;
	[HOOK_BEFORE_ROUTE_LEAVE]?: RouterBeforeHook;
	[HOOK_AFTER_ROUTE_LEAVE]?: RouterAfterHook;
}
export interface Location {
	path: string;
	url?: string;
	params?: Data;
	query?: Data;
}
export interface RouteTarget {
	name?: string;
	path?: string;
	params?: Data;
	query?: Data;
}
export declare type Data = Record<string, any>;
export declare type LazyValue = number | true;
export declare type PropTypeFunction = (key: string, value: any) => void;
export declare type PropValueFunction = () => any;
export declare type PropertyHint = 1 | 2 | 3;
export declare type ComponentCallback = (options: ComponentOptions) => void;
export declare type ComponentLoader = (callback: ComponentCallback) => Promise<ComponentOptions> | void;
export declare type Component = ComponentOptions | ComponentLoader;
export declare type FilterFunction = (this: any, ...args: any) => string | number | boolean;
export declare type Filter = FilterFunction | Record<string, FilterFunction>;
export declare type Watcher<T = any> = (this: T, newValue: any, oldValue: any, keypath: string) => void;
export declare type Listener<T = any> = (this: T, event: CustomEventInterface, data?: Data) => false | void;
export declare type NativeListener = (event: CustomEventInterface | Event) => false | void;
export declare type ComputedGetter = () => any;
export declare type ComputedSetter = (value: any) => void;
export declare type OptionsBeforeCreateHook = (options: ComponentOptions) => void;
export declare type OptionsOtherHook = () => void;
export declare type RouterBeforeHook = (to: Location, from: Location | void, next: (value?: false | string | RouteTarget) => void) => void;
export declare type RouterAfterHook = (to: Location, from: Location | void) => void;
export declare type ValueHolder = {
	keypath?: string;
	value: any;
};
export declare type Task = {
	fn: Function;
	ctx?: any;
};
export declare type Namespace = {
	key: string;
	name: string;
	ns: string;
};
export declare type PropRule = {
	type: string | string[] | PropTypeFunction;
	value?: any | PropValueFunction;
	required?: boolean;
};
export interface DomApi {
	createElement(tag: string, isSvg?: boolean): Element;
	createText(text: string): Text;
	createComment(text: string): Comment;
	prop(node: HTMLElement, name: string, value?: string | number | boolean): string | number | boolean | void;
	removeProp(node: HTMLElement, name: string, hint?: PropertyHint): void;
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
	on(node: HTMLElement | Window | Document, type: string, listener: Listener, context?: any): void;
	off(node: HTMLElement | Window | Document, type: string, listener: Function): void;
	addSpecialEvent(type: string, hooks: SpecialEventHooks): void;
}
export interface ArrayApi {
	each<T>(array: T[], callback: (item: T, index: number) => boolean | void, reversed?: boolean): void;
	push<T>(array: T[], target: T | T[]): void;
	unshift<T>(array: T[], target: T | T[]): void;
	indexOf<T>(array: T[], target: T, strict?: boolean): number;
	last<T>(array: T[]): T | void;
	pop<T>(array: T[]): T | void;
	remove<T>(array: T[], target: T, strict?: boolean): number;
	has<T>(array: T[], target: T, strict?: boolean): boolean;
	toArray<T>(array: T[] | ArrayLike<T>): T[];
	toObject(array: any[], key?: string | null, value?: any): object;
	join(array: string[], separator: string): string;
	falsy(array: any): boolean;
}
export interface IsApi {
	func(value: any): boolean;
	array(value: any): boolean;
	object(value: any): boolean;
	string(value: any): boolean;
	number(value: any): boolean;
	boolean(value: any): boolean;
	numeric(value: any): boolean;
}
export interface LoggerApi {
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
export interface ObjectApi {
	keys(object: Data): string[];
	sort(object: Data, desc?: boolean): string[];
	each(object: Data, callback: (value: any, key: string) => boolean | void): void;
	clear(object: Data): void;
	extend(original: Data, object: Data): Data;
	merge(object1: Data | void, object2: Data | void): Data | void;
	copy(object: any, deep?: boolean): any;
	get(object: any, keypath: string): ValueHolder | undefined;
	set(object: Data, keypath: string, value: any, autofill?: boolean): void;
	has(object: Data, key: string | number): boolean;
	falsy(object: any): boolean;
}
export interface StringApi {
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
declare class CustomEvent implements CustomEventInterface {
	static PHASE_CURRENT: number;
	static PHASE_UPWARD: number;
	static PHASE_DOWNWARD: number;
	type: string;
	phase: number;
	ns?: Namespace;
	target?: YoxInterface;
	originalEvent?: CustomEventInterface | Event;
	isPrevented?: true;
	isStoped?: true;
	listener?: Function;
	/**
	 * 构造函数
	 *
	 * 可以传事件名称，也可以传原生事件对象
	 */
	constructor(type: string, originalEvent?: CustomEventInterface | Event);
	/**
	 * 阻止事件的默认行为
	 */
	preventDefault(): this;
	/**
	 * 停止事件广播
	 */
	stopPropagation(): this;
	prevent(): this;
	stop(): this;
}
declare class Emitter implements EmitterInterface {
	/**
	 * 是否开启命名空间
	 */
	ns: boolean;
	/**
	 * 已注册的事件监听
	 */
	listeners: Record<string, EmitterOptions[]>;
	/**
	 * 原生事件监听，一个事件对应一个 listener
	 */
	nativeListeners?: Record<string, NativeListener>;
	constructor(ns?: boolean);
	/**
	 * 发射事件
	 *
	 * @param type 事件名称或命名空间
	 * @param args 事件处理函数的参数列表
	 * @param filter 自定义过滤器
	 */
	fire(type: string | Namespace, args: any[] | void, filter?: (namespace: Namespace, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
	/**
	 * 注册监听
	 *
	 * @param type
	 * @param listener
	 */
	on(type: string, listener: Function | EmitterOptions): void;
	/**
	 * 取消监听
	 *
	 * @param type
	 * @param listener
	 */
	off(type?: string, listener?: Function): void;
	/**
	 * 是否已监听某个事件
	 *
	 * @param type
	 * @param listener
	 */
	has(type: string, listener?: Function): boolean;
	/**
	 * 把事件类型解析成命名空间格式
	 *
	 * @param type
	 */
	parse(type: string): Namespace;
}
declare class NextTask implements NextTaskInterface {
	/**
	 * 全局单例
	 */
	static shared(): NextTask;
	/**
	 * 异步队列
	 */
	tasks: Task[];
	constructor();
	/**
	 * 在队尾添加异步任务
	 */
	append(func: Function, context?: any): void;
	/**
	 * 在队首添加异步任务
	 */
	prepend(func: Function, context?: any): void;
	/**
	 * 清空异步队列
	 */
	clear(): void;
	/**
	 * 立即执行异步任务，并清空队列
	 */
	run(): void;
}
declare class Computed {
	static current?: Computed;
	keypath: string;
	value: any;
	deps: string[];
	cache: boolean;
	fixed: boolean;
	context: any;
	observer: Observer;
	getter: ComputedGetter;
	setter: ComputedSetter | void;
	watcher: Watcher;
	watcherOptions: WatcherOptions;
	unique: Record<string, boolean>;
	constructor(keypath: string, sync: boolean, cache: boolean, deps: string[], observer: Observer, getter: ComputedGetter, setter: ComputedSetter | void);
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
export interface AsyncChange {
	value: any;
	keypaths: string[];
}
declare class Observer {
	data: Data;
	context: any;
	nextTask: NextTask;
	computed?: Record<string, Computed>;
	reversedComputedKeys?: string[];
	syncEmitter: Emitter;
	asyncEmitter: Emitter;
	asyncChanges: Record<string, AsyncChange>;
	pending?: boolean;
	constructor(data?: Data, context?: any);
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
	set(keypath: string | Data, value?: any): void;
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
	addComputed(keypath: string, options: ComputedGetter | ComputedOptions): Computed | void;
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
	watch(keypath: string | Record<string, Watcher | WatcherOptions>, watcher?: Watcher | WatcherOptions, immediate?: boolean): void;
	/**
	 * 取消监听数据变化
	 *
	 * @param keypath
	 * @param watcher
	 */
	unwatch(keypath?: string, watcher?: Watcher): void;
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
export declare type YoxClass = typeof Yox;
export declare type EmitterClass = typeof Emitter;
export declare type CustomEventClass = typeof CustomEvent;
export declare type YoxPlugin = {
	install(Yox: YoxClass): void;
};
export default class Yox<Computed, Watchers, Events, Methods> implements YoxInterface {
	$options: ComponentOptions;
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
	$components?: Record<string, ComponentOptions>;
	$transitions?: Record<string, TransitionHooks>;
	$partials?: Record<string, Function>;
	$filters?: Record<string, Filter>;
	/**
	 * core 版本
	 */
	static version: string | undefined;
	/**
	 * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
	 */
	static is: IsApi;
	static dom: DomApi;
	static array: ArrayApi;
	static object: ObjectApi;
	static string: StringApi;
	static logger: LoggerApi;
	static Event: CustomEventClass;
	static Emitter: EmitterClass;
	/**
	 * 安装插件
	 *
	 * 插件必须暴露 install 方法
	 */
	static use(plugin: YoxPlugin): void;
	/**
	 * 定义组件对象
	 */
	static define<Computed, Watchers, Events, Methods>(options: ComponentOptions<Computed, Watchers, Events, Methods> & ThisType<Methods & YoxInterface>): ComponentOptions<Computed, Watchers, Events, Methods> & ThisType<Methods & YoxInterface>;
	/**
	 * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
	 */
	static nextTick(task: Function, context?: any): void;
	/**
	 * 编译模板，暴露出来是为了打包阶段的模板预编译
	 */
	static compile(template: string, stringify?: boolean): Function | string;
	/**
	 * 注册全局指令
	 */
	static directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
	/**
	 * 注册全局过渡动画
	 */
	static transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
	/**
	 * 注册全局组件
	 */
	static component(name: string | Record<string, Component>, component?: Component): Component | void;
	/**
	 * 注册全局子模板
	 */
	static partial(name: string | Record<string, string>, partial?: string): Function | void;
	/**
	 * 注册全局过滤器
	 */
	static filter(name: string | Record<string, Filter>, filter?: Filter): Filter | void;
	constructor(options?: ComponentOptions<Computed, Watchers, Events, Methods> & ThisType<Methods & YoxInterface>);
	/**
	 * 取值
	 */
	get(keypath: string, defaultValue?: any): any;
	/**
	 * 设值
	 */
	set(keypath: string | Data, value?: any): void;
	/**
	 * 监听事件，支持链式调用
	 */
	on(type: string | Record<string, Listener<this>>, listener?: Listener<this>): this;
	/**
	 * 监听一次事件，支持链式调用
	 */
	once(type: string | Record<string, Listener<this>>, listener?: Listener<this>): this;
	/**
	 * 取消监听事件，支持链式调用
	 */
	off(type?: string, listener?: Function): this;
	/**
	 * 发射事件
	 */
	fire(type: string | CustomEvent, data?: Data | boolean, downward?: boolean): boolean;
	/**
	 * 监听数据变化，支持链式调用
	 */
	watch(keypath: string | Record<string, Watcher<this> | WatcherOptions<this>>, watcher?: Watcher<this> | WatcherOptions<this>, immediate?: boolean): this;
	/**
	 * 取消监听数据变化，支持链式调用
	 */
	unwatch(keypath?: string, watcher?: Watcher): this;
	/**
	 * 加载组件，组件可以是同步或异步，最后会调用 callback
	 *
	 * @param name 组件名称
	 * @param callback 组件加载成功后的回调
	 */
	loadComponent(name: string, callback: ComponentCallback): void;
	/**
	 * 创建子组件
	 *
	 * @param options 组件配置
	 * @param vnode 虚拟节点
	 */
	createComponent(options: ComponentOptions, vnode: VNode): YoxInterface;
	/**
	 * 注册当前组件级别的指令
	 */
	directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
	/**
	 * 注册当前组件级别的过渡动画
	 */
	transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
	/**
	 * 注册当前组件级别的组件
	 */
	component(name: string | Record<string, Component>, component?: Component): Component | void;
	/**
	 * 注册当前组件级别的子模板
	 */
	partial(name: string | Record<string, string>, partial?: string): Function | void;
	/**
	 * 注册当前组件级别的过滤器
	 */
	filter(name: string | Record<string, Filter>, filter?: Filter): Filter | void;
	/**
	 * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
	 * 而你非常确定需要更新模板，强制刷新正是你需要的
	 */
	forceUpdate(data?: Data): void;
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

export {};
