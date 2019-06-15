/**
 * 为了压缩，定义的常量
 */
export const TRUE = true;
export const FALSE = false;
export const NULL = null;
export const UNDEFINED = void 0;
export const RAW_TRUE = 'true';
export const RAW_FALSE = 'false';
export const RAW_NULL = 'null';
export const RAW_UNDEFINED = 'undefined';
export const RAW_KEY = 'key';
export const RAW_REF = 'ref';
export const RAW_SLOT = 'slot';
export const RAW_NAME = 'name';
export const RAW_FILTER = 'filter';
export const RAW_PARTIAL = 'partial';
export const RAW_COMPONENT = 'component';
export const RAW_DIRECTIVE = 'directive';
export const RAW_TRANSITION = 'transition';
export const RAW_THIS = 'this';
export const RAW_VALUE = 'value';
export const RAW_LENGTH = 'length';
export const RAW_FUNCTION = 'function';
export const RAW_TEMPLATE = 'template';
export const RAW_WILDCARD = '*';
export const KEYPATH_PARENT = '..';
export const KEYPATH_CURRENT = RAW_THIS;
export const RAW_MINUS_ONE = -1;
/**
 * Single instance for window in browser
 */
export const WINDOW = typeof window !== RAW_UNDEFINED ? window : UNDEFINED;
/**
 * Single instance for document in browser
 */
export const DOCUMENT = typeof document !== RAW_UNDEFINED ? document : UNDEFINED;
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
export const EVENT_TAP = 'tap';
/**
 * 点击事件
 */
export const EVENT_CLICK = 'click';
/**
 * 输入事件
 */
export const EVENT_INPUT = 'input';
/**
 * 变化事件
 */
export const EVENT_CHANGE = 'change';
/**
 * 唯一内置的特殊事件：model
 */
export const EVENT_MODEL = 'model';
/**
 * Single instance for noop function
 */
export const EMPTY_FUNCTION = function () {
    /** yox */
};
/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
export const EMPTY_OBJECT = Object.freeze({});
/**
 * 空数组
 */
export const EMPTY_ARRAY = Object.freeze([]);
/**
 * 空字符串
 */
export const EMPTY_STRING = '';
