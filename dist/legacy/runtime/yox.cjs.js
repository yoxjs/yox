/**
 * yox.js v1.0.0-alpha.15
 * (c) 2017-2019 musicode
 * Released under the MIT License.
 */

'use strict';

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
var RAW_TYPE = 'type';
var RAW_VALUE = 'value';
var RAW_LENGTH = 'length';
var RAW_FUNCTION = 'function';
var RAW_TEMPLATE = 'template';
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

var CustomEvent = function CustomEvent(type, originalEvent) {
    this.type = type;
    this.phase = CustomEvent.PHASE_CURRENT;
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
CustomEvent.PHASE_CURRENT = 0;
CustomEvent.PHASE_UPWARD = 1;
CustomEvent.PHASE_DOWNWARD = -1;

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
            for (var i$1 = 0; i$1 < length; i$1++) {
                if (callback(array[i$1], i$1, length) === FALSE) {
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
 * 首字母大写
 *
 * @param str
 * @return
 */
function capitalize(str) {
    if (!capitalizeCache[str]) {
        capitalizeCache[str] = str.replace(capitalizePattern, function ($0) {
            return $0.toUpperCase();
        });
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
  has: has$1,
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

/**
 * 是否有原生的日志特性，没有必要单独实现
 */
var nativeConsole = typeof console !== RAW_UNDEFINED ? console : NULL, 
/**
 * 当前是否是源码调试，如果开启了代码压缩，empty function 里的注释会被干掉
 */
useSource = /yox/.test(toString(EMPTY_FUNCTION));
/**
 * 全局调试开关
 *
 * 比如开发环境，开了 debug 模式，但是有时候觉得看着一堆日志特烦，想强制关掉
 * 比如线上环境，关了 debug 模式，为了调试，想强制打开
 */
function isDebug() {
    if (WINDOW) {
        var debug = WINDOW['DEBUG'];
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
Emitter.prototype.fire = function fire (type, args, filter) {
    var instance = this;
        var ref = parseNamespace(instance.ns, type);
        var name = ref.name;
        var ns = ref.ns;
        var list = instance.listeners[name], isComplete = TRUE;
    if (list) {
        // 避免遍历过程中，数组发生变化，比如增删了
        list = copy(list);
        // 判断是否是发射事件
        // 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
        // 因为事件处理函数的参数列表是 (event, data)
        var event = args && args[0] instanceof CustomEvent
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
            if (event) {
                event.listener = options.fn;
            }
            var result = execute(options.fn, options.ctx, args);
            if (event) {
                event.listener = UNDEFINED;
            }
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
 */
Emitter.prototype.on = function on (type, listener) {
    var instance = this, listeners = instance.listeners, addListener = function (item, type) {
        if (item) {
            var options = func(item) ? { fn: item } : item;
            if (object(options) && func(options.fn)) {
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
    return object(listener)
        ? function (options) {
            return listener === options;
        }
        : func(listener)
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
var NextTask = function NextTask() {
    this.nextTasks = [];
};
/**
 * 在队尾添加异步任务
 */
NextTask.shared = function shared$1 () {
    return shared || (shared = new NextTask());
};

NextTask.prototype.append = function append (func, context) {
    push(this.nextTasks, {
        fn: func,
        ctx: context
    });
    this.start();
};
/**
 * 在队首添加异步任务
 */
NextTask.prototype.prepend = function prepend (func, context) {
    unshift(this.nextTasks, {
        fn: func,
        ctx: context
    });
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
        each(nextTasks, function (task) {
            execute(task.fn, task.ctx);
        });
    }
};

var SLOT_DATA_PREFIX = '$slot_';
var HINT_BOOLEAN = 3;
var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';
var DIRECTIVE_EVENT = 'event';
var DIRECTIVE_BINDING = 'binding';
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
        node = vnode[NODE] = api.createElement(vnode.tag, vnode.isSvg);
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
 * 对象表达式，如 { name: 'yox' }
 */
var OBJECT = 8;
/**
 * 函数调用表达式，如 a()
 */
var CALL = 9;

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

/**
 * 元素 节点
 */
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
 * 延展操作 节点
 */
var SPREAD = 13;

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
var RENDER_SLOT = 'a', RENDER_EACH = 'b', RENDER_EXPRESSION = 'c', RENDER_EXPRESSION_ARG = 'd', RENDER_EXPRESSION_VNODE = 'e', RENDER_TEXT_VNODE = 'f', RENDER_ELEMENT_VNODE = 'g', RENDER_PARTIAL = 'h', RENDER_IMPORT = 'i', SEP_COMMA = ',', STRING_EMPTY = toJSON(EMPTY_STRING), CODE_PREFIX = "function(" + (join([
    RENDER_EXPRESSION,
    RENDER_EXPRESSION_ARG,
    RENDER_EXPRESSION_VNODE,
    RENDER_TEXT_VNODE,
    RENDER_ELEMENT_VNODE,
    RENDER_SLOT,
    RENDER_PARTIAL,
    RENDER_IMPORT,
    RENDER_EACH
], SEP_COMMA)) + "){return ";

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
        // eventScore 只有 $event 和 $data 两种值
        if (eventScope && eventScope[key]) {
            return eventScope[key];
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
            result = get(filters, key);
            if (!result) {
                node.ak = defaultKeypath;
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
                var result;
                if (args) {
                    // 给当前 scope 加上 event 和 data
                    eventScope = {
                        $event: event,
                        $data: data,
                    };
                    result = execute(method, context, args(stack));
                    // 阅后即焚
                    eventScope = UNDEFINED;
                }
                else {
                    result = execute(method, context, data ? [event, data] : event);
                }
                if (result === FALSE) {
                    event.prevent().stop();
                }
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
                    keypath: $keypath,
                };
                push(vnodeList, textVnode);
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
        if (vnodeList) {
            if (vnodes) {
                each(vnodes, function (vnode) {
                    push(vnodeList, vnode);
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
        var value = getValue(expr), exprKeypath = expr['ak'], eachKeypath = exprKeypath || join$1($keypath, expr.raw), callback = function (item, key, length) {
            var lastKeypath = $keypath, lastScope = $scope, lastKeypathStack = $stack;
            $keypath = join$1(eachKeypath, toString(key));
            $scope = {};
            $stack = copy($stack);
            push($stack, $keypath);
            push($stack, $scope);
            // 从下面这几句赋值可以看出
            // scope 至少会有 '$keypath' '$length' '$item' eachIndex 等几个值
            $scope.$keypath = $keypath;
            // 避免模板里频繁读取 list.length
            $scope.$length = length;
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
};
/**
 * 读取计算属性的值
 *
 * @param force 是否强制刷新缓存
 */
Computed.build = function build (keypath, observer, options) {
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
        var ref = asyncChanges[keypath] || (asyncChanges[keypath] = { value: oldValue, keypaths: [] });
            var keypaths = ref.keypaths;
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
Observer.prototype.diffAsync = function diffAsync () {
    var instance = this;
        var asyncEmitter = instance.asyncEmitter;
        var asyncChanges = instance.asyncChanges;
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
    // 为 IE9 以下浏览器打补丁
    {
        if (!DOCUMENT.addEventListener) {
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
                var node = DOCUMENT.getElementById(selector);
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
            ? DOCUMENT.createElementNS(namespaces.svg, tag)
            : DOCUMENT.createElement(tag);
    },
    createText: function createText(text) {
        return DOCUMENT.createTextNode(text);
    },
    createComment: function createComment(text) {
        return DOCUMENT.createComment(text);
    },
    prop: function prop(node, name, value) {
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
                if (isStyle && has$2(node, STYLE_SHEET)) {
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
                if (isStyle && has$2(node, STYLE_SHEET)) {
                    node[STYLE_SHEET].cssText = html$1;
                }
                else {
                    node[innerHTML] = html$1;
                }
            }
        }
        else {
            return node[innerHTML];
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
            listener(event);
        });
        addEventListener(node, EVENT_INPUT, listener[EVENT_INPUT] = function (event) {
            if (!locked) {
                listener(event);
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
    set: function set(input, value) {
        input.value = toString(value);
    },
    sync: function sync(input, keypath, context) {
        context.set(keypath, input.value);
    },
    name: RAW_VALUE
}, selectControl = {
    set: function set(select, value) {
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
    set: function set(radio, value) {
        radio.checked = radio.value === toString(value);
    },
    sync: function sync(radio, keypath, context) {
        if (radio.checked) {
            context.set(keypath, radio.value);
        }
    },
    name: 'checked'
}, checkboxControl = {
    set: function set(checkbox, value) {
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
}, specialControls = {
    radio: radioControl,
    checkbox: checkboxControl,
    select: selectControl,
}, directive$1 = {
    bind: function bind(node, directive, vnode) {
        var context = vnode.context;
        var model = vnode.model;
        var dataBinding = directive.binding, viewBinding, eventName, lazy = vnode.lazy[DIRECTIVE_MODEL] || vnode.lazy[EMPTY_STRING], set, sync, component, element;
        if (vnode.isComponent) {
            component = node;
            viewBinding = component.$options.model || RAW_VALUE;
            set = function (newValue) {
                component.set(viewBinding, newValue);
            };
            sync = function (newValue) {
                context.set(dataBinding, newValue);
            };
            // 不管模板是否设值，统一用数据中的值
            component.set(viewBinding, model);
        }
        else {
            element = node;
            var control = specialControls[element[RAW_TYPE]] || specialControls[domApi.tag(element)];
            // checkbox,radio,select 监听的是 change 事件
            eventName = EVENT_CHANGE;
            // 如果是输入框，则切换成 model 事件
            // model 事件是个 yox-dom 实现的特殊事件
            // 不会在输入法组合文字过程中得到触发事件
            if (!control) {
                control = inputControl;
                if (lazy !== TRUE) {
                    eventName = EVENT_MODEL;
                }
            }
            set = function (newValue) {
                control.set(element, newValue);
            };
            sync = function () {
                control.sync(element, dataBinding, context);
            };
            // 不管模板是否设值，统一用数据中的值
            control.set(element, model);
        }
        // 应用 lazy
        if (lazy && lazy !== TRUE) {
            sync = debounce(sync, lazy);
        }
        // 监听交互，修改数据
        if (component) {
            component.watch(viewBinding, sync);
        }
        else {
            domApi.on(element, eventName, sync);
        }
        // 监听数据，修改界面
        context.watch(dataBinding, set);
        vnode.data[directive.key] = function () {
            if (component) {
                component.unwatch(viewBinding, sync);
            }
            else {
                domApi.off(element, eventName, sync);
            }
            context.unwatch(dataBinding, set);
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
    var instance = this, $options = options || EMPTY_OBJECT;
    // 一进来就执行 before create
    execute($options[HOOK_BEFORE_CREATE], instance, $options);
    // 如果不绑着，其他方法调不到钩子
    instance.$options = $options;
    var data = $options.data;
    var props = $options.props;
    var computed = $options.computed;
    var events = $options.events;
    var methods = $options.methods;
    var watchers = $options.watchers;
    var extensions = $options.extensions;
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
        var isComment = FALSE, placeholder;
        var el = $options.el;
        var parent = $options.parent;
        var replace = $options.replace;
        var template = $options.template;
        var transitions = $options.transitions;
        var components = $options.components;
        var directives = $options.directives;
        var partials = $options.partials;
        var filters = $options.filters;
        var slots = $options.slots;
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
        // 当存在模板和计算属性时
        // 因为这里把模板当做一种特殊的计算属性
        // 因此模板这个计算属性的优先级应该最高
        if (template) {
            // 拷贝一份，避免影响外部定义的 watchers
            watchers = watchers
                ? copy(watchers)
                : {};
            // 当 virtual dom 变了，则更新视图
            watchers[TEMPLATE_COMPUTED] = function (vnode) {
                instance.update(vnode, instance.$vnode);
            };
            // 当模板的依赖变了，则重新创建 virtual dom
            observer.addComputed(TEMPLATE_COMPUTED, {
                // 当模板依赖变化时，异步通知模板更新
                sync: FALSE,
                get: function () {
                    return instance.render();
                }
            });
            afterCreateHook(instance, watchers);
            // 编译模板
            // 在开发阶段，template 是原始的 html 模板
            // 在产品阶段，template 是编译后且经过 stringify 的字符串
            // 当然，这个需要外部自己控制传入的 template 是什么
            // Yox.compile 会自动判断 template 是否经过编译
            instance.$template = Yox.compile(template);
            // 第一次渲染视图
            if (!placeholder) {
                isComment = TRUE;
                placeholder = domApi.createComment(EMPTY_STRING);
            }
            instance.update(instance.get(TEMPLATE_COMPUTED), create(domApi, placeholder, isComment, instance, EMPTY_STRING));
        }
        else {
            afterCreateHook(instance, watchers);
        }
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
Yox.nextTick = function nextTick (task, context) {
    NextTask.shared().append(task, context);
};
/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 */
Yox.compile = function compile (template, stringify) {
    {
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
    {
        return props;
    }
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
    var instance = this;
    instance.$emitter.on(type, {
        fn: listener,
        ctx: instance
    });
    return instance;
};
/**
 * 监听一次事件
 */
Yox.prototype.once = function once (type, listener) {
    var instance = this;
    instance.$emitter.on(type, {
        fn: listener,
        ctx: instance,
        max: 1
    });
    return instance;
};
/**
 * 取消监听事件
 */
Yox.prototype.off = function off (type, listener) {
    this.$emitter.off(type, listener);
    return this;
};
/**
 * 发射事件
 */
Yox.prototype.fire = function fire (event, data, downward) {
    // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
    // 内部为了保持格式统一
    // 需要转成 Event，这样还能知道 target 是哪个组件
    var instance = this, eventInstance = event instanceof CustomEvent ? event : new CustomEvent(event), eventArgs = [eventInstance], isComplete;
    // 告诉外部是谁发出的事件
    if (!eventInstance.target) {
        eventInstance.target = instance;
    }
    // 比如 fire('name', true) 直接向下发事件
    if (object(data)) {
        push(eventArgs, data);
    }
    else if (data === TRUE) {
        downward = TRUE;
    }
    isComplete = instance.$emitter.fire(eventInstance.type, eventArgs);
    if (isComplete) {
        if (downward) {
            if (instance.$children) {
                eventInstance.phase = CustomEvent.PHASE_DOWNWARD;
                each(instance.$children, function (child) {
                    return isComplete = child.fire(eventInstance, data, TRUE);
                });
            }
        }
        else if (instance.$parent) {
            eventInstance.phase = CustomEvent.PHASE_UPWARD;
            isComplete = instance.$parent.fire(eventInstance, data);
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
            var props = vnode.props;
                var slots = vnode.slots;
            if (props) {
                options.props = props;
            }
            if (slots) {
                options.slots = slots;
            }
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
    var instance = this;
        var ref = instance.$observer;
        var nextTask = ref.nextTask;
    if (prepend) {
        nextTask.prepend(task, instance);
    }
    else {
        nextTask.append(task, instance);
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
Yox.version = "1.0.0-alpha.15";
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

module.exports = Yox;
//# sourceMappingURL=yox.cjs.js.map
