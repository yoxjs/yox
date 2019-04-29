/**
 * yox.js v1.0.0-alpha
 * (c) 2016-2019 musicode
 * Released under the MIT License.
 */

/**
 * 为了压缩，定义的常量
 */
var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = void 0;
var RAW_TRUE = 'true';
var RAW_FALSE = 'false';
var RAW_NULL = 'null';
var RAW_UNDEFINED = 'undefined';
var RAW_KEY = 'key';
var RAW_REF = 'ref';
var RAW_TAG = 'tag';
var RAW_SLOT = 'slot';
var RAW_NAME = 'name';
var RAW_FILTER = 'filter';
var RAW_PARTIAL = 'partial';
var RAW_COMPONENT = 'component';
var RAW_DIRECTIVE = 'directive';
var RAW_TRANSITION = 'transition';
var RAW_THIS = 'this';
var RAW_TYPE = 'type';
var RAW_VALUE = 'value';
var RAW_LENGTH = 'length';
var RAW_FUNCTION = 'function';
var RAW_TEMPLATE = 'template';
var KEYPATH_PARENT = '..';
var KEYPATH_CURRENT = RAW_THIS;
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
 * Single instance for window in browser
 */
var win = typeof window !== RAW_UNDEFINED ? window : UNDEFINED;
/**
 * Single instance for document in browser
 */
var doc = typeof document !== RAW_UNDEFINED ? document : UNDEFINED;
/**
 * Single instance for noop function
 */
var EMPTY_FUNCTION = function () {
    /** yox */
};
/**
 * 空对象，很多地方会用到，比如 `a || EMPTY_OBJECT` 确保是个对象
 */
var EMPTY_OBJECT = {};
/**
 * 空数组
 */
var EMPTY_ARRAY = [];
/**
 * 空字符串
 */
var EMPTY_STRING = '';

var env = /*#__PURE__*/Object.freeze({
  TRUE: TRUE,
  FALSE: FALSE,
  NULL: NULL,
  UNDEFINED: UNDEFINED,
  RAW_TRUE: RAW_TRUE,
  RAW_FALSE: RAW_FALSE,
  RAW_NULL: RAW_NULL,
  RAW_UNDEFINED: RAW_UNDEFINED,
  RAW_KEY: RAW_KEY,
  RAW_REF: RAW_REF,
  RAW_TAG: RAW_TAG,
  RAW_SLOT: RAW_SLOT,
  RAW_NAME: RAW_NAME,
  RAW_FILTER: RAW_FILTER,
  RAW_PARTIAL: RAW_PARTIAL,
  RAW_COMPONENT: RAW_COMPONENT,
  RAW_DIRECTIVE: RAW_DIRECTIVE,
  RAW_TRANSITION: RAW_TRANSITION,
  RAW_THIS: RAW_THIS,
  RAW_TYPE: RAW_TYPE,
  RAW_VALUE: RAW_VALUE,
  RAW_LENGTH: RAW_LENGTH,
  RAW_FUNCTION: RAW_FUNCTION,
  RAW_TEMPLATE: RAW_TEMPLATE,
  KEYPATH_PARENT: KEYPATH_PARENT,
  KEYPATH_CURRENT: KEYPATH_CURRENT,
  EVENT_TAP: EVENT_TAP,
  EVENT_CLICK: EVENT_CLICK,
  EVENT_INPUT: EVENT_INPUT,
  EVENT_CHANGE: EVENT_CHANGE,
  EVENT_MODEL: EVENT_MODEL,
  win: win,
  doc: doc,
  EMPTY_FUNCTION: EMPTY_FUNCTION,
  EMPTY_OBJECT: EMPTY_OBJECT,
  EMPTY_ARRAY: EMPTY_ARRAY,
  EMPTY_STRING: EMPTY_STRING
});

function isDef (target) {
    return target !== UNDEFINED;
}

var toString = Object.prototype.toString;
// 这个函数比较慢，所以下面都不用它，主要是给外部用
function is(value, type) {
    return type === 'numeric'
        ? numeric(value)
        : toString.call(value).toLowerCase() === ("[object " + type + "]");
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

var is$1 = /*#__PURE__*/Object.freeze({
  is: is,
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

var CustomEvent = function CustomEvent(type, originalEvent) {
    this.type = type;
    this.originalEvent = originalEvent;
};
/**
 * 阻止事件的默认行为
 */
CustomEvent.prototype.preventDefault = function preventDefault () {
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
CustomEvent.prototype.stopPropagation = function stopPropagation () {
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
CustomEvent.prototype.prevent = function prevent () {
    return this.preventDefault();
};
CustomEvent.prototype.stop = function stop () {
    return this.stopPropagation();
};

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
                if (callback(array[i], i, array) === FALSE) {
                    break;
                }
            }
        }
        else {
            for (var i$1 = 0; i$1 < length; i$1++) {
                if (callback(array[i$1], i$1, array) === FALSE) {
                    break;
                }
            }
        }
    }
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
 * 把类数组转成数组
 *
 * @param array 类数组
 * @return
 */
function toArray(array$1) {
    return array(array$1)
        ? array$1
        : execute([].slice, array$1);
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
    return array.pop();
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
  join: join,
  push: push,
  unshift: unshift,
  toArray: toArray,
  toObject: toObject,
  indexOf: indexOf,
  has: has,
  last: last,
  pop: pop,
  remove: remove,
  falsy: falsy
});

var camelizePattern = /-([a-z])/gi, hyphenatePattern = /\B([A-Z])/g, camelizeCache = {}, hyphenateCache = {};
/**
 * 连字符转成驼峰
 *
 * @param str
 * @return 驼峰格式的字符串
 */
function camelize(str) {
    if (!camelizeCache[str]) {
        camelizeCache[str] = str.replace(camelizePattern, function ($0, $1) {
            return $1.toUpperCase();
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
            return '-' + $1.toLowerCase();
        });
    }
    return hyphenateCache[str];
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
  trim: trim,
  slice: slice,
  indexOf: indexOf$1,
  lastIndexOf: lastIndexOf,
  has: has$1,
  startsWith: startsWith,
  endsWith: endsWith,
  charAt: charAt,
  codeAt: codeAt,
  falsy: falsy$1
});

var SEPARATOR = '.', splitCache = {}, patternCache = {};
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
    prefix += SEPARATOR;
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
    var list = string(splitCache[keypath])
        ? splitCache[keypath]
        : (splitCache[keypath] = keypath.split(SEPARATOR));
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
        ? keypath1 + SEPARATOR + keypath2
        : keypath1 || keypath2;
}
/**
 * 是否模糊匹配
 *
 * @param keypath
 */
function isFuzzy(keypath) {
    return has$1(keypath, '*');
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
        cache = pattern
            .replace(/\./g, '\\.')
            .replace(/\*\*/g, '([\.\\w]+?)')
            .replace(/\*/g, '(\\w+)');
        cache = patternCache[pattern] = new RegExp(("^" + cache + "$"));
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
 * 对象是否包含某个 key
 *
 * @param object
 * @param key
 * @return
 */
function has$2(object, key) {
    // 优先不要用 hasOwnProperty，性能差
    return isDef(object[key])
        // 没辙，那就用吧
        || object.hasOwnProperty(key);
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
    var objects = [], len = arguments.length - 1;
    while ( len-- > 0 ) objects[ len ] = arguments[ len + 1 ];

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
var valueHolder = {};
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
            // 这里主要目的是提升性能
            // 因此不再调用 has 方法了
            // 先直接取值
            var value = object[key], 
            // 紧接着判断值是否存在
            // 下面会处理计算属性的值，不能在它后面设置 hasValue
            hasValue = isDef(value) || object.hasOwnProperty(key);
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

var object$1 = /*#__PURE__*/Object.freeze({
  keys: keys,
  falsy: falsy$2,
  sort: sort,
  each: each$2,
  has: has$2,
  clear: clear,
  extend: extend,
  copy: copy,
  get: get,
  set: set
});

function toString$1 (target, defaultValue) {
    return target != NULL && target.toString
        ? target.toString()
        : isDef(defaultValue)
            ? defaultValue
            : EMPTY_STRING;
}

/**
 * 是否有原生的日志特性，没有必要单独实现
 */
var nativeConsole = typeof console !== RAW_UNDEFINED ? console : NULL, 
/**
 * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
 */
useSource = /yox/.test(toString$1(EMPTY_FUNCTION));
/**
 * 全局调试开关
 *
 * 比如开发环境，开了 debug 模式，但是有时候觉得看着一堆日志特烦，想强制关掉
 * 比如线上环境，关了 debug 模式，为了调试，想强制打开
 */
function isDebug() {
    if (win) {
        var debug = win['DEBUG'];
        if (boolean(debug)) {
            return debug;
        }
    }
    return useSource;
}
/**
 * 打印普通日志
 *
 * @param msg
 */
function log(msg) {
    if (nativeConsole && isDebug()) {
        nativeConsole.log(("[Yox log]: " + msg));
    }
}
/**
 * 打印警告日志
 *
 * @param msg
 */
function warn(msg) {
    if (nativeConsole && isDebug()) {
        nativeConsole.warn(("[Yox warn]: " + msg));
    }
}
/**
 * 打印错误日志
 *
 * @param msg
 */
function error(msg) {
    if (nativeConsole) {
        nativeConsole.error(("[Yox error]: " + msg));
    }
}
/**
 * 致命错误，中断程序
 *
 * @param msg
 */
function fatal(msg) {
    throw new Error(("[Yox fatal]: " + msg));
}

var logger = /*#__PURE__*/Object.freeze({
  log: log,
  warn: warn,
  error: error,
  fatal: fatal
});

var Emitter = function Emitter(ns) {
    this.ns = ns || FALSE;
    this.listeners = {};
};
/**
 * 发射事件
 *
 * @param bullet 事件或事件名称
 * @param data 事件数据
 */
Emitter.prototype.fire = function fire (bullet, data, filter) {
    var event, type, args;
    if (bullet instanceof CustomEvent) {
        event = bullet;
        type = bullet.type;
        args = object(data) ? [event, data] : event;
    }
    else {
        type = bullet;
        if (data) {
            args = data;
        }
    }
    var instance = this;
        var ref = parseNamespace(instance.ns, type);
        var name = ref.name;
        var ns = ref.ns;
        var list = instance.listeners[name], isComplete = TRUE;
    if (list) {
        each(copy(list), function (options, _, list) {
            // 传了 filter，则用 filter 测试是否继续往下执行
            if ((filter ? !filter(options, data) : !matchNamespace(ns, options))
                // 在 fire 过程中被移除了
                || !has(list, options)) {
                return;
            }
            // 为 event 对象加上当前正在处理的 listener
            // 这样方便业务层移除事件绑定
            // 比如 on('xx', function) 这样定义了匿名 listener
            // 在这个 listener 里面获取不到当前 listener 的引用
            // 为了能引用到，有时候会先定义 var listener = function,
            // 然后再 on('xx', listener) 这样其实是没有必要的
            if (event) {
                event.listener = options.fn;
            }
            var result = execute(options.fn, options.ctx, args);
            // 执行次数
            options.num = options.num ? (options.num + 1) : 1;
            // 注册的 listener 可以指定最大执行次数
            if (options.num === options.max) {
                instance.off(type, options);
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
};
/**
 * 是否已监听某个事件
 *
 * @param type
 * @param listener
 */
Emitter.prototype.has = function has (type, listener) {
    var instance = this, listeners = instance.listeners;
        var ref = parseNamespace(instance.ns, type);
        var name = ref.name;
        var ns = ref.ns;
        var result = TRUE, matchListener = createMatchListener(listener), each$1 = function (list) {
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
/**
 * 注册监听
 *
 * @param type
 * @param listener
 * @param data
 */
Emitter.prototype.on = function on (type, listener, data) {
    var instance = this, listeners = instance.listeners, addListener = function (item, type) {
        if (item) {
            var options = func(item) ? { fn: item } : item;
            if (object(options) && func(options.fn)) {
                if (data) {
                    extend(options, data);
                }
                var ref = parseNamespace(instance.ns, type);
                    var name = ref.name;
                    var ns = ref.ns;
                options.ns = ns;
                push(listeners[name] || (listeners[name] = []), options);
                return;
            }
        }
    };
    if (string(type)) {
        addListener(listener, type);
    }
    else {
        each$2(type, addListener);
    }
};
/**
 * 取消监听
 *
 * @param type
 * @param listener
 */
Emitter.prototype.off = function off (type, listener) {
    var instance = this, listeners = instance.listeners;
    if (type) {
        var ref = parseNamespace(instance.ns, type);
            var name = ref.name;
            var ns = ref.ns;
            var matchListener = createMatchListener(listener), each$1 = function (list, name) {
            each(list, function (options, index, list) {
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
    }
    else {
        // 清空
        instance.listeners = {};
    }
};
/**
 * 把事件类型解析成命名空间格式
 *
 * @param ns
 * @param type
 */
function parseNamespace(ns, type) {
    var result = {
        name: type,
        ns: EMPTY_STRING,
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
    return object(listener)
        ? function (options) {
            return listener === options;
        }
        : func(listener)
            ? function (options) {
                return listener === options.fn;
            }
            : function (options) {
                return TRUE;
            };
}
/**
 * 判断 options 是否能匹配命名空间
 *
 * 如果 options 未指定命名空间，或 options.ns 和 namespace 一致，返回 true
 *
 * @param namespace
 * @param options
 */
function matchNamespace(namespace, options) {
    return !namespace.length || namespace === options.ns;
}

function isNative (target) {
    return func(target) && /native code/.test(toString$1(target));
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
var NextTask = function NextTask() {
    this.nextTasks = [];
};
/**
 * 在队尾添加异步任务
 */
NextTask.shared = function shared$1 () {
    if (!shared) {
        shared = new NextTask();
    }
    return shared;
};

NextTask.prototype.append = function append (task) {
    push(this.nextTasks, task);
    this.start();
};
/**
 * 在队首添加异步任务
 */
NextTask.prototype.prepend = function prepend (task) {
    unshift(this.nextTasks, task);
    this.start();
};
/**
 * 启动下一轮任务
 */
NextTask.prototype.start = function start () {
    var instance = this;
    if (instance.nextTasks.length === 1) {
        nextTick$1(function () {
            instance.run();
        });
    }
};
/**
 * 清空异步队列
 */
NextTask.prototype.clear = function clear () {
    this.nextTasks.length = 0;
};
/**
 * 立即执行异步任务，并清空队列
 */
NextTask.prototype.run = function run () {
    var ref = this;
        var nextTasks = ref.nextTasks;
    if (nextTasks.length) {
        this.nextTasks = [];
        each(nextTasks, execute);
    }
};

var SYNTAX_IF = '#if';
var SYNTAX_ELSE = 'else';
var SYNTAX_ELSE_IF = 'else if';
var SYNTAX_EACH = '#each';
var SYNTAX_PARTIAL = '#partial';
var SYNTAX_IMPORT = '>';
var SYNTAX_SPREAD = '...';
var SYNTAX_COMMENT = /^!\s/;
var SLOT_DATA_PREFIX = '$slot_';
var HINT_STRING = 1;
var HINT_NUMBER = 2;
var HINT_BOOLEAN = 3;
var DIRECTIVE_ON = 'on';
var DIRECTIVE_LAZY = 'lazy';
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

// vnode.data 内部使用的几个字段
var ID = '$id';
var VNODE = '$vnode';
var LOADING = '$loading';
var COMPONENT = '$component';
var LEAVING = '$leaving';

function update(api, vnode, oldVnode) {
    var node = vnode.node;
    var nativeAttrs = vnode.nativeAttrs;
    var oldNativeAttrs = oldVnode && oldVnode.nativeAttrs;
    if (nativeAttrs || oldNativeAttrs) {
        var newValue = nativeAttrs || EMPTY_OBJECT, oldValue = oldNativeAttrs || EMPTY_OBJECT;
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
    var node = vnode.node;
    var nativeProps = vnode.nativeProps;
    var oldNativeProps = oldVnode && oldVnode.nativeProps;
    if (nativeProps || oldNativeProps) {
        var newValue = nativeProps || EMPTY_OBJECT, oldValue = oldNativeProps || EMPTY_OBJECT;
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
//
// 旧 [ child1, child2 ]
// 新 innerHTML
//
// 这种情况，要让外部先把 child1 child2 正常移除掉，再用 innerHTML 覆盖，否则指令无法销毁
//
// 旧 innerHTML
// 新 [ child1, child2 ]
//
// 这种情况，先用 innerHTML 覆盖，再处理 child1 child2
//
// export default {
//   create: createProps,
//   update: removeProps,
//   postpatch: createProps,
// }

function update$2(vnode, oldVnode) {
    var data = vnode.data;
    var directives = vnode.directives;
    var oldDirectives = oldVnode && oldVnode.directives;
    if (directives || oldDirectives) {
        var node = data[COMPONENT] || vnode.node, isKeypathChange = oldVnode && vnode.keypath !== oldVnode.keypath, newValue = directives || EMPTY_OBJECT, oldValue = oldDirectives || EMPTY_OBJECT;
        each$2(newValue, function (directive, name) {
            var ref = directive.hooks;
            var bind = ref.bind;
            var unbind = ref.unbind;
            if (!oldValue[name]) {
                bind(node, directive, vnode);
            }
            else if (directive.value !== oldValue[name].value
                || isKeypathChange) {
                if (unbind) {
                    unbind(node, oldValue[name], oldVnode);
                }
                bind(node, directive, vnode);
            }
        });
        each$2(oldValue, function (directive, name) {
            if (!newValue[name]) {
                var ref = directive.hooks;
                var unbind = ref.unbind;
                if (unbind) {
                    unbind(node, directive, oldVnode);
                }
            }
        });
    }
}
function remove$1(vnode) {
    var directives = vnode.directives;
    if (directives) {
        var node = vnode.data[COMPONENT] || vnode.node;
        each$2(directives, function (directive) {
            var ref = directive.hooks;
            var unbind = ref.unbind;
            if (unbind) {
                unbind(node, directive, vnode);
            }
        });
    }
}

function update$3(vnode, oldVnode) {
    var data = vnode.data;
    var ref = vnode.ref;
    var props = vnode.props;
    var slots = vnode.slots;
    var context = vnode.context;
    var node;
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
    if (!options) {
        return;
    }
    // 渲染同步加载的组件时，vnode.node 为空
    // 渲染异步加载的组件时，vnode.node 不为空，因为初始化用了占位节点
    var child = (vnode.parent || vnode.context).create(options, vnode, vnode.node), 
    // 组件初始化创建的元素
    node = child.$el;
    if (node) {
        vnode[NODE] = node;
    }
    vnode.data[COMPONENT] = child;
    vnode.data[LOADING] = FALSE;
    update$3(vnode);
    update$2(vnode);
    return child;
}
var guid = 0, 
// vnode.node 设置成了 readonly，是为了避免外部修改
// 但是这里还是要对 vnode.node 进行赋值，只好用变量属性赋值，跳过 ts 的类型检测
NODE = 'node';
function createData() {
    var data = {};
    data[ID] = ++guid;
    return data;
}
function createVnode(api, vnode) {
    var tag = vnode.tag;
    var node = vnode.node;
    var data = vnode.data;
    var isComponent = vnode.isComponent;
    var isComment = vnode.isComment;
    var isText = vnode.isText;
    var isStyle = vnode.isStyle;
    var children = vnode.children;
    var text = vnode.text;
    var html = vnode.html;
    var context = vnode.context;
    if (node && data) {
        return;
    }
    data = createData();
    vnode.data = data;
    if (isText) {
        vnode[NODE] = api.createText(text);
        return;
    }
    if (isComment) {
        vnode[NODE] = api.createComment(text);
        return;
    }
    if (isComponent) {
        var isAsync = TRUE;
        context.component(tag, function (options) {
            if (isDef(data[LOADING])) {
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
                createComponent(vnode, options);
                isAsync = FALSE;
            }
        });
        if (isAsync) {
            vnode[NODE] = api.createComment(RAW_COMPONENT);
            data[LOADING] = TRUE;
        }
    }
    else {
        node = vnode[NODE] = api.createElement(vnode.tag);
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
    var node = vnode.node;
    var data = vnode.data;
    var context = vnode.context;
    var hasParent = api.parent(node);
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
        var enter;
        if (vnode.isComponent) {
            var component = data[COMPONENT];
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
            context.nextTick(enter, TRUE);
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
    var data = vnode.data;
    var children = vnode.children;
    var parent = vnode.parent;
    var context = vnode.context;
    if (parent
        // 如果宿主组件正在销毁，$vnode 属性会在调 destroy() 之前被删除
        // 这里表示的是宿主组件还没被销毁
        // 如果宿主组件被销毁了，则它的一切都要进行销毁
        && parent.$vnode
        // 是从外部传入到组件内的
        && parent !== vnode.context) {
        return;
    }
    if (vnode.isComponent) {
        var component = data[COMPONENT];
        if (component) {
            remove$1(vnode);
            component.destroy();
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
    var data = vnode.data;
    var transition = vnode.transition;
    if (component && !transition) {
        // 再看组件根元素是否有 transition
        transition = component.$vnode.transition;
    }
    execute(data[LEAVING]);
    if (transition) {
        var enter = transition.enter;
        if (enter) {
            enter(vnode.node, EMPTY_FUNCTION);
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
    var data = vnode.data;
    var transition = vnode.transition;
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
    var node = oldVnode.node;
    var data = oldVnode.data;
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
    vnode[NODE] = node;
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
    var text = vnode.text;
    var html = vnode.html;
    var children = vnode.children;
    var isStyle = vnode.isStyle;
    var oldText = oldVnode.text, oldHtml = oldVnode.html, oldChildren = oldVnode.children;
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
function create(api, node, isComment, context, keypath) {
    return {
        tag: api.tag(node),
        data: createData(),
        isComment: isComment,
        node: node,
        context: context,
        keypath: keypath,
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
 * 对象表达式
 */
var OBJECT = 8;
/**
 * 函数调用表达式，如 a()
 */
var CALL = 9;

function createArray(nodes, raw) {
    return {
        type: ARRAY,
        raw: raw,
        nodes: nodes,
    };
}
function createBinary(a, op, b, raw) {
    return {
        type: BINARY,
        raw: raw,
        a: a,
        op: op,
        b: b,
    };
}
function createCall(name, args, raw) {
    return {
        type: CALL,
        raw: raw,
        name: name,
        args: args,
    };
}
function createIdentifierInner(raw, name, lookup, offset, sk) {
    return {
        type: IDENTIFIER,
        raw: raw,
        name: name,
        lookup: lookup === FALSE ? lookup : UNDEFINED,
        offset: offset > 0 ? offset : UNDEFINED,
        sk: isDef(sk) ? sk : name,
    };
}
function createMemberInner(raw, props, lookup, offset, sk) {
    return {
        type: MEMBER,
        raw: raw,
        props: props,
        lookup: lookup === FALSE ? lookup : UNDEFINED,
        offset: offset > 0 ? offset : UNDEFINED,
        sk: sk,
    };
}
function createIdentifier(raw, name, isProp) {
    var lookup, offset;
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
        raw: raw,
        value: value,
    };
}
function createObject(keys, values, raw) {
    return {
        type: OBJECT,
        raw: raw,
        keys: keys,
        values: values,
    };
}
function createTernary(test, yes, no, raw) {
    return {
        type: TERNARY,
        raw: raw,
        test: test,
        yes: yes,
        no: no,
    };
}
function createUnary(op, a, raw) {
    return {
        type: UNARY,
        raw: raw,
        op: op,
        a: a,
    };
}
function getLiteralNode(nodes, index) {
    if (nodes[index]
        && nodes[index].type === LITERAL) {
        return nodes[index];
    }
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
    var length = nodes.length;
    var lookup, offset = 0, staticKeypath, name = EMPTY_STRING, list = [], literal, identifier;
    if (length > 1) {
        // lookup 要求第一位元素是 Identifier，且它的 lookup 是 true 才为 true
        // 其他情况都为 false，如 "11".length 第一位元素是 Literal，不存在向上寻找的需求
        if (nodes[0].type === IDENTIFIER) {
            identifier = nodes[0];
            name = identifier.name;
            lookup = identifier.lookup;
            staticKeypath = identifier.sk;
            if (identifier.offset > 0) {
                offset += identifier.offset;
            }
            if (name) {
                push(list, identifier);
            }
            // 优化 1：计算 staticKeypath
            //
            // 计算 staticKeypath 的唯一方式是，第一位元素是 Identifier，后面都是 Literal
            // 否则就表示中间包含动态元素，这会导致无法计算静态路径
            // 如 a.b.c 可以算出 staticKeypath，而 a[b].c 则不行，因为 b 是动态的
            // 下面这段属于性能优化，避免在运行时反复计算 Member 的 keypath
            // 优化 2：计算 offset 并智能转成 Identifier
            //
            // 比如 ../../xx 这样的表达式，应优化成 offset = 2，并转成 Identifier
            for (var i = 1; i < length; i++) {
                literal = getLiteralNode(nodes, i);
                if (literal) {
                    if (literal.raw === KEYPATH_PARENT) {
                        offset += 1;
                        continue;
                    }
                    if (isDef(staticKeypath)
                        && literal.raw !== KEYPATH_CURRENT) {
                        staticKeypath = join$1(staticKeypath, toString$1(literal.value));
                    }
                }
                else {
                    staticKeypath = UNDEFINED;
                }
                push(list, nodes[i]);
            }
            // 表示 nodes 中包含路径，并且路径节点被干掉了
            if (list.length < length) {
                nodes = list;
                // 剩下的节点，第一个如果是 Literal，把它转成 Identifier
                literal = getLiteralNode(nodes, 0);
                if (literal) {
                    name = literal.value;
                    nodes[0] = createIdentifierInner(literal.raw, name, lookup, offset);
                }
            }
        }
        // 如果全是路径节点，如 ../../this，nodes 为空数组
        // 如果剩下一个节点，则可转成标识符
        return nodes.length < 2
            ? createIdentifierInner(raw, name, lookup, offset, staticKeypath)
            : createMemberInner(raw, nodes, lookup, offset, staticKeypath);
    }
    return nodes[0];
}

var unary = {
    '+': { exec: function exec(a) { return +a; } },
    '-': { exec: function exec(a) { return -a; } },
    '~': { exec: function exec(a) { return ~a; } },
    '!': { exec: function exec(a) { return !a; } },
    '!!': { exec: function exec(a) { return !!a; } },
};
// 参考 https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
var binary = {
    '*': { prec: 14, exec: function exec(a, b) { return a * b; } },
    '/': { prec: 14, exec: function exec(a, b) { return a / b; } },
    '%': { prec: 14, exec: function exec(a, b) { return a % b; } },
    '+': { prec: 13, exec: function exec(a, b) { return a + b; } },
    '-': { prec: 13, exec: function exec(a, b) { return a - b; } },
    '<<': { prec: 12, exec: function exec(a, b) { return a << b; } },
    '>>': { prec: 12, exec: function exec(a, b) { return a >> b; } },
    '>>>': { prec: 12, exec: function exec(a, b) { return a >>> b; } },
    '<': { prec: 11, exec: function exec(a, b) { return a < b; } },
    '<=': { prec: 11, exec: function exec(a, b) { return a <= b; } },
    '>': { prec: 11, exec: function exec(a, b) { return a > b; } },
    '>=': { prec: 11, exec: function exec(a, b) { return a >= b; } },
    '==': { prec: 10, exec: function exec(a, b) { return a == b; } },
    '!=': { prec: 10, exec: function exec(a, b) { return a != b; } },
    '===': { prec: 10, exec: function exec(a, b) { return a === b; } },
    '!==': { prec: 10, exec: function exec(a, b) { return a !== b; } },
    '&': { prec: 9, exec: function exec(a, b) { return a & b; } },
    '^': { prec: 8, exec: function exec(a, b) { return a ^ b; } },
    '|': { prec: 7, exec: function exec(a, b) { return a | b; } },
    '&&': { prec: 6, exec: function exec(a, b) { return a && b; } },
    '||': { prec: 5, exec: function exec(a, b) { return a || b; } },
    '->': {
        prec: 0,
        exec: function exec(a, b) {
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
        exec: function exec(a, b) {
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

function compile(content) {
    if (!cache[content]) {
        var parser = new Parser(content);
        cache[content] = parser.scanTernary(CODE_EOF);
    }
    return cache[content];
}
var Parser = function Parser(content) {
    var length = content.length;
    this.index = -1;
    this.end = length;
    this.code = CODE_EOF;
    this.content = content;
    this.go();
};
/**
 * 移动一个字符
 */
Parser.prototype.go = function go (step) {
    var instance = this;
        var index = instance.index;
        var end = instance.end;
    index += step || 1;
    if (index >= 0 && index < end) {
        instance.code = codeAt(instance.content, index);
        instance.index = index;
    }
    else {
        instance.code = CODE_EOF;
        instance.index = index < 0 ? -1 : end;
    }
};
/**
 * 跳过空白符
 */
Parser.prototype.skip = function skip (step) {
    var instance = this;
    // 走一步
    if (instance.code === CODE_EOF) {
        instance.go(step);
    }
    // 如果是正向的，停在第一个非空白符左侧
    // 如果是逆向的，停在第一个非空白符右侧
    while (TRUE) {
        if (isWhitespace(instance.code)) {
            instance.go(step);
        }
        else {
            if (step && step < 0) {
                instance.go();
            }
            break;
        }
    }
};
/**
 * 判断当前字符
 */
Parser.prototype.is = function is (code) {
    return this.code === code;
};
/**
 * 截取一段字符串
 *
 * @param startIndex
 */
Parser.prototype.pick = function pick (startIndex, endIndex) {
    return slice(this.content, startIndex, isDef(endIndex) ? endIndex : this.index);
};
/**
 * 尝试解析下一个 token
 */
Parser.prototype.scanToken = function scanToken () {
    var instance = this;
        var code = instance.code;
        var index = instance.index;
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
    var operator = instance.scanOperator(index);
    if (operator && unary[operator]) {
        var node = instance.scanTernary();
        if (node) {
            if (node.type === LITERAL) {
                var value = node.value;
                if (number(value)) {
                    // 类似 ' -1 ' 这样的右侧有空格，需要撤回来
                    instance.skip(-1);
                    return createLiteral(-value, instance.pick(index));
                }
            }
            // 类似 ' -a ' 这样的右侧有空格，需要撤回来
            instance.skip(-1);
            return createUnary(operator, node, instance.pick(index));
        }
    }
};
/**
 * 扫描数字
 *
 * 支持整数和小数
 *
 * @param startIndex
 * @return
 */
Parser.prototype.scanNumber = function scanNumber (startIndex) {
    var instance = this;
    while (isNumber(instance.code)) {
        instance.go();
    }
    var raw = instance.pick(startIndex);
    // 尝试转型，如果转型失败，则确定是个错误的数字
    if (numeric(raw)) {
        return createLiteral(+raw, raw);
    }
};
/**
 * 扫描字符串
 *
 * 支持反斜线转义引号
 *
 * @param startIndex
 * @param endCode
 */
Parser.prototype.scanString = function scanString (startIndex, endCode) {
    var instance = this;
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
                break loop;
        }
    }
    // new Function 处理字符转义
    var raw = instance.pick(startIndex);
    return createLiteral(new Function(("return " + raw))(), raw);
};
/**
 * 扫描对象字面量
 *
 * @param startIndex
 */
Parser.prototype.scanObject = function scanObject (startIndex) {
    var instance = this, keys = [], values = [], isKey = TRUE, node;
    // 跳过 {
    instance.go();
    loop: while (TRUE) {
        switch (instance.code) {
            case CODE_CBRACE:
                instance.go();
                break loop;
            case CODE_EOF:
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
                            break loop;
                        }
                    }
                }
                else if (node) {
                    // 处理 { key : value } value 后面的空格
                    instance.skip();
                    push(values, node);
                }
                else {
                    break loop;
                }
        }
    }
    return createObject(keys, values, instance.pick(startIndex));
};
/**
 * 扫描元组，即 `a, b, c` 这种格式，可以是参数列表，也可以是数组
 *
 * @param startIndex
 * @param endCode 元组的结束字符编码
 */
Parser.prototype.scanTuple = function scanTuple (startIndex, endCode) {
    var instance = this, nodes = [], node;
    // 跳过开始字符，如 [ 和 (
    instance.go();
    loop: while (TRUE) {
        switch (instance.code) {
            case endCode:
                instance.go();
                break loop;
            case CODE_EOF:
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
};
/**
 * 扫描路径，如 `./` 和 `../`
 *
 * 路径必须位于开头，如 ./../ 或 ../../，不存在 a/../b/../c 这样的情况，因为路径是用来切换或指定 context 的
 *
 * @param startIndex
 * @param prevNode
 */
Parser.prototype.scanPath = function scanPath (startIndex) {
    var instance = this, nodes = [], name;
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
};
/**
 * 扫描变量
 */
Parser.prototype.scanTail = function scanTail (startIndex, nodes) {
    var instance = this, node;
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
                    break loop;
                }
            default:
                break loop;
        }
    }
    return createMemberIfNeeded(instance.pick(startIndex), nodes);
};
/**
 * 扫描标识符
 *
 * @param startIndex
 * @param isProp 是否是对象的属性
 * @return
 */
Parser.prototype.scanIdentifier = function scanIdentifier (startIndex, isProp) {
    var instance = this;
    while (isIdentifierPart(instance.code)) {
        instance.go();
    }
    var raw = instance.pick(startIndex);
    return !isProp && has$2(keywordLiterals, raw)
        ? createLiteral(keywordLiterals[raw], raw)
        : createIdentifier(raw, raw, isProp);
};
/**
 * 扫描运算符
 *
 * @param startIndex
 */
Parser.prototype.scanOperator = function scanOperator (startIndex) {
    var instance = this;
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
            break;
        // -、->
        case CODE_MINUS:
            instance.go();
            if (instance.is(CODE_GREAT)) {
                instance.go();
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
        // ==、===、=>
        case CODE_EQUAL:
            instance.go();
            if (instance.is(CODE_EQUAL)) {
                instance.go();
                if (instance.is(CODE_EQUAL)) {
                    instance.go();
                }
            }
            else if (instance.is(CODE_GREAT)) {
                instance.go();
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
    if (instance.code > startIndex) {
        return instance.pick(startIndex);
    }
};
/**
 * 扫描二元运算
 */
Parser.prototype.scanBinary = function scanBinary (startIndex) {
    // 二元运算，如 a + b * c / d，这里涉及运算符的优先级
    // 算法参考 https://en.wikipedia.org/wiki/Shunting-yard_algorithm
    var instance = this, 
    // 格式为 [ index1, node1, index2, node2, ... ]
    output = [], token, index, operator, operatorInfo, lastOperator, lastOperatorInfo;
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
            if (operator && (operatorInfo = binary[operator])) {
                // 比较前一个运算符
                index = output.length - 4;
                // 如果前一个运算符的优先级 >= 现在这个，则新建 Binary
                // 如 a + b * c / d，当从左到右读取到 / 时，发现和前一个 * 优先级相同，则把 b * c 取出用于创建 Binary
                if ((lastOperator = output[index])
                    && (lastOperatorInfo = binary[lastOperator])
                    && lastOperatorInfo.prec >= operatorInfo.prec) {
                    output.splice(index - 2, 5, createBinary(output[index - 2], lastOperator, output[index + 2], instance.pick(output[index - 3], output[index + 3])));
                }
                push(output, operator);
                continue;
            }
            else {
                operator = UNDEFINED;
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
};
/**
 * 扫描三元运算
 *
 * @param endCode
 */
Parser.prototype.scanTernary = function scanTernary (endCode) {
    /**
     * https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence
     *
     * ?: 运算符的优先级几乎是最低的，比它低的只有四种： 赋值、yield、延展、逗号
     * 我们不支持这四种，因此可认为 ?: 优先级最低
     */
    var instance = this;
    instance.skip();
    var index = instance.index, test = instance.scanBinary(index), yes, no;
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
            instance.skip(-1);
            test = createTernary(test, yes, no, instance.pick(index));
        }
    }
    // 过掉结束字符
    if (isDef(endCode)) {
        instance.skip();
        if (instance.is(endCode)) {
            instance.go();
        }
    }
    return test;
};
Parser.prototype.fatal = function fatal$1 (start, message) {
};
var cache = {}, CODE_EOF = 0, //
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

/**
 * 元素 节点
 */
var ELEMENT = 1;
/**
 * 属性 节点
 */
var ATTRIBUTE = 2;
/**
 * 指令 节点
 */
var DIRECTIVE = 3;
/**
 * 属性 节点
 */
var PROPERTY = 4;
/**
 * 文本 节点
 */
var TEXT = 5;
/**
 * if 节点
 */
var IF = 6;
/**
 * else if 节点
 */
var ELSE_IF = 7;
/**
 * else 节点
 */
var ELSE = 8;
/**
 * each 节点
 */
var EACH = 9;
/**
 * partial 节点
 */
var PARTIAL = 10;
/**
 * import 节点
 */
var IMPORT = 11;
/**
 * 表达式 节点
 */
var EXPRESSION = 12;
/**
 * 延展操作 节点
 */
var SPREAD = 13;

// 特殊标签
var specialTags = {};
// 特殊属性
var specialAttrs = {};
// 名称 -> 类型的映射
var name2Type = {};
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
        name: name,
    };
}
function createDirective(ns, name, value, expr, children) {
    return {
        type: DIRECTIVE,
        ns: ns,
        name: name,
        value: value,
        expr: expr,
        children: children,
    };
}
function createProperty(name, hint, value, expr, children) {
    return {
        type: PROPERTY,
        isStatic: TRUE,
        name: name,
        hint: hint,
        value: value,
        expr: expr,
        children: children,
    };
}
function createEach(expr, index) {
    return {
        type: EACH,
        expr: expr,
        index: index,
        isComplex: TRUE,
    };
}
function createElement(tag, isSvg, isComponent) {
    // 是 svg 就不可能是组件
    // 加这个判断的原因是，svg 某些标签含有 连字符 和 大写字母，比较蛋疼
    if (isSvg) {
        isComponent = FALSE;
    }
    return {
        type: ELEMENT,
        tag: tag,
        isSvg: isSvg,
        isStyle: tag === 'style',
        isComponent: isComponent,
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
        expr: expr,
    };
}
function createExpression(expr, safe) {
    return {
        type: EXPRESSION,
        expr: expr,
        safe: safe,
        isLeaf: TRUE,
    };
}
function createIf(expr) {
    return {
        type: IF,
        expr: expr,
    };
}
function createImport(name) {
    return {
        type: IMPORT,
        name: name,
        isComplex: TRUE,
        isLeaf: TRUE,
    };
}
function createPartial(name) {
    return {
        type: PARTIAL,
        name: name,
        isComplex: TRUE,
    };
}
function createSpread(expr, binding) {
    return {
        type: SPREAD,
        expr: expr,
        binding: binding,
        isLeaf: TRUE,
    };
}
function createText(text) {
    return {
        type: TEXT,
        text: text,
        isStatic: TRUE,
        isLeaf: TRUE,
    };
}

// 当前不位于 block 之间
var BLOCK_MODE_NONE = 1, 
// {{ x }}
BLOCK_MODE_SAFE = 2, 
// {{{ x }}}
BLOCK_MODE_UNSAFE = 3, 
// 表达式的静态 keypath
STATIC_KEYPATH = 'sk', 
// 缓存编译模板
compileCache = {}, 
// 缓存编译正则
patternCache$1 = {}, 
// 指令分隔符，如 on-click 和 lazy-click
directiveSeparator = '-', 
// 标签
tagPattern = /<(\/)?([$a-z][-a-z0-9]*)/i, 
// 注释
commentPattern = /<!--[\s\S]*?-->/g, 
// 属性的 name
attributePattern = /^\s*([-:\w]+)(['"])?(?:=(['"]))?/, 
// 首字母大写，或中间包含 -
componentNamePattern = /^[$A-Z]|-/, 
// 自闭合标签
selfClosingTagPattern = /^\s*(\/)?>/, 
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
/**
 * 截取前缀之后的字符串
 */
function slicePrefix(str, prefix) {
    return trim(slice(str, prefix.length));
}
/**
 * trim 文本开始和结束位置的换行符
 *
 * 换行符比较神奇，有时候你明明看不到换行符，却真的存在一个，那就是 \r
 *
 */
function trimBreakline(content) {
    return content.replace(/^\s*[\n\r]\s*|\s*[\n\r]\s*$/g, EMPTY_STRING);
}
function compile$1(content) {
    var nodeList = compileCache[content];
    if (nodeList) {
        return nodeList;
    }
    nodeList = [];
    var nodeStack = [], 
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
    blockMode = BLOCK_MODE_NONE, code, startQuote, /**
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
        var lastNode = last(nodeStack);
        if (lastNode
            && lastNode.type === ELEMENT
            && lastNode.tag !== popingTagName
            && has(selfClosingTagNames, lastNode.tag)) {
            popStack(lastNode.type, lastNode.tag);
        }
    }, popStack = function (type, tagName) {
        var node = pop(nodeStack);
        if (node && node.type === type) {
            var children = node.children;
            var child = children && children.length === 1 && children[0], isElement = type === ELEMENT, isAttribute = type === ATTRIBUTE, isProperty = type === PROPERTY, isDirective = type === DIRECTIVE;
            var currentBranch = last(nodeStack);
            if (currentBranch) {
                if (currentBranch.isStatic && !node.isStatic) {
                    currentBranch.isStatic = FALSE;
                }
                if (!currentBranch.isComplex
                    && (node.isComplex || isElement)) {
                    currentBranch.isComplex = TRUE;
                }
            }
            // 除了 helper.specialAttrs 里指定的特殊属性，attrs 里的任何节点都不能单独拎出来赋给 element
            // 因为 attrs 可能存在 if，所以每个 attr 最终都不一定会存在
            if (child) {
                switch (child.type) {
                    case TEXT:
                        // 属性的值如果是纯文本，直接获取文本值
                        // 减少渲染时的遍历
                        if (isElement) ;
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
                        break;
                }
            }
            // 大于 1 个子节点，即有插值或 if 写法
            else if (children) ;
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
            else if (currentElement && isAttribute && isSpecialAttr(currentElement, node)) {
                bindSpecialAttr(currentElement, node);
            }
            return node;
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
        var text = child.text;
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
        var expr = child.expr;
        prop.expr = expr;
        prop.children = UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr[STATIC_KEYPATH]) {
            prop.binding = TRUE;
        }
    }, processAttributeEmptyChildren = function (element, attr) {
        var name = attr.name;
        if (isSpecialAttr(element, attr)) ;
        // 比如 <Dog isLive>
        else if (element.isComponent) {
            attr.value = TRUE;
        }
        // <div data-name checked>
        else {
            attr.value = startsWith(name, 'data-')
                ? EMPTY_STRING
                : name;
        }
    }, processAttributeSingleText = function (attr, child) {
        attr.value = child.text;
        attr.children = UNDEFINED;
    }, processAttributeSingleExpression = function (attr, child) {
        var expr = child.expr;
        attr.expr = expr;
        attr.children = UNDEFINED;
        // 对于有静态路径的表达式，可转为单向绑定指令，可实现精确更新视图，如下
        // <div class="{{className}}">
        if (expr[STATIC_KEYPATH]) {
            attr.binding = TRUE;
        }
    }, processDirectiveEmptyChildren = function (element, directive) {
        directive.value = TRUE;
    }, processDirectiveSingleText = function (directive, child) {
        var text = child.text;
        // lazy 不需要编译表达式
        // 因为 lazy 的值必须是大于 0 的数字
        if (directive.ns === DIRECTIVE_LAZY) {
            if (numeric(text)) {
                var value = toNumber(text);
                if (value > 0) {
                    directive.value = value;
                }
            }
        }
        else {
            // 指令的值是纯文本，可以预编译表达式，提升性能
            var expr = compile(text), 
            // model="xx" model="this.x" 值只能是标识符或 Member
            isModel = directive.ns === DIRECTIVE_MODEL, 
            // on-click="xx" on-click="method()" 值只能是标识符或函数调用
            // on-click="click" 事件转换名称不能相同
            isEvent = directive.ns === DIRECTIVE_EVENT;
            if (expr) {
                directive.expr = expr;
            }
            directive.value = text;
        }
        directive.children = UNDEFINED;
    }, checkCondition = function (condition) {
        var currentNode = condition, prevNode, hasChildren, hasNext;
        // 变成一维数组，方便遍历
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
        // style 如果啥都没写，就默认加一个 type="text/css"
        // 因为低版本 IE 没这个属性，没法正常渲染样式
        // 如果 style 写了 attribute 那就自己保证吧
        // 因为 attrs 具有动态性，compiler 无法保证最终一定会输出 type 属性
        if (element.isStyle && falsy(element.attrs)) {
            element.attrs = [
                createProperty(RAW_TYPE, HINT_STRING, 'text/css')
            ];
        }
    }, bindSpecialAttr = function (element, attr) {
        var name = attr.name;
        var value = attr.value;
        var isStringValueRequired = name === RAW_NAME || name === RAW_SLOT;
        element[name] = isStringValueRequired ? value : attr;
        replaceChild(attr);
    }, isSpecialAttr = function (element, attr) {
        return specialAttrs[attr.name]
            || element.tag === RAW_SLOT && attr.name === RAW_NAME;
    }, replaceChild = function (oldNode, newNode) {
        var currentBranch = last(nodeStack), isAttr, list, index;
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
        var type = node.type, currentBranch = last(nodeStack);
        // else 系列只是 if 的递进节点，不需要加入 nodeList
        if (type === ELSE || type === ELSE_IF) {
            var lastNode = pop(ifStack);
            if (lastNode) {
                // 方便 checkCondition 逆向遍历
                node.prev = lastNode;
                // lastNode 只能是 if 或 else if 节点
                if (lastNode.type === ELSE_IF || lastNode.type === IF) {
                    lastNode.next = node;
                    popStack(lastNode.type);
                    push(ifStack, node);
                }
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
        text = trimBreakline(text);
        if (text) {
            addChild(createText(text));
        }
    }, htmlParsers = [
        function (content) {
            if (!currentElement) {
                var match = content.match(tagPattern);
                // 必须以 <tag 开头才能继续
                // 如果 <tag 前面有别的字符，会走进第四个 parser
                if (match && match.index === 0) {
                    var tag = match[2];
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
                        var node = createElement(tag, has(svgTagNames, tag), componentNamePattern.test(tag));
                        addChild(node);
                        currentElement = node;
                    }
                    return match[0];
                }
            }
        },
        // 处理标签的 > 或 />，不论开始还是结束标签
        function (content) {
            var match = content.match(selfClosingTagPattern);
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
                var match = content.match(attributePattern);
                if (match) {
                    var node, name = match[1];
                    if (name === DIRECTIVE_MODEL || name === RAW_TRANSITION) {
                        node = createDirective(camelize(name));
                    }
                    // 这里要用 on- 判断前缀，否则 on 太容易重名了
                    else if (startsWith(name, DIRECTIVE_ON + directiveSeparator)) {
                        var event = slicePrefix(name, DIRECTIVE_ON + directiveSeparator);
                        node = createDirective(DIRECTIVE_EVENT, camelize(event));
                    }
                    // 当一个元素绑定了多个事件时，可分别指定每个事件的 lazy
                    // 当只有一个事件时，可简写成 lazy
                    // <div on-click="xx" lazy-click
                    else if (startsWith(name, DIRECTIVE_LAZY)) {
                        var lazy = slicePrefix(name, DIRECTIVE_LAZY);
                        if (startsWith(lazy, directiveSeparator)) {
                            lazy = slicePrefix(lazy, directiveSeparator);
                        }
                        node = createDirective(DIRECTIVE_LAZY, lazy ? camelize(lazy) : EMPTY_STRING);
                    }
                    // 这里要用 o- 判断前缀，否则 o 太容易重名了
                    else if (startsWith(name, DIRECTIVE_CUSTOM + directiveSeparator)) {
                        var custom = slicePrefix(name, DIRECTIVE_CUSTOM + directiveSeparator);
                        node = createDirective(DIRECTIVE_CUSTOM, camelize(custom));
                    }
                    else {
                        // 组件用驼峰格式
                        if (currentElement.isComponent) {
                            node = createAttribute(camelize(name));
                        }
                        // 原生 dom 属性
                        else {
                            // 把 attr 优化成 prop
                            var lowerName = name.toLowerCase();
                            // <slot> 或 <template> 中的属性不用识别为 property
                            if (specialTags[currentElement.tag]) {
                                node = createAttribute(name);
                            }
                            // 尝试识别成 property
                            else if (has(stringProperyNames, lowerName)) {
                                node = createProperty(attr2Prop[lowerName] || lowerName, HINT_STRING);
                            }
                            else if (has(numberProperyNames, lowerName)) {
                                node = createProperty(attr2Prop[lowerName] || lowerName, HINT_NUMBER);
                            }
                            else if (has(booleanProperyNames, lowerName)) {
                                node = createProperty(attr2Prop[lowerName] || lowerName, HINT_BOOLEAN);
                            }
                            // 没辙，还是个 attribute
                            else {
                                node = createAttribute(name);
                            }
                        }
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
            var text, match;
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
            }
            // 如果不加判断，类似 <div {{...obj}}> 这样写，会把空格当做一个属性
            // 收集文本只有两处：属性值、元素内容
            // 属性值通过上面的 if 处理过了，这里只需要处理元素内容
            else if (!currentElement) {
                // 获取 <tag 前面的字符
                match = content.match(tagPattern);
                if (match) {
                    text = slice(content, 0, match.index);
                    if (text) {
                        addTextChild(text.replace(commentPattern, EMPTY_STRING));
                    }
                }
                else {
                    text = content;
                    addTextChild(text);
                }
            }
            else {
                text = content;
            }
            return text;
        } ], blockParsers = [
        // {{#each xx:index}}
        function (source) {
            if (startsWith(source, SYNTAX_EACH)) {
                source = slicePrefix(source, SYNTAX_EACH);
                var terms = source.replace(/\s+/g, EMPTY_STRING).split(':');
                if (terms[0]) {
                    var expr = compile(trim(terms[0]));
                    if (expr) {
                        if (!currentElement) {
                            return createEach(expr, trim(terms[1]));
                        }
                    }
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
                }
            }
        },
        // {{#if expr}}
        function (source) {
            if (startsWith(source, SYNTAX_IF)) {
                source = slicePrefix(source, SYNTAX_IF);
                var expr = compile(source);
                if (expr) {
                    return createIf(expr);
                }
            }
        },
        // {{else if expr}}
        function (source) {
            if (startsWith(source, SYNTAX_ELSE_IF)) {
                source = slicePrefix(source, SYNTAX_ELSE_IF);
                var expr = compile(source);
                if (expr) {
                    return createElseIf(expr);
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
            }
        },
        // {{...obj}}
        function (source) {
            if (startsWith(source, SYNTAX_SPREAD)) {
                source = slicePrefix(source, SYNTAX_SPREAD);
                var expr = compile(source);
                if (expr) {
                    if (currentElement && currentElement.isComponent) {
                        return createSpread(expr, string(expr[STATIC_KEYPATH])
                            ? TRUE
                            : FALSE);
                    }
                }
            }
        },
        // {{expr}}
        function (source) {
            if (!SYNTAX_COMMENT.test(source)) {
                source = trim(source);
                var expr = compile(source);
                if (expr) {
                    return createExpression(expr, blockMode === BLOCK_MODE_SAFE);
                }
            }
        } ], parseHtml = function (code) {
        while (code) {
            each(htmlParsers, function (parse) {
                var match = parse(code);
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
            var name = slice(code, 1);
            var type = name2Type[name], isCondition;
            if (type === IF) {
                var node = pop(ifStack);
                if (node) {
                    type = node.type;
                    isCondition = TRUE;
                }
            }
            var node$1 = popStack(type);
            if (node$1 && isCondition) {
                checkCondition(node$1);
            }
        }
        else {
            // 开始下一个 block 或表达式
            each(blockParsers, function (parse) {
                var node = parse(code);
                if (node) {
                    addChild(node);
                    return FALSE;
                }
            });
        }
    };
    while (TRUE) {
        openBlockIndex = indexOf$1(content, '{{', nextIndex);
        if (openBlockIndex >= nextIndex) {
            blockMode = BLOCK_MODE_SAFE;
            parseHtml(slice(content, nextIndex, openBlockIndex));
            // 跳过 {{
            openBlockIndex += 2;
            // {{ 后面总得有内容吧
            if (openBlockIndex < length) {
                if (charAt(content, openBlockIndex) === '{') {
                    blockMode = BLOCK_MODE_UNSAFE;
                    openBlockIndex++;
                }
                if (openBlockIndex < length) {
                    closeBlockIndex = indexOf$1(content, '}}', openBlockIndex);
                    if (closeBlockIndex >= openBlockIndex) {
                        // 确定开始和结束定界符能否配对成功，即 {{ 对 }}，{{{ 对 }}}
                        // 这里不能动 openBlockIndex 和 closeBlockIndex，因为等下要用他俩 slice
                        index = closeBlockIndex + 2;
                        // 这里要用 <=，因为很可能到头了
                        if (index <= length) {
                            if (index < length && charAt(content, index) === '}') {
                                if (blockMode === BLOCK_MODE_UNSAFE) {
                                    nextIndex = index + 1;
                                }
                            }
                            else {
                                if (blockMode === BLOCK_MODE_SAFE) {
                                    nextIndex = index;
                                }
                            }
                            code = trim(slice(content, openBlockIndex, closeBlockIndex));
                            // 不用处理 {{ }} 和 {{{ }}} 这种空 block
                            if (code) {
                                parseBlock(code);
                            }
                        }
                        else {
                            // 到头了
                            break;
                        }
                    }
                }
            }
        }
        else {
            blockMode = BLOCK_MODE_NONE;
            parseHtml(slice(content, nextIndex));
            break;
        }
    }
    return compileCache[content] = nodeList;
}

function isUndef (target) {
    return target === UNDEFINED;
}

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
var joinStack = [], 
// 是否正在收集子节点
collectStack = [], nodeStringify = {}, RENDER_SLOT = 'a', RENDER_EACH = 'b', RENDER_EXPRESSION = 'c', RENDER_EXPRESSION_ARG = 'd', RENDER_EXPRESSION_VNODE = 'e', RENDER_TEXT_VNODE = 'f', RENDER_ELEMENT_VNODE = 'g', RENDER_PARTIAL = 'h', RENDER_IMPORT = 'i', ARG_CONTEXT = 'j', SEP_COMMA = ',', SEP_COLON = ':', SEP_PLUS = '+', STRING_TRUE = '!0', STRING_FALSE = '!1', STRING_EMPTY = toJSON(EMPTY_STRING), CODE_RETURN = 'return ', CODE_PREFIX = "function(" + (join([
    RENDER_EXPRESSION,
    RENDER_EXPRESSION_ARG,
    RENDER_EXPRESSION_VNODE,
    RENDER_TEXT_VNODE,
    RENDER_ELEMENT_VNODE,
    RENDER_SLOT,
    RENDER_PARTIAL,
    RENDER_IMPORT,
    RENDER_EACH
], SEP_COMMA)) + "){return ", CODE_SUFFIX = "}";
// 表达式求值是否要求返回字符串类型
var isStringRequired;
function stringifyObject(obj) {
    var fields = [];
    each$2(obj, function (value, key) {
        if (isDef(value)) {
            push(fields, ("" + (toJSON(key)) + SEP_COLON + value));
        }
    });
    return ("{" + (join(fields, SEP_COMMA)) + "}");
}
function stringifyArray(arr) {
    return ("[" + (join(arr, SEP_COMMA)) + "]");
}
function stringifyCall(name, arg) {
    return (name + "(" + arg + ")");
}
function stringifyFunction(result, arg) {
    return ("function(" + (arg || EMPTY_STRING) + "){" + (result || EMPTY_STRING) + "}");
}
function stringifyGroup(code) {
    return ("(" + code + ")");
}
function stringifyExpression(renderName, expr, extra) {
    var args = [toJSON(expr)];
    if (extra) {
        push(args, extra);
    }
    return stringifyCall(renderName, join(args, SEP_COMMA));
}
function stringifyExpressionArg(expr) {
    return stringifyExpression(RENDER_EXPRESSION_ARG, expr, [ARG_CONTEXT]);
}
function stringifyValue(value, expr, children) {
    if (isDef(value)) {
        return toJSON(value);
    }
    // 只有一个表达式时，保持原始类型
    if (expr) {
        return stringifyExpression(RENDER_EXPRESSION, expr);
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
    var isJoin = children.length > 1 && !isComplex;
    push(joinStack, isJoin);
    var value = join(children.map(function (child) {
        return nodeStringify[child.type](child);
    }), isJoin ? SEP_PLUS : SEP_COMMA);
    pop(joinStack);
    return value;
}
function stringifyConditionChildren(children, isComplex) {
    if (children) {
        var result = stringifyChildren(children, isComplex);
        return children.length > 1 && isComplex
            ? stringifyGroup(result)
            : result;
    }
}
function stringifyIf(node, stub) {
    var children = node.children;
    var isComplex = node.isComplex;
    var next = node.next;
    var test = stringifyExpression(RENDER_EXPRESSION, node.expr), yes = stringifyConditionChildren(children, isComplex), no, result;
    if (next) {
        no = next.type === ELSE
            ? stringifyConditionChildren(next.children, next.isComplex)
            : stringifyIf(next, stub);
    }
    // 到达最后一个条件，发现第一个 if 语句带有 stub，需创建一个注释标签占位
    else if (stub) {
        no = renderElement(stringifyObject({
            isComment: STRING_TRUE,
            text: STRING_EMPTY,
        }));
    }
    if (isDef(yes) || isDef(no)) {
        result = test + "?" + (isDef(yes) ? yes : STRING_EMPTY) + ":" + (isDef(no) ? no : STRING_EMPTY);
        // 如果是连接操作，因为 ?: 优先级最低，因此要加 ()
        return last(joinStack)
            ? stringifyGroup(result)
            : result;
    }
    return STRING_EMPTY;
}
/**
 * 目的是 保证调用参数顺序稳定，减少运行时判断
 */
function trimArgs(list) {
    var args = [], removable = TRUE;
    each(list, function (arg) {
        if (isDef(arg)) {
            removable = FALSE;
            unshift(args, arg);
        }
        else if (!removable) {
            unshift(args, STRING_FALSE);
        }
    }, TRUE);
    return args;
}
function renderElement(data, attrs, childs, slots) {
    return stringifyCall(RENDER_ELEMENT_VNODE, join(trimArgs([data, attrs, childs, slots]), SEP_COMMA));
}
function getComponentSlots(children) {
    var slots = {}, addSlot = function (name, nodes) {
        if (!falsy(nodes)) {
            name = SLOT_DATA_PREFIX + name;
            push(slots[name] || (slots[name] = []), nodes);
        }
    };
    each(children, function (child) {
        // 找到具名 slot
        if (child.type === ELEMENT) {
            var element = child;
            if (element.slot) {
                addSlot(element.slot, element.children);
                return;
            }
        }
        // 匿名 slot，名称统一为 children
        addSlot('children', [child]);
    });
    each$2(slots, function (children, name) {
        // 强制为复杂节点，因为 slot 的子节点不能用字符串拼接的方式来渲染
        slots[name] = stringifyFunction(stringifyChildren(children, TRUE));
    });
    if (!falsy$2(slots)) {
        return stringifyObject(slots);
    }
}
nodeStringify[ELEMENT] = function (node) {
    var tag = node.tag;
    var isComponent = node.isComponent;
    var isSvg = node.isSvg;
    var isStyle = node.isStyle;
    var isStatic = node.isStatic;
    var isComplex = node.isComplex;
    var name = node.name;
    var ref = node.ref;
    var key = node.key;
    var html = node.html;
    var attrs = node.attrs;
    var children = node.children;
    var data = {}, elementAttrs = [], elementChilds, elementSlots, args;
    if (tag === RAW_SLOT) {
        args = [toJSON(SLOT_DATA_PREFIX + name)];
        if (children) {
            push(args, stringifyFunction(stringifyChildren(children, TRUE)));
        }
        return stringifyCall(RENDER_SLOT, join(args, SEP_COMMA));
    }
    push(collectStack, FALSE);
    if (attrs) {
        each(attrs, function (attr) {
            push(elementAttrs, nodeStringify[attr.type](attr));
        });
    }
    data.tag = toJSON(tag);
    if (isSvg) {
        data.isSvg = STRING_TRUE;
    }
    if (isStyle) {
        data.isStyle = STRING_TRUE;
    }
    if (isStatic) {
        data.isStatic = STRING_TRUE;
    }
    if (ref) {
        data.ref = stringifyValue(ref.value, ref.expr, ref.children);
    }
    if (key) {
        data.key = stringifyValue(key.value, key.expr, key.children);
    }
    if (html) {
        data.html = stringifyExpression(RENDER_EXPRESSION, html, [STRING_TRUE]);
    }
    if (isComponent) {
        data.isComponent = STRING_TRUE;
        if (children) {
            collectStack[collectStack.length - 1] = TRUE;
            elementSlots = getComponentSlots(children);
        }
    }
    else if (children) {
        isStringRequired = TRUE;
        collectStack[collectStack.length - 1] = isComplex;
        elementChilds = stringifyChildren(children, isComplex);
        if (isComplex) {
            elementChilds = stringifyFunction(elementChilds);
        }
        else {
            data.text = elementChilds;
            elementChilds = UNDEFINED;
        }
    }
    pop(collectStack);
    return renderElement(stringifyObject(data), falsy(elementAttrs)
        ? UNDEFINED
        : stringifyArray(elementAttrs), elementChilds || UNDEFINED, elementSlots);
};
nodeStringify[ATTRIBUTE] = function (node) {
    var result = {
        type: node.type,
        name: toJSON(node.name),
        binding: node.binding,
    };
    if (node.binding) {
        result.expr = toJSON(node.expr);
    }
    else {
        result.value = stringifyValue(node.value, node.expr, node.children);
    }
    return stringifyObject(result);
};
nodeStringify[PROPERTY] = function (node) {
    var result = {
        type: node.type,
        name: toJSON(node.name),
        hint: node.hint,
        binding: node.binding,
    };
    if (node.binding) {
        result.expr = toJSON(node.expr);
    }
    else {
        result.value = stringifyValue(node.value, node.expr, node.children);
    }
    return stringifyObject(result);
};
nodeStringify[DIRECTIVE] = function (node) {
    var type = node.type;
    var ns = node.ns;
    var value = node.value;
    var expr = node.expr;
    var result = {
        // renderer 遍历 attrs 要用 type
        type: type,
        ns: toJSON(ns),
        name: toJSON(node.name),
    };
    // 尽可能把表达式编译成函数，这样对外界最友好
    //
    // 众所周知，事件指令会编译成函数，对于自定义指令来说，也要尽可能编译成函数
    //
    // 比如 o-tap="method()" 或 o-log="{'id': '11'}"
    // 前者会编译成 handler（调用方法），后者会编译成 getter（取值）
    if (expr) {
        // 如果表达式明确是在调用方法，则序列化成 method + args 的形式
        if (expr.type === CALL) {
            // compiler 保证了函数调用的 name 是标识符
            result.method = toJSON(expr.name.name);
            // 为了实现运行时动态收集参数，这里序列化成函数
            if (!falsy(expr.args)) {
                // args 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
                result.args = stringifyFunction(CODE_RETURN + stringifyArray(expr.args.map(stringifyExpressionArg)), ARG_CONTEXT);
            }
        }
        else if (ns === DIRECTIVE_EVENT) {
            // compiler 保证了这里只能是标识符
            result.event = toJSON(expr.name);
        }
        // <input model="id">
        else if (ns === DIRECTIVE_MODEL) {
            result.expr = toJSON(expr);
        }
        else if (ns === DIRECTIVE_CUSTOM) {
            // 如果表达式是字面量，直接取值
            // 比如 o-log="1" 取出来就是数字 1
            if (expr.type === LITERAL) {
                result.value = toJSON(expr.value);
            }
            // 取值函数
            // getter 函数在触发事件时调用，调用时会传入它的作用域，因此这里要加一个参数
            else {
                result.getter = stringifyFunction(CODE_RETURN + stringifyExpressionArg(expr), ARG_CONTEXT);
            }
        }
    }
    // 比如写了一个 o-x="x"
    // 外部可能是想从数据读取 x 的值，也可能只是想直接取字面量 x
    if (isUndef(result.value) && isDef(value)) {
        result.value = toJSON(value);
    }
    return stringifyObject(result);
};
nodeStringify[SPREAD] = function (node) {
    return stringifyObject({
        type: node.type,
        expr: toJSON(node.expr),
        binding: node.binding,
    });
};
nodeStringify[TEXT] = function (node) {
    var result = toJSON(node.text);
    if (last(collectStack) && !last(joinStack)) {
        return stringifyCall(RENDER_TEXT_VNODE, result);
    }
    return result;
};
nodeStringify[EXPRESSION] = function (node) {
    // 强制保留 isStringRequired 参数，减少运行时判断参数是否存在
    // 因为还有 stack 参数呢，各种判断真的很累
    var renderName = RENDER_EXPRESSION, args = [isStringRequired ? STRING_TRUE : UNDEFINED];
    if (last(collectStack) && !last(joinStack)) {
        renderName = RENDER_EXPRESSION_VNODE;
    }
    return stringifyExpression(renderName, node.expr, trimArgs(args));
};
nodeStringify[IF] = function (node) {
    return stringifyIf(node, node.stub);
};
nodeStringify[EACH] = function (node) {
    var expr = toJSON(node.expr), index = node.index ? (", " + (toJSON(node.index))) : EMPTY_STRING, 
    // compiler 保证了 children 一定有值
    children = stringifyFunction(stringifyChildren(node.children, node.isComplex));
    return stringifyCall(RENDER_EACH, ("" + expr + index + "," + children));
};
nodeStringify[PARTIAL] = function (node) {
    var name = toJSON(node.name), 
    // compiler 保证了 children 一定有值
    children = stringifyFunction(stringifyChildren(node.children, node.isComplex));
    return stringifyCall(RENDER_PARTIAL, (name + "," + children));
};
nodeStringify[IMPORT] = function (node) {
    var name = toJSON(node.name);
    return stringifyCall(RENDER_IMPORT, ("" + name));
};
function stringify(node) {
    return CODE_PREFIX + nodeStringify[node.type](node) + CODE_SUFFIX;
}
function hasStringify(code) {
    return startsWith(code, CODE_PREFIX);
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
    var map = target[name] || (target[name] = {});
    map[key] = value;
}
function render(context, filters, partials, directives, transitions, template) {
    var $keypath = EMPTY_STRING, $scope = { $keypath: $keypath }, $stack = [$keypath, $scope], eventScope, vnodeStack = [], localPartials = {}, lookup = function (stack, index, key, node, depIgnore, defaultKeypath) {
        var keypath = join$1(stack[index], key), scope = stack[index + 1];
        node.ak = keypath;
        // 如果最后还是取不到值，用回最初的 keypath
        if (isUndef(defaultKeypath)) {
            defaultKeypath = keypath;
        }
        if (eventScope && has$2(eventScope, key)) {
            return eventScope[key];
        }
        // 如果取的是 scope 上直接有的数据，如 keypath
        if (has$2(scope, key)) {
            return scope[key];
        }
        // 如果取的是数组项，则要更进一步
        if (has$2(scope, '$item')) {
            scope = scope.$item;
            // 到这里 scope 可能为空
            // 比如 new Array(10) 然后遍历这个数组，每一项肯定是空
            // 取 this
            if (key === EMPTY_STRING) {
                return scope;
            }
            // 取 this.xx
            if (scope && has$2(scope, key)) {
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
            result = get(filters, key);
            if (!result) {
                node.ak = defaultKeypath;
                warn(("data [" + (node.raw) + "] is not found."));
                return;
            }
            result = result.value;
        }
        return result;
    }, getValue = function (expr, depIgnore, stack) {
        var renderStack = stack || $stack;
        var length = renderStack.length;
        return execute$1(expr, function (keypath, node) {
            return lookup(renderStack, length - 2 * ((node.offset || 0) + 1), keypath, node, depIgnore);
        }, context);
    }, addBinding = function (vnode, attr) {
        var expr = attr.expr;
        var value = getValue(expr, TRUE), key = join$1(DIRECTIVE_BINDING, attr.name), hooks = directives[DIRECTIVE_BINDING];
        if (hooks) {
            setPair(vnode, 'directives', key, {
                ns: DIRECTIVE_BINDING,
                name: attr.name,
                key: key,
                hooks: hooks,
                binding: expr.ak,
                hint: attr.hint,
            });
        }
        return value;
    }, spreadObject = function (vnode, attr) {
        var expr = attr.expr;
        var value = getValue(expr, attr.binding);
        // 数组也算一种对象，要排除掉
        if (object(value) && !array(value)) {
            each$2(value, function (value, key) {
                setPair(vnode, 'props', key, value);
            });
            var absoluteKeypath = expr.ak;
            if (absoluteKeypath) {
                var key = join$1(DIRECTIVE_BINDING, absoluteKeypath), hooks = directives[DIRECTIVE_BINDING];
                if (hooks) {
                    setPair(vnode, 'directives', key, {
                        ns: DIRECTIVE_BINDING,
                        name: EMPTY_STRING,
                        key: key,
                        hooks: hooks,
                        binding: join$1(absoluteKeypath, '*'),
                    });
                }
            }
        }
        else {
            warn(("[" + (expr.raw) + "] 不是对象，延展个毛啊"));
        }
    }, addDirective = function (vnode, attr) {
        var ns = attr.ns;
        var name = attr.name;
        var value = attr.value;
        var key = join$1(ns, name), binding, hooks, getter, handler, transition;
        switch (ns) {
            case DIRECTIVE_EVENT:
                hooks = directives[DIRECTIVE_EVENT];
                handler = attr.event
                    ? createEventListener(attr.event)
                    : createMethodListener(attr.method, attr.args, $stack);
                break;
            case RAW_TRANSITION:
                transition = transitions[value];
                if (transition) {
                    vnode.transition = transition;
                }
                return;
            case DIRECTIVE_MODEL:
                hooks = directives[DIRECTIVE_MODEL];
                vnode.model = getValue(attr.expr, TRUE);
                binding = attr.expr.ak;
                break;
            case DIRECTIVE_LAZY:
                setPair(vnode, 'lazy', name, value);
                return;
            default:
                hooks = directives[name];
                if (attr.method) {
                    handler = createMethodListener(attr.method, attr.args, $stack);
                }
                else if (attr.getter) {
                    getter = createGetter(attr.getter, $stack);
                }
                break;
        }
        if (hooks) {
            setPair(vnode, 'directives', key, {
                ns: ns,
                name: name,
                key: key,
                value: value,
                binding: binding,
                hooks: hooks,
                getter: getter,
                handler: handler
            });
        }
    }, createEventListener = function (type) {
        return function (event, data) {
            context.fire(new CustomEvent(type, event), data);
        };
    }, createMethodListener = function (method, args, stack) {
        return function (event, data) {
            var callee = context[method];
            if (event instanceof CustomEvent) {
                var result;
                if (args) {
                    // 给当前 scope 加上 event 和 data
                    eventScope = {
                        $event: event,
                        $data: data,
                    };
                    result = execute(callee, context, args(stack));
                    // 阅后即焚
                    eventScope = UNDEFINED;
                }
                else {
                    result = execute(callee, context, data ? [event, data] : event);
                }
                if (result === FALSE) {
                    event.prevent().stop();
                }
            }
            else {
                execute(callee, context, args ? args(stack) : UNDEFINED);
            }
        };
    }, createGetter = function (getter, stack) {
        return function () {
            return getter(stack);
        };
    }, renderExpression = function (expr, stringRequired) {
        var value = getValue(expr);
        return stringRequired
            ? toString$1(value)
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
                push(vnodeList, {
                    isText: TRUE,
                    text: text,
                    context: context,
                    keypath: $keypath,
                });
            }
        }
    }, renderElementVnode = function (vnode, attrs, childs, slots) {
        if (attrs) {
            each(attrs, function (attr) {
                var name = attr.name;
                var value = attr.value;
                switch (attr.type) {
                    case ATTRIBUTE:
                        if (attr.binding) {
                            value = addBinding(vnode, attr);
                        }
                        if (vnode.isComponent) {
                            setPair(vnode, 'props', name, value);
                        }
                        else {
                            setPair(vnode, 'nativeAttrs', name, { name: name, value: value });
                        }
                        break;
                    case PROPERTY:
                        setPair(vnode, 'nativeProps', name, {
                            name: name,
                            value: attr.binding ? addBinding(vnode, attr) : value,
                            hint: attr.hint,
                        });
                        break;
                    case DIRECTIVE:
                        addDirective(vnode, attr);
                        break;
                    case SPREAD:
                        spreadObject(vnode, attr);
                        break;
                }
            });
            // 确保有 directives 就必然有 lazy
            if (vnode.directives && !vnode.lazy) {
                vnode.lazy = EMPTY_OBJECT;
            }
        }
        // childs 和 slots 不可能同时存在
        if (childs) {
            vnodeStack.push(vnode.children = []);
            childs();
            pop(vnodeStack);
        }
        else if (slots) {
            var renderSlots = {};
            each$2(slots, function (slot, name) {
                vnodeStack.push([]);
                slot();
                renderSlots[name] = pop(vnodeStack);
            });
            vnode.slots = renderSlots;
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
        if (vnodes) {
            each(vnodes, function (vnode) {
                push(vnodeList, vnode);
                vnode.parent = context;
            });
        }
        else if (defaultRender) {
            defaultRender();
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
            return;
        }
        else {
            var partial = partials[name];
            if (partial) {
                partial(renderExpression, renderExpressionArg, renderExpressionVnode, renderTextVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach);
                return;
            }
        }
    }, renderEach = function (expr, index, handler) {
        var eachIndex, eachHandler;
        if (func(index)) {
            eachHandler = index;
            eachIndex = UNDEFINED;
        }
        else {
            eachHandler = handler;
            eachIndex = index;
        }
        var value = getValue(expr), exprKeypath = expr['ak'], eachKeypath = exprKeypath || join$1($keypath, expr.raw), callback = function (item, key) {
            var lastKeypath = $keypath, lastScope = $scope, lastKeypathStack = $stack;
            $keypath = join$1(eachKeypath, toString$1(key));
            $scope = {};
            $stack = copy($stack);
            push($stack, $keypath);
            push($stack, $scope);
            // 从下面这几句赋值可以看出
            // scope 至少会有 '$keypath' '$item' eachIndex 等几个值
            $scope.$keypath = $keypath;
            // 类似 {{#each 1 -> 10}} 这样的临时循环，需要在 scope 上加上当前项
            // 因为通过 context.get() 无法获取数据
            if (!exprKeypath) {
                $scope.$item = item;
            }
            if (eachIndex) {
                $scope[eachIndex] = key;
            }
            eachHandler(item, key);
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
    return template(renderExpression, renderExpressionArg, renderExpressionVnode, renderTextVnode, renderElementVnode, renderSlot, renderPartial, renderImport, renderEach);
}

/**
 * 计算属性
 *
 * 可配置 cache、deps、get、set 等
 */
var Computed = function Computed(keypath, sync, cache, deps, observer, getter, setter) {
    var instance = this;
    instance.keypath = keypath;
    instance.cache = cache;
    // 因为可能会修改 deps，所以这里创建一个自己的对象，避免影响外部传入的 deps
    instance.deps = [];
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
            instance.add(dep);
        });
        instance.bind();
    }
};
/**
 * 读取计算属性的值
 *
 * @param force 是否强制刷新缓存
 */
Computed.build = function build (keypath, observer, options) {
    var cache = TRUE, sync = TRUE, deps = EMPTY_ARRAY, getter, setter;
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
        if (array(options.deps)) {
            deps = options.deps;
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

Computed.prototype.get = function get (force) {
    var instance = this;
        var getter = instance.getter;
        var context = instance.context;
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
Computed.prototype.set = function set (value) {
    var ref = this;
        var setter = ref.setter;
        var context = ref.context;
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
Computed.prototype.add = function add (dep) {
    this.unique[dep] = TRUE;
};
/**
 * 绑定依赖
 */
Computed.prototype.bind = function bind () {
    var ref = this;
        var unique = ref.unique;
        var deps = ref.deps;
        var observer = ref.observer;
        var watcherOptions = ref.watcherOptions;
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
Computed.prototype.unbind = function unbind () {
    var ref = this;
        var deps = ref.deps;
        var observer = ref.observer;
        var watcher = ref.watcher;
    each(deps, function (dep) {
        observer.unwatch(dep, watcher);
    }, TRUE);
    deps.length = 0;
};

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
            callback(("" + i), newValue ? newValue[i] : UNDEFINED, oldValue ? oldValue[i] : UNDEFINED);
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
            var newKeypath = join$1(keypath, subKeypath);
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
function filterWatcher (options, data) {
    if (options.count && data) {
        // 采用计数器的原因是，同一个 options 可能执行多次
        // 比如监听 user.*，如果同批次修改了 user.name 和 user.age
        // 这个监听器会调用多次，如果第一次执行就把 count 干掉了，第二次就无法执行了
        options.count--;
        // 新旧值不相等
        return data[0] !== data[1];
    }
}

/**
 * 格式化 watch options
 *
 * @param options
 */
function formatWatcherOptions (options, immediate) {
    if (func(options)) {
        return {
            watcher: options,
            immediate: immediate === TRUE,
        };
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
var Observer = function Observer(data, context) {
    var instance = this;
    instance.data = data || {};
    instance.context = context || instance;
    instance.nextTask = new NextTask();
    instance.syncEmitter = new Emitter();
    instance.asyncEmitter = new Emitter();
    instance.asyncChanges = {};
};
/**
 * 获取数据
 *
 * @param keypath
 * @param defaultValue
 * @param depIgnore
 * @return
 */
Observer.prototype.get = function get$1 (keypath, defaultValue, depIgnore) {
    var instance = this, currentComputed = Computed.current;
        var data = instance.data;
        var computed = instance.computed;
        var reversedComputedKeys = instance.reversedComputedKeys;
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
Observer.prototype.set = function set$1 (keypath, value) {
    var instance = this;
        var data = instance.data;
        var computed = instance.computed;
        var reversedComputedKeys = instance.reversedComputedKeys;
        var setValue = function (newValue, keypath) {
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
                        if (object(targetValue) || array(targetValue)) {
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
Observer.prototype.diff = function diff (keypath, newValue, oldValue) {
    var instance = this;
        var syncEmitter = instance.syncEmitter;
        var asyncEmitter = instance.asyncEmitter;
        var asyncChanges = instance.asyncChanges;
        var isRecursive = codeAt(keypath) !== 36;
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
        var ref = asyncChanges[keypath] || (asyncChanges[keypath] = { value: oldValue, list: [] });
            var list = ref.list;
        if (!has(list, watchKeypath)) {
            push(list, watchKeypath);
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
Observer.prototype.diffAsync = function diffAsync () {
    var instance = this;
        var asyncEmitter = instance.asyncEmitter;
        var asyncChanges = instance.asyncChanges;
    instance.asyncChanges = {};
    each$2(asyncChanges, function (item, keypath) {
        var args = [instance.get(keypath), item.value, keypath];
        // 不能在这判断新旧值是否相同，相同就不 fire
        // 因为前面标记了 count，在这中断会导致 count 无法清除
        each(item.list, function (watchKeypath) {
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
Observer.prototype.addComputed = function addComputed (keypath, options) {
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
Observer.prototype.removeComputed = function removeComputed (keypath) {
    var instance = this;
        var computed = instance.computed;
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
Observer.prototype.watch = function watch (keypath, watcher, immediate) {
    var instance = this;
        var context = instance.context;
        var syncEmitter = instance.syncEmitter;
        var asyncEmitter = instance.asyncEmitter;
        var bind = function (keypath, options) {
        var emitter = options.sync ? syncEmitter : asyncEmitter, 
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
    each$2(keypath, function (value, keypath) {
        bind(keypath, formatWatcherOptions(value));
    });
};
/**
 * 取消监听数据变化
 *
 * @param keypath
 * @param watcher
 */
Observer.prototype.unwatch = function unwatch (keypath, watcher) {
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
Observer.prototype.toggle = function toggle (keypath) {
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
Observer.prototype.increase = function increase (keypath, step, max) {
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
Observer.prototype.decrease = function decrease (keypath, step, min) {
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
Observer.prototype.insert = function insert (keypath, item, index) {
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
Observer.prototype.append = function append (keypath, item) {
    return this.insert(keypath, item, TRUE);
};
/**
 * 在数组首部添加元素
 *
 * @param keypath
 * @param item
 */
Observer.prototype.prepend = function prepend (keypath, item) {
    return this.insert(keypath, item, FALSE);
};
/**
 * 通过索引移除数组中的元素
 *
 * @param keypath
 * @param index
 */
Observer.prototype.removeAt = function removeAt (keypath, index) {
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
Observer.prototype.remove = function remove$1 (keypath, item) {
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
Observer.prototype.copy = function copy$1 (data, deep) {
    return copy(data, deep);
};
/**
 * 销毁
 */
Observer.prototype.destroy = function destroy () {
    var instance = this;
    instance.syncEmitter.off();
    instance.asyncEmitter.off();
    instance.nextTask.clear();
    clear(instance);
};

var doc$1 = doc, 
// 这里先写 IE9 支持的接口
innerText = 'textContent', findElement = function (selector) {
    var node = doc$1.querySelector(selector);
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
if (doc$1) {
    if (!doc$1.body.classList) {
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
    // 为 IE9 以下浏览器打补丁
    {
        if (!doc$1.addEventListener) {
            var PROPERTY_CHANGE = 'propertychange';
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
                    node.attachEvent(("on" + type), listener);
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
                    node.detachEvent(("on" + type), listener);
                }
            };
            function isBoxElement(node) {
                return node.tagName === 'INPUT'
                    && (node.type === 'radio' || node.type === 'checkbox');
            }
            var IEEvent = function IEEvent(event, element) {
                extend(this, event);
                this.currentTarget = element;
                this.target = event.srcElement || element;
                this.originalEvent = event;
            };
            IEEvent.prototype.preventDefault = function preventDefault () {
                this.originalEvent.returnValue = FALSE;
            };
            IEEvent.prototype.stopPropagation = function stopPropagation () {
                this.originalEvent.cancelBubble = TRUE;
            };
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
                var node = doc$1.getElementById(selector);
                if (node) {
                    return node;
                }
            };
        }
    }
}
var CHAR_WHITESPACE = ' ', 
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
}, specialEvents = {}, domApi = {
    createElement: function createElement(tag, isSvg) {
        return isSvg
            ? doc$1.createElementNS(namespaces.svg, tag)
            : doc$1.createElement(tag);
    },
    createText: function createText(text) {
        return doc$1.createTextNode(text);
    },
    createComment: function createComment(text) {
        return doc$1.createComment(text);
    },
    prop: function prop(node, name, value) {
        if (isDef(value)) {
            set(node, name, value, FALSE);
        }
        else {
            return get(node, name);
        }
    },
    removeProp: function removeProp(node, name, hint) {
        set(node, name, hint === HINT_BOOLEAN
            ? FALSE
            : EMPTY_STRING, FALSE);
    },
    attr: function attr(node, name, value) {
        if (isDef(value)) {
            node.setAttribute(name, value);
        }
        else {
            // value 还可能是 null
            var value$1 = node.getAttribute(name);
            if (value$1 != NULL) {
                return value$1;
            }
        }
    },
    removeAttr: function removeAttr(node, name) {
        node.removeAttribute(name);
    },
    before: function before(parentNode, node, referenceNode) {
        parentNode.insertBefore(node, referenceNode);
    },
    append: function append(parentNode, node) {
        parentNode.appendChild(node);
    },
    replace: function replace(parentNode, node, oldNode) {
        parentNode.replaceChild(node, oldNode);
    },
    remove: function remove(parentNode, node) {
        parentNode.removeChild(node);
    },
    parent: function parent(node) {
        var parentNode = node.parentNode;
        if (parentNode) {
            return parentNode;
        }
    },
    next: function next(node) {
        var nextSibling = node.nextSibling;
        if (nextSibling) {
            return nextSibling;
        }
    },
    find: findElement,
    tag: function tag(node) {
        if (node.nodeType === 1) {
            return node.tagName.toLowerCase();
        }
    },
    text: function text(node, text$1, isStyle) {
        if (isDef(text$1)) {
            {
                if (isStyle && isDef(node[STYLE_SHEET])) {
                    node[STYLE_SHEET].cssText = text$1;
                }
                else {
                    node[innerText] = text$1;
                }
            }
        }
        else {
            return node[innerText];
        }
    },
    html: function html(node, html$1, isStyle) {
        if (isDef(html$1)) {
            {
                if (isStyle && isDef(node[STYLE_SHEET])) {
                    node[STYLE_SHEET].cssText = html$1;
                }
                else {
                    node.innerHTML = html$1;
                }
            }
        }
        else {
            return node.innerHTML;
        }
    },
    addClass: addClass,
    removeClass: removeClass,
    on: function on(node, type, listener, context) {
        var emitter = node[EMITTER] || (node[EMITTER] = new Emitter()), nativeListeners = emitter.nativeListeners || (emitter.nativeListeners = {});
        // 一个元素，相同的事件，只注册一个 native listener
        if (!nativeListeners[type]) {
            // 特殊事件
            var special = specialEvents[type], 
            // 唯一的原生监听器
            nativeListener = function (event) {
                emitter.fire(event instanceof CustomEvent
                    ? event
                    : new CustomEvent(event.type, createEvent(event, node)));
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
    },
    off: function off(node, type, listener) {
        var emitter = node[EMITTER];
        var listeners = emitter.listeners;
        var nativeListeners = emitter.nativeListeners;
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
    specialEvents: specialEvents
};
specialEvents[EVENT_MODEL] = {
    on: function on(node, listener) {
        var locked = FALSE;
        domApi.on(node, COMPOSITION_START, listener[COMPOSITION_START] = function () {
            locked = TRUE;
        });
        domApi.on(node, COMPOSITION_END, listener[COMPOSITION_END] = function (event) {
            locked = FALSE;
            listener(new CustomEvent(EVENT_MODEL, event));
        });
        addEventListener(node, EVENT_INPUT, listener[EVENT_INPUT] = function (event) {
            if (!locked) {
                listener(new CustomEvent(EVENT_MODEL, event));
            }
        });
    },
    off: function off(node, listener) {
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
            var args = toArray(arguments);
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

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
var immediateTypes = toObject([EVENT_CLICK, EVENT_TAP]), directive = {
    bind: function bind(node, directive, vnode) {
        var name = directive.name;
        var handler = directive.handler;
        var lazy = vnode.lazy[name] || vnode.lazy[EMPTY_STRING];
        if (!handler) {
            return;
        }
        if (lazy) {
            // 编译模板时能保证不是 true 就是大于 0 数字
            if (lazy === TRUE) {
                name = EVENT_CHANGE;
            }
            else {
                handler = debounce(handler, lazy, immediateTypes[name]);
            }
        }
        if (vnode.isComponent) {
            var component = node;
            component.on(name, handler);
            vnode.data[directive.key] = function () {
                component.off(name, handler);
            };
        }
        else {
            var el = node;
            domApi.on(el, name, handler);
            vnode.data[directive.key] = function () {
                domApi.off(el, name, handler);
            };
        }
    },
    unbind: function unbind(node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

function getOptionValue(option) {
    return isDef(option.value)
        ? option.value
        : option.text;
}
var inputControl = {
    set: function set(input, keypath, context) {
        input.value = toString$1(context.get(keypath));
    },
    sync: function sync(input, keypath, context) {
        context.set(keypath, input.value);
    },
    name: RAW_VALUE
}, selectControl = {
    set: function set(select, keypath, context) {
        var value = context.get(keypath);
        each(toArray(select.options), select.multiple
            ? function (option) {
                option.selected = has(value, getOptionValue(option), FALSE);
            }
            : function (option, index) {
                if (getOptionValue(option) == value) {
                    select.selectedIndex = index;
                    return FALSE;
                }
            });
    },
    sync: function sync(select, keypath, context) {
        var options = toArray(select.options);
        if (select.multiple) {
            var values = [];
            each(options, function (option) {
                if (option.selected) {
                    push(values, getOptionValue(option));
                }
            });
            // 如果新旧值都是 []，set 没有意义
            if (!falsy(values) || !falsy(context.get(keypath))) {
                context.set(keypath, values);
            }
        }
        else {
            context.set(keypath, getOptionValue(options[select.selectedIndex]));
        }
    },
    name: RAW_VALUE
}, radioControl = {
    set: function set(radio, keypath, context) {
        radio.checked = radio.value === toString$1(context.get(keypath));
    },
    sync: function sync(radio, keypath, context) {
        if (radio.checked) {
            context.set(keypath, radio.value);
        }
    },
    name: 'checked'
}, checkboxControl = {
    set: function set(checkbox, keypath, context) {
        var value = context.get(keypath);
        checkbox.checked = array(value)
            ? has(value, checkbox.value, FALSE)
            : (boolean(value) ? value : !!value);
    },
    sync: function sync(checkbox, keypath, context) {
        var value = context.get(keypath);
        if (array(value)) {
            if (checkbox.checked) {
                context.append(keypath, checkbox.value);
            }
            else {
                context.removeAt(keypath, indexOf(value, checkbox.value, FALSE));
            }
        }
        else {
            context.set(keypath, checkbox.checked);
        }
    },
    name: 'checked'
}, componentControl = {
    set: function set(component, keypath, context) {
        component.set(component.$model, context.get(keypath));
    },
    sync: function sync(component, keypath, context) {
        context.set(keypath, component.get(component.$model));
    },
    name: RAW_VALUE
}, specialControls = {
    radio: radioControl,
    checkbox: checkboxControl,
    select: selectControl,
}, directive$1 = {
    bind: function bind(node, directive, vnode) {
        var binding = directive.binding;
        var context = vnode.context;
        var lazy = vnode.lazy[DIRECTIVE_MODEL] || vnode.lazy[EMPTY_STRING], set = function () {
            if (!isSyncing) {
                control.set(component || element, binding, context);
            }
        }, sync = function () {
            isSyncing = TRUE;
            control.sync(component || element, binding, context);
            isSyncing = FALSE;
        }, isSyncing = FALSE, component, element, control, type;
        if (lazy && lazy !== TRUE) {
            sync = debounce(sync, lazy);
        }
        if (vnode.isComponent) {
            component = node;
            control = componentControl;
            // 监听交互，修改数据
            component.watch(component.$model, sync);
        }
        else {
            element = node;
            control = specialControls[element[RAW_TYPE]] || specialControls[domApi.tag(element)];
            // checkbox,radio,select 监听的是 change 事件
            type = EVENT_CHANGE;
            // 如果是输入框，则切换成 model 事件
            // model 事件是个 yox-dom 实现的特殊事件
            // 不会在输入法组合文字过程中得到触发事件
            if (!control) {
                control = inputControl;
                if (lazy !== TRUE) {
                    type = EVENT_MODEL;
                }
            }
            // 不管模板是否设值，统一用数据中的值
            set();
            // 监听交互，修改数据
            domApi.on(element, type, sync);
        }
        // 监听数据，修改界面
        // 这里使用同步监听，这样才能使 isSyncing 生效
        context.watch(binding, {
            watcher: set,
            sync: TRUE
        });
        vnode.data[directive.key] = function () {
            if (vnode.isComponent) {
                component.unwatch(component.$model, sync);
            }
            else {
                domApi.off(element, type, sync);
            }
            context.unwatch(binding, set);
        };
    },
    unbind: function unbind(node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

var directive$2 = {
    bind: function bind(node, directive, vnode) {
        // binding 可能是模糊匹配
        // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
        var binding = directive.binding;
        if (binding) {
            var isFuzzy$1 = isFuzzy(binding), watcher = function (newValue, oldValue, keypath) {
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
        }
    },
    unbind: function unbind(node, directive, vnode) {
        execute(vnode.data[directive.key]);
    }
};

/**
 * 组件是否存在某个 slot
 *
 * @param name
 */
function hasSlot (name) {
    return isDef(this.get(SLOT_DATA_PREFIX + name));
}

var globalDirectives = {}, globalTransitions = {}, globalComponents = {}, globalPartials = {}, globalFilters = {}, TEMPLATE_COMPUTED = '$' + RAW_TEMPLATE, selectorPattern = /^[#.][-\w+]+$/;
var Yox = function Yox(options) {
    var instance = this;
    if (!object(options)) {
        options = EMPTY_OBJECT;
    }
    // 如果不绑着，其他方法调不到钩子
    instance.$options = options;
    execute(options[HOOK_BEFORE_CREATE], instance, options);
    var el = options.el;
    var data = options.data;
    var props = options.props;
    var model = options.model;
    var parent = options.parent;
    var replace = options.replace;
    var computed = options.computed;
    var template = options.template;
    var transitions = options.transitions;
    var components = options.components;
    var directives = options.directives;
    var partials = options.partials;
    var filters = options.filters;
    var slots = options.slots;
    var events = options.events;
    var methods = options.methods;
    var watchers = options.watchers;
    var extensions = options.extensions;
    if (extensions) {
        extend(instance, extensions);
    }
    if (model) {
        instance.$model = model;
    }
    // 数据源
    var source = props
        ? instance.checkPropTypes(props)
        : {};
    // 把 slots 放进数据里，方便 get
    if (slots) {
        extend(source, slots);
    }
    // 如果传了 props，则 data 应该是个 function
    if (props && object(data)) {
        warn('"data" option expected to be a function.');
    }
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
            if (has$2(source, key)) {
                warn(("\"" + key + "\" is already defined as a prop. Use prop default value instead."));
            }
            else {
                source[key] = value;
            }
        });
    }
    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(TRUE);
    var placeholder, isComment = FALSE;
    {
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
        }
        if (placeholder && !replace) {
            // 如果不是替换占位元素
            // 则在该元素下新建一个注释节点，等会用新组件替换掉
            isComment = TRUE;
            domApi.append(placeholder, placeholder = domApi.createComment(EMPTY_STRING));
        }
        if (parent) {
            instance.$parent = parent;
        }
        setFlexibleOptions(instance, RAW_TRANSITION, transitions);
        setFlexibleOptions(instance, RAW_COMPONENT, components);
        setFlexibleOptions(instance, RAW_DIRECTIVE, directives);
        setFlexibleOptions(instance, RAW_PARTIAL, partials);
        setFlexibleOptions(instance, RAW_FILTER, filters);
    }
    if (methods) {
        each$2(methods, function (method, name) {
            instance[name] = method;
        });
    }
    execute(options[HOOK_AFTER_CREATE], instance);
    {
        // 当存在模板和计算属性时
        // 因为这里把模板当做一种特殊的计算属性
        // 因此模板这个计算属性的优先级应该最高
        if (template) {
            // 编译模板
            // 在开发阶段，template 是原始的 html 模板
            // 在产品阶段，template 是编译后且经过 stringify 的字符串
            // 当然，这个需要外部自己控制传入的 template 是什么
            // Yox.compile 会自动判断 template 是否经过编译
            instance.$template = Yox.compile(template);
            // 当模板的依赖变了，则重新创建 virtual dom
            observer.addComputed(TEMPLATE_COMPUTED, {
                // 当模板依赖变化时，异步通知模板更新
                sync: FALSE,
                get: function () {
                    return instance.render();
                }
            });
            // 拷贝一份，避免影响外部定义的 watchers
            watchers = watchers
                ? copy(watchers)
                : {};
            // 当 virtual dom 变了，则更新视图
            watchers[TEMPLATE_COMPUTED] = function (vnode) {
                instance.update(vnode, instance.$vnode);
            };
            // 第一次渲染视图
            if (!placeholder) {
                isComment = TRUE;
                placeholder = domApi.createComment(EMPTY_STRING);
            }
            instance.update(instance.get(TEMPLATE_COMPUTED), create(domApi, placeholder, isComment, instance, EMPTY_STRING));
        }
    }
    if (events) {
        instance.on(events);
    }
    // 确保早于 AFTER_MOUNT 执行
    if (watchers) {
        observer.nextTask.prepend(function () {
            if (instance.$observer) {
                instance.watch(watchers);
            }
        });
    }
};
/**
 * 安装插件
 *
 * 插件必须暴露 install 方法
 */
Yox.use = function use (plugin) {
    plugin.install(Yox);
};
/**
 * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
 */
Yox.nextTick = function nextTick (task) {
    NextTask.shared().append(task);
};
/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 */
Yox.compile = function compile (template, stringify$1) {
    {
        {
            if (!hasStringify(template)) {
                // 未编译，常出现在开发阶段
                var nodes = compile$1(template);
                template = stringify(nodes[0]);
                if (stringify$1) {
                    return template;
                }
            }
        }
        return new Function(("return " + template))();
    }
};
Yox.directive = function directive (name, directive$1) {
    {
        if (string(name) && !directive$1) {
            return getResource(globalDirectives, name);
        }
        setResource(globalDirectives, name, directive$1);
    }
};
Yox.transition = function transition (name, transition$1) {
    {
        if (string(name) && !transition$1) {
            return getResource(globalTransitions, name);
        }
        setResource(globalTransitions, name, transition$1);
    }
};
Yox.component = function component (name, component$1) {
    {
        if (string(name)) {
            // 同步取值
            if (!component$1) {
                return getResource(globalComponents, name);
            }
            else if (func(component$1)) {
                getComponentAsync(globalComponents, name, component$1);
                return;
            }
        }
        setResource(globalComponents, name, component$1);
    }
};
Yox.partial = function partial (name, partial$1) {
    {
        if (string(name) && !partial$1) {
            return getResource(globalPartials, name);
        }
        setResource(globalPartials, name, partial$1, Yox.compile);
    }
};
Yox.filter = function filter (name, filter$1) {
    {
        if (string(name) && !filter$1) {
            return getResource(globalFilters, name);
        }
        setResource(globalFilters, name, filter$1);
    }
};
/**
 * 验证 props，无爱请重写
 */
Yox.checkPropTypes = function checkPropTypes (props, propTypes) {
    var result = copy(props);
    each$2(propTypes, function (rule, key) {
        // 类型
        var type = rule.type, 
        // 默认值
        value = rule.value, 
        // 是否必传
        required = rule.required, 
        // 实际的值
        actual = props[key];
        // 动态化获取是否必填
        if (func(required)) {
            required = required(props);
        }
        // 传了数据
        if (isDef(actual)) {
            // 如果不写 type 或 type 不是 字符串 或 数组
            // 就当做此规则无效，和没写一样
            if (type) {
                var matched;
                // 比较类型
                if (!falsy$1(type)) {
                    matched = is(actual, type);
                }
                else if (!falsy(type)) {
                    each(type, function (t) {
                        if (is(actual, t)) {
                            matched = TRUE;
                            return FALSE;
                        }
                    });
                }
                if (matched !== TRUE) {
                    warn(("The prop \"" + key + "\" type is not matched."));
                }
            }
            else {
                warn(("The prop \"" + key + "\" in propTypes has no type."));
            }
        }
        // 没传值但此项是必传项
        else if (required) {
            warn(("The prop \"" + key + "\" is marked as required, but its value is not found."));
        }
        // 没传值但是配置了默认值
        else if (isDef(value)) {
            result[key] = type === RAW_FUNCTION
                ? value
                : (func(value) ? value(props) : value);
        }
    });
    return result;
};
/**
 * 添加计算属性
 */
Yox.prototype.addComputed = function addComputed (keypath, computed) {
    return this.$observer.addComputed(keypath, computed);
};
/**
 * 删除计算属性
 */
Yox.prototype.removeComputed = function removeComputed (keypath) {
    this.$observer.removeComputed(keypath);
};
/**
 * 取值
 */
Yox.prototype.get = function get (keypath, defaultValue, depIgnore) {
    return this.$observer.get(keypath, defaultValue, depIgnore);
};
/**
 * 设值
 */
Yox.prototype.set = function set (keypath, value) {
    // 组件经常有各种异步改值，为了避免组件销毁后依然调用 set
    // 这里判断一下，至于其他方法的异步调用就算了，业务自己控制吧
    var ref = this;
        var $observer = ref.$observer;
    if ($observer) {
        $observer.set(keypath, value);
    }
};
/**
 * 监听事件
 */
Yox.prototype.on = function on (type, listener) {
    this.$emitter.on(type, listener, { ctx: this });
    return this;
};
/**
 * 监听一次事件
 */
Yox.prototype.once = function once (type, listener) {
    this.$emitter.on(type, listener, { ctx: this, max: 1 });
    return this;
};
/**
 * 取消监听事件
 */
Yox.prototype.off = function off (type, listener) {
    this.$emitter.off(type, listener);
    return this;
};
/**
 * 触发事件
 */
Yox.prototype.fire = function fire (bullet, data, downward) {
    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件
    var instance = this, event = bullet instanceof CustomEvent ? bullet : new CustomEvent(bullet), eventData, isComplete;
    // 告诉外部是谁发出的事件
    if (!event.target) {
        event.target = instance;
    }
    // 比如 fire('name', true) 直接向下发事件
    if (object(data)) {
        eventData = data;
    }
    else if (data === TRUE) {
        downward = TRUE;
    }
    isComplete = instance.$emitter.fire(event, eventData);
    if (isComplete) {
        if (downward) {
            if (instance.$children) {
                each(instance.$children, function (child) {
                    return isComplete = child.fire(event, data, TRUE);
                });
            }
        }
        else if (instance.$parent) {
            isComplete = instance.$parent.fire(event, data);
        }
    }
    return isComplete;
};
/**
 * 监听数据变化
 */
Yox.prototype.watch = function watch (keypath, watcher, immediate) {
    this.$observer.watch(keypath, watcher, immediate);
    return this;
};
/**
 * 取消监听数据变化
 */
Yox.prototype.unwatch = function unwatch (keypath, watcher) {
    this.$observer.unwatch(keypath, watcher);
    return this;
};
Yox.prototype.directive = function directive (name, directive$1) {
    {
        var instance = this;
            var $directives = instance.$directives;
        if (string(name) && !directive$1) {
            return getResource($directives, name, Yox.directive);
        }
        setResource($directives || (instance.$directives = {}), name, directive$1);
    }
};
Yox.prototype.transition = function transition (name, transition$1) {
    {
        var instance = this;
            var $transitions = instance.$transitions;
        if (string(name) && !transition$1) {
            return getResource($transitions, name, Yox.transition);
        }
        setResource($transitions || (instance.$transitions = {}), name, transition$1);
    }
};
Yox.prototype.component = function component (name, component$1) {
    {
        var instance = this;
            var $components = instance.$components;
        if (string(name)) {
            // 同步取值
            if (!component$1) {
                return getResource($components, name, Yox.component);
            }
            else if (func(component$1)) {
                if (!getComponentAsync($components, name, component$1)) {
                    getComponentAsync(globalComponents, name, component$1);
                }
                return;
            }
        }
        setResource($components || (instance.$components = {}), name, component$1);
    }
};
Yox.prototype.partial = function partial (name, partial$1) {
    {
        var instance = this;
            var $partials = instance.$partials;
        if (string(name) && !partial$1) {
            return getResource($partials, name, Yox.partial);
        }
        setResource($partials || (instance.$partials = {}), name, partial$1, Yox.compile);
    }
};
Yox.prototype.filter = function filter (name, filter$1) {
    {
        var instance = this;
            var $filters = instance.$filters;
        if (string(name) && !filter$1) {
            return getResource($filters, name, Yox.filter);
        }
        setResource($filters || (instance.$filters = {}), name, filter$1);
    }
};
/**
 * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
 * 而你非常确定需要更新模板，强制刷新正是你需要的
 */
Yox.prototype.forceUpdate = function forceUpdate () {
    {
        var instance = this;
            var $vnode = instance.$vnode;
            var $observer = instance.$observer;
        if ($vnode) {
            var computed = $observer.computed[TEMPLATE_COMPUTED], oldValue = computed.get();
            // 当前可能正在进行下一轮更新
            $observer.nextTask.run();
            // 没有更新模板，强制刷新
            if (oldValue === computed.get()) {
                instance.update(computed.get(TRUE), $vnode);
            }
        }
    }
};
/**
 * 把模板抽象语法树渲染成 virtual dom
 */
Yox.prototype.render = function render$1 () {
    {
        var instance = this;
        return render(instance, mergeResource(instance.$filters, globalFilters), mergeResource(instance.$partials, globalPartials), mergeResource(instance.$directives, globalDirectives), mergeResource(instance.$transitions, globalTransitions), instance.$template);
    }
};
/**
 * 更新 virtual dom
 *
 * @param vnode
 * @param oldVnode
 */
Yox.prototype.update = function update (vnode, oldVnode) {
    {
        var instance = this;
            var $vnode = instance.$vnode;
            var $options = instance.$options;
            var hook;
        // 每次渲染重置 refs
        // 在渲染过程中收集最新的 ref
        // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
        instance.$refs = {};
        if ($vnode) {
            execute($options[HOOK_BEFORE_UPDATE], instance);
            patch(domApi, vnode, oldVnode);
            hook = $options[HOOK_AFTER_UPDATE];
        }
        else {
            execute($options[HOOK_BEFORE_MOUNT], instance);
            patch(domApi, vnode, oldVnode);
            instance.$el = vnode.node;
            hook = $options[HOOK_AFTER_MOUNT];
        }
        instance.$vnode = vnode;
        // 跟 nextTask 保持一个节奏
        // 这样可以预留一些优化的余地
        if (hook) {
            instance.nextTick(function () {
                if (instance.$vnode) {
                    execute(hook, instance);
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
Yox.prototype.checkPropTypes = function checkPropTypes (props) {
    var ref = this.$options;
        var propTypes = ref.propTypes;
    return propTypes
        ? Yox.checkPropTypes(props, propTypes)
        : props;
};
/**
 * 创建子组件
 *
 * @param options 组件配置
 * @param vnode 虚拟节点
 * @param node DOM 元素
 */
Yox.prototype.create = function create (options, vnode, node) {
    {
        options = copy(options);
        options.parent = this;
        if (vnode) {
            // 如果传了 node，表示有一个占位元素，新创建的 child 需要把它替换掉
            if (node) {
                options.el = node;
                options.replace = TRUE;
            }
            var slots = vnode.slots;
                var props = vnode.props;
                var model = vnode.model;
            if (slots) {
                options.slots = slots;
            }
            // 把 model 的值设置给 props 的逻辑只能写到这
            // 不然子组件会报数据找不到的警告
            if (isDef(model)) {
                if (!props) {
                    props = {};
                }
                var name = options.model || RAW_VALUE;
                if (!has$2(props, name)) {
                    props[name] = model;
                }
                options.model = name;
            }
            options.props = props;
        }
        var child = new Yox(options);
        push(this.$children || (this.$children = []), child);
        return child;
    }
};
/**
 * 销毁组件
 */
Yox.prototype.destroy = function destroy$1 () {
    var instance = this;
        var $options = instance.$options;
        var $emitter = instance.$emitter;
        var $observer = instance.$observer;
    execute($options[HOOK_BEFORE_DESTROY], instance);
    {
        var $vnode = instance.$vnode;
            var $parent = instance.$parent;
        if ($parent && $parent.$children) {
            remove($parent.$children, instance);
        }
        if ($vnode) {
            // virtual dom 通过判断 parent.$vnode 知道宿主组件是否正在销毁
            delete instance.$vnode;
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
Yox.prototype.nextTick = function nextTick (task, prepend) {
    var ref = this.$observer;
        var nextTask = ref.nextTask;
    if (prepend) {
        nextTask.prepend(task);
    }
    else {
        nextTask.append(task);
    }
};
/**
 * 取反 keypath 对应的数据
 *
 * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
 */
Yox.prototype.toggle = function toggle (keypath) {
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
Yox.prototype.increase = function increase (keypath, step, max) {
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
Yox.prototype.decrease = function decrease (keypath, step, min) {
    return this.$observer.decrease(keypath, step, min);
};
/**
 * 在数组指定位置插入元素
 *
 * @param keypath
 * @param item
 * @param index
 */
Yox.prototype.insert = function insert (keypath, item, index) {
    return this.$observer.insert(keypath, item, index);
};
/**
 * 在数组尾部添加元素
 *
 * @param keypath
 * @param item
 */
Yox.prototype.append = function append (keypath, item) {
    return this.$observer.append(keypath, item);
};
/**
 * 在数组首部添加元素
 *
 * @param keypath
 * @param item
 */
Yox.prototype.prepend = function prepend (keypath, item) {
    return this.$observer.prepend(keypath, item);
};
/**
 * 通过索引移除数组中的元素
 *
 * @param keypath
 * @param index
 */
Yox.prototype.removeAt = function removeAt (keypath, index) {
    return this.$observer.removeAt(keypath, index);
};
/**
 * 直接移除数组中的元素
 *
 * @param keypath
 * @param item
 */
Yox.prototype.remove = function remove (keypath, item) {
    return this.$observer.remove(keypath, item);
};
/**
 * 拷贝任意数据，支持深拷贝
 *
 * @param data
 * @param deep
 */
Yox.prototype.copy = function copy (data, deep) {
    return this.$observer.copy(data, deep);
};
/**
 * core 版本
 */
Yox.version = "1.0.0-alpha";
/**
 * 方便外部共用的通用逻辑，特别是写插件，减少重复代码
 */
Yox.is = is$1;
Yox.array = array$1;
Yox.object = object$1;
Yox.string = string$1;
Yox.logger = logger;
Yox.Event = CustomEvent;
Yox.Emitter = Emitter;
function setFlexibleOptions(instance, key, value) {
    if (func(value)) {
        instance[key](execute(value, instance));
    }
    else if (object(value)) {
        instance[key](value);
    }
}
function getComponentAsync(data, name, callback) {
    if (data && has$2(data, name)) {
        var component = data[name];
        // 注册的是异步加载函数
        if (func(component)) {
            var $queue = component.$queue;
            if (!$queue) {
                $queue = component.$queue = [callback];
                component(function (replacement) {
                    component.$queue = UNDEFINED;
                    data[name] = replacement;
                    each($queue, function (callback) {
                        callback(replacement);
                    });
                });
            }
            else {
                push($queue, callback);
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
