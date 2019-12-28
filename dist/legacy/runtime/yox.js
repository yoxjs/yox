/**
 * yox.js v1.0.0-alpha.121
 * (c) 2017-2019 musicode
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Yox = factory());
}(this, function () { 'use strict';

  var SLOT_DATA_PREFIX = '$slot_';
  var DIRECTIVE_MODEL = 'model';
  var DIRECTIVE_EVENT = 'event';
  var DIRECTIVE_BINDING = 'binding';
  var DIRECTIVE_CUSTOM = 'o';
  var MODIFER_NATIVE = 'native';
  var MODEL_PROP_DEFAULT = 'value';
  var NAMESPACE_HOOK = '.hook';
  var HOOK_BEFORE_CREATE = 'beforeCreate';
  var HOOK_AFTER_CREATE = 'afterCreate';
  var HOOK_BEFORE_MOUNT = 'beforeMount';
  var HOOK_AFTER_MOUNT = 'afterMount';
  var HOOK_BEFORE_UPDATE = 'beforeUpdate';
  var HOOK_AFTER_UPDATE = 'afterUpdate';
  var HOOK_BEFORE_DESTROY = 'beforeDestroy';
  var HOOK_AFTER_DESTROY = 'afterDestroy';
  var HOOK_BEFORE_PROPS_UPDATE = 'beforePropsUpdate';

  /**
   * 为了压缩，定义的常量
   */
  var TRUE = true;
  var FALSE = false;
  var NULL = null;
  var UNDEFINED = void 0;
  var MINUS_ONE = -1;
  var RAW_UNDEFINED = 'undefined';
  var RAW_FILTER = 'filter';
  var RAW_PARTIAL = 'partial';
  var RAW_COMPONENT = 'component';
  var RAW_DIRECTIVE = 'directive';
  var RAW_TRANSITION = 'transition';
  var RAW_VALUE = 'value';
  var RAW_LENGTH = 'length';
  var RAW_FUNCTION = 'function';
  var RAW_WILDCARD = '*';
  var RAW_DOT = '.';
  /**
   * Single instance for window in browser
   */
  var WINDOW = typeof window !== RAW_UNDEFINED ? window : UNDEFINED;
  /**
   * Single instance for document in browser
   */
  var DOCUMENT = typeof document !== RAW_UNDEFINED ? document : UNDEFINED;
  /**
   * Single instance for global in nodejs or browser
   */
  var GLOBAL = typeof global !== RAW_UNDEFINED ? global : WINDOW;
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
      return typeof value === 'number' && !isNaN(value);
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
              : context !== UNDEFINED
                  ? fn.call(context, args)
                  : args !== UNDEFINED
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
          // 这里不设置命名空间
          // 因为有没有命名空间取决于 Emitter 的构造函数有没有传 true
          // CustomEvent 自己无法决定
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
      CustomEvent.PHASE_DOWNWARD = MINUS_ONE;
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
                  if (callback(array[i], i) === FALSE) {
                      break;
                  }
              }
          }
          else {
              for (var i = 0; i < length; i++) {
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
      var result = MINUS_ONE;
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
      return str.indexOf(part, start !== UNDEFINED ? start : 0);
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
      return str.lastIndexOf(part, end !== UNDEFINED ? end : str.length);
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

  var dotPattern = /\./g, asteriskPattern = /\*/g, doubleAsteriskPattern = /\*\*/g, splitCache = {}, patternCache = {};
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
      // 如果 keypath 是 toString 之类的原型字段
      // splitCache[keypath] 会取到原型链上的对象
      // is.array() 比 splitCache.hasOwnProperty(keypath) 快一些
      // 虽然不如后者严谨，但在这里够用了
      var list;
      if (array(splitCache[keypath])) {
          list = splitCache[keypath];
      }
      else {
          if (indexOf$1(keypath, RAW_DOT) < 0) {
              list = [keypath];
          }
          else {
              list = keypath.split(RAW_DOT);
          }
          splitCache[keypath] = list;
      }
      for (var i = 0, lastIndex = list.length - 1; i <= lastIndex; i++) {
          if (callback(list[i], i, lastIndex) === FALSE) {
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
   * 全局 value holder，避免频繁的创建临时对象
   */
  var holder = {
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
   * 从对象中查找一个 keypath
   *
   * 返回值是空时，表示没找到值
   *
   * @param object
   * @param keypath
   * @return
   */
  function get(object, keypath) {
      each$1(keypath, function (key, index, lastIndex) {
          if (object != NULL) {
              // 先直接取值
              var value = object[key], 
              // 紧接着判断值是否存在
              // 下面会处理计算属性的值，不能在它后面设置 hasValue
              hasValue = value !== UNDEFINED;
              // 如果是计算属性，取计算属性的值
              if (value && func(value.get)) {
                  value = value.get();
              }
              if (index === lastIndex) {
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
      each$1(keypath, function (key, index, lastIndex) {
          if (index === lastIndex) {
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
      return object[key] !== UNDEFINED;
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
          : defaultValue !== UNDEFINED
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
   * 源码模式默认选 INFO，因为 DEBUG 输出的日志太多，会导致性能急剧下降
   */
  defaultLogLevel = /yox/.test(toString(EMPTY_FUNCTION)) ? INFO : WARN, 
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
          var logLevel = GLOBAL['YOX_LOG_LEVEL'];
          if (logLevel >= DEBUG && logLevel <= FATAL) {
              return logLevel;
          }
      }
      return defaultLogLevel;
  }
  function getStyle(backgroundColor) {
      return "background-color:" + backgroundColor + ";border-radius:12px;color:#fff;font-size:10px;padding:3px 6px;";
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
       * @param type 事件名称或命名空间
       * @param args 事件处理函数的参数列表
       * @param filter 自定义过滤器
       */
      Emitter.prototype.fire = function (type, args, filter) {
          var instance = this, namespace = string(type) ? instance.parse(type) : type, list = instance.listeners[namespace.type], isComplete = TRUE;
          if (list) {
              // 避免遍历过程中，数组发生变化，比如增删了
              list = copy(list);
              // 判断是否是发射事件
              // 如果 args 的第一个参数是 CustomEvent 类型，表示发射事件
              // 因为事件处理函数的参数列表是 (event, data)
              var event = args && args[0] instanceof CustomEvent
                  ? args[0]
                  : UNDEFINED;
              // 这里不用 array.each，减少函数调用
              for (var i = 0, length = list.length; i < length; i++) {
                  var options = list[i];
                  // 命名空间不匹配
                  if (!matchNamespace(namespace.ns, options)
                      // 在 fire 过程中被移除了
                      || !has(list, options)
                      // 传了 filter，则用 filter 判断是否过滤此 options
                      || (filter && !filter(namespace, args, options))) {
                      continue;
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
                  var result = execute(options.fn, options.ctx, args);
                  if (event) {
                      event.listener = UNDEFINED;
                  }
                  // 执行次数
                  options.num = options.num ? (options.num + 1) : 1;
                  // 注册的 listener 可以指定最大执行次数
                  if (options.num === options.max) {
                      instance.off(namespace, options.fn);
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
                      isComplete = FALSE;
                      break;
                  }
              }
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
              var namespace = string(type) ? instance.parse(type) : type;
              options.ns = namespace.ns;
              push(listeners[namespace.type] || (listeners[namespace.type] = []), options);
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
              var namespace = string(type) ? instance.parse(type) : type, name = namespace.type, ns_1 = namespace.ns, matchListener_1 = createMatchListener(listener), each$1 = function (list, name) {
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
          var instance = this, listeners = instance.listeners, namespace = string(type) ? instance.parse(type) : type, name = namespace.type, ns = namespace.ns, result = TRUE, matchListener = createMatchListener(listener), each$1 = function (list) {
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
       * 把事件类型解析成命名空间格式
       *
       * @param type
       */
      Emitter.prototype.parse = function (type) {
          // 这里 ns 必须为字符串
          // 用于区分 event 对象是否已完成命名空间的解析
          var result = {
              type: type,
              ns: EMPTY_STRING
          };
          // 是否开启命名空间
          if (this.ns) {
              var index = indexOf$1(type, RAW_DOT);
              if (index >= 0) {
                  result.type = slice(type, 0, index);
                  result.ns = slice(type, index + 1);
              }
          }
          return result;
      };
      return Emitter;
  }());
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
      var ns = options.ns;
      return ns && namespace
          ? ns === namespace
          : TRUE;
  }

  function isNative (target) {
      return func(target)
          && has$1(toString(target), '[native code]');
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

  // vnode.data 内部使用的几个字段
  var ID = '$id';
  var VNODE = '$vnode';
  var LOADING = '$loading';
  var COMPONENT = '$component';
  var LEAVING = '$leaving';

  function update(api, vnode, oldVnode) {
      var node = vnode.node, nativeAttrs = vnode.nativeAttrs, oldNativeAttrs = oldVnode && oldVnode.nativeAttrs;
      if (nativeAttrs || oldNativeAttrs) {
          var newValue = nativeAttrs || EMPTY_OBJECT, oldValue = oldNativeAttrs || EMPTY_OBJECT;
          for (var name in newValue) {
              if (oldValue[name] === UNDEFINED
                  || newValue[name] !== oldValue[name]) {
                  api.attr(node, name, newValue[name]);
              }
          }
          for (var name in oldValue) {
              if (newValue[name] === UNDEFINED) {
                  api.removeAttr(node, name);
              }
          }
      }
  }

  function update$1(api, vnode, oldVnode) {
      var node = vnode.node, nativeProps = vnode.nativeProps, oldNativeProps = oldVnode && oldVnode.nativeProps;
      if (nativeProps || oldNativeProps) {
          var newValue = nativeProps || EMPTY_OBJECT, oldValue = oldNativeProps || EMPTY_OBJECT;
          for (var name in newValue) {
              if (oldValue[name] === UNDEFINED
                  || newValue[name] !== oldValue[name]) {
                  api.prop(node, name, newValue[name]);
              }
          }
          for (var name in oldValue) {
              if (newValue[name] === UNDEFINED) {
                  api.removeProp(node, name);
              }
          }
      }
  }

  function update$2(vnode, oldVnode) {
      var data = vnode.data, directives = vnode.directives, oldDirectives = oldVnode && oldVnode.directives;
      if (directives || oldDirectives) {
          var node = data[COMPONENT] || vnode.node, isKeypathChange = oldVnode && vnode.keypath !== oldVnode.keypath, newValue = directives || EMPTY_OBJECT, oldValue = oldDirectives || EMPTY_OBJECT;
          for (var name in newValue) {
              var directive = newValue[name], _a = directive.hooks, once = _a.once, bind = _a.bind, unbind = _a.unbind;
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
          }
          for (var name in oldValue) {
              if (!newValue[name]) {
                  var unbind = oldValue[name].hooks.unbind;
                  if (unbind) {
                      unbind(node, oldValue[name], oldVnode);
                  }
              }
          }
      }
  }
  function remove$1(vnode) {
      var directives = vnode.directives;
      if (directives) {
          var node = vnode.data[COMPONENT] || vnode.node;
          for (var name in directives) {
              var unbind = directives[name].hooks.unbind;
              if (unbind) {
                  unbind(node, directives[name], vnode);
              }
          }
      }
  }

  function update$3(vnode, oldVnode) {
      var data = vnode.data, ref = vnode.ref, props = vnode.props, slots = vnode.slots, directives = vnode.directives, context = vnode.context, node;
      if (vnode.isComponent) {
          node = data[COMPONENT];
          // 更新时才要 set
          // 因为初始化时，所有这些都经过构造函数完成了
          if (oldVnode) {
              var model = directives && directives[DIRECTIVE_MODEL];
              if (model) {
                  if (!props) {
                      props = {};
                  }
                  props[node.$model] = model.value;
              }
              var result = merge(props, slots);
              if (result) {
                  node.forceUpdate(result);
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
      update$2(vnode);
      update$3(vnode);
      return child;
  }
  var guid = 0;
  function createData() {
      var data = {};
      data[ID] = ++guid;
      return data;
  }
  function createVnode(api, vnode) {
      var tag = vnode.tag, node = vnode.node, data = vnode.data, isComponent = vnode.isComponent, isComment = vnode.isComment, isText = vnode.isText, isStyle = vnode.isStyle, isOption = vnode.isOption, children = vnode.children, text = vnode.text, html = vnode.html, context = vnode.context;
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
                      componentOptions_1 = options;
                  }
              });
          }
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
              api.text(node, text, isStyle, isOption);
          }
          else if (html) {
              api.html(node, html, isStyle, isOption);
          }
          update(api, vnode);
          update$1(api, vnode);
          update$2(vnode);
          update$3(vnode);
      }
  }
  function addVnodes(api, parentNode, vnodes, startIndex, endIndex, before) {
      var vnode, start = startIndex || 0, end = endIndex !== UNDEFINED ? endIndex : vnodes.length - 1;
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
              // 注意：YoxInterface 没有声明 $observer，因为不想让外部访问，
              // 但是这里要用一次，所以加了 as any
              context.$observer.nextTask.prepend(enter);
          }
      }
  }
  function removeVnodes(api, parentNode, vnodes, startIndex, endIndex) {
      var vnode, start = startIndex || 0, end = endIndex !== UNDEFINED ? endIndex : vnodes.length - 1;
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
              if (oldIndex !== UNDEFINED) {
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
      update(api, vnode, oldVnode);
      update$1(api, vnode, oldVnode);
      // 先处理 directive 再处理 component
      // 因为组件只是单纯的更新 props，而 directive 则有可能要销毁
      // 如果顺序反过来，会导致某些本该销毁的指令先被数据的变化触发执行了
      update$2(vnode, oldVnode);
      update$3(vnode, oldVnode);
      var text = vnode.text, html = vnode.html, children = vnode.children, isStyle = vnode.isStyle, isOption = vnode.isOption, oldText = oldVnode.text, oldHtml = oldVnode.html, oldChildren = oldVnode.children;
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
          : defaultValue !== UNDEFINED
              ? defaultValue
              : 0;
  }

  function isDef (target) {
      return target !== UNDEFINED;
  }

  function setPair(target, name, key, value) {
      var data = target[name] || (target[name] = {});
      data[key] = value;
  }
  var KEY_DIRECTIVES = 'directives';
  function render(context, observer, template, filters, partials, directives, transitions) {
      var $scope = { $keypath: EMPTY_STRING }, $stack = [$scope], $vnode, vnodeStack = [], localPartials = {}, findValue = function (stack, index, key, lookup, depIgnore, defaultKeypath) {
          var scope = stack[index], keypath = join$1(scope.$keypath, key), value = stack, holder$1 = holder;
          // 如果最后还是取不到值，用回最初的 keypath
          if (defaultKeypath === UNDEFINED) {
              defaultKeypath = keypath;
          }
          // 如果取的是 scope 上直接有的数据，如 $keypath
          if (scope[key] !== UNDEFINED) {
              value = scope[key];
          }
          // 如果取的是数组项，则要更进一步
          else if (scope.$item !== UNDEFINED) {
              scope = scope.$item;
              // 到这里 scope 可能为空
              // 比如 new Array(10) 然后遍历这个数组，每一项肯定是空
              // 取 this
              if (key === EMPTY_STRING) {
                  value = scope;
              }
              // 取 this.xx
              else if (scope != NULL && scope[key] !== UNDEFINED) {
                  value = scope[key];
              }
          }
          if (value === stack) {
              // 正常取数据
              value = observer.get(keypath, stack, depIgnore);
              if (value === stack) {
                  if (lookup && index > 0) {
                      return findValue(stack, index - 1, key, lookup, depIgnore, defaultKeypath);
                  }
                  // 到头了，最后尝试过滤器
                  var result = get(filters, key);
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
      }, renderTextVnode = function (value) {
          var vnodeList = last(vnodeStack);
          if (vnodeList) {
              var text = toString(value);
              var lastVnode = last(vnodeList);
              if (lastVnode && lastVnode.isText) {
                  lastVnode.text += text;
              }
              else {
                  // 注释节点标签名是 '!'，这里区分一下
                  var textVnode = {
                      tag: '#',
                      isText: TRUE,
                      text: text,
                      context: context,
                      keypath: $scope.$keypath
                  };
                  push(vnodeList, textVnode);
              }
          }
      }, renderAttributeVnode = function (name, value) {
          setPair($vnode, $vnode.isComponent ? 'props' : 'nativeAttrs', name, value);
      }, renderPropertyVnode = function (name, value) {
          setPair($vnode, 'nativeProps', name, value);
      }, renderLazyVnode = function (name, value) {
          setPair($vnode, 'lazy', name, value);
      }, renderTransitionVnode = function (name) {
          $vnode.transition = transitions[name];
      }, renderBindingVnode = function (name, holder, hint) {
          var key = join$1(DIRECTIVE_BINDING, name);
          setPair($vnode, KEY_DIRECTIVES, key, {
              ns: DIRECTIVE_BINDING,
              name: name,
              key: key,
              modifier: holder.keypath,
              hooks: directives[DIRECTIVE_BINDING],
              hint: hint
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
              name: name,
              key: key,
              value: value,
              modifier: modifier,
              hooks: directives[DIRECTIVE_EVENT],
              handler: createMethodListener(method, args, $stack)
          });
      }, renderEventNameVnode = function (name, key, modifier, value, event) {
          setPair($vnode, KEY_DIRECTIVES, key, {
              ns: DIRECTIVE_EVENT,
              name: name,
              key: key,
              value: value,
              modifier: modifier,
              hooks: directives[DIRECTIVE_EVENT],
              handler: createEventListener(event)
          });
      }, renderDirectiveVnode = function (name, key, modifier, value, method, args, getter) {
          var hooks = directives[name];
          setPair($vnode, KEY_DIRECTIVES, key, {
              ns: DIRECTIVE_CUSTOM,
              name: name,
              key: key,
              value: value,
              hooks: hooks,
              modifier: modifier,
              getter: getter ? createGetter(getter, $stack) : UNDEFINED,
              handler: method ? createMethodListener(method, args, $stack) : UNDEFINED
          });
      }, renderSpreadVnode = function (holder) {
          var value = holder.value, keypath = holder.keypath;
          if (object(value)) {
              for (var key in value) {
                  setPair($vnode, 'props', key, value[key]);
              }
              if (keypath) {
                  var key = join$1(DIRECTIVE_BINDING, keypath);
                  setPair($vnode, KEY_DIRECTIVES, key, {
                      ns: DIRECTIVE_BINDING,
                      name: EMPTY_STRING,
                      key: key,
                      modifier: join$1(keypath, RAW_WILDCARD),
                      hooks: directives[DIRECTIVE_BINDING]
                  });
              }
          }
      }, appendVnode = function (vnode) {
          var vnodeList = last(vnodeStack);
          if (vnodeList) {
              push(vnodeList, vnode);
          }
          return vnode;
      }, renderCommentVnode = function () {
          // 注释节点和文本节点需要有个区分
          // 如果两者都没有 tag，则 patchVnode 时，会认为两者是 patchable 的
          return appendVnode({
              tag: '!',
              isComment: TRUE,
              text: EMPTY_STRING,
              keypath: $scope.$keypath,
              context: context
          });
      }, renderElementVnode = function (tag, attrs, childs, isStatic, isOption, isStyle, isSvg, html, ref, key) {
          var vnode = {
              tag: tag,
              isStatic: isStatic,
              isOption: isOption,
              isStyle: isStyle,
              isSvg: isSvg,
              ref: ref,
              key: key,
              context: context,
              keypath: $scope.$keypath
          };
          if (isDef(html)) {
              vnode.html = toString(html);
          }
          if (attrs) {
              $vnode = vnode;
              attrs();
              $vnode = UNDEFINED;
          }
          if (childs) {
              vnodeStack.push(vnode.children = []);
              childs();
              pop(vnodeStack);
          }
          return appendVnode(vnode);
      }, renderComponentVnode = function (staticTag, attrs, slots, ref, key, dynamicTag) {
          var tag;
          // 组件支持动态名称
          if (dynamicTag) {
              var componentName = observer.get(dynamicTag);
              tag = componentName;
          }
          else {
              tag = staticTag;
          }
          var vnode = {
              tag: tag,
              ref: ref,
              key: key,
              context: context,
              keypath: $scope.$keypath,
              isComponent: TRUE
          };
          if (attrs) {
              $vnode = vnode;
              attrs();
              $vnode = UNDEFINED;
          }
          if (slots) {
              var vnodeSlots = {};
              for (var name in slots) {
                  vnodeStack.push([]);
                  slots[name]();
                  var vnodes = pop(vnodeStack);
                  vnodeSlots[name] = vnodes.length ? vnodes : UNDEFINED;
              }
              vnode.slots = vnodeSlots;
          }
          return appendVnode(vnode);
      }, renderExpressionIdentifier = function (name, lookup, offset, holder, depIgnore, stack) {
          var myStack = stack || $stack, index = myStack.length - 1;
          if (offset) {
              index -= offset;
          }
          var result = findValue(myStack, index, name, lookup, depIgnore);
          return holder ? result : result.value;
      }, renderExpressionMemberKeypath = function (identifier, runtimeKeypath) {
          unshift(runtimeKeypath, identifier);
          return join(runtimeKeypath, RAW_DOT);
      }, renderExpressionMemberLiteral = function (value, staticKeypath, runtimeKeypath, holder$1) {
          if (runtimeKeypath !== UNDEFINED) {
              staticKeypath = join(runtimeKeypath, RAW_DOT);
          }
          var match = get(value, staticKeypath);
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
          var vnodeList = last(vnodeStack), vnodes = context.get(name);
          if (vnodeList) {
              if (vnodes) {
                  for (var i = 0, length = vnodes.length; i < length; i++) {
                      push(vnodeList, vnodes[i]);
                      vnodes[i].slot = name;
                      vnodes[i].parent = context;
                  }
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
                  partial(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderCommentVnode, renderElementVnode, renderComponentVnode, renderSlot, renderPartial, renderImport, renderEach, renderRange, renderEqualRange);
              }
          }
      }, eachHandler = function (generate, item, key, keypath, index, length) {
          var lastScope = $scope, lastStack = $stack;
          // each 会改变 keypath
          $scope = { $keypath: keypath };
          $stack = lastStack.concat($scope);
          // 避免模板里频繁读取 list.length
          if (length !== UNDEFINED) {
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
          var keypath = holder.keypath, value = holder.value;
          if (array(value)) {
              for (var i = 0, length = value.length; i < length; i++) {
                  eachHandler(generate, value[i], i, keypath
                      ? join$1(keypath, EMPTY_STRING + i)
                      : EMPTY_STRING, index, length);
              }
          }
          else if (object(value)) {
              for (var key in value) {
                  eachHandler(generate, value[key], key, keypath
                      ? join$1(keypath, key)
                      : EMPTY_STRING, index);
              }
          }
      }, renderRange = function (generate, from, to, index) {
          var count = 0;
          if (from < to) {
              for (var i = from; i < to; i++) {
                  eachHandler(generate, i, count++, EMPTY_STRING, index);
              }
          }
          else {
              for (var i = from; i > to; i--) {
                  eachHandler(generate, i, count++, EMPTY_STRING, index);
              }
          }
      }, renderEqualRange = function (generate, from, to, index) {
          var count = 0;
          if (from < to) {
              for (var i = from; i <= to; i++) {
                  eachHandler(generate, i, count++, EMPTY_STRING, index);
              }
          }
          else {
              for (var i = from; i >= to; i--) {
                  eachHandler(generate, i, count++, EMPTY_STRING, index);
              }
          }
      };
      return template(renderExpressionIdentifier, renderExpressionMemberKeypath, renderExpressionMemberLiteral, renderExpressionCall, renderTextVnode, renderAttributeVnode, renderPropertyVnode, renderLazyVnode, renderTransitionVnode, renderBindingVnode, renderModelVnode, renderEventMethodVnode, renderEventNameVnode, renderDirectiveVnode, renderSpreadVnode, renderCommentVnode, renderElementVnode, renderComponentVnode, renderSlot, renderPartial, renderImport, renderEach, renderRange, renderEqualRange);
  }

  var guid$1 = 0, 
  // 这里先写 IE9 支持的接口
  innerText = 'textContent', innerHTML = 'innerHTML', createEvent = function (event, node) {
      return event;
  }, findElement = function (selector) {
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
  addElementClass = function (node, className) {
      node.classList.add(className);
  }, removeElementClass = function (node, className) {
      node.classList.remove(className);
  };
  {
      if (DOCUMENT) {
          // 此时 document.body 不一定有值，比如 script 放在 head 里
          if (!DOCUMENT.documentElement.classList) {
              addElementClass = function (node, className) {
                  var classes = node.className.split(CHAR_WHITESPACE);
                  if (!has(classes, className)) {
                      push(classes, className);
                      node.className = join(classes, CHAR_WHITESPACE);
                  }
              };
              removeElementClass = function (node, className) {
                  var classes = node.className.split(CHAR_WHITESPACE);
                  if (remove(classes, className)) {
                      node.className = join(classes, CHAR_WHITESPACE);
                  }
              };
          }
          // 为 IE9 以下浏览器打补丁
          {
              if (!DOCUMENT.addEventListener) {
                  var PROPERTY_CHANGE_1 = 'propertychange', isBoxElement_1 = function (node) {
                      return node.tagName === 'INPUT'
                          && (node.type === 'radio' || node.type === 'checkbox');
                  };
                  var IEEvent_1 = /** @class */ (function () {
                      function IEEvent(event, element) {
                          extend(this, event);
                          this.currentTarget = element;
                          this.target = event.srcElement || element;
                          this.originalEvent = event;
                      }
                      IEEvent.prototype.preventDefault = function () {
                          this.originalEvent.returnValue = FALSE;
                      };
                      IEEvent.prototype.stopPropagation = function () {
                          this.originalEvent.cancelBubble = TRUE;
                      };
                      return IEEvent;
                  }());
                  // textContent 不兼容 IE 678
                  innerText = 'innerText';
                  createEvent = function (event, element) {
                      return new IEEvent_1(event, element);
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
                  addEventListener = function (node, type, listener) {
                      if (type === EVENT_INPUT) {
                          addEventListener(node, PROPERTY_CHANGE_1, 
                          // 借用 EMITTER，反正只是内部临时用一下...
                          listener[EMITTER] = function (event) {
                              if (event.propertyName === RAW_VALUE) {
                                  event = new CustomEvent(event);
                                  event.type = EVENT_INPUT;
                                  execute(listener, this, event);
                              }
                          });
                      }
                      else if (type === EVENT_CHANGE && isBoxElement_1(node)) {
                          addEventListener(node, EVENT_CLICK, listener[EMITTER] = function (event) {
                              event = new CustomEvent(event);
                              event.type = EVENT_CHANGE;
                              execute(listener, this, event);
                          });
                      }
                      else {
                          node.attachEvent("on" + type, listener);
                      }
                  };
                  removeEventListener = function (node, type, listener) {
                      if (type === EVENT_INPUT) {
                          removeEventListener(node, PROPERTY_CHANGE_1, listener[EMITTER]);
                          delete listener[EMITTER];
                      }
                      else if (type === EVENT_CHANGE && isBoxElement_1(node)) {
                          removeEventListener(node, EVENT_CLICK, listener[EMITTER]);
                          delete listener[EMITTER];
                      }
                      else {
                          node.detachEvent("on" + type, listener);
                      }
                  };
              }
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
      svg: domain + '2000/svg'
  }, emitterHolders = {}, specialEvents = {};
  specialEvents[EVENT_MODEL] = {
      on: function (node, listener) {
          var locked = FALSE;
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
      off: function (node, listener) {
          off(node, COMPOSITION_START, listener[COMPOSITION_START]);
          off(node, COMPOSITION_END, listener[COMPOSITION_END]);
          removeEventListener(node, EVENT_INPUT, listener[EVENT_INPUT]);
          listener[COMPOSITION_START] =
              listener[COMPOSITION_END] =
                  listener[EVENT_INPUT] = UNDEFINED;
      }
  };
  function createElement(tag, isSvg) {
      return isSvg
          ? DOCUMENT.createElementNS(namespaces.svg, tag)
          : DOCUMENT.createElement(tag);
  }
  function createText(text) {
      return DOCUMENT.createTextNode(text);
  }
  function createComment(text) {
      return DOCUMENT.createComment(text);
  }
  function prop(node, name, value) {
      if (value !== UNDEFINED) {
          set(node, name, value, FALSE);
      }
      else {
          var holder = get(node, name);
          if (holder) {
              return holder.value;
          }
      }
  }
  function removeProp(node, name) {
      set(node, name, UNDEFINED);
  }
  function attr(node, name, value) {
      if (value !== UNDEFINED) {
          node.setAttribute(name, value);
      }
      else {
          // value 还可能是 null
          var value_1 = node.getAttribute(name);
          if (value_1 != NULL) {
              return value_1;
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
      var parentNode = node.parentNode;
      if (parentNode) {
          return parentNode;
      }
  }
  function next(node) {
      var nextSibling = node.nextSibling;
      if (nextSibling) {
          return nextSibling;
      }
  }
  var find = findElement;
  function tag(node) {
      if (node.nodeType === 1) {
          return lower(node.tagName);
      }
  }
  function text(node, text, isStyle, isOption) {
      if (text !== UNDEFINED) {
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
      if (html !== UNDEFINED) {
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
  var addClass = addElementClass;
  var removeClass = removeElementClass;
  function on(node, type, listener, context) {
      var emitterKey = node[EMITTER] || (node[EMITTER] = ++guid$1), emitter = emitterHolders[emitterKey] || (emitterHolders[emitterKey] = new Emitter()), nativeListeners = emitter.nativeListeners || (emitter.nativeListeners = {});
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
          ctx: context
      });
  }
  function off(node, type, listener) {
      var emitterKey = node[EMITTER], emitter = emitterHolders[emitterKey], listeners = emitter.listeners, nativeListeners = emitter.nativeListeners;
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
      if (emitterHolders[emitterKey]
          && falsy$2(listeners)) {
          node[EMITTER] = UNDEFINED;
          delete emitterHolders[emitterKey];
      }
  }
  function addSpecialEvent(type, hooks) {
      specialEvents[type] = hooks;
  }

  var domApi = /*#__PURE__*/Object.freeze({
    createElement: createElement,
    createText: createText,
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
                  if (matchFuzzy(newKeypath_1, fuzzyKeypath) !== UNDEFINED) {
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
              if (matchFuzzy(keypath, watchKeypath) !== UNDEFINED) {
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
          var instance = this, currentComputed = Computed.current, data = instance.data, computed = instance.computed;
          // 传入 '' 获取整个 data
          if (keypath === EMPTY_STRING) {
              return data;
          }
          // 调用 get 时，外面想要获取依赖必须设置是谁在收集依赖
          // 如果没设置，则跳过依赖收集
          if (currentComputed && !depIgnore) {
              currentComputed.add(keypath);
          }
          var result;
          if (computed) {
              result = get(computed, keypath);
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
          var instance = this, data = instance.data, computed = instance.computed, setValue = function (newValue, keypath) {
              var oldValue = instance.get(keypath);
              if (newValue === oldValue) {
                  return;
              }
              var next;
              each$1(keypath, function (key, index, lastIndex) {
                  if (index === 0) {
                      if (computed && computed[key]) {
                          if (lastIndex === 0) {
                              computed[key].set(newValue);
                          }
                          else {
                              // 这里 next 可能为空
                              next = computed[key].get();
                          }
                      }
                      else {
                          if (lastIndex === 0) {
                              data[key] = newValue;
                          }
                          else {
                              next = data[key] || (data[key] = {});
                          }
                      }
                      return;
                  }
                  if (next) {
                      if (index === lastIndex) {
                          next[key] = newValue;
                      }
                      else {
                          next = next[key] || (next[key] = {});
                      }
                  }
              });
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
          var cache = TRUE, sync = TRUE, deps = [], getter, setter;
          if (func(options)) {
              getter = options;
          }
          else if (object(options)) {
              var computedOptions = options;
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
              var instance = this, computed = new Computed(keypath, sync, cache, deps, instance, getter, setter);
              if (!instance.computed) {
                  instance.computed = {};
              }
              instance.computed[keypath] = computed;
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

  function bind(node, directive, vnode) {
      var key = directive.key, name = directive.name, modifier = directive.modifier, handler = directive.handler, lazy = vnode.lazy;
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
      var element;
      if (vnode.isComponent) {
          var component_1 = node;
          if (modifier === MODIFER_NATIVE) {
              element = component_1.$el;
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
              component_1.on(name, handler);
              vnode.data[key] = function () {
                  component_1.off(name, handler);
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
                  option.selected = has(value, option.value, FALSE);
              }
              : function (option, index) {
                  if (option.value == value) {
                      node.selectedIndex = index;
                      return FALSE;
                  }
              });
      },
      sync: function (node, keypath, context) {
          var options = node.options;
          if (node.multiple) {
              var values_1 = [];
              each(toArray(options), function (option) {
                  if (option.selected) {
                      push(values_1, option.value);
                  }
              });
              context.set(keypath, values_1);
          }
          else {
              context.set(keypath, options[node.selectedIndex].value);
          }
      },
      name: RAW_VALUE
  };
  var once = TRUE;
  function bind$1(node, directive, vnode) {
      var context = vnode.context, lazy = vnode.lazy, isComponent = vnode.isComponent, dataBinding = directive.modifier, lazyValue = lazy && (lazy[DIRECTIVE_MODEL] || lazy[EMPTY_STRING]), set, unbind;
      if (isComponent) {
          var component_1 = node, viewBinding_1 = component_1.$model, viewSyncing_1 = debounceIfNeeded(function (newValue) {
              context.set(dataBinding, newValue);
          }, lazyValue);
          set = function (newValue) {
              if (set) {
                  component_1.set(viewBinding_1, newValue);
              }
          };
          unbind = function () {
              component_1.unwatch(viewBinding_1, viewSyncing_1);
          };
          component_1.watch(viewBinding_1, viewSyncing_1);
      }
      else {
          var element_1 = node, control_1 = vnode.tag === 'select'
              ? selectControl
              : inputControl, 
          // checkbox,radio,select 监听的是 change 事件
          eventName_1 = EVENT_CHANGE;
          if (control_1 === inputControl) {
              var type = node.type;
              if (type === 'radio') {
                  control_1 = radioControl;
              }
              else if (type === 'checkbox') {
                  control_1 = checkboxControl;
              }
              // 如果是输入框，则切换成 model 事件
              // model 事件是个 yox-dom 实现的特殊事件
              // 不会在输入法组合文字过程中得到触发事件
              else if (lazyValue !== TRUE) {
                  eventName_1 = EVENT_MODEL;
              }
          }
          set = function (newValue) {
              if (set) {
                  control_1.set(element_1, newValue);
              }
          };
          var sync_1 = debounceIfNeeded(function () {
              control_1.sync(element_1, dataBinding, context);
          }, lazyValue);
          unbind = function () {
              off(element_1, eventName_1, sync_1);
          };
          on(element_1, eventName_1, sync_1);
          control_1.set(element_1, directive.value);
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

  var once$1 = TRUE;
  function bind$2(node, directive, vnode) {
      // binding 可能是模糊匹配
      // 比如延展属性 {{...obj}}，这里 binding 会是 `obj.*`
      var binding = directive.modifier, 
      // 提前判断好是否是模糊匹配，避免 watcher 频繁执行判断逻辑
      isFuzzy$1 = isFuzzy(binding), watcher = function (newValue, _, keypath) {
          if (watcher) {
              var name = isFuzzy$1
                  ? matchFuzzy(keypath, binding)
                  : directive.name;
              if (vnode.isComponent) {
                  var component = node;
                  component.checkProp(name, newValue);
                  component.set(name, newValue);
              }
              else {
                  var element = node;
                  if (directive.hint !== UNDEFINED) {
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

  var globalDirectives = {}, globalTransitions = {}, globalComponents = {}, globalPartials = {}, globalFilters = {}, TEMPLATE_COMPUTED = '$$', selectorPattern = /^[#.][-\w+]+$/;
  var Yox = /** @class */ (function () {
      function Yox(options) {
          var instance = this, $options = options || EMPTY_OBJECT;
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
          var data = $options.data, props = $options.props, vnode = $options.vnode, propTypes = $options.propTypes, computed = $options.computed, methods = $options.methods, watchers = $options.watchers, extensions = $options.extensions;
          instance.$options = $options;
          if (extensions) {
              extend(instance, extensions);
          }
          // 数据源，默认值仅在创建组件时启用
          var source = props ? copy(props) : {};
          {
              if (propTypes) {
                  each$2(propTypes, function (rule, key) {
                      var value = source[key];
                      if (value === UNDEFINED) {
                          value = rule.value;
                          if (value !== UNDEFINED) {
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
          var observer = instance.$observer = new Observer(source, instance);
          if (computed) {
              each$2(computed, function (options, keypath) {
                  observer.addComputed(keypath, options);
              });
          }
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
          {
              var placeholder = UNDEFINED, el = $options.el, root = $options.root, model_1 = $options.model, context = $options.context, replace = $options.replace, template = $options.template, transitions = $options.transitions, components = $options.components, directives = $options.directives, partials = $options.partials, filters = $options.filters, slots = $options.slots;
              if (model_1) {
                  instance.$model = model_1;
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
                  }
              }
              // 检查 el
              if (el) {
                  if (string(el)) {
                      var selector = el;
                      if (selectorPattern.test(selector)) {
                          placeholder = find(selector);
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
                  instance.watch(newWatchers);
                  {
                      execute(instance.$options[HOOK_AFTER_CREATE], instance);
                      instance.fire(HOOK_AFTER_CREATE + NAMESPACE_HOOK);
                  }
                  // 编译模板
                  // 在开发阶段，template 是原始的 html 模板
                  // 在产品阶段，template 是编译后的渲染函数
                  // 当然，具体是什么需要外部自己控制
                  instance.$template = string(template)
                      ? Yox.compile(template)
                      : template;
                  if (!vnode) {
                      vnode = create(domApi, placeholder, instance, EMPTY_STRING);
                  }
                  instance.update(instance.get(TEMPLATE_COMPUTED), vnode);
                  return;
              }
          }
          if (watchers) {
              instance.watch(watchers);
          }
          {
              execute(instance.$options[HOOK_AFTER_CREATE], instance);
              instance.fire(HOOK_AFTER_CREATE + NAMESPACE_HOOK);
          }
      }
      /**
       * 定义组件对象
       */
      Yox.define = function (options) {
          return options;
      };
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
              return template;
          }
      };
      /**
       * 注册全局指令
       */
      Yox.directive = function (name, directive) {
          {
              if (string(name) && !directive) {
                  return getResource(globalDirectives, name);
              }
              setResource(globalDirectives, name, directive);
          }
      };
      /**
       * 注册全局过渡动画
       */
      Yox.transition = function (name, transition) {
          {
              if (string(name) && !transition) {
                  return getResource(globalTransitions, name);
              }
              setResource(globalTransitions, name, transition);
          }
      };
      /**
       * 注册全局组件
       */
      Yox.component = function (name, component) {
          {
              if (string(name) && !component) {
                  return getResource(globalComponents, name);
              }
              setResource(globalComponents, name, component);
          }
      };
      /**
       * 注册全局子模板
       */
      Yox.partial = function (name, partial) {
          {
              if (string(name) && !partial) {
                  return getResource(globalPartials, name);
              }
              setResource(globalPartials, name, partial, Yox.compile);
          }
      };
      /**
       * 注册全局过滤器
       */
      Yox.filter = function (name, filter) {
          {
              if (string(name) && !filter) {
                  return getResource(globalFilters, name);
              }
              setResource(globalFilters, name, filter);
          }
      };
      /**
       * 取值
       */
      Yox.prototype.get = function (keypath, defaultValue) {
          return this.$observer.get(keypath, defaultValue);
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
       * 监听事件，支持链式调用
       */
      Yox.prototype.on = function (type, listener) {
          addEvents(this, type, listener);
          return this;
      };
      /**
       * 监听一次事件，支持链式调用
       */
      Yox.prototype.once = function (type, listener) {
          addEvents(this, type, listener, TRUE);
          return this;
      };
      /**
       * 取消监听事件，支持链式调用
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
          var instance = this, $emitter = instance.$emitter, $parent = instance.$parent, $children = instance.$children, event = type instanceof CustomEvent ? type : new CustomEvent(type), args = [event], isComplete;
          // 创建完 CustomEvent，如果没有人为操作
          // 它的 ns 为 undefined
          // 这里先解析出命名空间，避免每次 fire 都要解析
          if (event.ns === UNDEFINED) {
              var namespace = $emitter.parse(event.type);
              event.type = namespace.type;
              event.ns = namespace.ns;
          }
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
          // 向上发事件会经过自己
          // 如果向下发事件再经过自己，就产生了一次重叠
          // 这是没有必要的，而且会导致向下发事件时，外部能接收到该事件，但我们的本意只是想让子组件接收到事件
          isComplete = downward && event.target === instance
              ? TRUE
              : $emitter.fire(event, args);
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
      };
      /**
       * 监听数据变化，支持链式调用
       */
      Yox.prototype.watch = function (keypath, watcher, immediate) {
          this.$observer.watch(keypath, watcher, immediate);
          return this;
      };
      /**
       * 取消监听数据变化，支持链式调用
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
          {
              if (!loadComponent(this.$components, name, callback)) {
                  {
                      loadComponent(globalComponents, name, callback);
                  }
              }
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
              options.context = vnode.context;
              options.vnode = vnode;
              options.replace = TRUE;
              var props = vnode.props, slots = vnode.slots, directives = vnode.directives, model_2 = directives && directives[DIRECTIVE_MODEL];
              if (model_2) {
                  if (!props) {
                      props = {};
                  }
                  var key = options.model || MODEL_PROP_DEFAULT;
                  props[key] = model_2.value;
                  options.model = key;
              }
              if (props) {
                  options.props = props;
              }
              if (slots) {
                  options.slots = slots;
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
      /**
       * 注册当前组件级别的指令
       */
      Yox.prototype.directive = function (name, directive) {
          {
              var instance = this, $directives = instance.$directives;
              if (string(name) && !directive) {
                  return getResource($directives, name, Yox.directive);
              }
              setResource($directives || (instance.$directives = {}), name, directive);
          }
      };
      /**
       * 注册当前组件级别的过渡动画
       */
      Yox.prototype.transition = function (name, transition) {
          {
              var instance = this, $transitions = instance.$transitions;
              if (string(name) && !transition) {
                  return getResource($transitions, name, Yox.transition);
              }
              setResource($transitions || (instance.$transitions = {}), name, transition);
          }
      };
      /**
       * 注册当前组件级别的组件
       */
      Yox.prototype.component = function (name, component) {
          {
              var instance = this, $components = instance.$components;
              if (string(name) && !component) {
                  return getResource($components, name, Yox.component);
              }
              setResource($components || (instance.$components = {}), name, component);
          }
      };
      /**
       * 注册当前组件级别的子模板
       */
      Yox.prototype.partial = function (name, partial) {
          {
              var instance = this, $partials = instance.$partials;
              if (string(name) && !partial) {
                  return getResource($partials, name, Yox.partial);
              }
              setResource($partials || (instance.$partials = {}), name, partial, Yox.compile);
          }
      };
      /**
       * 注册当前组件级别的过滤器
       */
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
      Yox.prototype.forceUpdate = function (props) {
          {
              var instance = this, $options = instance.$options, $vnode = instance.$vnode, $observer = instance.$observer, computed = $observer.computed;
              if ($vnode && computed) {
                  var template = computed[TEMPLATE_COMPUTED], oldValue = template.get();
                  if (props) {
                      execute($options[HOOK_BEFORE_PROPS_UPDATE], instance, props);
                      instance.set(props);
                  }
                  // 当前可能正在进行下一轮更新
                  $observer.nextTask.run();
                  // 没有更新模板，强制刷新
                  if (!props && oldValue === template.get()) {
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
              return render(instance, instance.$observer, instance.$template, merge(instance.$filters, globalFilters), merge(instance.$partials, globalPartials), merge(instance.$directives, globalDirectives), merge(instance.$transitions, globalTransitions));
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
              var instance_1 = this, $vnode = instance_1.$vnode, $options_1 = instance_1.$options, afterHook_1;
              // 每次渲染重置 refs
              // 在渲染过程中收集最新的 ref
              // 这样可避免更新时，新的 ref，在前面创建，老的 ref 却在后面删除的情况
              instance_1.$refs = {};
              if ($vnode) {
                  execute($options_1[HOOK_BEFORE_UPDATE], instance_1);
                  instance_1.fire(HOOK_BEFORE_UPDATE + NAMESPACE_HOOK);
                  patch(domApi, vnode, oldVnode);
                  afterHook_1 = HOOK_AFTER_UPDATE;
              }
              else {
                  execute($options_1[HOOK_BEFORE_MOUNT], instance_1);
                  instance_1.fire(HOOK_BEFORE_MOUNT + NAMESPACE_HOOK);
                  patch(domApi, vnode, oldVnode);
                  instance_1.$el = vnode.node;
                  afterHook_1 = HOOK_AFTER_MOUNT;
              }
              instance_1.$vnode = vnode;
              // 跟 nextTask 保持一个节奏
              // 这样可以预留一些优化的余地
              Yox.nextTick(function () {
                  if (instance_1.$vnode) {
                      execute($options_1[afterHook_1], instance_1);
                      instance_1.fire(afterHook_1 + NAMESPACE_HOOK);
                  }
              });
          }
      };
      /**
       * 校验组件参数
       *
       * @param props
       */
      Yox.prototype.checkProp = function (key, value) {
      };
      /**
       * 销毁组件
       */
      Yox.prototype.destroy = function () {
          var instance = this, $parent = instance.$parent, $options = instance.$options, $emitter = instance.$emitter, $observer = instance.$observer;
          {
              execute($options[HOOK_BEFORE_DESTROY], instance);
              instance.fire(HOOK_BEFORE_DESTROY + NAMESPACE_HOOK);
              var $vnode = instance.$vnode;
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
      Yox.version = "1.0.0-alpha.121";
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
      return Yox;
  }());
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
          var component = registry[name];
          // 注册的是异步加载函数
          if (func(component)) {
              registry[name] = [callback];
              var componentCallback = function (result) {
                  var queue = registry[name], options = result['default'] || result;
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
      Yox.directive({ event: event, model: model, binding: binding });
      // 全局注册内置过滤器
      Yox.filter({
          hasSlot: function (name) {
              // 不鼓励在过滤器使用 this
              // 因此过滤器没有 this 的类型声明
              // 这个内置过滤器是不得不用 this
              return this.get(SLOT_DATA_PREFIX + name) !== UNDEFINED;
          }
      });
  }

  return Yox;

}));
//# sourceMappingURL=yox.js.map
