/**
 * 为了压缩，定义的常量
 */
export declare const TRUE = true;
export declare const FALSE = false;
export declare const NULL: null;
export declare const UNDEFINED: undefined;
export declare const RAW_TRUE = "true";
export declare const RAW_FALSE = "false";
export declare const RAW_NULL = "null";
export declare const RAW_UNDEFINED = "undefined";
export declare const RAW_KEY = "key";
export declare const RAW_REF = "ref";
export declare const RAW_SLOT = "slot";
export declare const RAW_NAME = "name";
export declare const RAW_FILTER = "filter";
export declare const RAW_PARTIAL = "partial";
export declare const RAW_COMPONENT = "component";
export declare const RAW_DIRECTIVE = "directive";
export declare const RAW_TRANSITION = "transition";
export declare const RAW_THIS = "this";
export declare const RAW_VALUE = "value";
export declare const RAW_LENGTH = "length";
export declare const RAW_FUNCTION = "function";
export declare const RAW_TEMPLATE = "template";
export declare const RAW_WILDCARD = "*";
export declare const KEYPATH_PARENT = "..";
export declare const KEYPATH_CURRENT = "this";
export declare const RAW_MINUS_ONE = -1;
/**
 * Single instance for window in browser
 */
export declare const WINDOW: Window | undefined;
/**
 * Single instance for document in browser
 */
export declare const DOCUMENT: Document | undefined;
/**
 * tap 事件
 *
 * 非常有用的抽象事件，比如 pc 端是 click 事件，移动端是 touchend 事件
 *
 * 这样只需 on-tap="handler" 就可以完美兼容各端
 *
 * 框架未实现此事件，通过 Yox.dom.specialEvents 提供给外部扩展
 *
 */
export declare const EVENT_TAP = "tap";
/**
 * 点击事件
 */
export declare const EVENT_CLICK = "click";
/**
 * 输入事件
 */
export declare const EVENT_INPUT = "input";
/**
 * 变化事件
 */
export declare const EVENT_CHANGE = "change";
/**
 * 唯一内置的特殊事件：model
 */
export declare const EVENT_MODEL = "model";
/**
 * Single instance for noop function
 */
export declare const EMPTY_FUNCTION: () => void;
/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
export declare const EMPTY_OBJECT: Readonly<{}>;
/**
 * 空数组
 */
export declare const EMPTY_ARRAY: readonly never[];
/**
 * 空字符串
 */
export declare const EMPTY_STRING = "";
//# sourceMappingURL=env.d.ts.map