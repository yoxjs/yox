/**
 * yox.js v1.0.0-alpha.89
 * (c) 2017-2019 musicode
 * Released under the MIT License.
 */

const SYNTAX_IF = '#if';
const SYNTAX_ELSE = 'else';
const SYNTAX_ELSE_IF = 'else if';
const SYNTAX_EACH = '#each';
const SYNTAX_PARTIAL = '#partial';
const SYNTAX_IMPORT = '>';
const SYNTAX_SPREAD = '...';
const SYNTAX_COMMENT = /^!\s/;
const SLOT_DATA_PREFIX = '$slot_';
const SLOT_NAME_DEFAULT = 'children';
const HINT_STRING = 1;
const HINT_NUMBER = 2;
const HINT_BOOLEAN = 3;
const DIRECTIVE_ON = 'on';
const DIRECTIVE_LAZY = 'lazy';
const DIRECTIVE_MODEL = 'model';
const DIRECTIVE_EVENT = 'event';
const DIRECTIVE_BINDING = 'binding';
const DIRECTIVE_CUSTOM = 'o';
const MODIFER_NATIVE = 'native';
const MODEL_PROP_DEFAULT = 'value';
const NAMESPACE_HOOK = '.hook';
const HOOK_BEFORE_CREATE = 'beforeCreate';
const HOOK_AFTER_CREATE = 'afterCreate';
const HOOK_BEFORE_MOUNT = 'beforeMount';
const HOOK_AFTER_MOUNT = 'afterMount';
const HOOK_BEFORE_UPDATE = 'beforeUpdate';
const HOOK_AFTER_UPDATE = 'afterUpdate';
const HOOK_BEFORE_DESTROY = 'beforeDestroy';
const HOOK_AFTER_DESTROY = 'afterDestroy';

/**
 * 为了压缩，定义的常量
 */
const TRUE = true;
const FALSE = false;
const NULL = null;
const UNDEFINED = void 0;
const MINUS_ONE = -1;
const RAW_TRUE = 'true';
const RAW_FALSE = 'false';
const RAW_NULL = 'null';
const RAW_UNDEFINED = 'undefined';
const RAW_KEY = 'key';
const RAW_REF = 'ref';
const RAW_SLOT = 'slot';
const RAW_NAME = 'name';
const RAW_FILTER = 'filter';
const RAW_PARTIAL = 'partial';
const RAW_COMPONENT = 'component';
const RAW_DIRECTIVE = 'directive';
const RAW_TRANSITION = 'transition';
const RAW_THIS = 'this';
const RAW_VALUE = 'value';
const RAW_LENGTH = 'length';
const RAW_FUNCTION = 'function';
const RAW_TEMPLATE = 'template';
const RAW_WILDCARD = '*';
const RAW_DOT = '.';
const KEYPATH_PARENT = '..';
const KEYPATH_CURRENT = RAW_THIS;
/**
 * Single instance for window in browser
 */
const WINDOW = typeof window !== RAW_UNDEFINED ? window : UNDEFINED;
/**
 * Single instance for document in browser
 */
const DOCUMENT = typeof document !== RAW_UNDEFINED ? document : UNDEFINED;
/**
 * Single instance for global in nodejs or browser
 */
const GLOBAL = typeof global !== RAW_UNDEFINED ? global : WINDOW;
/**
 * tap 事件
 *
 * 非常有用的抽象事件，比如 pc 端是 click 事件，移动端是 touchend 事件
 *
 * 这样只需 on-tap="handler" 就可以完美兼容各端
 *
 * 框架未实现此事件，通过 Yox.dom.addSpecialEvent 提供给外部扩展
 *
 */
const EVENT_TAP = 'tap';
/**
 * 点击事件
 */
const EVENT_CLICK = 'click';
/**
 * 输入事件
 */
const EVENT_INPUT = 'input';
/**
 * 变化事件
 */
const EVENT_CHANGE = 'change';
/**
 * 唯一内置的特殊事件：model
 */
const EVENT_MODEL = 'model';
/**
 * Single instance for noop function
 */
const EMPTY_FUNCTION = function () {
    /** yox */
};
/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
const EMPTY_OBJECT = Object.freeze({});
/**
 * 空数组
 */
const EMPTY_ARRAY = Object.freeze([]);
/**
 * 空字符串
 */
const EMPTY_STRING = '';

function isDef (target) {
    return target !== UNDEFINED;
}

function isUndef (target) {
    return target === UNDEFINED;
}

/**
 * Check if value is a function.
 *
 * @param value
 * @return
 */
function func(value) {
    return typeof value === RAW_FUNCTION;
}
/**
 * Check if value is an array.
 *
 * @param value
 * @return
 */
function array(value) {
    return Array.isArray(value);
}
/**
 * Check if value is an object.
 *
 * @param value
 * @return
 */
function object(value) {
    // 低版本 IE 会把 null 当作 object
    return value !== NULL && typeof value === 'object';
}
/**
 * Check if value is a string.
 *
 * @param value
 * @return
 */
function string(value) {
    return typeof value === 'string';
}
/**
 * Check if value is a number.
 *
 * @param value
 * @return
 */
function number(value) {
    return typeof value === 'number';
}
/**
 * Check if value is boolean.
 *
 * @param value
 * @return
 */
function boolean(value) {
    return typeof value === 'boolean';
}
/**
 * Check if value is numeric.
 *
 * @param value
 * @return
 */
function numeric(value) {
    return number(value)
        || (string(value) && !isNaN(parseFloat(value)) && isFinite(value));
}

var is = /*#__PURE__*/Object.freeze({
  func: func,
  array: array,
  object: object,
  string: string,
  number: number,
  boolean: boolean,
  numeric: numeric
});

/**
 * 任性地执行一个函数，不管它有没有、是不是
 *
 * @param fn 调用的函数
 * @param context 执行函数时的 this 指向
 * @param args 调用函数的参数，多参数时传入数组
 * @return 调用函数的返回值
 */
function execute (fn, context, args) {
    if (func(fn)) {
        return array(args)
            ? fn.apply(context, args)
            : isDef(context)
                ? fn.call(context, args)
                : isDef(args)
                    ? fn(args)
                    : fn();
    }
}

class CustomEvent {
    /**
     * 构造函数
     *
     * 可以传事件名称，也可以传原生事件对象
     */
    constructor(type, originalEvent) {
        this.type = type;
        this.phase = CustomEvent.PHASE_CURRENT;
        if (originalEvent) {
            this.originalEvent = originalEvent;
        }
    }
    /**
     * 阻止事件的默认行为
     */
    preventDefault() {
        const instance = this;
        if (!instance.isPrevented) {
            const { originalEvent } = instance;
            if (originalEvent) {
                originalEvent.preventDefault();
            }
            instance.isPrevented = TRUE;
        }
        return instance;
    }
    /**
     * 停止事件广播
     */
    stopPropagation() {
        const instance = this;
        if (!instance.isStoped) {
            const { originalEvent } = instance;
            if (originalEvent) {
                originalEvent.stopPropagation();
            }
            instance.isStoped = TRUE;
        }
        return instance;
    }
    prevent() {
        return this.preventDefault();
    }
    stop() {
        return this.stopPropagation();
    }
}
CustomEvent.PHASE_CURRENT = 0;
CustomEvent.PHASE_UPWARD = 1;
CustomEvent.PHASE_DOWNWARD = MINUS_ONE;

/**
 * 遍历数组
 *
 * @param array
 * @param callback 返回 false 可停止遍历
 * @param reversed 是否逆序遍历
 */
function each(array, callback, reversed) {
    const { length } = array;
    if (length) {
        if (reversed) {
            for (let i = length - 1; i >= 0; i--) {
                if (callback(array[i], i) === FALSE) {
                    break;
                }
            }
        }
        else {
            for (let i = 0; i < length; i++) {
                if (callback(array[i], i) === FALSE) {
                    break;
                }
            }
        }
    }
}
function nativePush(array, item) {
    array[array.length] = item;
}
function nativeUnshift(array, item) {
    array.unshift(item);
}
/**
 * 添加
 *
 * @param array
 * @param value
 * @param action
 */
function addItem(array$1, value, action) {
    if (array(value)) {
        each(value, function (item) {
            action(array$1, item);
        });
    }
    else {
        action(array$1, value);
    }
}
/**
 * 往后加
 *
 * @param array
 * @param target
 */
function push(array, target) {
    addItem(array, target, nativePush);
}
/**
 * 往前加
 *
 * @param array
 * @param target
 */
function unshift(array, target) {
    addItem(array, target, nativeUnshift);
}
/**
 * 数组项在数组中的位置
 *
 * @param array 数组
 * @param target 数组项
 * @param strict 是否全等判断，默认是全等
 * @return 如果未找到，返回 -1
 */
function indexOf(array, target, strict) {
    let result = MINUS_ONE;
    each(array, function (item, index) {
        if (strict === FALSE ? item == target : item === target) {
            result = index;
            return FALSE;
        }
    });
    return result;
}
/**
 * 获取数组最后一项
 *
 * @param array 数组
 * @return
 */
function last(array) {
    const { length } = array;
    if (length > 0) {
        return array[length - 1];
    }
}
/**
 * 弹出数组最后一项
 *
 * 项目里用的太多，仅用于节省字符...
 *
 * @param array 数组
 * @return 弹出的数组项
 */
function pop(array) {
    const { length } = array;
    if (length > 0) {
        return array.pop();
    }
}
/**
 * 删除数组项
 *
 * @param array 数组
 * @param item 待删除项
 * @param strict 是否全等判断，默认是全等
 * @return 删除的数量
 */
function remove(array, target, strict) {
    let result = 0;
    each(array, function (item, index) {
        if (strict === FALSE ? item == target : item === target) {
            array.splice(index, 1);
            result++;
        }
    }, TRUE);
    return result;
}
/**
 * 数组是否包含 item
 *
 * @param array 数组
 * @param target 可能包含的数组项
 * @param strict 是否全等判断，默认是全等
 * @return
 */
function has(array, target, strict) {
    return indexOf(array, target, strict) >= 0;
}
/**
 * 把类数组转成数组
 *
 * @param array 类数组
 * @return
 */
function toArray(array$1) {
    return array(array$1)
        ? array$1
        : execute(EMPTY_ARRAY.slice, array$1);
}
/**
 * 把数组转成对象
 *
 * @param array 数组
 * @param key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @param value
 * @return
 */
function toObject(array, key, value) {
    let result = {};
    each(array, function (item) {
        result[key ? item[key] : item] = value || item;
    });
    return result;
}
/**
 * 把数组合并成字符串
 *
 * @param array
 * @param separator
 * @return
 */
function join(array, separator) {
    return array.join(separator);
}
/**
 * 用于判断长度大于 0 的数组
 *
 * @param array
 * @return
 */
function falsy(array$1) {
    return !array(array$1) || !array$1.length;
}

var array$1 = /*#__PURE__*/Object.freeze({
  each: each,
  push: push,
  unshift: unshift,
  indexOf: indexOf,
  last: last,
  pop: pop,
  remove: remove,
  has: has,
  toArray: toArray,
  toObject: toObject,
  join: join,
  falsy: falsy
});

const camelizePattern = /-([a-z])/gi, hyphenatePattern = /\B([A-Z])/g, capitalizePattern = /^[a-z]/, camelizeCache = {}, hyphenateCache = {}, capitalizeCache = {};
/**
 * 连字符转成驼峰
 *
 * @param str
 * @return 驼峰格式的字符串
 */
function camelize(str) {
    if (!camelizeCache[str]) {
        camelizeCache[str] = str.replace(camelizePattern, function ($0, $1) {
            return upper($1);
        });
    }
    return camelizeCache[str];
}
/**
 * 驼峰转成连字符
 *
 * @param str
 * @return 连字符格式的字符串
 */
function hyphenate(str) {
    if (!hyphenateCache[str]) {
        hyphenateCache[str] = str.replace(hyphenatePattern, function ($0, $1) {
            return '-' + lower($1);
        });
    }
    return hyphenateCache[str];
}
/**
 * 首字母大写
 *
 * @param str
 * @return
 */
function capitalize(str) {
    if (!capitalizeCache[str]) {
        capitalizeCache[str] = str.replace(capitalizePattern, upper);
    }
    return capitalizeCache[str];
}
/**
 * 清除两侧空白符
 *
 * @param str
 * @return 清除两侧空白符的字符串
 */
function trim(str) {
    return falsy$1(str)
        ? EMPTY_STRING
        : str.trim();
}
/**
 * 截取字符串
 *
 * @param str
 * @param start
 * @param end
 * @return
 */
function slice(str, start, end) {
    return number(end)
        ? start === end
            ? EMPTY_STRING
            : str.slice(start, end)
        : str.slice(start);
}
/**
 * 获取子串的起始位置
 *
 * @param str
 * @param part
 * @param start
 * @return
 */
function indexOf$1(str, part, start) {
    return str.indexOf(part, isDef(start) ? start : 0);
}
/**
 * 获取子串的起始位置
 *
 * @param str
 * @param part
 * @param end
 * @return
 */
function lastIndexOf(str, part, end) {
    return str.lastIndexOf(part, isDef(end) ? end : str.length);
}
/**
 * str 是否以 part 开头
 *
 * @param str
 * @param part
 * @return
 */
function startsWith(str, part) {
    return indexOf$1(str, part) === 0;
}
/**
 * str 是否以 part 结束
 *
 * @param str
 * @param part
 * @return
 */
function endsWith(str, part) {
    const offset = str.length - part.length;
    return offset >= 0 && lastIndexOf(str, part) === offset;
}
/**
 * 获取某个位置的字符
 */
function charAt(str, index) {
    return str.charAt(index || 0);
}
/**
 * 获取某个位置的字符编码
 */
function codeAt(str, index) {
    return str.charCodeAt(index || 0);
}
/**
 * 大写格式
 */
function upper(str) {
    return str.toUpperCase();
}
/**
 * 小写格式
 */
function lower(str) {
    return str.toLowerCase();
}
/**
 * str 是否包含 part
 *
 * @param str
 * @param part
 * @return 是否包含
 */
function has$1(str, part) {
    return indexOf$1(str, part) >= 0;
}
/**
 * 判断长度大于 0 的字符串
 *
 * @param str
 * @return
 */
function falsy$1(str) {
    return !string(str) || !str.length;
}

var string$1 = /*#__PURE__*/Object.freeze({
  camelize: camelize,
  hyphenate: hyphenate,
  capitalize: capitalize,
  trim: trim,
  slice: slice,
  indexOf: indexOf$1,
  lastIndexOf: lastIndexOf,
  startsWith: startsWith,
  endsWith: endsWith,
  charAt: charAt,
  codeAt: codeAt,
  upper: upper,
  lower: lower,
  has: has$1,
  falsy: falsy$1
});

const dotPattern = /\./g, asteriskPattern = /\*/g, doubleAsteriskPattern = /\*\*/g, splitCache = {}, patternCache = {};
/**
 * 判断 keypath 是否以 prefix 开头，如果是，返回匹配上的前缀长度，否则返回 -1
 *
 * @param keypath
 * @param prefix
 * @return
 */
function match(keypath, prefix) {
    if (keypath === prefix) {
        return prefix.length;
    }
    prefix += RAW_DOT;
    return startsWith(keypath, prefix)
        ? prefix.length
        : MINUS_ONE;
}
/**
 * 遍历 keypath 的每个部分
 *
 * @param keypath
 * @param callback 返回 false 可中断遍历
 */
function each$1(keypath, callback) {
    // 判断字符串是因为 keypath 有可能是 toString
    // 而 splitCache.toString 是个函数
    const list = isDef(splitCache[keypath])
        ? splitCache[keypath]
        : (splitCache[keypath] = keypath.split(RAW_DOT));
    for (let i = 0, lastIndex = list.length - 1; i <= lastIndex; i++) {
        if (callback(list[i], i === lastIndex) === FALSE) {
            break;
        }
    }
}
/**
 * 遍历 keypath 的每个部分
 *
 * @param keypath1
 * @param keypath2
 */
function join$1(keypath1, keypath2) {
    return keypath1 && keypath2
        ? keypath1 + RAW_DOT + keypath2
        : keypath1 || keypath2;
}
/**
 * 是否模糊匹配
 *
 * @param keypath
 */
function isFuzzy(keypath) {
    return has$1(keypath, RAW_WILDCARD);
}
/**
 * 模糊匹配 keypath
 *
 * @param keypath
 * @param pattern
 */
function matchFuzzy(keypath, pattern) {
    let cache = patternCache[pattern];
    if (!cache) {
        const str = pattern
            .replace(dotPattern, '\\.')
            .replace(asteriskPattern, '(\\w+)')
            .replace(doubleAsteriskPattern, '([\.\\w]+?)');
        cache = patternCache[pattern] = new RegExp(`^${str}$`);
    }
    const result = keypath.match(cache);
    if (result) {
        return result[1];
    }
}

/**
 * 全局 value holder，避免频繁的创建临时对象
 */
const holder = {
    value: UNDEFINED
};

/**
 * 获取对象的 key 的数组
 *
 * @param object
 * @return
 */
function keys(object) {
    return Object.keys(object);
}
function sortKeyByAsc(a, b) {
    return a.length - b.length;
}
function sortKeyByDesc(a, b) {
    return b.length - a.length;
}
/**
 * 排序对象的 key
 *
 * @param object
 * @param desc 是否逆序，默认从小到大排序
 * @return
 */
function sort(object, desc) {
    return keys(object).sort(desc ? sortKeyByDesc : sortKeyByAsc);
}
/**
 * 遍历对象
 *
 * @param object
 * @param callback 返回 false 可停止遍历
 */
function each$2(object, callback) {
    for (let key in object) {
        if (callback(object[key], key) === FALSE) {
            break;
        }
    }
}
/**
 * 清空对象所有的键值对
 *
 * @param object
 */
function clear(object) {
    each$2(object, function (_, key) {
        delete object[key];
    });
}
/**
 * 扩展对象
 *
 * @return
 */
function extend(original, object) {
    each$2(object, function (value, key) {
        original[key] = value;
    });
    return original;
}
/**
 * 合并对象
 *
 * @return
 */
function merge(object1, object2) {
    return object1 && object2
        ? extend(extend({}, object1), object2)
        : object1 || object2;
}
/**
 * 拷贝对象
 *
 * @param object
 * @param deep 是否需要深拷贝
 * @return
 */
function copy(object$1, deep) {
    let result = object$1;
    if (array(object$1)) {
        if (deep) {
            result = [];
            each(object$1, function (item, index) {
                result[index] = copy(item, deep);
            });
        }
        else {
            result = object$1.slice();
        }
    }
    else if (object(object$1)) {
        result = {};
        each$2(object$1, function (value, key) {
            result[key] = deep ? copy(value, deep) : value;
        });
    }
    return result;
}
/**
 * 从对象中查找一个 keypath
 *
 * 返回值是空时，表示没找到值
 *
 * @param object
 * @param keypath
 * @return
 */
function get(object, keypath) {
    each$1(keypath, function (key, isLast) {
        if (object != NULL) {
            // 先直接取值
            let value = object[key], 
            // 紧接着判断值是否存在
            // 下面会处理计算属性的值，不能在它后面设置 hasValue
            hasValue = isDef(value);
            // 如果是计算属性，取计算属性的值
            if (value && func(value.get)) {
                value = value.get();
            }
            if (isLast) {
                if (hasValue) {
                    holder.value = value;
                    object = holder;
                }
                else {
                    object = UNDEFINED;
                }
            }
            else {
                object = value;
            }
        }
        else {
            object = UNDEFINED;
            return FALSE;
        }
    });
    return object;
}
/**
 * 为对象设置一个键值对
 *
 * @param object
 * @param keypath
 * @param value
 * @param autofill 是否自动填充不存在的对象，默认自动填充
 */
function set(object, keypath, value, autofill) {
    each$1(keypath, function (key, isLast) {
        if (isLast) {
            object[key] = value;
        }
        else if (object[key]) {
            object = object[key];
        }
        else if (autofill) {
            object = object[key] = {};
        }
        else {
            return FALSE;
        }
    });
}
/**
 * 对象是否包含某个 key
 *
 * @param object
 * @param key
 * @return
 */
function has$2(object, key) {
    // 不用 hasOwnProperty，性能差
    return isDef(object[key]);
}
/**
 * 是否是空对象
 *
 * @param object
 * @return
 */
function falsy$2(object$1) {
    return !object(object$1)
        || array(object$1)
        || !keys(object$1).length;
}

var object$1 = /*#__PURE__*/Object.freeze({
  keys: keys,
  sort: sort,
  each: each$2,
  clear: clear,
  extend: extend,
  merge: merge,
  copy: copy,
  get: get,
  set: set,
  has: has$2,
  falsy: falsy$2
});

function toString (target, defaultValue) {
    return target != NULL && target.toString
        ? target.toString()
        : isDef(defaultValue)
            ? defaultValue
            : EMPTY_STRING;
}

const DEBUG = 1;
const INFO = 2;
const WARN = 3;
const ERROR = 4;
const FATAL = 5;
/**
 * 是否有原生的日志特性，没有必要单独实现
 */
const nativeConsole = typeof console !== RAW_UNDEFINED ? console : NULL, 
/**
 * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
 */
defaultLogLevel = /yox/.test(toString(EMPTY_FUNCTION)) ? DEBUG : WARN, 
/**
 * console 样式前缀
 * ie 和 edge 不支持 console.log 样式
 */
stylePrefix = WINDOW && /edge|msie|trident/i.test(WINDOW.navigator.userAgent)
    ? EMPTY_STRING
    : '%c', 
/**
 * 日志打印函数
 */
printLog = nativeConsole
    ? stylePrefix
        ? function (tag, msg, style) {
            nativeConsole.log(stylePrefix + tag, style, msg);
        }
        : function (tag, msg) {
            nativeConsole.log(tag, msg);
        }
    : EMPTY_FUNCTION;
/**
 * 全局调试开关
 */
function getLogLevel() {
    if (GLOBAL) {
        const logLevel = GLOBAL['YOX_LOG_LEVEL'];
        if (logLevel >= DEBUG && logLevel <= FATAL) {
            return logLevel;
        }
    }
    return defaultLogLevel;
}
function getStyle(backgroundColor) {
    return `background-color:${backgroundColor};border-radius:12px;color:#fff;font-size:10px;padding:3px 6px;`;
}
/**
 * 打印 debug 日志
 *
 * @param msg
 */
function debug(msg, tag) {
    if (getLogLevel() <= DEBUG) {
        printLog(tag || 'Yox debug', msg, getStyle('#999'));
    }
}
/**
 * 打印 info 日志
 *
 * @param msg
 */
function info(msg, tag) {
    if (getLogLevel() <= INFO) {
        printLog(tag || 'Yox info', msg, getStyle('#2db7f5'));
    }
}
/**
 * 打印 warn 日志
 *
 * @param msg
 */
function warn(msg, tag) {
    if (getLogLevel() <= WARN) {
        printLog(tag || 'Yox warn', msg, getStyle('#f90'));
    }
}
/**
 * 打印 error 日志
 *
 * @param msg
 */
function error(msg, tag) {
    if (getLogLevel() <= ERROR) {
        printLog(tag || 'Yox error', msg, getStyle('#ed4014'));
    }
}
/**
 * 致命错误，中断程序
 *
 * @param msg
 */
function fatal(msg, tag) {
    if (getLogLevel() <= FATAL) {
        throw new Error(`[${tag || 'Yox fatal'}]: ${msg}`);
    }
}

var logger = /*#__PURE__*/Object.freeze({
  DEBUG: DEBUG,
  INFO: INFO,
  WARN: WARN,
  ERROR: ERROR,
  FATAL: FATAL,
  debug: debug,
  info: info,
  warn: warn,
  error: error,
  fatal: fatal
});

class Emitter {
    constructor(ns) {
        this.ns = ns || FALSE;
        this.listeners = {};
    }
    /**
     * 发射事件
     *
     * @param type 事件名称或命名空间
     * @param args 事件处理函数的参数列表
     * @param filter 自定义过滤器
     */
    fire(type, args, filter) {
        let instance = this, namespace = string(type) ? instance.parse(type) : type, list = instance.listeners[namespace.name], isComplete = TRUE;
        if (list) {
            // 避免遍历过程中，数组发生变化，比如增删了
            list = copy(list);
            // 判断是否是发射事件
            // 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
            // 因为事件处理函数的参数列表是 (event, data)
            const event = args && args[0] instanceof CustomEvent
                ? args[0]
                : UNDEFINED;
            each(list, function (options) {
                // 命名空间不匹配
                if (!matchNamespace(namespace.ns, options)
                    // 在 fire 过程中被移除了
                    || !has(list, options)
                    // 传了 filter，则用 filter 判断是否过滤此 options
                    || (filter && !filter(namespace, args, options))) {
                    return;
                }
                // 为 event 对象加上当前正在处理的 listener
                // 这样方便业务层移除事件绑定
                // 比如 on('xx', function) 这样定义了匿名 listener
                // 在这个 listener 里面获取不到当前 listener 的引用
                // 为了能引用到，有时候会先定义 var listener = function
                // 然后再 on('xx', listener) 这样其实是没有必要的
                if (event) {
                    event.listener = options.fn;
                }
                let result = execute(options.fn, options.ctx, args);
                if (event) {
                    event.listener = UNDEFINED;
                }
                // 执行次数
                options.num = options.num ? (options.num + 1) : 1;
                // 注册的 listener 可以指定最大执行次数
                if (options.num === options.max) {
                    instance.off(namespace.key, options.fn);
                }
                // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
                if (event) {
                    if (result === FALSE) {
                        event.prevent().stop();
                    }
                    else if (event.isStoped) {
                        result = FALSE;
                    }
                }
                if (result === FALSE) {
                    return isComplete = FALSE;
                }
            });
        }
        return isComplete;
    }
    /**
     * 注册监听
     *
     * @param type
     * @param listener
     */
    on(type, listener) {
        const instance = this, { listeners } = instance, options = func(listener)
            ? { fn: listener }
            : listener;
        if (object(options) && func(options.fn)) {
            const { name, ns } = instance.parse(type);
            options.ns = ns;
            push(listeners[name] || (listeners[name] = []), options);
        }
        else {
            fatal(`emitter.on(type, listener) invoke failed：\n\n"listener" is expected to be a Function or an EmitterOptions.\n`);
        }
    }
    /**
     * 取消监听
     *
     * @param type
     * @param listener
     */
    off(type, listener) {
        const instance = this, { listeners } = instance;
        if (type) {
            const { name, ns } = instance.parse(type), matchListener = createMatchListener(listener), each$1 = function (list, name) {
                each(list, function (options, index) {
                    if (matchListener(options) && matchNamespace(ns, options)) {
                        list.splice(index, 1);
                    }
                }, TRUE);
                if (!list.length) {
                    delete listeners[name];
                }
            };
            if (name) {
                if (listeners[name]) {
                    each$1(listeners[name], name);
                }
            }
            else if (ns) {
                each$2(listeners, each$1);
            }
            // 在开发阶段进行警告，比如传了 listener 进来，listener 是个空值
            // 但你不知道它是空值
            {
                if (arguments.length > 1 && listener == NULL) {
                    warn(`emitter.off(type, listener) is invoked, but "listener" is ${listener}.`);
                }
            }
        }
        else {
            // 清空
            instance.listeners = {};
            // 在开发阶段进行警告，比如传了 type 进来，type 是个空值
            // 但你不知道它是空值
            {
                if (arguments.length > 0) {
                    warn(`emitter.off(type) is invoked, but "type" is ${type}.`);
                }
            }
        }
    }
    /**
     * 是否已监听某个事件
     *
     * @param type
     * @param listener
     */
    has(type, listener) {
        let instance = this, { listeners } = instance, { name, ns } = instance.parse(type), result = TRUE, matchListener = createMatchListener(listener), each$1 = function (list) {
            each(list, function (options) {
                if (matchListener(options) && matchNamespace(ns, options)) {
                    return result = FALSE;
                }
            });
            return result;
        };
        if (name) {
            if (listeners[name]) {
                each$1(listeners[name]);
            }
        }
        else if (ns) {
            each$2(listeners, each$1);
        }
        return !result;
    }
    /**
     * 把事件类型解析成命名空间格式
     *
     * @param type
     */
    parse(type) {
        const result = {
            key: type,
            name: type,
            ns: EMPTY_STRING,
        };
        if (this.ns) {
            const index = indexOf$1(type, RAW_DOT);
            if (index >= 0) {
                result.name = slice(type, 0, index);
                result.ns = slice(type, index + 1);
            }
        }
        return result;
    }
}
function matchTrue() {
    return TRUE;
}
/**
 * 外部会传入 Function 或 EmitterOptions 或 空
 *
 * 这里根据传入值的不同类型，创建不同的判断函数
 *
 * 如果传入的是 EmitterOptions，则全等判断
 *
 * 如果传入的是 Function，则判断函数是否全等
 *
 * 如果传入的是空，则直接返回 true
 *
 * @param listener
 */
function createMatchListener(listener) {
    return func(listener)
        ? function (options) {
            return listener === options.fn;
        }
        : matchTrue;
}
/**
 * 判断 options 是否能匹配命名空间
 *
 * 如果 namespace 和 options.ns 都不为空，则需完全匹配
 *
 * 如果他们两个其中任何一个为空，则不判断命名空间
 *
 * @param namespace
 * @param options
 */
function matchNamespace(namespace, options) {
    const { ns } = options;
    return ns && namespace
        ? ns === namespace
        : TRUE;
}

function isNative (target) {
    return func(target) && /native code/.test(toString(target));
}

let nextTick;
// IE (10+) 和 node
if (typeof setImmediate === RAW_FUNCTION && isNative(setImmediate)) {
    nextTick = setImmediate;
}
// 用 MessageChannel 去做 setImmediate 的 polyfill
// 原理是将新的 message 事件加入到原有的 dom events 之后
// 兼容性 IE10+ 和其他标准浏览器
if (typeof MessageChannel === RAW_FUNCTION && isNative(MessageChannel)) {
    nextTick = function (fn) {
        const channel = new MessageChannel();
        channel.port1.onmessage = fn;
        channel.port2.postMessage(1);
    };
}
else {
    nextTick = setTimeout;
}
var nextTick$1 = nextTick;

let shared;
class NextTask {
    /**
     * 全局单例
     */
    static shared() {
        return shared || (shared = new NextTask());
    }
    constructor() {
        this.tasks = [];
    }
    /**
     * 在队尾添加异步任务
     */
    append(func, context) {
        const instance = this, { tasks } = instance;
        push(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick$1(function () {
                instance.run();
            });
        }
    }
    /**
     * 在队首添加异步任务
     */
    prepend(func, context) {
        const instance = this, { tasks } = instance;
        unshift(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick$1(function () {
                instance.run();
            });
        }
    }
    /**
     * 清空异步队列
     */
    clear() {
        this.tasks.length = 0;
    }
    /**
     * 立即执行异步任务，并清空队列
     */
    run() {
        const { tasks } = this;
        if (tasks.length) {
            this.tasks = [];
            each(tasks, function (task) {
                execute(task.fn, task.ctx);
            });
        }
    }
}

let guid = 0;
function guid$1 () {
    return ++guid;
}

// vnode.data 内部使用的几个字段
const ID = '$id';
const VNODE = '$vnode';
const LOADING = '$loading';
const COMPONENT = '$component';
const LEAVING = '$leaving';

function update(api, vnode, oldVnode) {
    const { node, nativeAttrs } = vnode, oldNativeAttrs = oldVnode && oldVnode.nativeAttrs;
    if (nativeAttrs || oldNativeAttrs) {
        const newValue = nativeAttrs || EMPTY_OBJECT, oldValue = oldNativeAttrs || EMPTY_OBJECT;
        each$2(newValue, function (attr, name) {
            if (!oldValue[name]
                || attr.value !== oldValue[name].value) {
                api.attr(node, name, attr.value);
            }
        });
        each$2(oldValue, function (_, name) {
            if (!newValue[name]) {
                api.removeAttr(node, name);
            }
        });
    }
}

function update$1(api, vnode, oldVnode) {
    const { node, nativeProps } = vnode, oldNativeProps = oldVnode && oldVnode.nativeProps;
    if (nativeProps || oldNativeProps) {
        const newValue = nativeProps || EMPTY_OBJECT, oldValue = oldNativeProps || EMPTY_OBJECT;
        each$2(newValue, function (prop, name) {
            if (!oldValue[name]
                || prop.value !== oldValue[name].value) {
                api.prop(node, name, prop.value);
            }
        });
        each$2(oldValue, function (prop, name) {
            if (!newValue[name]) {
                api.removeProp(node, name, prop.hint);
            }
        });
    }
}

function update$2(vnode, oldVnode) {
    const { data, directives } = vnode, oldDirectives = oldVnode && oldVnode.directives;
    if (directives || oldDirectives) {
        const node = data[COMPONENT] || vnode.node, isKeypathChange = oldVnode && vnode.keypath !== oldVnode.keypath, newValue = directives || EMPTY_OBJECT, oldValue = oldDirectives || EMPTY_OBJECT;
        each$2(newValue, function (directive, name) {
            const { once, bind, unbind } = directive.hooks;
            if (!oldValue[name]) {
                bind(node, directive, vnode);
            }
            else if (once
                || directive.value !== oldValue[name].value
                || isKeypathChange) {
                if (unbind) {
                    unbind(node, oldValue[name], oldVnode);
                }
                bind(node, directive, vnode);
            }
        });
        each$2(oldValue, function (directive, name) {
            if (!newValue[name]) {
                const { unbind } = directive.hooks;
                if (unbind) {
                    unbind(node, directive, oldVnode);
                }
            }
        });
    }
}
function remove$1(vnode) {
    const { directives } = vnode;
    if (directives) {
        const node = vnode.data[COMPONENT] || vnode.node;
        each$2(directives, function (directive) {
            const { unbind } = directive.hooks;
            if (unbind) {
                unbind(node, directive, vnode);
            }
        });
    }
}

function update$3(vnode, oldVnode) {
    let { data, ref, props, slots, directives, context } = vnode, node;
    if (vnode.isComponent) {
        node = data[COMPONENT];
        // 更新时才要 set
        // 因为初始化时，所有这些都经过构造函数完成了
        if (oldVnode) {
            const model = directives && directives[DIRECTIVE_MODEL];
            if (model) {
                if (!props) {
                    props = {};
                }
                props[node.$model] = model.value;
            }
            {
                if (props) {
                    each$2(props, function (value, key) {
                        node.checkProp(key, value);
                    });
                }
            }
            const result = merge(props, slots);
            if (result) {
                node.forceUpdate(result);
            }
        }
    }
    else {
        node = vnode.node;
    }
    if (ref) {
        const refs = context.$refs;
        if (refs) {
            refs[ref] = node;
        }
    }
}

function isPatchable(vnode, oldVnode) {
    return vnode.tag === oldVnode.tag
        && vnode.key === oldVnode.key;
}
function createKeyToIndex(vnodes, startIndex, endIndex) {
    let result, vnode, key;
    while (startIndex <= endIndex) {
        vnode = vnodes[startIndex];
        if (vnode && (key = vnode.key)) {
            if (!result) {
                result = {};
            }
            result[key] = startIndex;
        }
        startIndex++;
    }
    return result || EMPTY_OBJECT;
}
function insertBefore(api, parentNode, node, referenceNode) {
    if (referenceNode) {
        api.before(parentNode, node, referenceNode);
    }
    else {
        api.append(parentNode, node);
    }
}
function createComponent(vnode, options) {
    const child = (vnode.parent || vnode.context).createComponent(options, vnode);
    vnode.data[COMPONENT] = child;
    vnode.data[LOADING] = FALSE;
    update$3(vnode);
    update$2(vnode);
    return child;
}
function createData() {
    const data = {};
    data[ID] = guid$1();
    return data;
}
function createVnode(api, vnode) {
    let { tag, node, data, isComponent, isComment, isText, isStyle, isOption, children, text, html, context } = vnode;
    if (node && data) {
        return;
    }
    data = createData();
    vnode.data = data;
    if (isText) {
        vnode.node = api.createText(text);
        return;
    }
    if (isComment) {
        vnode.node = api.createComment(text);
        return;
    }
    if (isComponent) {
        let componentOptions = UNDEFINED;
        // 动态组件，tag 可能为空
        if (tag) {
            context.loadComponent(tag, function (options) {
                if (has$2(data, LOADING)) {
                    // 异步组件
                    if (data[LOADING]) {
                        // 尝试使用最新的 vnode
                        if (data[VNODE]) {
                            vnode = data[VNODE];
                            // 用完就删掉
                            delete data[VNODE];
                        }
                        enterVnode(vnode, createComponent(vnode, options));
                    }
                }
                // 同步组件
                else {
                    componentOptions = options;
                }
            });
        }
        // 不论是同步还是异步组件，都需要一个占位元素
        vnode.node = api.createComment(RAW_COMPONENT);
        if (componentOptions) {
            createComponent(vnode, componentOptions);
        }
        else {
            data[LOADING] = TRUE;
        }
    }
    else {
        node = vnode.node = api.createElement(vnode.tag, vnode.isSvg);
        if (children) {
            addVnodes(api, node, children);
        }
        else if (text) {
            api.text(node, text, isStyle, isOption);
        }
        else if (html) {
            api.html(node, html, isStyle, isOption);
        }
        update(api, vnode);
        update$1(api, vnode);
        update$3(vnode);
        update$2(vnode);
    }
}
function addVnodes(api, parentNode, vnodes, startIndex, endIndex, before) {
    let vnode, start = startIndex || 0, end = isDef(endIndex) ? endIndex : vnodes.length - 1;
    while (start <= end) {
        vnode = vnodes[start];
        createVnode(api, vnode);
        insertVnode(api, parentNode, vnode, before);
        start++;
    }
}
function insertVnode(api, parentNode, vnode, before) {
    const { node, data, context } = vnode, hasParent = api.parent(node);
    // 这里不调用 insertBefore，避免判断两次
    if (before) {
        api.before(parentNode, node, before.node);
    }
    else {
        api.append(parentNode, node);
    }
    // 普通元素和组件的占位节点都会走到这里
    // 但是占位节点不用 enter，而是等组件加载回来之后再调 enter
    if (!hasParent) {
        let enter = UNDEFINED;
        if (vnode.isComponent) {
            const component = data[COMPONENT];
            if (component) {
                enter = function () {
                    enterVnode(vnode, component);
                };
            }
        }
        else if (!vnode.isStatic && !vnode.isText && !vnode.isComment) {
            enter = function () {
                enterVnode(vnode);
            };
        }
        if (enter) {
            // 执行到这时，组件还没有挂载到 DOM 树
            // 如果此时直接触发 enter，外部还需要做多余的工作，比如 setTimeout
            // 索性这里直接等挂载到 DOM 数之后再触发
            // 注意：YoxInterface 没有声明 $observer，因为不想让外部访问，
            // 但是这里要用一次，所以加了 as any
            context.$observer.nextTask.prepend(enter);
        }
    }
}
function removeVnodes(api, parentNode, vnodes, startIndex, endIndex) {
    let vnode, start = startIndex || 0, end = isDef(endIndex) ? endIndex : vnodes.length - 1;
    while (start <= end) {
        vnode = vnodes[start];
        if (vnode) {
            removeVnode(api, parentNode, vnode);
        }
        start++;
    }
}
function removeVnode(api, parentNode, vnode) {
    const { node } = vnode;
    if (vnode.isStatic || vnode.isText || vnode.isComment) {
        api.remove(parentNode, node);
    }
    else {
        let done = function () {
            destroyVnode(api, vnode);
            api.remove(parentNode, node);
        }, component;
        if (vnode.isComponent) {
            component = vnode.data[COMPONENT];
            // 异步组件，还没加载成功就被删除了
            if (!component) {
                done();
                return;
            }
        }
        leaveVnode(vnode, component, done);
    }
}
function destroyVnode(api, vnode) {
    /**
     * 如果一个子组件的模板是这样写的：
     *
     * <div>
     *   {{#if visible}}
     *      <slot name="children"/>
     *   {{/if}}
     * </div>
     *
     * 当 visible 从 true 变为 false 时，不能销毁 slot 导入的任何 vnode
     * 不论是组件或是元素，都不能销毁，只能简单的 remove，
     * 否则子组件下一次展现它们时，会出问题
     */
    const { data, children, parent, slot } = vnode;
    // 销毁插槽组件
    // 如果宿主组件正在销毁，$vnode 属性会在调 destroy() 之前被删除
    // 这里表示的是宿主组件还没被销毁
    // 如果宿主组件被销毁了，则它的一切都要进行销毁
    if (slot && parent && parent.$vnode) {
        // 如果更新时，父组件没有传入该 slot，则子组件需要销毁该 slot
        const slots = parent.get(slot);
        // slots 要么没有，要么是数组，不可能是别的
        if (slots && has(slots, vnode)) {
            return;
        }
    }
    if (vnode.isComponent) {
        const component = data[COMPONENT];
        if (component) {
            remove$1(vnode);
            component.destroy();
        }
        else
            [
                data[LOADING] = FALSE
            ];
    }
    else {
        remove$1(vnode);
        if (children) {
            each(children, function (child) {
                destroyVnode(api, child);
            });
        }
    }
}
/**
 * vnode 触发 enter hook 时，外部一般会做一些淡入动画
 */
function enterVnode(vnode, component) {
    // 如果组件根元素和组件本身都写了 transition
    // 优先用外面定义的
    // 因为这明确是在覆盖配置
    let { data, transition } = vnode;
    if (component && !transition) {
        // 再看组件根元素是否有 transition
        transition = component.$vnode.transition;
    }
    execute(data[LEAVING]);
    if (transition) {
        const { enter } = transition;
        if (enter) {
            enter(vnode.node);
            return;
        }
    }
}
/**
 * vnode 触发 leave hook 时，外部一般会做一些淡出动画
 * 动画结束后才能移除节点，否则无法产生动画
 * 这里由外部调用 done 来通知内部动画结束
 */
function leaveVnode(vnode, component, done) {
    // 如果组件根元素和组件本身都写了 transition
    // 优先用外面定义的
    // 因为这明确是在覆盖配置
    let { data, transition } = vnode;
    if (component && !transition) {
        // 再看组件根元素是否有 transition
        transition = component.$vnode.transition;
    }
    if (transition) {
        const { leave } = transition;
        if (leave) {
            leave(vnode.node, data[LEAVING] = function () {
                if (data[LEAVING]) {
                    done();
                    data[LEAVING] = UNDEFINED;
                }
            });
            return;
        }
    }
    // 如果没有淡出动画，直接结束
    done();
}
function updateChildren(api, parentNode, children, oldChildren) {
    let startIndex = 0, endIndex = children.length - 1, startVnode = children[startIndex], endVnode = children[endIndex], oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, oldStartVnode = oldChildren[oldStartIndex], oldEndVnode = oldChildren[oldEndIndex], oldKeyToIndex, oldIndex;
    while (oldStartIndex <= oldEndIndex && startIndex <= endIndex) {
        // 下面有设为 UNDEFINED 的逻辑
        if (!startVnode) {
            startVnode = children[++startIndex];
        }
        else if (!endVnode) {
            endVnode = children[--endIndex];
        }
        else if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex];
        }
        else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        // 从头到尾比较，位置相同且值得 patch
        else if (isPatchable(startVnode, oldStartVnode)) {
            patch(api, startVnode, oldStartVnode);
            startVnode = children[++startIndex];
            oldStartVnode = oldChildren[++oldStartIndex];
        }
        // 从尾到头比较，位置相同且值得 patch
        else if (isPatchable(endVnode, oldEndVnode)) {
            patch(api, endVnode, oldEndVnode);
            endVnode = children[--endIndex];
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        // 比较完两侧的节点，剩下就是 位置发生改变的节点 和 全新的节点
        // 当 endVnode 和 oldStartVnode 值得 patch
        // 说明元素被移到右边了
        else if (isPatchable(endVnode, oldStartVnode)) {
            patch(api, endVnode, oldStartVnode);
            insertBefore(api, parentNode, oldStartVnode.node, api.next(oldEndVnode.node));
            endVnode = children[--endIndex];
            oldStartVnode = oldChildren[++oldStartIndex];
        }
        // 当 oldEndVnode 和 startVnode 值得 patch
        // 说明元素被移到左边了
        else if (isPatchable(startVnode, oldEndVnode)) {
            patch(api, startVnode, oldEndVnode);
            insertBefore(api, parentNode, oldEndVnode.node, oldStartVnode.node);
            startVnode = children[++startIndex];
            oldEndVnode = oldChildren[--oldEndIndex];
        }
        // 尝试同级元素的 key
        else {
            if (!oldKeyToIndex) {
                oldKeyToIndex = createKeyToIndex(oldChildren, oldStartIndex, oldEndIndex);
            }
            // 新节点之前的位置
            oldIndex = startVnode.key
                ? oldKeyToIndex[startVnode.key]
                : UNDEFINED;
            // 移动元素
            if (isDef(oldIndex)) {
                patch(api, startVnode, oldChildren[oldIndex]);
                oldChildren[oldIndex] = UNDEFINED;
            }
            // 新元素
            else {
                createVnode(api, startVnode);
            }
            insertVnode(api, parentNode, startVnode, oldStartVnode);
            startVnode = children[++startIndex];
        }
    }
    if (oldStartIndex > oldEndIndex) {
        addVnodes(api, parentNode, children, startIndex, endIndex, children[endIndex + 1]);
    }
    else if (startIndex > endIndex) {
        removeVnodes(api, parentNode, oldChildren, oldStartIndex, oldEndIndex);
    }
}
function patch(api, vnode, oldVnode) {
    if (vnode === oldVnode) {
        return;
    }
    const { node, data } = oldVnode;
    // 如果不能 patch，则删除重建
    if (!isPatchable(vnode, oldVnode)) {
        // 同步加载的组件，初始化时不会传入占位节点
        // 它内部会自动生成一个注释节点，当它的根 vnode 和注释节点对比时，必然无法 patch
        // 于是走进此分支，为新组件创建一个 DOM 节点，然后继续 createComponent 后面的流程
        const parentNode = api.parent(node);
        createVnode(api, vnode);
        if (parentNode) {
            insertVnode(api, parentNode, vnode, oldVnode);
            removeVnode(api, parentNode, oldVnode);
        }
        return;
    }
    vnode.node = node;
    vnode.data = data;
    // 组件正在异步加载，更新为最新的 vnode
    // 当异步加载完成时才能用上最新的 vnode
    if (oldVnode.isComponent && data[LOADING]) {
        data[VNODE] = vnode;
        return;
    }
    // 两棵静态子树就别折腾了
    if (vnode.isStatic && oldVnode.isStatic) {
        return;
    }
    update(api, vnode, oldVnode);
    update$1(api, vnode, oldVnode);
    update$3(vnode, oldVnode);
    update$2(vnode, oldVnode);
    const { text, html, children, isStyle, isOption } = vnode, oldText = oldVnode.text, oldHtml = oldVnode.html, oldChildren = oldVnode.children;
    if (string(text)) {
        if (text !== oldText) {
            api.text(node, text, isStyle, isOption);
        }
    }
    else if (string(html)) {
        if (html !== oldHtml) {
            api.html(node, html, isStyle, isOption);
        }
    }
    // 两个都有需要 diff
    else if (children && oldChildren) {
        if (children !== oldChildren) {
            updateChildren(api, node, children, oldChildren);
        }
    }
    // 有新的没旧的 - 新增节点
    else if (children) {
        if (string(oldText) || string(oldHtml)) {
            api.text(node, EMPTY_STRING, isStyle);
        }
        addVnodes(api, node, children);
    }
    // 有旧的没新的 - 删除节点
    else if (oldChildren) {
        removeVnodes(api, node, oldChildren);
    }
    // 有旧的 text 没有新的 text
    else if (string(oldText) || string(oldHtml)) {
        api.text(node, EMPTY_STRING, isStyle);
    }
}
function create(api, node, context, keypath) {
    return {
        tag: api.tag(node),
        data: createData(),
        node,
        context,
        keypath,
    };
}
function destroy(api, vnode, isRemove) {
    if (isRemove) {
        const parentNode = api.parent(vnode.node);
        if (parentNode) {
            removeVnode(api, parentNode, vnode);
        }
        else {
            fatal(`The vnode can't be destroyed without a parent node.`);
        }
    }
    else {
        destroyVnode(api, vnode);
    }
}

/**
 * 元素 节点
 */
const ELEMENT = 1;
/**
 * 属性 节点
 */
const ATTRIBUTE = 2;
/**
 * 指令 节点
 */
const DIRECTIVE = 3;
/**
 * 属性 节点
 */
const PROPERTY = 4;
/**
 * 文本 节点
 */
const TEXT = 5;
/**
 * if 节点
 */
const IF = 6;
/**
 * else if 节点
 */
const ELSE_IF = 7;
/**
 * else 节点
 */
const ELSE = 8;
/**
 * each 节点
 */
const EACH = 9;
/**
 * partial 节点
 */
const PARTIAL = 10;
/**
 * import 节点
 */
const IMPORT = 11;
/**
 * 表达式 节点
 */
const EXPRESSION = 12;
/**
 * 延展操作 节点
 */
const SPREAD = 13;

// 特殊标签
const specialTags = {};
// 特殊属性
const specialAttrs = {};
// 名称 -> 类型的映射
const name2Type = {};
specialTags[RAW_SLOT] =
    specialTags[RAW_TEMPLATE] =
        specialAttrs[RAW_KEY] =
            specialAttrs[RAW_REF] =
                specialAttrs[RAW_SLOT] = TRUE;
name2Type['if'] = IF;
name2Type['each'] = EACH;
name2Type['partial'] = PARTIAL;

var helper = /*#__PURE__*/Object.freeze({
  specialTags: specialTags,
  specialAttrs: specialAttrs,
  name2Type: name2Type
});

function createAttribute(name) {
    return {
        type: ATTRIBUTE,
        isStatic: TRUE,
        name,
    };
}
function createDirective(name, ns, modifier) {
    return {
        type: DIRECTIVE,
        ns,
        name,
        key: join$1(ns, name),
        modifier,
    };
}
function createProperty(name, hint, value, expr, children) {
    return {
        type: PROPERTY,
        isStatic: TRUE,
        name,
        hint,
        value,
        expr,
        children,
    };
}
function createEach(from, to, equal, index) {
    return {
        type: EACH,
        from,
        to,
        equal,
        index,
        isComplex: TRUE,
    };
}
function createElement(tag, isSvg, isStyle, isComponent) {
    return {
        type: ELEMENT,
        tag,
        isSvg,
        isStyle,
        // 只有 <option> 没有 value 属性时才为 true
        isOption: FALSE,
        isComponent,
        isStatic: !isComponent && tag !== RAW_SLOT,
    };
}
function createElse() {
    return {
        type: ELSE,
    };
}
function createElseIf(expr) {
    return {
        type: ELSE_IF,
        expr,
    };
}
function createExpression(expr, safe) {
    return {
        type: EXPRESSION,
        expr,
        safe,
        isLeaf: TRUE,
    };
}
function createIf(expr) {
    return {
        type: IF,
        expr,
    };
}
function createImport(name) {
    return {
        type: IMPORT,
        name,
        isComplex: TRUE,
        isLeaf: TRUE,
    };
}
function createPartial(name) {
    return {
        type: PARTIAL,
        name,
        isComplex: TRUE,
    };
}
function createSpread(expr, binding) {
    return {
        type: SPREAD,
        expr,
        binding,
        isLeaf: TRUE,
    };
}
function createText(text) {
    return {
        type: TEXT,
        text,
        isStatic: TRUE,
        isLeaf: TRUE,
    };
}

// 首字母大写，或中间包含 -
const componentNamePattern = /^[$A-Z]|-/, 
// HTML 实体（中间最多 6 位，没见过更长的）
htmlEntityPattern = /&[#\w\d]{2,6};/, 
// 常见的自闭合标签
selfClosingTagNames = 'area,base,embed,track,source,param,input,col,img,br,hr'.split(','), 
// 常见的 svg 标签
svgTagNames = 'svg,g,defs,desc,metadata,symbol,use,image,path,rect,circle,line,ellipse,polyline,polygon,text,tspan,tref,textpath,marker,pattern,clippath,mask,filter,cursor,view,animate,font,font-face,glyph,missing-glyph,foreignObject'.split(','), 
// 常见的字符串类型的属性
// 注意：autocomplete,autocapitalize 不是布尔类型
stringProperyNames = 'id,class,name,value,for,accesskey,title,style,src,type,href,target,alt,placeholder,preload,poster,wrap,accept,pattern,dir,autocomplete,autocapitalize'.split(','), 
// 常见的数字类型的属性
numberProperyNames = 'min,minlength,max,maxlength,step,width,height,size,rows,cols,tabindex'.split(','), 
// 常见的布尔类型的属性
booleanProperyNames = 'disabled,checked,required,multiple,readonly,autofocus,autoplay,controls,loop,muted,novalidate,draggable,hidden,spellcheck'.split(','), 
// 某些属性 attribute name 和 property name 不同
attr2Prop = {};
// 列举几个常见的
attr2Prop['for'] = 'htmlFor';
attr2Prop['class'] = 'className';
attr2Prop['accesskey'] = 'accessKey';
attr2Prop['style'] = 'style.cssText';
attr2Prop['novalidate'] = 'noValidate';
attr2Prop['readonly'] = 'readOnly';
attr2Prop['tabindex'] = 'tabIndex';
attr2Prop['minlength'] = 'minLength';
attr2Prop['maxlength'] = 'maxLength';
function isSelfClosing(tagName) {
    return has(selfClosingTagNames, tagName);
}
function createAttribute$1(element, name) {
    // 组件用驼峰格式
    if (element.isComponent) {
        return createAttribute(camelize(name));
    }
    // 原生 dom 属性
    else {
        // 把 attr 优化成 prop
        const lowerName = lower(name);
        // <slot> 、<template> 或 svg 中的属性不用识别为 property
        if (specialTags[element.tag] || element.isSvg) {
            return createAttribute(name);
        }
        // 尝试识别成 property
        else if (has(stringProperyNames, lowerName)) {
            return createProperty(attr2Prop[lowerName] || lowerName, HINT_STRING);
        }
        else if (has(numberProperyNames, lowerName)) {
            return createProperty(attr2Prop[lowerName] || lowerName, HINT_NUMBER);
        }
        else if (has(booleanProperyNames, lowerName)) {
            return createProperty(attr2Prop[lowerName] || lowerName, HINT_BOOLEAN);
        }
        // 没辙，还是个 attribute
        return createAttribute(name);
    }
}
function getAttributeDefaultValue(element, name) {
    // 比如 <Dog isLive>
    if (element.isComponent) {
        return TRUE;
    }
    // <div data-name checked>
    else {
        return startsWith(name, 'data-')
            ? EMPTY_STRING
            : name;
    }
}
function createElement$1(tagName) {
    let isSvg = has(svgTagNames, tagName), isComponent = FALSE;
    // 是 svg 就不可能是组件
    // 加这个判断的原因是，svg 某些标签含有 连字符 和 大写字母，比较蛋疼
    if (!isSvg && componentNamePattern.test(tagName)) {
        isComponent = TRUE;
    }
    return createElement(tagName, isSvg, tagName === 'style', isComponent);
}
function compatElement(element) {
    let { tag, attrs } = element, hasType = FALSE, hasValue = FALSE;
    if (attrs) {
        each(attrs, function (attr) {
            const name = attr.type === PROPERTY
                ? attr.name
                : UNDEFINED;
            if (name === 'type') {
                hasType = TRUE;
            }
            else if (name === RAW_VALUE) {
                hasValue = TRUE;
            }
        });
    }
    // 补全 style 标签的 type
    // style 如果没有 type 则加一个 type="text/css"
    // 因为低版本 IE 没这个属性，没法正常渲染样式
    if (element.isStyle && !hasType) {
        push(element.attrs || (element.attrs = []), createProperty('type', HINT_STRING, 'text/css'));
    }
    // 低版本 IE 需要给 option 标签强制加 value
    else if (tag === 'option' && !hasValue) {
        element.isOption = TRUE;
    }
}
function setElementText(element, text) {
    if (htmlEntityPattern.test(text)) {
        element.html = text;
        return TRUE;
    }
}

function toNumber (target, defaultValue) {
    return numeric(target)
        ? +target
        : isDef(defaultValue)
            ? defaultValue
            : 0;
}

/**
 * 字面量
 */
const LITERAL = 1;
/**
 * 标识符
 */
const IDENTIFIER = 2;
/**
 * 对象属性或数组下标
 */
const MEMBER = 3;
/**
 * 一元表达式，如 - a
 */
const UNARY = 4;
/**
 * 二元表达式，如 a + b
 */
const BINARY = 5;
/**
 * 三元表达式，如 a ? b : c
 */
const TERNARY = 6;
/**
 * 数组表达式，如 [ 1, 2, 3 ]
 */
const ARRAY = 7;
/**
 * 对象表达式，如 { name: 'yox' }
 */
const OBJECT = 8;
/**
 * 函数调用表达式，如 a()
 */
const CALL = 9;

function createArray(nodes, raw) {
    return {
        type: ARRAY,
        raw,
        nodes,
    };
}
function createBinary(left, operator, right, raw) {
    return {
        type: BINARY,
        raw,
        left,
        operator,
        right,
    };
}
function createCall(name, args, raw) {
    return {
        type: CALL,
        raw,
        name,
        args,
    };
}
function createIdentifierInner(raw, name, lookup, offset) {
    return {
        type: IDENTIFIER,
        raw,
        name,
        lookup,
        offset,
    };
}
function createMemberInner(raw, lead, keypath, nodes, lookup, offset) {
    return {
        type: MEMBER,
        raw,
        lead,
        keypath,
        nodes,
        lookup,
        offset,
    };
}
function createIdentifier(raw, name, isProp) {
    let lookup = TRUE, offset = 0;
    if (name === KEYPATH_CURRENT
        || name === KEYPATH_PARENT) {
        lookup = FALSE;
        if (name === KEYPATH_PARENT) {
            offset = 1;
        }
        name = EMPTY_STRING;
    }
    // 对象属性需要区分 a.b 和 a[b]
    // 如果不借用 Literal 无法实现这个判断
    // 同理，如果用了这种方式，就无法区分 a.b 和 a['b']，但是无所谓，这两种表示法本就一个意思
    return isProp
        ? createLiteral(name, raw)
        : createIdentifierInner(raw, name, lookup, offset);
}
function createLiteral(value, raw) {
    return {
        type: LITERAL,
        raw,
        value,
    };
}
function createObject(keys, values, raw) {
    return {
        type: OBJECT,
        raw,
        keys,
        values,
    };
}
function createTernary(test, yes, no, raw) {
    return {
        type: TERNARY,
        raw,
        test,
        yes,
        no,
    };
}
function createUnary(operator, node, raw) {
    return {
        type: UNARY,
        raw,
        operator,
        node,
    };
}
/**
 * 通过判断 nodes 来决定是否需要创建 Member
 *
 * 创建 Member 至少需要 nodes 有两个元素
 *
 * nodes 元素类型没有限制，可以是 Identifier、Literal、Call，或是别的完整表达式
 *
 * @param raw
 * @param nodes
 */
function createMemberIfNeeded(raw, nodes) {
    let firstNode = nodes.shift(), { length } = nodes, lookup = TRUE, offset = 0;
    // member 要求至少两个节点
    if (length > 0) {
        // 处理剩下的 nodes
        // 这里要做两手准备：
        // 1. 如果全是 literal 节点，则编译时 join
        // 2. 如果不全是 literal 节点，则运行时 join
        let isLiteral = TRUE, staticNodes = [], runtimeNodes = [];
        each(nodes, function (node) {
            if (node.type === LITERAL) {
                const literal = node;
                if (literal.raw === KEYPATH_PARENT) {
                    offset += 1;
                    return;
                }
                if (literal.raw !== KEYPATH_CURRENT) {
                    push(staticNodes, toString(literal.value));
                }
            }
            else {
                isLiteral = FALSE;
            }
            push(runtimeNodes, node);
        });
        // lookup 要求第一位元素是 Identifier，且它的 lookup 是 true 才为 true
        // 其他情况都为 false，如 "11".length 第一位元素是 Literal，不存在向上寻找的需求
        // 优化 1：计算 keypath
        //
        // 计算 keypath 的唯一方式是，第一位元素是 Identifier，后面都是 Literal
        // 否则就表示中间包含动态元素，这会导致无法计算静态路径
        // 如 a.b.c 可以算出 staticKeypath，而 a[b].c 则不行，因为 b 是动态的
        // 优化 2：计算 offset 并智能转成 Identifier
        //
        // 比如 xx 这样的表达式，应优化成 offset = 2，并转成 Identifier
        // 处理第一个节点
        if (firstNode.type === IDENTIFIER) {
            const identifier = firstNode;
            lookup = identifier.lookup;
            offset += identifier.offset;
            let name = identifier.name;
            // 不是 KEYPATH_THIS 或 KEYPATH_PARENT
            if (name) {
                unshift(staticNodes, name);
            }
            // a.b.c
            if (isLiteral) {
                // 转成 Identifier
                name = join(staticNodes, RAW_DOT);
                firstNode = createIdentifierInner(name, name, lookup, offset);
            }
            // a[b]
            else {
                firstNode = createMemberInner(raw, firstNode, UNDEFINED, runtimeNodes, lookup, offset);
            }
        }
        else {
            // "xxx".length
            // format().a.b
            if (isLiteral) {
                firstNode = createMemberInner(raw, firstNode, join(staticNodes, RAW_DOT), UNDEFINED, lookup, offset);
            }
            // "xxx"[length]
            // format()[a]
            else {
                firstNode = createMemberInner(raw, firstNode, UNDEFINED, runtimeNodes, lookup, offset);
            }
        }
    }
    return firstNode;
}

const unary = {
    '+': TRUE,
    '-': TRUE,
    '~': TRUE,
    '!': TRUE,
    '!!': TRUE,
};
// 参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
const binary = {
    '*': 14,
    '/': 14,
    '%': 14,
    '+': 13,
    '-': 13,
    '<<': 12,
    '>>': 12,
    '>>>': 12,
    '<': 11,
    '<=': 11,
    '>': 11,
    '>=': 11,
    '==': 10,
    '!=': 10,
    '===': 10,
    '!==': 10,
    '&': 9,
    '^': 8,
    '|': 7,
    '&&': 6,
    '||': 5,
};

function compile(content) {
    if (!cache[content]) {
        const parser = new Parser(content);
        cache[content] = parser.scanTernary(CODE_EOF);
    }
    return cache[content];
}
class Parser {
    constructor(content) {
        const instance = this, { length } = content;
        instance.index = MINUS_ONE;
        instance.end = length;
        instance.code = CODE_EOF;
        instance.content = content;
        instance.go();
    }
    /**
     * 移动一个字符
     */
    go(step) {
        let instance = this, { index, end } = instance;
        index += step || 1;
        if (index >= 0 && index < end) {
            instance.code = codeAt(instance.content, index);
            instance.index = index;
        }
        else {
            instance.code = CODE_EOF;
            instance.index = index < 0 ? MINUS_ONE : end;
        }
    }
    /**
     * 跳过空白符
     */
    skip(step) {
        const instance = this, reversed = step && step < 0;
        // 如果表达式是 "   xyz   "，到达结尾后，如果希望 skip(-1) 回到最后一个非空白符
        // 必须先判断最后一个字符是空白符，否则碰到 "xyz" 这样结尾不是空白符的，其实不应该回退
        if (instance.code === CODE_EOF) {
            const oldIndex = instance.index;
            instance.go(step);
            // 如果跳一位之后不是空白符，还原，然后返回
            if (!isWhitespace(instance.code)) {
                instance.go(oldIndex - instance.index);
                return;
            }
        }
        // 逆向时，只有位置真的发生过变化才需要在停止时正向移动一位
        // 比如 (a) 如果调用 skip 前位于 )，调用 skip(-1) ，结果应该是原地不动
        // 为了解决这个问题，应该首先判断当前是不是空白符，如果不是，直接返回
        else if (!isWhitespace(instance.code)) {
            return;
        }
        // 如果是正向的，停在第一个非空白符左侧
        // 如果是逆向的，停在第一个非空白符右侧
        while (TRUE) {
            if (isWhitespace(instance.code)) {
                instance.go(step);
            }
            else {
                if (reversed) {
                    instance.go();
                }
                break;
            }
        }
    }
    /**
     * 判断当前字符
     */
    is(code) {
        return this.code === code;
    }
    /**
     * 截取一段字符串
     */
    pick(startIndex, endIndex) {
        return slice(this.content, startIndex, isDef(endIndex) ? endIndex : this.index);
    }
    /**
     * 尝试解析下一个 token
     */
    scanToken() {
        const instance = this, { code, index } = instance;
        if (isIdentifierStart(code)) {
            return instance.scanTail(index, [
                instance.scanIdentifier(index)
            ]);
        }
        if (isDigit(code)) {
            return instance.scanNumber(index);
        }
        switch (code) {
            case CODE_EOF:
                return;
            // 'x' "x"
            case CODE_SQUOTE:
            case CODE_DQUOTE:
                return instance.scanTail(index, [
                    instance.scanString(index, code)
                ]);
            // .1  ./  ../
            case CODE_DOT:
                instance.go();
                return isDigit(instance.code)
                    ? instance.scanNumber(index)
                    : instance.scanPath(index);
            // (xx)
            case CODE_OPAREN:
                instance.go();
                return instance.scanTernary(CODE_CPAREN);
            // [xx, xx]
            case CODE_OBRACK:
                return instance.scanTail(index, [
                    createArray(instance.scanTuple(index, CODE_CBRACK), instance.pick(index))
                ]);
            // { a: 'x', b: 'x' }
            case CODE_OBRACE:
                return instance.scanObject(index);
        }
        // 因为 scanOperator 会导致 index 发生变化，只能放在最后尝试
        const operator = instance.scanOperator(index);
        if (operator && unary[operator]) {
            const node = instance.scanTernary();
            if (node) {
                if (node.type === LITERAL) {
                    const value = node.value;
                    if (number(value)) {
                        // 类似 ' -1 ' 这样的右侧有空格，需要撤回来
                        instance.skip(MINUS_ONE);
                        return createLiteral(-value, instance.pick(index));
                    }
                }
                // 类似 ' -a ' 这样的右侧有空格，需要撤回来
                instance.skip(MINUS_ONE);
                return createUnary(operator, node, instance.pick(index));
            }
            {
                // 一元运算只有操作符没有表达式？
                instance.fatal(index, `Expression expected.`);
            }
        }
    }
    /**
     * 扫描数字
     *
     * 支持整数和小数
     *
     * @param startIndex
     * @return
     */
    scanNumber(startIndex) {
        const instance = this;
        while (isNumber(instance.code)) {
            instance.go();
        }
        const raw = instance.pick(startIndex);
        // 尝试转型，如果转型失败，则确定是个错误的数字
        if (numeric(raw)) {
            return createLiteral(+raw, raw);
        }
        {
            instance.fatal(startIndex, `Number expected.`);
        }
    }
    /**
     * 扫描字符串
     *
     * 支持反斜线转义引号
     *
     * @param startIndex
     * @param endCode
     */
    scanString(startIndex, endCode) {
        const instance = this;
        loop: while (TRUE) {
            // 这句有两个作用：
            // 1. 跳过开始的引号
            // 2. 驱动 index 前进
            instance.go();
            switch (instance.code) {
                // \" \'
                case CODE_BACKSLASH:
                    instance.go();
                    break;
                case endCode:
                    instance.go();
                    break loop;
                case CODE_EOF:
                    {
                        // 到头了，字符串还没解析完呢？
                        instance.fatal(startIndex, 'Unexpected end of text.');
                    }
                    break loop;
            }
        }
        // new Function 处理字符转义
        const raw = instance.pick(startIndex);
        return createLiteral(new Function(`return ${raw}`)(), raw);
    }
    /**
     * 扫描对象字面量
     *
     * @param startIndex
     */
    scanObject(startIndex) {
        let instance = this, keys = [], values = [], isKey = TRUE, node;
        // 跳过 {
        instance.go();
        loop: while (TRUE) {
            switch (instance.code) {
                case CODE_CBRACE:
                    instance.go();
                    {
                        // 对象的 keys 和 values 的长度不一致
                        if (keys.length !== values.length) {
                            instance.fatal(startIndex, 'The number of keys and values must be equal.');
                        }
                    }
                    break loop;
                case CODE_EOF:
                    {
                        // 到头了，对象还没解析完呢？
                        instance.fatal(startIndex, 'Unexpected end of text.');
                    }
                    break loop;
                // :
                case CODE_COLON:
                    instance.go();
                    isKey = FALSE;
                    break;
                // ,
                case CODE_COMMA:
                    instance.go();
                    isKey = TRUE;
                    break;
                default:
                    // 解析 key 的时候，node 可以为空，如 { } 或 { name: 'xx', }
                    // 解析 value 的时候，node 不能为空
                    node = instance.scanTernary();
                    if (isKey) {
                        if (node) {
                            // 处理 { key : value } key 后面的空格
                            instance.skip();
                            if (node.type === IDENTIFIER) {
                                push(keys, node.name);
                            }
                            else if (node.type === LITERAL) {
                                push(keys, node.value);
                            }
                            else {
                                {
                                    // 对象的 key 必须是字面量或标识符
                                    instance.fatal(startIndex, 'The key of an object must be a literal or identifier.');
                                }
                                break loop;
                            }
                        }
                    }
                    else if (node) {
                        // 处理 { key : value } value 后面的空格
                        instance.skip();
                        push(values, node);
                    }
                    // 类似这样 { key: }
                    else {
                        {
                            // 对象的值没找到
                            instance.fatal(startIndex, `The value of the object was not found.`);
                        }
                        break loop;
                    }
            }
        }
        return createObject(keys, values, instance.pick(startIndex));
    }
    /**
     * 扫描元组，即 `a, b, c` 这种格式，可以是参数列表，也可以是数组
     *
     * @param startIndex
     * @param endCode 元组的结束字符编码
     */
    scanTuple(startIndex, endCode) {
        let instance = this, nodes = [], node;
        // 跳过开始字符，如 [ 和 (
        instance.go();
        loop: while (TRUE) {
            switch (instance.code) {
                case endCode:
                    instance.go();
                    break loop;
                case CODE_EOF:
                    {
                        // 到头了，tuple 还没解析完呢？
                        instance.fatal(startIndex, 'Unexpected end of text.');
                    }
                    break loop;
                case CODE_COMMA:
                    instance.go();
                    break;
                default:
                    // 1. ( )
                    // 2. (1, 2, )
                    // 这三个例子都会出现 scanTernary 为空的情况
                    // 但是不用报错
                    node = instance.scanTernary();
                    if (node) {
                        // 为了解决 1 , 2 , 3 这样的写法
                        // 当解析出值后，先跳过后面的空格
                        instance.skip();
                        push(nodes, node);
                    }
            }
        }
        return nodes;
    }
    /**
     * 扫描路径，如 `./` 和 `../`
     *
     * 路径必须位于开头，如 ./../ 或 ，不存在 a/../b/../c 这样的情况，因为路径是用来切换或指定 context 的
     *
     * @param startIndex
     * @param prevNode
     */
    scanPath(startIndex) {
        let instance = this, nodes = [], name;
        // 进入此函数时，已确定前一个 code 是 CODE_DOT
        // 此时只需判断接下来是 ./ 还是 / 就行了
        while (TRUE) {
            // 要么是 current 要么是 parent
            name = KEYPATH_CURRENT;
            // ../
            if (instance.is(CODE_DOT)) {
                instance.go();
                name = KEYPATH_PARENT;
            }
            push(nodes, createIdentifier(name, name, nodes.length > 0));
            // 如果以 / 结尾，则命中 ./ 或 ../
            if (instance.is(CODE_SLASH)) {
                instance.go();
                // 没写错，这里不必强调 isIdentifierStart，数字开头也可以吧
                if (isIdentifierPart(instance.code)) {
                    push(nodes, instance.scanIdentifier(instance.index, TRUE));
                    return instance.scanTail(startIndex, nodes);
                }
                else if (instance.is(CODE_DOT)) {
                    // 先跳过第一个 .
                    instance.go();
                    // 继续循环
                }
                else {
                    // 类似 ./ 或 ../ 这样后面不跟标识符是想干嘛？报错可好？
                    {
                        instance.fatal(startIndex, `${last(nodes).raw}/ must be followed by an identifier.`);
                    }
                    break;
                }
            }
            // 类似 . 或 ..，可能就是想读取层级对象
            // 此处不用关心后面跟的具体是什么字符，那是其他函数的事情，就算报错也让别的函数去报
            // 此处也不用关心延展操作符，即 ...object，因为表达式引擎管不了这事，它没法把对象变成 attr1=value1 attr2=value2 的格式
            // 这应该是模板引擎该做的事
            else {
                break;
            }
        }
    }
    /**
     * 扫描变量
     */
    scanTail(startIndex, nodes) {
        let instance = this, node;
        /**
         * 标识符后面紧着的字符，可以是 ( . [，此外还存在各种组合，感受一下：
         *
         * a.b.c().length
         * a[b].c()()
         * a[b][c]()[d](e, f, g).length
         * [].length
         */
        loop: while (TRUE) {
            switch (instance.code) {
                // a(x)
                case CODE_OPAREN:
                    nodes = [
                        createCall(createMemberIfNeeded(instance.pick(startIndex), nodes), instance.scanTuple(instance.index, CODE_CPAREN), instance.pick(startIndex))
                    ];
                    break;
                // a.x
                case CODE_DOT:
                    instance.go();
                    // 接下来的字符，可能是数字，也可能是标识符，如果不是就报错
                    if (isIdentifierPart(instance.code)) {
                        // 无需识别关键字
                        push(nodes, instance.scanIdentifier(instance.index, TRUE));
                        break;
                    }
                    else {
                        {
                            // . 后面跟的都是啥玩意啊
                            instance.fatal(startIndex, 'Identifier or number expected.');
                        }
                        break loop;
                    }
                // a[]
                case CODE_OBRACK:
                    // 过掉 [
                    instance.go();
                    node = instance.scanTernary(CODE_CBRACK);
                    if (node) {
                        push(nodes, node);
                        break;
                    }
                    else {
                        // [] 内部不能为空
                        {
                            instance.fatal(startIndex, `[] is not allowed.`);
                        }
                        break loop;
                    }
                default:
                    break loop;
            }
        }
        return createMemberIfNeeded(instance.pick(startIndex), nodes);
    }
    /**
     * 扫描标识符
     *
     * @param startIndex
     * @param isProp 是否是对象的属性
     * @return
     */
    scanIdentifier(startIndex, isProp) {
        const instance = this;
        while (isIdentifierPart(instance.code)) {
            instance.go();
        }
        const raw = instance.pick(startIndex);
        return !isProp && raw in keywordLiterals
            ? createLiteral(keywordLiterals[raw], raw)
            : createIdentifier(raw, raw, isProp);
    }
    /**
     * 扫描运算符
     *
     * @param startIndex
     */
    scanOperator(startIndex) {
        const instance = this;
        switch (instance.code) {
            // /、%、~、^
            case CODE_DIVIDE:
            case CODE_MODULO:
            case CODE_WAVE:
            case CODE_XOR:
                instance.go();
                break;
            // *
            case CODE_MULTIPLY:
                instance.go();
                break;
            // +
            case CODE_PLUS:
                instance.go();
                {
                    // ++
                    if (instance.is(CODE_PLUS)) {
                        instance.fatal(startIndex, '++ is not supported.');
                    }
                }
                break;
            // -
            case CODE_MINUS:
                instance.go();
                {
                    // --
                    if (instance.is(CODE_MINUS)) {
                        instance.fatal(startIndex, '-- is not supported.');
                    }
                }
                break;
            // !、!!、!=、!==
            case CODE_NOT:
                instance.go();
                if (instance.is(CODE_NOT)) {
                    instance.go();
                }
                else if (instance.is(CODE_EQUAL)) {
                    instance.go();
                    if (instance.is(CODE_EQUAL)) {
                        instance.go();
                    }
                }
                break;
            // &、&&
            case CODE_AND:
                instance.go();
                if (instance.is(CODE_AND)) {
                    instance.go();
                }
                break;
            // |、||
            case CODE_OR:
                instance.go();
                if (instance.is(CODE_OR)) {
                    instance.go();
                }
                break;
            // ==、===
            case CODE_EQUAL:
                instance.go();
                if (instance.is(CODE_EQUAL)) {
                    instance.go();
                    if (instance.is(CODE_EQUAL)) {
                        instance.go();
                    }
                }
                // 一个等号要报错
                else {
                    instance.fatal(startIndex, 'Assignment statements are not supported.');
                }
                break;
            // <、<=、<<
            case CODE_LESS:
                instance.go();
                if (instance.is(CODE_EQUAL)
                    || instance.is(CODE_LESS)) {
                    instance.go();
                }
                break;
            // >、>=、>>、>>>
            case CODE_GREAT:
                instance.go();
                if (instance.is(CODE_EQUAL)) {
                    instance.go();
                }
                else if (instance.is(CODE_GREAT)) {
                    instance.go();
                    if (instance.is(CODE_GREAT)) {
                        instance.go();
                    }
                }
                break;
        }
        if (instance.index > startIndex) {
            return instance.pick(startIndex);
        }
    }
    /**
     * 扫描二元运算
     */
    scanBinary(startIndex) {
        // 二元运算，如 a + b * c / d，这里涉及运算符的优先级
        // 算法参考 https://en.wikipedia.org/wiki/Shunting-yard_algorithm
        let instance = this, 
        // 格式为 [ index1, node1, index2, node2, ... ]
        output = [], token, index, operator, operatorPrecedence, lastOperator, lastOperatorPrecedence;
        while (TRUE) {
            instance.skip();
            push(output, instance.index);
            token = instance.scanToken();
            if (token) {
                push(output, token);
                push(output, instance.index);
                instance.skip();
                operator = instance.scanOperator(instance.index);
                // 必须是二元运算符，一元不行
                if (operator && (operatorPrecedence = binary[operator])) {
                    // 比较前一个运算符
                    index = output.length - 4;
                    // 如果前一个运算符的优先级 >= 现在这个，则新建 Binary
                    // 如 a + b * c / d，当从左到右读取到 / 时，发现和前一个 * 优先级相同，则把 b * c 取出用于创建 Binary
                    if ((lastOperator = output[index])
                        && (lastOperatorPrecedence = binary[lastOperator])
                        && lastOperatorPrecedence >= operatorPrecedence) {
                        output.splice(index - 2, 5, createBinary(output[index - 2], lastOperator, output[index + 2], instance.pick(output[index - 3], output[index + 3])));
                    }
                    push(output, operator);
                    continue;
                }
                else {
                    operator = UNDEFINED;
                }
            }
            // 比如不支持的表达式，a++ 之类的
            else {
                if (operator) {
                    instance.fatal(startIndex, 'Invalid syntax.');
                }
            }
            // 没匹配到 token 或 operator 则跳出循环
            break;
        }
        // 类似 a + b * c 这种走到这会有 11 个
        // 此时需要从后往前遍历，因为确定后面的优先级肯定大于前面的
        while (TRUE) {
            // 最少的情况是 a + b，它有 7 个元素
            if (output.length >= 7) {
                index = output.length - 4;
                output.splice(index - 2, 5, createBinary(output[index - 2], output[index], output[index + 2], instance.pick(output[index - 3], output[index + 3])));
            }
            else {
                return output[1];
            }
        }
    }
    /**
     * 扫描三元运算
     *
     * @param endCode
     */
    scanTernary(endCode) {
        /**
         * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
         *
         * ?: 运算符的优先级几乎是最低的，比它低的只有四种： 赋值、yield、延展、逗号
         * 我们不支持这四种，因此可认为 ?: 优先级最低
         */
        const instance = this;
        instance.skip();
        let index = instance.index, test = instance.scanBinary(index), yes, no;
        if (instance.is(CODE_QUESTION)) {
            // 跳过 ?
            instance.go();
            yes = instance.scanBinary(index);
            if (instance.is(CODE_COLON)) {
                // 跳过 :
                instance.go();
                no = instance.scanBinary(index);
            }
            if (test && yes && no) {
                // 类似 ' a ? 1 : 0 ' 这样的右侧有空格，需要撤回来
                instance.skip(MINUS_ONE);
                test = createTernary(test, yes, no, instance.pick(index));
            }
            else {
                // 三元表达式语法错误
                instance.fatal(index, `Invalid ternary syntax.`);
            }
        }
        // 过掉结束字符
        if (isDef(endCode)) {
            instance.skip();
            if (instance.is(endCode)) {
                instance.go();
            }
            // 没匹配到结束字符要报错
            else {
                instance.fatal(index, `"${String.fromCharCode(endCode)}" expected, "${String.fromCharCode(instance.code)}" actually.`);
            }
        }
        return test;
    }
    fatal(start, message) {
        {
            fatal(`Error compiling expression\n\n${this.content}\n\nmessage: ${message}\n`);
        }
    }
}
const cache = {}, CODE_EOF = 0, //
CODE_DOT = 46, // .
CODE_COMMA = 44, // ,
CODE_SLASH = 47, // /
CODE_BACKSLASH = 92, // \
CODE_SQUOTE = 39, // '
CODE_DQUOTE = 34, // "
CODE_OPAREN = 40, // (
CODE_CPAREN = 41, // )
CODE_OBRACK = 91, // [
CODE_CBRACK = 93, // ]
CODE_OBRACE = 123, // {
CODE_CBRACE = 125, // }
CODE_QUESTION = 63, // ?
CODE_COLON = 58, // :
CODE_PLUS = 43, // +
CODE_MINUS = 45, // -
CODE_MULTIPLY = 42, // *
CODE_DIVIDE = 47, // /
CODE_MODULO = 37, // %
CODE_WAVE = 126, // ~
CODE_AND = 38, // &
CODE_OR = 124, // |
CODE_XOR = 94, // ^
CODE_NOT = 33, // !
CODE_LESS = 60, // <
CODE_EQUAL = 61, // =
CODE_GREAT = 62, // >
/**
 * 区分关键字和普通变量
 * 举个例子：a === true
 * 从解析器的角度来说，a 和 true 是一样的 token
 */
keywordLiterals = {};
keywordLiterals[RAW_TRUE] = TRUE;
keywordLiterals[RAW_FALSE] = FALSE;
keywordLiterals[RAW_NULL] = NULL;
keywordLiterals[RAW_UNDEFINED] = UNDEFINED;
/**
 * 是否是空白符，用下面的代码在浏览器测试一下
 *
 * ```
 * for (var i = 0; i < 200; i++) {
 *   console.log(i, String.fromCharCode(i))
 * }
 * ```
 *
 * 从 0 到 32 全是空白符，100 往上分布比较散且较少用，唯一需要注意的是 160
 *
 * 160 表示 non-breaking space
 * http://www.adamkoch.com/2009/07/25/white-space-and-character-160/
 */
function isWhitespace(code) {
    return (code > 0 && code < 33) || code === 160;
}
/**
 * 是否是数字
 */
function isDigit(code) {
    return code > 47 && code < 58; // 0...9
}
/**
 * 是否是数字
 */
function isNumber(code) {
    return isDigit(code) || code === CODE_DOT;
}
/**
 * 变量开始字符必须是 字母、下划线、$
 */
function isIdentifierStart(code) {
    return code === 36 // $
        || code === 95 // _
        || (code > 96 && code < 123) // a...z
        || (code > 64 && code < 91); // A...Z
}
/**
 * 变量剩余的字符必须是 字母、下划线、$、数字
 */
function isIdentifierPart(code) {
    return isIdentifierStart(code) || isDigit(code);
}

// 当前不位于 block 之间
const BLOCK_MODE_NONE = 1, 
// {{ x }}
BLOCK_MODE_SAFE = 2, 
// {{{ x }}}
BLOCK_MODE_UNSAFE = 3, 
// 缓存编译正则
patternCache$1 = {}, 
// 指令分隔符，如 on-click 和 lazy-click
directiveSeparator = '-', 
// 没有命名空间的事件
eventPattern = /^[_$a-z]([\w]+)?$/i, 
// 有命名空间的事件
eventNamespacePattern = /^[_$a-z]([\w]+)?\.[_$a-z]([\w]+)?$/i, 
// 换行符
// 比较神奇是，有时候你明明看不到换行符，却真的存在一个，那就是 \r
breaklinePattern = /^\s*[\n\r]\s*|\s*[\n\r]\s*$/g, 
// 区间遍历
rangePattern = /\s*(=>|->)\s*/, 
// 标签
tagPattern = /<(\/)?([$a-z][-a-z0-9]*)/i, 
// 注释
commentPattern = /<!--[\s\S]*?-->/g, 
// 开始注释
openCommentPattern = /^([\s\S]*?)<!--/, 
// 结束注释
closeCommentPattern = /-->([\s\S]*?)$/, 
// 属性的 name
// 支持 on-click.namespace="" 或 on-get-out="" 或 xml:xx=""
attributePattern = /^\s*([-.:\w]+)(['"])?(?:=(['"]))?/, 
// 自闭合标签
selfClosingTagPattern = /^\s*(\/)?>/;
/**
 * 截取前缀之后的字符串
 */
function slicePrefix(str, prefix) {
    return trim(slice(str, prefix.length));
}
function compile$1(content) {
    let nodeList = [], nodeStack = [], 
    // 持有 if/elseif/else 节点
    ifStack = [], currentElement, currentAttribute, length = content.length, 
    // 当前处理的位置
    index = 0, 
    // 下一段开始的位置
    nextIndex = 0, 
    // 开始定界符的位置，表示的是 {{ 的右侧位置
    openBlockIndex = 0, 
    // 结束定界符的位置，表示的是 }} 的左侧位置
    closeBlockIndex = 0, 
    // 当前正在处理或即将处理的 block 类型
    blockMode = BLOCK_MODE_NONE, 
    // mustache 注释可能出现嵌套插值的情况
    blockStack = [], indexList = [], code, startQuote, fatal$1 = function (msg) {
        {
            fatal(`Error compiling template\n\n${content}\n\nmessage: ${msg}`);
        }
    }, 
    /**
     * 常见的两种情况：
     *
     * <div>
     *    <input>1
     * </div>
     *
     * <div>
     *    <input>
     * </div>
     */
    popSelfClosingElementIfNeeded = function (popingTagName) {
        const lastNode = last(nodeStack);
        if (lastNode && lastNode.type === ELEMENT) {
            const element = lastNode;
            if (element.tag !== popingTagName
                && isSelfClosing(element.tag)) {
                popStack(element.type, element.tag);
            }
        }
    }, popStack = function (type, tagName) {
        const node = pop(nodeStack);
        if (node && node.type === type) {
            const { children } = node, 
            // 优化单个子节点
            child = children && children.length === 1 && children[0], isElement = type === ELEMENT, isAttribute = type === ATTRIBUTE, isProperty = type === PROPERTY, isDirective = type === DIRECTIVE;
            const currentBranch = last(nodeStack);
            if (currentBranch) {
                if (currentBranch.isStatic && !node.isStatic) {
                    currentBranch.isStatic = FALSE;
                }
                if (!currentBranch.isComplex) {
                    if (node.isComplex || isElement) {
                        currentBranch.isComplex = TRUE;
                    }
                    // <div {{#if xx}} xx{{/if}}>
                    else if (currentElement
                        && currentElement !== currentBranch
                        && (isAttribute || isProperty || isDirective)) {
                        currentBranch.isComplex = TRUE;
                    }
                }
            }
            {
                if (isElement) {
                    const element = node;
                    if (tagName && element.tag !== tagName) {
                        fatal$1(`End tag is "${tagName}"，but start tag is "${element.tag}".`);
                    }
                }
            }
            // 除了 helper.specialAttrs 里指定的特殊属性，attrs 里的任何节点都不能单独拎出来赋给 element
            // 因为 attrs 可能存在 if，所以每个 attr 最终都不一定会存在
            if (child) {
                switch (child.type) {
                    case TEXT:
                        // 属性的值如果是纯文本，直接获取文本值
                        // 减少渲染时的遍历
                        if (isElement) {
                            processElementSingleText(node, child);
                        }
                        else if (isAttribute) {
                            processAttributeSingleText(node, child);
                        }
                        else if (isProperty) {
                            processPropertySingleText(node, child);
                        }
                        else if (isDirective) {
                            processDirectiveSingleText(node, child);
                        }
                        break;
                    case EXPRESSION:
                        if (isElement) {
                            processElementSingleExpression(node, child);
                        }
                        else if (isAttribute) {
                            processAttributeSingleExpression(node, child);
                        }
                        else if (isProperty) {
                            processPropertySingleExpression(node, child);
                        }
                        else if (isDirective) {
                            processDirectiveSingleExpression(node, child);
                        }
                        break;
                }
            }
            // 大于 1 个子节点，即有插值或 if 写法
            else if (children) {
                if (isDirective) {
                    processDirectiveMultiChildren();
                }
                // 元素层级
                else if (!currentElement) {
                    removeComment(children);
                    if (!children.length) {
                        node.children = UNDEFINED;
                    }
                }
            }
            // 0 个子节点
            else if (currentElement) {
                if (isAttribute) {
                    processAttributeEmptyChildren(currentElement, node);
                }
                else if (isProperty) {
                    processPropertyEmptyChildren(currentElement, node);
                }
                else if (isDirective) {
                    processDirectiveEmptyChildren(currentElement, node);
                }
            }
            if (type === EACH) {
                checkEach(node);
            }
            else if (type === PARTIAL) {
                checkPartial(node);
            }
            else if (isElement) {
                checkElement(node);
            }
            else if (currentElement) {
                if (isAttribute) {
                    if (isSpecialAttr(currentElement, node)) {
                        bindSpecialAttr(currentElement, node);
                    }
                }
                else if (isDirective) {
                    checkDirective(currentElement, node);
                }
            }
            return node;
        }
        // 出栈节点类型不匹配
        {
            fatal$1(`The poping node type is not as expected.`);
        }
    }, removeComment = function (children) {
        // 类似 <!-- xx {{name}} yy {{age}} zz --> 这样的注释里包含插值
        // 按照目前的解析逻辑，是根据定界符进行模板分拆
        // 一旦出现插值，children 长度必然大于 1
        let openIndex = MINUS_ONE, openText = EMPTY_STRING, closeIndex = MINUS_ONE, closeText = EMPTY_STRING;
        each(children, function (child, index) {
            if (child.type === TEXT) {
                if (closeIndex >= 0) {
                    openText = child.text;
                    // 处理 <!-- <!-- 这样有多个的情况
                    while (openCommentPattern.test(openText)) {
                        openText = RegExp.$1;
                        openIndex = index;
                    }
                    if (openIndex >= 0) {
                        // openIndex 肯定小于 closeIndex，因为完整的注释在解析过程中会被干掉
                        // 只有包含插值的注释才会走进这里
                        // 现在要确定开始和结束的文本节点，是否包含正常文本
                        if (openText) {
                            children[openIndex].text = openText;
                            openIndex++;
                        }
                        if (closeText) {
                            children[closeIndex].text = closeText;
                            closeIndex--;
                        }
                        children.splice(openIndex, closeIndex - openIndex + 1);
                        openIndex = closeIndex = MINUS_ONE;
                    }
                }
                else {
                    closeText = child.text;
                    // 处理 --> --> 这样有多个的情况
                    while (closeCommentPattern.test(closeText)) {
                        closeText = RegExp.$1;
                        closeIndex = index;
                    }
                }
            }
        }, TRUE);
    }, processDirectiveMultiChildren = function () {
        // 不支持 on-click="1{{xx}}2" 或是 on-click="1{{#if x}}x{{else}}y{{/if}}2"
        // 1. 很难做性能优化
        // 2. 全局搜索不到事件名，不利于代码维护
        // 3. 不利于编译成静态函数
        {
            fatal$1(`{{ and }} are not allowed in directive.`);
        }
    }, processElementSingleText = function (element, child) {
        // processElementSingleText 和 processElementSingleExpression
        // 不把元素子节点智能转换为 textContent property
        // 因为子节点还有 <div>1{{a}}{{b}}</div> 这样的情况
        // 还是在序列化的时候统一处理比较好
        // 唯独需要在这特殊处理的是 html 实体
        // 但这只是 WEB 平台的特殊逻辑，所以丢给 platform 处理
        if (setElementText(element, child.text)) {
            element.children = UNDEFINED;
        }
    }, processElementSingleExpression = function (element, child) {
        if (!element.isComponent && !element.slot && !child.safe) {
            element.html = child.expr;
            element.children = UNDEFINED;
        }
    }, processPropertyEmptyChildren = function (element, prop) {
        if (prop.hint === HINT_BOOLEAN) {
            prop.value = TRUE;
        }
        else {
            // string 或 number 类型的属性，如果不写值，直接忽略
            replaceChild(prop);
        }
    }, processPropertySingleText = function (prop, child) {
        const { text } = child;
        if (prop.hint === HINT_NUMBER) {
            prop.value = toNumber(text);
        }
        else if (prop.hint === HINT_BOOLEAN) {
            prop.value = text === RAW_TRUE || text === prop.name;
        }
        else {
            prop.value = text;
        }
        prop.children = UNDEFINED;
    }, processPropertySingleExpression = function (prop, child) {
        const { expr } = child;
        prop.expr = expr;
        prop.children = UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr.type === IDENTIFIER) {
            prop.binding = TRUE;
        }
    }, processAttributeEmptyChildren = function (element, attr) {
        if (isSpecialAttr(element, attr)) {
            {
                fatal$1(`The value of "${attr.name}" is empty.`);
            }
        }
        else {
            attr.value = getAttributeDefaultValue(element, attr.name);
        }
    }, processAttributeSingleText = function (attr, child) {
        attr.value = child.text;
        attr.children = UNDEFINED;
    }, processAttributeSingleExpression = function (attr, child) {
        const { expr } = child;
        attr.expr = expr;
        attr.children = UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr.type === IDENTIFIER) {
            attr.binding = TRUE;
        }
    }, processDirectiveEmptyChildren = function (element, directive) {
        directive.value = TRUE;
    }, processDirectiveSingleText = function (directive, child) {
        let { text } = child, 
        // model="xx" model="this.x" 值只能是标识符或 Member
        isModel = directive.ns === DIRECTIVE_MODEL, 
        // lazy 的值必须是大于 0 的数字
        isLazy = directive.ns === DIRECTIVE_LAZY, 
        // 校验事件名称
        // 且命名空间不能用 native
        isEvent = directive.ns === DIRECTIVE_EVENT, 
        // 自定义指令运行不合法的表达式
        isCustom = directive.ns === DIRECTIVE_CUSTOM, 
        // 指令的值是纯文本，可以预编译表达式，提升性能
        expr, error;
        try {
            expr = compile(text);
        }
        catch (e) {
            error = e;
        }
        if (expr) {
            {
                const { raw } = expr;
                if (isLazy) {
                    if (expr.type !== LITERAL
                        || !number(expr.value)
                        || expr.value <= 0) {
                        fatal$1(`The value of lazy must be a number greater than 0.`);
                    }
                }
                // 如果指令表达式是函数调用，则只能调用方法（难道还有别的可以调用的吗？）
                else if (expr.type === CALL) {
                    if (expr.name.type !== IDENTIFIER) {
                        fatal$1('The method name that appear on directive must be an identifier.');
                    }
                }
                // 上面检测过方法调用，接下来事件指令只需要判断是否以下两种格式：
                // on-click="name" 或 on-click="name.namespace"
                else if (isEvent) {
                    if (eventPattern.test(raw) || eventNamespacePattern.test(raw)) {
                        // native 有特殊用处，不能给业务层用
                        if (eventNamespacePattern.test(raw)
                            && raw.split(RAW_DOT)[1] === MODIFER_NATIVE) {
                            fatal$1(`The event namespace "${MODIFER_NATIVE}" is not permitted.`);
                        }
                        // <Button on-click="click"> 这种写法没有意义
                        if (currentElement
                            && currentElement.isComponent
                            && directive.name === raw) {
                            fatal$1(`The event name listened and fired can't be the same.`);
                        }
                    }
                    // 事件转换名称只能是 [name] 或 [name.namespace] 格式
                    else {
                        fatal$1('The event name and namespace must be an identifier.');
                    }
                }
                if (isModel && expr.type !== IDENTIFIER) {
                    fatal$1(`The value of the model must be an identifier.`);
                }
            }
            directive.expr = expr;
            directive.value = expr.type === LITERAL
                ? expr.value
                : text;
        }
        else {
            {
                if (!isCustom) {
                    throw error;
                }
            }
            directive.value = text;
        }
        directive.children = UNDEFINED;
    }, processDirectiveSingleExpression = function (directive, child) {
        {
            fatal$1(`{{ and }} are not allowed in a directive value.`);
        }
    }, checkCondition = function (condition) {
        let currentNode = condition, prevNode, hasChildren, hasNext;
        while (TRUE) {
            if (currentNode.children) {
                if (!hasNext) {
                    if (currentNode.next) {
                        delete currentNode.next;
                    }
                }
                hasChildren = hasNext = TRUE;
            }
            prevNode = currentNode.prev;
            if (prevNode) {
                // prev 仅仅用在 checkCondition 函数中
                // 用完就可以删掉了
                delete currentNode.prev;
                currentNode = prevNode;
            }
            else {
                break;
            }
        }
        // 每个条件都是空内容，则删掉整个 if
        if (!hasChildren) {
            replaceChild(currentNode);
        }
    }, checkEach = function (each) {
        // 没内容就干掉
        if (!each.children) {
            replaceChild(each);
        }
    }, checkPartial = function (partial) {
        // 没内容就干掉
        if (!partial.children) {
            replaceChild(partial);
        }
    }, checkElement = function (element) {
        const { tag, slot } = element, isTemplate = tag === RAW_TEMPLATE;
        {
            if (isTemplate) {
                if (element.key) {
                    fatal$1(`The "key" is not supported in <template>.`);
                }
                else if (element.ref) {
                    fatal$1(`The "ref" is not supported in <template>.`);
                }
                else if (element.attrs) {
                    fatal$1(`The attributes and directives are not supported in <template>.`);
                }
                else if (!slot) {
                    fatal$1(`The "slot" is required in <template>.`);
                }
            }
        }
        // 没有子节点，则意味着这个插槽没任何意义
        if (isTemplate && slot && !element.children) {
            replaceChild(element);
        }
        // <slot /> 如果没写 name，自动加上默认名称
        else if (tag === RAW_SLOT && !element.name) {
            element.name = SLOT_NAME_DEFAULT;
        }
        else {
            compatElement(element);
        }
    }, checkDirective = function (element, directive) {
        {
            // model 不能写在 if 里，影响节点的静态结构
            if (directive.ns === DIRECTIVE_MODEL) {
                if (last(nodeStack) !== element) {
                    fatal$1(`The "model" can't be used in an if block.`);
                }
            }
        }
    }, bindSpecialAttr = function (element, attr) {
        const { name, value } = attr, 
        // 这三个属性值要求是字符串
        isStringValueRequired = name === RAW_NAME || name === RAW_SLOT;
        {
            // 因为要拎出来给 element，所以不能用 if
            if (last(nodeStack) !== element) {
                fatal$1(`The "${name}" can't be used in an if block.`);
            }
            // 对于所有特殊属性来说，空字符串是肯定不行的，没有任何意义
            if (value === EMPTY_STRING) {
                fatal$1(`The value of "${name}" is empty.`);
            }
            else if (isStringValueRequired && falsy$1(value)) {
                fatal$1(`The value of "${name}" can only be a string literal.`);
            }
        }
        element[name] = isStringValueRequired ? value : attr;
        replaceChild(attr);
    }, isSpecialAttr = function (element, attr) {
        return specialAttrs[attr.name]
            || element.tag === RAW_SLOT && attr.name === RAW_NAME;
    }, replaceChild = function (oldNode, newNode) {
        let currentBranch = last(nodeStack), isAttr, list, index;
        if (currentBranch) {
            isAttr = currentElement && currentElement === currentBranch;
            list = isAttr
                ? currentBranch.attrs
                : currentBranch.children;
        }
        else {
            list = nodeList;
        }
        if (list) {
            index = indexOf(list, oldNode);
            if (index >= 0) {
                if (newNode) {
                    list[index] = newNode;
                }
                else {
                    list.splice(index, 1);
                    if (currentBranch && !list.length) {
                        if (isAttr) {
                            delete currentBranch.attrs;
                        }
                        else {
                            currentBranch.children = UNDEFINED;
                        }
                    }
                }
            }
        }
    }, addChild = function (node) {
        /**
         * <div>
         *    <input>
         *    <div></div>
         * </div>
         *
         * <div>
         *    <input>xxx
         * </div>
         */
        if (!currentElement) {
            popSelfClosingElementIfNeeded();
        }
        const type = node.type, currentBranch = last(nodeStack);
        // else 系列只是 if 的递进节点，不需要加入 nodeList
        if (type === ELSE || type === ELSE_IF) {
            const lastNode = pop(ifStack);
            if (lastNode) {
                // 方便 checkCondition 逆向遍历
                node.prev = lastNode;
                // lastNode 只能是 if 或 else if 节点
                if (lastNode.type === ELSE_IF || lastNode.type === IF) {
                    lastNode.next = node;
                    popStack(lastNode.type);
                    push(ifStack, node);
                }
                else if (type === ELSE_IF) {
                    {
                        fatal$1('The "else" block must not be followed by an "else if" block.');
                    }
                }
                else {
                    fatal$1(`The "else" block can't appear more than once in a conditional statement.`);
                }
            }
            else {
                fatal$1('The "if" block is required.');
            }
        }
        else {
            if (currentBranch) {
                push(
                // 这里不能写 currentElement && !currentAttribute，举个例子
                //
                // <div id="x" {{#if}} name="xx" alt="xx" {{/if}}
                //
                // 当 name 属性结束后，条件满足，但此时已不是元素属性层级了
                currentElement && currentBranch.type === ELEMENT
                    ? currentElement.attrs || (currentElement.attrs = [])
                    : currentBranch.children || (currentBranch.children = []), node);
            }
            else {
                push(nodeList, node);
            }
            if (type === IF) {
                // 只要是 if 节点，并且和 element 同级，就加上 stub
                // 方便 virtual dom 进行对比
                // 这个跟 virtual dom 的实现原理密切相关，不加 stub 会有问题
                if (!currentElement) {
                    node.stub = TRUE;
                }
                push(ifStack, node);
            }
        }
        if (node.isLeaf) {
            // 当前树枝节点如果是静态的，一旦加入了一个非静态子节点，改变当前树枝节点的 isStatic
            // 这里不处理树枝节点的进栈，因为当树枝节点出栈时，还有一次处理机会，那时它的 isStatic 已确定下来，不会再变
            if (currentBranch) {
                if (currentBranch.isStatic && !node.isStatic) {
                    currentBranch.isStatic = FALSE;
                }
                // 当前树枝节点是简单节点，一旦加入了一个复杂子节点，当前树枝节点变为复杂节点
                if (!currentBranch.isComplex && node.isComplex) {
                    currentBranch.isComplex = TRUE;
                }
            }
        }
        else {
            push(nodeStack, node);
        }
    }, addTextChild = function (text) {
        // [注意]
        // 这里不能随便删掉
        // 因为收集组件的子节点会受影响，举个例子：
        // <Component>
        //
        // </Component>
        // 按现在的逻辑，这样的组件是没有子节点的，因为在这里过滤掉了，因此该组件没有 slot
        // 如果这里放开了，组件就会有一个 slot
        // trim 文本开始和结束位置的换行符
        text = text.replace(breaklinePattern, EMPTY_STRING);
        if (text) {
            addChild(createText(text));
        }
    }, htmlParsers = [
        function (content) {
            if (!currentElement) {
                const match = content.match(tagPattern);
                // 必须以 <tag 开头才能继续
                // 如果 <tag 前面有别的字符，会走进第四个 parser
                if (match && match.index === 0) {
                    const tag = match[2];
                    if (match[1] === '/') {
                        /**
                         * 处理可能存在的自闭合元素，如下
                         *
                         * <div>
                         *    <input>
                         * </div>
                         */
                        popSelfClosingElementIfNeeded(tag);
                        popStack(ELEMENT, tag);
                    }
                    else {
                        /**
                         * template 只能写在组件的第一级，如下：
                         *
                         * <Component>
                         *   <template slot="xx">
                         *     111
                         *   </template>
                         * </Component>
                         */
                        {
                            if (tag === RAW_TEMPLATE) {
                                const lastNode = last(nodeStack);
                                if (!lastNode || !lastNode.isComponent) {
                                    fatal$1('<template> can only be used within an component children.');
                                }
                            }
                        }
                        const node = createElement$1(tag);
                        addChild(node);
                        currentElement = node;
                    }
                    return match[0];
                }
            }
        },
        // 处理标签的 > 或 />，不论开始还是结束标签
        function (content) {
            const match = content.match(selfClosingTagPattern);
            if (match) {
                // 处理开始标签的 > 或 />
                if (currentElement && !currentAttribute) {
                    // 自闭合标签
                    if (match[1] === '/') {
                        popStack(currentElement.type, currentElement.tag);
                    }
                    currentElement = UNDEFINED;
                }
                // 处理结束标签的 >
                return match[0];
            }
        },
        // 处理 attribute directive 的 name 部分
        function (content) {
            // 当前在 element 层级
            if (currentElement && !currentAttribute) {
                const match = content.match(attributePattern);
                if (match) {
                    // <div class="11 name="xxx"></div>
                    // 这里会匹配上 xxx"，match[2] 就是那个引号
                    {
                        if (match[2]) {
                            fatal$1(`The previous attribute is not end.`);
                        }
                    }
                    let node, name = match[1];
                    if (name === DIRECTIVE_MODEL || name === RAW_TRANSITION) {
                        node = createDirective(EMPTY_STRING, name);
                    }
                    // 这里要用 on- 判断前缀，否则 on 太容易重名了
                    else if (startsWith(name, DIRECTIVE_ON + directiveSeparator)) {
                        let event = slicePrefix(name, DIRECTIVE_ON + directiveSeparator);
                        {
                            if (!event) {
                                fatal$1('The event name is required.');
                            }
                        }
                        const [directiveName, diectiveModifier] = camelize(event).split(RAW_DOT);
                        node = createDirective(directiveName, DIRECTIVE_EVENT, diectiveModifier);
                    }
                    // 当一个元素绑定了多个事件时，可分别指定每个事件的 lazy
                    // 当只有一个事件时，可简写成 lazy
                    // <div on-click="xx" lazy-click
                    else if (startsWith(name, DIRECTIVE_LAZY)) {
                        let lazy = slicePrefix(name, DIRECTIVE_LAZY);
                        if (startsWith(lazy, directiveSeparator)) {
                            lazy = slicePrefix(lazy, directiveSeparator);
                        }
                        node = createDirective(lazy ? camelize(lazy) : EMPTY_STRING, DIRECTIVE_LAZY);
                    }
                    // 这里要用 o- 判断前缀，否则 o 太容易重名了
                    else if (startsWith(name, DIRECTIVE_CUSTOM + directiveSeparator)) {
                        const custom = slicePrefix(name, DIRECTIVE_CUSTOM + directiveSeparator);
                        {
                            if (!custom) {
                                fatal$1('The directive name is required.');
                            }
                        }
                        const [directiveName, diectiveModifier] = camelize(custom).split(RAW_DOT);
                        node = createDirective(directiveName, DIRECTIVE_CUSTOM, diectiveModifier);
                    }
                    else {
                        node = createAttribute$1(currentElement, name);
                    }
                    addChild(node);
                    // 这里先记下，下一个 handler 要匹配结束引号
                    startQuote = match[3];
                    // 有属性值才需要设置 currentAttribute，便于后续收集属性值
                    if (startQuote) {
                        currentAttribute = node;
                    }
                    else {
                        popStack(node.type);
                    }
                    return match[0];
                }
            }
        },
        function (content) {
            let text, match;
            // 处理 attribute directive 的 value 部分
            if (currentAttribute && startQuote) {
                match = content.match(patternCache$1[startQuote] || (patternCache$1[startQuote] = new RegExp(startQuote)));
                // 有结束引号
                if (match) {
                    text = slice(content, 0, match.index);
                    addTextChild(text);
                    text += startQuote;
                    // attribute directive 结束了
                    // 此时如果一个值都没收集到，需设置一个空字符串
                    // 否则无法区分 <div a b=""> 中的 a 和 b
                    if (!currentAttribute.children) {
                        addChild(createText(EMPTY_STRING));
                    }
                    popStack(currentAttribute.type);
                    currentAttribute = UNDEFINED;
                }
                // 没有结束引号，整段匹配
                // 如 id="1{{x}}2" 中的 1
                else if (blockMode !== BLOCK_MODE_NONE) {
                    text = content;
                    addTextChild(text);
                }
                // 没找到结束引号
                else {
                    fatal$1(`Unterminated quoted string in "${currentAttribute.name}".`);
                }
            }
            // 如果不加判断，类似 <div {{...obj}}> 这样写，会把空格当做一个属性
            // 收集文本只有两处：属性值、元素内容
            // 属性值通过上面的 if 处理过了，这里只需要处理元素内容
            else if (!currentElement) {
                // 获取 <tag 前面的字符
                match = content.match(tagPattern);
                // 元素层级的注释都要删掉
                if (match) {
                    text = slice(content, 0, match.index);
                    if (text) {
                        addTextChild(text.replace(commentPattern, EMPTY_STRING));
                    }
                }
                else {
                    text = content;
                    addTextChild(text.replace(commentPattern, EMPTY_STRING));
                }
            }
            else {
                {
                    if (trim(content)) {
                        fatal$1(`Invalid character is found in <${currentElement.tag}> attribute level.`);
                    }
                }
                text = content;
            }
            return text;
        },
    ], blockParsers = [
        // {{#each xx:index}}
        function (source) {
            if (startsWith(source, SYNTAX_EACH)) {
                {
                    if (currentElement) {
                        fatal$1(currentAttribute
                            ? `The "each" block can't be appear in an attribute value.`
                            : `The "each" block can't be appear in attribute level.`);
                    }
                }
                source = slicePrefix(source, SYNTAX_EACH);
                const terms = source.replace(/\s+/g, EMPTY_STRING).split(':');
                if (terms[0]) {
                    const literal = trim(terms[0]), index = trim(terms[1]), match = literal.match(rangePattern);
                    if (match) {
                        const parts = literal.split(rangePattern), from = compile(parts[0]), to = compile(parts[2]);
                        if (from && to) {
                            return createEach(from, to, trim(match[1]) === '=>', index);
                        }
                    }
                    else {
                        const expr = compile(literal);
                        if (expr) {
                            return createEach(expr, UNDEFINED, FALSE, index);
                        }
                    }
                }
                {
                    fatal$1(`Invalid each`);
                }
            }
        },
        // {{#import name}}
        function (source) {
            if (startsWith(source, SYNTAX_IMPORT)) {
                source = slicePrefix(source, SYNTAX_IMPORT);
                if (source) {
                    if (!currentElement) {
                        return createImport(source);
                    }
                    else {
                        fatal$1(currentAttribute
                            ? `The "import" block can't be appear in an attribute value.`
                            : `The "import" block can't be appear in attribute level.`);
                    }
                }
                {
                    fatal$1(`Invalid import`);
                }
            }
        },
        // {{#partial name}}
        function (source) {
            if (startsWith(source, SYNTAX_PARTIAL)) {
                source = slicePrefix(source, SYNTAX_PARTIAL);
                if (source) {
                    if (!currentElement) {
                        return createPartial(source);
                    }
                    else {
                        fatal$1(currentAttribute
                            ? `The "partial" block can't be appear in an attribute value.`
                            : `The "partial" block can't be appear in attribute level.`);
                    }
                }
                {
                    fatal$1(`Invalid partial`);
                }
            }
        },
        // {{#if expr}}
        function (source) {
            if (startsWith(source, SYNTAX_IF)) {
                source = slicePrefix(source, SYNTAX_IF);
                const expr = compile(source);
                if (expr) {
                    return createIf(expr);
                }
                {
                    fatal$1(`Invalid if`);
                }
            }
        },
        // {{else if expr}}
        function (source) {
            if (startsWith(source, SYNTAX_ELSE_IF)) {
                source = slicePrefix(source, SYNTAX_ELSE_IF);
                const expr = compile(source);
                if (expr) {
                    return createElseIf(expr);
                }
                {
                    fatal$1(`Invalid else if`);
                }
            }
        },
        // {{else}}
        function (source) {
            if (startsWith(source, SYNTAX_ELSE)) {
                source = slicePrefix(source, SYNTAX_ELSE);
                if (!trim(source)) {
                    return createElse();
                }
                {
                    fatal$1(`The "else" must not be followed by anything.`);
                }
            }
        },
        // {{...obj}}
        function (source) {
            if (startsWith(source, SYNTAX_SPREAD)) {
                source = slicePrefix(source, SYNTAX_SPREAD);
                const expr = compile(source);
                if (expr) {
                    if (currentElement && currentElement.isComponent) {
                        return createSpread(expr, expr.type === IDENTIFIER);
                    }
                    else {
                        fatal$1(`The spread can only be used by a component.`);
                    }
                }
                {
                    fatal$1(`Invalid spread`);
                }
            }
        },
        // {{expr}}
        function (source) {
            if (!SYNTAX_COMMENT.test(source)) {
                source = trim(source);
                const expr = compile(source);
                if (expr) {
                    return createExpression(expr, blockMode === BLOCK_MODE_SAFE);
                }
                {
                    fatal$1(`Invalid expression`);
                }
            }
        },
    ], parseHtml = function (code) {
        while (code) {
            each(htmlParsers, function (parse) {
                const match = parse(code);
                if (match) {
                    code = slice(code, match.length);
                    return FALSE;
                }
            });
        }
    }, parseBlock = function (code) {
        if (charAt(code) === '/') {
            /**
             * 处理可能存在的自闭合元素，如下
             *
             * {{#if xx}}
             *    <input>
             * {{/if}}
             */
            popSelfClosingElementIfNeeded();
            const name = slice(code, 1);
            let type = name2Type[name], isCondition = FALSE;
            if (type === IF) {
                const node = pop(ifStack);
                if (node) {
                    type = node.type;
                    isCondition = TRUE;
                }
                else {
                    fatal$1(`The "if" block is closing, but it does't opened.`);
                }
            }
            const node = popStack(type);
            if (node && isCondition) {
                checkCondition(node);
            }
        }
        else {
            // 开始下一个 block 或表达式
            each(blockParsers, function (parse) {
                const node = parse(code);
                if (node) {
                    addChild(node);
                    return FALSE;
                }
            });
        }
    }, closeBlock = function () {
        // 确定开始和结束定界符能否配对成功，即 {{ 对 }}，{{{ 对 }}}
        // 这里不能动 openBlockIndex 和 closeBlockIndex，因为等下要用他俩 slice
        index = closeBlockIndex + 2;
        // 这里要用 <=，因为很可能到头了
        if (index <= length) {
            if (index < length && charAt(content, index) === '}') {
                if (blockMode === BLOCK_MODE_UNSAFE) {
                    nextIndex = index + 1;
                }
                else {
                    fatal$1(`{{ and }}} is not a pair.`);
                }
            }
            else {
                if (blockMode === BLOCK_MODE_SAFE) {
                    nextIndex = index;
                }
                else {
                    fatal$1(`{{{ and }} is not a pair.`);
                }
            }
            pop(blockStack);
            // }} 左侧的位置
            addIndex(closeBlockIndex);
            openBlockIndex = indexOf$1(content, '{{', nextIndex);
            closeBlockIndex = indexOf$1(content, '}}', nextIndex);
            // 如果碰到连续的结束定界符，继续 close
            if (closeBlockIndex >= nextIndex
                && (openBlockIndex < 0 || closeBlockIndex < openBlockIndex)) {
                return closeBlock();
            }
        }
        else {
            // 到头了
            return TRUE;
        }
    }, addIndex = function (index) {
        if (!blockStack.length) {
            push(indexList, index);
        }
    };
    // 因为存在 mustache 注释内包含插值的情况
    // 这里把流程设计为先标记切片的位置，标记过程中丢弃无效的 block
    // 最后处理有效的 block
    while (TRUE) {
        addIndex(nextIndex);
        openBlockIndex = indexOf$1(content, '{{', nextIndex);
        if (openBlockIndex >= nextIndex) {
            blockMode = BLOCK_MODE_SAFE;
            // {{ 左侧的位置
            addIndex(openBlockIndex);
            // 跳过 {{
            openBlockIndex += 2;
            // {{ 后面总得有内容吧
            if (openBlockIndex < length) {
                if (charAt(content, openBlockIndex) === '{') {
                    blockMode = BLOCK_MODE_UNSAFE;
                    openBlockIndex++;
                }
                // {{ 右侧的位置
                addIndex(openBlockIndex);
                // block 是否安全
                addIndex(blockMode);
                // 打开一个 block 就入栈一个
                push(blockStack, TRUE);
                if (openBlockIndex < length) {
                    closeBlockIndex = indexOf$1(content, '}}', openBlockIndex);
                    if (closeBlockIndex >= openBlockIndex) {
                        // 注释可以嵌套，如 {{！  {{xx}} {{! {{xx}} }}  }}
                        nextIndex = indexOf$1(content, '{{', openBlockIndex);
                        if (nextIndex < 0 || closeBlockIndex < nextIndex) {
                            if (closeBlock()) {
                                break;
                            }
                        }
                    }
                    else {
                        fatal$1('The end delimiter is not found.');
                    }
                }
                else {
                    // {{{ 后面没字符串了？
                    fatal$1('Unterminated template literal.');
                }
            }
            else {
                // {{ 后面没字符串了？
                fatal$1('Unterminated template literal.');
            }
        }
        else {
            break;
        }
    }
    for (let i = 0, length = indexList.length; i < length; i += 5) {
        index = indexList[i];
        // {{ 左侧的位置
        openBlockIndex = indexList[i + 1];
        if (openBlockIndex) {
            parseHtml(slice(content, index, openBlockIndex));
        }
        // {{ 右侧的位置
        openBlockIndex = indexList[i + 2];
        blockMode = indexList[i + 3];
        closeBlockIndex = indexList[i + 4];
        if (closeBlockIndex) {
            code = trim(slice(content, openBlockIndex, closeBlockIndex));
            // 不用处理 {{ }} 和 {{{ }}} 这种空 block
            if (code) {
                parseBlock(code);
            }
        }
        else {
            blockMode = BLOCK_MODE_NONE;
            parseHtml(slice(content, index));
        }
    }
    if (nodeStack.length) {
        /**
         * 处理可能存在的自闭合元素，如下
         *
         * <input>
         */
        popSelfClosingElementIfNeeded();
        {
            if (nodeStack.length) {
                fatal$1('Some nodes is still in the stack.');
            }
        }
    }
    if (nodeList.length > 0) {
        removeComment(nodeList);
    }
    return nodeList;
}

const UNDEFINED$1 = 'z';
const TRUE$1 = '!0';
const FALSE$1 = '!1';
const COMMA = ',';
const COLON = ':';
const PLUS = '+';
const AND = '&&';
const QUESTION = '?';
const NOT = '!';
const EMPTY = '""';
const RETURN = 'return ';
/**
 * 目的是 保证调用参数顺序稳定，减少运行时判断
 */
function trimArgs(list) {
    let args = [], removable = TRUE;
    each(list, function (arg) {
        if (isDef(arg)) {
            removable = FALSE;
            unshift(args, arg);
        }
        else if (!removable) {
            unshift(args, UNDEFINED$1);
        }
    }, TRUE);
    return args;
}
function toObject$1(fields) {
    return `{${join(fields, COMMA)}}`;
}
function toArray$1(items) {
    return `[${join(items, COMMA)}]`;
}
function toCall(name, args) {
    return `${name}(${join(trimArgs(args), COMMA)})`;
}
function toString$1(value) {
    return JSON.stringify(value);
}
function toFunction(args, code) {
    return `${RAW_FUNCTION}(${args}){var ${UNDEFINED$1}=void 0;${RETURN}${code}}`;
}

var generator = /*#__PURE__*/Object.freeze({
  UNDEFINED: UNDEFINED$1,
  TRUE: TRUE$1,
  FALSE: FALSE$1,
  COMMA: COMMA,
  COLON: COLON,
  PLUS: PLUS,
  AND: AND,
  QUESTION: QUESTION,
  NOT: NOT,
  EMPTY: EMPTY,
  RETURN: RETURN,
  toObject: toObject$1,
  toArray: toArray$1,
  toCall: toCall,
  toString: toString$1,
  toFunction: toFunction
});

function generate(node, renderIdentifier, renderMemberKeypath, renderMemberLiteral, renderCall, holder, depIgnore, stack, inner) {
    let value, isSpecialNode = FALSE, generateChildNode = function (node) {
        return generate(node, renderIdentifier, renderMemberKeypath, renderMemberLiteral, renderCall, holder, depIgnore, stack, TRUE);
    };
    switch (node.type) {
        case LITERAL:
            value = toString$1(node.value);
            break;
        case UNARY:
            value = node.operator + generateChildNode(node.node);
            break;
        case BINARY:
            value = generateChildNode(node.left)
                + node.operator
                + generateChildNode(node.right);
            break;
        case TERNARY:
            value = generateChildNode(node.test)
                + QUESTION
                + generateChildNode(node.yes)
                + COLON
                + generateChildNode(node.no);
            break;
        case ARRAY:
            const items = node.nodes.map(generateChildNode);
            value = toArray$1(items);
            break;
        case OBJECT:
            const fields = [];
            each(node.keys, function (key, index) {
                push(fields, toString$1(key)
                    + COLON
                    + generateChildNode(node.values[index]));
            });
            value = toObject$1(fields);
            break;
        case IDENTIFIER:
            isSpecialNode = TRUE;
            const identifier = node;
            value = toCall(renderIdentifier, [
                toString$1(identifier.name),
                identifier.lookup ? TRUE$1 : UNDEFINED,
                identifier.offset > 0 ? toString$1(identifier.offset) : UNDEFINED,
                holder ? TRUE$1 : UNDEFINED,
                depIgnore ? TRUE$1 : UNDEFINED,
                stack ? stack : UNDEFINED
            ]);
            break;
        case MEMBER:
            isSpecialNode = TRUE;
            const { lead, keypath, nodes, lookup, offset } = node, stringifyNodes = nodes ? nodes.map(generateChildNode) : [];
            if (lead.type === IDENTIFIER) {
                // 只能是 a[b] 的形式，因为 a.b 已经在解析时转换成 Identifier 了
                value = toCall(renderIdentifier, [
                    toCall(renderMemberKeypath, [
                        toString$1(lead.name),
                        toArray$1(stringifyNodes)
                    ]),
                    lookup ? TRUE$1 : UNDEFINED,
                    offset > 0 ? toString$1(offset) : UNDEFINED,
                    holder ? TRUE$1 : UNDEFINED,
                    depIgnore ? TRUE$1 : UNDEFINED,
                    stack ? stack : UNDEFINED
                ]);
            }
            else if (nodes) {
                // "xx"[length]
                // format()[a][b]
                value = toCall(renderMemberLiteral, [
                    generateChildNode(lead),
                    UNDEFINED,
                    toArray$1(stringifyNodes),
                    holder ? TRUE$1 : UNDEFINED
                ]);
            }
            else {
                // "xx".length
                // format().a.b
                value = toCall(renderMemberLiteral, [
                    generateChildNode(lead),
                    toString$1(keypath),
                    UNDEFINED,
                    holder ? TRUE$1 : UNDEFINED,
                ]);
            }
            break;
        default:
            isSpecialNode = TRUE;
            const { args } = node;
            value = toCall(renderCall, [
                generateChildNode(node.name),
                args.length
                    ? toArray$1(args.map(generateChildNode))
                    : UNDEFINED,
                holder ? TRUE$1 : UNDEFINED
            ]);
            break;
    }
    // 不需要 value holder
    if (!holder) {
        return value;
    }
    // 内部的临时值，且 holder 为 true
    if (inner) {
        return isSpecialNode
            ? value + RAW_DOT + RAW_VALUE
            : value;
    }
    // 最外层的值，且 holder 为 true
    return isSpecialNode
        ? value
        : toObject$1([RAW_VALUE + COLON + value]);
}

/**
 * 这里的难点在于处理 Element 的 children，举个例子：
 *
 * ['1', _x(expr), _l(expr, index, generate), _x(expr) ? ['1', _x(expr), _l(expr, index, generate)] : y]
 *
 * children 用数组表示，其中表达式求出的值可能是任意类型，比如数组或对象，我们无法控制表达式的值最终会是什么类型
 *
 * 像 each 或 import 这样的语法，内部其实会产生一个 vnode 数组，这里就出现了两个难点：
 *
 * 1. 如何区分 each 或其他语法产生的数组和表达式求值的数组
 * 2. 如何避免频繁的创建数组
 *
 * 我能想到的解决方案是，根据当前节点类型，如果是元素，则确保 children 的每一项的值序列化后都是函数调用的形式
 *
 * 这样能确保是从左到右依次执行，也就便于在内部创建一个公共数组，执行一个函数就收集一个值，而不管那个值到底是什么类型
 *
 */
// 是否要执行 join 操作
const joinStack = [], 
// 是否正在收集子节点
collectStack = [], nodeGenerator = {}, RENDER_EXPRESSION_IDENTIFIER = 'a', RENDER_EXPRESSION_MEMBER_KEYPATH = 'b', RENDER_EXPRESSION_MEMBER_LITERAL = 'c', RENDER_EXPRESSION_CALL = 'd', RENDER_TEXT_VNODE = 'e', RENDER_ATTRIBUTE_VNODE = 'f', RENDER_PROPERTY_VNODE = 'g', RENDER_LAZY_VNODE = 'h', RENDER_TRANSITION_VNODE = 'i', RENDER_BINDING_VNODE = 'j', RENDER_MODEL_VNODE = 'k', RENDER_EVENT_METHOD_VNODE = 'l', RENDER_EVENT_NAME_VNODE = 'm', RENDER_DIRECTIVE_VNODE = 'n', RENDER_SPREAD_VNODE = 'o', RENDER_ELEMENT_VNODE = 'p', RENDER_SLOT = 'q', RENDER_PARTIAL = 'r', RENDER_IMPORT = 's', RENDER_EACH = 't', RENDER_RANGE = 'u', RENDER_EQUAL_RANGE = 'v', TO_STRING = 'w', ARG_STACK = 'x';
// 序列化代码的参数列表
let codeArgs, 
// 表达式求值是否要求返回字符串类型
isStringRequired;
function renderExpression(expr, holder, depIgnore, stack) {
    return generate(expr, RENDER_EXPRESSION_IDENTIFIER, RENDER_EXPRESSION_MEMBER_KEYPATH, RENDER_EXPRESSION_MEMBER_LITERAL, RENDER_EXPRESSION_CALL, holder, depIgnore, stack);
}
function stringifyObject(obj) {
    const fields = [];
    each$2(obj, function (value, key) {
        if (isDef(value)) {
            push(fields, toString$1(key) + COLON + value);
        }
    });
    return toObject$1(fields);
}
function stringifyFunction(result, arg) {
    return `${RAW_FUNCTION}(${arg || EMPTY_STRING}){${result || EMPTY_STRING}}`;
}
function stringifyGroup(code) {
    return `(${code})`;
}
function stringifyExpression(expr, toString) {
    const value = renderExpression(expr);
    return toString
        ? toCall(TO_STRING, [
            value
        ])
        : value;
}
function stringifyExpressionVnode(expr, toString) {
    return toCall(RENDER_TEXT_VNODE, [
        stringifyExpression(expr, toString)
    ]);
}
function stringifyExpressionArg(expr) {
    return renderExpression(expr, FALSE, FALSE, ARG_STACK);
}
function stringifyValue(value, expr, children) {
    if (isDef(value)) {
        return toString$1(value);
    }
    // 只有一个表达式时，保持原始类型
    if (expr) {
        return stringifyExpression(expr);
    }
    // 多个值拼接时，要求是字符串
    if (children) {
        isStringRequired = children.length > 1;
        return stringifyChildren(children);
    }
}
function stringifyChildren(children, isComplex) {
    // 如果是复杂节点的 children，则每个 child 的序列化都是函数调用的形式
    // 因此最后可以拼接为 fn1(), fn2(), fn3() 这样依次调用，而不用再多此一举的使用数组，因为在 renderer 里也用不上这个数组
    // children 大于一个时，才有 join 的可能，单个值 jion 啥啊...
    const isJoin = children.length > 1 && !isComplex;
    push(joinStack, isJoin);
    const value = join(children.map(function (child) {
        return nodeGenerator[child.type](child);
    }), isJoin ? PLUS : COMMA);
    pop(joinStack);
    return value;
}
function stringifyConditionChildren(children, isComplex) {
    if (children) {
        const result = stringifyChildren(children, isComplex);
        return children.length > 1 && isComplex
            ? stringifyGroup(result)
            : result;
    }
}
function stringifyIf(node, stub) {
    let { children, isComplex, next } = node, test = stringifyExpression(node.expr), yes = stringifyConditionChildren(children, isComplex), no, result;
    if (next) {
        no = next.type === ELSE
            ? stringifyConditionChildren(next.children, next.isComplex)
            : stringifyIf(next, stub);
    }
    // 到达最后一个条件，发现第一个 if 语句带有 stub，需创建一个注释标签占位
    else if (stub) {
        no = renderElement(stringifyObject({
            isComment: TRUE$1,
            text: EMPTY,
        }));
    }
    if (isDef(yes) || isDef(no)) {
        const isJoin = last(joinStack);
        if (isJoin) {
            if (isUndef(yes)) {
                yes = EMPTY;
            }
            if (isUndef(no)) {
                no = EMPTY;
            }
        }
        if (isUndef(no)) {
            result = test + AND + yes;
        }
        else if (isUndef(yes)) {
            result = NOT + test + AND + no;
        }
        else {
            result = test + QUESTION + yes + COLON + no;
        }
        // 如果是连接操作，因为 ?: 优先级最低，因此要加 ()
        return isJoin
            ? stringifyGroup(result)
            : result;
    }
    return EMPTY;
}
function renderElement(data, tag, attrs, childs, slots) {
    return toCall(RENDER_ELEMENT_VNODE, [data, tag, attrs, childs, slots]);
}
function getComponentSlots(children) {
    const result = {}, slots = {}, addSlot = function (name, nodes) {
        if (!falsy(nodes)) {
            name = SLOT_DATA_PREFIX + name;
            push(slots[name] || (slots[name] = []), nodes);
        }
    };
    each(children, function (child) {
        // 找到具名 slot
        if (child.type === ELEMENT) {
            const element = child;
            if (element.slot) {
                addSlot(element.slot, element.tag === RAW_TEMPLATE
                    ? element.children
                    : [element]);
                return;
            }
        }
        // 匿名 slot，名称统一为 children
        addSlot(SLOT_NAME_DEFAULT, [child]);
    });
    each$2(slots, function (children, name) {
        // 强制为复杂节点，因为 slot 的子节点不能用字符串拼接的方式来渲染
        result[name] = stringifyFunction(stringifyChildren(children, TRUE));
    });
    if (!falsy$2(result)) {
        return stringifyObject(result);
    }
}
nodeGenerator[ELEMENT] = function (node) {
    let { tag, isComponent, isSvg, isStyle, isOption, isStatic, isComplex, name, ref, key, html, attrs, children } = node, data = {}, outputTag, outputAttrs = [], outputChilds, outputSlots;
    if (tag === RAW_SLOT) {
        const args = [toString$1(SLOT_DATA_PREFIX + name)];
        if (children) {
            push(args, stringifyFunction(stringifyChildren(children, TRUE)));
        }
        return toCall(RENDER_SLOT, args);
    }
    push(collectStack, FALSE);
    if (attrs) {
        each(attrs, function (attr) {
            push(outputAttrs, nodeGenerator[attr.type](attr));
        });
    }
    // 如果以 $ 开头，表示动态组件
    if (codeAt(tag) === 36) {
        outputTag = toString$1(slice(tag, 1));
    }
    else {
        data.tag = toString$1(tag);
    }
    if (isSvg) {
        data.isSvg = TRUE$1;
    }
    if (isStyle) {
        data.isStyle = TRUE$1;
    }
    if (isOption) {
        data.isOption = TRUE$1;
    }
    if (isStatic) {
        data.isStatic = TRUE$1;
    }
    if (ref) {
        data.ref = stringifyValue(ref.value, ref.expr, ref.children);
    }
    if (key) {
        data.key = stringifyValue(key.value, key.expr, key.children);
    }
    if (html) {
        data.html = string(html)
            ? toString$1(html)
            : stringifyExpression(html, TRUE);
    }
    if (isComponent) {
        data.isComponent = TRUE$1;
        if (children) {
            collectStack[collectStack.length - 1] = TRUE;
            outputSlots = getComponentSlots(children);
        }
    }
    else if (children) {
        isStringRequired = TRUE;
        collectStack[collectStack.length - 1] = isComplex;
        outputChilds = stringifyChildren(children, isComplex);
        if (isComplex) {
            outputChilds = stringifyFunction(outputChilds);
        }
        else {
            data.text = outputChilds;
            outputChilds = UNDEFINED;
        }
    }
    pop(collectStack);
    return renderElement(stringifyObject(data), outputTag, falsy(outputAttrs)
        ? UNDEFINED
        : stringifyFunction(join(outputAttrs, COMMA)), outputChilds, outputSlots);
};
nodeGenerator[ATTRIBUTE] = function (node) {
    const value = node.binding
        ? toCall(RENDER_BINDING_VNODE, [
            toString$1(node.name),
            renderExpression(node.expr, TRUE, TRUE)
        ])
        : stringifyValue(node.value, node.expr, node.children);
    return toCall(RENDER_ATTRIBUTE_VNODE, [
        toString$1(node.name),
        value
    ]);
};
nodeGenerator[PROPERTY] = function (node) {
    const value = node.binding
        ? toCall(RENDER_BINDING_VNODE, [
            toString$1(node.name),
            renderExpression(node.expr, TRUE, TRUE),
            toString$1(node.hint)
        ])
        : stringifyValue(node.value, node.expr, node.children);
    return toCall(RENDER_PROPERTY_VNODE, [
        toString$1(node.name),
        toString$1(node.hint),
        value
    ]);
};
nodeGenerator[DIRECTIVE] = function (node) {
    const { ns, name, key, value, expr, modifier } = node;
    if (ns === DIRECTIVE_LAZY) {
        return toCall(RENDER_LAZY_VNODE, [
            toString$1(name),
            toString$1(value)
        ]);
    }
    // <div transition="name">
    if (ns === RAW_TRANSITION) {
        return toCall(RENDER_TRANSITION_VNODE, [
            toString$1(value)
        ]);
    }
    // <input model="id">
    if (ns === DIRECTIVE_MODEL) {
        return toCall(RENDER_MODEL_VNODE, [
            renderExpression(expr, TRUE, TRUE)
        ]);
    }
    let renderName = RENDER_DIRECTIVE_VNODE, args = [
        toString$1(name),
        toString$1(key),
        toString$1(modifier),
        toString$1(value),
    ];
    // 尽可能把表达式编译成函数，这样对外界最友好
    //
    // 众所周知，事件指令会编译成函数，对于自定义指令来说，也要尽可能编译成函数
    //
    // 比如 o-tap="method()" 或 o-log="{'id': '11'}"
    // 前者会编译成 handler（调用方法），后者会编译成 getter（取值）
    if (expr) {
        // 如果表达式明确是在调用方法，则序列化成 method + args 的形式
        if (expr.type === CALL) {
            if (ns === DIRECTIVE_EVENT) {
                renderName = RENDER_EVENT_METHOD_VNODE;
            }
            // compiler 保证了函数调用的 name 是标识符
            push(args, toString$1(expr.name.name));
            // 为了实现运行时动态收集参数，这里序列化成函数
            if (!falsy(expr.args)) {
                // args 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
                push(args, stringifyFunction(RETURN + toArray$1(expr.args.map(stringifyExpressionArg)), ARG_STACK));
            }
        }
        // 不是调用方法，就是事件转换
        else if (ns === DIRECTIVE_EVENT) {
            renderName = RENDER_EVENT_NAME_VNODE;
            push(args, toString$1(expr.raw));
        }
        else if (ns === DIRECTIVE_CUSTOM) {
            // 取值函数
            // getter 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
            if (expr.type !== LITERAL) {
                push(args, UNDEFINED); // method
                push(args, UNDEFINED); // args
                push(args, stringifyFunction(RETURN + stringifyExpressionArg(expr), ARG_STACK));
            }
        }
    }
    return toCall(renderName, args);
};
nodeGenerator[SPREAD] = function (node) {
    return toCall(RENDER_SPREAD_VNODE, [
        renderExpression(node.expr, TRUE, node.binding)
    ]);
};
nodeGenerator[TEXT] = function (node) {
    const result = toString$1(node.text);
    if (last(collectStack) && !last(joinStack)) {
        return toCall(RENDER_TEXT_VNODE, [
            result
        ]);
    }
    return result;
};
nodeGenerator[EXPRESSION] = function (node) {
    // 强制保留 isStringRequired 参数，减少运行时判断参数是否存在
    // 因为还有 stack 参数呢，各种判断真的很累
    if (last(collectStack) && !last(joinStack)) {
        return stringifyExpressionVnode(node.expr, isStringRequired);
    }
    return stringifyExpression(node.expr, isStringRequired);
};
nodeGenerator[IF] = function (node) {
    return stringifyIf(node, node.stub);
};
nodeGenerator[EACH] = function (node) {
    // compiler 保证了 children 一定有值
    const children = stringifyFunction(stringifyChildren(node.children, node.isComplex));
    // 遍历区间
    if (node.to) {
        if (node.equal) {
            return toCall(RENDER_EQUAL_RANGE, [
                children,
                renderExpression(node.from),
                renderExpression(node.to),
                node.index ? toString$1(node.index) : UNDEFINED
            ]);
        }
        return toCall(RENDER_RANGE, [
            children,
            renderExpression(node.from),
            renderExpression(node.to),
            node.index ? toString$1(node.index) : UNDEFINED
        ]);
    }
    // 遍历数组和对象
    return toCall(RENDER_EACH, [
        children,
        renderExpression(node.from, TRUE),
        node.index ? toString$1(node.index) : UNDEFINED
    ]);
};
nodeGenerator[PARTIAL] = function (node) {
    return toCall(RENDER_PARTIAL, [
        toString$1(node.name),
        // compiler 保证了 children 一定有值
        stringifyFunction(stringifyChildren(node.children, node.isComplex))
    ]);
};
nodeGenerator[IMPORT] = function (node) {
    return toCall(RENDER_IMPORT, [
        toString$1(node.name)
    ]);
};
function generate$1(node) {
    if (!codeArgs) {
        codeArgs = join([
            RENDER_EXPRESSION_IDENTIFIER,
            RENDER_EXPRESSION_MEMBER_KEYPATH,
            RENDER_EXPRESSION_MEMBER_LITERAL,
            RENDER_EXPRESSION_CALL,
            RENDER_TEXT_VNODE,
            RENDER_ATTRIBUTE_VNODE,
            RENDER_PROPERTY_VNODE,
            RENDER_LAZY_VNODE,
            RENDER_TRANSITION_VNODE,
            RENDER_BINDING_VNODE,
            RENDER_MODEL_VNODE,
            RENDER_EVENT_METHOD_VNODE,
            RENDER_EVENT_NAME_VNODE,
            RENDER_DIRECTIVE_VNODE,
            RENDER_SPREAD_VNODE,
            RENDER_ELEMENT_VNODE,
            RENDER_SLOT,
            RENDER_PARTIAL,
            RENDER_IMPORT,
            RENDER_EACH,
            RENDER_RANGE,
            RENDER_EQUAL_RANGE,
            TO_STRING,
        ], COMMA);
    }
    return toFunction(codeArgs, nodeGenerator[node.type](node));
}

function setPair(target, name, key, value) {
    const data = target[name] || (target[name] = {});
    data[key] = value;
}
const KEY_DIRECTIVES = 'directives';
function render(context, observer, template, filters, partials, directives, transitions) {
    let $scope = { $keypath: EMPTY_STRING }, $stack = [$scope], $vnode, vnodeStack = [], localPartials = {}, findValue = function (stack, index, key, lookup, depIgnore, defaultKeypath) {
        let scope = stack[index], keypath = join$1(scope.$keypath, key), value = stack, holder$1 = holder;
        // 如果最后还是取不到值，用回最初的 keypath
        if (isUndef(defaultKeypath)) {
            defaultKeypath = keypath;
        }
        // 如果取的是 scope 上直接有的数据，如 $keypath
        if (isDef(scope[key])) {
            value = scope[key];
        }
        // 如果取的是数组项，则要更进一步
        else if (isDef(scope.$item)) {
            scope = scope.$item;
            // 到这里 scope 可能为空
            // 比如 new Array(10) 然后遍历这个数组，每一项肯定是空
            // 取 this
            if (key === EMPTY_STRING) {
                value = scope;
            }
            // 取 this.xx
            else if (scope != NULL && isDef(scope[key])) {
                value = scope[key];
            }
        }
        if (value === stack) {
            // 正常取数据
            value = observer.get(keypath, stack, depIgnore);
            if (value === stack) {
                if (lookup && index > 0) {
                    {
                        debug(`The data "${keypath}" can't be found in the current context, start looking up.`);
                    }
                    return findValue(stack, index - 1, key, lookup, depIgnore, defaultKeypath);
                }
                // 到头了，最后尝试过滤器
                const result = get(filters, key);
                if (result) {
                    holder$1 = result;
                    holder$1.keypath = key;
                }
                else {
                    holder$1.value = UNDEFINED;
                    holder$1.keypath = defaultKeypath;
                }
                return holder$1;
            }
        }
        holder$1.value = value;
        holder$1.keypath = keypath;
        return holder$1;
    }, createEventListener = function (type) {
        return function (event, data) {
            // 事件名称相同的情况，只可能是监听 DOM 事件，比如写一个 Button 组件
            // <button on-click="click"> 纯粹的封装了一个原生 click 事件
            if (type !== event.type) {
                event = new CustomEvent(type, event);
            }
            context.fire(event, data);
        };
    }, createMethodListener = function (name, args, stack) {
        return function (event, data) {
            const method = context[name];
            if (event instanceof CustomEvent) {
                let result = UNDEFINED;
                if (args) {
                    const scope = last(stack);
                    if (scope) {
                        scope.$event = event;
                        scope.$data = data;
                        result = execute(method, context, args(stack));
                        scope.$event =
                            scope.$data = UNDEFINED;
                    }
                }
                else {
                    result = execute(method, context, data ? [event, data] : event);
                }
                return result;
            }
            else {
                execute(method, context, args ? args(stack) : UNDEFINED);
            }
        };
    }, createGetter = function (getter, stack) {
        return function () {
            return getter(stack);
        };
    }, renderTextVnode = function (text) {
        const vnodeList = last(vnodeStack);
        if (vnodeList) {
            const lastVnode = last(vnodeList);
            if (lastVnode && lastVnode.isText) {
                lastVnode.text += text;
            }
            else {
                const textVnode = {
                    isText: TRUE,
                    text,
                    context,
                    keypath: $scope.$keypath,
                };
                push(vnodeList, textVnode);
            }
        }
    }, renderAttributeVnode = function (name, value) {
        if ($vnode.isComponent) {
            setPair($vnode, 'props', name, value);
        }
        else {
            setPair($vnode, 'nativeAttrs', name, { name, value });
        }
    }, renderPropertyVnode = function (name, hint, value) {
        setPair($vnode, 'nativeProps', name, { name, value, hint });
    }, renderLazyVnode = function (name, value) {
        setPair($vnode, 'lazy', name, value);
    }, renderTransitionVnode = function (name) {
        $vnode.transition = transitions[name];
        {
            if (!$vnode.transition) {
                fatal(`The transition "${name}" can't be found.`);
            }
        }
    }, renderBindingVnode = function (name, holder, hint) {
        const key = join$1(DIRECTIVE_BINDING, name);
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: DIRECTIVE_BINDING,
            name,
            key,
            modifier: holder.keypath,
            hooks: directives[DIRECTIVE_BINDING],
            hint,
        });
        return holder.value;
    }, renderModelVnode = function (holder) {
        setPair($vnode, KEY_DIRECTIVES, DIRECTIVE_MODEL, {
            ns: DIRECTIVE_MODEL,
            name: EMPTY_STRING,
            key: DIRECTIVE_MODEL,
            value: holder.value,
            modifier: holder.keypath,
            hooks: directives[DIRECTIVE_MODEL]
        });
    }, renderEventMethodVnode = function (name, key, modifier, value, method, args) {
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: DIRECTIVE_EVENT,
            name,
            key,
            value,
            modifier,
            hooks: directives[DIRECTIVE_EVENT],
            handler: createMethodListener(method, args, $stack),
        });
    }, renderEventNameVnode = function (name, key, modifier, value, event) {
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: DIRECTIVE_EVENT,
            name,
            key,
            value,
            modifier,
            hooks: directives[DIRECTIVE_EVENT],
            handler: createEventListener(event),
        });
    }, renderDirectiveVnode = function (name, key, modifier, value, method, args, getter) {
        const hooks = directives[name];
        {
            if (!hooks) {
                fatal(`The directive ${name} can't be found.`);
            }
        }
        setPair($vnode, KEY_DIRECTIVES, key, {
            ns: DIRECTIVE_CUSTOM,
            name,
            key,
            value,
            hooks,
            modifier,
            getter: getter ? createGetter(getter, $stack) : UNDEFINED,
            handler: method ? createMethodListener(method, args, $stack) : UNDEFINED,
        });
    }, renderSpreadVnode = function (holder) {
        const { value, keypath } = holder;
        // 如果为 null 或 undefined，则不需要 warn
        if (value != NULL) {
            // 数组也算一种对象，要排除掉
            if (object(value) && !array(value)) {
                each$2(value, function (value, key) {
                    setPair($vnode, 'props', key, value);
                });
                if (keypath) {
                    const key = join$1(DIRECTIVE_BINDING, keypath);
                    setPair($vnode, KEY_DIRECTIVES, key, {
                        ns: DIRECTIVE_BINDING,
                        name: EMPTY_STRING,
                        key,
                        modifier: join$1(keypath, RAW_WILDCARD),
                        hooks: directives[DIRECTIVE_BINDING],
                    });
                }
            }
        }
    }, renderElementVnode = function (vnode, tag, attrs, childs, slots) {
        if (tag) {
            const componentName = observer.get(tag);
            {
                if (!componentName) {
                    warn(`The dynamic component "${tag}" can't be found.`);
                }
            }
            vnode.tag = componentName;
        }
        if (attrs) {
            $vnode = vnode;
            attrs();
            $vnode = UNDEFINED;
        }
        // childs 和 slots 不可能同时存在
        if (childs) {
            vnodeStack.push(vnode.children = []);
            childs();
            pop(vnodeStack);
        }
        else if (slots) {
            const renderSlots = {};
            each$2(slots, function (slot, name) {
                vnodeStack.push([]);
                slot();
                const vnodes = pop(vnodeStack);
                renderSlots[name] = vnodes.length ? vnodes : UNDEFINED;
            });
            vnode.slots = renderSlots;
        }
        vnode.context = context;
        vnode.keypath = $scope.$keypath;
        const vnodeList = last(vnodeStack);
        if (vnodeList) {
            push(vnodeList, vnode);
        }
        return vnode;
    }, renderExpressionIdentifier = function (name, lookup, offset, holder, depIgnore, stack) {
        const myStack = stack || $stack, result = findValue(myStack, myStack.length - ((offset || 0) + 1), name, lookup, depIgnore);
        return holder ? result : result.value;
    }, renderExpressionMemberKeypath = function (identifier, runtimeKeypath) {
        unshift(runtimeKeypath, identifier);
        return join(runtimeKeypath, RAW_DOT);
    }, renderExpressionMemberLiteral = function (value, staticKeypath, runtimeKeypath, holder$1) {
        if (isDef(runtimeKeypath)) {
            staticKeypath = join(runtimeKeypath, RAW_DOT);
        }
        const match = get(value, staticKeypath);
        holder.keypath = UNDEFINED;
        holder.value = match ? match.value : UNDEFINED;
        return holder$1 ? holder : holder.value;
    }, renderExpressionCall = function (fn, args, holder$1) {
        holder.keypath = UNDEFINED;
        // 当 holder 为 true, args 为空时，args 会传入 false
        holder.value = execute(fn, context, args || UNDEFINED);
        return holder$1 ? holder : holder.value;
    }, 
    // <slot name="xx"/>
    renderSlot = function (name, defaultRender) {
        const vnodeList = last(vnodeStack), vnodes = context.get(name);
        if (vnodeList) {
            if (vnodes) {
                each(vnodes, function (vnode) {
                    push(vnodeList, vnode);
                    vnode.slot = name;
                    vnode.parent = context;
                });
            }
            else if (defaultRender) {
                defaultRender();
            }
        }
    }, 
    // {{#partial name}}
    //   xx
    // {{/partial}}
    renderPartial = function (name, render) {
        localPartials[name] = render;
    }, 
    // {{> name}}
    renderImport = function (name) {
        if (localPartials[name]) {
            localPartials[name]();
        }
        else {
            const partial = partials[name];
            if (partial) {
                partial(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach, renderRange, renderEqualRange, toString);
            }
            else {
                fatal(`The partial "${name}" can't be found.`);
            }
        }
    }, eachHandler = function (generate, item, key, keypath, index, length) {
        const lastScope = $scope, lastStack = $stack;
        // each 会改变 keypath
        $scope = { $keypath: keypath };
        $stack = lastStack.concat($scope);
        // 避免模板里频繁读取 list.length
        if (isDef(length)) {
            $scope.$length = length;
        }
        // 业务层是否写了 expr:index
        if (index) {
            $scope[index] = key;
        }
        // 无法通过 context.get($keypath + key) 读取到数据的场景
        // 必须把 item 写到 scope
        if (!keypath) {
            $scope.$item = item;
        }
        generate();
        $scope = lastScope;
        $stack = lastStack;
    }, renderEach = function (generate, holder, index) {
        const { keypath, value } = holder;
        if (array(value)) {
            for (let i = 0, length = value.length; i < length; i++) {
                eachHandler(generate, value[i], i, keypath
                    ? join$1(keypath, EMPTY_STRING + i)
                    : EMPTY_STRING, index, length);
            }
        }
        else if (object(value)) {
            for (let key in value) {
                eachHandler(generate, value[key], key, keypath
                    ? join$1(keypath, key)
                    : EMPTY_STRING, index);
            }
        }
    }, renderRange = function (generate, from, to, index) {
        let count = 0;
        if (from < to) {
            for (let i = from; i < to; i++) {
                eachHandler(generate, i, count++, EMPTY_STRING, index);
            }
        }
        else {
            for (let i = from; i > to; i--) {
                eachHandler(generate, i, count++, EMPTY_STRING, index);
            }
        }
    }, renderEqualRange = function (generate, from, to, index) {
        let count = 0;
        if (from < to) {
            for (let i = from; i <= to; i++) {
                eachHandler(generate, i, count++, EMPTY_STRING, index);
            }
        }
        else {
            for (let i = from; i >= to; i--) {
                eachHandler(generate, i, count++, EMPTY_STRING, index);
            }
        }
    };
    return template(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach, renderRange, renderEqualRange, toString);
}

// 这里先写 IE9 支持的接口
let innerText = 'textContent', innerHTML = 'innerHTML', findElement = function (selector) {
    const node = DOCUMENT.querySelector(selector);
    if (node) {
        return node;
    }
}, addEventListener = function (node, type, listener) {
    node.addEventListener(type, listener, FALSE);
}, removeEventListener = function (node, type, listener) {
    node.removeEventListener(type, listener, FALSE);
}, 
// IE9 不支持 classList
addElementClass = function (node, className) {
    node.classList.add(className);
}, removeElementClass = function (node, className) {
    node.classList.remove(className);
}, createEvent = function (event, node) {
    return event;
};
{
    if (DOCUMENT) {
        // 此时 document.body 不一定有值，比如 script 放在 head 里
        if (!DOCUMENT.documentElement.classList) {
            addElementClass = function (node, className) {
                const classes = node.className.split(CHAR_WHITESPACE);
                if (!has(classes, className)) {
                    push(classes, className);
                    node.className = join(classes, CHAR_WHITESPACE);
                }
            };
            removeElementClass = function (node, className) {
                const classes = node.className.split(CHAR_WHITESPACE);
                if (remove(classes, className)) {
                    node.className = join(classes, CHAR_WHITESPACE);
                }
            };
        }
        // 为 IE9 以下浏览器打补丁
        {
            if (!DOCUMENT.addEventListener) {
                const PROPERTY_CHANGE = 'propertychange';
                addEventListener = function (node, type, listener) {
                    if (type === EVENT_INPUT) {
                        addEventListener(node, PROPERTY_CHANGE, 
                        // 借用 EMITTER，反正只是内部临时用一下...
                        listener[EMITTER] = function (event) {
                            if (event.propertyName === RAW_VALUE) {
                                event = new CustomEvent(event);
                                event.type = EVENT_INPUT;
                                execute(listener, this, event);
                            }
                        });
                    }
                    else if (type === EVENT_CHANGE && isBoxElement(node)) {
                        addEventListener(node, EVENT_CLICK, listener[EMITTER] = function (event) {
                            event = new CustomEvent(event);
                            event.type = EVENT_CHANGE;
                            execute(listener, this, event);
                        });
                    }
                    else {
                        node.attachEvent(`on${type}`, listener);
                    }
                };
                removeEventListener = function (node, type, listener) {
                    if (type === EVENT_INPUT) {
                        removeEventListener(node, PROPERTY_CHANGE, listener[EMITTER]);
                        delete listener[EMITTER];
                    }
                    else if (type === EVENT_CHANGE && isBoxElement(node)) {
                        removeEventListener(node, EVENT_CLICK, listener[EMITTER]);
                        delete listener[EMITTER];
                    }
                    else {
                        node.detachEvent(`on${type}`, listener);
                    }
                };
                const isBoxElement = function (node) {
                    return node.tagName === 'INPUT'
                        && (node.type === 'radio' || node.type === 'checkbox');
                };
                class IEEvent {
                    constructor(event, element) {
                        extend(this, event);
                        this.currentTarget = element;
                        this.target = event.srcElement || element;
                        this.originalEvent = event;
                    }
                    preventDefault() {
                        this.originalEvent.returnValue = FALSE;
                    }
                    stopPropagation() {
                        this.originalEvent.cancelBubble = TRUE;
                    }
                }
                // textContent 不兼容 IE 678
                innerText = 'innerText';
                createEvent = function (event, element) {
                    return new IEEvent(event, element);
                };
                findElement = function (selector) {
                    // 去掉 #
                    if (codeAt(selector, 0) === 35) {
                        selector = slice(selector, 1);
                    }
                    else {
                        fatal(`The id selector, such as "#id", is the only supported selector for legacy version.`);
                    }
                    const node = DOCUMENT.getElementById(selector);
                    if (node) {
                        return node;
                    }
                };
            }
        }
    }
}
const CHAR_WHITESPACE = ' ', 
/**
 * 绑定在 HTML 元素上的事件发射器
 */
EMITTER = '$emitter', 
/**
 * 低版本 IE 上 style 标签的专有属性
 */
STYLE_SHEET = 'styleSheet', 
/**
 * 跟输入事件配套使用的事件
 */
COMPOSITION_START = 'compositionstart', 
/**
 * 跟输入事件配套使用的事件
 */
COMPOSITION_END = 'compositionend', domain = 'http://www.w3.org/', namespaces = {
    svg: domain + '2000/svg',
}, specialEvents = {};
specialEvents[EVENT_MODEL] = {
    on(node, listener) {
        let locked = FALSE;
        on(node, COMPOSITION_START, listener[COMPOSITION_START] = function () {
            locked = TRUE;
        });
        on(node, COMPOSITION_END, listener[COMPOSITION_END] = function (event) {
            locked = FALSE;
            listener(event);
        });
        addEventListener(node, EVENT_INPUT, listener[EVENT_INPUT] = function (event) {
            if (!locked) {
                listener(event);
            }
        });
    },
    off(node, listener) {
        off(node, COMPOSITION_START, listener[COMPOSITION_START]);
        off(node, COMPOSITION_END, listener[COMPOSITION_END]);
        removeEventListener(node, EVENT_INPUT, listener[EVENT_INPUT]);
        listener[COMPOSITION_START] =
            listener[COMPOSITION_END] =
                listener[EVENT_INPUT] = UNDEFINED;
    }
};
function createElement$2(tag, isSvg) {
    return isSvg
        ? DOCUMENT.createElementNS(namespaces.svg, tag)
        : DOCUMENT.createElement(tag);
}
function createText$1(text) {
    return DOCUMENT.createTextNode(text);
}
function createComment(text) {
    return DOCUMENT.createComment(text);
}
function prop(node, name, value) {
    if (isDef(value)) {
        set(node, name, value, FALSE);
    }
    else {
        const holder = get(node, name);
        if (holder) {
            return holder.value;
        }
    }
}
function removeProp(node, name, hint) {
    set(node, name, hint === HINT_BOOLEAN
        ? FALSE
        : EMPTY_STRING, FALSE);
}
function attr(node, name, value) {
    if (isDef(value)) {
        node.setAttribute(name, value);
    }
    else {
        // value 还可能是 null
        const value = node.getAttribute(name);
        if (value != NULL) {
            return value;
        }
    }
}
function removeAttr(node, name) {
    node.removeAttribute(name);
}
function before(parentNode, node, beforeNode) {
    parentNode.insertBefore(node, beforeNode);
}
function append(parentNode, node) {
    parentNode.appendChild(node);
}
function replace(parentNode, node, oldNode) {
    parentNode.replaceChild(node, oldNode);
}
function remove$2(parentNode, node) {
    parentNode.removeChild(node);
}
function parent(node) {
    const { parentNode } = node;
    if (parentNode) {
        return parentNode;
    }
}
function next(node) {
    const { nextSibling } = node;
    if (nextSibling) {
        return nextSibling;
    }
}
const find = findElement;
function tag(node) {
    if (node.nodeType === 1) {
        return lower(node.tagName);
    }
}
function text(node, text, isStyle, isOption) {
    if (isDef(text)) {
        {
            if (isStyle && has$2(node, STYLE_SHEET)) {
                node[STYLE_SHEET].cssText = text;
            }
            else {
                if (isOption) {
                    node.value = text;
                }
                node[innerText] = text;
            }
        }
    }
    else {
        return node[innerText];
    }
}
function html(node, html, isStyle, isOption) {
    if (isDef(html)) {
        {
            if (isStyle && has$2(node, STYLE_SHEET)) {
                node[STYLE_SHEET].cssText = html;
            }
            else {
                if (isOption) {
                    node.value = html;
                }
                node[innerHTML] = html;
            }
        }
    }
    else {
        return node[innerHTML];
    }
}
const addClass = addElementClass;
const removeClass = removeElementClass;
function on(node, type, listener, context) {
    const emitter = node[EMITTER] || (node[EMITTER] = new Emitter()), nativeListeners = emitter.nativeListeners || (emitter.nativeListeners = {});
    // 一个元素，相同的事件，只注册一个 native listener
    if (!nativeListeners[type]) {
        // 特殊事件
        const special = specialEvents[type], 
        // 唯一的原生监听器
        nativeListener = function (event) {
            const customEvent = event instanceof CustomEvent
                ? event
                : new CustomEvent(event.type, createEvent(event, node));
            if (customEvent.type !== type) {
                customEvent.type = type;
            }
            emitter.fire(type, [customEvent]);
        };
        nativeListeners[type] = nativeListener;
        if (special) {
            special.on(node, nativeListener);
        }
        else {
            addEventListener(node, type, nativeListener);
        }
    }
    emitter.on(type, {
        fn: listener,
        ctx: context,
    });
}
function off(node, type, listener) {
    const emitter = node[EMITTER], { listeners, nativeListeners } = emitter;
    // emitter 会根据 type 和 listener 参数进行适当的删除
    emitter.off(type, listener);
    // 如果注册的 type 事件都解绑了，则去掉原生监听器
    if (nativeListeners && !emitter.has(type)) {
        const special = specialEvents[type], nativeListener = nativeListeners[type];
        if (special) {
            special.off(node, nativeListener);
        }
        else {
            removeEventListener(node, type, nativeListener);
        }
        delete nativeListeners[type];
    }
    if (falsy$2(listeners)) {
        node[EMITTER] = UNDEFINED;
    }
}
function addSpecialEvent(type, hooks) {
    {
        if (specialEvents[type]) {
            fatal(`The special event "${type}" is existed.`);
        }
        info(`The special event "${type}" is added successfully.`);
    }
    specialEvents[type] = hooks;
}

var domApi = /*#__PURE__*/Object.freeze({
  createElement: createElement$2,
  createText: createText$1,
  createComment: createComment,
  prop: prop,
  removeProp: removeProp,
  attr: attr,
  removeAttr: removeAttr,
  before: before,
  append: append,
  replace: replace,
  remove: remove$2,
  parent: parent,
  next: next,
  find: find,
  tag: tag,
  text: text,
  html: html,
  addClass: addClass,
  removeClass: removeClass,
  on: on,
  off: off,
  addSpecialEvent: addSpecialEvent
});

/**
 * 计算属性
 *
 * 可配置 cache、deps、get、set 等
 */
class Computed {
    constructor(keypath, sync, cache, deps, observer, getter, setter) {
        const instance = this;
        instance.keypath = keypath;
        instance.cache = cache;
        instance.deps = deps;
        instance.context = observer.context;
        instance.observer = observer;
        instance.getter = getter;
        instance.setter = setter;
        instance.unique = {};
        instance.watcher = function ($0, $1, $2) {
            // 计算属性的依赖变了会走进这里
            const oldValue = instance.value, newValue = instance.get(TRUE);
            if (newValue !== oldValue) {
                observer.diff(keypath, newValue, oldValue);
            }
        };
        instance.watcherOptions = {
            sync,
            watcher: instance.watcher
        };
        if (instance.fixed = !falsy(deps)) {
            each(deps, function (dep) {
                observer.watch(dep, instance.watcherOptions);
            });
        }
    }
    /**
     * 读取计算属性的值
     *
     * @param force 是否强制刷新缓存
     */
    get(force) {
        const instance = this, { getter, context } = instance;
        // 禁用缓存
        if (!instance.cache) {
            instance.value = execute(getter, context);
        }
        // 减少取值频率，尤其是处理复杂的计算规则
        else if (force || !has$2(instance, RAW_VALUE)) {
            // 如果写死了依赖，则不需要收集依赖
            if (instance.fixed) {
                instance.value = execute(getter, context);
            }
            else {
                // 清空上次收集的依赖
                instance.unbind();
                // 开始收集新的依赖
                const lastComputed = Computed.current;
                Computed.current = instance;
                instance.value = execute(getter, context);
                // 绑定新的依赖
                instance.bind();
                Computed.current = lastComputed;
            }
        }
        return instance.value;
    }
    set(value) {
        const { setter, context } = this;
        if (setter) {
            setter.call(context, value);
        }
    }
    /**
     * 添加依赖
     *
     * 这里只是为了保证依赖唯一，最后由 bind() 实现绑定
     *
     * @param dep
     */
    add(dep) {
        this.unique[dep] = TRUE;
    }
    /**
     * 绑定依赖
     */
    bind() {
        const { unique, deps, observer, watcherOptions } = this;
        each$2(unique, function (_, dep) {
            push(deps, dep);
            observer.watch(dep, watcherOptions);
        });
        // 用完重置
        // 方便下次收集依赖
        this.unique = {};
    }
    /**
     * 解绑依赖
     */
    unbind() {
        const { deps, observer, watcher } = this;
        each(deps, function (dep) {
            observer.unwatch(dep, watcher);
        }, TRUE);
        deps.length = 0;
    }
}

/**
 * 从 keypath 数组中选择和 keypath 最匹配的那一个
 *
 * @param sorted 经过排序的 keypath 数组
 * @param keypath
 */
function matchBest (sorted, keypath) {
    let result;
    each(sorted, function (prefix) {
        const length = match(keypath, prefix);
        if (length >= 0) {
            result = {
                name: prefix,
                prop: slice(keypath, length)
            };
            return FALSE;
        }
    });
    return result;
}

function readValue (source, keypath) {
    if (source == NULL || keypath === EMPTY_STRING) {
        return source;
    }
    const result = get(source, keypath);
    if (result) {
        return result.value;
    }
}

/**
 * 对比新旧数组
 *
 * @param newValue
 * @param oldValue
 * @param callback
 */
function diffString (newValue, oldValue, callback) {
    const newIsString = string(newValue), oldIsString = string(oldValue);
    if (newIsString || oldIsString) {
        callback(RAW_LENGTH, newIsString ? newValue.length : UNDEFINED, oldIsString ? oldValue.length : UNDEFINED);
        return TRUE;
    }
}

/**
 * 对比新旧数组
 *
 * @param newValue
 * @param oldValue
 * @param callback
 */
function diffArray (newValue, oldValue, callback) {
    const newIsArray = array(newValue), oldIsArray = array(oldValue);
    if (newIsArray || oldIsArray) {
        const newLength = newIsArray ? newValue.length : UNDEFINED, oldLength = oldIsArray ? oldValue.length : UNDEFINED;
        callback(RAW_LENGTH, newLength, oldLength);
        for (let i = 0, length = Math.max(newLength || 0, oldLength || 0); i < length; i++) {
            callback('' + i, newValue ? newValue[i] : UNDEFINED, oldValue ? oldValue[i] : UNDEFINED);
        }
        return TRUE;
    }
}

/**
 * 对比新旧对象
 *
 * @param newValue
 * @param oldValue
 * @param callback
 */
function diffObject (newValue, oldValue, callback) {
    const newIsObject = object(newValue), oldIsObject = object(oldValue);
    if (newIsObject || oldIsObject) {
        newValue = newIsObject ? newValue : EMPTY_OBJECT;
        oldValue = oldIsObject ? oldValue : EMPTY_OBJECT;
        if (newIsObject) {
            each$2(newValue, function (value, key) {
                if (value !== oldValue[key]) {
                    callback(key, value, oldValue[key]);
                }
            });
        }
        if (oldIsObject) {
            each$2(oldValue, function (value, key) {
                if (value !== newValue[key]) {
                    callback(key, newValue[key], value);
                }
            });
        }
    }
}

function diffRecursion(keypath, newValue, oldValue, watchFuzzyKeypaths, callback) {
    const diff = function (subKeypath, subNewValue, subOldValue) {
        if (subNewValue !== subOldValue) {
            const newKeypath = join$1(keypath, subKeypath);
            each(watchFuzzyKeypaths, function (fuzzyKeypath) {
                if (isDef(matchFuzzy(newKeypath, fuzzyKeypath))) {
                    callback(fuzzyKeypath, newKeypath, subNewValue, subOldValue);
                }
            });
            diffRecursion(newKeypath, subNewValue, subOldValue, watchFuzzyKeypaths, callback);
        }
    };
    diffString(newValue, oldValue, diff)
        || diffArray(newValue, oldValue, diff)
        || diffObject(newValue, oldValue, diff);
}

function diffWatcher (keypath, newValue, oldValue, watcher, isRecursive, callback) {
    let fuzzyKeypaths;
    // 遍历监听的 keypath，如果未被监听，则无需触发任何事件
    each$2(watcher, function (_, watchKeypath) {
        // 模糊监听，如 users.*.name
        if (isFuzzy(watchKeypath)) {
            // 如果当前修改的是 users.0 整个对象
            // users.0 和 users.*.name 无法匹配
            // 此时要知道设置 users.0 到底会不会改变 users.*.name 需要靠递归了
            // 如果匹配，则无需递归
            if (isDef(matchFuzzy(keypath, watchKeypath))) {
                callback(watchKeypath, keypath, newValue, oldValue);
            }
            else if (isRecursive) {
                if (fuzzyKeypaths) {
                    push(fuzzyKeypaths, watchKeypath);
                }
                else {
                    fuzzyKeypaths = [watchKeypath];
                }
            }
            return;
        }
        // 不是模糊匹配，直接靠前缀匹配
        // 比如监听的是 users.0.name，此时修改 users.0，则直接读出子属性值，判断是否相等
        const length = match(watchKeypath, keypath);
        if (length >= 0) {
            const subKeypath = slice(watchKeypath, length), subNewValue = readValue(newValue, subKeypath), subOldValue = readValue(oldValue, subKeypath);
            if (subNewValue !== subOldValue) {
                callback(watchKeypath, watchKeypath, subNewValue, subOldValue);
            }
        }
    });
    // 存在模糊匹配的需求
    // 必须对数据进行递归
    // 性能确实会慢一些，但是很好用啊，几乎可以监听所有的数据
    if (fuzzyKeypaths) {
        diffRecursion(keypath, newValue, oldValue, fuzzyKeypaths, callback);
    }
}

/**
 * 触发异步变化时，用此函数过滤下，哪些 listener 应该执行
 *
 * @param item
 * @param data
 */
function filterWatcher (_, args, options) {
    if (options.count && args) {
        // 采用计数器的原因是，同一个 options 可能执行多次
        // 比如监听 user.*，如果同批次修改了 user.name 和 user.age
        // 这个监听器会调用多次，如果第一次执行就把 count 干掉了，第二次就无法执行了
        options.count--;
        // 新旧值不相等
        return args[0] !== args[1];
    }
}

// 避免频繁创建对象
const optionsHolder = {
    watcher: EMPTY_FUNCTION
};
/**
 * 格式化 watch options
 *
 * @param options
 */
function formatWatcherOptions (options, immediate) {
    if (func(options)) {
        optionsHolder.watcher = options;
        optionsHolder.immediate = immediate === TRUE;
        return optionsHolder;
    }
    if (options && options.watcher) {
        return options;
    }
    {
        fatal(`watcher should be a function or object.`);
    }
}

/**
 * 观察者有两种观察模式：
 *
 * 1. 同步监听
 * 2. 异步监听
 *
 * 对于`计算属性`这种需要实时变化的对象，即它的依赖变了，它需要立即跟着变，否则会出现不一致的问题
 * 这种属于同步监听
 *
 * 对于外部调用 observer.watch('keypath', listener)，属于异步监听，它只关心是否变了，而不关心是否是立即触发的
 */
class Observer {
    constructor(data, context) {
        const instance = this;
        instance.data = data || {};
        instance.context = context || instance;
        instance.nextTask = new NextTask();
        instance.syncEmitter = new Emitter();
        instance.asyncEmitter = new Emitter();
        instance.asyncChanges = {};
    }
    /**
     * 获取数据
     *
     * @param keypath
     * @param defaultValue
     * @param depIgnore
     * @return
     */
    get(keypath, defaultValue, depIgnore) {
        const instance = this, currentComputed = Computed.current, { data, computed, reversedComputedKeys } = instance;
        // 传入 '' 获取整个 data
        if (keypath === EMPTY_STRING) {
            return data;
        }
        // 调用 get 时，外面想要获取依赖必须设置是谁在收集依赖
        // 如果没设置，则跳过依赖收集
        if (currentComputed && !depIgnore) {
            currentComputed.add(keypath);
        }
        let result, target;
        if (computed) {
            target = computed[keypath];
            if (target) {
                return target.get();
            }
            if (reversedComputedKeys) {
                const match = matchBest(reversedComputedKeys, keypath);
                if (match && match.prop) {
                    result = get(computed[match.name].get(), match.prop);
                }
            }
        }
        if (!result) {
            result = get(data, keypath);
        }
        return result ? result.value : defaultValue;
    }
    /**
     * 更新数据
     *
     * @param keypath
     * @param value
     */
    set(keypath, value) {
        const instance = this, { data, computed, reversedComputedKeys } = instance, setValue = function (newValue, keypath) {
            const oldValue = instance.get(keypath);
            if (newValue === oldValue) {
                return;
            }
            let target;
            if (computed) {
                target = computed[keypath];
                if (target) {
                    target.set(newValue);
                }
                if (reversedComputedKeys) {
                    const match = matchBest(reversedComputedKeys, keypath);
                    if (match && match.prop) {
                        target = computed[match.name];
                        if (target) {
                            const targetValue = target.get();
                            if (object(targetValue)) {
                                set(targetValue, match.prop, newValue);
                            }
                        }
                    }
                }
            }
            if (!target) {
                set(data, keypath, newValue);
            }
            instance.diff(keypath, newValue, oldValue);
        };
        if (string(keypath)) {
            setValue(value, keypath);
        }
        else if (object(keypath)) {
            each$2(keypath, setValue);
        }
    }
    /**
     * 同步调用的 diff，用于触发 syncEmitter，以及唤醒 asyncEmitter
     *
     * @param keypath
     * @param newValue
     * @param oldValue
     */
    diff(keypath, newValue, oldValue) {
        const instance = this, { syncEmitter, asyncEmitter, asyncChanges } = instance, 
        /**
         * 我们认为 $ 开头的变量是不可递归的
         * 比如浏览器中常见的 $0 表示当前选中元素
         * DOM 元素是不能递归的
         */
        isRecursive = codeAt(keypath) !== 36;
        diffWatcher(keypath, newValue, oldValue, syncEmitter.listeners, isRecursive, function (watchKeypath, keypath, newValue, oldValue) {
            syncEmitter.fire(watchKeypath, [newValue, oldValue, keypath]);
        });
        /**
         * 此处有坑，举个例子
         *
         * observer.watch('a', function () {})
         *
         * observer.set('a', 1)
         *
         * observer.watch('a', function () {})
         *
         * 这里，第一个 watcher 应该触发，但第二个不应该，因为它绑定监听时，值已经是最新的了
         */
        diffWatcher(keypath, newValue, oldValue, asyncEmitter.listeners, isRecursive, function (watchKeypath, keypath, newValue, oldValue) {
            each(asyncEmitter.listeners[watchKeypath], function (item) {
                item.count++;
            });
            const { keypaths } = asyncChanges[keypath] || (asyncChanges[keypath] = { value: oldValue, keypaths: [] });
            if (!has(keypaths, watchKeypath)) {
                push(keypaths, watchKeypath);
            }
            if (!instance.pending) {
                instance.pending = TRUE;
                instance.nextTask.append(function () {
                    if (instance.pending) {
                        instance.pending = UNDEFINED;
                        instance.diffAsync();
                    }
                });
            }
        });
    }
    /**
     * 异步触发的 diff
     */
    diffAsync() {
        const instance = this, { asyncEmitter, asyncChanges } = instance;
        instance.asyncChanges = {};
        each$2(asyncChanges, function (change, keypath) {
            const args = [instance.get(keypath), change.value, keypath];
            // 不能在这判断新旧值是否相同，相同就不 fire
            // 因为前面标记了 count，在这中断会导致 count 无法清除
            each(change.keypaths, function (watchKeypath) {
                asyncEmitter.fire(watchKeypath, args, filterWatcher);
            });
        });
    }
    /**
     * 添加计算属性
     *
     * @param keypath
     * @param computed
     */
    addComputed(keypath, options) {
        let cache = TRUE, sync = TRUE, deps = [], getter, setter;
        if (func(options)) {
            getter = options;
        }
        else if (object(options)) {
            const computedOptions = options;
            if (boolean(computedOptions.cache)) {
                cache = computedOptions.cache;
            }
            if (boolean(computedOptions.sync)) {
                sync = computedOptions.sync;
            }
            // 因为可能会修改 deps，所以这里创建一个新的 deps，避免影响外部传入的 deps
            if (array(computedOptions.deps)) {
                deps = copy(computedOptions.deps);
            }
            if (func(computedOptions.get)) {
                getter = computedOptions.get;
            }
            if (func(computedOptions.set)) {
                setter = computedOptions.set;
            }
        }
        if (getter) {
            const instance = this, computed = new Computed(keypath, sync, cache, deps, instance, getter, setter);
            if (!instance.computed) {
                instance.computed = {};
            }
            instance.computed[keypath] = computed;
            instance.reversedComputedKeys = sort(instance.computed, TRUE);
            return computed;
        }
    }
    /**
     * 移除计算属性
     *
     * @param keypath
     */
    removeComputed(keypath) {
        const instance = this, { computed } = instance;
        if (computed && has$2(computed, keypath)) {
            delete computed[keypath];
            instance.reversedComputedKeys = sort(computed, TRUE);
        }
    }
    /**
     * 监听数据变化
     *
     * @param keypath
     * @param watcher
     * @param immediate
     */
    watch(keypath, watcher, immediate) {
        const instance = this, { context, syncEmitter, asyncEmitter } = instance, bind = function (keypath, options) {
            const emitter = options.sync ? syncEmitter : asyncEmitter, 
            // formatWatcherOptions 保证了 options.watcher 一定存在
            listener = {
                fn: options.watcher,
                ctx: context,
                count: 0,
            };
            if (options.once) {
                listener.max = 1;
            }
            emitter.on(keypath, listener);
            if (options.immediate) {
                execute(options.watcher, context, [
                    instance.get(keypath),
                    UNDEFINED,
                    keypath
                ]);
            }
        };
        if (string(keypath)) {
            bind(keypath, formatWatcherOptions(watcher, immediate));
            return;
        }
        each$2(keypath, function (options, keypath) {
            bind(keypath, formatWatcherOptions(options));
        });
    }
    /**
     * 取消监听数据变化
     *
     * @param keypath
     * @param watcher
     */
    unwatch(keypath, watcher) {
        this.syncEmitter.off(keypath, watcher);
        this.asyncEmitter.off(keypath, watcher);
    }
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     *
     * @param keypath
     * @return 取反后的布尔值
     */
    toggle(keypath) {
        const value = !this.get(keypath);
        this.set(keypath, value);
        return value;
    }
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    increase(keypath, step, max) {
        const value = toNumber(this.get(keypath), 0) + (step || 1);
        if (!number(max) || value <= max) {
            this.set(keypath, value);
            return value;
        }
    }
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    decrease(keypath, step, min) {
        const value = toNumber(this.get(keypath), 0) - (step || 1);
        if (!number(min) || value >= min) {
            this.set(keypath, value);
            return value;
        }
    }
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    insert(keypath, item, index) {
        let list = this.get(keypath);
        list = !array(list) ? [] : copy(list);
        const { length } = list;
        if (index === TRUE || index === length) {
            list.push(item);
        }
        else if (index === FALSE || index === 0) {
            list.unshift(item);
        }
        else if (index > 0 && index < length) {
            list.splice(index, 0, item);
        }
        else {
            return;
        }
        this.set(keypath, list);
        return TRUE;
    }
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    append(keypath, item) {
        return this.insert(keypath, item, TRUE);
    }
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    prepend(keypath, item) {
        return this.insert(keypath, item, FALSE);
    }
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    removeAt(keypath, index) {
        let list = this.get(keypath);
        if (array(list)
            && index >= 0
            && index < list.length) {
            list = copy(list);
            list.splice(index, 1);
            this.set(keypath, list);
            return TRUE;
        }
    }
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    remove(keypath, item) {
        let list = this.get(keypath);
        if (array(list)) {
            list = copy(list);
            if (remove(list, item)) {
                this.set(keypath, list);
                return TRUE;
            }
        }
    }
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    copy(data, deep) {
        return copy(data, deep);
    }
    /**
     * 销毁
     */
    destroy() {
        const instance = this;
        instance.syncEmitter.off();
        instance.asyncEmitter.off();
        instance.nextTask.clear();
        clear(instance);
    }
}

/**
 * 节流调用
 *
 * @param fn 需要节制调用的函数
 * @param delay 调用的时间间隔，单位毫秒
 * @param immediate 是否立即触发
 * @return 节流函数
 */
function debounce (fn, delay, immediate) {
    let timer;
    return function () {
        if (!timer) {
            const args = toArray(arguments);
            if (immediate) {
                execute(fn, UNDEFINED, args);
            }
            timer = setTimeout(function () {
                timer = UNDEFINED;
                if (!immediate) {
                    execute(fn, UNDEFINED, args);
                }
            }, delay);
        }
    };
}

function bind(node, directive, vnode) {
    let { key, name, modifier, handler } = directive, { lazy } = vnode;
    if (!handler) {
        return;
    }
    if (lazy) {
        const value = lazy[name] || lazy[EMPTY_STRING];
        if (value === TRUE) {
            name = EVENT_CHANGE;
        }
        else if (value > 0) {
            handler = debounce(handler, value, 
            // 避免连续多次点击，主要用于提交表单场景
            // 移动端的 tap 事件可自行在业务层打补丁实现
            name === EVENT_CLICK || name === EVENT_TAP);
        }
    }
    let element;
    if (vnode.isComponent) {
        const component = node;
        if (modifier === MODIFER_NATIVE) {
            element = component.$el;
            on(element, name, handler);
            vnode.data[key] = function () {
                off(element, name, handler);
            };
        }
        else {
            // 还原命名空间
            if (modifier) {
                name += RAW_DOT + modifier;
            }
            component.on(name, handler);
            vnode.data[key] = function () {
                component.off(name, handler);
            };
        }
    }
    else {
        element = node;
        on(element, name, handler);
        vnode.data[key] = function () {
            off(element, name, handler);
        };
    }
}
function unbind(node, directive, vnode) {
    execute(vnode.data[directive.key]);
}

var event = /*#__PURE__*/Object.freeze({
  bind: bind,
  unbind: unbind
});

function debounceIfNeeded(fn, lazy) {
    // 应用 lazy
    return lazy && lazy !== TRUE
        ? debounce(fn, lazy)
        : fn;
}
const inputControl = {
    set(node, value) {
        node.value = toString(value);
    },
    sync(node, keypath, context) {
        context.set(keypath, node.value);
    },
    name: RAW_VALUE
}, radioControl = {
    set(node, value) {
        node.checked = node.value === toString(value);
    },
    sync(node, keypath, context) {
        if (node.checked) {
            context.set(keypath, node.value);
        }
    },
    name: 'checked'
}, checkboxControl = {
    set(node, value) {
        node.checked = array(value)
            ? has(value, node.value, FALSE)
            : !!value;
    },
    sync(node, keypath, context) {
        const value = context.get(keypath);
        if (array(value)) {
            if (node.checked) {
                context.append(keypath, node.value);
            }
            else {
                context.removeAt(keypath, indexOf(value, node.value, FALSE));
            }
        }
        else {
            context.set(keypath, node.checked);
        }
    },
    name: 'checked'
}, selectControl = {
    set(node, value) {
        each(toArray(node.options), node.multiple
            ? function (option) {
                option.selected = has(value, option.value, FALSE);
            }
            : function (option, index) {
                if (option.value == value) {
                    node.selectedIndex = index;
                    return FALSE;
                }
            });
    },
    sync(node, keypath, context) {
        const { options } = node;
        if (node.multiple) {
            const values = [];
            each(toArray(options), function (option) {
                if (option.selected) {
                    push(values, option.value);
                }
            });
            context.set(keypath, values);
        }
        else {
            context.set(keypath, options[node.selectedIndex].value);
        }
    },
    name: RAW_VALUE
};
const once = TRUE;
function bind$1(node, directive, vnode) {
    let { context, lazy, isComponent } = vnode, dataBinding = directive.modifier, lazyValue = lazy && (lazy[DIRECTIVE_MODEL] || lazy[EMPTY_STRING]), set, unbind;
    if (isComponent) {
        let component = node, viewBinding = component.$model, viewSyncing = debounceIfNeeded(function (newValue) {
            context.set(dataBinding, newValue);
        }, lazyValue);
        set = function (newValue) {
            if (set) {
                component.set(viewBinding, newValue);
            }
        };
        unbind = function () {
            component.unwatch(viewBinding, viewSyncing);
        };
        component.watch(viewBinding, viewSyncing);
    }
    else {
        let element = node, control = vnode.tag === 'select'
            ? selectControl
            : inputControl, 
        // checkbox,radio,select 监听的是 change 事件
        eventName = EVENT_CHANGE;
        if (control === inputControl) {
            const type = node.type;
            if (type === 'radio') {
                control = radioControl;
            }
            else if (type === 'checkbox') {
                control = checkboxControl;
            }
            // 如果是输入框，则切换成 model 事件
            // model 事件是个 yox-dom 实现的特殊事件
            // 不会在输入法组合文字过程中得到触发事件
            else if (lazyValue !== TRUE) {
                eventName = EVENT_MODEL;
            }
        }
        set = function (newValue) {
            if (set) {
                control.set(element, newValue);
            }
        };
        const sync = debounceIfNeeded(function () {
            control.sync(element, dataBinding, context);
        }, lazyValue);
        unbind = function () {
            off(element, eventName, sync);
        };
        on(element, eventName, sync);
        control.set(element, directive.value);
    }
    // 监听数据，修改界面
    context.watch(dataBinding, set);
    vnode.data[directive.key] = function () {
        context.unwatch(dataBinding, set);
        set = UNDEFINED;
        unbind();
    };
}
function unbind$1(node, directive, vnode) {
    execute(vnode.data[directive.key]);
}

var model = /*#__PURE__*/Object.freeze({
  once: once,
  bind: bind$1,
  unbind: unbind$1
});

const once$1 = TRUE;
function bind$2(node, directive, vnode) {
    // binding 可能是模糊匹配
    // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
    let binding = directive.modifier, 
    // 提前判断好是否是模糊匹配，避免 watcher 频繁执行判断逻辑
    isFuzzy$1 = isFuzzy(binding), watcher = function (newValue, _, keypath) {
        if (watcher) {
            const name = isFuzzy$1
                ? matchFuzzy(keypath, binding)
                : directive.name;
            if (vnode.isComponent) {
                const component = node;
                component.checkProp(name, newValue);
                component.set(name, newValue);
            }
            else {
                const element = node;
                if (isDef(directive.hint)) {
                    prop(element, name, newValue);
                }
                else {
                    attr(element, name, newValue);
                }
            }
        }
    };
    vnode.context.watch(binding, watcher);
    vnode.data[directive.key] = function () {
        vnode.context.unwatch(binding, watcher);
        watcher = UNDEFINED;
    };
}
function unbind$2(node, directive, vnode) {
    execute(vnode.data[directive.key]);
}

var binding = /*#__PURE__*/Object.freeze({
  once: once$1,
  bind: bind$2,
  unbind: unbind$2
});

const globalDirectives = {}, globalTransitions = {}, globalComponents = {}, globalPartials = {}, globalFilters = {}, compileCache = {}, TEMPLATE_COMPUTED = '$$', selectorPattern = /^[#.][-\w+]+$/;
class Yox {
    constructor(options) {
        const instance = this, $options = options || EMPTY_OBJECT;
        // 为了冒泡 HOOK_BEFORE_CREATE 事件，必须第一时间创建 emitter
        // 监听各种事件
        // 支持命名空间
        instance.$emitter = new Emitter(TRUE);
        if ($options.events) {
            instance.on($options.events);
        }
        {
            // 当前组件的直接父组件
            if ($options.parent) {
                instance.$parent = $options.parent;
            }
            // 建立好父子连接后，立即触发钩子
            execute($options[HOOK_BEFORE_CREATE], instance, $options);
            // 冒泡 before create 事件
            instance.fire(HOOK_BEFORE_CREATE + NAMESPACE_HOOK, $options);
        }
        let { data, props, vnode, propTypes, computed, methods, watchers, extensions, } = $options;
        instance.$options = $options;
        if (extensions) {
            extend(instance, extensions);
        }
        // 数据源，默认值仅在创建组件时启用
        const source = props ? copy(props) : {};
        {
            if (propTypes) {
                each$2(propTypes, function (rule, key) {
                    let value = source[key];
                    {
                        checkProp(key, value, rule);
                    }
                    if (isUndef(value)) {
                        value = rule.value;
                        if (isDef(value)) {
                            source[key] = rule.type === RAW_FUNCTION
                                ? value
                                : func(value)
                                    ? value()
                                    : value;
                        }
                    }
                });
            }
        }
        // 先放 props
        // 当 data 是函数时，可以通过 this.get() 获取到外部数据
        const observer = instance.$observer = new Observer(source, instance);
        if (computed) {
            each$2(computed, function (options, keypath) {
                observer.addComputed(keypath, options);
            });
        }
        // 后放 data
        {
            if (vnode && object(data)) {
                warn(`The "data" option of child component should be a function which return an object.`);
            }
        }
        const extend$1 = func(data) ? execute(data, instance, options) : data;
        if (object(extend$1)) {
            each$2(extend$1, function (value, key) {
                {
                    if (has$2(source, key)) {
                        warn(`The data "${key}" is already used as a prop.`);
                    }
                }
                source[key] = value;
            });
        }
        if (methods) {
            each$2(methods, function (method, name) {
                {
                    if (instance[name]) {
                        fatal(`The method "${name}" is conflicted with built-in methods.`);
                    }
                }
                instance[name] = method;
            });
        }
        {
            let placeholder = UNDEFINED, { el, root, model, context, replace, template, transitions, components, directives, partials, filters, slots, } = $options;
            if (model) {
                instance.$model = model;
            }
            // 把 slots 放进数据里，方便 get
            if (slots) {
                extend(source, slots);
            }
            // 检查 template
            if (string(template)) {
                // 传了选择器，则取对应元素的 html
                if (selectorPattern.test(template)) {
                    placeholder = find(template);
                    if (placeholder) {
                        template = html(placeholder);
                        placeholder = UNDEFINED;
                    }
                    else {
                        fatal(`The selector "${template}" can't match an element.`);
                    }
                }
            }
            // 检查 el
            if (el) {
                if (string(el)) {
                    const selector = el;
                    if (selectorPattern.test(selector)) {
                        placeholder = find(selector);
                        {
                            if (!placeholder) {
                                fatal(`The selector "${selector}" can't match an element.`);
                            }
                        }
                    }
                    else {
                        fatal(`The "el" option should be a selector.`);
                    }
                }
                else {
                    placeholder = el;
                }
                if (!replace) {
                    append(placeholder, placeholder = createComment(EMPTY_STRING));
                }
            }
            // 根组件
            if (root) {
                instance.$root = root;
            }
            // 当前组件是被哪个组件渲染出来的
            // 因为有 slot 机制，$context 不一定等于 $parent
            if (context) {
                instance.$context = context;
            }
            setFlexibleOptions(instance, RAW_TRANSITION, transitions);
            setFlexibleOptions(instance, RAW_COMPONENT, components);
            setFlexibleOptions(instance, RAW_DIRECTIVE, directives);
            setFlexibleOptions(instance, RAW_PARTIAL, partials);
            setFlexibleOptions(instance, RAW_FILTER, filters);
            // 当存在模板和计算属性时
            // 因为这里把模板当做一种特殊的计算属性
            // 因此模板这个计算属性的优先级应该最高
            if (template) {
                // 拷贝一份，避免影响外部定义的 watchers
                const newWatchers = watchers
                    ? copy(watchers)
                    : {};
                newWatchers[TEMPLATE_COMPUTED] = {
                    // 模板一旦变化，立即刷新
                    sync: TRUE,
                    watcher: function (vnode) {
                        instance.update(vnode, instance.$vnode);
                    }
                };
                // 当模板的依赖变了，则重新创建 virtual dom
                observer.addComputed(TEMPLATE_COMPUTED, {
                    // 当模板依赖变化时，异步通知模板更新
                    sync: FALSE,
                    get: function () {
                        return instance.render();
                    }
                });
                afterCreateHook(instance, newWatchers);
                // 编译模板
                // 在开发阶段，template 是原始的 html 模板
                // 在产品阶段，template 是编译后的渲染函数
                // 当然，具体是什么需要外部自己控制
                instance.$template = string(template)
                    ? Yox.compile(template)
                    : template;
                if (!vnode) {
                    {
                        if (!placeholder) {
                            fatal('The "el" option is required for root component.');
                        }
                    }
                    vnode = create(domApi, placeholder, instance, EMPTY_STRING);
                }
                instance.update(instance.get(TEMPLATE_COMPUTED), vnode);
                return;
            }
            else {
                if (placeholder || vnode) {
                    fatal('The "template" option is required.');
                }
            }
        }
        afterCreateHook(instance, watchers);
    }
    /**
     * 安装插件
     *
     * 插件必须暴露 install 方法
     */
    static use(plugin) {
        plugin.install(Yox);
    }
    /**
     * 定义组件对象
     */
    static define(options) {
        return options;
    }
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    static nextTick(task, context) {
        NextTask.shared().append(task, context);
    }
    /**
     * 编译模板，暴露出来是为了打包阶段的模板预编译
     */
    static compile(template, stringify) {
        {
            // 需要编译的都是模板源文件，一旦经过预编译，就成了 render 函数，不会再走进 Yox.compile
            if (!compileCache[template]) {
                const nodes = compile$1(template);
                {
                    if (nodes.length !== 1) {
                        fatal(`The "template" option should have just one root element.`);
                    }
                }
                compileCache[template] = generate$1(nodes[0]);
            }
            template = compileCache[template];
            return stringify
                ? template
                : new Function(`return ${template}`)();
        }
    }
    /**
     * 注册全局指令
     */
    static directive(name, directive) {
        {
            if (string(name) && !directive) {
                return getResource(globalDirectives, name);
            }
            setResource(globalDirectives, name, directive);
        }
    }
    /**
     * 注册全局过渡动画
     */
    static transition(name, transition) {
        {
            if (string(name) && !transition) {
                return getResource(globalTransitions, name);
            }
            setResource(globalTransitions, name, transition);
        }
    }
    /**
     * 注册全局组件
     */
    static component(name, component) {
        {
            if (string(name) && !component) {
                return getResource(globalComponents, name);
            }
            setResource(globalComponents, name, component);
        }
    }
    /**
     * 注册全局子模板
     */
    static partial(name, partial) {
        {
            if (string(name) && !partial) {
                return getResource(globalPartials, name);
            }
            setResource(globalPartials, name, partial, Yox.compile);
        }
    }
    /**
     * 注册全局过滤器
     */
    static filter(name, filter) {
        {
            if (string(name) && !filter) {
                return getResource(globalFilters, name);
            }
            setResource(globalFilters, name, filter);
        }
    }
    /**
     * 取值
     */
    get(keypath, defaultValue) {
        return this.$observer.get(keypath, defaultValue);
    }
    /**
     * 设值
     */
    set(keypath, value) {
        // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
        // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
        const { $observer } = this;
        if ($observer) {
            $observer.set(keypath, value);
        }
    }
    /**
     * 监听事件，支持链式调用
     */
    on(type, listener) {
        addEvents(this, type, listener);
        return this;
    }
    /**
     * 监听一次事件，支持链式调用
     */
    once(type, listener) {
        addEvents(this, type, listener, TRUE);
        return this;
    }
    /**
     * 取消监听事件，支持链式调用
     */
    off(type, listener) {
        this.$emitter.off(type, listener);
        return this;
    }
    /**
     * 发射事件
     */
    fire(type, data, downward) {
        // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
        // 内部为了保持格式统一
        // 需要转成 Event，这样还能知道 target 是哪个组件
        let instance = this, { $emitter, $parent, $children } = instance, event = type instanceof CustomEvent ? type : new CustomEvent(type), namespace = event.ns || (event.ns = $emitter.parse(event.type)), args = [event], isComplete;
        // 告诉外部是谁发出的事件
        if (!event.target) {
            event.target = instance;
        }
        // 比如 fire('name', true) 直接向下发事件
        if (object(data)) {
            push(args, data);
        }
        else if (data === TRUE) {
            downward = TRUE;
        }
        // 如果手动 fire 带上了事件命名空间
        // 则命名空间不能是 native，因为 native 有特殊用处
        {
            if (namespace.ns === MODIFER_NATIVE) {
                error(`"${event.type}": The namespace "${MODIFER_NATIVE}" is not permitted.`);
            }
        }
        isComplete = $emitter.fire(namespace, args);
        if (isComplete) {
            if (downward) {
                if ($children) {
                    event.phase = CustomEvent.PHASE_DOWNWARD;
                    each($children, function (child) {
                        return isComplete = child.fire(event, data, TRUE);
                    });
                }
            }
            else if ($parent) {
                event.phase = CustomEvent.PHASE_UPWARD;
                isComplete = $parent.fire(event, data);
            }
        }
        return isComplete;
    }
    /**
     * 监听数据变化，支持链式调用
     */
    watch(keypath, watcher, immediate) {
        this.$observer.watch(keypath, watcher, immediate);
        return this;
    }
    /**
     * 取消监听数据变化，支持链式调用
     */
    unwatch(keypath, watcher) {
        this.$observer.unwatch(keypath, watcher);
        return this;
    }
    /**
     * 加载组件，组件可以是同步或异步，最后会调用 callback
     *
     * @param name 组件名称
     * @param callback 组件加载成功后的回调
     */
    loadComponent(name, callback) {
        {
            if (!loadComponent(this.$components, name, callback)) {
                {
                    if (!loadComponent(globalComponents, name, callback)) {
                        error(`The component "${name}" is not found.`);
                    }
                }
            }
        }
    }
    /**
     * 创建子组件
     *
     * @param options 组件配置
     * @param vnode 虚拟节点
     */
    createComponent(options, vnode) {
        {
            const instance = this;
            options = copy(options);
            options.root = instance.$root || instance;
            options.parent = instance;
            options.context = vnode.context;
            options.vnode = vnode;
            options.replace = TRUE;
            let { props, slots, directives } = vnode, model = directives && directives[DIRECTIVE_MODEL];
            if (model) {
                if (!props) {
                    props = {};
                }
                const key = options.model || MODEL_PROP_DEFAULT;
                props[key] = model.value;
                options.model = key;
            }
            if (props) {
                options.props = props;
            }
            if (slots) {
                options.slots = slots;
            }
            const child = new Yox(options);
            push(instance.$children || (instance.$children = []), child);
            const node = child.$el;
            if (node) {
                vnode.node = node;
            }
            else {
                fatal(`The root element of component "${vnode.tag}" is not found.`);
            }
            return child;
        }
    }
    /**
     * 注册当前组件级别的指令
     */
    directive(name, directive) {
        {
            const instance = this, { $directives } = instance;
            if (string(name) && !directive) {
                return getResource($directives, name, Yox.directive);
            }
            setResource($directives || (instance.$directives = {}), name, directive);
        }
    }
    /**
     * 注册当前组件级别的过渡动画
     */
    transition(name, transition) {
        {
            const instance = this, { $transitions } = instance;
            if (string(name) && !transition) {
                return getResource($transitions, name, Yox.transition);
            }
            setResource($transitions || (instance.$transitions = {}), name, transition);
        }
    }
    /**
     * 注册当前组件级别的组件
     */
    component(name, component) {
        {
            const instance = this, { $components } = instance;
            if (string(name) && !component) {
                return getResource($components, name, Yox.component);
            }
            setResource($components || (instance.$components = {}), name, component);
        }
    }
    /**
     * 注册当前组件级别的子模板
     */
    partial(name, partial) {
        {
            const instance = this, { $partials } = instance;
            if (string(name) && !partial) {
                return getResource($partials, name, Yox.partial);
            }
            setResource($partials || (instance.$partials = {}), name, partial, Yox.compile);
        }
    }
    /**
     * 注册当前组件级别的过滤器
     */
    filter(name, filter) {
        {
            const instance = this, { $filters } = instance;
            if (string(name) && !filter) {
                return getResource($filters, name, Yox.filter);
            }
            setResource($filters || (instance.$filters = {}), name, filter);
        }
    }
    /**
     * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
     * 而你非常确定需要更新模板，强制刷新正是你需要的
     */
    forceUpdate(data) {
        {
            const instance = this, { $vnode, $observer } = instance, { computed } = $observer;
            if ($vnode && computed) {
                const template = computed[TEMPLATE_COMPUTED], oldValue = template.get();
                if (data) {
                    instance.set(data);
                }
                // 当前可能正在进行下一轮更新
                $observer.nextTask.run();
                // 没有更新模板，强制刷新
                if (!data && oldValue === template.get()) {
                    instance.update(template.get(TRUE), $vnode);
                }
            }
        }
    }
    /**
     * 把模板抽象语法树渲染成 virtual dom
     */
    render() {
        {
            const instance = this;
            return render(instance, instance.$observer, instance.$template, merge(instance.$filters, globalFilters), merge(instance.$partials, globalPartials), merge(instance.$directives, globalDirectives), merge(instance.$transitions, globalTransitions));
        }
    }
    /**
     * 更新 virtual dom
     *
     * @param vnode
     * @param oldVnode
     */
    update(vnode, oldVnode) {
        {
            let instance = this, { $vnode, $options } = instance, afterHook;
            // 每次渲染重置 refs
            // 在渲染过程中收集最新的 ref
            // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
            instance.$refs = {};
            if ($vnode) {
                execute($options[HOOK_BEFORE_UPDATE], instance);
                instance.fire(HOOK_BEFORE_UPDATE + NAMESPACE_HOOK);
                patch(domApi, vnode, oldVnode);
                afterHook = HOOK_AFTER_UPDATE;
            }
            else {
                execute($options[HOOK_BEFORE_MOUNT], instance);
                instance.fire(HOOK_BEFORE_MOUNT + NAMESPACE_HOOK);
                patch(domApi, vnode, oldVnode);
                instance.$el = vnode.node;
                afterHook = HOOK_AFTER_MOUNT;
            }
            instance.$vnode = vnode;
            // 跟 nextTask 保持一个节奏
            // 这样可以预留一些优化的余地
            Yox.nextTick(function () {
                if (instance.$vnode) {
                    execute($options[afterHook], instance);
                    instance.fire(afterHook + NAMESPACE_HOOK);
                }
            });
        }
    }
    /**
     * 校验组件参数
     *
     * @param props
     */
    checkProp(key, value) {
        {
            const { propTypes } = this.$options;
            if (propTypes) {
                const rule = propTypes[key];
                if (rule) {
                    checkProp(key, value, rule);
                }
            }
        }
    }
    /**
     * 销毁组件
     */
    destroy() {
        const instance = this, { $parent, $options, $emitter, $observer } = instance;
        {
            execute($options[HOOK_BEFORE_DESTROY], instance);
            instance.fire(HOOK_BEFORE_DESTROY + NAMESPACE_HOOK);
            const { $vnode } = instance;
            if ($parent && $parent.$children) {
                remove($parent.$children, instance);
            }
            if ($vnode) {
                // virtual dom 通过判断 parent.$vnode 知道宿主组件是否正在销毁
                instance.$vnode = UNDEFINED;
                destroy(domApi, $vnode, !$parent);
            }
        }
        $observer.destroy();
        {
            execute($options[HOOK_AFTER_DESTROY], instance);
            instance.fire(HOOK_AFTER_DESTROY + NAMESPACE_HOOK);
        }
        // 发完 after destroy 事件再解绑所有事件
        $emitter.off();
        clear(instance);
    }
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    nextTick(task) {
        this.$observer.nextTask.append(task, this);
    }
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     */
    toggle(keypath) {
        return this.$observer.toggle(keypath);
    }
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    increase(keypath, step, max) {
        return this.$observer.increase(keypath, step, max);
    }
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    decrease(keypath, step, min) {
        return this.$observer.decrease(keypath, step, min);
    }
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    insert(keypath, item, index) {
        return this.$observer.insert(keypath, item, index);
    }
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    append(keypath, item) {
        return this.$observer.append(keypath, item);
    }
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    prepend(keypath, item) {
        return this.$observer.prepend(keypath, item);
    }
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    removeAt(keypath, index) {
        return this.$observer.removeAt(keypath, index);
    }
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    remove(keypath, item) {
        return this.$observer.remove(keypath, item);
    }
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    copy(data, deep) {
        return this.$observer.copy(data, deep);
    }
}
/**
 * core 版本
 */
Yox.version = "1.0.0-alpha.89";
/**
 * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
 */
Yox.is = is;
Yox.dom = domApi;
Yox.array = array$1;
Yox.object = object$1;
Yox.string = string$1;
Yox.logger = logger;
Yox.Event = CustomEvent;
Yox.Emitter = Emitter;
const toString$2 = Object.prototype.toString;
function matchType(value, type) {
    return type === 'numeric'
        ? numeric(value)
        : lower(toString$2.call(value)) === `[object ${type}]`;
}
function checkProp(key, value, rule) {
    // 传了数据
    if (isDef(value)) {
        const type = rule.type;
        // 如果不写 type 或 type 不是 字符串 或 数组
        // 就当做此规则无效，和没写一样
        if (type) {
            // 自定义函数判断是否匹配类型
            // 自己打印警告信息吧
            if (func(type)) {
                type(key, value);
            }
            else {
                let matched = FALSE;
                // type: 'string'
                if (!falsy$1(type)) {
                    matched = matchType(value, type);
                }
                // type: ['string', 'number']
                else if (!falsy(type)) {
                    each(type, function (item) {
                        if (matchType(value, item)) {
                            matched = TRUE;
                            return FALSE;
                        }
                    });
                }
                if (!matched) {
                    warn(`The type of prop "${key}" expected to be "${type}", but is "${value}".`);
                }
            }
        }
        else {
            warn(`The prop "${key}" in propTypes has no type.`);
        }
    }
    // 没传值但此项是必传项
    else if (rule.required) {
        warn(`The prop "${key}" is marked as required, but its value is not found.`);
    }
}
function afterCreateHook(instance, watchers) {
    if (watchers) {
        instance.watch(watchers);
    }
    {
        execute(instance.$options[HOOK_AFTER_CREATE], instance);
        instance.fire(HOOK_AFTER_CREATE + NAMESPACE_HOOK);
    }
}
function setFlexibleOptions(instance, key, value) {
    if (func(value)) {
        instance[key](execute(value, instance));
    }
    else if (object(value)) {
        instance[key](value);
    }
}
function addEvent(instance, type, listener, once) {
    const options = {
        fn: listener,
        ctx: instance
    };
    if (once) {
        options.max = 1;
    }
    // YoxInterface 没有声明 $emitter，因为不想让外部访问，
    // 但是这里要用一次，所以加了 as any
    instance.$emitter.on(type, options);
}
function addEvents(instance, type, listener, once) {
    if (string(type)) {
        addEvent(instance, type, listener, once);
    }
    else {
        each$2(type, function (value, key) {
            addEvent(instance, key, value, once);
        });
    }
}
function loadComponent(registry, name, callback) {
    if (registry && registry[name]) {
        const component = registry[name];
        // 注册的是异步加载函数
        if (func(component)) {
            registry[name] = [callback];
            const componentCallback = function (result) {
                const queue = registry[name], options = result['default'] || result;
                registry[name] = options;
                each(queue, function (callback) {
                    callback(options);
                });
            }, promise = component(componentCallback);
            if (promise) {
                promise.then(componentCallback);
            }
        }
        // 正在加载中
        else if (array(component)) {
            push(component, callback);
        }
        // 不是异步加载函数，直接同步返回
        else {
            callback(component);
        }
        return TRUE;
    }
}
function getResource(registry, name, lookup) {
    if (registry && registry[name]) {
        return registry[name];
    }
    else if (lookup) {
        return lookup(name);
    }
}
function setResource(registry, name, value, formatValue) {
    if (string(name)) {
        registry[name] = formatValue ? formatValue(value) : value;
    }
    else {
        each$2(name, function (value, key) {
            registry[key] = formatValue ? formatValue(value) : value;
        });
    }
}
{
    // 全局注册内置指令
    Yox.directive({ event, model, binding });
    // 全局注册内置过滤器
    Yox.filter({
        hasSlot(name) {
            // 不鼓励在过滤器使用 this
            // 因此过滤器没有 this 的类型声明
            // 这个内置过滤器是不得不用 this
            return isDef(this.get(SLOT_DATA_PREFIX + name));
        }
    });
}

export default Yox;
//# sourceMappingURL=yox.esm.js.map
