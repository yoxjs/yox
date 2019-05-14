/**
 * yox.js v1.0.0-alpha.35
 * (c) 2017-2019 musicode
 * Released under the MIT License.
 */

/**
 * 为了压缩，定义的常量
 */
var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = void 0;
var RAW_UNDEFINED = 'undefined';
var RAW_FILTER = 'filter';
var RAW_PARTIAL = 'partial';
var RAW_COMPONENT = 'component';
var RAW_DIRECTIVE = 'directive';
var RAW_TRANSITION = 'transition';
var RAW_VALUE = 'value';
var RAW_LENGTH = 'length';
var RAW_FUNCTION = 'function';
var RAW_TEMPLATE = 'template';
var RAW_WILDCARD = '*';
/**
 * Single instance for window in browser
 */
var WINDOW = typeof window !== RAW_UNDEFINED ? window : UNDEFINED;
/**
 * Single instance for document in browser
 */
var DOCUMENT = typeof document !== RAW_UNDEFINED ? document : UNDEFINED;
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
var EVENT_TAP = 'tap';
/**
 * 点击事件
 */
var EVENT_CLICK = 'click';
/**
 * 输入事件
 */
var EVENT_INPUT = 'input';
/**
 * 变化事件
 */
var EVENT_CHANGE = 'change';
/**
 * 唯一内置的特殊事件：model
 */
var EVENT_MODEL = 'model';
/**
 * Single instance for noop function
 */
var EMPTY_FUNCTION = function () {
    /** yox */
};
/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
var EMPTY_OBJECT = Object.freeze({});
/**
 * 空数组
 */
var EMPTY_ARRAY = Object.freeze([]);
/**
 * 空字符串
 */
var EMPTY_STRING = '';

function isDef (target) {
    return target !== UNDEFINED;
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
    // 低版本 IE 会把 null 和 undefined 当作 object
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

var CustomEvent = /** @class */ (function () {
    /**
     * 构造函数
     *
     * 可以传事件名称，也可以传原生事件对象
     */
    function CustomEvent(type, originalEvent) {
        this.type = type;
        this.phase = CustomEvent.PHASE_CURRENT;
        if (originalEvent) {
            this.originalEvent = originalEvent;
        }
    }
    /**
     * 阻止事件的默认行为
     */
    CustomEvent.prototype.preventDefault = function () {
        var instance = this;
        if (!instance.isPrevented) {
            var originalEvent = instance.originalEvent;
            if (originalEvent) {
                originalEvent.preventDefault();
            }
            instance.isPrevented = TRUE;
        }
        return instance;
    };
    /**
     * 停止事件广播
     */
    CustomEvent.prototype.stopPropagation = function () {
        var instance = this;
        if (!instance.isStoped) {
            var originalEvent = instance.originalEvent;
            if (originalEvent) {
                originalEvent.stopPropagation();
            }
            instance.isStoped = TRUE;
        }
        return instance;
    };
    CustomEvent.prototype.prevent = function () {
        return this.preventDefault();
    };
    CustomEvent.prototype.stop = function () {
        return this.stopPropagation();
    };
    CustomEvent.PHASE_CURRENT = 0;
    CustomEvent.PHASE_UPWARD = 1;
    CustomEvent.PHASE_DOWNWARD = -1;
    return CustomEvent;
}());

/**
 * 遍历数组
 *
 * @param array
 * @param callback 返回 false 可停止遍历
 * @param reversed 是否逆序遍历
 */
function each(array, callback, reversed) {
    var length = array.length;
    if (length) {
        if (reversed) {
            for (var i = length - 1; i >= 0; i--) {
                if (callback(array[i], i, length) === FALSE) {
                    break;
                }
            }
        }
        else {
            for (var i = 0; i < length; i++) {
                if (callback(array[i], i, length) === FALSE) {
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
    var result = -1;
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
    var length = array.length;
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
    var length = array.length;
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
    var result = 0;
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
    var result = {};
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

var camelizePattern = /-([a-z])/gi, hyphenatePattern = /\B([A-Z])/g, capitalizePattern = /^[a-z]/, camelizeCache = {}, hyphenateCache = {}, capitalizeCache = {};
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
    var offset = str.length - part.length;
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

var SEP_DOT = '.', dotPattern = /\./g, asteriskPattern = /\*/g, doubleAsteriskPattern = /\*\*/g, splitCache = {}, patternCache = {};
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
    prefix += SEP_DOT;
    return startsWith(keypath, prefix)
        ? prefix.length
        : -1;
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
    var list = isDef(splitCache[keypath])
        ? splitCache[keypath]
        : (splitCache[keypath] = keypath.split(SEP_DOT));
    for (var i = 0, lastIndex = list.length - 1; i <= lastIndex; i++) {
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
        ? keypath1 + SEP_DOT + keypath2
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
    var cache = patternCache[pattern];
    if (!cache) {
        var str = pattern
            .replace(dotPattern, '\\.')
            .replace(asteriskPattern, '(\\w+)')
            .replace(doubleAsteriskPattern, '([\.\\w]+?)');
        cache = patternCache[pattern] = new RegExp("^" + str + "$");
    }
    var result = keypath.match(cache);
    if (result) {
        return result[1];
    }
}

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
    for (var key in object) {
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
function extend(original) {
    var arguments$1 = arguments;

    var objects = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        objects[_i - 1] = arguments$1[_i];
    }
    each(objects, function (object) {
        each$2(object, function (value, key) {
            original[key] = value;
        });
    });
    return original;
}
/**
 * 拷贝对象
 *
 * @param object
 * @param deep 是否需要深拷贝
 * @return
 */
function copy(object$1, deep) {
    var result = object$1;
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
 * 辅助 get 函数，持有最后找到的值，避免频繁的创建临时对象
 */
var valueHolder = {
    value: UNDEFINED
};
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
    /**
     * 考虑以下情况:
     *
     * {
     *   'a.b.c.d': 1,
     *   'a.b.c': {
     *      d: 2
     *   }
     * }
     *
     * 此时 keypath 是 `a.b.c.d`，可以获取到 1
     * 如果没有这个 key，按 keypath 推进是取不到值的，因为没有 a.b.c 对象
     * 个人觉得没有必要支持字面量，情况实在太多，会把这个函数搞的性能很差
     */
    each$1(keypath, function (key, isLast) {
        if (object != NULL) {
            // 先直接取值
            var value = object[key], 
            // 紧接着判断值是否存在
            // 下面会处理计算属性的值，不能在它后面设置 hasValue
            hasValue = isDef(value);
            // 如果是计算属性，取计算属性的值
            if (value && func(value.get)) {
                value = value.get();
            }
            if (isLast) {
                if (hasValue) {
                    valueHolder.value = value;
                    object = valueHolder;
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

var DEBUG = 1;
var INFO = 2;
var WARN = 3;
var ERROR = 4;
var FATAL = 5;
/**
 * 是否有原生的日志特性，没有必要单独实现
 */
var nativeConsole = typeof console !== RAW_UNDEFINED ? console : NULL, 
/**
 * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
 */
level = /yox/.test(toString(EMPTY_FUNCTION)) ? DEBUG : WARN, 
/**
 * console 样式前缀
 */
stylePrefix = '%c';
/**
 * 全局调试开关
 */
function getLevel() {
    if (WINDOW) {
        var logLevel = WINDOW['YOX_LOG_LEVEL'];
        if (logLevel >= DEBUG && logLevel <= FATAL) {
            return logLevel;
        }
    }
    return level;
}
function getStyle(backgroundColor) {
    return "background-color:" + backgroundColor + ";border-radius:20px;color:#fff;font-size:10px;padding:3px 6px;";
}
/**
 * 打印 debug 日志
 *
 * @param msg
 */
function debug(msg, tag) {
    if (nativeConsole && getLevel() <= DEBUG) {
        nativeConsole.log(stylePrefix + (tag || 'Yox debug'), getStyle('#888'), msg);
    }
}
/**
 * 打印 info 日志
 *
 * @param msg
 */
function info(msg, tag) {
    if (nativeConsole && getLevel() <= INFO) {
        nativeConsole.log(stylePrefix + (tag || 'Yox info'), getStyle('#2db7f5'), msg);
    }
}
/**
 * 打印 warn 日志
 *
 * @param msg
 */
function warn(msg, tag) {
    if (nativeConsole && getLevel() <= WARN) {
        nativeConsole.warn(stylePrefix + (tag || 'Yox warn'), getStyle('#f90'), msg);
    }
}
/**
 * 打印 error 日志
 *
 * @param msg
 */
function error(msg, tag) {
    if (nativeConsole && getLevel() <= ERROR) {
        nativeConsole.error(stylePrefix + (tag || 'Yox error'), getStyle('#ed4014'), msg);
    }
}
/**
 * 致命错误，中断程序
 *
 * @param msg
 */
function fatal(msg, tag) {
    if (getLevel() <= FATAL) {
        throw new Error("[" + (tag || 'Yox fatal') + "]: " + msg);
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

var Emitter = /** @class */ (function () {
    function Emitter(ns) {
        this.ns = ns || FALSE;
        this.listeners = {};
    }
    /**
     * 发射事件
     *
     * @param bullet 事件或事件名称
     * @param data 事件数据
     */
    Emitter.prototype.fire = function (type, args, filter) {
        var instance = this, _a = parseNamespace(instance.ns, type), name = _a.name, ns = _a.ns, list = instance.listeners[name], isComplete = TRUE;
        if (list) {
            // 避免遍历过程中，数组发生变化，比如增删了
            list = copy(list);
            // 判断是否是发射事件
            // 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
            // 因为事件处理函数的参数列表是 (event, data)
            var event_1 = args && args[0] instanceof CustomEvent
                ? args[0]
                : UNDEFINED;
            each(list, function (options, _) {
                // 命名空间不匹配
                if (!matchNamespace(ns, options)
                    // 在 fire 过程中被移除了
                    || !has(list, options)
                    // 传了 filter，则用 filter 判断是否过滤此 options
                    || (filter && !filter(type, args, options))) {
                    return;
                }
                // 为 event 对象加上当前正在处理的 listener
                // 这样方便业务层移除事件绑定
                // 比如 on('xx', function) 这样定义了匿名 listener
                // 在这个 listener 里面获取不到当前 listener 的引用
                // 为了能引用到，有时候会先定义 var listener = function,
                // 然后再 on('xx', listener) 这样其实是没有必要的
                if (event_1) {
                    event_1.listener = options.fn;
                }
                var result = execute(options.fn, options.ctx, args);
                if (event_1) {
                    event_1.listener = UNDEFINED;
                }
                // 执行次数
                options.num = options.num ? (options.num + 1) : 1;
                // 注册的 listener 可以指定最大执行次数
                if (options.num === options.max) {
                    instance.off(type, options.fn);
                }
                // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
                if (event_1) {
                    if (result === FALSE) {
                        event_1.prevent().stop();
                    }
                    else if (event_1.isStoped) {
                        result = FALSE;
                    }
                }
                if (result === FALSE) {
                    return isComplete = FALSE;
                }
            });
        }
        return isComplete;
    };
    /**
     * 注册监听
     *
     * @param type
     * @param listener
     */
    Emitter.prototype.on = function (type, listener) {
        var instance = this, listeners = instance.listeners, options = func(listener)
            ? { fn: listener }
            : listener;
        if (object(options) && func(options.fn)) {
            var _a = parseNamespace(instance.ns, type), name = _a.name, ns = _a.ns;
            options.ns = ns;
            push(listeners[name] || (listeners[name] = []), options);
        }
    };
    /**
     * 取消监听
     *
     * @param type
     * @param listener
     */
    Emitter.prototype.off = function (type, listener) {
        var instance = this, listeners = instance.listeners;
        if (type) {
            var _a = parseNamespace(instance.ns, type), name = _a.name, ns_1 = _a.ns, matchListener_1 = createMatchListener(listener), each$1 = function (list, name) {
                each(list, function (options, index) {
                    if (matchListener_1(options) && matchNamespace(ns_1, options)) {
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
            else if (ns_1) {
                each$2(listeners, each$1);
            }
        }
        else {
            // 清空
            instance.listeners = {};
        }
    };
    /**
     * 是否已监听某个事件
     *
     * @param type
     * @param listener
     */
    Emitter.prototype.has = function (type, listener) {
        var instance = this, listeners = instance.listeners, _a = parseNamespace(instance.ns, type), name = _a.name, ns = _a.ns, result = TRUE, matchListener = createMatchListener(listener), each$1 = function (list) {
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
    };
    return Emitter;
}());
/**
 * 把事件类型解析成命名空间格式
 *
 * @param ns
 * @param type
 */
function parseNamespace(ns, type) {
    var result = {
        name: type,
        ns: EMPTY_STRING
    };
    if (ns) {
        var index = indexOf$1(type, '.');
        if (index >= 0) {
            result.name = slice(type, 0, index);
            result.ns = slice(type, index + 1);
        }
    }
    return result;
}
function matchTrue(options) {
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
    var ns = options.ns;
    return ns && namespace
        ? ns === namespace
        : TRUE;
}

function isNative (target) {
    return func(target) && /native code/.test(toString(target));
}

var nextTick;
// IE (10+) 和 node
if (typeof setImmediate === RAW_FUNCTION && isNative(setImmediate)) {
    nextTick = setImmediate;
}
// 用 MessageChannel 去做 setImmediate 的 polyfill
// 原理是将新的 message 事件加入到原有的 dom events 之后
// 兼容性 IE10+ 和其他标准浏览器
if (typeof MessageChannel === RAW_FUNCTION && isNative(MessageChannel)) {
    nextTick = function (fn) {
        var channel = new MessageChannel();
        channel.port1.onmessage = fn;
        channel.port2.postMessage(1);
    };
}
else {
    nextTick = setTimeout;
}
var nextTick$1 = nextTick;

var shared;
var NextTask = /** @class */ (function () {
    function NextTask() {
        this.tasks = [];
    }
    /**
     * 全局单例
     */
    NextTask.shared = function () {
        return shared || (shared = new NextTask());
    };
    /**
     * 在队尾添加异步任务
     */
    NextTask.prototype.append = function (func, context) {
        var instance = this, tasks = instance.tasks;
        push(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick$1(function () {
                instance.run();
            });
        }
    };
    /**
     * 在队首添加异步任务
     */
    NextTask.prototype.prepend = function (func, context) {
        var instance = this, tasks = instance.tasks;
        unshift(tasks, {
            fn: func,
            ctx: context
        });
        if (tasks.length === 1) {
            nextTick$1(function () {
                instance.run();
            });
        }
    };
    /**
     * 清空异步队列
     */
    NextTask.prototype.clear = function () {
        this.tasks.length = 0;
    };
    /**
     * 立即执行异步任务，并清空队列
     */
    NextTask.prototype.run = function () {
        var tasks = this.tasks;
        if (tasks.length) {
            this.tasks = [];
            each(tasks, function (task) {
                execute(task.fn, task.ctx);
            });
        }
    };
    return NextTask;
}());

var SLOT_DATA_PREFIX = '$slot_';
var HINT_BOOLEAN = 3;
var DIRECTIVE_MODEL = 'model';
var DIRECTIVE_EVENT = 'event';
var DIRECTIVE_BINDING = 'binding';
var DIRECTIVE_CUSTOM = 'o';
var HOOK_BEFORE_CREATE = 'beforeCreate';
var HOOK_AFTER_CREATE = 'afterCreate';
var HOOK_BEFORE_MOUNT = 'beforeMount';
var HOOK_AFTER_MOUNT = 'afterMount';
var HOOK_BEFORE_UPDATE = 'beforeUpdate';
var HOOK_AFTER_UPDATE = 'afterUpdate';
var HOOK_BEFORE_DESTROY = 'beforeDestroy';
var HOOK_AFTER_DESTROY = 'afterDestroy';

var guid = 0;
function guid$1 () {
    return ++guid;
}

// vnode.data 内部使用的几个字段
var ID = '$id';
var VNODE = '$vnode';
var LOADING = '$loading';
var COMPONENT = '$component';
var LEAVING = '$leaving';

function update(api, vnode, oldVnode) {
    var node = vnode.node, nativeAttrs = vnode.nativeAttrs, oldNativeAttrs = oldVnode && oldVnode.nativeAttrs;
    if (nativeAttrs || oldNativeAttrs) {
        var newValue_1 = nativeAttrs || EMPTY_OBJECT, oldValue_1 = oldNativeAttrs || EMPTY_OBJECT;
        each$2(newValue_1, function (attr, name) {
            if (!oldValue_1[name]
                || attr.value !== oldValue_1[name].value) {
                api.attr(node, name, attr.value);
            }
        });
        each$2(oldValue_1, function (_, name) {
            if (!newValue_1[name]) {
                api.removeAttr(node, name);
            }
        });
    }
}

function update$1(api, vnode, oldVnode) {
    var node = vnode.node, nativeProps = vnode.nativeProps, oldNativeProps = oldVnode && oldVnode.nativeProps;
    if (nativeProps || oldNativeProps) {
        var newValue_1 = nativeProps || EMPTY_OBJECT, oldValue_1 = oldNativeProps || EMPTY_OBJECT;
        each$2(newValue_1, function (prop, name) {
            if (!oldValue_1[name]
                || prop.value !== oldValue_1[name].value) {
                api.prop(node, name, prop.value);
            }
        });
        each$2(oldValue_1, function (prop, name) {
            if (!newValue_1[name]) {
                api.removeProp(node, name, prop.hint);
            }
        });
    }
}

function update$2(vnode, oldVnode) {
    var data = vnode.data, directives = vnode.directives, oldDirectives = oldVnode && oldVnode.directives;
    if (directives || oldDirectives) {
        var node_1 = data[COMPONENT] || vnode.node, isKeypathChange_1 = oldVnode && vnode.keypath !== oldVnode.keypath, newValue_1 = directives || EMPTY_OBJECT, oldValue_1 = oldDirectives || EMPTY_OBJECT;
        each$2(newValue_1, function (directive, name) {
            var _a = directive.hooks, bind = _a.bind, unbind = _a.unbind;
            if (!oldValue_1[name]) {
                bind(node_1, directive, vnode);
            }
            else if (directive.value !== oldValue_1[name].value
                || isKeypathChange_1) {
                if (unbind) {
                    unbind(node_1, oldValue_1[name], oldVnode);
                }
                bind(node_1, directive, vnode);
            }
        });
        each$2(oldValue_1, function (directive, name) {
            if (!newValue_1[name]) {
                var unbind = directive.hooks.unbind;
                if (unbind) {
                    unbind(node_1, directive, oldVnode);
                }
            }
        });
    }
}
function remove$1(vnode) {
    var directives = vnode.directives;
    if (directives) {
        var node_2 = vnode.data[COMPONENT] || vnode.node;
        each$2(directives, function (directive) {
            var unbind = directive.hooks.unbind;
            if (unbind) {
                unbind(node_2, directive, vnode);
            }
        });
    }
}

function update$3(vnode, oldVnode) {
    var data = vnode.data, ref = vnode.ref, props = vnode.props, slots = vnode.slots, context = vnode.context, node;
    if (vnode.isComponent) {
        node = data[COMPONENT];
        // 更新时才要 set
        // 因为初始化时，所有这些都经过构造函数完成了
        if (oldVnode) {
            if (props) {
                node.set(node.checkPropTypes(props));
            }
            if (slots) {
                node.set(slots);
            }
        }
    }
    else {
        node = vnode.node;
    }
    if (ref) {
        var refs = context.$refs;
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
    var result, vnode, key;
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
    var child = (vnode.parent || vnode.context).createComponent(options, vnode);
    vnode.data[COMPONENT] = child;
    vnode.data[LOADING] = FALSE;
    update$3(vnode);
    update$2(vnode);
    return child;
}
function createData() {
    var data = {};
    data[ID] = guid$1();
    return data;
}
function createVnode(api, vnode) {
    var tag = vnode.tag, node = vnode.node, data = vnode.data, isComponent = vnode.isComponent, isComment = vnode.isComment, isText = vnode.isText, isStyle = vnode.isStyle, children = vnode.children, text = vnode.text, html = vnode.html, context = vnode.context;
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
        var componentOptions_1 = UNDEFINED;
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
                componentOptions_1 = options;
            }
        });
        // 不论是同步还是异步组件，都需要一个占位元素
        vnode.node = api.createComment(RAW_COMPONENT);
        if (componentOptions_1) {
            createComponent(vnode, componentOptions_1);
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
            api.text(node, text, isStyle);
        }
        else if (html) {
            api.html(node, html, isStyle);
        }
        update(api, vnode);
        update$1(api, vnode);
        update$3(vnode);
        update$2(vnode);
    }
}
function addVnodes(api, parentNode, vnodes, startIndex, endIndex, before) {
    var vnode, start = startIndex || 0, end = isDef(endIndex) ? endIndex : vnodes.length - 1;
    while (start <= end) {
        vnode = vnodes[start];
        createVnode(api, vnode);
        insertVnode(api, parentNode, vnode, before);
        start++;
    }
}
function insertVnode(api, parentNode, vnode, before) {
    var node = vnode.node, data = vnode.data, context = vnode.context, hasParent = api.parent(node);
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
        var enter = UNDEFINED;
        if (vnode.isComponent) {
            var component_1 = data[COMPONENT];
            if (component_1) {
                enter = function () {
                    enterVnode(vnode, component_1);
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
            context.$observer.nextTask.prepend(enter);
        }
    }
}
function removeVnodes(api, parentNode, vnodes, startIndex, endIndex) {
    var vnode, start = startIndex || 0, end = isDef(endIndex) ? endIndex : vnodes.length - 1;
    while (start <= end) {
        vnode = vnodes[start];
        if (vnode) {
            removeVnode(api, parentNode, vnode);
        }
        start++;
    }
}
function removeVnode(api, parentNode, vnode) {
    var node = vnode.node;
    if (vnode.isStatic || vnode.isText || vnode.isComment) {
        api.remove(parentNode, node);
    }
    else {
        var done = function () {
            destroyVnode(api, vnode);
            api.remove(parentNode, node);
        }, component_2;
        if (vnode.isComponent) {
            component_2 = vnode.data[COMPONENT];
            // 异步组件，还没加载成功就被删除了
            if (!component_2) {
                done();
                return;
            }
        }
        leaveVnode(vnode, component_2, done);
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
    var data = vnode.data, children = vnode.children, parent = vnode.parent, slot = vnode.slot;
    // 销毁插槽组件
    // 如果宿主组件正在销毁，$vnode 属性会在调 destroy() 之前被删除
    // 这里表示的是宿主组件还没被销毁
    // 如果宿主组件被销毁了，则它的一切都要进行销毁
    if (slot && parent && parent.$vnode) {
        // 如果更新时，父组件没有传入该 slot，则子组件需要销毁该 slot
        var slots = parent.get(slot);
        // slots 要么没有，要么是数组，不可能是别的
        if (slots && has(slots, vnode)) {
            return;
        }
    }
    if (vnode.isComponent) {
        var component_3 = data[COMPONENT];
        if (component_3) {
            remove$1(vnode);
            component_3.destroy();
        }
        else
            { [
                data[LOADING] = FALSE
            ]; }
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
    var data = vnode.data, transition = vnode.transition;
    if (component && !transition) {
        // 再看组件根元素是否有 transition
        transition = component.$vnode.transition;
    }
    execute(data[LEAVING]);
    if (transition) {
        var enter = transition.enter;
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
    var data = vnode.data, transition = vnode.transition;
    if (component && !transition) {
        // 再看组件根元素是否有 transition
        transition = component.$vnode.transition;
    }
    if (transition) {
        var leave = transition.leave;
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
    var startIndex = 0, endIndex = children.length - 1, startVnode = children[startIndex], endVnode = children[endIndex], oldStartIndex = 0, oldEndIndex = oldChildren.length - 1, oldStartVnode = oldChildren[oldStartIndex], oldEndVnode = oldChildren[oldEndIndex], oldKeyToIndex, oldIndex;
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
    var node = oldVnode.node, data = oldVnode.data;
    // 如果不能 patch，则删除重建
    if (!isPatchable(vnode, oldVnode)) {
        // 同步加载的组件，初始化时不会传入占位节点
        // 它内部会自动生成一个注释节点，当它的根 vnode 和注释节点对比时，必然无法 patch
        // 于是走进此分支，为新组件创建一个 DOM 节点，然后继续 createComponent 后面的流程
        var parentNode = api.parent(node);
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
    var text = vnode.text, html = vnode.html, children = vnode.children, isStyle = vnode.isStyle, oldText = oldVnode.text, oldHtml = oldVnode.html, oldChildren = oldVnode.children;
    if (string(text)) {
        if (text !== oldText) {
            api.text(node, text, isStyle);
        }
    }
    else if (string(html)) {
        if (html !== oldHtml) {
            api.html(node, html, isStyle);
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
        node: node,
        context: context,
        keypath: keypath
    };
}
function destroy(api, vnode, isRemove) {
    if (isRemove) {
        var parentNode = api.parent(vnode.node);
        if (parentNode) {
            removeVnode(api, parentNode, vnode);
        }
    }
    else {
        destroyVnode(api, vnode);
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
var LITERAL = 1;
/**
 * 标识符
 */
var IDENTIFIER = 2;
/**
 * 对象属性或数组下标
 */
var MEMBER = 3;
/**
 * 一元表达式，如 - a
 */
var UNARY = 4;
/**
 * 二元表达式，如 a + b
 */
var BINARY = 5;
/**
 * 三元表达式，如 a ? b : c
 */
var TERNARY = 6;
/**
 * 数组表达式，如 [ 1, 2, 3 ]
 */
var ARRAY = 7;
/**
 * 对象表达式，如 { name: 'yox' }
 */
var OBJECT = 8;
/**
 * 函数调用表达式，如 a()
 */
var CALL = 9;

var unary = {
    '+': { exec: function (a) { return +a; } },
    '-': { exec: function (a) { return -a; } },
    '~': { exec: function (a) { return ~a; } },
    '!': { exec: function (a) { return !a; } },
    '!!': { exec: function (a) { return !!a; } }
};
// 参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
var binary = {
    '*': { prec: 14, exec: function (a, b) { return a * b; } },
    '/': { prec: 14, exec: function (a, b) { return a / b; } },
    '%': { prec: 14, exec: function (a, b) { return a % b; } },
    '+': { prec: 13, exec: function (a, b) { return a + b; } },
    '-': { prec: 13, exec: function (a, b) { return a - b; } },
    '<<': { prec: 12, exec: function (a, b) { return a << b; } },
    '>>': { prec: 12, exec: function (a, b) { return a >> b; } },
    '>>>': { prec: 12, exec: function (a, b) { return a >>> b; } },
    '<': { prec: 11, exec: function (a, b) { return a < b; } },
    '<=': { prec: 11, exec: function (a, b) { return a <= b; } },
    '>': { prec: 11, exec: function (a, b) { return a > b; } },
    '>=': { prec: 11, exec: function (a, b) { return a >= b; } },
    '==': { prec: 10, exec: function (a, b) { return a == b; } },
    '!=': { prec: 10, exec: function (a, b) { return a != b; } },
    '===': { prec: 10, exec: function (a, b) { return a === b; } },
    '!==': { prec: 10, exec: function (a, b) { return a !== b; } },
    '&': { prec: 9, exec: function (a, b) { return a & b; } },
    '^': { prec: 8, exec: function (a, b) { return a ^ b; } },
    '|': { prec: 7, exec: function (a, b) { return a | b; } },
    '&&': { prec: 6, exec: function (a, b) { return a && b; } },
    '||': { prec: 5, exec: function (a, b) { return a || b; } },
    '->': {
        prec: 0,
        exec: function (a, b) {
            return a > b
                ? function (callback) {
                    for (var i = a, index = 0; i > b; i--) {
                        callback(i, index++);
                    }
                }
                : function (callback) {
                    for (var i = a, index = 0; i < b; i++) {
                        callback(i, index++);
                    }
                };
        }
    },
    '=>': {
        prec: 0,
        exec: function (a, b) {
            return a > b
                ? function (callback) {
                    for (var i = a, index = 0; i >= b; i--) {
                        callback(i, index++);
                    }
                }
                : function (callback) {
                    for (var i = a, index = 0; i <= b; i++) {
                        callback(i, index++);
                    }
                };
        }
    }
};

/**
 * 元素 节点
 */

function toJSON (target) {
    return JSON.stringify(target);
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
var RENDER_SLOT = 'a', RENDER_EACH = 'b', RENDER_EXPRESSION = 'c', RENDER_EXPRESSION_ARG = 'd', RENDER_EXPRESSION_VNODE = 'e', RENDER_TEXT_VNODE = 'f', RENDER_ATTRIBUTE_VNODE = 'g', RENDER_PROPERTY_VNODE = 'h', RENDER_LAZY_VNODE = 'i', RENDER_TRANSITION_VNODE = 'j', RENDER_MODEL_VNODE = 'k', RENDER_EVENT_METHOD_VNODE = 'l', RENDER_EVENT_NAME_VNODE = 'm', RENDER_DIRECTIVE_VNODE = 'n', RENDER_SPREAD_VNODE = 'o', RENDER_ELEMENT_VNODE = 'p', RENDER_PARTIAL = 'q', RENDER_IMPORT = 'r', SEP_COMMA = ',', STRING_EMPTY = toJSON(EMPTY_STRING), CODE_PREFIX = "function(" + join([
    RENDER_EXPRESSION,
    RENDER_EXPRESSION_ARG,
    RENDER_EXPRESSION_VNODE,
    RENDER_TEXT_VNODE,
    RENDER_ATTRIBUTE_VNODE,
    RENDER_PROPERTY_VNODE,
    RENDER_LAZY_VNODE,
    RENDER_TRANSITION_VNODE,
    RENDER_MODEL_VNODE,
    RENDER_EVENT_METHOD_VNODE,
    RENDER_EVENT_NAME_VNODE,
    RENDER_DIRECTIVE_VNODE,
    RENDER_SPREAD_VNODE,
    RENDER_ELEMENT_VNODE,
    RENDER_SLOT,
    RENDER_PARTIAL,
    RENDER_IMPORT,
    RENDER_EACH
], SEP_COMMA) + "){return ";

function isUndef (target) {
    return target === UNDEFINED;
}

var nodeExecutor = {};
nodeExecutor[LITERAL] = function (node) {
    return node.value;
};
nodeExecutor[IDENTIFIER] = function (node, getter) {
    return getter(node.name, node);
};
nodeExecutor[MEMBER] = function (node, getter, context) {
    /**
     * 先说第一种奇葩情况：
     *
     * 'xx'.length
     *
     * 没有变量数据，直接执行字面量，这里用不上 getter
     *
     * 第二种：
     *
     * a.b.c
     *
     * 这是常规操作
     *
     * 第三种：
     *
     * 'xx'[name]
     *
     * 以字面量开头，后面会用到变量
     *
     */
    var staticKeypath = node.sk, props = node.props, first, data;
    if (isUndef(staticKeypath)) {
        // props 至少两个，否则无法创建 Member
        first = props[0];
        if (first.type === IDENTIFIER) {
            staticKeypath = first.name;
        }
        else {
            staticKeypath = EMPTY_STRING;
            data = execute$1(first, getter, context);
        }
        for (var i = 1, len = props.length; i < len; i++) {
            staticKeypath = join$1(staticKeypath, execute$1(props[i], getter, context));
        }
    }
    if (isDef(data)) {
        data = get(data, staticKeypath);
        return data ? data.value : UNDEFINED;
    }
    if (getter) {
        return getter(staticKeypath, node);
    }
};
nodeExecutor[UNARY] = function (node, getter, context) {
    return unary[node.op].exec(execute$1(node.a, getter, context));
};
nodeExecutor[BINARY] = function (node, getter, context) {
    return binary[node.op].exec(execute$1(node.a, getter, context), execute$1(node.b, getter, context));
};
nodeExecutor[TERNARY] = function (node, getter, context) {
    return execute$1(node.test, getter, context)
        ? execute$1(node.yes, getter, context)
        : execute$1(node.no, getter, context);
};
nodeExecutor[ARRAY] = function (node, getter, context) {
    return node.nodes.map(function (node) {
        return execute$1(node, getter, context);
    });
};
nodeExecutor[OBJECT] = function (node, getter, context) {
    var result = {};
    each(node.keys, function (key, index) {
        result[key] = execute$1(node.values[index], getter, context);
    });
    return result;
};
nodeExecutor[CALL] = function (node, getter, context) {
    return execute(execute$1(node.name, getter, context), context, node.args.map(function (node) {
        return execute$1(node, getter, context);
    }));
};
function execute$1(node, getter, context) {
    return nodeExecutor[node.type](node, getter, context);
}

function setPair(target, name, key, value) {
    var data = target[name] || (target[name] = {});
    data[key] = value;
}
function render(context, template, filters, partials, directives, transitions) {
    var $keypath = EMPTY_STRING, $scope = { $keypath: $keypath }, $stack = [$keypath, $scope], $vnode, vnodeStack = [], localPartials = {}, lookup = function (stack, index, key, node, depIgnore, defaultKeypath) {
        var keypath = join$1(stack[index], key), scope = stack[index + 1];
        node.ak = keypath;
        // 如果最后还是取不到值，用回最初的 keypath
        if (isUndef(defaultKeypath)) {
            defaultKeypath = keypath;
        }
        // 如果取的是 scope 上直接有的数据，如 $keypath
        if (isDef(scope[key])) {
            return scope[key];
        }
        // 如果取的是数组项，则要更进一步
        if (isDef(scope.$item)) {
            scope = scope.$item;
            // 到这里 scope 可能为空
            // 比如 new Array(10) 然后遍历这个数组，每一项肯定是空
            // 取 this
            if (key === EMPTY_STRING) {
                return scope;
            }
            // 取 this.xx
            if (scope != NULL && isDef(scope[key])) {
                return scope[key];
            }
        }
        // 正常取数据
        var result = context.get(keypath, lookup, depIgnore);
        if (result === lookup) {
            // undefined 或 true 都表示需要向上寻找
            if (node.lookup !== FALSE && index > 1) {
                index -= 2;
                return lookup(stack, index, key, node, depIgnore, defaultKeypath);
            }
            var holder = get(filters, key);
            return holder
                ? holder.value
                : (node.ak = defaultKeypath, UNDEFINED);
        }
        return result;
    }, getValue = function (expr, depIgnore, stack) {
        var renderStack = stack || $stack, length = renderStack.length;
        return execute$1(expr, function (keypath, node) {
            return lookup(renderStack, length - 2 * ((node.offset || 0) + 1), keypath, node, depIgnore);
        }, context);
    }, addBinding = function (vnode, name, expr, hint) {
        var value = getValue(expr, TRUE), key = join$1(DIRECTIVE_BINDING, name);
        setPair(vnode, 'directives', key, {
            ns: DIRECTIVE_BINDING,
            name: name,
            key: key,
            hooks: directives[DIRECTIVE_BINDING],
            binding: expr.ak,
            hint: hint
        });
        return value;
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
            var method = context[name];
            if (event instanceof CustomEvent) {
                var result = UNDEFINED;
                if (args) {
                    var scope = last(stack);
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
    }, renderExpression = function (expr, stringRequired) {
        var value = getValue(expr);
        return stringRequired
            ? toString(value)
            : value;
    }, renderExpressionArg = function (expr, stack) {
        return getValue(expr, UNDEFINED, stack);
    }, renderExpressionVnode = function (expr, stringRequired) {
        renderTextVnode(renderExpression(expr, stringRequired));
    }, renderTextVnode = function (text) {
        var vnodeList = last(vnodeStack);
        if (vnodeList) {
            var lastVnode = last(vnodeList);
            if (lastVnode && lastVnode.isText) {
                lastVnode.text += text;
            }
            else {
                var textVnode = {
                    isText: TRUE,
                    text: text,
                    context: context,
                    keypath: $keypath
                };
                push(vnodeList, textVnode);
            }
        }
    }, renderAttributeVnode = function (name, binding, expr, value) {
        if (binding) {
            value = addBinding($vnode, name, expr);
        }
        if ($vnode.isComponent) {
            setPair($vnode, 'props', name, value);
        }
        else {
            setPair($vnode, 'nativeAttrs', name, { name: name, value: value });
        }
    }, renderPropertyVnode = function (name, hint, binding, expr, value) {
        if (binding) {
            value = addBinding($vnode, name, expr, hint);
        }
        setPair($vnode, 'nativeProps', name, { name: name, value: value, hint: hint });
    }, renderLazyVnode = function (name, value) {
        setPair($vnode, 'lazy', name, value);
    }, renderTransitionVnode = function (name) {
        $vnode.transition = transitions[name];
    }, renderModelVnode = function (expr) {
        $vnode.model = getValue(expr, TRUE);
        setPair($vnode, 'directives', DIRECTIVE_MODEL, {
            ns: DIRECTIVE_MODEL,
            name: EMPTY_STRING,
            key: DIRECTIVE_MODEL,
            binding: expr.ak,
            hooks: directives[DIRECTIVE_MODEL]
        });
    }, renderEventMethodVnode = function (name, key, value, method, args) {
        setPair($vnode, 'directives', key, {
            ns: DIRECTIVE_EVENT,
            name: name,
            key: key,
            value: value,
            hooks: directives[DIRECTIVE_EVENT],
            handler: createMethodListener(method, args, $stack)
        });
    }, renderEventNameVnode = function (name, key, value, event) {
        setPair($vnode, 'directives', key, {
            ns: DIRECTIVE_EVENT,
            name: name,
            key: key,
            value: value,
            hooks: directives[DIRECTIVE_EVENT],
            handler: createEventListener(event)
        });
    }, renderDirectiveVnode = function (name, key, value, method, args, getter) {
        var hooks = directives[name];
        setPair($vnode, 'directives', key, {
            ns: DIRECTIVE_CUSTOM,
            name: name,
            key: key,
            value: value,
            hooks: hooks,
            getter: getter ? createGetter(getter, $stack) : UNDEFINED,
            handler: method ? createMethodListener(method, args, $stack) : UNDEFINED
        });
    }, renderSpreadVnode = function (expr, binding) {
        var value = getValue(expr, binding);
        // 数组也算一种对象，要排除掉
        if (object(value) && !array(value)) {
            each$2(value, function (value, key) {
                setPair($vnode, 'props', key, value);
            });
            var absoluteKeypath = expr['ak'];
            if (absoluteKeypath) {
                var key = join$1(DIRECTIVE_BINDING, absoluteKeypath);
                setPair($vnode, 'directives', key, {
                    ns: DIRECTIVE_BINDING,
                    name: EMPTY_STRING,
                    key: key,
                    hooks: directives[DIRECTIVE_BINDING],
                    binding: join$1(absoluteKeypath, RAW_WILDCARD)
                });
            }
        }
    }, renderElementVnode = function (vnode, tag, attrs, childs, slots) {
        if (tag) {
            var componentName = context.get(tag);
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
            var renderSlots_1 = {};
            each$2(slots, function (slot, name) {
                vnodeStack.push([]);
                slot();
                renderSlots_1[name] = pop(vnodeStack);
            });
            vnode.slots = renderSlots_1;
        }
        vnode.context = context;
        vnode.keypath = $keypath;
        var vnodeList = last(vnodeStack);
        if (vnodeList) {
            push(vnodeList, vnode);
        }
        return vnode;
    }, 
    // <slot name="xx"/>
    renderSlot = function (name, defaultRender) {
        var vnodeList = last(vnodeStack), vnodes = context.get(name);
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
            var partial = partials[name];
            if (partial) {
                partial(renderExpression, renderExpressionArg, renderExpressionVnode, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach);
            }
        }
    }, renderEach = function (handler, expr, index) {
        var value = getValue(expr), exprKeypath = expr['ak'], eachKeypath = exprKeypath || join$1($keypath, expr.raw), callback = function (item, key, length) {
            var lastKeypath = $keypath, lastScope = $scope, lastKeypathStack = $stack;
            $keypath = join$1(eachKeypath, toString(key));
            $scope = {};
            $stack = copy($stack);
            push($stack, $keypath);
            push($stack, $scope);
            // 从下面这几句赋值可以看出
            // scope 至少会有 '$keypath' '$length' '$item' index 等几个值
            $scope.$keypath = $keypath;
            // 避免模板里频繁读取 list.length
            $scope.$length = length;
            // 类似 {{#each 1 -> 10}} 这样的临时循环，需要在 scope 上加上当前项
            // 因为通过 context.get() 无法获取数据
            if (!exprKeypath) {
                $scope.$item = item;
            }
            if (index) {
                $scope[index] = key;
            }
            handler();
            $keypath = lastKeypath;
            $scope = lastScope;
            $stack = lastKeypathStack;
        };
        if (array(value)) {
            each(value, callback);
        }
        else if (object(value)) {
            each$2(value, callback);
        }
        else if (func(value)) {
            value(callback);
        }
    };
    return template(renderExpression, renderExpressionArg, renderExpressionVnode, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach);
}

/**
 * 计算属性
 *
 * 可配置 cache、deps、get、set 等
 */
var Computed = /** @class */ (function () {
    function Computed(keypath, sync, cache, deps, observer, getter, setter) {
        var instance = this;
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
            var oldValue = instance.value, newValue = instance.get(TRUE);
            if (newValue !== oldValue) {
                observer.diff(keypath, newValue, oldValue);
            }
        };
        instance.watcherOptions = {
            sync: sync,
            watcher: instance.watcher
        };
        if (instance.fixed = !falsy(deps)) {
            each(deps, function (dep) {
                observer.watch(dep, instance.watcherOptions);
            });
        }
    }
    /**
     * 对外的构造器，把用户配置的计算属性对象转换成内部对象
     *
     * @param keypath
     * @param observer
     * @param options
     */
    Computed.build = function (keypath, observer, options) {
        var cache = TRUE, sync = TRUE, deps = [], getter, setter;
        if (func(options)) {
            getter = options;
        }
        else if (object(options)) {
            if (boolean(options.cache)) {
                cache = options.cache;
            }
            if (boolean(options.sync)) {
                sync = options.sync;
            }
            // 因为可能会修改 deps，所以这里创建一个新的 deps，避免影响外部传入的 deps
            if (array(options.deps)) {
                deps = copy(options.deps);
            }
            if (func(options.get)) {
                getter = options.get;
            }
            if (func(options.set)) {
                setter = options.set;
            }
        }
        if (getter) {
            return new Computed(keypath, sync, cache, deps, observer, getter, setter);
        }
    };
    /**
     * 读取计算属性的值
     *
     * @param force 是否强制刷新缓存
     */
    Computed.prototype.get = function (force) {
        var instance = this, getter = instance.getter, context = instance.context;
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
                var lastComputed = Computed.current;
                Computed.current = instance;
                instance.value = execute(getter, context);
                // 绑定新的依赖
                instance.bind();
                Computed.current = lastComputed;
            }
        }
        return instance.value;
    };
    Computed.prototype.set = function (value) {
        var _a = this, setter = _a.setter, context = _a.context;
        if (setter) {
            setter.call(context, value);
        }
    };
    /**
     * 添加依赖
     *
     * 这里只是为了保证依赖唯一，最后由 bind() 实现绑定
     *
     * @param dep
     */
    Computed.prototype.add = function (dep) {
        this.unique[dep] = TRUE;
    };
    /**
     * 绑定依赖
     */
    Computed.prototype.bind = function () {
        var _a = this, unique = _a.unique, deps = _a.deps, observer = _a.observer, watcherOptions = _a.watcherOptions;
        each$2(unique, function (_, dep) {
            push(deps, dep);
            observer.watch(dep, watcherOptions);
        });
        // 用完重置
        // 方便下次收集依赖
        this.unique = {};
    };
    /**
     * 解绑依赖
     */
    Computed.prototype.unbind = function () {
        var _a = this, deps = _a.deps, observer = _a.observer, watcher = _a.watcher;
        each(deps, function (dep) {
            observer.unwatch(dep, watcher);
        }, TRUE);
        deps.length = 0;
    };
    return Computed;
}());

/**
 * 从 keypath 数组中选择和 keypath 最匹配的那一个
 *
 * @param sorted 经过排序的 keypath 数组
 * @param keypath
 */
function matchBest (sorted, keypath) {
    var result;
    each(sorted, function (prefix) {
        var length = match(keypath, prefix);
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
    var result = get(source, keypath);
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
    var newIsString = string(newValue), oldIsString = string(oldValue);
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
    var newIsArray = array(newValue), oldIsArray = array(oldValue);
    if (newIsArray || oldIsArray) {
        var newLength = newIsArray ? newValue.length : UNDEFINED, oldLength = oldIsArray ? oldValue.length : UNDEFINED;
        callback(RAW_LENGTH, newLength, oldLength);
        for (var i = 0, length = Math.max(newLength || 0, oldLength || 0); i < length; i++) {
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
    var newIsObject = object(newValue), oldIsObject = object(oldValue);
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
    var diff = function (subKeypath, subNewValue, subOldValue) {
        if (subNewValue !== subOldValue) {
            var newKeypath_1 = join$1(keypath, subKeypath);
            each(watchFuzzyKeypaths, function (fuzzyKeypath) {
                if (isDef(matchFuzzy(newKeypath_1, fuzzyKeypath))) {
                    callback(fuzzyKeypath, newKeypath_1, subNewValue, subOldValue);
                }
            });
            diffRecursion(newKeypath_1, subNewValue, subOldValue, watchFuzzyKeypaths, callback);
        }
    };
    diffString(newValue, oldValue, diff)
        || diffArray(newValue, oldValue, diff)
        || diffObject(newValue, oldValue, diff);
}

function diffWatcher (keypath, newValue, oldValue, watcher, isRecursive, callback) {
    var fuzzyKeypaths;
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
        var length = match(watchKeypath, keypath);
        if (length >= 0) {
            var subKeypath = slice(watchKeypath, length), subNewValue = readValue(newValue, subKeypath), subOldValue = readValue(oldValue, subKeypath);
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
var optionsHolder = {
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
var Observer = /** @class */ (function () {
    function Observer(data, context) {
        var instance = this;
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
    Observer.prototype.get = function (keypath, defaultValue, depIgnore) {
        var instance = this, currentComputed = Computed.current, data = instance.data, computed = instance.computed, reversedComputedKeys = instance.reversedComputedKeys;
        // 传入 '' 获取整个 data
        if (keypath === EMPTY_STRING) {
            return data;
        }
        // 调用 get 时，外面想要获取依赖必须设置是谁在收集依赖
        // 如果没设置，则跳过依赖收集
        if (currentComputed && !depIgnore) {
            currentComputed.add(keypath);
        }
        var result, target;
        if (computed) {
            target = computed[keypath];
            if (target) {
                return target.get();
            }
            if (reversedComputedKeys) {
                var match = matchBest(reversedComputedKeys, keypath);
                if (match && match.prop) {
                    result = get(computed[match.name].get(), match.prop);
                }
            }
        }
        if (!result) {
            result = get(data, keypath);
        }
        return result ? result.value : defaultValue;
    };
    /**
     * 更新数据
     *
     * @param keypath
     * @param value
     */
    Observer.prototype.set = function (keypath, value) {
        var instance = this, data = instance.data, computed = instance.computed, reversedComputedKeys = instance.reversedComputedKeys, setValue = function (newValue, keypath) {
            var oldValue = instance.get(keypath);
            if (newValue === oldValue) {
                return;
            }
            var target;
            if (computed) {
                target = computed[keypath];
                if (target) {
                    target.set(newValue);
                }
                if (reversedComputedKeys) {
                    var match = matchBest(reversedComputedKeys, keypath);
                    if (match && match.prop) {
                        target = computed[match.name];
                        if (target) {
                            var targetValue = target.get();
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
    };
    /**
     * 同步调用的 diff，用于触发 syncEmitter，以及唤醒 asyncEmitter
     *
     * @param keypath
     * @param newValue
     * @param oldValue
     */
    Observer.prototype.diff = function (keypath, newValue, oldValue) {
        var instance = this, syncEmitter = instance.syncEmitter, asyncEmitter = instance.asyncEmitter, asyncChanges = instance.asyncChanges, 
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
            var keypaths = (asyncChanges[keypath] || (asyncChanges[keypath] = { value: oldValue, keypaths: [] })).keypaths;
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
    };
    /**
     * 异步触发的 diff
     */
    Observer.prototype.diffAsync = function () {
        var instance = this, asyncEmitter = instance.asyncEmitter, asyncChanges = instance.asyncChanges;
        instance.asyncChanges = {};
        each$2(asyncChanges, function (change, keypath) {
            var args = [instance.get(keypath), change.value, keypath];
            // 不能在这判断新旧值是否相同，相同就不 fire
            // 因为前面标记了 count，在这中断会导致 count 无法清除
            each(change.keypaths, function (watchKeypath) {
                asyncEmitter.fire(watchKeypath, args, filterWatcher);
            });
        });
    };
    /**
     * 添加计算属性
     *
     * @param keypath
     * @param computed
     */
    Observer.prototype.addComputed = function (keypath, options) {
        var instance = this, computed = Computed.build(keypath, instance, options);
        if (computed) {
            if (!instance.computed) {
                instance.computed = {};
            }
            instance.computed[keypath] = computed;
            instance.reversedComputedKeys = sort(instance.computed, TRUE);
            return computed;
        }
    };
    /**
     * 移除计算属性
     *
     * @param keypath
     */
    Observer.prototype.removeComputed = function (keypath) {
        var instance = this, computed = instance.computed;
        if (computed && has$2(computed, keypath)) {
            delete computed[keypath];
            instance.reversedComputedKeys = sort(computed, TRUE);
        }
    };
    /**
     * 监听数据变化
     *
     * @param keypath
     * @param watcher
     * @param immediate
     */
    Observer.prototype.watch = function (keypath, watcher, immediate) {
        var instance = this, context = instance.context, syncEmitter = instance.syncEmitter, asyncEmitter = instance.asyncEmitter, bind = function (keypath, options) {
            var emitter = options.sync ? syncEmitter : asyncEmitter, 
            // formatWatcherOptions 保证了 options.watcher 一定存在
            listener = {
                fn: options.watcher,
                ctx: context,
                count: 0
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
    };
    /**
     * 取消监听数据变化
     *
     * @param keypath
     * @param watcher
     */
    Observer.prototype.unwatch = function (keypath, watcher) {
        this.syncEmitter.off(keypath, watcher);
        this.asyncEmitter.off(keypath, watcher);
    };
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     *
     * @param keypath
     * @return 取反后的布尔值
     */
    Observer.prototype.toggle = function (keypath) {
        var value = !this.get(keypath);
        this.set(keypath, value);
        return value;
    };
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    Observer.prototype.increase = function (keypath, step, max) {
        var value = toNumber(this.get(keypath), 0) + (step || 1);
        if (!number(max) || value <= max) {
            this.set(keypath, value);
            return value;
        }
    };
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    Observer.prototype.decrease = function (keypath, step, min) {
        var value = toNumber(this.get(keypath), 0) - (step || 1);
        if (!number(min) || value >= min) {
            this.set(keypath, value);
            return value;
        }
    };
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    Observer.prototype.insert = function (keypath, item, index) {
        var list = this.get(keypath);
        list = !array(list) ? [] : copy(list);
        var length = list.length;
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
    };
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    Observer.prototype.append = function (keypath, item) {
        return this.insert(keypath, item, TRUE);
    };
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    Observer.prototype.prepend = function (keypath, item) {
        return this.insert(keypath, item, FALSE);
    };
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    Observer.prototype.removeAt = function (keypath, index) {
        var list = this.get(keypath);
        if (array(list)
            && index >= 0
            && index < list.length) {
            list = copy(list);
            list.splice(index, 1);
            this.set(keypath, list);
            return TRUE;
        }
    };
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    Observer.prototype.remove = function (keypath, item) {
        var list = this.get(keypath);
        if (array(list)) {
            list = copy(list);
            if (remove(list, item)) {
                this.set(keypath, list);
                return TRUE;
            }
        }
    };
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    Observer.prototype.copy = function (data, deep) {
        return copy(data, deep);
    };
    /**
     * 销毁
     */
    Observer.prototype.destroy = function () {
        var instance = this;
        instance.syncEmitter.off();
        instance.asyncEmitter.off();
        instance.nextTask.clear();
        clear(instance);
    };
    return Observer;
}());

// 这里先写 IE9 支持的接口
var innerText = 'textContent', innerHTML = 'innerHTML', findElement = function (selector) {
    var node = DOCUMENT.querySelector(selector);
    if (node) {
        return node;
    }
}, addEventListener = function (node, type, listener) {
    node.addEventListener(type, listener, FALSE);
}, removeEventListener = function (node, type, listener) {
    node.removeEventListener(type, listener, FALSE);
}, 
// IE9 不支持 classList
addClass = function (node, className) {
    node.classList.add(className);
}, removeClass = function (node, className) {
    node.classList.remove(className);
}, createEvent = function (event, node) {
    return event;
};
if (DOCUMENT) {
    // 此时 document.body 不一定有值，比如 script 放在 head 里
    if (!DOCUMENT.documentElement.classList) {
        addClass = function (node, className) {
            var classes = node.className.split(CHAR_WHITESPACE);
            if (!has(classes, className)) {
                push(classes, className);
                node.className = join(classes, CHAR_WHITESPACE);
            }
        };
        removeClass = function (node, className) {
            var classes = node.className.split(CHAR_WHITESPACE);
            if (remove(classes, className)) {
                node.className = join(classes, CHAR_WHITESPACE);
            }
        };
    }
}
var CHAR_WHITESPACE = ' ', 
/**
 * 绑定在 HTML 元素上的事件发射器
 */
EMITTER = '$emitter', 
/**
 * 跟输入事件配套使用的事件
 */
COMPOSITION_START = 'compositionstart', 
/**
 * 跟输入事件配套使用的事件
 */
COMPOSITION_END = 'compositionend', domain = 'http://www.w3.org/', namespaces = {
    svg: domain + '2000/svg'
}, specialEvents = {}, domApi = {
    createElement: function (tag, isSvg) {
        return isSvg
            ? DOCUMENT.createElementNS(namespaces.svg, tag)
            : DOCUMENT.createElement(tag);
    },
    createText: function (text) {
        return DOCUMENT.createTextNode(text);
    },
    createComment: function (text) {
        return DOCUMENT.createComment(text);
    },
    prop: function (node, name, value) {
        if (isDef(value)) {
            set(node, name, value, FALSE);
        }
        else {
            var holder = get(node, name);
            if (holder) {
                return holder.value;
            }
        }
    },
    removeProp: function (node, name, hint) {
        set(node, name, hint === HINT_BOOLEAN
            ? FALSE
            : EMPTY_STRING, FALSE);
    },
    attr: function (node, name, value) {
        if (isDef(value)) {
            node.setAttribute(name, value);
        }
        else {
            // value 还可能是 null
            var value_1 = node.getAttribute(name);
            if (value_1 != NULL) {
                return value_1;
            }
        }
    },
    removeAttr: function (node, name) {
        node.removeAttribute(name);
    },
    before: function (parentNode, node, beforeNode) {
        parentNode.insertBefore(node, beforeNode);
    },
    append: function (parentNode, node) {
        parentNode.appendChild(node);
    },
    replace: function (parentNode, node, oldNode) {
        parentNode.replaceChild(node, oldNode);
    },
    remove: function (parentNode, node) {
        parentNode.removeChild(node);
    },
    parent: function (node) {
        var parentNode = node.parentNode;
        if (parentNode) {
            return parentNode;
        }
    },
    next: function (node) {
        var nextSibling = node.nextSibling;
        if (nextSibling) {
            return nextSibling;
        }
    },
    find: findElement,
    tag: function (node) {
        if (node.nodeType === 1) {
            return lower(node.tagName);
        }
    },
    text: function (node, text, isStyle) {
        if (isDef(text)) {
            {
                node[innerText] = text;
            }
        }
        else {
            return node[innerText];
        }
    },
    html: function (node, html, isStyle) {
        if (isDef(html)) {
            {
                node[innerHTML] = html;
            }
        }
        else {
            return node[innerHTML];
        }
    },
    addClass: addClass,
    removeClass: removeClass,
    on: function (node, type, listener) {
        var emitter = node[EMITTER] || (node[EMITTER] = new Emitter()), nativeListeners = emitter.nativeListeners || (emitter.nativeListeners = {});
        // 一个元素，相同的事件，只注册一个 native listener
        if (!nativeListeners[type]) {
            // 特殊事件
            var special = specialEvents[type], 
            // 唯一的原生监听器
            nativeListener = function (event) {
                var customEvent = event instanceof CustomEvent
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
        emitter.on(type, listener);
    },
    off: function (node, type, listener) {
        var emitter = node[EMITTER], listeners = emitter.listeners, nativeListeners = emitter.nativeListeners;
        // emitter 会根据 type 和 listener 参数进行适当的删除
        emitter.off(type, listener);
        // 如果注册的 type 事件都解绑了，则去掉原生监听器
        if (nativeListeners && !emitter.has(type)) {
            var special = specialEvents[type], nativeListener = nativeListeners[type];
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
    },
    addSpecialEvent: function (type, hooks) {
        specialEvents[type] = hooks;
    }
};
specialEvents[EVENT_MODEL] = {
    on: function (node, listener) {
        var locked = FALSE;
        domApi.on(node, COMPOSITION_START, listener[COMPOSITION_START] = function () {
            locked = TRUE;
        });
        domApi.on(node, COMPOSITION_END, listener[COMPOSITION_END] = function (event) {
            locked = FALSE;
            listener(event);
        });
        addEventListener(node, EVENT_INPUT, listener[EVENT_INPUT] = function (event) {
            if (!locked) {
                listener(event);
            }
        });
    },
    off: function (node, listener) {
        domApi.off(node, COMPOSITION_START, listener[COMPOSITION_START]);
        domApi.off(node, COMPOSITION_END, listener[COMPOSITION_END]);
        removeEventListener(node, EVENT_INPUT, listener[EVENT_INPUT]);
        listener[COMPOSITION_START] =
            listener[COMPOSITION_END] =
                listener[EVENT_INPUT] = UNDEFINED;
    }
};

/**
 * 节流调用
 *
 * @param fn 需要节制调用的函数
 * @param delay 调用的时间间隔，单位毫秒
 * @param immediate 是否立即触发
 * @return 节流函数
 */
function debounce (fn, delay, immediate) {
    var timer;
    return function () {
        if (!timer) {
            var args_1 = toArray(arguments);
            if (immediate) {
                execute(fn, UNDEFINED, args_1);
            }
            timer = setTimeout(function () {
                timer = UNDEFINED;
                if (!immediate) {
                    execute(fn, UNDEFINED, args_1);
                }
            }, delay);
        }
    };
}

var directive = {
    bind: function (node, directive, vnode) {
        var name = directive.name, handler = directive.handler, lazy = vnode.lazy;
        if (!handler) {
            return;
        }
        if (lazy) {
            var value = lazy[name] || lazy[EMPTY_STRING];
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
        if (vnode.isComponent) {
            node.on(name, handler);
            vnode.data[directive.key] = function () {
                node.off(name, handler);
            };
        }
        else {
            domApi.on(node, name, handler);
            vnode.data[directive.key] = function () {
                domApi.off(node, name, handler);
            };
        }
    },
    unbind: function (node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

function getOptionValue(option) {
    return isDef(option.value)
        ? option.value
        : option.text;
}
var inputControl = {
    set: function (node, value) {
        node.value = toString(value);
    },
    sync: function (node, keypath, context) {
        context.set(keypath, node.value);
    },
    name: RAW_VALUE
}, radioControl = {
    set: function (node, value) {
        node.checked = node.value === toString(value);
    },
    sync: function (node, keypath, context) {
        if (node.checked) {
            context.set(keypath, node.value);
        }
    },
    name: 'checked'
}, checkboxControl = {
    set: function (node, value) {
        node.checked = array(value)
            ? has(value, node.value, FALSE)
            : !!value;
    },
    sync: function (node, keypath, context) {
        var value = context.get(keypath);
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
    set: function (node, value) {
        each(toArray(node.options), node.multiple
            ? function (option) {
                option.selected = has(value, getOptionValue(option), FALSE);
            }
            : function (option, index) {
                if (getOptionValue(option) == value) {
                    node.selectedIndex = index;
                    return FALSE;
                }
            });
    },
    sync: function (node, keypath, context) {
        var options = toArray(node.options);
        if (node.multiple) {
            var values_1 = [];
            each(options, function (option) {
                if (option.selected) {
                    push(values_1, getOptionValue(option));
                }
            });
            context.set(keypath, values_1);
        }
        else {
            context.set(keypath, getOptionValue(options[node.selectedIndex]));
        }
    },
    name: RAW_VALUE
}, inputTypes = {
    radio: radioControl,
    checkbox: checkboxControl
}, directive$1 = {
    bind: function (node, directive, vnode) {
        var context = vnode.context, model = vnode.model, lazy = vnode.lazy, isComponent = vnode.isComponent, dataBinding = directive.binding, viewBinding, eventName, set, sync, lazyValue;
        if (lazy) {
            lazyValue = lazy[DIRECTIVE_MODEL] || lazy[EMPTY_STRING];
        }
        if (isComponent) {
            viewBinding = node.$options.model || RAW_VALUE;
            set = function (newValue) {
                node.set(viewBinding, newValue);
            };
            sync = function (newValue) {
                context.set(dataBinding, newValue);
            };
        }
        else {
            var control_1 = domApi.tag(node) === 'select'
                ? selectControl
                : inputControl;
            // checkbox,radio,select 监听的是 change 事件
            eventName = EVENT_CHANGE;
            if (control_1 === inputControl) {
                var type_1 = node.type;
                if (inputTypes[type_1]) {
                    control_1 = inputTypes[type_1];
                }
                // 如果是输入框，则切换成 model 事件
                // model 事件是个 yox-dom 实现的特殊事件
                // 不会在输入法组合文字过程中得到触发事件
                else if (lazyValue !== TRUE) {
                    eventName = EVENT_MODEL;
                }
            }
            set = function (newValue) {
                control_1.set(node, newValue);
            };
            sync = function () {
                control_1.sync(node, dataBinding, context);
            };
        }
        // 不管模板是否设值，统一用数据中的值
        set(model, UNDEFINED, EMPTY_STRING);
        // 应用 lazy
        if (lazyValue && lazyValue !== TRUE) {
            sync = debounce(sync, lazyValue);
        }
        // 监听交互，修改数据
        if (isComponent) {
            node.watch(viewBinding, sync);
        }
        else {
            domApi.on(node, eventName, sync);
        }
        // 监听数据，修改界面
        context.watch(dataBinding, set);
        vnode.data[directive.key] = function () {
            if (isComponent) {
                node.unwatch(viewBinding, sync);
            }
            else {
                domApi.off(node, eventName, sync);
            }
            context.unwatch(dataBinding, set);
        };
    },
    unbind: function (node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

var directive$2 = {
    bind: function (node, directive, vnode) {
        // binding 可能是模糊匹配
        // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
        var binding = directive.binding, isFuzzy$1 = isFuzzy(binding), watcher = function (newValue, _, keypath) {
            var name = isFuzzy$1
                ? matchFuzzy(keypath, binding)
                : directive.name;
            if (vnode.isComponent) {
                node.set(name, newValue);
            }
            else if (isDef(directive.hint)) {
                domApi.prop(node, name, newValue);
            }
            else {
                domApi.attr(node, name, newValue);
            }
        };
        vnode.context.watch(binding, watcher);
        vnode.data[directive.key] = function () {
            vnode.context.unwatch(binding, watcher);
        };
    },
    unbind: function (node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

// this type https://jkchao.github.io/typescript-book-chinese/typings/thisType.html
/**
 * 组件是否存在某个 slot
 *
 * @param name
 */
function hasSlot (name) {
    return isDef(this.get(SLOT_DATA_PREFIX + name));
}

var globalDirectives = {}, globalTransitions = {}, globalComponents = {}, globalPartials = {}, globalFilters = {}, LOADER_QUEUE = '$queue', TEMPLATE_COMPUTED = '$' + RAW_TEMPLATE, selectorPattern = /^[#.][-\w+]+$/;
var Yox = /** @class */ (function () {
    function Yox(options) {
        var instance = this, $options = options || EMPTY_OBJECT;
        // 一进来就执行 before create
        execute($options[HOOK_BEFORE_CREATE], instance, $options);
        instance.$options = $options;
        var data = $options.data, props = $options.props, computed = $options.computed, events = $options.events, methods = $options.methods, watchers = $options.watchers, extensions = $options.extensions;
        if (extensions) {
            extend(instance, extensions);
        }
        // 数据源
        var source = instance.checkPropTypes(props || {});
        // 先放 props
        // 当 data 是函数时，可以通过 this.get() 获取到外部数据
        var observer = instance.$observer = new Observer(source, instance);
        if (computed) {
            each$2(computed, function (options, keypath) {
                observer.addComputed(keypath, options);
            });
        }
        // 后放 data
        var extend$1 = func(data) ? execute(data, instance, options) : data;
        if (object(extend$1)) {
            each$2(extend$1, function (value, key) {
                source[key] = value;
            });
        }
        if (methods) {
            each$2(methods, function (method, name) {
                instance[name] = method;
            });
        }
        // 监听各种事件
        // 支持命名空间
        instance.$emitter = new Emitter(TRUE);
        if (events) {
            instance.on(events);
        }
        {
            var placeholder = UNDEFINED, el = $options.el, vnode = $options.vnode, root = $options.root, parent = $options.parent, replace = $options.replace, template = $options.template, transitions = $options.transitions, components = $options.components, directives = $options.directives, partials = $options.partials, filters = $options.filters, slots = $options.slots;
            // 把 slots 放进数据里，方便 get
            if (slots) {
                extend(source, slots);
            }
            // 检查 template
            if (string(template)) {
                // 传了选择器，则取对应元素的 html
                if (selectorPattern.test(template)) {
                    placeholder = domApi.find(template);
                    if (placeholder) {
                        template = domApi.html(placeholder);
                        placeholder = UNDEFINED;
                    }
                }
            }
            else {
                template = UNDEFINED;
            }
            // 检查 el
            if (el) {
                if (string(el)) {
                    var selector = el;
                    if (selectorPattern.test(selector)) {
                        placeholder = domApi.find(selector);
                    }
                }
                else {
                    placeholder = el;
                }
                if (!replace) {
                    domApi.append(placeholder, placeholder = domApi.createComment(EMPTY_STRING));
                }
            }
            if (root) {
                instance.$root = root;
            }
            if (parent) {
                instance.$parent = parent;
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
                var newWatchers = watchers
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
                // 在产品阶段，template 是编译后且经过 stringify 的字符串
                // 当然，这个需要外部自己控制传入的 template 是什么
                // Yox.compile 会自动判断 template 是否经过编译
                instance.$template = Yox.compile(template);
                if (!vnode) {
                    vnode = create(domApi, placeholder, instance, EMPTY_STRING);
                }
                instance.update(instance.get(TEMPLATE_COMPUTED), vnode);
                return;
            }
        }
        afterCreateHook(instance, watchers);
    }
    /**
     * 安装插件
     *
     * 插件必须暴露 install 方法
     */
    Yox.use = function (plugin) {
        plugin.install(Yox);
    };
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    Yox.nextTick = function (task, context) {
        NextTask.shared().append(task, context);
    };
    /**
     * 编译模板，暴露出来是为了打包阶段的模板预编译
     */
    Yox.compile = function (template, stringify) {
        {
            return new Function("return " + template)();
        }
    };
    Yox.directive = function (name, directive) {
        {
            if (string(name) && !directive) {
                return getResource(globalDirectives, name);
            }
            setResource(globalDirectives, name, directive);
        }
    };
    Yox.transition = function (name, transition) {
        {
            if (string(name) && !transition) {
                return getResource(globalTransitions, name);
            }
            setResource(globalTransitions, name, transition);
        }
    };
    Yox.component = function (name, component) {
        {
            if (string(name) && !component) {
                return getResource(globalComponents, name);
            }
            setResource(globalComponents, name, component);
        }
    };
    Yox.partial = function (name, partial) {
        {
            if (string(name) && !partial) {
                return getResource(globalPartials, name);
            }
            setResource(globalPartials, name, partial, Yox.compile);
        }
    };
    Yox.filter = function (name, filter) {
        {
            if (string(name) && !filter) {
                return getResource(globalFilters, name);
            }
            setResource(globalFilters, name, filter);
        }
    };
    /**
     * 添加计算属性
     */
    Yox.prototype.addComputed = function (keypath, computed) {
        return this.$observer.addComputed(keypath, computed);
    };
    /**
     * 删除计算属性
     */
    Yox.prototype.removeComputed = function (keypath) {
        this.$observer.removeComputed(keypath);
    };
    /**
     * 取值
     */
    Yox.prototype.get = function (keypath, defaultValue, depIgnore) {
        return this.$observer.get(keypath, defaultValue, depIgnore);
    };
    /**
     * 设值
     */
    Yox.prototype.set = function (keypath, value) {
        // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
        // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
        var $observer = this.$observer;
        if ($observer) {
            $observer.set(keypath, value);
        }
    };
    /**
     * 监听事件
     */
    Yox.prototype.on = function (type, listener) {
        return addEvents(this, type, listener);
    };
    /**
     * 监听一次事件
     */
    Yox.prototype.once = function (type, listener) {
        return addEvents(this, type, listener, TRUE);
    };
    /**
     * 取消监听事件
     */
    Yox.prototype.off = function (type, listener) {
        this.$emitter.off(type, listener);
        return this;
    };
    /**
     * 发射事件
     */
    Yox.prototype.fire = function (type, data, downward) {
        // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
        // 内部为了保持格式统一
        // 需要转成 Event，这样还能知道 target 是哪个组件
        var instance = this, event = type instanceof CustomEvent ? type : new CustomEvent(type), args = [event], isComplete;
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
        isComplete = instance.$emitter.fire(event.type, args);
        if (isComplete) {
            var $parent = instance.$parent, $children = instance.$children;
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
    };
    /**
     * 监听数据变化
     */
    Yox.prototype.watch = function (keypath, watcher, immediate) {
        this.$observer.watch(keypath, watcher, immediate);
        return this;
    };
    /**
     * 取消监听数据变化
     */
    Yox.prototype.unwatch = function (keypath, watcher) {
        this.$observer.unwatch(keypath, watcher);
        return this;
    };
    /**
     * 加载组件，组件可以是同步或异步，最后会调用 callback
     *
     * @param name 组件名称
     * @param callback 组件加载成功后的回调
     */
    Yox.prototype.loadComponent = function (name, callback) {
        if (!loadComponent(this.$components, name, callback)) {
            loadComponent(globalComponents, name, callback);
        }
    };
    /**
     * 创建子组件
     *
     * @param options 组件配置
     * @param vnode 虚拟节点
     */
    Yox.prototype.createComponent = function (options, vnode) {
        {
            var instance = this;
            options = copy(options);
            options.root = instance.$root || instance;
            options.parent = instance;
            options.vnode = vnode;
            options.replace = TRUE;
            if (vnode.props) {
                options.props = vnode.props;
            }
            if (vnode.slots) {
                options.slots = vnode.slots;
            }
            var child = new Yox(options);
            push(instance.$children || (instance.$children = []), child);
            var node = child.$el;
            if (node) {
                vnode.node = node;
            }
            return child;
        }
    };
    Yox.prototype.directive = function (name, directive) {
        {
            var instance = this, $directives = instance.$directives;
            if (string(name) && !directive) {
                return getResource($directives, name, Yox.directive);
            }
            setResource($directives || (instance.$directives = {}), name, directive);
        }
    };
    Yox.prototype.transition = function (name, transition) {
        {
            var instance = this, $transitions = instance.$transitions;
            if (string(name) && !transition) {
                return getResource($transitions, name, Yox.transition);
            }
            setResource($transitions || (instance.$transitions = {}), name, transition);
        }
    };
    Yox.prototype.component = function (name, component) {
        {
            var instance = this, $components = instance.$components;
            if (string(name) && !component) {
                return getResource($components, name, Yox.component);
            }
            setResource($components || (instance.$components = {}), name, component);
        }
    };
    Yox.prototype.partial = function (name, partial) {
        {
            var instance = this, $partials = instance.$partials;
            if (string(name) && !partial) {
                return getResource($partials, name, Yox.partial);
            }
            setResource($partials || (instance.$partials = {}), name, partial, Yox.compile);
        }
    };
    Yox.prototype.filter = function (name, filter) {
        {
            var instance = this, $filters = instance.$filters;
            if (string(name) && !filter) {
                return getResource($filters, name, Yox.filter);
            }
            setResource($filters || (instance.$filters = {}), name, filter);
        }
    };
    /**
     * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
     * 而你非常确定需要更新模板，强制刷新正是你需要的
     */
    Yox.prototype.forceUpdate = function () {
        {
            var instance = this, $vnode = instance.$vnode, $observer = instance.$observer, computed = $observer.computed;
            if ($vnode && computed) {
                var template = computed[TEMPLATE_COMPUTED], oldValue = template.get();
                // 当前可能正在进行下一轮更新
                $observer.nextTask.run();
                // 没有更新模板，强制刷新
                if (oldValue === template.get()) {
                    instance.update(template.get(TRUE), $vnode);
                }
            }
        }
    };
    /**
     * 把模板抽象语法树渲染成 virtual dom
     */
    Yox.prototype.render = function () {
        {
            var instance = this;
            return render(instance, instance.$template, mergeResource(instance.$filters, globalFilters), mergeResource(instance.$partials, globalPartials), mergeResource(instance.$directives, globalDirectives), mergeResource(instance.$transitions, globalTransitions));
        }
    };
    /**
     * 更新 virtual dom
     *
     * @param vnode
     * @param oldVnode
     */
    Yox.prototype.update = function (vnode, oldVnode) {
        {
            var instance_1 = this, $vnode = instance_1.$vnode, $options = instance_1.$options, hook_1;
            // 每次渲染重置 refs
            // 在渲染过程中收集最新的 ref
            // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
            instance_1.$refs = {};
            if ($vnode) {
                execute($options[HOOK_BEFORE_UPDATE], instance_1);
                patch(domApi, vnode, oldVnode);
                hook_1 = $options[HOOK_AFTER_UPDATE];
            }
            else {
                execute($options[HOOK_BEFORE_MOUNT], instance_1);
                patch(domApi, vnode, oldVnode);
                instance_1.$el = vnode.node;
                hook_1 = $options[HOOK_AFTER_MOUNT];
            }
            instance_1.$vnode = vnode;
            // 跟 nextTask 保持一个节奏
            // 这样可以预留一些优化的余地
            if (hook_1) {
                instance_1.nextTick(function () {
                    if (instance_1.$vnode) {
                        execute(hook_1, instance_1);
                    }
                });
            }
        }
    };
    /**
     * 校验组件参数
     *
     * @param props
     */
    Yox.prototype.checkPropTypes = function (props) {
        {
            var propTypes = this.$options.propTypes;
            if (propTypes) {
                var result_1 = copy(props);
                each$2(propTypes, function (rule, key) {
                    // 类型
                    var type = rule.type, 
                    // 默认值
                    value = rule.value, 
                    // 实际的值
                    actual = props[key];
                    // 传了数据
                    if (isDef(actual)) ;
                    else {
                        // 没传值但是配置了默认值
                        if (isDef(value)) {
                            result_1[key] = type === RAW_FUNCTION
                                ? value
                                : func(value)
                                    ? value(props, key)
                                    : value;
                        }
                    }
                });
                return result_1;
            }
        }
        return props;
    };
    /**
     * 销毁组件
     */
    Yox.prototype.destroy = function () {
        var instance = this, $options = instance.$options, $emitter = instance.$emitter, $observer = instance.$observer;
        execute($options[HOOK_BEFORE_DESTROY], instance);
        {
            var $vnode = instance.$vnode, $parent = instance.$parent;
            if ($parent && $parent.$children) {
                remove($parent.$children, instance);
            }
            if ($vnode) {
                // virtual dom 通过判断 parent.$vnode 知道宿主组件是否正在销毁
                instance.$vnode = UNDEFINED;
                destroy(domApi, $vnode, !$parent);
            }
        }
        $emitter.off();
        $observer.destroy();
        clear(instance);
        execute($options[HOOK_AFTER_DESTROY], instance);
    };
    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     */
    Yox.prototype.nextTick = function (task) {
        this.$observer.nextTask.append(task, this);
    };
    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     */
    Yox.prototype.toggle = function (keypath) {
        return this.$observer.toggle(keypath);
    };
    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param step 步进值，默认是 1
     * @param max 可以递增到的最大值，默认不限制
     */
    Yox.prototype.increase = function (keypath, step, max) {
        return this.$observer.increase(keypath, step, max);
    };
    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param step 步进值，默认是 1
     * @param min 可以递减到的最小值，默认不限制
     */
    Yox.prototype.decrease = function (keypath, step, min) {
        return this.$observer.decrease(keypath, step, min);
    };
    /**
     * 在数组指定位置插入元素
     *
     * @param keypath
     * @param item
     * @param index
     */
    Yox.prototype.insert = function (keypath, item, index) {
        return this.$observer.insert(keypath, item, index);
    };
    /**
     * 在数组尾部添加元素
     *
     * @param keypath
     * @param item
     */
    Yox.prototype.append = function (keypath, item) {
        return this.$observer.append(keypath, item);
    };
    /**
     * 在数组首部添加元素
     *
     * @param keypath
     * @param item
     */
    Yox.prototype.prepend = function (keypath, item) {
        return this.$observer.prepend(keypath, item);
    };
    /**
     * 通过索引移除数组中的元素
     *
     * @param keypath
     * @param index
     */
    Yox.prototype.removeAt = function (keypath, index) {
        return this.$observer.removeAt(keypath, index);
    };
    /**
     * 直接移除数组中的元素
     *
     * @param keypath
     * @param item
     */
    Yox.prototype.remove = function (keypath, item) {
        return this.$observer.remove(keypath, item);
    };
    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param data
     * @param deep
     */
    Yox.prototype.copy = function (data, deep) {
        return this.$observer.copy(data, deep);
    };
    /**
     * core 版本
     */
    Yox.version = "1.0.0-alpha.35";
    /**
     * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
     */
    Yox.is = is;
    Yox.array = array$1;
    Yox.object = object$1;
    Yox.string = string$1;
    Yox.logger = logger;
    Yox.Event = CustomEvent;
    Yox.Emitter = Emitter;
    return Yox;
}());
function afterCreateHook(instance, watchers) {
    if (watchers) {
        instance.watch(watchers);
    }
    execute(instance.$options[HOOK_AFTER_CREATE], instance);
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
    var options = {
        fn: listener,
        ctx: instance
    };
    if (once) {
        options.max = 1;
    }
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
    return instance;
}
function loadComponent(data, name, callback) {
    if (data && data[name]) {
        var component = data[name];
        // 注册的是异步加载函数
        if (func(component)) {
            var loader_1 = component, queue_1 = loader_1[LOADER_QUEUE];
            if (queue_1) {
                push(queue_1, callback);
            }
            else {
                queue_1 = component[LOADER_QUEUE] = [callback];
                loader_1(function (options) {
                    loader_1[LOADER_QUEUE] = UNDEFINED;
                    data[name] = options;
                    each(queue_1, function (callback) {
                        callback(options);
                    });
                });
            }
        }
        // 不是异步加载函数，直接同步返回
        else {
            callback(component);
        }
        return TRUE;
    }
}
function getResource(data, name, lookup) {
    if (data && data[name]) {
        return data[name];
    }
    else if (lookup) {
        return lookup(name);
    }
}
function setResource(data, name, value, formatValue) {
    if (string(name)) {
        data[name] = formatValue ? formatValue(value) : value;
    }
    else {
        each$2(name, function (value, key) {
            data[key] = formatValue ? formatValue(value) : value;
        });
    }
}
function mergeResource(locals, globals) {
    return locals && globals
        ? extend({}, globals, locals)
        : locals || globals;
}
{
    Yox['dom'] = domApi;
    // 全局注册内置指令
    Yox.directive({ event: directive, model: directive$1, binding: directive$2 });
    // 全局注册内置过滤器
    Yox.filter({ hasSlot: hasSlot });
}

export default Yox;
//# sourceMappingURL=yox.esm.js.map
