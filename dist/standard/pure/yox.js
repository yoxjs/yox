/**
 * yox.js v1.0.0-alpha.7
 * (c) 2017-2019 musicode
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Yox = factory());
}(this, function () { 'use strict';

  /**
   * 为了压缩，定义的常量
   */
  var TRUE = true;
  var FALSE = false;
  var NULL = null;
  var UNDEFINED = void 0;
  var RAW_UNDEFINED = 'undefined';
  var RAW_VALUE = 'value';
  var RAW_LENGTH = 'length';
  var RAW_FUNCTION = 'function';
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

  var HOOK_BEFORE_CREATE = 'beforeCreate';
  var HOOK_AFTER_CREATE = 'afterCreate';
  var HOOK_BEFORE_DESTROY = 'beforeDestroy';
  var HOOK_AFTER_DESTROY = 'afterDestroy';

  // vnode.data 内部使用的几个字段

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

  var doc$1 = doc; 
  if (doc$1) {
      // 此时 doc.body 不一定有值，比如 script 放在 head 里
      if (!doc$1.documentElement.classList) ;
  }

  // 避免连续多次点击，主要用于提交表单场景
  // 移动端的 tap 事件可自行在业务层打补丁实现
  var immediateTypes = toObject([EVENT_CLICK, EVENT_TAP]);

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
      var source = props
          ? instance.checkPropTypes(props)
          : {};
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
          afterCreateHook(instance, watchers);
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
  Yox.compile = function compile (template, stringify) {
  };
  Yox.directive = function directive (name, directive$1) {
  };
  Yox.transition = function transition (name, transition$1) {
  };
  Yox.component = function component (name, component$1) {
  };
  Yox.partial = function partial (name, partial$1) {
  };
  Yox.filter = function filter (name, filter$1) {
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
  };
  Yox.prototype.transition = function transition (name, transition$1) {
  };
  Yox.prototype.component = function component (name, component$1) {
  };
  Yox.prototype.partial = function partial (name, partial$1) {
  };
  Yox.prototype.filter = function filter (name, filter$1) {
  };
  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */
  Yox.prototype.forceUpdate = function forceUpdate () {
  };
  /**
   * 把模板抽象语法树渲染成 virtual dom
   */
  Yox.prototype.render = function render () {
  };
  /**
   * 更新 virtual dom
   *
   * @param vnode
   * @param oldVnode
   */
  Yox.prototype.update = function update (vnode, oldVnode) {
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
  };
  /**
   * 销毁组件
   */
  Yox.prototype.destroy = function destroy () {
      var instance = this;
          var $options = instance.$options;
          var $emitter = instance.$emitter;
          var $observer = instance.$observer;
      execute($options[HOOK_BEFORE_DESTROY], instance);
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
  Yox.version = "1.0.0-alpha.7";
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
  function afterCreateHook(instance, watchers) {
      if (watchers) {
          instance.watch(watchers);
      }
      execute(instance.$options[HOOK_AFTER_CREATE], instance);
  }

  return Yox;

}));
//# sourceMappingURL=yox.js.map
