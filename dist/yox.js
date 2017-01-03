(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Yox = factory());
}(this, (function () { 'use strict';

/**
 * 为了压缩，定义的常量
 *
 * @type {boolean}
 */
var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;

/**
 * 换行符
 *
 * @type {string}
 */
var BREAKLINE = '\n';

/**
 * 浏览器环境下的 window 对象
 *
 * @type {?Window}
 */
var win = typeof window !== 'undefined' ? window : NULL;

/**
 * 浏览器环境下的 document 对象
 *
 * @type {?Document}
 */
var doc = typeof document !== 'undefined' ? document : NULL;

var toString = Object.prototype.toString;


function is(arg, type) {
  return type === 'numeric' ? numeric(arg) : toString.call(arg).toLowerCase() === '[object ' + type + ']';
}

function func(arg) {
  return is(arg, 'function');
}

function array(arg) {
  return is(arg, 'array');
}

function object(arg) {
  return is(arg, 'object');
}

function string(arg) {
  return is(arg, 'string');
}

function number(arg) {
  return is(arg, 'number');
}

function boolean(arg) {
  return is(arg, 'boolean');
}

function primitive$1(arg) {
  return string(arg) || number(arg) || boolean(arg) || arg == NULL;
}

function numeric(arg) {
  return !isNaN(parseFloat(arg)) && isFinite(arg);
}

var is$1 = Object.freeze({
	is: is,
	func: func,
	array: array,
	object: object,
	string: string,
	number: number,
	boolean: boolean,
	primitive: primitive$1,
	numeric: numeric
});

var callFunction = function (fn, context, args) {
  if (func(fn)) {
    if (array(args)) {
      return fn.apply(context, args);
    } else {
      return fn.call(context, args);
    }
  }
};

var slice = Array.prototype.slice;

/**
 * 遍历数组
 *
 * @param {Array} array
 * @param {Function} callback 返回 false 可停止遍历
 * @param {?boolean} reversed 是否逆序遍历
 */

function each(array$$1, callback, reversed) {
  var length = array$$1.length;

  if (reversed) {
    for (var i = length - 1; i >= 0; i--) {
      if (callback(array$$1[i], i) === FALSE) {
        break;
      }
    }
  } else {
    for (var _i = 0; _i < length; _i++) {
      if (callback(array$$1[_i], _i) === FALSE) {
        break;
      }
    }
  }
}

/**
 * 返回 array2 中包含，array1 中不包含的数组项
 *
 * @param {Array} array1
 * @param {Array} array2
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {Array}
 */
function diff$1(array1, array2, strict) {
  var result = [];
  each(array2, function (item) {
    if (!has$1(array1, item, strict)) {
      result.push(item);
    }
  });
  return result;
}

/**
 * 合并多个数组，不去重
 *
 * @return {Array}
 */
function merge() {
  var args = toArray(arguments);
  var result = [];
  args.unshift(result);
  callFunction(push$1, NULL, args);
  return result;
}

/**
 * 压入数组
 *
 * @param {Array} original
 */
function push$1(original) {
  each(arguments, function (array$$1, index) {
    if (index > 0) {
      if (array(array$$1)) {
        each(array$$1, function (item) {
          original.push(item);
        });
      } else {
        original.push(array$$1);
      }
    }
  });
}

/**
 * 把类数组转成数组
 *
 * @param {Array|ArrayLike} array 类数组
 * @return {Array}
 */
function toArray(array$$1) {
  return array(array$$1) ? array$$1 : slice.call(array$$1);
}

/**
 * 把数组转成对象
 *
 * @param {Array} array 数组
 * @param {?string} key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @return {Object}
 */
function toObject(array$$1, key) {
  var result = {};
  each(array$$1, function (item) {
    result[key ? item[key] : item] = item;
  });
  return result;
}

/**
 * 数组项在数组中的位置
 *
 * @param {Array} array 数组
 * @param {*} item 数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {number} 如果未找到，返回 -1
 */
function indexOf(array$$1, item, strict) {
  if (strict !== FALSE) {
    return array$$1.indexOf(item);
  } else {
    var index = -1;
    each(array$$1, function (value, i) {
      if (item == value) {
        index = i;
        return FALSE;
      }
    });
    return index;
  }
}

/**
 * 数组是否包含 item
 *
 * @param {Array} array 数组
 * @param {*} item 可能包含的数组项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {boolean}
 */
function has$1(array$$1, item, strict) {
  return indexOf(array$$1, item, strict) >= 0;
}

/**
 * 获取数组最后一项
 *
 * @param {Array} array 数组
 * @return {*}
 */
function last(array$$1) {
  return array$$1[array$$1.length - 1];
}

/**
 * 删除数组项
 *
 * @param {Array} array 数组
 * @param {*} item 待删除项
 * @param {?boolean} strict 是否全等判断，默认是全等
 */
function remove$1(array$$1, item, strict) {
  var index = indexOf(array$$1, item, strict);
  if (index >= 0) {
    array$$1.splice(index, 1);
  }
}

/**
 * 用于判断长度不为 0 的数组
 *
 * @param {*} array
 * @return {boolean}
 */
function falsy(array$$1) {
  return !array(array$$1) || array$$1.length === 0;
}

var array$1 = Object.freeze({
	each: each,
	diff: diff$1,
	merge: merge,
	push: push$1,
	toArray: toArray,
	toObject: toObject,
	indexOf: indexOf,
	has: has$1,
	last: last,
	remove: remove$1,
	falsy: falsy
});

/**
 * getter / setter 的判断
 * 直接把最外面传进来参数丢过来用
 */

var magic = function (options) {
  var args = options.args,
      get = options.get,
      set = options.set;

  args = toArray(args);

  var key = args[0],
      value = args[1];
  if (object(key)) {
    callFunction(set, NULL, key);
  } else if (string(key)) {
    var _args = args,
        length = _args.length;

    if (length === 2) {
      callFunction(set, NULL, args);
    } else if (length === 1) {
      return callFunction(get, NULL, key);
    }
  }
};

var toNumber = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (numeric(str)) {
    return +str;
  }
  return defaultValue;
};

var SEPARATOR_KEY = '.';
var SEPARATOR_PATH = '/';
var LEVEL_CURRENT = '.';
var LEVEL_PARENT = '..';

function normalize(str) {
  if (str && str.indexOf('[') > 0 && str.indexOf(']') > 0) {
    // array[0] => array.0
    // object['key'] => array.key
    return str.replace(/\[\s*?([\S]+)\s*?\]/g, function ($0, $1) {
      var firstChar = $1.charAt[0];
      if (firstChar === '"' || firstChar === "'") {
        $1 = $1.slice(1, -1);
      }
      return '.' + $1;
    });
  }
  return str;
}

function parse(str) {
  return str ? normalize(str).split(SEPARATOR_KEY) : [];
}

function stringify(keypaths) {
  return keypaths.filter(function (term) {
    return term !== '' && term !== LEVEL_CURRENT;
  }).join(SEPARATOR_KEY);
}

function resolve(base, path) {
  var list = parse(base);
  each(path.split(SEPARATOR_PATH), function (term) {
    if (term === LEVEL_PARENT) {
      list.pop();
    } else {
      push$1(list, normalize(term));
    }
  });
  return stringify(list);
}

/**
 * 获取对象的 key 的数组
 *
 * @param {Object} object
 * @return {Array}
 */
function keys(object$$1) {
  return Object.keys(object$$1);
}

/**
 * 遍历对象
 *
 * @param {Object} object
 * @param {Function} callback 返回 false 可停止遍历
 */
function each$1(object$$1, callback) {
  each(keys(object$$1), function (key) {
    return callback(object$$1[key], key);
  });
}

/**
 * 对象是否包含某个 key
 *
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
function has$2(object$$1, key) {
  return object$$1.hasOwnProperty(key);
}

/**
 * 扩展对象
 *
 * @return {Object}
 */
function extend() {
  var args = arguments,
      result = args[0];
  for (var i = 1, len = args.length; i < len; i++) {
    if (object(args[i])) {
      each$1(args[i], function (value, key) {
        result[key] = value;
      });
    }
  }
  return result;
}

/**
 * 拷贝对象
 *
 * @param {*} object
 * @param {?boolean} deep 是否需要深拷贝
 * @return {*}
 */
function copy(object$$1, deep) {
  var result = object$$1;
  if (array(object$$1)) {
    result = [];
    each(object$$1, function (item, index) {
      result[index] = deep ? copy(item) : item;
    });
  } else if (object(object$$1)) {
    result = {};
    each$1(object$$1, function (value, key) {
      result[key] = deep ? copy(value) : value;
    });
  }
  return result;
}

/**
 * 从对象中查找一个 keypath
 *
 * 返回值是对象时，表示找了值
 * 返回值是空时，表示没找到值
 *
 * @param {Object} object
 * @param {string|number} keypath
 * @return {?Object}
 */
function get$1(object$$1, keypath) {

  // object 的 key 可能是 'a.b.c' 这样的
  // 如 data['a.b.c'] = 1 是一个合法赋值
  if (has$2(object$$1, keypath)) {
    return {
      value: object$$1[keypath]
    };
  }
  // 不能以 . 开头
  if (string(keypath) && keypath.indexOf('.') > 0) {
    var list = parse(keypath);
    for (var i = 0, len = list.length; i < len && object$$1; i++) {
      if (i < len - 1) {
        object$$1 = object$$1[list[i]];
      } else if (has$2(object$$1, list[i])) {
        return {
          value: object$$1[list[i]]
        };
      }
    }
  }
}

/**
 * 为对象设置一个键值对
 *
 * @param {Object} object
 * @param {string|number} keypath
 * @param {*} value
 * @param {?boolean} autofill 是否自动填充不存在的对象，默认自动填充
 */
function set$1(object$$1, keypath, value, autofill) {
  if (string(keypath) && keypath.indexOf('.') > 0) {
    var originalObject = object$$1;
    var list = parse(keypath);
    var prop = list.pop();
    each(list, function (item, index) {
      if (object$$1[item]) {
        object$$1 = object$$1[item];
      } else if (autofill !== FALSE) {
        object$$1 = object$$1[item] = {};
      } else {
        object$$1 = NULL;
        return FALSE;
      }
    });
    if (object$$1 && object$$1 !== originalObject) {
      object$$1[prop] = value;
    }
  } else {
    object$$1[keypath] = value;
  }
}

var object$1 = Object.freeze({
	keys: keys,
	each: each$1,
	has: has$2,
	extend: extend,
	copy: copy,
	get: get$1,
	set: set$1
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Store = function () {
  function Store() {
    classCallCheck(this, Store);

    this.data = {};
  }

  /**
   * 同步取值
   *
   * @param {string} key
   * @return {*}
   */


  createClass(Store, [{
    key: 'get',
    value: function get(key) {
      return this.data[key];
    }

    /**
     * 异步取值
     *
     * @param {string} key
     * @param {Function} callback
     */

  }, {
    key: 'getAsync',
    value: function getAsync(key, callback) {
      var data = this.data;

      var value = data[key];
      if (func(value)) {
        (function () {
          var $pending = value.$pending;

          if (!$pending) {
            $pending = value.$pending = [callback];
            value(function (replacement) {
              delete value.$pending;
              data[key] = replacement;
              each($pending, function (callback) {
                callback(replacement);
              });
            });
          } else {
            push$1($pending, callback);
          }
        })();
      } else {
        callback(value);
      }
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var data = this.data;

      if (object(key)) {
        each$1(key, function (value, key) {
          data[key] = value;
        });
      } else if (string(key)) {
        data[key] = value;
      }
    }
  }]);
  return Store;
}();

var Event = function () {
  function Event(event) {
    classCallCheck(this, Event);

    if (event.type) {
      this.type = event.type;
      this.originalEvent = event;
    } else {
      this.type = event;
    }
  }

  createClass(Event, [{
    key: 'prevent',
    value: function prevent() {
      if (!this.isPrevented) {
        var originalEvent = this.originalEvent;

        if (originalEvent && func(originalEvent.preventDefault)) {
          originalEvent.preventDefault();
        }
        this.isPrevented = TRUE;
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (!this.isStoped) {
        var originalEvent = this.originalEvent;

        if (originalEvent && func(originalEvent.stopPropagation)) {
          originalEvent.stopPropagation();
        }
        this.isStoped = TRUE;
      }
    }
  }]);
  return Event;
}();

var Emitter = function () {
  function Emitter(options) {
    classCallCheck(this, Emitter);

    extend(this, options);
    this.listeners = {};
  }

  createClass(Emitter, [{
    key: 'on',
    value: function on(type, listener) {
      var listeners = this.listeners,
          afterAdd = this.afterAdd;

      var added = [];

      var addListener = function addListener(listener, type) {
        if (func(listener)) {
          var list = listeners[type] || (listeners[type] = []);
          if (!list.length) {
            push$1(added, type);
          }
          push$1(list, listener);
        }
      };

      if (object(type)) {
        each$1(type, addListener);
      } else if (string(type)) {
        addListener(listener, type);
      }

      if (added.length && func(afterAdd)) {
        afterAdd(added);
      }
    }
  }, {
    key: 'once',
    value: function once(type, listener) {

      var instance = this;
      var addOnce = function addOnce(listener, type) {
        if (func(listener)) {
          listener.$once = function () {
            instance.off(type, listener);
            delete listener.$once;
          };
        }
      };

      if (object(type)) {
        each$1(type, addOnce);
      } else if (string(type)) {
        addOnce(listener, type);
      }

      instance.on(type, listener);
    }
  }, {
    key: 'off',
    value: function off(type, listener) {
      var listeners = this.listeners,
          afterRemove = this.afterRemove;

      var removed = [];

      if (type == NULL) {
        each$1(listeners, function (list, type) {
          if (array(listeners[type])) {
            listeners[type].length = 0;
            push$1(removed, type);
          }
        });
      } else {
        var list = listeners[type];
        if (array(list)) {
          if (listener == NULL) {
            list.length = 0;
          } else {
            remove$1(list, listener);
          }
          if (!list.length) {
            push$1(removed, type);
          }
        }
      }

      if (removed.length && func(afterRemove)) {
        afterRemove(removed);
      }
    }
  }, {
    key: 'fire',
    value: function fire(type, data, context) {

      if (arguments.length === 2) {
        context = NULL;
      }

      var done = TRUE;
      var handle = function handle(list, data) {
        if (array(list)) {
          each(list, function (listener) {
            var result = callFunction(listener, context, data);

            var $once = listener.$once;

            if (func($once)) {
              $once();
            }

            // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
            if (data instanceof Event) {
              if (result === FALSE) {
                data.prevent();
                data.stop();
              } else if (data.isStoped) {
                result = FALSE;
              }
            }

            if (result === FALSE) {
              return done = FALSE;
            }
          });
        }
      };

      var listeners = this.listeners;

      handle(listeners[type], data);

      // user.* 能响应 user.name
      // *.* 能响应 user.name
      // * 能响应 user.name
      //
      // ** 可以响应所有数据变化，是一个超级通配符的存在
      if (done) {
        each$1(listeners, function (list, key) {
          if (key !== type || key.indexOf('*') >= 0) {
            key = ['^', key.replace(/\./g, '\\.').replace(/\*\*/g, '([\.\\w]+?)').replace(/\*/g, '(\\w+)'), key.endsWith('**') ? '' : '$'];
            var match = type.match(new RegExp(key.join('')));
            if (match) {
              handle(list, merge(data, toArray(match).slice(1)));
            }
            return done;
          }
        });
      }

      return done;
    }
  }, {
    key: 'has',
    value: function has(type, listener) {
      var list = this.listeners[type];
      if (listener == NULL) {
        // 是否注册过 type 事件
        return array(list) && list.length > 0;
      }
      return array(list) ? has$1(list, listener) : FALSE;
    }
  }]);
  return Emitter;
}();

/**
 * 转成驼峰
 *
 * @param {string} str
 * @return {string}
 */
function camelCase(str) {
  return str.replace(/-([a-z])/gi, function ($0, $1) {
    return $1.toUpperCase();
  });
}

/**
 * 首字母大写
 *
 * @param {string} str
 * @return {string}
 */
function capitalize(str) {
  return charAt$1(str, 0).toUpperCase() + str.slice(1);
}

/**
 * 把字符串解析成对象形式
 *
 * 为了给外部去重的机会，返回的是数组而不是对象
 *
 * @param {string} str
 * @param {string} separator 分隔符，如 & ;
 * @param {string} pair 键值对分隔符，如 = :
 * @return {Array}
 */
function parse$1(str, separator, pair) {
  var result = [];
  if (string(str)) {
    (function () {
      var terms = void 0,
          key = void 0,
          value = void 0,
          item = void 0;
      each(str.split(separator), function (term) {
        terms = term.split(pair);
        key = terms[0];
        value = terms[1];
        if (key) {
          item = {
            key: trim(key)
          };
          if (string(value)) {
            item.value = trim(value);
          }
          push$1(result, item);
        }
      });
    })();
  }
  return result;
}

/**
 * 为了压缩而存在的几个方法
 */
function trim(str) {
  return str ? str.trim() : '';
}
function charAt$1(str, index) {
  return str.charAt(index);
}
function charCodeAt$1(str, index) {
  return str.charCodeAt(index);
}

// export function replace(str, pattern, replacement) {
//   pattern = pattern.replace(/[$.]/g, '\\$&')
//   return str.replace(
//     new RegExp(`(?:^|\\b)${pattern}(?:$|\\b)`, 'g'),
//     replacement
//   )
// }
//
// export function falsy(str) {
//   return !is.string(str) || str === ''
// }

var string$1 = Object.freeze({
	camelCase: camelCase,
	capitalize: capitalize,
	parse: parse$1,
	trim: trim,
	charAt: charAt$1,
	charCodeAt: charCodeAt$1
});

/**
 * 是否有原生的日志特性，没有必要单独实现
 *
 * @param {boolean}
 */
var hasConsole = typeof console !== 'undefined';

var tester = function tester() {/** yox */};
var debug = /yox/.test(tester.toString());

// 全局可覆盖
// 比如开发环境，开了 debug 模式，但是有时候觉得看着一堆日志特烦，想强制关掉
// 比如线上环境，关了 debug 模式，为了调试，想强制打开
function isDebug() {
  if (win) {
    var DEBUG = win.DEBUG;

    if (boolean(DEBUG)) {
      return BEBUG;
    }
  }
  return debug;
}

/**
 * 打印普通日志
 *
 * @param {string} msg
 */
function log$1(msg) {
  if (hasConsole && isDebug()) {
    console.log('[Yox log]: ' + msg);
  }
}

/**
 * 打印警告日志
 *
 * @param {string} msg
 */
function warn$1(msg) {
  if (hasConsole && isDebug()) {
    console.warn('[Yox warn]: ' + msg);
  }
}

/**
 * 打印错误日志
 *
 * @param {string} msg
 */
function error$1(msg) {
  if (hasConsole) {
    console.error('[Yox error]: ' + msg);
  }
}

var nextTick$1 = void 0;

if (typeof MutationObserver === 'function') {
  nextTick$1 = function nextTick$1(fn) {
    var observer = new MutationObserver(fn);
    var textNode = doc.createTextNode('');
    observer.observe(textNode, {
      characterData: TRUE
    });
    textNode.data = ' ';
  };
} else if (typeof setImmediate === 'function') {
  nextTick$1 = function nextTick$1(fn) {
    setImmediate(fn);
  };
} else {
  nextTick$1 = function nextTick$1(fn) {
    setTimeout(fn);
  };
}

var nextTick$2 = nextTick$1;

var nextTasks = [];

/**
 * 添加异步任务
 *
 * @param {Function} task
 */
function add(task) {
  if (!nextTasks.length) {
    nextTick$2(run);
  }
  push$1(nextTasks, task);
}

/**
 * 立即执行已添加的任务
 */
function run() {
  var tasks = nextTasks;
  nextTasks = [];
  each(tasks, function (task) {
    task();
  });
}

/**
 * 是否是数字
 *
 * @param {number} charCode
 * @return {boolean}
 */
function isNumber(charCode) {
  return charCode >= 48 && charCode <= 57; // 0...9
}

/**
 * 是否是空白符
 *
 * @param {number} charCode
 * @return {boolean}
 */
function isWhitespace(charCode) {
  return charCode === 32 // space
  || charCode === 9; // tab
}

/**
 * 变量开始字符必须是 字母、下划线、$
 *
 * @param {number} charCode
 * @return {boolean}
 */
function isIdentifierStart(charCode) {
  return charCode === 36 // $
  || charCode === 95 // _
  || charCode >= 97 && charCode <= 122 // a...z
  || charCode >= 65 && charCode <= 90; // A...Z
}

/**
 * 变量剩余的字符必须是 字母、下划线、$、数字
 *
 * @param {number} charCode
 * @return {boolean}
 */
function isIdentifierPart(charCode) {
  return isIdentifierStart(charCode) || isNumber(charCode);
}

/**
 * 倒排对象的 key
 *
 * @param {Object} obj
 * @return {Array.<string>}
 */
function sortKeys(obj) {
  return keys(obj).sort(function (a, b) {
    return b.length - a.length;
  });
}

/**
 * 用倒排 token 去匹配 content 的开始内容
 *
 * @param {string} content
 * @param {Array.<string>} sortedTokens 数组长度从大到小排序
 * @return {?string}
 */
function matchBestToken(content, sortedTokens) {
  var result = void 0;
  each(sortedTokens, function (token) {
    if (content.startsWith(token)) {
      result = token;
      return FALSE;
    }
  });
  return result;
}

/**
 * 数组表达式，如 [ 1, 2, 3 ]
 *
 * @type {number}
 */
var ARRAY = 1;

/**
 * 二元表达式，如 a + b
 *
 * @type {number}
 */
var BINARY = 2;

/**
 * 函数调用表达式，如 a()
 *
 * @type {number}
 */
var CALL = 3;

/**
 * 三元表达式，如 a ? b : c
 *
 * @type {number}
 */
var CONDITIONAL = 4;

/**
 * 标识符
 *
 * @type {number}
 */
var IDENTIFIER = 5;

/**
 * 字面量
 *
 * @type {number}
 */
var LITERAL = 6;

/**
 * 对象属性或数组下标
 *
 * @type {number}
 */
var MEMBER = 7;

/**
 * 一元表达式，如 - a
 *
 * @type {number}
 */
var UNARY = 8;

var PLUS = '+';
var MINUS = '-';
var MULTIPLY = '*';
var DIVIDE = '/';
var MODULO = '%';
var WAVE = '~';

var AND = '&&';
var OR = '||';
var NOT = '!';
var BOOLEAN = '!!';

var SE = '===';
var SNE = '!==';
var LE = '==';
var LNE = '!=';
var LT = '<';
var LTE = '<=';
var GT = '>';
var GTE = '>=';

// 一元操作符
var unaryMap = {};

unaryMap[PLUS] = unaryMap[MINUS] = unaryMap[NOT] = unaryMap[WAVE] = unaryMap[BOOLEAN] = TRUE;

var unaryList = sortKeys(unaryMap);

// 二元操作符
// 操作符和对应的优先级，数字越大优先级越高
var binaryMap = {};

binaryMap[OR] = 1;

binaryMap[AND] = 2;

binaryMap[LE] = binaryMap[LNE] = binaryMap[SE] = binaryMap[SNE] = 3;

binaryMap[LT] = binaryMap[LTE] = binaryMap[GT] = binaryMap[GTE] = 4;

binaryMap[PLUS] = binaryMap[MINUS] = 5;

binaryMap[MULTIPLY] = binaryMap[DIVIDE] = binaryMap[MODULO] = 6;

var binaryList = sortKeys(binaryMap);

/**
 * 节点基类
 */
var Node = function Node(type) {
  classCallCheck(this, Node);

  this.type = type;
};

/**
 * Array 节点
 *
 * @param {Array.<Node>} elements
 */

var Array$1 = function (_Node) {
  inherits(Array, _Node);

  function Array(elements) {
    classCallCheck(this, Array);

    var _this = possibleConstructorReturn(this, (Array.__proto__ || Object.getPrototypeOf(Array)).call(this, ARRAY));

    _this.elements = elements;
    return _this;
  }

  return Array;
}(Node);

/**
 * Binary 节点
 *
 * @param {Node} right
 * @param {string} operator
 * @param {Node} left
 */

var Binary = function (_Node) {
  inherits(Binary, _Node);

  function Binary(right, operator, left) {
    classCallCheck(this, Binary);

    var _this = possibleConstructorReturn(this, (Binary.__proto__ || Object.getPrototypeOf(Binary)).call(this, BINARY));

    _this.right = right;
    _this.operator = operator;
    _this.left = left;
    return _this;
  }

  return Binary;
}(Node);

Binary[OR] = function (a, b) {
  return a || b;
};
Binary[AND] = function (a, b) {
  return a && b;
};
Binary[SE] = function (a, b) {
  return a === b;
};
Binary[SNE] = function (a, b) {
  return a !== b;
};
Binary[LE] = function (a, b) {
  return a == b;
};
Binary[LNE] = function (a, b) {
  return a != b;
};
Binary[LT] = function (a, b) {
  return a < b;
};
Binary[LTE] = function (a, b) {
  return a <= b;
};
Binary[GT] = function (a, b) {
  return a > b;
};
Binary[GTE] = function (a, b) {
  return a >= b;
};
Binary[PLUS] = function (a, b) {
  return a + b;
};
Binary[MINUS] = function (a, b) {
  return a - b;
};
Binary[MULTIPLY] = function (a, b) {
  return a * b;
};
Binary[DIVIDE] = function (a, b) {
  return a / b;
};
Binary[MODULO] = function (a, b) {
  return a % b;
};

/**
 * Call 节点
 *
 * @param {Node} callee
 * @param {Array.<Node>} args
 */

var Call = function (_Node) {
  inherits(Call, _Node);

  function Call(callee, args) {
    classCallCheck(this, Call);

    var _this = possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this, CALL));

    _this.callee = callee;
    _this.args = args;
    return _this;
  }

  return Call;
}(Node);

/**
 * Conditional 节点
 *
 * @param {Node} test
 * @param {Node} consequent
 * @param {Node} alternate
 */

var Conditional = function (_Node) {
  inherits(Conditional, _Node);

  function Conditional(test, consequent, alternate) {
    classCallCheck(this, Conditional);

    var _this = possibleConstructorReturn(this, (Conditional.__proto__ || Object.getPrototypeOf(Conditional)).call(this, CONDITIONAL));

    _this.test = test;
    _this.consequent = consequent;
    _this.alternate = alternate;
    return _this;
  }

  return Conditional;
}(Node);

/**
 * Identifier 节点
 *
 * @param {string} name
 */

var Identifier = function (_Node) {
  inherits(Identifier, _Node);

  function Identifier(name) {
    classCallCheck(this, Identifier);

    var _this = possibleConstructorReturn(this, (Identifier.__proto__ || Object.getPrototypeOf(Identifier)).call(this, IDENTIFIER));

    _this.name = name;
    return _this;
  }

  return Identifier;
}(Node);

/**
 * Literal 节点
 *
 * @param {string} value
 */

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(value) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this, LITERAL));

    _this.value = value;
    return _this;
  }

  return Literal;
}(Node);

/**
 * Member 节点
 *
 * @param {Identifier} object
 * @param {Node} prop
 */

var Member = function (_Node) {
  inherits(Member, _Node);

  function Member(object, prop) {
    classCallCheck(this, Member);

    var _this = possibleConstructorReturn(this, (Member.__proto__ || Object.getPrototypeOf(Member)).call(this, MEMBER));

    _this.object = object;
    _this.prop = prop;
    return _this;
  }

  return Member;
}(Node);

Member.flatten = function (node) {

  var result = [];

  var next = void 0;
  do {
    next = node.object;
    if (node.type === MEMBER) {
      result.unshift(node.prop);
    } else {
      result.unshift(node);
    }
  } while (node = next);

  return result;
};

/**
 * Unary 节点
 *
 * @param {string} operator
 * @param {Node} arg
 */

var Unary = function (_Node) {
  inherits(Unary, _Node);

  function Unary(operator, arg) {
    classCallCheck(this, Unary);

    var _this = possibleConstructorReturn(this, (Unary.__proto__ || Object.getPrototypeOf(Unary)).call(this, UNARY));

    _this.operator = operator;
    _this.arg = arg;
    return _this;
  }

  return Unary;
}(Node);

Unary[PLUS] = function (value) {
  return +value;
};
Unary[MINUS] = function (value) {
  return -value;
};
Unary[NOT] = function (value) {
  return !value;
};
Unary[WAVE] = function (value) {
  return ~value;
};
Unary[BOOLEAN] = function (value) {
  return !!value;
};

// 分隔符
var COMMA = 44; // ,
var PERIOD = 46; // .
var SQUOTE = 39; // '
var DQUOTE = 34; // "
var OPAREN = 40; // (
var CPAREN = 41; // )
var OBRACK = 91; // [
var CBRACK = 93; // ]
var QUMARK = 63; // ?
var COLON = 58; // :

// 区分关键字和普通变量
// 举个例子：a === true
// 从解析器的角度来说，a 和 true 是一样的 token
var keywords = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED
};

// 缓存编译结果
var cache$1 = {};

/**
 * 序列化表达式
 *
 * @param {Node} node
 * @return {string}
 */
function stringify$1(node) {

  var recursion = function recursion(node) {
    return stringify$1(node);
  };

  switch (node.type) {
    case ARRAY:
      return '[' + node.elements.map(recursion).join(', ') + ']';

    case BINARY:
      return stringify$1(node.left) + ' ' + node.operator + ' ' + stringify$1(node.right);

    case CALL:
      return stringify$1(node.callee) + '(' + node.args.map(recursion).join(', ') + ')';

    case CONDITIONAL:
      return stringify$1(node.test) + ' ? ' + stringify$1(node.consequent) + ' : ' + stringify$1(node.alternate);

    case IDENTIFIER:
      return node.name;

    case LITERAL:
      var value = node.value;

      if (string(value)) {
        return value.indexOf('"') >= 0 ? '\'' + value + '\'' : '"' + value + '"';
      }
      return value;

    case MEMBER:
      return Member.flatten(node).map(function (node, index) {
        if (node.type === LITERAL) {
          var _node = node,
              _value = _node.value;

          return numeric(_value) ? '[' + _value + ']' : '.' + _value;
        } else {
          node = stringify$1(node);
          return index > 0 ? '[' + node + ']' : node;
        }
      }).join('');

    case UNARY:
      return '' + node.operator + stringify$1(node.arg);
  }
}

/**
 * 表达式求值
 *
 * @param {Node} node
 * @param {Context} context
 * @return {*}
 */
function execute(node, context) {

  var deps = {},
      value = void 0,
      result = void 0;

  (function () {
    switch (node.type) {
      case ARRAY:
        value = [];
        each(node.elements, function (node) {
          result = execute(node, context);
          push$1(value, result.value);
          extend(deps, result.deps);
        });
        break;

      case BINARY:
        var left = node.left,
            right = node.right;

        left = execute(left, context);
        right = execute(right, context);
        value = Binary[node.operator](left.value, right.value);
        deps = extend(left.deps, right.deps);
        break;

      case CALL:
        result = execute(node.callee, context);
        deps = result.deps;
        value = callFunction(result.value, NULL, node.args.map(function (node) {
          var result = execute(node, context);
          extend(deps, result.deps);
          return result.value;
        }));
        break;

      case CONDITIONAL:
        var test = node.test,
            consequent = node.consequent,
            alternate = node.alternate;

        test = execute(test, context);
        if (test.value) {
          consequent = execute(consequent, context);
          value = consequent.value;
          deps = extend(test.deps, consequent.deps);
        } else {
          alternate = execute(alternate, context);
          value = alternate.value;
          deps = extend(test.deps, alternate.deps);
        }
        break;

      case IDENTIFIER:
        result = context.get(node.name);
        value = result.value;
        deps[result.keypath] = value;
        break;

      case LITERAL:
        value = node.value;
        break;

      case MEMBER:
        var keys$$1 = [];
        each(Member.flatten(node), function (node, index) {
          var type = node.type;

          if (type !== LITERAL) {
            if (index > 0) {
              var _result = execute(node, context);
              push$1(keys$$1, _result.value);
              extend(deps, _result.deps);
            } else if (type === IDENTIFIER) {
              push$1(keys$$1, node.name);
            }
          } else {
            push$1(keys$$1, node.value);
          }
        });
        result = context.get(stringify(keys$$1));
        value = result.value;
        deps[result.keypath] = value;
        break;

      case UNARY:
        result = execute(node.arg, context);
        value = Unary[node.operator](result.value);
        deps = result.deps;
        break;
    }
  })();

  return { value: value, deps: deps };
}

/**
 * 把表达式编译成抽象语法树
 *
 * @param {string} content 表达式字符串
 * @return {Object}
 */
function compile$1(content) {

  if (has$2(cache$1, content)) {
    return cache$1[content];
  }

  var length = content.length;

  var index = 0,
      charCode = void 0,
      value = void 0;

  var getChar = function getChar() {
    return charAt$1(content, index);
  };
  var getCharCode = function getCharCode() {
    return charCodeAt$1(content, index);
  };
  var throwError = function throwError() {
    error$1('Failed to compile expression: ' + BREAKLINE + content);
  };

  var skipWhitespace = function skipWhitespace() {
    while (isWhitespace(getCharCode())) {
      index++;
    }
  };

  var skipNumber = function skipNumber() {
    while (isNumber(getCharCode())) {
      index++;
    }
  };

  var skipString = function skipString() {
    var closed = void 0,
        quote = getCharCode();
    index++;
    while (index < length) {
      index++;
      if (charCodeAt$1(content, index - 1) === quote) {
        closed = TRUE;
        break;
      }
    }
    if (!closed) {
      return throwError();
    }
  };

  var skipIdentifier = function skipIdentifier() {
    // 第一个字符一定是经过 isIdentifierStart 判断的
    // 因此循环至少要执行一次
    do {
      index++;
    } while (isIdentifierPart(getCharCode()));
  };

  var parseNumber = function parseNumber() {

    var start = index;

    skipNumber();
    if (getCharCode() === PERIOD) {
      index++;
      skipNumber();
    }

    return new Literal(parseFloat(content.substring(start, index)));
  };

  var parseString = function parseString() {

    var start = index;

    skipString();

    return new Literal(content.substring(start + 1, index - 1));
  };

  var parseIdentifier = function parseIdentifier() {

    var start = index;
    skipIdentifier();

    value = content.substring(start, index);
    if (keywords[value]) {
      return new Literal(keywords[value]);
    }

    // this 也视为 IDENTIFIER
    if (value) {
      return new Identifier(value);
    }

    throwError();
  };

  var parseTuple = function parseTuple(delimiter) {

    var args = [],
        closed = void 0;

    while (index < length) {
      charCode = getCharCode();
      if (charCode === delimiter) {
        index++;
        closed = TRUE;
        break;
      } else if (charCode === COMMA) {
        index++;
      } else {
        push$1(args, parseExpression());
      }
    }

    if (closed) {
      return args;
    }

    throwError();
  };

  var parseOperator = function parseOperator(sortedOperatorList) {
    skipWhitespace();
    value = matchBestToken(content.slice(index), sortedOperatorList);
    if (value) {
      index += value.length;
      return value;
    }
  };

  var parseVariable = function parseVariable() {

    value = parseIdentifier();

    while (index < length) {
      // a(x)
      charCode = getCharCode();
      if (charCode === OPAREN) {
        index++;
        value = new Call(value, parseTuple(CPAREN));
        break;
      } else {
        // a.x
        if (charCode === PERIOD) {
          index++;
          value = new Member(value, new Literal(parseIdentifier().name));
        }
        // a[x]
        else if (charCode === OBRACK) {
            index++;
            value = new Member(value, parseSubexpression(CBRACK));
          } else {
            break;
          }
      }
    }

    return value;
  };

  var parseToken = function parseToken() {
    skipWhitespace();

    charCode = getCharCode();
    // 'xx' 或 "xx"
    if (charCode === SQUOTE || charCode === DQUOTE) {
      return parseString();
    }
    // 1.1 或 .1
    else if (isNumber(charCode) || charCode === PERIOD) {
        return parseNumber();
      }
      // [xx, xx]
      else if (charCode === OBRACK) {
          index++;
          return new Array$1(parseTuple(CBRACK));
        }
        // (xx, xx)
        else if (charCode === OPAREN) {
            index++;
            return parseSubexpression(CPAREN);
          } else if (isIdentifierStart(charCode)) {
            return parseVariable();
          }
    value = parseOperator(unaryList);
    if (value) {
      return parseUnary(value);
    }
    throwError();
  };

  var parseUnary = function parseUnary(op) {
    value = parseToken();
    if (value) {
      return new Unary(op, value);
    }
    throwError();
  };

  var parseBinary = function parseBinary() {

    var left = parseToken();
    var op = parseOperator(binaryList);
    if (!op) {
      return left;
    }

    var right = parseToken();
    var stack = [left, op, binaryMap[op], right];

    while (op = parseOperator(binaryList)) {

      // 处理左边
      if (stack.length > 3 && binaryMap[op] < stack[stack.length - 2]) {
        push$1(stack, new Binary(stack.pop(), (stack.pop(), stack.pop()), stack.pop()));
      }

      right = parseToken();
      if (right) {
        push$1(stack, op, binaryMap[op], right);
      } else {
        throwError();
      }
    }

    // 处理右边
    // 右边只有等到所有 token 解析完成才能开始
    // 比如 a + b * c / d
    // 此时右边的优先级 >= 左边的优先级，因此可以脑残的直接逆序遍历

    right = stack.pop();
    while (stack.length > 1) {
      right = new Binary(right, (stack.pop(), stack.pop()), stack.pop());
    }

    return right;
  };

  // (xx) 和 [xx] 都可能是子表达式，因此
  var parseSubexpression = function parseSubexpression(delimiter) {
    value = parseExpression();
    if (getCharCode() === delimiter) {
      index++;
      return value;
    }
    throwError();
  };

  var parseExpression = function parseExpression() {

    // 主要是区分三元和二元表达式
    // 三元表达式可以认为是 3 个二元表达式组成的
    // test ? consequent : alternate

    var test = parseBinary();

    skipWhitespace();
    if (getCharCode() === QUMARK) {
      index++;

      var consequent = parseBinary();

      skipWhitespace();
      if (getCharCode() === COLON) {
        index++;

        var alternate = parseBinary();

        // 保证调用 parseExpression() 之后无需再次调用 skipWhitespace()
        skipWhitespace();
        return new Conditional(test, consequent, alternate);
      } else {
        throwError();
      }
    }

    return test;
  };

  return cache$1[content] = parseExpression();
}

var IF = '#if';
var ELSE = 'else';
var ELSE_IF = 'else if';
var EACH = '#each';
var PARTIAL = '#partial';
var IMPORT = '>';
var COMMENT = ':';
var SPREAD = '...';

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';

var DIRECTIVE_CUSTOM_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var DIRECTIVE_REF = 'ref';
var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';

var KEYWORD_UNIQUE = 'key';

var DELIMITER_OPENING = '(?:\\{)?\\{\\{\\s*';
var DELIMITER_CLOSING = '\\s*\\}\\}(?:\\})?';

/**
 * if 节点
 *
 * @type {number}
 */
var IF$1 = 1;

/**
 * else if 节点
 *
 * @type {number}
 */
var ELSE_IF$1 = 2;

/**
 * else 节点
 *
 * @type {number}
 */
var ELSE$1 = 3;

/**
 * each 节点
 *
 * @type {number}
 */
var EACH$1 = 4;

/**
 * partial 节点
 *
 * @type {number}
 */
var PARTIAL$1 = 5;

/**
 * import 节点
 *
 * @type {number}
 */
var IMPORT$1 = 6;

/**
 * 表达式 节点
 *
 * @type {number}
 */
var EXPRESSION = 7;

/**
 * 延展操作 节点
 *
 * @type {number}
 */
var SPREAD$1 = 8;

/**
 * 指令 节点
 *
 * @type {number}
 */
var DIRECTIVE = 9;

/**
 * 元素 节点
 *
 * @type {number}
 */
var ELEMENT = 10;

/**
 * 属性 节点
 *
 * @type {number}
 */
var ATTRIBUTE = 11;

/**
 * 文本 节点
 *
 * @type {number}
 */
var TEXT = 12;

/**
 * 如果取值/设值指定了 . 或 ..，表示无需 lookup，而是直接操作某个层级
 */

var Context = function () {

  /**
   * @param {Object} data
   * @param {?Context} parent
   */
  function Context(data, parent) {
    classCallCheck(this, Context);

    this.data = copy(data);
    this.parent = parent;
    this.cache = {};
  }

  createClass(Context, [{
    key: 'push',
    value: function push(data) {
      return new Context(data, this);
    }
  }, {
    key: 'pop',
    value: function pop() {
      return this.parent;
    }
  }, {
    key: 'format',
    value: function format(keypath) {
      var instance = this,
          keys$$1 = parse(keypath);
      if (keys$$1[0] === 'this') {
        keys$$1.shift();
        return {
          keypath: stringify(keys$$1),
          instance: instance
        };
      } else {
        var _ret = function () {
          var lookup = TRUE,
              index = 0;
          var levelMap = {};
          levelMap[LEVEL_CURRENT] = 0;
          levelMap[LEVEL_PARENT] = 1;

          each(keys$$1, function (key, i) {
            if (has$2(levelMap, key)) {
              lookup = FALSE;
              if (levelMap[key]) {
                instance = instance.parent;
                if (!instance) {
                  return FALSE;
                }
              }
            } else {
              index = i;
              return FALSE;
            }
          });
          return {
            v: {
              keypath: stringify(keys$$1.slice(index)),
              instance: instance,
              lookup: lookup
            }
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var _format = this.format(key),
          instance = _format.instance,
          keypath = _format.keypath;

      if (instance && keypath) {
        if (has$2(instance.cache, keypath)) {
          delete instance.cache[keypath];
        }
        set$1(instance.data, keypath, value);
      }
    }
  }, {
    key: 'get',
    value: function get(key) {
      var _format2 = this.format(key),
          instance = _format2.instance,
          keypath = _format2.keypath,
          lookup = _format2.lookup;

      if (instance) {
        var _instance = instance,
            data = _instance.data,
            cache = _instance.cache;

        if (!has$2(cache, keypath)) {
          if (keypath) {
            var result = void 0;

            if (lookup) {
              var keys$$1 = [keypath];
              while (instance) {
                result = get$1(instance.data, keypath);
                if (result) {
                  break;
                } else {
                  instance = instance.parent;
                  keys$$1.unshift(LEVEL_PARENT);
                }
              }
              keypath = keys$$1.join(SEPARATOR_PATH);
            } else {
              result = get$1(data, keypath);
            }

            if (result) {
              cache[keypath] = result.value;
            }
          } else {
            cache[keypath] = data;
          }
        }

        return {
          keypath: keypath,
          value: cache[keypath]
        };
      }

      return {
        keypath: key
      };
    }
  }]);
  return Context;
}();

var Scanner = function () {
  function Scanner(str) {
    classCallCheck(this, Scanner);

    this.init(str);
  }

  createClass(Scanner, [{
    key: 'init',
    value: function init(str) {
      this.pos = 0;
      this.tail = str;
    }

    /**
     * 扫描是否结束
     *
     * @return {boolean}
     */

  }, {
    key: 'hasNext',
    value: function hasNext() {
      return this.tail;
    }

    /**
     * 从剩下的字符串中尝试匹配 pattern
     * pattern 必须位于字符串的开始位置
     * 匹配成功后，位置修改为匹配结果之后
     * 返回匹配字符串
     *
     * @param {RegExp} pattern
     * @return {string}
     */

  }, {
    key: 'nextAfter',
    value: function nextAfter(pattern) {
      var tail = this.tail;

      var matches = tail.match(pattern);
      if (!matches || matches.index) {
        return '';
      }
      var result = matches[0];
      this.forward(result.length);
      return result;
    }

    /**
     * 从剩下的字符串中尝试匹配 pattern
     * pattern 不要求一定要位于字符串的开始位置
     * 匹配成功后，位置修改为匹配结果之前
     * 返回上次位置和当前位置之间的字符串
     *
     * @param {RegExp} pattern
     * @return {string}
     */

  }, {
    key: 'nextBefore',
    value: function nextBefore(pattern) {
      var pos = this.pos,
          tail = this.tail;

      var matches = tail.match(pattern);
      if (matches) {
        var index = matches.index;

        if (!index) {
          return '';
        }
        var result = tail.substr(0, index);
        this.forward(index);
        return result;
      } else {
        this.forward(tail.length);
        return tail;
      }
    }
  }, {
    key: 'forward',
    value: function forward(offset) {
      this.pos += offset;
      this.tail = this.tail.slice(offset);
    }
  }, {
    key: 'charAt',
    value: function charAt(index) {
      return charAt$1(this.tail, index);
    }
  }, {
    key: 'charCodeAt',
    value: function charCodeAt(index) {
      return charCodeAt$1(this.tail, index);
    }
  }]);
  return Scanner;
}();

/**
 * 节点基类
 */

var Node$2 = function () {
  function Node(type, hasChildren) {
    classCallCheck(this, Node);

    this.type = type;
  }

  createClass(Node, [{
    key: 'addChild',
    value: function addChild(child) {
      push$1(this.children || (this.children = []), child);
    }
  }]);
  return Node;
}();

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 */

var Attribute = function (_Node) {
  inherits(Attribute, _Node);

  function Attribute(name) {
    classCallCheck(this, Attribute);

    var _this = possibleConstructorReturn(this, (Attribute.__proto__ || Object.getPrototypeOf(Attribute)).call(this, ATTRIBUTE));

    _this.name = name;
    return _this;
  }

  return Attribute;
}(Node$2);

/**
 * 指令节点
 *
 * on-click="submit"  name 是 event, subName 是 click，value 是 submit
 *
 * @param {string} name 指令名
 * @param {?string} subName 指令子名
 */

var Directive = function (_Node) {
  inherits(Directive, _Node);

  function Directive(name, subName) {
    classCallCheck(this, Directive);

    var _this = possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this, DIRECTIVE));

    _this.name = camelCase(name);
    if (subName) {
      _this.subName = camelCase(subName);
    }
    return _this;
  }

  return Directive;
}(Node$2);

/**
 * each 节点
 *
 * @param {Expression} expr
 * @param {string} index
 */

var Each = function (_Node) {
  inherits(Each, _Node);

  function Each(expr, index) {
    classCallCheck(this, Each);

    var _this = possibleConstructorReturn(this, (Each.__proto__ || Object.getPrototypeOf(Each)).call(this, EACH$1));

    _this.expr = expr;
    if (index) {
      _this.index = index;
    }
    return _this;
  }

  return Each;
}(Node$2);

/**
 * 元素节点
 *
 * @param {string} name
 * @param {?boolean} component 是否是组件
 */

var Element = function (_Node) {
  inherits(Element, _Node);

  function Element(name, component) {
    classCallCheck(this, Element);

    var _this = possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, ELEMENT));

    _this.name = name;
    if (component) {
      _this.component = component;
    }
    return _this;
  }

  createClass(Element, [{
    key: 'addAttr',
    value: function addAttr(child) {
      push$1(this.attrs || (this.attrs = []), child);
    }
  }]);
  return Element;
}(Node$2);

/**
 * else 节点
 */

var Else = function (_Node) {
  inherits(Else, _Node);

  function Else() {
    classCallCheck(this, Else);
    return possibleConstructorReturn(this, (Else.__proto__ || Object.getPrototypeOf(Else)).call(this, ELSE$1));
  }

  return Else;
}(Node$2);

/**
 * else if 节点
 *
 * @param {Expression} expr 判断条件
 */

var ElseIf = function (_Node) {
  inherits(ElseIf, _Node);

  function ElseIf(expr) {
    classCallCheck(this, ElseIf);

    var _this = possibleConstructorReturn(this, (ElseIf.__proto__ || Object.getPrototypeOf(ElseIf)).call(this, ELSE_IF$1));

    _this.expr = expr;
    return _this;
  }

  return ElseIf;
}(Node$2);

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */

var Expression = function (_Node) {
  inherits(Expression, _Node);

  function Expression(expr, safe) {
    classCallCheck(this, Expression);

    var _this = possibleConstructorReturn(this, (Expression.__proto__ || Object.getPrototypeOf(Expression)).call(this, EXPRESSION));

    _this.expr = expr;
    _this.safe = safe;
    return _this;
  }

  return Expression;
}(Node$2);

/**
 * if 节点
 *
 * @param {Expression} expr 判断条件
 */

var If = function (_Node) {
  inherits(If, _Node);

  function If(expr) {
    classCallCheck(this, If);

    var _this = possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).call(this, IF$1));

    _this.expr = expr;
    return _this;
  }

  return If;
}(Node$2);

/**
 * import 节点
 *
 * @param {string} name
 */

var Import = function (_Node) {
  inherits(Import, _Node);

  function Import(name) {
    classCallCheck(this, Import);

    var _this = possibleConstructorReturn(this, (Import.__proto__ || Object.getPrototypeOf(Import)).call(this, IMPORT$1));

    _this.name = name;
    return _this;
  }

  return Import;
}(Node$2);

/**
 * Partial 节点
 *
 * @param {string} name
 */

var Partial = function (_Node) {
  inherits(Partial, _Node);

  function Partial(name) {
    classCallCheck(this, Partial);

    var _this = possibleConstructorReturn(this, (Partial.__proto__ || Object.getPrototypeOf(Partial)).call(this, PARTIAL$1));

    _this.name = name;
    return _this;
  }

  return Partial;
}(Node$2);

/**
 * 延展操作 节点
 *
 * @param {Expression} expr
 */

var Spread = function (_Node) {
  inherits(Spread, _Node);

  function Spread(expr) {
    classCallCheck(this, Spread);

    var _this = possibleConstructorReturn(this, (Spread.__proto__ || Object.getPrototypeOf(Spread)).call(this, SPREAD$1));

    _this.expr = expr;
    return _this;
  }

  return Spread;
}(Node$2);

/**
 * 文本节点
 *
 * @param {*} content
 */

var Text = function (_Node) {
  inherits(Text, _Node);

  function Text(content) {
    classCallCheck(this, Text);

    var _this = possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, TEXT));

    _this.content = content;
    return _this;
  }

  return Text;
}(Node$2);

var EQUAL = 61; // =
var SLASH = 47; // /
var ARROW_LEFT = 60; // <
var ARROW_RIGHT = 62; // >
var openingDelimiterPattern = new RegExp(DELIMITER_OPENING);
var closingDelimiterPattern = new RegExp(DELIMITER_CLOSING);

var elementPattern = /<(?:\/)?[-a-z]\w*/i;
var elementEndPattern = /(?:\/)?>/;

var attributePattern = /([-:@a-z0-9]+)(?==["'])?/i;

var nonSingleQuotePattern = /^[^']*/;
var nonDoubleQuotePattern = /^[^"]*/;

var breaklinePrefixPattern = /^[ \t]*\n/;
var breaklineSuffixPattern = /\n[ \t]*$/;

var componentNamePattern = /[-A-Z]/;
var selfClosingTagNamePattern = /input|img|br/i;

var toString$1 = Function.prototype.toString;

// 2 种 level
// 当 level 为 LEVEL_ATTRIBUTE 时，表示只可以处理属性和指令
// 当 level 为 LEVEL_TEXT 时，表示只可以处理属性和指令的值

var LEVEL_ATTRIBUTE = 1;
var LEVEL_TEXT = 2;

// 属性层级的节点类型
var attrTypes = {};
attrTypes[ATTRIBUTE] = attrTypes[DIRECTIVE] = TRUE;

// 触发 level 变化的节点类型
var levelTypes = extend({}, attrTypes);
levelTypes[ELEMENT] = TRUE;

// 叶子节点类型
var leafTypes = {};
leafTypes[EXPRESSION] = leafTypes[IMPORT$1] = leafTypes[SPREAD$1] = leafTypes[TEXT] = TRUE;

// 内置指令，无需加前缀
var buildInDirectives = {};
buildInDirectives[DIRECTIVE_REF] = buildInDirectives[DIRECTIVE_LAZY] = buildInDirectives[DIRECTIVE_MODEL] = buildInDirectives[KEYWORD_UNIQUE] = TRUE;

/**
 * 合并多个节点
 *
 * 用于处理属性值，如 name="xx{{xx}}xx"  name="xx"  name="{{xx}}"
 *
 * @param {?Array} nodes
 * @return {*}
 */
function mergeNodes(nodes) {
  if (array(nodes)) {
    if (nodes.length === 1) {
      return nodes[0];
    } else if (nodes.length > 1) {
      return nodes.join('');
    }
  }
}

/**
 * 遍历节点树
 *
 * @param {Node} node
 * @param {Function} enter
 * @param {Function} leave
 * @param {Function} traverseList
 * @param {Function} recursion
 * @return {*}
 */
function traverseTree(node, enter, leave, traverseList, recursion) {

  var result = enter(node);
  if (result) {
    return result;
  } else if (result === FALSE) {
    return;
  }

  var children = node.children,
      attrs = node.attrs;

  if (array(children)) {
    children = traverseList(children, recursion);
  }
  if (array(attrs)) {
    attrs = traverseList(attrs, recursion);
  }

  return leave(node, children, attrs);
}

/**
 * 遍历节点列表
 *
 * @param {Array.<Node>} nodes
 * @param {Function} recursion
 * @return {Array}
 */
function traverseList(nodes, recursion) {
  var list = [],
      item = void 0;
  var i = 0,
      node = void 0;
  while (node = nodes[i]) {
    item = recursion(node);
    if (item !== UNDEFINED) {
      push$1(list, item);
      if (node.type === IF$1 || node.type === ELSE_IF$1) {
        // 跳过后面紧跟着的 elseif else
        while (node = nodes[i + 1]) {
          if (node.type === ELSE_IF$1 || node.type === ELSE$1) {
            i++;
          } else {
            break;
          }
        }
      }
    }
    i++;
  }
  return list;
}

/**
 * 序列化表达式
 *
 * @param {Object} expr
 * @return {string}
 */
function stringifyExpr(expr) {
  return normalize(stringify$1(expr));
}

/**
 * 渲染抽象语法树
 *
 * @param {Object} ast 编译出来的抽象语法树
 * @param {Function} createText 创建文本节点
 * @param {Function} createElement 创建元素节点
 * @param {?Function} importTemplate 导入子模板，如果是纯模板，可不传
 * @param {?Object} data 渲染模板的数据，如果渲染纯模板，可不传
 * @return {Object} { node: x, deps: { } }
 */
function render(ast, createText, createElement, importTemplate, data) {

  var context = void 0,
      keys$$1 = void 0;
  var getKeypath = function getKeypath() {
    return '';
  };

  if (data) {
    keys$$1 = [];
    getKeypath = function getKeypath() {
      return stringify(keys$$1);
    };
    getKeypath.toString = getKeypath;
    data[SPECIAL_KEYPATH] = getKeypath;
    context = new Context(data);
  }

  var count = 0;
  var partials = {};

  var deps = {};
  var executeExpr = function executeExpr(expr) {
    var result = execute(expr, context);
    each$1(result.deps, function (value, key) {
      deps[resolve(getKeypath(), key)] = value;
    });
    return result.value;
  };

  var recursion = function recursion(node) {
    return traverseTree(node, function (node) {
      var type = node.type,
          name = node.name,
          expr = node.expr;

      var _ret = function () {

        switch (type) {

          // 用时定义的子模块无需注册到组件实例
          case PARTIAL$1:
            partials[name] = node;
            return {
              v: FALSE
            };

          case IMPORT$1:
            var partial = partials[name] || importTemplate(name);
            if (partial) {
              if (string(partial)) {
                return {
                  v: traverseList(compile$$1(partial, TRUE), recursion)
                };
              }
              return {
                v: traverseList(partial.children, recursion)
              };
            }
            error$1('Importing partial "' + name + '" is not found.');
            break;

          // 条件判断失败就没必要往下走了
          case IF$1:
          case ELSE_IF$1:
            if (!executeExpr(expr)) {
              return {
                v: FALSE
              };
            }
            break;

          // each 比较特殊，只能放在 enter 里执行
          case EACH$1:
            var index = node.index,
                children = node.children;

            var value = executeExpr(expr);

            var iterate = void 0;
            if (array(value)) {
              iterate = each;
            } else if (object(value)) {
              iterate = each$1;
            } else {
              return {
                v: FALSE
              };
            }

            var result = [];

            push$1(keys$$1, stringifyExpr(expr));
            context = context.push(value);

            iterate(value, function (item, i) {
              if (index) {
                context.set(index, i);
              }

              push$1(keys$$1, i);
              context = context.push(item);

              push$1(result, traverseList(children, recursion));

              keys$$1.pop();
              context = context.pop();
            });

            keys$$1.pop();
            context = context.pop();

            return {
              v: result
            };

        }
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      if (has$2(levelTypes, type)) {
        count++;
      }
    }, function (node, children, attrs) {
      var type = node.type,
          name = node.name,
          subName = node.subName,
          component = node.component,
          content = node.content;

      var keypath = getKeypath();

      if (has$2(levelTypes, type)) {
        count--;
      }

      var _ret2 = function () {
        switch (type) {
          case TEXT:
            return {
              v: createText({
                keypath: keypath,
                content: content
              })
            };

          case EXPRESSION:
            var expr = node.expr,
                safe = node.safe;

            content = executeExpr(expr);
            if (func(content) && content.toString !== toString$1) {
              content = content();
            }
            return {
              v: createText({
                safe: safe,
                keypath: keypath,
                content: content
              })
            };

          case ATTRIBUTE:
            if (name.type === EXPRESSION) {
              name = executeExpr(name.expr);
            }
            return {
              v: {
                name: name,
                keypath: keypath,
                value: mergeNodes(children)
              }
            };

          case DIRECTIVE:
            return {
              v: {
                name: name,
                subName: subName,
                keypath: keypath,
                value: mergeNodes(children)
              }
            };

          case IF$1:
          case ELSE_IF$1:
          case ELSE$1:
            return {
              v: children
            };

          case SPREAD$1:
            content = executeExpr(node.expr);
            if (object(content)) {
              var _ret3 = function () {
                var result = [];
                each$1(content, function (value, name) {
                  push$1(result, {
                    name: name,
                    value: value,
                    keypath: keypath
                  });
                });
                return {
                  v: {
                    v: result
                  }
                };
              }();

              if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
            }
            break;

          case ELEMENT:
            var attributes = [],
                directives = [];
            if (attrs) {
              each(attrs, function (node) {
                if (has$2(node, 'subName')) {
                  if (node.name && node.subName !== '') {
                    push$1(directives, node);
                  }
                } else {
                  push$1(attributes, node);
                }
              });
            }
            if (!children) {
              children = [];
            }
            return {
              v: createElement({
                name: name,
                attributes: attributes,
                directives: directives,
                children: children,
                keypath: keypath
              }, !count, component)
            };
        }
      }();

      if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
    }, traverseList, recursion);
  };

  var node = recursion(ast);

  return { node: node, deps: deps };
}

// 缓存编译结果
var cache = {};

var parsers = [{
  test: function test(source) {
    return source.startsWith(EACH);
  },
  create: function create(source) {
    var terms = trim(source.slice(EACH.length)).split(':');
    var expr = trim(terms[0]);
    if (terms.length > 0 && expr) {
      return new Each(compile$1(expr), trim(terms[1]));
    }
  }
}, {
  test: function test(source) {
    return source.startsWith(IMPORT);
  },
  create: function create(source) {
    var name = trim(source.slice(IMPORT.length));
    if (name) {
      return new Import(name);
    }
  }
}, {
  test: function test(source) {
    return source.startsWith(PARTIAL);
  },
  create: function create(source) {
    var name = trim(source.slice(PARTIAL.length));
    if (name) {
      return new Partial(name);
    }
  }
}, {
  test: function test(source) {
    return source.startsWith(IF);
  },
  create: function create(source) {
    var expr = trim(source.slice(IF.length));
    if (expr) {
      return new If(compile$1(expr));
    }
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE_IF);
  },
  create: function create(source, delimiter, popStack) {
    var expr = source.slice(ELSE_IF.length);
    if (expr) {
      popStack();
      return new ElseIf(compile$1(expr));
    }
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE);
  },
  create: function create(source, delimiter, popStack) {
    popStack();
    return new Else();
  }
}, {
  test: function test(source) {
    return source.startsWith(SPREAD);
  },
  create: function create(source) {
    var expr = source.slice(SPREAD.length);
    if (expr) {
      return new Spread(compile$1(expr));
    }
  }
}, {
  test: function test(source) {
    return !source.startsWith(COMMENT);
  },
  create: function create(source, delimiter) {
    source = trim(source);
    if (source) {
      return new Expression(compile$1(source), !delimiter.endsWith('}}}'));
    }
  }
}];

function getLocationByPos(str, pos) {

  var line = 0,
      col = 0,
      index = 0;

  each(str.split(BREAKLINE), function (lineStr) {
    line++;
    col = 0;

    var length = lineStr.length;

    if (pos >= index && pos <= index + length) {
      col = pos - index;
      return FALSE;
    }

    index += length;
  });

  return { line: line, col: col };
}

/**
 * 是否是纯粹的换行
 *
 * @param {string} content
 * @return {boolean}
 */
function isBreakline(content) {
  return content.indexOf(BREAKLINE) >= 0 && trim(content) === '';
}

/**
 * trim 文本开始和结束位置的换行符
 *
 * @param {string} content
 * @return {boolean}
 */
function trimBreakline(content) {
  return content.replace(breaklinePrefixPattern, '').replace(breaklineSuffixPattern, '');
}

/**
 * 解析属性值，传入开始引号，匹配结束引号
 *
 * @param {string} content
 * @param {string} quote
 * @return {Object}
 */
function parseAttributeValue(content, quote) {

  var result = {
    content: content
  };

  var match = content.match(quote === '"' ? nonDoubleQuotePattern : nonSingleQuotePattern);

  if (match) {
    result.value = match[0];

    var length = match[0].length;

    if (charAt$1(content, length) === quote) {
      result.end = TRUE;
      length++;
    }
    if (length) {
      result.content = content.slice(length);
    }
  }

  return result;
}

/**
 * 把模板编译为抽象语法树
 *
 * @param {string} template
 * @param {?boolean} loose
 * @return {Object}
 */
function compile$$1(template, loose) {

  var result = cache[template];
  if (result) {
    return loose ? result : result[0];
  }

  // 当前内容
  var content = void 0;
  // 记录标签名、属性名、指令名
  var name = void 0;
  // 记录属性值、指令值的开始引号，方便匹配结束引号
  var quote = void 0;
  // 标签是否子闭合
  var isSelfClosing = void 0;
  // 分隔符
  var delimiter = void 0;

  // 主扫描器
  var mainScanner = new Scanner(template);
  // 辅扫描器
  var helperScanner = new Scanner();

  var level = void 0,
      levelNode = void 0;

  var nodeStack = [];
  var rootNode = new Element('root');
  var currentNode = rootNode;

  var throwError = function throwError(msg, pos) {
    if (pos == NULL) {
      msg += '.';
    } else {
      var _getLocationByPos = getLocationByPos(template, pos),
          line = _getLocationByPos.line,
          col = _getLocationByPos.col;

      msg += ', at line ' + line + ', col ' + col + '.';
    }
    error$1('' + msg + BREAKLINE + template);
  };

  var pushStack = function pushStack(node) {
    push$1(nodeStack, currentNode);
    currentNode = node;
  };

  var popStack = function popStack() {
    currentNode = nodeStack.pop();
    return currentNode;
  };

  var addChild = function addChild(node) {
    var _node = node,
        type = _node.type,
        content = _node.content;


    if (type === TEXT) {
      if (isBreakline(content) || !(content = trimBreakline(content))) {
        return;
      }
      node.content = content;
    } else if (type === EXPRESSION && level === LEVEL_ATTRIBUTE) {
      node = levelNode = new Attribute(node);
      type = ATTRIBUTE;
    }

    if (level === LEVEL_ATTRIBUTE && currentNode.addAttr) {
      currentNode.addAttr(node);
    } else {
      currentNode.addChild(node);
    }

    if (!leafTypes[type]) {
      pushStack(node);
    }

    if (attrTypes[type]) {
      level = LEVEL_TEXT;
    }
  };

  // 属性和指令支持以下 8 种写法：
  // 1. name
  // 2. name="value"
  // 3. name="{{value}}"
  // 4. name="prefix{{value}}suffix"
  // 5. {{name}}
  // 6. {{name}}="value"
  // 7. {{name}}="{{value}}"
  // 8. {{name}}="prefix{{value}}suffix"
  var parseAttribute = function parseAttribute(content) {

    if (falsy(levelNode.children)) {
      if (content && charCodeAt$1(content, 0) === EQUAL) {
        quote = charAt$1(content, 1);
        content = content.slice(2);
      } else {
        popStack();
        level = LEVEL_ATTRIBUTE;
        return content;
      }
    }

    result = parseAttributeValue(content, quote);
    if (result.value) {
      addChild(new Text(result.value));
    }
    if (result.end) {
      popStack();
      level = LEVEL_ATTRIBUTE;
    }
    return result.content;
  };

  // 核心函数，负责分隔符和普通字符串的深度解析
  var parseContent = function parseContent(content) {
    helperScanner.init(content);
    while (helperScanner.hasNext()) {

      // 分隔符之前的内容
      content = helperScanner.nextBefore(openingDelimiterPattern);
      helperScanner.nextAfter(openingDelimiterPattern);

      if (content) {

        if (level === LEVEL_TEXT) {
          content = parseAttribute(content);
        }

        if (level === LEVEL_ATTRIBUTE) {
          while (content && (result = attributePattern.exec(content))) {
            content = content.slice(result.index + result[0].length);
            name = result[1];

            if (buildInDirectives[name]) {
              levelNode = new Directive(name);
            } else {
              if (name.startsWith(DIRECTIVE_EVENT_PREFIX)) {
                name = name.slice(DIRECTIVE_EVENT_PREFIX.length);
                levelNode = new Directive('event', name);
              } else if (name.startsWith(DIRECTIVE_CUSTOM_PREFIX)) {
                name = name.slice(DIRECTIVE_CUSTOM_PREFIX.length);
                levelNode = new Directive(name);
              } else {
                levelNode = new Attribute(name);
              }
            }

            addChild(levelNode);

            content = parseAttribute(content);
          }
        } else if (content) {
          addChild(new Text(content));
        }
      }

      // 分隔符之间的内容
      content = helperScanner.nextBefore(closingDelimiterPattern);
      // 结束分隔符
      delimiter = helperScanner.nextAfter(closingDelimiterPattern);

      if (content) {
        if (charCodeAt$1(content, 0) === SLASH) {
          popStack();
        } else {
          each(parsers, function (parser, index) {
            if (parser.test(content, delimiter)) {
              // 用 index 节省一个变量定义
              index = parser.create(content, delimiter, popStack);
              if (index) {
                addChild(index);
              } else {
                throwError('Expected expression', mainScanner.pos + helperScanner.pos);
              }
              return FALSE;
            }
          });
        }
      }
    }
  };

  while (mainScanner.hasNext()) {
    content = mainScanner.nextBefore(elementPattern);

    // 处理标签之间的内容
    if (content) {
      parseContent(content);
    }

    // 接下来必须是 < 开头（标签）
    // 如果不是标签，那就该结束了
    if (mainScanner.charCodeAt(0) !== ARROW_LEFT) {
      break;
    }

    // 结束标签
    if (mainScanner.charCodeAt(1) === SLASH) {
      // 取出 </tagName
      content = mainScanner.nextAfter(elementPattern);
      name = content.slice(2);

      // 没有匹配到 >
      if (mainScanner.charCodeAt(0) !== ARROW_RIGHT) {
        return throwError('Illegal tag name', mainScanner.pos);
      } else if (currentNode.type === ELEMENT && name !== currentNode.name) {
        return throwError('Unexpected closing tag', mainScanner.pos);
      }

      popStack();

      // 过掉 >
      mainScanner.forward(1);
    }
    // 开始标签
    else {
        // 取出 <tagName
        content = mainScanner.nextAfter(elementPattern);
        name = content.slice(1);

        if (componentNamePattern.test(name)) {
          levelNode = new Element(name, TRUE);
          isSelfClosing = TRUE;
        } else {
          levelNode = new Element(name);
          isSelfClosing = selfClosingTagNamePattern.test(name);
        }

        addChild(levelNode);

        // 截取 <name 和 > 之间的内容
        // 用于提取 Attribute 和 Directive
        content = mainScanner.nextBefore(elementEndPattern);
        if (content) {
          level = LEVEL_ATTRIBUTE;
          parseContent(content);
          level = NULL;
        }

        content = mainScanner.nextAfter(elementEndPattern);
        // 没有匹配到 > 或 />
        if (!content) {
          return throwError('Illegal tag name', mainScanner.pos);
        }

        if (isSelfClosing) {
          popStack();
        }
      }
  }

  if (nodeStack.length) {
    return throwError('Expected end tag (</' + nodeStack[0].name + '>)', mainScanner.pos);
  }

  var children = rootNode.children;

  cache[template] = children;

  if (loose) {
    return children;
  }

  result = children[0];
  if (children.length > 1 || result.type !== ELEMENT) {
    error$1('Template should contain exactly one root element.');
  }
  return result;
}

/**
 * html 标签
 *
 * @type {RegExp}
 */
var tag = /<[^>]+>/;

/**
 * 选择器
 *
 * @type {string}
 */
var selector = /^[#.]\w+$/;

/**
 * 进入 `new Yox(options)` 之后立即触发，钩子函数会传入 `options`
 *
 * @type {string}
 */
var BEFORE_CREATE = 'beforeCreate';

/**
 * 绑定事件和数据监听之后触发
 *
 * @type {string}
 */
var AFTER_CREATE = 'afterCreate';

/**
 * 模板编译，加入 DOM 树之前触发
 *
 * @type {string}
 */
var BEFORE_MOUNT = 'beforeMount';

/**
 * 加入 DOM 树之后触发
 *
 * 这时可通过 `$el` 获取组件根元素
 *
 * @type {string}
 */
var AFTER_MOUNT = 'afterMount';

/**
 * 视图更新之前触发
 *
 * @type {string}
 */
var BEFORE_UPDATE = 'beforeUpdate';

/**
 * 视图更新之后触发
 *
 * @type {string}
 */
var AFTER_UPDATE = 'afterUpdate';

/**
 * 销毁之前触发
 *
 * @type {string}
 */
var BEFORE_DESTROY = 'beforeDestroy';

/**
 * 销毁之后触发
 *
 * @type {string}
 */
var AFTER_DESTROY = 'afterDestroy';

var vnode = function (sel, data, children, text, elm) {
  var key = data === undefined ? undefined : data.key;
  return { sel: sel, data: data, children: children,
    text: text, elm: elm, key: key };
};

var is$3 = {
  array: Array.isArray,
  primitive: function primitive(s) {
    return typeof s === 'string' || typeof s === 'number';
  }
};

function createElement(tagName) {
  return document.createElement(tagName);
}

function createElementNS(namespaceURI, qualifiedName) {
  return document.createElementNS(namespaceURI, qualifiedName);
}

function createTextNode(text) {
  return document.createTextNode(text);
}

function insertBefore(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function removeChild(node, child) {
  node.removeChild(child);
}

function appendChild(node, child) {
  node.appendChild(child);
}

function parentNode(node) {
  return node.parentElement;
}

function nextSibling(node) {
  return node.nextSibling;
}

function tagName(node) {
  return node.tagName;
}

function setTextContent(node, text) {
  node.textContent = text;
}

var htmldomapi = {
  createElement: createElement,
  createElementNS: createElementNS,
  createTextNode: createTextNode,
  appendChild: appendChild,
  removeChild: removeChild,
  insertBefore: insertBefore,
  parentNode: parentNode,
  nextSibling: nextSibling,
  tagName: tagName,
  setTextContent: setTextContent
};

var VNode = vnode;
var is$2 = is$3;
var domApi = htmldomapi;

function isUndef(s) {
  return s === undefined;
}
function isDef(s) {
  return s !== undefined;
}

var emptyNode = VNode('', {}, [], undefined, undefined);

function sameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
}

function createKeyToOldIdx(children, beginIdx, endIdx) {
  var i,
      map = {},
      key;
  for (i = beginIdx; i <= endIdx; ++i) {
    key = children[i].key;
    if (isDef(key)) map[key] = i;
  }
  return map;
}

var hooks = ['create', 'update', 'remove', 'destroy', 'pre', 'post'];

function init$1(modules, api) {
  var i,
      j,
      cbs = {};

  if (isUndef(api)) api = domApi;

  for (i = 0; i < hooks.length; ++i) {
    cbs[hooks[i]] = [];
    for (j = 0; j < modules.length; ++j) {
      if (modules[j][hooks[i]] !== undefined) cbs[hooks[i]].push(modules[j][hooks[i]]);
    }
  }

  function emptyNodeAt(elm) {
    var id = elm.id ? '#' + elm.id : '';
    var c = elm.className ? '.' + elm.className.split(' ').join('.') : '';
    return VNode(api.tagName(elm).toLowerCase() + id + c, {}, [], undefined, elm);
  }

  function createRmCb(childElm, listeners) {
    return function () {
      if (--listeners === 0) {
        var parent = api.parentNode(childElm);
        api.removeChild(parent, childElm);
      }
    };
  }

  function createElm(vnode$$1, insertedVnodeQueue) {
    var i,
        data = vnode$$1.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.init)) {
        i(vnode$$1);
        data = vnode$$1.data;
      }
    }
    var elm,
        children = vnode$$1.children,
        sel = vnode$$1.sel;
    if (isDef(sel)) {
      // Parse selector
      var hashIdx = sel.indexOf('#');
      var dotIdx = sel.indexOf('.', hashIdx);
      var hash = hashIdx > 0 ? hashIdx : sel.length;
      var dot = dotIdx > 0 ? dotIdx : sel.length;
      var tag = hashIdx !== -1 || dotIdx !== -1 ? sel.slice(0, Math.min(hash, dot)) : sel;
      elm = vnode$$1.elm = isDef(data) && isDef(i = data.ns) ? api.createElementNS(i, tag) : api.createElement(tag);
      if (hash < dot) elm.id = sel.slice(hash + 1, dot);
      if (dotIdx > 0) elm.className = sel.slice(dot + 1).replace(/\./g, ' ');
      if (is$2.array(children)) {
        for (i = 0; i < children.length; ++i) {
          api.appendChild(elm, createElm(children[i], insertedVnodeQueue));
        }
      } else if (is$2.primitive(vnode$$1.text)) {
        api.appendChild(elm, api.createTextNode(vnode$$1.text));
      }
      for (i = 0; i < cbs.create.length; ++i) {
        cbs.create[i](emptyNode, vnode$$1);
      }i = vnode$$1.data.hook; // Reuse variable
      if (isDef(i)) {
        if (i.create) i.create(emptyNode, vnode$$1);
        if (i.insert) insertedVnodeQueue.push(vnode$$1);
      }
    } else {
      elm = vnode$$1.elm = api.createTextNode(vnode$$1.text);
    }
    return vnode$$1.elm;
  }

  function addVnodes(parentElm, before, vnodes, startIdx, endIdx, insertedVnodeQueue) {
    for (; startIdx <= endIdx; ++startIdx) {
      api.insertBefore(parentElm, createElm(vnodes[startIdx], insertedVnodeQueue), before);
    }
  }

  function invokeDestroyHook(vnode$$1) {
    var i,
        j,
        data = vnode$$1.data;
    if (isDef(data)) {
      if (isDef(i = data.hook) && isDef(i = i.destroy)) i(vnode$$1);
      for (i = 0; i < cbs.destroy.length; ++i) {
        cbs.destroy[i](vnode$$1);
      }if (isDef(i = vnode$$1.children)) {
        for (j = 0; j < vnode$$1.children.length; ++j) {
          invokeDestroyHook(vnode$$1.children[j]);
        }
      }
    }
  }

  function removeVnodes(parentElm, vnodes, startIdx, endIdx) {
    for (; startIdx <= endIdx; ++startIdx) {
      var i,
          listeners,
          rm,
          ch = vnodes[startIdx];
      if (isDef(ch)) {
        if (isDef(ch.sel)) {
          invokeDestroyHook(ch);
          listeners = cbs.remove.length + 1;
          rm = createRmCb(ch.elm, listeners);
          for (i = 0; i < cbs.remove.length; ++i) {
            cbs.remove[i](ch, rm);
          }if (isDef(i = ch.data) && isDef(i = i.hook) && isDef(i = i.remove)) {
            i(ch, rm);
          } else {
            rm();
          }
        } else {
          // Text node
          api.removeChild(parentElm, ch.elm);
        }
      }
    }
  }

  function updateChildren(parentElm, oldCh, newCh, insertedVnodeQueue) {
    var oldStartIdx = 0,
        newStartIdx = 0;
    var oldEndIdx = oldCh.length - 1;
    var oldStartVnode = oldCh[0];
    var oldEndVnode = oldCh[oldEndIdx];
    var newEndIdx = newCh.length - 1;
    var newStartVnode = newCh[0];
    var newEndVnode = newCh[newEndIdx];
    var oldKeyToIdx, idxInOld, elmToMove, before;

    while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
      if (isUndef(oldStartVnode)) {
        oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
      } else if (isUndef(oldEndVnode)) {
        oldEndVnode = oldCh[--oldEndIdx];
      } else if (sameVnode(oldStartVnode, newStartVnode)) {
        patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue);
        oldStartVnode = oldCh[++oldStartIdx];
        newStartVnode = newCh[++newStartIdx];
      } else if (sameVnode(oldEndVnode, newEndVnode)) {
        patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue);
        oldEndVnode = oldCh[--oldEndIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldStartVnode, newEndVnode)) {
        // Vnode moved right
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        // Vnode moved left
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
          // New element
          api.insertBefore(parentElm, createElm(newStartVnode, insertedVnodeQueue), oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        } else {
          elmToMove = oldCh[idxInOld];
          patchVnode(elmToMove, newStartVnode, insertedVnodeQueue);
          oldCh[idxInOld] = undefined;
          api.insertBefore(parentElm, elmToMove.elm, oldStartVnode.elm);
          newStartVnode = newCh[++newStartIdx];
        }
      }
    }
    if (oldStartIdx > oldEndIdx) {
      before = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
      addVnodes(parentElm, before, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
    } else if (newStartIdx > newEndIdx) {
      removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
    }
  }

  function patchVnode(oldVnode, vnode$$1, insertedVnodeQueue) {
    var i, hook;
    if (isDef(i = vnode$$1.data) && isDef(hook = i.hook) && isDef(i = hook.prepatch)) {
      i(oldVnode, vnode$$1);
    }
    var elm = vnode$$1.elm = oldVnode.elm,
        oldCh = oldVnode.children,
        ch = vnode$$1.children;
    if (oldVnode === vnode$$1) return;
    if (!sameVnode(oldVnode, vnode$$1)) {
      var parentElm = api.parentNode(oldVnode.elm);
      elm = createElm(vnode$$1, insertedVnodeQueue);
      api.insertBefore(parentElm, elm, oldVnode.elm);
      removeVnodes(parentElm, [oldVnode], 0, 0);
      return;
    }
    if (isDef(vnode$$1.data)) {
      for (i = 0; i < cbs.update.length; ++i) {
        cbs.update[i](oldVnode, vnode$$1);
      }i = vnode$$1.data.hook;
      if (isDef(i) && isDef(i = i.update)) i(oldVnode, vnode$$1);
    }
    if (isUndef(vnode$$1.text)) {
      if (isDef(oldCh) && isDef(ch)) {
        if (oldCh !== ch) updateChildren(elm, oldCh, ch, insertedVnodeQueue);
      } else if (isDef(ch)) {
        if (isDef(oldVnode.text)) api.setTextContent(elm, '');
        addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
      } else if (isDef(oldCh)) {
        removeVnodes(elm, oldCh, 0, oldCh.length - 1);
      } else if (isDef(oldVnode.text)) {
        api.setTextContent(elm, '');
      }
    } else if (oldVnode.text !== vnode$$1.text) {
      api.setTextContent(elm, vnode$$1.text);
    }
    if (isDef(hook) && isDef(i = hook.postpatch)) {
      i(oldVnode, vnode$$1);
    }
  }

  return function (oldVnode, vnode$$1) {
    var i, elm, parent;
    var insertedVnodeQueue = [];
    for (i = 0; i < cbs.pre.length; ++i) {
      cbs.pre[i]();
    }if (isUndef(oldVnode.sel)) {
      oldVnode = emptyNodeAt(oldVnode);
    }

    if (sameVnode(oldVnode, vnode$$1)) {
      patchVnode(oldVnode, vnode$$1, insertedVnodeQueue);
    } else {
      elm = oldVnode.elm;
      parent = api.parentNode(elm);

      createElm(vnode$$1, insertedVnodeQueue);

      if (parent !== null) {
        api.insertBefore(parent, vnode$$1.elm, api.nextSibling(elm));
        removeVnodes(parent, [oldVnode], 0, 0);
      }
    }

    for (i = 0; i < insertedVnodeQueue.length; ++i) {
      insertedVnodeQueue[i].data.hook.insert(insertedVnodeQueue[i]);
    }
    for (i = 0; i < cbs.post.length; ++i) {
      cbs.post[i]();
    }return vnode$$1;
  };
}

var snabbdom = { init: init$1 };

var VNode$1 = vnode;
var is$5 = is$3;

function addNS(data, children, sel) {
  data.ns = 'http://www.w3.org/2000/svg';

  if (sel !== 'foreignObject' && children !== undefined) {
    for (var i = 0; i < children.length; ++i) {
      addNS(children[i].data, children[i].children, children[i].sel);
    }
  }
}

var h = function h(sel, b, c) {
  var data = {},
      children,
      text,
      i;
  if (c !== undefined) {
    data = b;
    if (is$5.array(c)) {
      children = c;
    } else if (is$5.primitive(c)) {
      text = c;
    }
  } else if (b !== undefined) {
    if (is$5.array(b)) {
      children = b;
    } else if (is$5.primitive(b)) {
      text = b;
    } else {
      data = b;
    }
  }
  if (is$5.array(children)) {
    for (i = 0; i < children.length; ++i) {
      if (is$5.primitive(children[i])) children[i] = VNode$1(undefined, undefined, undefined, children[i]);
    }
  }
  if (sel[0] === 's' && sel[1] === 'v' && sel[2] === 'g') {
    addNS(data, children, sel);
  }
  return VNode$1(sel, data, children, text, undefined);
};

var raf = typeof window !== 'undefined' && window.requestAnimationFrame || setTimeout;
var nextFrame = function nextFrame(fn) {
  raf(function () {
    raf(fn);
  });
};

function setNextFrame(obj, prop, val) {
  nextFrame(function () {
    obj[prop] = val;
  });
}

function updateStyle(oldVnode, vnode) {
  var cur,
      name,
      elm = vnode.elm,
      oldStyle = oldVnode.data.style,
      style = vnode.data.style;

  if (!oldStyle && !style) return;
  oldStyle = oldStyle || {};
  style = style || {};
  var oldHasDel = 'delayed' in oldStyle;

  for (name in oldStyle) {
    if (!style[name]) {
      elm.style[name] = '';
    }
  }
  for (name in style) {
    cur = style[name];
    if (name === 'delayed') {
      for (name in style.delayed) {
        cur = style.delayed[name];
        if (!oldHasDel || cur !== oldStyle.delayed[name]) {
          setNextFrame(elm.style, name, cur);
        }
      }
    } else if (name !== 'remove' && cur !== oldStyle[name]) {
      elm.style[name] = cur;
    }
  }
}

function applyDestroyStyle(vnode) {
  var style,
      name,
      elm = vnode.elm,
      s = vnode.data.style;
  if (!s || !(style = s.destroy)) return;
  for (name in style) {
    elm.style[name] = style[name];
  }
}

function applyRemoveStyle(vnode, rm) {
  var s = vnode.data.style;
  if (!s || !s.remove) {
    rm();
    return;
  }
  var name,
      elm = vnode.elm,
      idx,
      i = 0,
      maxDur = 0,
      compStyle,
      style = s.remove,
      amount = 0,
      applied = [];
  for (name in style) {
    applied.push(name);
    elm.style[name] = style[name];
  }
  compStyle = getComputedStyle(elm);
  var props = compStyle['transition-property'].split(', ');
  for (; i < props.length; ++i) {
    if (applied.indexOf(props[i]) !== -1) amount++;
  }
  elm.addEventListener('transitionend', function (ev) {
    if (ev.target === elm) --amount;
    if (amount === 0) rm();
  });
}

var style = { create: updateStyle, update: updateStyle, destroy: applyDestroyStyle, remove: applyRemoveStyle };

var NamespaceURIs = {
  "xlink": "http://www.w3.org/1999/xlink"
};

var booleanAttrs = ["allowfullscreen", "async", "autofocus", "autoplay", "checked", "compact", "controls", "declare", "default", "defaultchecked", "defaultmuted", "defaultselected", "defer", "disabled", "draggable", "enabled", "formnovalidate", "hidden", "indeterminate", "inert", "ismap", "itemscope", "loop", "multiple", "muted", "nohref", "noresize", "noshade", "novalidate", "nowrap", "open", "pauseonexit", "readonly", "required", "reversed", "scoped", "seamless", "selected", "sortable", "spellcheck", "translate", "truespeed", "typemustmatch", "visible"];

var booleanAttrsDict = Object.create(null);
for (var i = 0, len = booleanAttrs.length; i < len; i++) {
  booleanAttrsDict[booleanAttrs[i]] = true;
}

function updateAttrs(oldVnode, vnode) {
  var key,
      cur,
      old,
      elm = vnode.elm,
      oldAttrs = oldVnode.data.attrs,
      attrs = vnode.data.attrs,
      namespaceSplit;

  if (!oldAttrs && !attrs) return;
  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  // update modified attributes, add new attributes
  for (key in attrs) {
    cur = attrs[key];
    old = oldAttrs[key];
    if (old !== cur) {
      if (!cur && booleanAttrsDict[key]) elm.removeAttribute(key);else {
        namespaceSplit = key.split(":");
        if (namespaceSplit.length > 1 && NamespaceURIs.hasOwnProperty(namespaceSplit[0])) elm.setAttributeNS(NamespaceURIs[namespaceSplit[0]], key, cur);else elm.setAttribute(key, cur);
      }
    }
  }
  //remove removed attributes
  // use `in` operator since the previous `for` iteration uses it (.i.e. add even attributes with undefined value)
  // the other option is to remove all attributes with value == undefined
  for (key in oldAttrs) {
    if (!(key in attrs)) {
      elm.removeAttribute(key);
    }
  }
}

var attributes = { create: updateAttrs, update: updateAttrs };

var toString$2 = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  try {
    return str.toString();
  } catch (e) {
    return defaultValue;
  }
};

var patch = snabbdom.init([attributes, style]);

function isVNode(node) {
  return node && has$2(node, 'sel') && has$2(node, 'elm');
}

function create$1(ast, context, instance) {

  var createText = function createText(node) {
    var safe = node.safe,
        content = node.content;

    if (safe !== FALSE || !string(content) || !tag.test(content)) {
      return content;
    }
    return compile$$1(content, TRUE).map(function (node) {
      return render(node, createText, createElement).node;
    });
  };

  var createElement = function createElement(node, isRootElement, isComponent) {

    var attributes$$1 = {},
        directives = [],
        styles = void 0;

    var data = {
      attrs: attributes$$1
    };

    // 指令的创建要确保顺序
    // 组件必须第一个执行
    // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
    // 因此 component 必须在 event 指令之前执行

    if (isComponent) {
      push$1(directives, {
        node: node,
        name: 'component',
        directive: instance.directive('component')
      });
    } else {
      each(node.attributes, function (node) {
        var name = node.name,
            value = node.value;

        if (name === 'style') {
          var list = parse$1(value, ';', ':');
          if (list.length) {
            styles = {};
            each(list, function (item) {
              if (item.value) {
                styles[camelCase(item.key)] = item.value;
              }
            });
          }
        } else {
          attributes$$1[name] = value;
        }
      });
    }

    each(node.directives, function (node) {
      var name = node.name;

      if (name === KEYWORD_UNIQUE) {
        data.key = node.value;
      } else {
        push$1(directives, {
          name: name,
          node: node,
          directive: instance.directive(name)
        });
      }
    });

    if (styles) {
      data.style = styles;
    }

    if (isRootElement || directives.length) {
      (function () {

        var map = toObject(directives, 'name');

        var notify = function notify(vnode, type) {
          each(directives, function (item) {
            var directive = item.directive;

            if (directive && func(directive[type])) {
              directive[type]({
                el: vnode.elm,
                node: item.node,
                directives: map,
                attributes: attributes$$1,
                instance: instance
              });
            }
          });
        };

        var upsert = function upsert(oldNode, vnode) {
          if (oldNode.attached) {
            notify(vnode, 'update');
          } else {
            notify(oldNode, 'attach');
            vnode = oldNode;
          }
          vnode.attached = TRUE;
        };

        data.hook = {
          insert: upsert,
          postpatch: upsert,
          destroy: function destroy(vnode) {
            notify(vnode, 'detach');
          }
        };
      })();
    }

    return h(isComponent ? 'div' : node.name, data,
    // snabbdom 只支持字符串形式的 children
    node.children.map(function (child) {
      return isVNode(child) ? child : toString$2(child);
    }));
  };

  var importTemplate = function importTemplate(name) {
    return instance.partial(name);
  };

  return render(ast, createText, createElement, importTemplate, context);
}

function addListener$1(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function removeListener$1(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

function createEvent$1(event) {
  return event;
}

function findElement$1(selector, context) {
  return (context || doc).querySelector(selector);
}

var modern = Object.freeze({
	addListener: addListener$1,
	removeListener: removeListener$1,
	createEvent: createEvent$1,
	findElement: findElement$1
});

var IEEvent = function () {
  function IEEvent(event, element) {
    classCallCheck(this, IEEvent);


    extend(this, event);

    this.currentTarget = element;
    this.target = event.srcElement || element;
    this.originalEvent = event;
  }

  createClass(IEEvent, [{
    key: 'preventDefault',
    value: function preventDefault() {
      this.originalEvent.returnValue = FALSE;
    }
  }, {
    key: 'stopPropagation',
    value: function stopPropagation() {
      this.originalEvent.cancelBubble = TRUE;
    }
  }]);
  return IEEvent;
}();

function addInputListener(element, listener) {
  var oldValue = element.value;
  listener.$listener = function (e) {
    if (e.originalEvent.originalEvent.propertyName === 'value') {
      var newValue = element.value;
      if (newValue !== oldValue) {
        var result = listener.apply(this, arguments);
        oldValue = newValue;
        return result;
      }
    }
  };
  element.attachEvent('onpropertychange', listener.$listener);
}

function removeInputListener(element, listener) {
  element.detachEvent('onpropertychange', listener.$listener);
  delete listener.$listener;
}

function addListener$2(element, type, listener) {
  if (type === 'input') {
    addInputListener(element, listener);
  } else {
    element.attachEvent('on' + type, listener);
  }
}

function removeListener$2(element, type, listener) {
  if (type === 'input') {
    removeInputListener(element, listener);
  } else {
    element.detachEvent('on' + type, listener);
  }
}

function createEvent$2(event, element) {
  return new IEEvent(event, element);
}

function findElement$2(selector, context) {
  return (context || doc).querySelector(selector);
}



var oldie = Object.freeze({
	addListener: addListener$2,
	removeListener: removeListener$2,
	createEvent: createEvent$2,
	findElement: findElement$2
});

var native$1 = doc.addEventListener ? modern : oldie;

var addListener$$1 = native$1.addListener;
var removeListener$$1 = native$1.removeListener;
var createEvent$$1 = native$1.createEvent;
var findElement$$1 = native$1.findElement;

function find(selector, context) {
  return findElement$$1(selector, context);
}

function create$2(tagName, parent) {
  if (parent) {
    parent.innerHTML = '<' + tagName + '></' + tagName + '>';
    return parent.firstChild;
  }
  return doc.createElement(tagName);
}

function getContent(selector) {
  return find(selector).innerHTML;
}

function isElement(node) {
  return node.nodeType === 1;
}

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
function on$1(element, type, listener, context) {
  var $emitter = element.$emitter || (element.$emitter = new Emitter());
  if (!$emitter.has(type)) {
    var nativeListener = function nativeListener(e) {
      e = new Event(createEvent$$1(e, element));
      $emitter.fire(e.type, e, context);
    };
    $emitter[type] = nativeListener;
    addListener$$1(element, type, nativeListener);
  }
  $emitter.on(type, listener);
}

/**
 * 解绑事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 */
function off$1(element, type, listener) {
  var $emitter = element.$emitter;

  var types = keys($emitter.listeners);
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener);
  // 根据 emitter 的删除结果来操作这里的事件 listener
  each(types, function (type) {
    if ($emitter[type] && !$emitter.has(type)) {
      removeListener$$1(element, type, $emitter[type]);
      delete $emitter[type];
    }
  });
}

var native = Object.freeze({
	find: find,
	create: create$2,
	getContent: getContent,
	isElement: isElement,
	on: on$1,
	off: off$1
});

/**
 * <Component ref="component" />
 * <input ref="input">
 */

var ref = {
  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance;
    var value = node.value;

    if (value && string(value)) {
      (function () {
        var $refs = instance.$refs;

        if (object($refs)) {
          if (has$2($refs, value)) {
            error$1('Registering a ref "' + value + '" is existed.');
          }
        } else {
          $refs = instance.$refs = {};
        }

        var setRef = function setRef(target) {
          $refs[value] = target;
          el.$ref = function () {
            delete $refs[value];
            el.$ref = NULL;
          };
        };

        var $component = el.$component;

        if ($component) {
          if (array($component)) {
            push$1($component, setRef);
          } else {
            setRef($component);
          }
        } else {
          setRef(el);
        }
      })();
    }
  },
  update: function update(options) {
    this.detach(options);
    this.attach(options);
  },
  detach: function detach(_ref2) {
    var el = _ref2.el;
    var $ref = el.$ref;

    if ($ref) {
      $ref();
    }
  }
};

/**
 * 节流调用
 *
 * @param {Function} fn 需要节制调用的函数
 * @param {number=} delay 调用的时间间隔，默认 50ms
 * @param {boolean=} lazy 是否在最后调用
 * @return {Function}
 */
var debounce = function (fn, delay, lazy) {

  var prevTime = void 0,
      timer = void 0;

  function createTimer(args) {
    timer = setTimeout(function () {
      timer = NULL;
      prevTime = Date.now();
      fn.apply(NULL, toArray(args));
    }, delay);
  }

  return function () {

    if (lazy && prevTime > 0 && Date.now() - prevTime < delay) {
      clearTimeout(timer);
      timer = NULL;
    }

    if (!timer) {
      createTimer(arguments);
    }
  };
};

var event = {
  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance,
        directives = _ref.directives,
        type = _ref.type,
        listener = _ref.listener;


    if (!type) {
      type = node.subName;
    }
    if (!listener) {
      listener = instance.compileValue(node.keypath, node.value);
    }

    if (listener) {
      var lazy = directives.lazy;

      if (lazy) {
        var value = lazy.node.value;

        if (numeric(value) && value >= 0) {
          listener = debounce(listener, value);
        } else if (type === 'input') {
          type = 'change';
        }
      }

      var $component = el.$component;

      if ($component) {
        var bind = function bind($component) {
          $component.on(type, listener);
          el.$event = function () {
            $component.off(type, listener);
            el.$event = NULL;
          };
        };
        if (array($component)) {
          push$1($component, bind);
        } else {
          bind($component);
        }
      } else {
        on$1(el, type, listener);
        el.$event = function () {
          off$1(el, type, listener);
          el.$event = NULL;
        };
      }
    }
  },
  update: function update(options) {
    this.detach(options);
    this.attach(options);
  },
  detach: function detach(_ref2) {
    var el = _ref2.el;
    var $event = el.$event;

    if ($event) {
      $event();
    }
  }
};

var componentControl = {
  set: function set(_ref) {
    var el = _ref.el,
        keypath = _ref.keypath,
        instance = _ref.instance;
    var $component = el.$component;

    $component.set('value', instance.get(keypath));
  },
  update: function update(_ref2) {
    var el = _ref2.el,
        keypath = _ref2.keypath,
        instance = _ref2.instance;
    var $component = el.$component;

    instance.set(keypath, $component.get('value'));
  }
};

var inputControl = {
  set: function set(_ref3) {
    var el = _ref3.el,
        keypath = _ref3.keypath,
        instance = _ref3.instance;

    var value = instance.get(keypath);
    // 如果输入框的值相同，赋值会导致光标变化，不符合用户体验
    if (value !== el.value) {
      el.value = value;
    }
  },
  update: function update(_ref4) {
    var el = _ref4.el,
        keypath = _ref4.keypath,
        instance = _ref4.instance;

    instance.set(keypath, el.value);
  }
};

var radioControl = {
  set: function set(_ref5) {
    var el = _ref5.el,
        keypath = _ref5.keypath,
        instance = _ref5.instance;

    el.checked = el.value == instance.get(keypath);
  },
  update: function update(_ref6) {
    var el = _ref6.el,
        keypath = _ref6.keypath,
        instance = _ref6.instance;

    if (el.checked) {
      instance.set(keypath, el.value);
    }
  }
};

var checkboxControl = {
  set: function set(_ref7) {
    var el = _ref7.el,
        keypath = _ref7.keypath,
        instance = _ref7.instance;

    var value = instance.get(keypath);
    el.checked = array(value) ? has$1(value, el.value, FALSE) : !!value;
  },
  update: function update(_ref8) {
    var el = _ref8.el,
        keypath = _ref8.keypath,
        instance = _ref8.instance;

    var value = instance.get(keypath);
    if (array(value)) {
      if (el.checked) {
        push$1(value, el.value);
      } else {
        remove$1(value, el.value, FALSE);
      }
      instance.set(keypath, copy(value));
    } else {
      instance.set(keypath, el.checked);
    }
  }
};

var specialControls = {
  radio: radioControl,
  checkbox: checkboxControl
};

var model = {
  attach: function attach(_ref9) {
    var el = _ref9.el,
        node = _ref9.node,
        instance = _ref9.instance,
        directives = _ref9.directives,
        attributes = _ref9.attributes;
    var value = node.value,
        keypath = node.keypath;


    var result = instance.get(value, keypath);
    if (result) {
      keypath = result.keypath;
    } else {
      return error$1('The ' + keypath + ' being used for two-way binding is ambiguous.');
    }

    var type = 'change',
        control = void 0,
        needSet = void 0;

    if (el.$component) {
      control = componentControl;
    } else {
      control = specialControls[el.type];
      if (!control) {
        control = inputControl;
        if ('oninput' in el) {
          type = 'input';
        }
      }
      if (!has$2(attributes, 'value')) {
        needSet = TRUE;
      }
    }

    var data = {
      el: el,
      keypath: keypath,
      instance: instance
    };

    var set$$1 = function set$$1() {
      control.set(data);
    };

    if (needSet) {
      set$$1();
    }

    instance.watch(keypath, set$$1);

    event.attach({
      el: el,
      node: node,
      instance: instance,
      directives: directives,
      type: type,
      listener: function listener() {
        control.update(data);
      }
    });
  },
  detach: function detach(_ref10) {
    var el = _ref10.el;

    event.detach({ el: el });
  }
};

function getComponentInfo(node, instance, directives, callback) {
  var _node = node,
      name = _node.name,
      attributes = _node.attributes;

  instance.component(name, function (options) {
    var props = {};
    each(attributes, function (node) {
      props[camelCase(node.name)] = node.value;
    });
    if (!has$2(props, 'value')) {
      var model = directives.model;

      if (model) {
        node = model.node;
        var result = instance.get(node.value, node.keypath);
        if (result) {
          props.value = result.value;
        }
      }
    }
    callback(props, options);
  });
}

var component = {
  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance,
        directives = _ref.directives;

    el.$component = [];
    getComponentInfo(node, instance, directives, function (props, options) {
      var $component = el.$component;

      if (array($component)) {
        el.$component = instance.create(options, {
          el: el,
          props: props,
          replace: TRUE
        });
        each($component, function (callback) {
          callback(el.$component);
        });
      }
    });
  },
  update: function update(_ref2) {
    var el = _ref2.el,
        node = _ref2.node,
        instance = _ref2.instance,
        directives = _ref2.directives;
    var $component = el.$component;

    if (object($component)) {
      getComponentInfo(node, instance, directives, function (props) {
        $component.set(props, TRUE);
      });
    }
  },
  detach: function detach(_ref3) {
    var el = _ref3.el;
    var $component = el.$component;

    if ($component) {
      if (object($component)) {
        $component.destroy(TRUE);
      }
      el.$component = NULL;
    }
  }
};

var Yox = function () {
  function Yox(options) {
    classCallCheck(this, Yox);


    var instance = this;

    callFunction(options[BEFORE_CREATE], instance, options);

    var el = options.el,
        data = options.data,
        props = options.props,
        parent = options.parent,
        replace = options.replace,
        computed = options.computed,
        template = options.template,
        watchers = options.watchers,
        components = options.components,
        directives = options.directives,
        events = options.events,
        filters = options.filters,
        methods = options.methods,
        partials = options.partials,
        extensions = options.extensions;

    // 如果不绑着，其他方法调不到钩子

    instance.$options = options;

    // 检查 props
    if (props && !object(props)) {
      props = NULL;
    }
    // 如果传了 props，则 data 应该是个 function
    if (props && data && !func(data)) {
      warn$1('Passing a "data" option should be a function.');
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = props || {};

    // 后放 data
    extend(instance.$data, func(data) ? callFunction(data, instance) : data);

    // 计算属性也是数据
    if (object(computed)) {

      // 把计算属性拆为 getter 和 setter
      instance.$computedGetters = {};
      instance.$computedSetters = {};

      // 辅助获取计算属性的依赖
      instance.$computedStack = [];
      instance.$computedDeps = {};

      each$1(computed, function (item, keypath) {
        var get$$1 = void 0,
            set$$1 = void 0,
            deps = void 0,
            cache = TRUE;
        if (func(item)) {
          get$$1 = item;
        } else if (object(item)) {
          if (boolean(item.cache)) {
            cache = item.cache;
          }
          if (array(item.deps)) {
            deps = item.deps;
          }
          if (func(item.get)) {
            get$$1 = item.get;
          }
          if (func(item.set)) {
            set$$1 = item.set;
          }
        }

        if (get$$1) {
          (function () {

            var watcher = function watcher() {
              getter.$dirty = TRUE;
            };

            var getter = function getter() {
              if (!getter.$dirty) {
                if (cache && has$2($watchCache, keypath)) {
                  return $watchCache[keypath];
                }
              } else {
                delete getter.$dirty;
              }

              if (!deps) {
                instance.$computedStack.push([]);
              }
              var result = callFunction(get$$1, instance);

              var newDeps = deps || instance.$computedStack.pop();
              var oldDeps = instance.$computedDeps[keypath];
              if (newDeps !== oldDeps) {
                updateDeps(instance, newDeps, oldDeps, watcher);
              }

              instance.$computedDeps[keypath] = newDeps;
              $watchCache[keypath] = result;

              return result;
            };
            getter.toString = getter;
            instance.$computedGetters[keypath] = getter;
          })();
        }

        if (set$$1) {
          instance.$computedSetters[keypath] = set$$1;
        }
      });
    }

    // 监听各种事件
    instance.$eventEmitter = new Emitter();
    instance.on(events);

    var $watchCache = instance.$watchCache = {};
    instance.$watchEmitter = new Emitter({
      afterAdd: function afterAdd(added) {
        each(added, function (keypath) {
          if (keypath.indexOf('*') < 0 && !has$2($watchCache, keypath)) {
            $watchCache[keypath] = instance.get(keypath);
          }
        });
      },
      afterRemove: function afterRemove(removed) {
        each(removed, function (keypath) {
          if (has$2($watchCache, keypath)) {
            delete $watchCache[keypath];
          }
        });
      }
    });
    instance.watch(watchers);

    callFunction(options[AFTER_CREATE], instance);

    // 检查 template
    if (string(template)) {
      if (selector.test(template)) {
        template = getContent(template);
      }
      if (!tag.test(template)) {
        error$1('Passing a "template" option must have a root element.');
      }
    } else {
      template = NULL;
    }

    // 检查 el
    if (string(el)) {
      if (selector.test(el)) {
        el = find(el);
      }
    }
    if (el) {
      if (isElement(el)) {
        if (!replace) {
          el = create$2('div', el);
        }
      } else {
        error$1('Passing a "el" option must be a html element.');
      }
    }

    if (parent) {
      instance.$parent = parent;
    }

    if (methods) {
      each$1(methods, function (fn, name) {
        if (has$2(prototype, name)) {
          error$1('Passing a "' + name + '" method is conflicted with built-in methods.');
        }
        instance[name] = fn;
      });
    }
    extend(instance, extensions);

    instance.component(components);
    instance.directive(directives);
    instance.filter(filters);
    instance.partial(partials);

    if (template) {
      instance.$viewWatcher = function () {
        instance.$dirty = TRUE;
      };
      callFunction(options[BEFORE_MOUNT], instance);
      instance.$template = Yox.compile(template);
      instance.updateView(el || create$2('div'));
    }
  }

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {?string} context
   * @return {*}
   */


  createClass(Yox, [{
    key: 'get',
    value: function get(keypath, context) {
      var $data = this.$data,
          $computedStack = this.$computedStack,
          $computedGetters = this.$computedGetters;


      var result = void 0;

      var getValue = function getValue(keypath) {
        if ($computedGetters) {
          result = $computedGetters[keypath];
          if (result) {
            return {
              value: result()
            };
          }
        }
        return get$1($data, keypath);
      };

      keypath = normalize(keypath);

      if (string(context)) {
        var keys$$1 = parse(context);
        while (TRUE) {
          push$1(keys$$1, keypath);
          context = stringify(keys$$1);
          result = getValue(context);
          if (result || keys$$1.length <= 1) {
            if (result) {
              result.keypath = context;
            }
            return result;
          } else {
            keys$$1.splice(-2);
          }
        }
      } else {
        if ($computedStack) {
          result = last($computedStack);
          if (result) {
            push$1(result, keypath);
          }
        }
        result = getValue(keypath);
        if (result) {
          return result.value;
        }
      }
    }
  }, {
    key: 'set',
    value: function set(keypath, value) {

      var model$$1 = void 0,
          immediate = void 0;
      if (string(keypath)) {
        model$$1 = {};
        model$$1[keypath] = value;
      } else if (object(keypath)) {
        model$$1 = copy(keypath);
        immediate = value === TRUE;
      } else {
        return;
      }

      this.updateModel(model$$1, immediate);
    }

    /**
     * 监听事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     */

  }, {
    key: 'on',
    value: function on(type, listener) {
      this.$eventEmitter.on(type, listener);
    }

    /**
     * 监听一次事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     */

  }, {
    key: 'once',
    value: function once(type, listener) {
      this.$eventEmitter.once(type, listener);
    }

    /**
     * 取消监听事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     */

  }, {
    key: 'off',
    value: function off(type, listener) {
      this.$eventEmitter.off(type, listener);
    }

    /**
     * 触发事件
     *
     * @param {string} type
     * @param {?*} data
     */

  }, {
    key: 'fire',
    value: function fire(type, data) {

      // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
      // 内部为了保持格式统一
      // 需要转成 Event，这样还能知道 target 是哪个组件
      var event$$1 = data;
      if (!(event$$1 instanceof Event)) {
        event$$1 = new Event(type);
        if (data) {
          event$$1.data = data;
        }
      }

      // 事件名称经过了转换
      if (event$$1.type !== type) {
        data = event$$1.data;
        event$$1 = new Event(event$$1);
        event$$1.type = type;
        // data 不能换位置，否则事件处理函数获取数据很蛋疼
        if (data) {
          event$$1.data = data;
        }
      }

      var instance = this;
      var $parent = instance.$parent,
          $eventEmitter = instance.$eventEmitter;


      if (!event$$1.target) {
        event$$1.target = instance;
      }

      var done = $eventEmitter.fire(type, event$$1, instance);
      if (done && $parent) {
        done = $parent.fire(type, event$$1);
      }

      return done;
    }

    /**
     * 监听数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     */

  }, {
    key: 'watch',
    value: function watch(keypath, watcher) {
      this.$watchEmitter.on(keypath, watcher);
    }

    /**
     * 监听一次数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     */

  }, {
    key: 'watchOnce',
    value: function watchOnce(keypath, watcher) {
      this.$watchEmitter.once(keypath, watcher);
    }

    /**
     * 只更新数据，不更新视图
     *
     * @param {Object} model
     */

  }, {
    key: 'updateModel',
    value: function updateModel(model$$1) {

      var instance = this;

      var $data = instance.$data,
          $computedSetters = instance.$computedSetters;


      each$1(model$$1, function (newValue, key) {
        // 格式化 Keypath
        var keypath = normalize(key);
        if (keypath !== key) {
          delete model$$1[key];
          model$$1[keypath] = newValue;
        }
      });

      each$1(model$$1, function (value, keypath) {
        if ($computedSetters) {
          var setter = $computedSetters[keypath];
          if (setter) {
            setter.call(instance, value);
            return;
          }
        }
        set$1($data, keypath, value);
      });

      var args = arguments,
          immediate = void 0;
      if (args.length === 1) {
        immediate = instance.$dirtyIgnore = TRUE;
      } else if (args.length === 2) {
        immediate = args[1];
      }

      if (immediate) {
        diff$$1(instance);
      } else if (!instance.$diffing) {
        instance.$diffing = TRUE;
        add(function () {
          delete instance.$diffing;
          diff$$1(instance);
        });
      }
    }

    /**
     * 更新视图
     */

  }, {
    key: 'updateView',
    value: function updateView() {

      var instance = this;

      var $viewDeps = instance.$viewDeps,
          $viewWatcher = instance.$viewWatcher,
          $data = instance.$data,
          $options = instance.$options,
          $filters = instance.$filters,
          $template = instance.$template,
          $currentNode = instance.$currentNode,
          $computedGetters = instance.$computedGetters;


      if ($currentNode) {
        callFunction($options[BEFORE_UPDATE], instance);
      }

      var context = {};
      var filter = registry.filter;


      extend(context,
      // 全局过滤器
      filter && filter.data,
      // 本地过滤器
      $filters.data);

      each$1(context, function (value, key) {
        if (func(value)) {
          context[key] = value.bind(instance);
        }
      });

      // data 中的函数不需要强制绑定 this
      // 不是不想管，是没法管，因为每层级都可能出现函数，但不可能每层都绑定
      // 而且让 data 中的函数完全动态化说不定还是一个好设计呢
      extend(context, $data, $computedGetters);

      var _vdom$create = create$1($template, context, instance),
          node = _vdom$create.node,
          deps = _vdom$create.deps;

      instance.$viewDeps = keys(deps);
      updateDeps(instance, instance.$viewDeps, $viewDeps, $viewWatcher);

      var afterHook = void 0;
      if ($currentNode) {
        afterHook = AFTER_UPDATE;
        $currentNode = patch($currentNode, node);
      } else {
        afterHook = AFTER_MOUNT;
        $currentNode = patch(arguments[0], node);
        instance.$el = $currentNode.elm;
      }

      instance.$currentNode = $currentNode;
      callFunction($options[afterHook], instance);
    }

    /**
     * 创建子组件
     *
     * @param {Object} options 组件配置
     * @param {?Object} extra 添加进组件配置，但不修改配置的数据，比如 el、props 等
     * @return {Yox} 子组件实例
     */

  }, {
    key: 'create',
    value: function create(options, extra) {
      options = extend({}, options, extra);
      var _options = options,
          props = _options.props,
          propTypes = _options.propTypes;

      if (object(props) && object(propTypes)) {
        options.props = Yox.validate(props, propTypes);
      }
      options.parent = this;
      var child = new Yox(options);
      var children = this.$children || (this.$children = []);
      push$1(children, child);
      return child;
    }
  }, {
    key: 'compileValue',
    value: function compileValue(keypath, value) {

      if (!value || !string(value)) {
        return;
      }

      var instance = this;
      if (value.indexOf('(') > 0) {
        var _ret2 = function () {
          var ast = compile$1(value);
          if (ast.type === CALL) {
            return {
              v: function v(e) {
                var isEvent = e instanceof Event;
                var args = copy(ast.args);
                if (!args.length) {
                  if (isEvent) {
                    push$1(args, e);
                  }
                } else {
                  args = args.map(function (node) {
                    var name = node.name,
                        type = node.type;

                    if (type === LITERAL) {
                      return node.value;
                    }
                    if (type === IDENTIFIER) {
                      if (name === SPECIAL_EVENT) {
                        if (isEvent) {
                          return e;
                        }
                      } else if (name === SPECIAL_KEYPATH) {
                        return keypath;
                      }
                    } else if (type === MEMBER) {
                      name = stringify$1(node);
                    }

                    var result = instance.get(name, keypath);
                    if (result) {
                      return result.value;
                    }
                  });
                }
                var name = stringify$1(ast.callee);
                var fn = instance[name];
                if (!fn) {
                  var result = instance.get(name, keypath);
                  if (result) {
                    fn = result.value;
                  }
                }
                callFunction(fn, instance, args);
              }
            };
          }
        }();

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      } else {
        return function (event$$1) {
          instance.fire(value, event$$1);
        };
      }
    }

    /**
     * 销毁组件
     */

  }, {
    key: 'destroy',
    value: function destroy() {

      var instance = this;

      var $options = instance.$options,
          $parent = instance.$parent,
          $children = instance.$children,
          $currentNode = instance.$currentNode,
          $watchEmitter = instance.$watchEmitter,
          $eventEmitter = instance.$eventEmitter;


      callFunction($options[BEFORE_DESTROY], instance);

      if ($children) {
        each($children, function (child) {
          child.destroy();
        }, TRUE);
      }

      if ($parent && $parent.$children) {
        remove$1($parent.$children, instance);
      }

      if ($currentNode) {
        if (arguments[0] !== TRUE) {
          patch($currentNode, { text: '' });
        }
      }

      $watchEmitter.off();
      $eventEmitter.off();

      each$1(instance, function (value, key) {
        delete instance[key];
      });

      callFunction($options[AFTER_DESTROY], instance);
    }

    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     *
     * @param {Function} fn
     */

  }, {
    key: 'nextTick',
    value: function nextTick(fn) {
      add(fn);
    }

    /**
     * 取反 keypath 对应的数据
     *
     * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
     *
     * @param {boolean} keypath
     * @return {boolean} 取反后的布尔值
     */

  }, {
    key: 'toggle',
    value: function toggle(keypath) {
      var value = !this.get(keypath);
      this.set(keypath, value);
      return value;
    }

    /**
     * 递增 keypath 对应的数据
     *
     * 注意，最好是整型的加法，如果涉及浮点型，不保证计算正确
     *
     * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
     * @param {?number} step 步进值，默认是 1
     * @param {?number} min 可以递增到的最小值，默认不限制
     * @return {number} 返回递增后的值
     */

  }, {
    key: 'increase',
    value: function increase(keypath, step, max) {
      var value = toNumber(this.get(keypath), 0) + (numeric(step) ? step : 1);
      if (!numeric(max) || value <= max) {
        this.set(keypath, value);
      }
      return value;
    }

    /**
     * 递减 keypath 对应的数据
     *
     * 注意，最好是整型的减法，如果涉及浮点型，不保证计算正确
     *
     * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递减
     * @param {?number} step 步进值，默认是 1
     * @param {?number} min 可以递减到的最小值，默认不限制
     * @return {number} 返回递减后的值
     */

  }, {
    key: 'decrease',
    value: function decrease(keypath, step, min) {
      var value = toNumber(this.get(keypath), 0) - (numeric(step) ? step : 1);
      if (!numeric(min) || value >= min) {
        this.set(keypath, value);
      }
      return value;
    }
  }, {
    key: 'unshift',
    value: function unshift(keypath, item) {
      handleArray(this, keypath, function (list) {
        list.unshift(item);
      });
    }
  }, {
    key: 'shift',
    value: function shift(keypath) {
      return handleArray(this, keypath, function (list) {
        return list.shift();
      });
    }
  }, {
    key: 'push',
    value: function push(keypath, item) {
      handleArray(this, keypath, function (list) {
        list.push(item);
      });
    }
  }, {
    key: 'pop',
    value: function pop(keypath) {
      return handleArray(this, keypath, function (list) {
        return list.pop();
      });
    }
  }, {
    key: 'remove',
    value: function remove(keypath, item) {
      handleArray(this, keypath, function (list) {
        remove$1(list, item);
      });
    }
  }, {
    key: 'removeAt',
    value: function removeAt(keypath, index) {
      handleArray(this, keypath, function (list) {
        list.splice(index, 1);
      });
    }
  }, {
    key: 'log',
    value: function log(msg) {
      log$1(msg);
    }
  }, {
    key: 'warn',
    value: function warn(msg) {
      warn$1(msg);
    }
  }]);
  return Yox;
}();

Yox.version = '0.21.4';

/**
 * 工具，便于扩展、插件使用
 *
 * @type {Object}
 */
Yox.utils = { is: is$1, array: array$1, object: object$1, string: string$1, native: native, Emitter: Emitter, Event: Event };

var prototype = Yox.prototype;

// 全局注册

var registry = {};

// 支持异步注册
var supportRegisterAsync = ['component'];

// 解析注册参数
function parseRegisterArguments(type, args) {
  var id = args[0];
  var value = args[1];
  var callback = void 0;
  if (has$1(supportRegisterAsync, type) && func(value)) {
    callback = value;
    value = UNDEFINED;
  }
  return {
    callback: callback,
    args: value === UNDEFINED ? [id] : [id, value]
  };
}

/**
 * 全局/本地注册
 *
 * @param {Object|string} id
 * @param {?Object} value
 */
each(merge(supportRegisterAsync, ['directive', 'filter', 'partial']), function (type) {
  prototype[type] = function () {
    var prop = '$' + type + 's';
    var store = this[prop] || (this[prop] = new Store());

    var _parseRegisterArgumen = parseRegisterArguments(type, arguments),
        args = _parseRegisterArgumen.args,
        callback = _parseRegisterArgumen.callback;

    return magic({
      args: args,
      get: function get(id) {
        if (callback) {
          store.getAsync(id, function (value) {
            if (value) {
              callback(value);
            } else {
              Yox[type](id, callback);
            }
          });
        } else {
          return store.get(id) || Yox[type](id);
        }
      },
      set: function set(id, value) {
        store.set(id, value);
      }
    });
  };
  Yox[type] = function () {
    var store = registry[type] || (registry[type] = new Store());

    var _parseRegisterArgumen2 = parseRegisterArguments(type, arguments),
        args = _parseRegisterArgumen2.args,
        callback = _parseRegisterArgumen2.callback;

    return magic({
      args: args,
      get: function get(id) {
        if (callback) {
          store.getAsync(id, callback);
        } else {
          return store.get(id);
        }
      },
      set: function set(id, value) {
        store.set(id, value);
      }
    });
  };
});

/**
 * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
 *
 * @param {Function} fn
 */
Yox.nextTick = add;

/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 *
 * @param {string} template
 * @return {Object}
 */
Yox.compile = function (template) {
  return string(template) ? compile$$1(template) : template;
};

/**
 * 验证 props
 *
 * @param {Object} props 传递的数据
 * @param {Object} schema 数据格式
 * @return {Object} 验证通过的数据
 */
Yox.validate = function (props, schema) {
  var result = {};
  each$1(schema, function (rule, key) {
    var type = rule.type,
        value = rule.value,
        required = rule.required;

    if (has$2(props, key)) {
      // 如果不写 type 或 type 不是 字符串 或 数组
      // 就当做此规则无效，和没写一样
      if (type) {
        (function () {
          var target = props[key],
              matched = void 0;
          // 比较类型
          if (string(type)) {
            matched = is(target, type);
          } else if (array(type)) {
            each(type, function (t) {
              if (is(target, t)) {
                matched = TRUE;
                return FALSE;
              }
            });
          } else if (func(type)) {
            // 有时候做判断需要参考其他数据
            // 比如当 a 有值时，b 可以为空之类的
            matched = type(target, props);
          }
          if (matched === TRUE) {
            result[key] = target;
          } else {
            warn$1('Passing a "' + key + '" prop is not matched.');
          }
        })();
      }
    } else if (required === TRUE || func(required) && required(props)) {
      warn$1('Passing a "' + key + '" prop is not found.');
    } else if (has$2(rule, 'value')) {
      result[key] = func(value) ? value(props) : value;
    }
  });
  return result;
};

/**
 * 安装插件
 *
 * 插件必须暴露 install 方法
 *
 * @param {Object} plugin
 */
Yox.use = function (plugin) {
  plugin.install(Yox);
};

function updateDeps(instance, newDeps, oldDeps, watcher) {

  var addedDeps = void 0,
      removedDeps = void 0;
  if (array(oldDeps)) {
    addedDeps = diff$1(oldDeps, newDeps);
    removedDeps = diff$1(newDeps, oldDeps);
  } else {
    addedDeps = newDeps;
  }

  each(addedDeps, function (keypath) {
    instance.watch(keypath, watcher);
  });

  if (removedDeps) {
    each(removedDeps, function (dep) {
      instance.$watchEmitter.off(dep, watcher);
    });
  }
}

function diff$$1(instance) {
  var $children = instance.$children,
      $watchCache = instance.$watchCache,
      $watchEmitter = instance.$watchEmitter,
      $computedDeps = instance.$computedDeps;

  // 排序，把依赖最少的放前面

  var keys$$1 = [];
  var addKey = function addKey(key, push$$1) {
    if (!has$1(keys$$1, key)) {
      if (push$$1) {
        keys$$1.push(key);
      } else {
        keys$$1.unshift(key);
      }
    }
  };

  var pickDeps = function pickDeps(key) {
    if ($computedDeps && !falsy($computedDeps[key])) {
      each($computedDeps[key], pickDeps);
      addKey(key, TRUE);
    } else {
      addKey(key);
    }
  };

  each$1($watchCache, function (value, key) {
    pickDeps(key);
  });

  each(keys$$1, function (key) {
    var oldValue = $watchCache[key];
    var newValue = instance.get(key);
    if (newValue !== oldValue) {
      $watchCache[key] = newValue;
      $watchEmitter.fire(key, [newValue, oldValue, key], instance);
    }
  });

  var $dirty = instance.$dirty,
      $dirtyIgnore = instance.$dirtyIgnore;


  if ($dirty) {
    delete instance.$dirty;
  }
  if ($dirtyIgnore) {
    delete instance.$dirtyIgnore;
    return;
  }

  if ($dirty) {
    instance.updateView();
  } else if ($children) {
    each($children, function (child) {
      diff$$1(child);
    });
  }
}

function handleArray(instance, keypath, handler) {
  var array$$1 = instance.get(keypath);
  array$$1 = array(array$$1) ? copy(array$$1) : [];
  var result = handler(array$$1);
  instance.set(keypath, array$$1);
  return result;
}

// 全局注册内置指令
Yox.directive({ ref: ref, event: event, model: model, component: component });

return Yox;

})));
