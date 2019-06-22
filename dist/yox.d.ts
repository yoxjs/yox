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
export declare type watcher = (newValue: any, oldValue: any, keypath: string) => void;
export declare type listener = (event: CustomEventInterface, data?: data) => false | void;
export declare type nativeListener = (event: CustomEventInterface | Event) => false | void;
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
export interface EmitterInterface {
	ns: boolean;
	listeners: Record<string, EmitterOptions[]>;
	nativeListeners?: Record<string, nativeListener>;
	fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
	on(type: string, listener?: listener | EmitterOptions): void;
	off(type?: string, listener?: listener): void;
	has(type: string, listener?: listener): boolean;
}
declare var EmitterInterface: {
	prototype: EmitterInterface;
	new (ns?: boolean): EmitterInterface;
};
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
declare var CustomEventInterface: {
	prototype: CustomEventInterface;
	PHASE_CURRENT: number;
	PHASE_UPWARD: number;
	PHASE_DOWNWARD: number;
	new (type: string, originalEvent?: CustomEventInterface | Event): CustomEventInterface;
};
export interface YoxOptions {
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
	[HOOK_BEFORE_CREATE]?: optionsBeforeCreateHook;
	[HOOK_AFTER_CREATE]?: optionsOtherHook;
	[HOOK_BEFORE_MOUNT]?: optionsOtherHook;
	[HOOK_AFTER_MOUNT]?: optionsOtherHook;
	[HOOK_BEFORE_UPDATE]?: optionsOtherHook;
	[HOOK_AFTER_UPDATE]?: optionsOtherHook;
	[HOOK_BEFORE_DESTROY]?: optionsOtherHook;
	[HOOK_AFTER_DESTROY]?: optionsOtherHook;
	[HOOK_BEFORE_ROUTE_ENTER]?: routerBeforeHook;
	[HOOK_AFTER_ROUTE_ENTER]?: routerAfterHook;
	[HOOK_BEFORE_ROUTE_UPDATE]?: routerBeforeHook;
	[HOOK_AFTER_ROUTE_UPDATE]?: routerAfterHook;
	[HOOK_BEFORE_ROUTE_LEAVE]?: routerBeforeHook;
	[HOOK_AFTER_ROUTE_LEAVE]?: routerAfterHook;
}
export interface YoxInterface {
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
declare const YoxInterface: {
	prototype: YoxInterface;
	is: IsUtil;
	dom: DomUtil;
	array: ArrayUtil;
	object: ObjectUtil;
	string: StringUtil;
	logger: LoggerUtil;
	Emitter: EmitterClass;
	Event: CustomEventClass;
	new (options?: YoxOptions): YoxInterface;
	use(plugin: YoxPlugin): void;
	create(options?: YoxOptions): YoxOptions;
	nextTick(task: Function, context?: any): void;
	compile(template: string, stringify?: boolean): Function | string;
	directive(name: string | Record<string, DirectiveHooks>, directive?: DirectiveHooks): DirectiveHooks | void;
	transition(name: string | Record<string, TransitionHooks>, transition?: TransitionHooks): TransitionHooks | void;
	component(name: string | Record<string, component>, component?: component): component | void;
	partial(name: string | Record<string, string>, partial?: string): Function | void;
	filter(name: string | Record<string, filter>, filter?: filter): filter | void;
};
export interface YoxPlugin {
	version: string;
	install(Yox: YoxClass): void;
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
export declare type YoxClass = typeof YoxInterface;
export declare type EmitterClass = typeof EmitterInterface;
export declare type CustomEventClass = typeof CustomEventInterface;
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
export declare type enter = (node: HTMLElement) => void;
export declare type leave = (node: HTMLElement, done: () => void) => void;
export declare type bind = (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
export declare type unbind = (node: HTMLElement | YoxInterface, directive: Directive, vnode: VNode) => void;
export declare type on = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type off = (node: HTMLElement | Window | Document, listener: nativeListener) => void;
export declare type componentCallback = (options: YoxOptions) => void;
export declare type componentLoader = (callback: componentCallback) => Promise<YoxOptions> | void;
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
export interface DomUtil {
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
export interface ArrayUtil {
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
export interface IsUtil {
	func(value: any): boolean;
	array(value: any): boolean;
	object(value: any): boolean;
	string(value: any): boolean;
	number(value: any): boolean;
	boolean(value: any): boolean;
	numeric(value: any): boolean;
}
export interface LoggerUtil {
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
export interface ObjectUtil {
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
export interface StringUtil {
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
declare var ObserverInterface: {
	prototype: ObserverInterface;
	new (data?: data, context?: any): ObserverInterface;
};
export interface ComputedInterface {
	get(force?: boolean): any;
	set(value: any): void;
}
declare var ComputedInterface: {
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
declare class CustomEvent implements CustomEventInterface {
	static PHASE_CURRENT: number;
	static PHASE_UPWARD: number;
	static PHASE_DOWNWARD: number;
	type: string;
	phase: number;
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
	preventDefault(): CustomEventInterface;
	/**
	 * 停止事件广播
	 */
	stopPropagation(): CustomEventInterface;
	prevent(): CustomEventInterface;
	stop(): CustomEventInterface;
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
	nativeListeners?: Record<string, nativeListener>;
	constructor(ns?: boolean);
	/**
	 * 发射事件
	 *
	 * @param bullet 事件或事件名称
	 * @param data 事件数据
	 */
	fire(type: string, args: any[] | void, filter?: (type: string, args: any[] | void, options: EmitterOptions) => boolean | void): boolean;
	/**
	 * 注册监听
	 *
	 * @param type
	 * @param listener
	 */
	on(type: string, listener?: Function | EmitterOptions): void;
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
}
declare class Computed implements ComputedInterface {
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
export interface AsyncChange {
	value: any;
	keypaths: string[];
}
declare class Observer implements ObserverInterface {
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
	static is: IsUtil;
	static dom: DomUtil;
	static array: ArrayUtil;
	static object: ObjectUtil;
	static string: StringUtil;
	static logger: LoggerUtil;
	static Event: CustomEventClass;
	static Emitter: EmitterClass;
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
	static component(name: string | Record<string, component>, component?: component): component | void;
	/**
	 * 注册全局子模板
	 */
	static partial(name: string | Record<string, string>, partial?: string): Function | void;
	/**
	 * 注册全局过滤器
	 */
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
	 * 监听事件，支持链式调用
	 */
	on(type: string | Record<string, listener>, listener?: listener): YoxInterface;
	/**
	 * 监听一次事件，支持链式调用
	 */
	once(type: string | Record<string, listener>, listener?: listener): YoxInterface;
	/**
	 * 取消监听事件，支持链式调用
	 */
	off(type?: string, listener?: listener): YoxInterface;
	/**
	 * 发射事件
	 */
	fire(type: string | CustomEvent, data?: data | boolean, downward?: boolean): boolean;
	/**
	 * 监听数据变化，支持链式调用
	 */
	watch(keypath: string | Record<string, watcher | WatcherOptions>, watcher?: watcher | WatcherOptions, immediate?: boolean): YoxInterface;
	/**
	 * 取消监听数据变化，支持链式调用
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
	component(name: string | Record<string, component>, component?: component): component | void;
	/**
	 * 注册当前组件级别的子模板
	 */
	partial(name: string | Record<string, string>, partial?: string): Function | void;
	/**
	 * 注册当前组件级别的过滤器
	 */
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

export {};
