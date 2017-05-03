(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Yox = factory());
}(this, (function () { 'use strict';

if (!Object.keys) {
  Object.keys = function (obj) {
    var result = [];
    for (var key in obj) {
      push(result, key);
    }
    return result;
  };
  Object.freeze = function (obj) {
    return obj;
  };
  Object.defineProperty = function (obj, key, descriptor) {
    obj[key] = descriptor.value;
  };
  Object.create = function (proto, descriptor) {
    function Class() {}
    Class.prototype = proto;
    proto = new Class();
    var constructor = descriptor && descriptor.constructor;
    if (constructor) {
      proto.constructor = constructor.value;
    }
    return proto;
  };
}
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s*|\s*$/g, '');
  };
}
if (!Array.prototype.map) {
  Array.prototype.indexOf = function (target) {
    var result = -1;
    each(this, function (item, index) {
      if (item === target) {
        result = index;
        return FALSE;
      }
    });
    return result;
  };
  Array.prototype.map = function (fn) {
    var result = [];
    each(this, function (item, index) {
      result.push(fn(item, index));
    });
    return result;
  };
  Array.prototype.filter = function (fn) {
    var result = [];
    each(this, function (item, index) {
      if (fn(item, index)) {
        result.push(item);
      }
    });
    return result;
  };
}
if (!Function.prototype.bind) {
  Function.prototype.bind = function (context) {
    var fn = this;
    return function () {
      return execute(fn, context, toArray$1(arguments));
    };
  };
}

/**
 * 为了压缩，定义的常量
 *
 * @type {boolean}
 */
var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;
var THIS = 'this';

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

/**
 * 空函数
 *
 * @return {Function}
 */
function noop() {
  /** yox */
}

function is(arg, type) {
  return type === 'numeric' ? numeric(arg) : Object.prototype.toString.call(arg).toLowerCase() === '[object ' + type + ']';
}

function func(arg) {
  return is(arg, 'function');
}

function array(arg) {
  return is(arg, 'array');
}

function object(arg) {
  // 低版本 IE 会把 null 和 undefined 当作 object
  return arg && is(arg, 'object');
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

function primitive(arg) {
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
	primitive: primitive,
	numeric: numeric
});

var execute = function (fn, context, args) {
  if (func(fn)) {
    if (array(args)) {
      return fn.apply(context, args);
    } else {
      return fn.call(context, args);
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

        if (originalEvent) {
          if (func(originalEvent.prevent)) {
            originalEvent.prevent();
          } else if (func(originalEvent.preventDefault)) {
            originalEvent.preventDefault();
          }
        }
        this.isPrevented = TRUE;
      }
    }
  }, {
    key: 'stop',
    value: function stop() {
      if (!this.isStoped) {
        var originalEvent = this.originalEvent;

        if (originalEvent) {
          if (func(originalEvent.stop)) {
            originalEvent.stop();
          } else if (func(originalEvent.stopPropagation)) {
            originalEvent.stopPropagation();
          }
        }
        this.isStoped = TRUE;
      }
    }
  }]);
  return Event;
}();

Event.is = function (target) {
  return target instanceof Event;
};

/**
 * 为了压缩，定义的常用字符
 */

function charAt(str) {
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return str.charAt(index);
}

function codeAt(str) {
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return str.charCodeAt(index);
}

var CHAR_BLANK = '';

var CHAR_DOT = '.';
var CODE_DOT = codeAt(CHAR_DOT);

var CHAR_HASH = '#';
var CODE_HASH = codeAt(CHAR_HASH);

var CHAR_DASH = '-';
var CODE_DASH = codeAt(CHAR_DASH);

var CHAR_EQUAL = '=';
var CODE_EQUAL = codeAt(CHAR_EQUAL);

var CHAR_SLASH = '/';
var CODE_SLASH = codeAt(CHAR_SLASH);

var CHAR_COMMA = ',';
var CODE_COMMA = codeAt(CHAR_COMMA);

var CHAR_COLON = ':';
var CODE_COLON = codeAt(CHAR_COLON);

var CHAR_SEMCOL = ';';
var CODE_SEMCOL = codeAt(CHAR_SEMCOL);

var CHAR_SQUOTE = "'";
var CODE_SQUOTE = codeAt(CHAR_SQUOTE);

var CHAR_DQUOTE = '"';
var CODE_DQUOTE = codeAt(CHAR_DQUOTE);

var CHAR_OPAREN = '(';
var CODE_OPAREN = codeAt(CHAR_OPAREN);

var CHAR_CPAREN = ')';
var CODE_CPAREN = codeAt(CHAR_CPAREN);

var CHAR_OBRACK = '[';
var CODE_OBRACK = codeAt(CHAR_OBRACK);

var CHAR_CBRACK = ']';
var CODE_CBRACK = codeAt(CHAR_CBRACK);

var CHAR_OBRACE = '{';
var CODE_OBRACE = codeAt(CHAR_OBRACE);

var CHAR_CBRACE = '}';
var CODE_CBRACE = codeAt(CHAR_CBRACE);

var CHAR_LEFT = '<';
var CODE_LEFT = codeAt(CHAR_LEFT);

var CHAR_RIGHT = '>';
var CODE_RIGHT = codeAt(CHAR_RIGHT);

var CHAR_QUMARK = '?';
var CODE_QUMARK = codeAt(CHAR_QUMARK);

var CHAR_TAB = '\t';
var CODE_TAB = codeAt(CHAR_TAB);

var CHAR_BREAKLINE = '\n';
var CODE_BREAKLINE = codeAt(CHAR_BREAKLINE);

var CHAR_WHITESPACE = ' ';
var CODE_WHITESPACE = codeAt(CHAR_WHITESPACE);

/**
 * 遍历数组
 *
 * @param {Array} array
 * @param {Function} callback 返回 false 可停止遍历
 * @param {?boolean} reversed 是否逆序遍历
 */
function each(array$$1, callback, reversed) {
  var length = array$$1.length;

  if (length) {
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
}

/**
 * 合并多个数组
 *
 * @param {Array} array1
 * @param {Array} array2
 * @return {Array}
 */
function merge(array1, array2) {
  var result = [];
  push(result, array1);
  push(result, array2);
  return result;
}

/**
 * 往后加
 *
 * @param {Array} original
 * @param {*} value
 */
function push(original, value) {
  if (array(value)) {
    each(value, function (item) {
      original.push(item);
    });
  } else {
    original.push(value);
  }
}

/**
 * 往前加
 *
 * @param {Array} original
 * @param {*} value
 */
function unshift(original, value) {
  if (array(value)) {
    each(value, function (item) {
      original.unshift(item);
    });
  } else {
    original.unshift(value);
  }
}

/**
 * 把类数组转成数组
 *
 * @param {Array|ArrayLike} array 类数组
 * @return {Array}
 */
function toArray$1(array$$1) {
  return array(array$$1) ? array$$1 : execute([].slice, array$$1);
}

/**
 * 把数组转成对象
 *
 * @param {Array} array 数组
 * @param {?string} key 数组项包含的字段名称，如果数组项是基本类型，可不传
 * @param {?*} value
 * @return {Object}
 */
function toObject(array$$1, key, value) {
  var result = {};
  each(array$$1, function (item, index) {
    result[key ? item[key] : item] = value;
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
    for (var i = 0, len = array$$1.length; i < len; i++) {
      if (array$$1[i] == item) {
        return i;
      }
    }
    return -1;
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
function has(array$$1, item, strict) {
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
 * 弹出数组最后一项
 *
 * 项目里用的太多，仅用于节省字符...
 *
 * @param {Array} array 数组
 * @return {*}
 */
function pop(array$$1) {
  return array$$1.pop();
}

/**
 * 删除数组项
 *
 * @param {Array} array 数组
 * @param {*} item 待删除项
 * @param {?boolean} strict 是否全等判断，默认是全等
 * @return {boolean} 是否删除成功
 */
function remove(array$$1, item, strict) {
  var index = indexOf(array$$1, item, strict);
  if (index >= 0) {
    array$$1.splice(index, 1);
    return TRUE;
  }
  return FALSE;
}

/**
 * 用于判断长度大于 0 的数组
 *
 * @param {*} array
 * @return {boolean}
 */
function falsy(array$$1) {
  return !array(array$$1) || array$$1.length === 0;
}

var array$1 = Object.freeze({
	each: each,
	merge: merge,
	push: push,
	unshift: unshift,
	toArray: toArray$1,
	toObject: toObject,
	indexOf: indexOf,
	has: has,
	last: last,
	pop: pop,
	remove: remove,
	falsy: falsy
});

/**
 * 转成驼峰
 *
 * @param {string} str
 * @return {string}
 */
function camelCase(str) {
  if (has$2(str, CHAR_DASH)) {
    return str.replace(/-([a-z])/gi, function ($0, $1) {
      return $1.toUpperCase();
    });
  }
  return str;
}

/**
 * 判断长度大于 0 的字符串
 *
 * @param {*} str
 * @return {boolean}
 */
function falsy$1(str) {
  return !string(str) || str === CHAR_BLANK;
}

/**
 * 删除两侧空白符
 *
 * @param {*} str
 * @return {boolean}
 */
function trim(str) {
  return falsy$1(str) ? CHAR_BLANK : str.trim();
}

function slice(str, start, end) {
  return number(end) ? str.slice(start, end) : str.slice(start);
}

function split(str, delimiter) {
  return falsy$1(str) ? [] : str.split(new RegExp('\\s*' + delimiter.replace(/[.*?]/g, '\\$&') + '\\s*'));
}

function indexOf$1(str, part) {
  return str.indexOf(part);
}

function has$2(str, part) {
  return indexOf$1(str, part) >= 0;
}

function startsWith(str, part) {
  return indexOf$1(str, part) === 0;
}

function endsWith(str, part) {
  var offset = str.length - part.length;
  return offset >= 0 && str.lastIndexOf(part) === offset;
}

var string$1 = Object.freeze({
	camelCase: camelCase,
	falsy: falsy$1,
	trim: trim,
	slice: slice,
	split: split,
	indexOf: indexOf$1,
	has: has$2,
	startsWith: startsWith,
	endsWith: endsWith
});

var SEPARATOR_KEY = '.';

var LEVEL_CURRENT = '.';


var normalizeCache = {};

function normalize(str) {
  if (!falsy$1(str) && indexOf$1(str, '[') > 0 && indexOf$1(str, ']') > 0) {
    if (!has$1(normalizeCache, str)) {
      normalizeCache[str] = str.replace(/\[\s*?([^\]]+)\s*?\]/g, function ($0, $1) {
        var code = codeAt($1);
        if (code === CODE_SQUOTE || code === CODE_DQUOTE) {
          $1 = slice($1, 1, -1);
        }
        return '' + SEPARATOR_KEY + $1;
      });
    }
    return normalizeCache[str];
  }
  return str;
}

function filter(term) {
  return term !== CHAR_BLANK && term !== THIS && term !== LEVEL_CURRENT;
}

function parse(str) {
  return split(normalize(str), SEPARATOR_KEY).filter(filter);
}

function stringify(keypaths) {
  return keypaths.filter(filter).join(SEPARATOR_KEY);
}

function startsWith$1(keypath, prefix, split$$1) {
  var temp = void 0;
  if (keypath === prefix) {
    return split$$1 ? [keypath, CHAR_BLANK] : TRUE;
  } else if (startsWith(keypath, temp = prefix + SEPARATOR_KEY)) {
    return split$$1 ? [prefix, slice(keypath, temp.length)] : TRUE;
  } else {
    return FALSE;
  }
}

function join(keypath1, keypath2) {
  if (keypath1 && keypath2) {
    return keypath1 + SEPARATOR_KEY + keypath2;
  } else if (keypath1) {
    return keypath1;
  } else {
    return keypath2 || CHAR_BLANK;
  }
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
 * 排序对象的 key
 *
 * @param {Object} object
 * @param {Object} desc 是否逆序，默认从小到大排序
 * @return {Array.<string>}
 */
function sort(object$$1, desc) {
  var sorter = void 0;
  if (desc) {
    sorter = function sorter(a, b) {
      return b.length - a.length;
    };
  } else {
    sorter = function sorter(a, b) {
      return a.length - b.length;
    };
  }
  return keys(object$$1).sort(sorter);
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
function has$1(object$$1, key) {
  return object$$1.hasOwnProperty(key);
}

/**
 * 本来想用 in，无奈关键字...
 *
 * @param {Object} object
 * @param {string} key
 * @return {boolean}
 */
function exists(object$$1, key) {
  return primitive(object$$1) ? has$1(object$$1, key) : key in object$$1;
}

/**
 * 清空对象所有的值
 *
 * @param {Object} object
 */
function clear(object$$1) {
  each$1(object$$1, function (value, key) {
    delete object$$1[key];
  });
}

/**
 * 扩展对象
 *
 * @return {Object}
 */
function extend(original, object1, object2, object3) {
  each([object1, object2, object3], function (object$$1) {
    if (object(object$$1)) {
      each$1(object$$1, function (value, key) {
        original[key] = value;
      });
    }
  });
  return original;
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

function getValue(object$$1, key) {
  // 如果函数改写了 toString，就调用 toString() 求值
  var value = object$$1[key];
  if (func(value) && value.toString !== Function.prototype.toString) {
    value = value.toString();
  }
  return value;
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

  if (!falsy$1(keypath) && !exists(object$$1, keypath)
  // 不能以 . 开头
  && indexOf$1(keypath, CHAR_DOT) > 0) {
    var list = parse(keypath);
    for (var i = 0, len = list.length; i < len; i++) {
      if (i < len - 1) {
        object$$1 = getValue(object$$1, list[i]);
        if (object$$1 == NULL) {
          return;
        }
      } else {
        keypath = list[i];
      }
    }
  }

  if (exists(object$$1, keypath)) {
    return {
      value: getValue(object$$1, keypath)
    };
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
  if (!falsy$1(keypath) && !exists(object$$1, keypath) && indexOf$1(keypath, CHAR_DOT) > 0) {
    var originalObject = object$$1;
    var list = parse(keypath);
    var prop = pop(list);
    each(list, function (item, index) {
      if (object$$1[item]) {
        object$$1 = object$$1[item];
      } else if (autofill !== FALSE) {
        object$$1 = object$$1[item] = {};
      } else {
        return object$$1 = FALSE;
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
	sort: sort,
	each: each$1,
	has: has$1,
	exists: exists,
	clear: clear,
	extend: extend,
	copy: copy,
	get: get$1,
	set: set$1
});

var Emitter = function () {
  function Emitter() {
    classCallCheck(this, Emitter);

    this.listeners = {};
  }

  createClass(Emitter, [{
    key: 'on',
    value: function on(type, listener) {
      var listeners = this.listeners;


      var addListener = function addListener(listener, type) {
        if (func(listener)) {
          push(listeners[type] || (listeners[type] = []), listener);
        }
      };

      if (object(type)) {
        each$1(type, addListener);
      } else if (string(type)) {
        addListener(listener, type);
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

      if (type == NULL) {
        this.listeners = {};
      } else {
        var listeners = this.listeners;

        var list = listeners[type];
        if (list) {
          if (listener == NULL) {
            list.length = 0;
          } else {
            remove(list, listener);
          }
          if (!list.length) {
            delete listeners[type];
          }
        }
      }
    }
  }, {
    key: 'fire',
    value: function fire(type, data, context) {

      var isComplete = TRUE;

      var list = this.listeners[type];
      if (list) {

        var event = data;
        if (array(data)) {
          event = data[0];
        }

        var isEvent = Event.is(event);

        each(list, function (listener) {

          var result = execute(listener, context, data);

          var $once = listener.$once;

          if (func($once)) {
            $once();
            delete listener.$once;
          }

          // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
          if (isEvent) {
            if (result === FALSE) {
              event.prevent();
              event.stop();
            } else if (event.isStoped) {
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
  }, {
    key: 'has',
    value: function has$$1(type, listener) {

      var list = this.listeners[type];
      if (listener == NULL) {
        return !falsy(list);
      } else if (list) {
        return has(list, listener);
      }
    }
  }]);
  return Emitter;
}();

/**
 * 是否有原生的日志特性，没有必要单独实现
 *
 * @type {boolean}
 */
var hasConsole = typeof console !== 'undefined';

var debug = /yox/.test(noop.toString());

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
function log(msg) {
  if (hasConsole && isDebug()) {
    console.log('[Yox log]: ' + msg);
  }
}

/**
 * 打印警告日志
 *
 * @param {string} msg
 */
function warn(msg) {
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

/**
 * 致命错误，中断程序
 *
 * @param {string} msg
 */
function fatal(msg) {
  throw new Error('[Yox fatal]: ' + msg);
}

var logger = Object.freeze({
	log: log,
	warn: warn,
	error: error$1,
	fatal: fatal
});

function byObserver(fn) {
  var observer = new MutationObserver(fn);
  var textNode = doc.createTextNode(CHAR_BLANK);
  observer.observe(textNode, {
    characterData: TRUE
  });
  textNode.data = CHAR_WHITESPACE;
}

function byImmediate(fn) {
  setImmediate(fn);
}

function byTimeout(fn) {
  setTimeout(fn);
}

var nextTick = void 0;
if (typeof MutationObserver === 'function') {
  nextTick = byObserver;
} else if (typeof setImmediate === 'function') {
  nextTick = byImmediate;
} else {
  nextTick = byTimeout;
}

var nextTick$1 = function (fn) {
  // 移动端的输入法唤起时，貌似会影响 MutationObserver 的 nextTick 触发
  // 因此当输入框是激活状态时，改用 setTimeout
  if (doc) {
    var activeElement = doc.activeElement;

    if (activeElement && 'autofocus' in activeElement) {
      byTimeout(fn);
      return;
    }
  }
  nextTick(fn);
};

var nextTasks = [];

function add(name, task) {
  if (!nextTasks.length) {
    nextTick$1(run);
  }
  array$1[name](nextTasks, task);
}

/**
 * 在队尾添加异步任务
 *
 * @param {Function} task
 */
function append(task) {
  add('push', task);
}

/**
 * 在队首添加异步任务
 *
 * @param {Function} task
 */
function prepend(task) {
  add('unshift', task);
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

var toString = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHAR_BLANK;

  try {
    return str.toString();
  } catch (e) {
    return defaultValue;
  }
};

function Vnode(tag, text, data, children, key, component) {
  return {
    tag: tag,
    text: text,
    data: data,
    children: children,
    key: key,
    component: component
  };
}

var SEL_COMMENT = '!';

var HOOK_INIT = 'init';
var HOOK_CREATE = 'create';
var HOOK_INSERT = 'insert';

var HOOK_REMOVE = 'remove';
var HOOK_DESTROY = 'destroy';

var HOOK_PRE = 'pre';
var HOOK_POST = 'post';

var HOOK_PREPATCH = 'prepatch';
var HOOK_UPDATE = 'update';
var HOOK_POSTPATCH = 'postpatch';

var moduleHooks = [HOOK_CREATE, HOOK_UPDATE, HOOK_REMOVE, HOOK_DESTROY, HOOK_PRE, HOOK_POST];

var emptyNode = Vnode(CHAR_BLANK, UNDEFINED, {}, []);

function isPatchable(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag;
}

function createKeyToIndex(vnodes, startIndex, endIndex) {
  var result = {};
  for (var i = startIndex, key; i <= endIndex; i++) {
    key = vnodes[i].key;
    if (key != NULL) {
      result[key] = i;
    }
  }
  return result;
}

function createElementVnode(tag, data, children, key, component) {
  return Vnode(tag, UNDEFINED, data, children, key, component);
}

function createCommentVnode(text) {
  return Vnode(SEL_COMMENT, text);
}

function createTextVnode(text) {
  return Vnode(UNDEFINED, toString(text));
}

function init(modules, api) {

  var moduleEmitter = new Emitter();

  each(moduleHooks, function (hook) {
    each(modules, function (item) {
      moduleEmitter.on(hook, item[hook]);
    });
  });

  var createElement = function createElement(parentNode, vnode, insertedQueue) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;


    var hooks = data && data.hooks || {};
    execute(hooks[HOOK_INIT], NULL, vnode);

    if (falsy$1(tag)) {
      return vnode.el = api.createText(text);
    }

    if (tag === SEL_COMMENT) {
      return vnode.el = api.createComment(text);
    }

    var el = vnode.el = api.createElement(tag, parentNode);

    if (array(children)) {
      addVnodes(el, children, 0, children.length - 1, insertedQueue);
    } else if (string(text)) {
      api.append(el, api.createText(text));
    }

    if (data) {
      data = [emptyNode, vnode];
      moduleEmitter.fire(HOOK_CREATE, data, api);

      execute(hooks[HOOK_CREATE], NULL, data);

      if (hooks[HOOK_INSERT]) {
        insertedQueue.push(vnode);
      }
    }
    // 钩子函数可能会替换元素
    return vnode.el;
  };

  var addVnodes = function addVnodes(parentNode, vnodes, startIndex, endIndex, insertedQueue, before) {
    for (var i = startIndex; i <= endIndex; i++) {
      addVnode(parentNode, vnodes[i], insertedQueue, before);
    }
  };

  var addVnode = function addVnode(parentNode, vnode, insertedQueue, before) {
    var el = createElement(parentNode, vnode, insertedQueue);
    if (el) {
      api.before(parentNode, el, before);
    }
  };

  var removeVnodes = function removeVnodes(parentNode, vnodes, startIndex, endIndex) {
    for (var i = startIndex, vnode; i <= endIndex; i++) {
      vnode = vnodes[i];
      if (vnode) {
        removeVnode(parentNode, vnode);
      }
    }
  };

  var removeVnode = function removeVnode(parentNode, vnode) {
    var tag = vnode.tag,
        el = vnode.el,
        data = vnode.data;

    if (tag) {
      destroyVnode(vnode);
      api.remove(parentNode, el);

      if (data) {
        moduleEmitter.fire(HOOK_REMOVE, vnode, api);
        if (data.hooks) {
          execute(data.hooks[HOOK_REMOVE], NULL, vnode);
        }
      }
    } else if (el) {
      api.remove(parentNode, el);
    }
  };

  var destroyVnode = function destroyVnode(vnode) {
    var data = vnode.data,
        children = vnode.children;

    if (data) {

      // 先销毁 children
      if (children) {
        each(children, function (child) {
          destroyVnode(child);
        });
      }

      moduleEmitter.fire(HOOK_DESTROY, vnode, api);

      if (data.hooks) {
        execute(data.hooks[HOOK_DESTROY], NULL, vnode);
      }
    }
  };

  var replaceVnode = function replaceVnode(parentNode, oldVnode, vnode) {
    api.before(parentNode, vnode.el, oldVnode.el);
    removeVnode(parentNode, oldVnode);
  };

  var updateChildren = function updateChildren(parentNode, oldChildren, newChildren, insertedQueue) {

    var oldStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var oldStartVnode = oldChildren[oldStartIndex];
    var oldEndVnode = oldChildren[oldEndIndex];

    var newStartIndex = 0;
    var newEndIndex = newChildren.length - 1;
    var newStartVnode = newChildren[newStartIndex];
    var newEndVnode = newChildren[newEndIndex];

    var oldKeyToIndex = void 0,
        oldIndex = void 0,
        activeVnode = void 0;

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

      // 下面有设为 NULL 的逻辑
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex]; // Vnode has been moved left
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      }

      // 优先从头到尾比较，位置相同且值得 patch
      else if (isPatchable(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedQueue);
          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex];
        }

        // 再从尾到头比较，位置相同且值得 patch
        else if (isPatchable(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode, insertedQueue);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
          }

          // 比较完两侧的节点，剩下就是 位置发生改变的节点 和 全新的节点

          // 当 oldStartVnode 和 newEndVnode 值得 patch
          // 说明元素被移到右边了
          else if (isPatchable(oldStartVnode, newEndVnode)) {
              patchVnode(oldStartVnode, newEndVnode, insertedQueue);
              api.before(parentNode, oldStartVnode.el, api.next(oldEndVnode.el));
              oldStartVnode = oldChildren[++oldStartIndex];
              newEndVnode = newChildren[--newEndIndex];
            }

            // 当 oldEndVnode 和 newStartVnode 值得 patch
            // 说明元素被移到左边了
            else if (isPatchable(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode, insertedQueue);
                api.before(parentNode, oldEndVnode.el, oldStartVnode.el);
                oldEndVnode = oldChildren[--oldEndIndex];
                newStartVnode = newChildren[++newStartIndex];
              }

              // 尝试同级元素的 key
              else {

                  if (!oldKeyToIndex) {
                    oldKeyToIndex = createKeyToIndex(oldChildren, oldStartIndex, oldEndIndex);
                  }

                  oldIndex = oldKeyToIndex[newStartVnode.key];

                  // 移动元素
                  if (number(oldIndex)) {
                    activeVnode = oldChildren[oldIndex];
                    patchVnode(activeVnode, newStartVnode, insertedQueue);
                    oldChildren[oldIndex] = NULL;
                  }
                  // 新元素
                  else {
                      activeVnode = createElement(parentNode, newStartVnode, insertedQueue);
                      if (activeVnode) {
                        activeVnode = newStartVnode;
                      }
                    }

                  if (activeVnode) {
                    api.before(parentNode, activeVnode.el, oldStartVnode.el);
                  }

                  newStartVnode = newChildren[++newStartIndex];
                }
    }

    if (oldStartIndex > oldEndIndex) {
      activeVnode = newChildren[newEndIndex + 1];
      addVnodes(parentNode, newChildren, newStartIndex, newEndIndex, insertedQueue, activeVnode ? activeVnode.el : NULL);
    } else if (newStartIndex > newEndIndex) {
      removeVnodes(parentNode, oldChildren, oldStartIndex, oldEndIndex);
    }
  };

  var patchVnode = function patchVnode(oldVnode, vnode, insertedQueue) {

    if (oldVnode === vnode) {
      return;
    }

    var data = vnode.data;

    var hooks = data && data.hooks || {};

    var args = [oldVnode, vnode];
    execute(hooks[HOOK_PREPATCH], NULL, args);

    var el = oldVnode.el;

    vnode.el = el;

    if (!isPatchable(oldVnode, vnode)) {
      var parentNode = api.parent(el);
      if (createElement(parentNode, vnode, insertedQueue)) {
        parentNode && replaceVnode(parentNode, oldVnode, vnode);
      }
      return;
    }

    if (data) {
      moduleEmitter.fire(HOOK_UPDATE, args, api);
      execute(hooks[HOOK_UPDATE], NULL, args);
    }

    var newText = vnode.text;
    var newChildren = vnode.children;

    var oldText = oldVnode.text;
    var oldChildren = oldVnode.children;

    if (string(newText)) {
      if (newText !== oldText) {
        api.text(el, newText);
      }
    } else {
      // 两个都有需要 diff
      if (newChildren && oldChildren) {
        if (newChildren !== oldChildren) {
          updateChildren(el, oldChildren, newChildren, insertedQueue);
        }
      }
      // 有新的没旧的 - 新增节点
      else if (newChildren) {
          if (string(oldText)) {
            api.text(el, CHAR_BLANK);
          }
          addVnodes(el, newChildren, 0, newChildren.length - 1, insertedQueue);
        }
        // 有旧的没新的 - 删除节点
        else if (oldChildren) {
            removeVnodes(el, oldChildren, 0, oldChildren.length - 1);
          }
          // 有旧的 text 没有新的 text
          else if (string(oldText)) {
              api.text(el, CHAR_BLANK);
            }
    }

    execute(hooks[HOOK_POSTPATCH], NULL, args);
  };

  return function (oldVnode, vnode) {

    moduleEmitter.fire(HOOK_PRE, NULL, api);

    if (api.isElement(oldVnode)) {
      var el = oldVnode;
      oldVnode = Vnode(api.tag(el), UNDEFINED, {}, []);
      oldVnode.el = el;
    }

    var insertedQueue = [];
    if (isPatchable(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedQueue);
    } else {
      var parentNode = api.parent(oldVnode.el);
      if (createElement(parentNode, vnode, insertedQueue)) {
        parentNode && replaceVnode(parentNode, oldVnode, vnode);
      }
    }

    each(insertedQueue, function (vnode) {
      execute(vnode.data.hooks[HOOK_INSERT], NULL, vnode);
    });

    moduleEmitter.fire(HOOK_POST, NULL, api);

    return vnode;
  };
}

function updateAttrs(oldVnode, vnode) {

  var oldAttrs = oldVnode.data.attrs;
  var newAttrs = vnode.data.attrs;

  if (vnode.component || !oldAttrs && !newAttrs) {
    return;
  }

  oldAttrs = oldAttrs || {};
  newAttrs = newAttrs || {};

  var el = vnode.el;

  var api = this;

  each$1(newAttrs, function (value, name) {
    if (has$1(newAttrs, name)) {
      if (!has$1(oldAttrs, name) || value !== oldAttrs[name]) {
        api.setAttr(el, name, value);
      }
    }
  });

  each$1(oldAttrs, function (value, name) {
    if (!has$1(newAttrs, name)) {
      api.removeAttr(el, name);
    }
  });
}

var snabbdomAttrs = {
  create: updateAttrs,
  update: updateAttrs
};

function updateProps(oldVnode, vnode) {

  var oldProps = oldVnode.data.props;
  var newProps = vnode.data.props;

  if (vnode.component || !oldProps && !newProps) {
    return;
  }

  oldProps = oldProps || {};
  newProps = newProps || {};

  var el = vnode.el;

  var api = this;

  each$1(newProps, function (value, name) {
    if (value !== oldProps[name]) {
      api.setProp(el, name, value);
    }
  });

  each$1(oldProps, function (value, name) {
    if (!has$1(newProps, name)) {
      api.removeProp(el, name);
    }
  });
}

var snabbdomProps = {
  create: updateProps,
  update: updateProps
};

/**
 * 字面量
 *
 * @type {number}
 */
var LITERAL = 1;

/**
 * 标识符
 *
 * @type {number}
 */
var IDENTIFIER = 2;

/**
 * 对象属性或数组下标
 *
 * @type {number}
 */
var MEMBER = 3;

/**
 * 一元表达式，如 - a
 *
 * @type {number}
 */
var UNARY = 4;

/**
 * 二元表达式，如 a + b
 *
 * @type {number}
 */
var BINARY = 5;

/**
 * 三元表达式，如 a ? b : c
 *
 * @type {number}
 */
var TERNARY = 6;

/**
 * 数组表达式，如 [ 1, 2, 3 ]
 *
 * @type {number}
 */
var ARRAY = 7;

/**
 * 函数调用表达式，如 a()
 *
 * @type {number}
 */
var CALL = 8;

/**
 * 节点基类
 */

var Node = function (type, source) {
  classCallCheck(this, Node);

  this.type = type;
  this.source = trim(source);
};

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

var unaryMap = {};

unaryMap[PLUS] = unaryMap[MINUS] = unaryMap[NOT] = unaryMap[WAVE] = unaryMap[BOOLEAN] = TRUE;

var unaryList = sort(unaryMap, TRUE);

// 操作符和对应的优先级，数字越大优先级越高
var binaryMap = {};

binaryMap[OR] = 1;

binaryMap[AND] = 2;

binaryMap[LE] = binaryMap[LNE] = binaryMap[SE] = binaryMap[SNE] = 3;

binaryMap[LT] = binaryMap[LTE] = binaryMap[GT] = binaryMap[GTE] = 4;

binaryMap[PLUS] = binaryMap[MINUS] = 5;

binaryMap[MULTIPLY] = binaryMap[DIVIDE] = binaryMap[MODULO] = 6;

var binaryList = sort(binaryMap, TRUE);

/**
 * Unary 节点
 *
 * @param {string} operator
 * @param {Node} arg
 */

var Unary = function (_Node) {
  inherits(Unary, _Node);

  function Unary(source, operator, arg) {
    classCallCheck(this, Unary);

    var _this = possibleConstructorReturn(this, (Unary.__proto__ || Object.getPrototypeOf(Unary)).call(this, UNARY, source));

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

/**
 * Binary 节点
 *
 * @param {Node} left
 * @param {string} operator
 * @param {Node} right
 */

var Binary = function (_Node) {
  inherits(Binary, _Node);

  function Binary(source, left, operator, right) {
    classCallCheck(this, Binary);

    var _this = possibleConstructorReturn(this, (Binary.__proto__ || Object.getPrototypeOf(Binary)).call(this, BINARY, source));

    _this.left = left;
    _this.operator = operator;
    _this.right = right;
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
 * Member 节点
 *
 * @param {Node} object
 * @param {Node} prop
 */

var Member = function (_Node) {
  inherits(Member, _Node);

  function Member(source, object, prop) {
    classCallCheck(this, Member);

    var _this = possibleConstructorReturn(this, (Member.__proto__ || Object.getPrototypeOf(Member)).call(this, MEMBER, source));

    var props = [];
    if (object.type === MEMBER) {
      push(props, object.props);
    } else {
      push(props, object);
    }

    push(props, prop);

    _this.props = props;

    var success = TRUE;
    var keypath = Member.stringify(_this, function () {
      success = FALSE;
    });
    if (success) {
      _this.keypath = keypath;
    }

    return _this;
  }

  return Member;
}(Node);

Member.stringify = function (node, execute) {
  var keypaths = node.props.map(function (node, index) {
    var type = node.type;

    if (type !== LITERAL) {
      if (index > 0) {
        return execute(node);
      } else if (type === IDENTIFIER) {
        return node.name;
      }
    } else {
      return node.value;
    }
  });
  return stringify(keypaths);
};

var executor = {};

executor[LITERAL] = function (node) {
  return node.value;
};

executor[IDENTIFIER] = function (node, getter, context) {
  return getter(node.name);
};

executor[MEMBER] = function (node, getter, context) {
  var keypath = node.keypath;

  if (!keypath) {
    keypath = Member.stringify(node, function (node) {
      return execute$1(node, getter, context);
    });
  }
  return getter(keypath);
};

executor[UNARY] = function (node, getter, context) {
  return Unary[node.operator](execute$1(node.arg, getter, context));
};

executor[BINARY] = function (node, getter, context) {
  var left = node.left,
      right = node.right;

  return Binary[node.operator](execute$1(left, getter, context), execute$1(right, getter, context));
};

executor[TERNARY] = function (node, getter, context) {
  var test = node.test,
      consequent = node.consequent,
      alternate = node.alternate;

  return execute$1(test, getter, context) ? execute$1(consequent, getter, context) : execute$1(alternate, getter, context);
};

executor[ARRAY] = function (node, getter, context) {
  return node.elements.map(function (node) {
    return execute$1(node, getter, context);
  });
};

executor[CALL] = function (node, getter, context) {
  return execute(execute$1(node.callee, getter, context), context, node.args.map(function (node) {
    return execute$1(node, getter, context);
  }));
};

/**
 * 表达式求值
 *
 * @param {Node} node 表达式抽象节点
 * @param {Function} getter 读取数据的方法
 * @param {*} context 表达式函数调用的执行上下文
 * @return {*}
 */
function execute$1(node, getter, context) {
  return executor[node.type](node, getter, context);
}

function bindDirective(vnode, key) {
  var el = vnode.el,
      component = vnode.component;
  var _vnode$data = vnode.data,
      instance = _vnode$data.instance,
      attrs = _vnode$data.attrs,
      directives = _vnode$data.directives,
      destroies = _vnode$data.destroies;


  var node = directives[key];

  var args = {
    el: el,
    node: node,
    instance: instance,
    directives: directives,
    attrs: attrs || {}
  };

  var $component = el.$component;

  if (component && object($component)) {
    if (has$1($component, 'queue') && !has$1($component, 'set')) {
      $component = $component.queue;
    }
    args.component = $component;
  }

  var destroy = execute(instance.directive(node.name), instance, args);

  if (func(destroy)) {
    if (!destroies) {
      destroies = vnode.data.destroies = {};
    }
    destroies[key] = destroy;
  }
}

function unbindDirective(vnode, key) {
  var destroies = vnode.data.destroies;

  if (destroies && destroies[key]) {
    destroies[key]();
    delete destroies[key];
  }
}

function executeDirective(directive) {
  var expr = directive.expr,
      context = directive.context;

  if (expr) {
    return execute$1(expr, function (key) {
      return context.get(key).value;
    });
  }
}

function updateDirectives(oldVnode, vnode) {

  var oldDirectives = oldVnode.data.directives;
  var newDirectives = vnode.data.directives;

  if (!oldDirectives && !newDirectives) {
    return;
  }

  oldDirectives = oldDirectives || {};
  newDirectives = newDirectives || {};

  each$1(newDirectives, function (directive, key) {
    if (has$1(oldDirectives, key)) {
      var oldDirective = oldDirectives[key];
      if (oldDirective.value !== directive.value || oldDirective.keypath !== directive.keypath || oldDirective.context.get(THIS).value !== directive.context.get(THIS).value || executeDirective(oldDirective) !== executeDirective(directive)) {
        unbindDirective(oldVnode, key);
        bindDirective(vnode, key);
      }
    } else {
      bindDirective(vnode, key);
    }
  });

  each$1(oldDirectives, function (directive, key) {
    if (!has$1(newDirectives, key)) {
      unbindDirective(oldVnode, key);
    }
  });

  vnode.data.destroies = extend({}, oldVnode.data.destroies, vnode.data.destroies);
}

function destroyDirectives(vnode) {
  var destroies = vnode.data.destroies;

  if (destroies) {
    each$1(destroies, function (destroy) {
      destroy();
    });
  }
}

var snabbdomDirectives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: destroyDirectives
};

function createComponent(oldVnode, vnode) {
  var el = vnode.el,
      component = vnode.component;

  if (!component) {
    return;
  }

  var _vnode$data = vnode.data,
      instance = _vnode$data.instance,
      attrs = _vnode$data.attrs;

  el.$component = {
    queue: [],
    attrs: attrs
  };

  instance.component(vnode.tag, function (options) {
    var _el = el,
        $component = _el.$component;

    if ($component && array($component.queue)) {

      component = instance.create(options, {
        el: el,
        props: $component.attrs,
        replace: TRUE
      });

      el = vnode.el = component.$el;
      el.$component = component;

      each($component.queue, function (callback) {
        callback(component);
      });
    }
  });
}

function updateComponent(oldVnode, vnode) {
  var $component = vnode.el.$component;

  if (vnode.component && object($component)) {
    var attrs = vnode.data.attrs;

    if ($component.set) {
      $component.set(attrs, TRUE);
    } else {
      $component.attrs = attrs;
    }
  }
}

function destroyComponent(oldVnode, vnode) {
  var component = oldVnode.component,
      el = oldVnode.el;
  var $component = el.$component;

  if (component && object($component)) {
    if ($component.destroy) {
      $component.destroy(TRUE);
    }
    el.$component = NULL;
  }
}

var snabbdomComponent = {
  create: createComponent,
  update: updateComponent,
  destroy: destroyComponent
};

/**
 * Array 节点
 *
 * @param {Array.<Node>} elements
 */

var Array$1 = function (_Node) {
  inherits(Array, _Node);

  function Array(source, elements) {
    classCallCheck(this, Array);

    var _this = possibleConstructorReturn(this, (Array.__proto__ || Object.getPrototypeOf(Array)).call(this, ARRAY, source));

    _this.elements = elements;
    return _this;
  }

  return Array;
}(Node);

/**
 * Call 节点
 *
 * @param {Node} callee
 * @param {Array.<Node>} args
 */

var Call = function (_Node) {
  inherits(Call, _Node);

  function Call(source, callee, args) {
    classCallCheck(this, Call);

    var _this = possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this, CALL, source));

    _this.callee = callee;
    _this.args = args;
    return _this;
  }

  return Call;
}(Node);

/**
 * Ternary 节点
 *
 * @param {Node} test
 * @param {Node} consequent
 * @param {Node} alternate
 */

var Ternary = function (_Node) {
  inherits(Ternary, _Node);

  function Ternary(source, test, consequent, alternate) {
    classCallCheck(this, Ternary);

    var _this = possibleConstructorReturn(this, (Ternary.__proto__ || Object.getPrototypeOf(Ternary)).call(this, TERNARY, source));

    _this.test = test;
    _this.consequent = consequent;
    _this.alternate = alternate;
    return _this;
  }

  return Ternary;
}(Node);

/**
 * Identifier 节点
 *
 * @param {string} name
 */

var Identifier = function (_Node) {
  inherits(Identifier, _Node);

  function Identifier(source, name) {
    classCallCheck(this, Identifier);

    var _this = possibleConstructorReturn(this, (Identifier.__proto__ || Object.getPrototypeOf(Identifier)).call(this, IDENTIFIER, source));

    _this.name = name;
    _this.keypath = name;
    return _this;
  }

  return Identifier;
}(Node);

/**
 * Literal 节点
 *
 * @param {*} value
 */

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(source, value) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this, LITERAL, source));

    _this.value = value;
    return _this;
  }

  return Literal;
}(Node);

// 区分关键字和普通变量
// 举个例子：a === true
// 从解析器的角度来说，a 和 true 是一样的 token
var keywords = {};
// 兼容 IE8
keywords['true'] = TRUE;
keywords['false'] = FALSE;
keywords['null'] = NULL;
keywords['undefined'] = UNDEFINED;

// 缓存编译结果
var compileCache$1 = {};

/**
 * 是否是数字
 *
 * @param {number} charCode
 * @return {boolean}
 */
function isDigit(charCode) {
  return charCode >= 48 && charCode <= 57; // 0...9
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
  return isIdentifierStart(charCode) || isDigit(charCode);
}

/**
 * 把表达式编译成抽象语法树
 *
 * @param {string} content 表达式字符串
 * @return {Object}
 */
function compile$1(content) {

  if (compileCache$1[content]) {
    return compileCache$1[content];
  }

  var length = content.length;

  var index = 0,
      charCode = void 0;

  var throwError = function throwError() {
    fatal('Failed to compile expression: ' + CHAR_BREAKLINE + content);
  };

  var getCharCode = function getCharCode() {
    return codeAt(content, index);
  };

  var cutString = function cutString(start) {
    return content.substring(start, index);
  };

  var skipWhitespace = function skipWhitespace() {
    while ((charCode = getCharCode()) && (charCode === CODE_WHITESPACE || charCode === CODE_TAB)) {
      index++;
    }
  };

  var skipNumber = function skipNumber() {
    if (getCharCode() === CODE_DOT) {
      skipDecimal();
    } else {
      skipDigit();
      if (getCharCode() === CODE_DOT) {
        skipDecimal();
      }
    }
  };

  var skipDigit = function skipDigit() {
    do {
      index++;
    } while (isDigit(getCharCode()));
  };

  var skipDecimal = function skipDecimal() {
    // 跳过点号
    index++;
    // 后面必须紧跟数字
    if (isDigit(getCharCode())) {
      skipDigit();
    } else {
      throwError();
    }
  };

  var skipString = function skipString() {

    var quote = getCharCode();

    // 跳过引号
    index++;
    while (index < length) {
      index++;
      if (codeAt(content, index - 1) === quote) {
        return;
      }
    }

    throwError();
  };

  var skipIdentifier = function skipIdentifier() {
    // 第一个字符一定是经过 isIdentifierStart 判断的
    // 因此循环至少要执行一次
    do {
      index++;
    } while (isIdentifierPart(getCharCode()));
  };

  var parseIdentifier = function parseIdentifier(careKeyword) {

    var start = index;
    skipIdentifier();

    var literal = cutString(start);
    if (literal) {
      return careKeyword && has$1(keywords, literal) ? new Literal(literal, keywords[literal])
      // this 也视为 IDENTIFIER
      : new Identifier(literal, literal);
    }

    throwError();
  };

  var parseTuple = function parseTuple(delimiter) {

    var list = [];

    // 跳过开始字符，如 [、(
    index++;

    while (index < length) {
      charCode = getCharCode();
      if (charCode === delimiter) {
        index++;
        return list;
      } else if (charCode === CODE_COMMA) {
        index++;
      } else {
        push(list, parseExpression());
      }
    }

    throwError();
  };

  var parseOperator = function parseOperator(sortedOperatorList) {
    skipWhitespace();

    var value = slice(content, index),
        match = void 0;
    each(sortedOperatorList, function (prefix) {
      if (startsWith(value, prefix)) {
        match = prefix;
        return FALSE;
      }
    });

    if (match) {
      index += match.length;
      return match;
    }
  };

  var parseVariable = function parseVariable() {

    var start = index,
        node = parseIdentifier(TRUE),
        temp = void 0;

    while (index < length) {
      // a(x)
      charCode = getCharCode();
      if (charCode === CODE_OPAREN) {
        temp = parseTuple(CODE_CPAREN);
        return new Call(cutString(start), node, temp);
      }
      // a.x
      else if (charCode === CODE_DOT) {
          index++;
          temp = parseIdentifier();
          node = new Member(cutString(start), node, new Literal(temp.source, temp.name));
        }
        // a[x]
        else if (charCode === CODE_OBRACK) {
            temp = parseExpression(CODE_CBRACK);
            node = new Member(cutString(start), node, temp);
          } else {
            break;
          }
    }

    return node;
  };

  var parseToken = function parseToken() {

    skipWhitespace();

    charCode = getCharCode();

    var start = index,
        temp = void 0;

    // 'xx' 或 "xx"
    if (charCode === CODE_SQUOTE || charCode === CODE_DQUOTE) {
      // 截出的字符串包含引号
      skipString();
      temp = cutString(start);
      return new Literal(temp, slice(temp, 1, -1));
    }
    // 1.1 或 .1
    else if (isDigit(charCode) || charCode === CODE_DOT) {
        skipNumber();
        temp = cutString(start);
        return new Literal(temp, parseFloat(temp));
      }
      // [xx, xx]
      else if (charCode === CODE_OBRACK) {
          temp = parseTuple(CODE_CBRACK);
          return new Array$1(cutString(start), temp);
        }
        // (xx)
        else if (charCode === CODE_OPAREN) {
            return parseExpression(CODE_CPAREN);
          }
          // 变量
          else if (isIdentifierStart(charCode)) {
              return parseVariable();
            }
    // 一元操作
    var action = parseOperator(unaryList);
    if (action) {
      temp = parseToken();
      return new Unary(cutString(start), action, temp);
    }
    throwError();
  };

  var parseBinary = function parseBinary() {

    var stack = [index, parseToken()],
        right = void 0,
        next = void 0;

    var createBinaryNode = function createBinaryNode() {
      pop(stack);
      pop(stack);
      var action = pop(stack);
      var left = pop(stack);
      return new Binary(cutString(last(stack)), left, action, right);
    };

    while (next = parseOperator(binaryList)) {

      // 处理左边
      if (stack.length > 5 && binaryMap[next] < stack[stack.length - 3]) {
        right = pop(stack);
        push(stack, createBinaryNode());
      }

      push(stack, next);
      push(stack, binaryMap[next]);
      push(stack, index);
      push(stack, parseToken());
    }

    // 处理右边
    // 右边只有等到所有 token 解析完成才能开始
    // 比如 a + b * c / d
    // 此时右边的优先级 >= 左边的优先级，因此可以脑残的直接逆序遍历

    right = pop(stack);
    while (stack.length > 4) {
      right = createBinaryNode();
    }

    return right;
  };

  var parseExpression = function parseExpression(delimiter) {

    // 主要是区分三元和二元表达式
    // 三元表达式可以认为是 3 个二元表达式组成的
    // test ? consequent : alternate

    // 跳过开始字符
    if (delimiter) {
      index++;
    }

    // 保证调用 parseExpression() 之后无需再次调用 skipWhitespace()
    var start = index,
        test = parseBinary();
    skipWhitespace();

    if (getCharCode() === CODE_QUMARK) {
      index++;

      var consequent = parseBinary();
      skipWhitespace();

      if (getCharCode() === CODE_COLON) {
        index++;

        var alternate = parseBinary();
        skipWhitespace();

        return new Ternary(cutString(start), test, consequent, alternate);
      } else {
        throwError();
      }
    }

    if (delimiter) {
      if (getCharCode() === delimiter) {
        index++;
      } else {
        throwError();
      }
    }

    return test;
  };

  return compileCache$1[content] = parseExpression();
}

var IF = '#if';
var ELSE = 'else';
var ELSE_IF = 'else if';
var EACH = '#each';
var PARTIAL = '#partial';
var IMPORT = '>';
var COMMENT = '! ';
var SPREAD = '...';

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';

var DIRECTIVE_CUSTOM_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var DIRECTIVE_REF = 'ref';
var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';
var DIRECTIVE_EVENT = 'event';

var KEYWORD_UNIQUE = 'key';

/**
 * 元素 节点
 *
 * @type {number}
 */
var ELEMENT = 1;

/**
 * 属性 节点
 *
 * @type {number}
 */
var ATTRIBUTE = 2;

/**
 * 文本 节点
 *
 * @type {number}
 */
var TEXT = 3;

/**
 * 指令 节点
 *
 * @type {number}
 */
var DIRECTIVE = 4;

/**
 * if 节点
 *
 * @type {number}
 */
var IF$1 = 5;

/**
 * else if 节点
 *
 * @type {number}
 */
var ELSE_IF$1 = 6;

/**
 * else 节点
 *
 * @type {number}
 */
var ELSE$1 = 7;

/**
 * each 节点
 *
 * @type {number}
 */
var EACH$1 = 8;

/**
 * partial 节点
 *
 * @type {number}
 */
var PARTIAL$1 = 9;

/**
 * import 节点
 *
 * @type {number}
 */
var IMPORT$1 = 10;

/**
 * 表达式 节点
 *
 * @type {number}
 */
var EXPRESSION = 11;

/**
 * 延展操作 节点
 *
 * @type {number}
 */
var SPREAD$1 = 12;

// if 带条件的
var ifTypes = {};
// if 分支的
var elseTypes = {};
// html 层级的节点类型
var htmlTypes = {};
// 叶子节点类型
var leafTypes = {};
// 内置指令，无需加前缀
var builtInDirectives = {};
// 名称 -> 类型的映射
var name2Type = {};
// 类型 -> 名称的映射
var type2Name = {};

ifTypes[IF$1] = ifTypes[ELSE_IF$1] = elseTypes[ELSE_IF$1] = elseTypes[ELSE$1] = htmlTypes[ELEMENT] = htmlTypes[ATTRIBUTE] = htmlTypes[DIRECTIVE] = leafTypes[TEXT] = leafTypes[IMPORT$1] = leafTypes[SPREAD$1] = leafTypes[EXPRESSION] = builtInDirectives[DIRECTIVE_REF] = builtInDirectives[DIRECTIVE_LAZY] = builtInDirectives[DIRECTIVE_MODEL] = TRUE;

name2Type['if'] = IF$1;
name2Type['each'] = EACH$1;
name2Type['partial'] = PARTIAL$1;

each$1(name2Type, function (type, name) {
  type2Name[type] = name;
});

/**
 * 节点基类
 */

var Node$2 = function () {
  function Node(type) {
    classCallCheck(this, Node);

    this.type = type;
  }

  createClass(Node, [{
    key: 'addChild',
    value: function addChild(child) {
      push(this.children || (this.children = []), child);
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
 * on-click="submit"  name 是 event, modifier 是 click
 *
 * @param {string} name 指令名
 * @param {?string} modifier 指令修饰符
 */

var Directive = function (_Node) {
  inherits(Directive, _Node);

  function Directive(name, modifier) {
    classCallCheck(this, Directive);

    var _this = possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this, DIRECTIVE));

    _this.name = name;
    if (modifier) {
      _this.modifier = modifier;
    }
    return _this;
  }

  return Directive;
}(Node$2);

/**
 * each 节点
 *
 * @param {Expression} expr
 * @param {?string} index 遍历索引值，对于数组来说是 0,1,2,...，对于对象来说是 key
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
      push(this.attrs || (this.attrs = []), child);
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

  function ElseIf(expr, then) {
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

  function If(expr, then) {
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

  function Text(text) {
    classCallCheck(this, Text);

    var _this = possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, TEXT));

    _this.text = text;
    return _this;
  }

  return Text;
}(Node$2);

var delimiterPattern = /(\{?\{\{)\s*([^\}]+?)\s*(\}\}\}?)/;
var openingTagPattern = /<(\/)?([a-z][-a-z0-9]*)/i;
var closingTagPattern = /^\s*(\/)?>/;
var attributePattern = /^\s*([-:\w]+)(?:=(['"]))?/;
var componentNamePattern = /[-A-Z]/;
var selfClosingTagNamePattern = /source|param|input|img|br|hr/;

// 缓存编译结果
var compileCache = {};

/**
 * 截取前缀之后的字符串
 *
 * @param {string} str
 * @param {string} prefix
 * @return {string}
 */
function slicePrefix(str, prefix) {
  return trim(slice(str, prefix.length));
}

/**
 * 是否是纯粹的换行
 *
 * @param {string} content
 * @return {boolean}
 */
function isBreakline(content) {
  return has$2(content, CHAR_BREAKLINE) && !trim(content);
}

/**
 * trim 文本开始和结束位置的换行符
 *
 * @param {string} content
 * @return {string}
 */
function trimBreakline(content) {
  return content.replace(/^[ \t]*\n|\n[ \t]*$/g, CHAR_BLANK);
}

/**
 * 把模板编译为抽象语法树
 *
 * @param {string} content
 * @return {Array}
 */
function compile(content) {

  var nodeList = compileCache[content];
  if (nodeList) {
    return nodeList;
  }
  nodeList = [];

  var nodeStack = [],
      ifStack = [],
      htmlStack = [],
      currentQuote = void 0;

  var throwError = function throwError(msg) {
    fatal('Error compiling template:' + CHAR_BREAKLINE + content + CHAR_BREAKLINE + '- ' + msg);
  };

  var popStack = function popStack(type, expectedName) {

    var target = void 0;

    each(nodeStack, function (node, i) {
      if (node.type === type) {
        target = nodeStack.splice(i, 1)[0];
        return FALSE;
      }
    }, TRUE);

    if (target) {
      var _target = target,
          name = _target.name,
          divider = _target.divider,
          children = _target.children;

      if (type === ELEMENT && expectedName && name !== expectedName) {
        throwError('end tag expected </' + name + '> to be </' + expectedName + '>.');
      }

      // ==========================================
      // 以下是性能优化的逻辑
      // ==========================================

      // 如果 children 没实际的数据，删掉它
      // 避免在渲染阶段增加计算量
      if (children && !children.length) {
        delete target.children;
      }
      if (!target.children) {
        if (has$1(target, 'divider')) {
          delete target.divider;
        }
        return;
      }

      var onlyChild = children.length === 1 && children[0];

      if (type === ELEMENT) {
        // 只有一个子元素
        // 并且这个子元素是非转义插值
        // 转成 props
        if (children.length - divider === 1) {
          onlyChild = last(children);
          if (onlyChild.type === EXPRESSION && onlyChild.safe === FALSE) {
            target.props = {
              innerHTML: onlyChild.expr
            };
            if (divider) {
              children.length = divider;
            } else {
              delete target.children;
            }
          }
        }
      }
      // <div key="xx">
      // 把 key 从属性中提出来，减少渲染时的遍历
      else if (type === ATTRIBUTE && name === KEYWORD_UNIQUE) {
          var element = last(htmlStack);
          remove(element.children, target);
          if (!element.children.length) {
            delete element.children;
          }
          element.key = onlyChild && onlyChild.type === TEXT ? onlyChild.text : children;
        } else if (onlyChild) {
          if (onlyChild.type === TEXT) {
            // 指令的值如果是纯文本，可以预编译表达式，提升性能
            if (type === DIRECTIVE) {
              var expr = compile$1(onlyChild.text);
              target.expr = expr;
              target.value = onlyChild.text;
              delete target.children;
            }
            // 属性的值如果是纯文本，直接获取文本值
            // 减少渲染时的遍历
            else if (type === ATTRIBUTE) {
                target.value = onlyChild.text;
                delete target.children;
              }
          }
          // <div class="{{className}}">
          // 把 Attribute 转成 单向绑定 指令，可实现精确更新视图
          else if (type === ATTRIBUTE && onlyChild.type === EXPRESSION && onlyChild.safe) {
              var _onlyChild = onlyChild,
                  _expr = _onlyChild.expr;

              if (string(_expr.keypath)) {
                target.expr = _expr;
                target.binding = _expr.keypath;
                delete target.children;
              }
            }
        }
    } else {
      throwError('{{/' + type2Name[type] + '}} is not a pair.');
    }
  };

  var addChild = function addChild(node) {
    var type = node.type,
        text = node.text;


    if (type === TEXT) {
      if (isBreakline(text) || !(text = trimBreakline(text))) {
        return;
      }
      node.text = text;
    }

    if (elseTypes[type]) {
      popStack(pop(ifStack).type);
    }

    var currentNode = last(nodeStack);
    if (currentNode) {
      currentNode.addChild(node);
    } else {
      push(nodeList, node);
    }

    if (ifTypes[type] || elseTypes[type]) {
      push(ifStack, node);
    } else if (htmlTypes[type]) {
      push(htmlStack, node);
    }

    if (!leafTypes[type]) {
      push(nodeStack, node);
    }
  };

  var htmlParsers = [function (content) {
    if (!htmlStack.length) {
      var _match = content.match(openingTagPattern);
      // 必须以 <tag 开头才能继续
      if (_match && !_match.index) {
        var tagName = _match[2];
        if (_match[1] === CHAR_SLASH) {
          popStack(ELEMENT, tagName);
        } else {
          addChild(new Element(tagName, componentNamePattern.test(tagName)));
        }
        return _match[0];
      }
    }
  }, function (content) {
    var match = content.match(closingTagPattern);
    if (match) {
      if (htmlStack.length === 1) {
        var element = last(htmlStack);
        element.divider = element.children ? element.children.length : 0;
        if (match[1] === CHAR_SLASH || selfClosingTagNamePattern.test(htmlStack[0].name)) {
          popStack(ELEMENT);
        }
        pop(htmlStack);
      }
      return match[0];
    }
  }, function (content) {
    if (htmlStack.length === 1) {
      var _match2 = content.match(attributePattern);
      if (_match2) {
        var name = _match2[1];
        if (builtInDirectives[name]) {
          addChild(new Directive(camelCase(name)));
        } else if (startsWith(name, DIRECTIVE_EVENT_PREFIX)) {
          name = slice(name, DIRECTIVE_EVENT_PREFIX.length);
          addChild(new Directive(DIRECTIVE_EVENT, camelCase(name)));
        } else if (startsWith(name, DIRECTIVE_CUSTOM_PREFIX)) {
          name = slice(name, DIRECTIVE_CUSTOM_PREFIX.length);
          addChild(new Directive(camelCase(name)));
        } else {
          addChild(new Attribute(htmlStack[0].component ? camelCase(name) : name));
        }
        currentQuote = _match2[2];
        if (!currentQuote) {
          popStack(pop(htmlStack).type);
        }
        return _match2[0];
      }
    }
  }, function (content) {
    if (htmlStack.length === 2) {
      var index = 0,
          currentChar = void 0,
          closed = void 0;
      while (currentChar = charAt(content, index)) {
        if (currentChar === currentQuote) {
          closed = TRUE;
          break;
        }
        index++;
      }
      var text = CHAR_BLANK;
      if (index) {
        text = slice(content, 0, index);
        addChild(new Text(text));
      }
      if (closed) {
        text += currentQuote;
        closed = pop(htmlStack);
        if (!closed.children) {
          closed.value = CHAR_BLANK;
        }
        popStack(closed.type);
      }
      return text;
    } else {
      var _match3 = content.match(openingTagPattern);
      if (_match3 && _match3.index) {
        content = slice(content, 0, _match3.index);
      }
      // 属性级别的空字符串是没有意义的
      // 比如 <div      class="xx">
      if (htmlStack.length !== 1 || trim(content)) {
        addChild(new Text(content));
      }
      return content;
    }
  }];

  var delimiterParsers = [function (source, all) {
    if (startsWith(source, EACH)) {
      var terms = split(slicePrefix(source, EACH), CHAR_COLON);
      if (terms[0]) {
        return new Each(compile$1(trim(terms[0])), trim(terms[1]));
      }
      throwError('invalid each: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, IMPORT)) {
      source = slicePrefix(source, IMPORT);
      return source ? new Import(source) : throwError('invalid import: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, PARTIAL)) {
      source = slicePrefix(source, PARTIAL);
      return source ? new Partial(source) : throwError('invalid partial: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, IF)) {
      source = slicePrefix(source, IF);
      return source ? new If(compile$1(source)) : throwError('invalid if: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, ELSE_IF)) {
      source = slicePrefix(source, ELSE_IF);
      return source ? new ElseIf(compile$1(source)) : throwError('invalid else if: ' + all);
    }
  }, function (source) {
    if (startsWith(source, ELSE)) {
      return new Else();
    }
  }, function (source, all) {
    if (startsWith(source, SPREAD)) {
      source = slicePrefix(source, SPREAD);
      return source ? new Spread(compile$1(source)) : throwError('invalid spread: ' + all);
    }
  }, function (source, all) {
    if (!startsWith(source, COMMENT)) {
      source = trim(source);
      return source ? new Expression(compile$1(source), !endsWith(all, '}}}')) : throwError('invalid expression: ' + all);
    }
  }];

  var parseHtml = function parseHtml(content) {
    if (content) {
      (function () {
        var tpl = content;
        while (tpl) {
          each(htmlParsers, function (parse, match) {
            match = parse(tpl);
            if (match) {
              tpl = slice(tpl, match.length);
              return FALSE;
            }
          });
        }
        str = slice(str, content.length);
      })();
    }
  };

  var parseDelimiter = function parseDelimiter(content, all) {
    if (content) {
      if (charAt(content) === CHAR_SLASH) {
        var name = slice(content, 1),
            type = name2Type[name];
        if (ifTypes[type]) {
          type = pop(ifStack).type;
        }
        popStack(type);
      } else {
        each(delimiterParsers, function (parse, node) {
          node = parse(content, all);
          if (node) {
            addChild(node);
            return FALSE;
          }
        });
      }
    }
    str = slice(str, all.length);
  };

  var str = content,
      match = void 0;
  while (str) {
    match = str.match(delimiterPattern);
    if (match) {
      parseHtml(slice(str, 0, match.index));
      // 避免手误写成 {{{ name }}
      if (match[1].length === match[3].length) {
        parseDelimiter(match[2], match[0]);
      } else {
        throwError('invalid syntax: ' + match[0]);
      }
    } else {
      parseHtml(str);
    }
  }

  return compileCache[content] = nodeList;
}

var Context = function () {

  /**
   * @param {Object} data
   * @param {string} keypath
   * @param {?Context} parent
   */
  function Context(data, keypath, parent) {
    classCallCheck(this, Context);

    this.data = {};
    this.data[THIS] = data;
    this.keypath = keypath;
    this.parent = parent;
    this.cache = {};
  }

  createClass(Context, [{
    key: 'push',
    value: function push$$1(data, keypath) {
      return new Context(data, keypath, this);
    }
  }, {
    key: 'pop',
    value: function pop$$1() {
      return this.parent;
    }
  }, {
    key: 'set',
    value: function set$$1(key, value) {
      var data = this.data,
          cache = this.cache;

      var _formatKeypath = formatKeypath(key),
          keypath = _formatKeypath.keypath;

      if (has$1(cache, keypath)) {
        delete cache[keypath];
      }
      data[keypath || THIS] = value;
    }
  }, {
    key: 'get',
    value: function get$$1(key) {

      var instance = this;
      var _instance = instance,
          data = _instance.data,
          cache = _instance.cache;

      var _formatKeypath2 = formatKeypath(key),
          keypath = _formatKeypath2.keypath,
          lookup = _formatKeypath2.lookup;

      var joinKeypath = function joinKeypath(context, keypath) {
        return join(context.keypath, keypath);
      };
      var getValue = function getValue(data, keypath) {
        return exists(data, keypath) ? { value: data[keypath] } : get$1(data[THIS], keypath);
      };

      if (!has$1(cache, keypath)) {

        if (keypath) {
          var result = void 0;

          if (lookup) {
            while (instance) {
              result = getValue(instance.data, keypath);
              if (result) {
                break;
              } else {
                instance = instance.parent;
              }
            }
          } else {
            result = getValue(data, keypath);
          }

          if (result) {
            cache[keypath] = {
              keypath: joinKeypath(instance, keypath),
              value: result.value
            };
          }
        } else {
          cache[keypath] = {
            keypath: instance.keypath,
            value: data[THIS]
          };
        }
      }
      cache = cache[keypath];
      if (cache) {
        return cache;
      }

      if (keypath === SPECIAL_EVENT || keypath === SPECIAL_KEYPATH) {
        return {
          keypath: keypath
        };
      }

      keypath = joinKeypath(this, keypath);

      return {
        keypath: keypath
      };
    }
  }]);
  return Context;
}();

function formatKeypath(keypath) {
  keypath = normalize(keypath);
  var lookup = TRUE,
      items = startsWith$1(keypath, THIS, TRUE);
  if (items) {
    keypath = items[1];
    lookup = FALSE;
  }
  return { keypath: keypath, lookup: lookup };
}

/**
 * 渲染抽象语法树
 *
 * @param {Object} ast 编译出来的抽象语法树
 * @param {Object} data 渲染模板的数据
 * @param {Yox} instance 组件实例
 * @return {Array}
 */
function render(ast, data, instance) {

  var keypath = void 0,
      keypathList = [],
      updateKeypath = function updateKeypath() {
    keypath = stringify(keypathList);
  },
      getKeypath = function getKeypath() {
    return keypath;
  };

  updateKeypath();

  getKeypath.toString = data[SPECIAL_KEYPATH] = getKeypath;

  var context = new Context(data, keypath),
      nodeStack = [],
      htmlStack = [],
      partials = {},
      deps = {};
  var sibling = void 0,
      cache = void 0,
      prevCache = void 0,
      currentCache = void 0;

  var isDefined = function isDefined(value) {
    return value !== UNDEFINED;
  };

  var addChild = function addChild(parent, child) {

    if (parent && isDefined(child)) {

      if (attributeRendering) {
        if (has$1(parent, 'value')) {
          parent.value += child;
        } else {
          parent.value = child;
        }
      } else {
        // 文本节点需要拼接
        // <div>123{{name}}456</div>
        // <div>123{{user}}456</div>

        var children = parent.children || (parent.children = []);
        var prevChild = last(children),
            prop = 'text';

        if (primitive(child) || !has$1(child, prop)) {
          if (object(prevChild) && string(prevChild[prop])) {
            prevChild[prop] += child;
            return;
          } else {
            child = createTextVnode(child);
          }
        }

        children.push(child);
      }
    }
  };

  var addAttr = function addAttr(parent, key, value) {
    var attrs = parent.attrs || (parent.attrs = {});
    attrs[key] = value;
  };

  var addDirective = function addDirective(parent, name, modifier, value, expr) {
    var directives = parent.directives || (parent.directives = {});
    directives[join(name, modifier)] = {
      name: name,
      modifier: modifier,
      context: context,
      keypath: keypath,
      value: value,
      expr: expr
    };
  };

  var getValue = function getValue(source, output) {
    var value = void 0;
    if (has$1(output, 'value')) {
      value = output.value;
    } else if (has$1(source, 'value')) {
      value = source.value;
    } else if (source.expr) {
      value = executeExpr(source.expr, source.binding || source.type === DIRECTIVE);
    }
    if (!isDefined(value) && (source.expr || source.children)) {
      value = CHAR_BLANK;
    }
    return value;
  };

  var attributeRendering = void 0;
  var pushStack = function pushStack(source) {
    var type = source.type,
        divider = source.divider,
        children = source.children;


    var parent = last(nodeStack),
        output = { type: type, source: source, parent: parent };

    if (execute(enter[type], NULL, [source, output]) === FALSE) {
      return;
    }

    push(nodeStack, output);

    if (htmlTypes[type]) {
      push(htmlStack, output);
    }

    if (children) {
      each(children, function (node, index) {
        if (index < divider) {
          attributeRendering = TRUE;
        } else if (attributeRendering && index >= divider) {
          attributeRendering = NULL;
        }
        if (!filterNode || filterNode(node)) {
          sibling = children[index + 1];
          pushStack(node);
        }
      });
      if (attributeRendering) {
        attributeRendering = NULL;
      }
    }

    execute(leave[type], NULL, [source, output]);

    if (htmlTypes[source.type]) {
      pop(htmlStack);
    }

    pop(nodeStack);

    return output;
  };

  var filterNode = void 0;
  var filterElse = function filterElse(node) {
    if (elseTypes[node.type]) {
      return FALSE;
    } else {
      filterNode = NULL;
      return TRUE;
    }
  };

  // 缓存节点只处理一层，不支持下面这种多层缓存
  // <div key="{{xx}}">
  //     <div key="{{yy}}"></div>
  // </div>
  var cacheDeps = void 0;

  var executeExpr = function executeExpr(expr, filter) {
    return execute$1(expr, function (key) {
      var _context$get = context.get(key),
          keypath = _context$get.keypath,
          value = _context$get.value;

      if (!filter && !numeric(keypath) && !func(value) && key !== SPECIAL_EVENT && key !== SPECIAL_KEYPATH) {
        deps[keypath] = value;
        if (cacheDeps) {
          cacheDeps[key] = value;
        }
        // 响应数组长度的变化是个很普遍的需求
        if (array(value)) {
          deps[join(keypath, 'length')] = value.length;
          if (cacheDeps) {
            cacheDeps[join(key, 'length')] = value.length;
          }
        }
      }
      return value;
    }, instance);
  };

  var enter = {},
      leave = {};

  enter[PARTIAL$1] = function (source) {
    partials[source.name] = source.children;
    return FALSE;
  };

  enter[IMPORT$1] = function (source) {
    var name = source.name;

    var partial = partials[name] || instance.importPartial(name);
    if (partial) {
      if (array(partial)) {
        pushStack({
          children: partial
        });
      } else {
        pushStack(partial);
      }
      return FALSE;
    }
    fatal('Partial "' + name + '" is not found.');
  };

  // 条件判断失败就没必要往下走了
  // 但如果失败的点原本是一个 DOM 元素
  // 就需要用注释节点来占位，否则 virtual dom 无法正常工作
  enter[IF$1] = enter[ELSE_IF$1] = function (source) {
    if (!executeExpr(source.expr)) {
      if (sibling && !elseTypes[sibling.type] && !attributeRendering) {
        addChild(last(htmlStack), createCommentVnode());
      }
      return FALSE;
    }
  };

  leave[IF$1] = leave[ELSE_IF$1] = leave[ELSE$1] = function (source, output) {
    filterNode = filterElse;
    var children = output.children;

    if (children) {
      var htmlNode = last(htmlStack);
      each(children, function (child) {
        addChild(htmlNode, child);
      });
    }
  };

  enter[EACH$1] = function (source) {
    var expr = source.expr,
        index = source.index,
        children = source.children;

    var value = executeExpr(expr),
        each$$1 = void 0;

    if (array(value)) {
      each$$1 = each;
    } else if (object(value)) {
      each$$1 = each$1;
    }

    if (each$$1) {

      var eachKeypath = expr.keypath;
      if (isDefined(eachKeypath)) {
        push(keypathList, eachKeypath);
        updateKeypath();
      }
      context = context.push(value, keypath);

      each$$1(value, function (value, i) {

        push(keypathList, i);
        updateKeypath();

        context = context.push(value, keypath);
        if (index) {
          context.set(index, i);
        }

        pushStack({
          children: children
        });

        context = context.pop();
        pop(keypathList);
        updateKeypath();
      });

      context = context.pop();
      if (isDefined(eachKeypath)) {
        pop(keypathList);
        updateKeypath();
      }
    }

    return FALSE;
  };

  enter[ELEMENT] = function (source, output) {
    var _source = source,
        key = _source.key;

    if (key) {
      var trackBy = void 0;
      if (string(key)) {
        trackBy = key;
      } else if (array(key)) {
        attributeRendering = TRUE;
        source = {
          type: ATTRIBUTE,
          children: key
        };
        trackBy = getValue(source, pushStack(source));
        attributeRendering = NULL;
      }
      if (isDefined(trackBy)) {

        if (!currentCache) {
          prevCache = ast.cache || {};
          currentCache = ast.cache = {};
        }

        var _cache = prevCache[trackBy];

        if (_cache) {
          var isSame = _cache.keypath === keypath;
          if (isSame) {
            each$1(_cache.deps, function (oldValue, key) {
              var _context$get2 = context.get(key),
                  keypath = _context$get2.keypath,
                  value = _context$get2.value;

              if (value === oldValue) {
                deps[keypath] = value;
              } else {
                return isSame = FALSE;
              }
            });
          }
          if (isSame) {
            currentCache[trackBy] = _cache;
            addChild(last(htmlStack), _cache.vnode);
            return FALSE;
          }
        }

        cacheDeps = {};
        output.key = trackBy;
        currentCache[trackBy] = {
          keypath: keypath
        };
      }
    }
  };

  leave[ELEMENT] = function (source, output) {

    var key = void 0,
        props = void 0;
    if (has$1(output, 'key')) {
      key = output.key;
    }

    if (source.props) {
      props = {};
      each$1(source.props, function (expr, key) {
        props[key] = executeExpr(expr);
      });
    }

    var vnode = createElementVnode(source.name, {
      instance: instance,
      props: props,
      attrs: output.attrs,
      directives: output.directives
    }, output.children, key, source.component);

    if (isDefined(key)) {
      currentCache[key].deps = cacheDeps;
      currentCache[key].vnode = vnode;
      cacheDeps = NULL;
    }

    addChild(htmlStack[htmlStack.length - 2], vnode);
  };

  leave[TEXT] = function (source) {
    addChild(last(htmlStack), source.text);
  };

  leave[EXPRESSION] = function (source) {
    addChild(last(htmlStack), executeExpr(source.expr));
  };

  leave[ATTRIBUTE] = function (source, output) {
    var element = htmlStack[htmlStack.length - 2];
    var name = source.name,
        binding = source.binding;
    // key="xx" 是作为一个虚拟属性来求值的
    // 它并没有 name

    if (name) {
      addAttr(element, name, getValue(source, output));
      if (binding) {
        addDirective(element, DIRECTIVE_MODEL, name, binding);
      }
    }
  };

  leave[DIRECTIVE] = function (source, output) {

    // 1.如果指令的值是纯文本，会在编译阶段转成表达式抽象语法树
    //   on-click="submit()"
    //   ref="child"
    //
    // 2.如果指令的值包含插值语法，则会 merge 出最终值
    //   on-click="haha{{name}}"
    //
    // model="xxx"
    // model=""

    addDirective(htmlStack[htmlStack.length - 2], source.name, source.modifier, getValue(source, output), source.expr);
  };

  leave[SPREAD$1] = function (source, output) {

    // 1. <Component {{...props}} />
    //    把 props.xx 当做单向绑定指令，无需收集依赖
    //
    // 2. <Component {{... a ? aProps : bProps }}/>
    //    复杂的表达式，需要收集依赖

    var expr = source.expr,
        spreadKeypath = expr.keypath,
        value = executeExpr(expr, spreadKeypath);

    if (object(value)) {
      var element = last(htmlStack);
      each$1(value, function (value, name) {
        addAttr(element, name, value);
        if (spreadKeypath) {
          addDirective(element, DIRECTIVE_MODEL, name, join(expr.keypath, name));
        }
      });
    } else {
      fatal('Spread "' + expr.source + '" expected to be an object.');
    }
  };

  var result = pushStack({
    type: ELEMENT,
    children: array(ast) ? ast : [ast]
  });

  return {
    nodes: result.children,
    deps: deps
  };
}

var Observer = function () {

  /**
   * @param {Object} options
   * @property {Object} options.data
   * @property {?Object} options.computed
   * @property {?Object} options.watchers
   * @property {?*} options.context 执行 watcher 函数的 this 指向
   */
  function Observer(options) {
    classCallCheck(this, Observer);
    var data = options.data,
        context = options.context,
        computed = options.computed,
        watchers = options.watchers;


    var instance = this;

    instance.data = data;
    instance.cache = {};
    instance.emitter = new Emitter();
    instance.context = context || instance;

    // 谁依赖了谁
    instance.deps = {};
    // 谁被谁依赖
    instance.reversedDeps = {};

    // 计算属性也是数据
    if (object(computed)) {

      // 把计算属性拆为 getter 和 setter
      instance.computedGetters = {};
      instance.computedSetters = {};

      // 辅助获取计算属性的依赖
      instance.computedStack = [];

      var cache = instance.cache,
          computedStack = instance.computedStack;


      each$1(computed, function (item, keypath) {

        var get$$1 = void 0,
            set$$1 = void 0,
            deps = void 0,
            cacheable = TRUE;

        if (func(item)) {
          get$$1 = item;
        } else if (object(item)) {
          if (item.deps) {
            deps = item.deps;
          }
          if (boolean(item.cache)) {
            cacheable = item.cache;
          }
          if (func(item.get)) {
            get$$1 = item.get;
          }
          if (func(item.set)) {
            set$$1 = item.set;
          }
        }

        if (get$$1) {

          if (cacheable) {
            instance.watch(keypath + FORCE, function () {
              _getter[DIRTY] = TRUE;
            });
          }

          var _getter = function _getter() {

            if (cacheable) {
              if (_getter[DIRTY]) {
                _getter[DIRTY] = FALSE;
              } else if (has$1(cache, keypath)) {
                return cache[keypath];
              }
            }

            if (!deps) {
              computedStack.push([]);
            }

            var result = execute(get$$1, instance.context);
            cache[keypath] = result;

            var newDeps = deps || pop(computedStack);
            if (array(newDeps)) {
              instance.setDeps(keypath, newDeps);
            }

            return result;
          };

          _getter.toString = instance.computedGetters[keypath] = _getter;
        }

        if (set$$1) {
          instance.computedSetters[keypath] = set$$1;
        }
      });
    }

    if (object(watchers)) {
      instance.watch(watchers);
    }
  }

  /**
   * 获取数据
   *
   * @param {string} keypath
   * @param {*} defaultValue
   * @return {?*}
   */


  createClass(Observer, [{
    key: 'get',
    value: function get$$1(keypath, defaultValue) {

      var instance = this;

      var data = instance.data,
          cache = instance.cache,
          computedStack = instance.computedStack,
          computedGetters = instance.computedGetters;


      if (!keypath) {
        return data;
      }

      keypath = normalize(keypath);

      if (computedStack) {
        var list = last(computedStack);
        if (list) {
          push(list, keypath);
        }
      }

      var result = void 0;
      if (computedGetters) {
        var _matchBestGetter = matchBestGetter(computedGetters, keypath),
            value = _matchBestGetter.value,
            rest = _matchBestGetter.rest;

        if (value) {
          value = value();
          result = rest && !primitive(value) ? get$1(value, rest) : { value: value };
        }
      }

      if (!result) {
        result = get$1(data, keypath);
      }

      return result ? cache[keypath] = result.value : defaultValue;
    }

    /**
     * 更新数据
     *
     * @param {Object} model
     */

  }, {
    key: 'set',
    value: function set$$1(model) {

      var instance = this;

      var data = instance.data,
          cache = instance.cache,
          emitter = instance.emitter,
          context = instance.context,
          reversedDeps = instance.reversedDeps,
          computedGetters = instance.computedGetters,
          computedSetters = instance.computedSetters,
          watchKeypaths = instance.watchKeypaths,
          reversedKeypaths = instance.reversedKeypaths;

      /**
       * a -> b -> c
       *
       * a 依赖 b，b 依赖 c
       *
       * 当修改 c 时，要通知 a 和 b 更新
       * 当修改 b 时，要通知 a 更新，不通知 c 更新
       * 当修改 a 时，仅自己更新
       *
       * 有时候，b 的数据来自 c 的过滤，当修改 b 时，实际是修改 c，这时候，应该从最深层开始往上通知
       *
       * 当监听 user.* 时，如果修改了 user.name，不仅要触发 user.name 的 watcher，也要触发 user.* 的 watcher
       *
       * 这里遵循的一个原则是，只有当修改数据确实产生了数据变化，才会分析它的依赖
       */

      var joinKeypath = function joinKeypath(keypath1, keypath2) {
        return keypath1 + CHAR_DASH + keypath2;
      };

      var differences = [],
          differenceMap = {};
      var addDifference = function addDifference(keypath, realpath, oldValue, match, force) {
        var fullpath = joinKeypath(keypath, realpath);
        if (!differenceMap[fullpath]) {
          differenceMap[fullpath] = TRUE;
          push(differences, {
            keypath: keypath,
            realpath: realpath,
            oldValue: oldValue,
            match: match,
            force: force
          });
        }
      };

      var oldCache = {},
          newCache = {};
      var getOldValue = function getOldValue(keypath) {
        if (!has$1(oldCache, keypath)) {
          oldCache[keypath] = cache[keypath];
        }
        return oldCache[keypath];
      };
      var getNewValue = function getNewValue(keypath) {
        if (!has$1(newCache, keypath)) {
          newCache[keypath] = instance.get(keypath);
        }
        return newCache[keypath];
      };

      var reversedDepMap = {};
      var addReversedDepKeypath = function addReversedDepKeypath(keypath) {
        if (reversedKeypaths && !reversedDepMap[keypath]) {
          reversedDepMap[keypath] = TRUE;
          each(reversedKeypaths, function (key) {
            var list = void 0,
                match = void 0;
            if (key === keypath) {
              list = reversedDeps[key];
            } else if (isFuzzyKeypath(key)) {
              match = matchKeypath(keypath, key);
              if (match) {
                list = reversedDeps[key];
              }
            }
            if (list) {
              each(list, function (key) {
                addDifference(key, key, getOldValue(key), UNDEFINED, TRUE);
              });
            }
          });
        }
      };

      each$1(model, function (newValue, keypath) {

        keypath = normalize(keypath);

        addDifference(keypath, keypath, getOldValue(keypath));

        if (computedSetters) {
          var setter = computedSetters[keypath];
          if (setter) {
            setter.call(context, newValue);
            return;
          } else {
            var _matchBestGetter2 = matchBestGetter(computedGetters, keypath),
                value = _matchBestGetter2.value,
                rest = _matchBestGetter2.rest;

            if (value && rest) {
              value = value();
              if (!primitive(value)) {
                set$1(value, rest, newValue);
              }
              return;
            }
          }
        }

        set$1(data, keypath, newValue);
      });

      var addAsyncDifference = function addAsyncDifference(keypath, realpath, oldValue) {

        var differences = instance.differences || (instance.differences = {});
        differences[joinKeypath(keypath, realpath)] = {
          keypath: keypath,
          realpath: realpath,
          oldValue: oldValue
        };

        if (!instance.pending) {
          instance.pending = TRUE;
          append(function () {
            if (instance.pending) {
              // 冻结这批变化
              // 避免 fire 之后同步再次走进这里
              var _differences = instance.differences;

              delete instance.pending;
              delete instance.differences;
              each$1(_differences, function (difference) {
                var keypath = difference.keypath,
                    realpath = difference.realpath,
                    oldValue = difference.oldValue,
                    newValue = instance.get(realpath);

                if (oldValue !== newValue) {
                  var args = [newValue, oldValue, keypath];
                  if (realpath !== keypath) {
                    push(args, realpath);
                  }
                  emitter.fire(keypath, args, context);
                }
              });
            }
          });
        }
      };

      var fireDifference = function fireDifference(_ref) {
        var keypath = _ref.keypath,
            realpath = _ref.realpath,
            oldValue = _ref.oldValue,
            match = _ref.match,
            force = _ref.force;


        var newValue = force ? oldValue : getNewValue(realpath);
        if (force || newValue !== oldValue) {

          var args = [newValue, oldValue, keypath];
          if (match) {
            push(args, match);
          }
          if (force) {
            emitter.fire(keypath + FORCE, args, context);
          } else {
            if (has$2(keypath, FORCE)) {
              emitter.fire(keypath, args, context);
            } else {
              addAsyncDifference(keypath, realpath, oldValue);
            }
          }

          newValue = getNewValue(realpath);
          if (newValue !== oldValue) {
            if (force) {
              addAsyncDifference(keypath, realpath, oldValue);
            }
            each(watchKeypaths, function (key) {
              if (key !== realpath) {
                if (isFuzzyKeypath(key)) {
                  if (!has$2(realpath, FORCE)) {
                    var _match = matchKeypath(realpath, key);
                    if (_match) {
                      addDifference(key, realpath, getOldValue(realpath), _match);
                    }
                  }
                } else if (startsWith$1(key, realpath)) {
                  addDifference(key, key, getOldValue(key));
                }
              }
            });
            addReversedDepKeypath(realpath);
          }
        } else if (array(newValue)) {
          realpath = join(realpath, 'length');
          addDifference(realpath, realpath, getOldValue(realpath));
        }
      };

      for (var i = 0; i < differences.length; i++) {
        fireDifference(differences[i]);
      }
    }
  }, {
    key: 'setDeps',
    value: function setDeps(keypath, newDeps) {

      var instance = this;

      var deps = instance.deps,
          reversedDeps = instance.reversedDeps;


      if (newDeps !== deps[keypath]) {

        deps[keypath] = newDeps;
        updateWatchKeypaths(instance);

        // 全量更新
        reversedDeps = {};

        each$1(deps, function (deps, key) {
          each(deps, function (dep) {
            push(reversedDeps[dep] || (reversedDeps[dep] = []), key);
          });
        });

        instance.reversedDeps = reversedDeps;
        instance.reversedKeypaths = sort(reversedDeps, TRUE);
      }
    }
  }, {
    key: 'setCache',
    value: function setCache(keypath, value) {
      this.cache[keypath] = value;
    }

    /**
     * 销毁
     */

  }, {
    key: 'destroy',
    value: function destroy() {
      this.emitter.off();
      clear(this);
    }
  }]);
  return Observer;
}();

extend(Observer.prototype, {

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   */
  watch: createWatch('on'),

  /**
   * 监听一次数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   */
  watchOnce: createWatch('once'),

  /**
   * 取消监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   */
  unwatch: function unwatch(keypath, watcher) {
    this.emitter.off(keypath, watcher);
    updateWatchKeypaths(this);
  }

});

var FORCE = '._force_';
var DIRTY = '_dirty_';

function updateWatchKeypaths(instance) {
  var deps = instance.deps,
      emitter = instance.emitter;


  var watchKeypaths = {};

  var addKeypath = function addKeypath(keypath) {
    watchKeypaths[keypath] = TRUE;
  };

  // 1. 直接通过 watch 注册的
  each$1(emitter.listeners, function (list, key) {
    addKeypath(key);
  });

  // 2. 计算属性的依赖属于间接 watch
  each$1(deps, function (deps) {
    each(deps, addKeypath);
  });

  instance.watchKeypaths = sort(watchKeypaths, TRUE);
}

/**
 * watch 和 watchOnce 逻辑相同
 * 提出一个工厂方法
 */
function createWatch(action) {

  return function (keypath, watcher, sync) {

    var watchers = keypath;
    if (string(keypath)) {
      watchers = {};
      watchers[keypath] = {
        sync: sync,
        watcher: watcher
      };
    }

    var instance = this;

    var emitter = instance.emitter,
        context = instance.context;


    each$1(watchers, function (value, keypath) {

      var watcher = value,
          sync = void 0;
      if (object(value)) {
        watcher = value.watcher;
        sync = value.sync;
      }

      emitter[action](keypath, watcher);
      updateWatchKeypaths(instance);

      if (!isFuzzyKeypath(keypath)) {
        append(function () {
          if (instance.deps) {
            // get 会缓存一下当前值，便于下次对比
            value = instance.get(keypath);
            if (sync) {
              execute(watcher, context, [value, UNDEFINED, keypath]);
            }
          }
        });
      }
    });
  };
}

var patternCache = {};

/**
 * 模糊匹配 Keypath
 *
 * @param {string} keypath
 * @param {string} pattern
 */
function matchKeypath(keypath, pattern) {
  var cache = patternCache[pattern];
  if (!cache) {
    cache = pattern.replace(/\./g, '\\.').replace(/\*\*/g, '([\.\\w]+?)').replace(/\*/g, '(\\w+)');
    cache = patternCache[pattern] = new RegExp('^' + cache + '$');
  }
  var match = keypath.match(cache);
  if (match) {
    return toArray$1(match).slice(1);
  }
}

/**
 * 是否模糊匹配
 *
 * @param {string} keypath
 * @return {boolean}
 */
function isFuzzyKeypath(keypath) {
  return has$2(keypath, '*');
}

/**
 * 从 getter 对象的所有 key 中，选择和 keypath 最匹配的那一个
 *
 * @param {Object} getters
 * @param {string} keypath
 * @return {Object}
 */
function matchBestGetter(getters, keypath) {

  var key = void 0,
      value = void 0,
      rest = void 0;

  each(sort(getters, TRUE), function (prefix) {
    if (prefix = startsWith$1(keypath, prefix, TRUE)) {
      key = prefix[0];
      value = getters[key];
      rest = prefix[1];
      return FALSE;
    }
  });

  return { key: key, value: value, rest: rest };
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
 * @type {RegExp}
 */
var selector = /^[#.][-\w+]+$/;

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

var booleanAttrLiteral = 'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,default,defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable,enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,muted,nohref,noshade,noresize,novalidate,nowrap,open,pauseonexit,readonly,required,reversed,scoped,seamless,selected,sortable,spellcheck,translate,truespeed,typemustmatch,visible';
var booleanAttrMap = toObject(split(booleanAttrLiteral, CHAR_COMMA), FALSE, TRUE);
booleanAttrLiteral = NULL;

var attr2Prop = {};
attr2Prop['for'] = 'htmlFor';
attr2Prop['value'] = 'value';
attr2Prop['class'] = 'className';
attr2Prop['style'] = 'style.cssText';
attr2Prop['nohref'] = 'noHref';
attr2Prop['noshade'] = 'noShade';
attr2Prop['noresize'] = 'noResize';
attr2Prop['readonly'] = 'readOnly';
attr2Prop['defaultchecked'] = 'defaultChecked';
attr2Prop['defaultmuted'] = 'defaultMuted';
attr2Prop['defaultselected'] = 'defaultSelected';

function createElement(tagName, parentNode) {
  var SVGElement = win.SVGElement;

  return tagName === 'svg' || parentNode && SVGElement && parentNode instanceof SVGElement ? doc.createElementNS('http://www.w3.org/2000/svg', tagName) : doc.createElement(tagName);
}

function createText(text) {
  return doc.createTextNode(text || CHAR_BLANK);
}

function createComment(text) {
  return doc.createComment(text || CHAR_BLANK);
}

function createEvent(event) {
  return event;
}

function isElement(node) {
  return node.nodeType === 1;
}

function setProp(node, name, value) {
  set$1(node, name, value, FALSE);
}

function removeProp(node, name) {
  setProp(node, name, NULL);
}

function setAttr(node, name, value) {
  if (booleanAttrMap[name]) {
    value = value === TRUE || value === 'true' || value === name || value === UNDEFINED;
  }
  if (attr2Prop[name]) {
    setProp(node, attr2Prop[name], value);
  } else if (booleanAttrMap[name]) {
    setProp(node, name, value);
  } else {
    node.setAttribute(name, value);
  }
}

function removeAttr(node, name) {
  if (attr2Prop[name]) {
    removeProp(node, attr2Prop[name]);
  } else if (booleanAttrMap[name]) {
    removeProp(node, name);
  } else {
    node.removeAttribute(name);
  }
}

function before(parentNode, newNode, referenceNode) {
  if (referenceNode) {
    parentNode.insertBefore(newNode, referenceNode);
  } else {
    append$1(parentNode, newNode);
  }
}

function append$1(parentNode, child) {
  parentNode.appendChild(child);
}

function replace(parentNode, newNode, oldNode) {
  parentNode.replaceChild(newNode, oldNode);
}

function remove$1(parentNode, child) {
  parentNode.removeChild(child);
}

function parent(node) {
  return node.parentNode;
}

function next(node) {
  return node.nextSibling;
}

function tag$1(node) {
  var tagName = node.tagName;

  return falsy$1(tagName) ? CHAR_BLANK : tagName.toLowerCase();
}

function children(node) {
  return node.childNodes;
}

function text(node, content) {
  return content == NULL ? node.nodeValue : node.nodeValue = content;
}

function html(node, content) {
  return content == NULL ? node.innerHTML : node.innerHTML = content;
}

function find(selector, context) {
  return (context || doc).querySelector(selector);
}

function on(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function off(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

var domApi = Object.freeze({
	createElement: createElement,
	createText: createText,
	createComment: createComment,
	createEvent: createEvent,
	isElement: isElement,
	setProp: setProp,
	removeProp: removeProp,
	setAttr: setAttr,
	removeAttr: removeAttr,
	before: before,
	append: append$1,
	replace: replace,
	remove: remove$1,
	parent: parent,
	next: next,
	tag: tag$1,
	children: children,
	text: text,
	html: html,
	find: find,
	on: on,
	off: off
});

/**
 * tap 事件
 *
 * 非常有用的抽象事件，比如 pc 端是 click 事件，移动端是 touchend 事件
 *
 * 这样只需 on-tap="handler" 就可以完美兼容各端
 *
 * 框架未实现此事件，通过 Yox.dom.specialEvents 提供给外部扩展
 *
 * @type {string}
 */
var TAP = 'tap';

/**
 * 点击事件
 *
 * @type {string}
 */
var CLICK = 'click';

/**
 * 输入事件
 *
 * @type {string}
 */
var INPUT = 'input';

/**
 * 表单控件的修改事件
 *
 * @type {string}
 */
var CHANGE = 'change';

/**
 * 跟输入事件配套使用的事件
 *
 * @type {string}
 */
var COMPOSITION_START = 'compositionstart';

/**
 * 跟输入事件配套使用的事件
 *
 * @type {string}
 */
var COMPOSITION_END = 'compositionend';

/**
 * IE 模拟输入事件的特殊事件
 *
 * @type {string}
 */
var PROPERTY_CHANGE = 'propertychange';

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
  listener.$listener = function (e) {
    if (e.propertyName === 'value') {
      e = new Event(e);
      e.type = INPUT;
      listener.call(this, e);
    }
  };
  on$1(element, PROPERTY_CHANGE, listener.$listener);
}

function removeInputListener(element, listener) {
  off$1(element, PROPERTY_CHANGE, listener.$listener);
  delete listener.$listener;
}

function addChangeListener(element, listener) {
  listener.$listener = function (e) {
    e = new Event(e);
    e.type = CHANGE;
    listener.call(this, e);
  };
  on$1(element, CLICK, listener.$listener);
}

function removeChangeListener(element, listener) {
  off$1(element, CLICK, listener.$listener);
  delete listener.$listener;
}

function isBox(element) {
  return element.tagName === 'INPUT' && (element.type === 'radio' || element.type === 'checkbox');
}

function on$1(element, type, listener) {
  if (type === INPUT) {
    addInputListener(element, listener);
  } else if (type === CHANGE && isBox(element)) {
    addChangeListener(element, listener);
  } else {
    element.attachEvent('on' + type, listener);
  }
}

function off$1(element, type, listener) {
  if (type === INPUT) {
    removeInputListener(element, listener);
  } else if (type === CHANGE && isBox(element)) {
    removeChangeListener(element, listener);
  } else {
    element.detachEvent('on' + type, listener);
  }
}

function createEvent$1(event, element) {
  return new IEEvent(event, element);
}

function find$1(selector, context) {
  context = context || doc;
  return context.querySelector ? context.querySelector(selector) : context.getElementById(slice(selector, 1));
}

function setProp$1(element, name, value) {
  try {
    set$1(element, name, value);
  } catch (e) {
    if (element.tagName === 'STYLE' && name === 'innerHTML') {
      element.setAttribute('type', 'text/css');
      element.styleSheet.cssText = value;
    }
  }
}



var oldApi = Object.freeze({
	on: on$1,
	off: off$1,
	createEvent: createEvent$1,
	find: find$1,
	setProp: setProp$1
});

var api = copy(domApi);

if (!doc.addEventListener) {
  extend(api, oldApi);
}

var _on = api.on;
var _off = api.off;

/**
 * 特殊事件，外部可扩展
 *
 * @type {Object}
 */

api.specialEvents = {
  input: {
    on: function on$$1(el, listener) {
      var locked = FALSE;
      api.on(el, COMPOSITION_START, listener[COMPOSITION_START] = function () {
        locked = TRUE;
      });
      api.on(el, COMPOSITION_END, listener[COMPOSITION_END] = function (e) {
        locked = FALSE;
        listener(e, INPUT);
      });
      _on(el, INPUT, listener[INPUT] = function (e) {
        if (!locked) {
          listener(e);
        }
      });
    },
    off: function off$$1(el, listener) {
      api.off(el, COMPOSITION_START, listener[COMPOSITION_START]);
      api.off(el, COMPOSITION_END, listener[COMPOSITION_END]);
      _off(el, INPUT, listener[INPUT]);
      listener[COMPOSITION_START] = listener[COMPOSITION_END] = listener[INPUT] = NULL;
    }
  }
};

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
api.on = function (element, type, listener, context) {
  var $emitter = element.$emitter || (element.$emitter = new Emitter());
  if (!$emitter.has(type)) {
    var nativeListener = function nativeListener(e, type) {
      if (!Event.is(e)) {
        e = new Event(api.createEvent(e, element));
      }
      if (type) {
        e.type = type;
      }
      $emitter.fire(e.type, e, context);
    };
    $emitter[type] = nativeListener;
    var special = api.specialEvents[type];
    if (special) {
      special.on(element, nativeListener);
    } else {
      _on(element, type, nativeListener);
    }
  }
  $emitter.on(type, listener);
};

/**
 * 解绑事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 *
 */
api.off = function (element, type, listener) {
  var $emitter = element.$emitter;

  var types = keys($emitter.listeners);
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener);
  // 根据 emitter 的删除结果来操作这里的事件 listener
  each(types, function (type, index) {
    if ($emitter[type] && !$emitter.has(type)) {
      var nativeListener = $emitter[type];
      var special = api.specialEvents[type];
      if (special) {
        special.off(element, nativeListener);
      } else {
        _off(element, type, nativeListener);
      }
      delete $emitter[type];
      types.splice(index, 1);
    }
  }, TRUE);
  if (!types.length) {
    api.removeProp(element, '$emitter');
  }
};

/**
 * <Component ref="component" />
 * <input ref="input">
 */

var ref = function (_ref) {
  var el = _ref.el,
      node = _ref.node,
      instance = _ref.instance,
      component = _ref.component;
  var value = node.value;

  if (falsy$1(value)) {
    return;
  }

  var $refs = instance.$refs;

  if (object($refs)) {
    if (has$1($refs, value)) {
      error$1('Passing a ref "' + value + '" is existed.');
    }
  } else {
    $refs = instance.$refs = {};
  }

  var set$$1 = function set$$1(target) {
    $refs[value] = target;
  };

  if (component) {
    if (array(component)) {
      push(component, set$$1);
    } else {
      set$$1(component);
    }
  } else {
    set$$1(el);
  }

  return function () {
    if (has$1($refs, value)) {
      delete $refs[value];
    } else if (array(component)) {
      remove(component, set$$1);
    }
  };
};

/**
 * 节流调用
 *
 * @param {Function} fn 需要节制调用的函数
 * @param {number} delay 调用的时间间隔
 * @param {?boolean} immediate 是否立即触发
 * @return {Function}
 */
var debounce = function (fn, delay, immediate) {

  var timer = void 0;

  return function () {

    if (!timer) {

      var args = toArray$1(arguments);
      if (immediate) {
        execute(fn, NULL, args);
      }

      timer = setTimeout(function () {
        timer = NULL;
        if (!immediate) {
          execute(fn, NULL, args);
        }
      }, delay);
    }
  };
};

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
var immediateTypes = [CLICK, TAP];

var bindEvent = function (_ref) {
  var el = _ref.el,
      node = _ref.node,
      instance = _ref.instance,
      component = _ref.component,
      directives = _ref.directives,
      type = _ref.type,
      listener = _ref.listener;


  if (!type) {
    type = node.modifier;
  }
  if (!listener) {
    listener = instance.compileDirective(node);
  }

  if (type && listener) {
    var lazy = directives.lazy;

    if (lazy) {
      var value = lazy.value;

      if (numeric(value) && value >= 0) {
        listener = debounce(listener, value, has(immediateTypes, type));
      } else if (type === INPUT) {
        type = CHANGE;
      }
    }

    if (component) {
      var bind = function bind(component) {
        component.on(type, listener);
      };
      if (array(component)) {
        push(component, bind);
      } else {
        bind(component);
      }
      return function () {
        component.off(type, listener);
        if (array(component)) {
          remove(component, bind);
        }
      };
    } else {
      api.on(el, type, listener);
      return function () {
        api.off(el, type, listener);
      };
    }
  }
};

var inputControl = {
  set: function set$$1(el, keypath, instance) {
    var value = toString(instance.get(keypath));
    if (value !== el.value) {
      el.value = value;
    }
  },
  sync: function sync(el, keypath, instance) {
    instance.set(keypath, el.value);
  },

  attr: 'value'
};

var selectControl = {
  set: function set$$1(el, keypath, instance) {
    var value = toString(instance.get(keypath));
    var options = el.options,
        selectedIndex = el.selectedIndex;

    if (value !== options[selectedIndex].value) {
      each(options, function (option, index) {
        if (option.value === value) {
          el.selectedIndex = index;
          return FALSE;
        }
      });
    }
  },
  sync: function sync(el, keypath, instance) {
    var value = el.options[el.selectedIndex].value;

    instance.set(keypath, value);
  }
};

var radioControl = {
  set: function set$$1(el, keypath, instance) {
    el.checked = el.value === toString(instance.get(keypath));
  },
  sync: function sync(el, keypath, instance) {
    if (el.checked) {
      instance.set(keypath, el.value);
    }
  },

  attr: 'checked'
};

var checkboxControl = {
  set: function set$$1(el, keypath, instance) {
    var value = instance.get(keypath);
    el.checked = array(value) ? has(value, el.value, FALSE) : boolean(value) ? value : !!value;
  },
  sync: function sync(el, keypath, instance) {
    var value = instance.get(keypath);
    if (array(value)) {
      if (el.checked) {
        push(value, el.value);
      } else {
        remove(value, el.value, FALSE);
      }
      instance.set(keypath, copy(value));
    } else {
      instance.set(keypath, el.checked);
    }
  },

  attr: 'checked'
};

var specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl
};

function twoway(keypath, _ref) {
  var el = _ref.el,
      node = _ref.node,
      instance = _ref.instance,
      directives = _ref.directives,
      attrs = _ref.attrs;


  var type = CHANGE,
      tagName = api.tag(el),
      controlType = el.type;
  var control = specialControls[controlType] || specialControls[tagName];
  if (!control) {
    control = inputControl;
    if ('oninput' in el || tagName === 'textarea' || controlType === 'text' || controlType === 'password') {
      type = INPUT;
    }
  }

  var set$$1 = function set$$1() {
    control.set(el, keypath, instance);
  };

  instance.watch(keypath, set$$1, control.attr && !has$1(attrs, control.attr));

  var destroy = bindEvent({
    el: el,
    node: node,
    instance: instance,
    directives: directives,
    type: type,
    listener: function listener() {
      control.sync(el, keypath, instance);
    }
  });

  return function () {
    instance.unwatch(keypath, set$$1);
    destroy && destroy();
  };
}

function oneway(keypath, _ref2) {
  var el = _ref2.el,
      node = _ref2.node,
      instance = _ref2.instance,
      component = _ref2.component;


  var set$$1 = function set$$1(value) {
    var name = node.modifier;
    if (component) {
      var _set = function _set(component) {
        component.set(name, value);
      };
      if (array(component)) {
        push(component, _set);
      } else {
        _set(component);
      }
    } else {
      api.setAttr(el, name, value !== UNDEFINED ? value : CHAR_BLANK);
    }
  };

  instance.watch(keypath, set$$1);

  return function () {
    instance.unwatch(keypath, set$$1);
  };
}

// 双向 model="xx"
// 单向 name="{{value}}"

var model = function (options) {
  var _options$node = options.node,
      modifier = _options$node.modifier,
      value = _options$node.value,
      context = _options$node.context;

  if (!falsy$1(value)) {
    var _context$get = context.get(value),
        keypath = _context$get.keypath;

    return modifier ? oneway(keypath, options) : twoway(keypath, options);
  }
};

var TEMPLATE_KEY = '_template_';

var patch = init([snabbdomComponent, snabbdomAttrs, snabbdomProps, snabbdomDirectives], api);

var Yox = function () {
  function Yox(options) {
    classCallCheck(this, Yox);


    var instance = this;

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options;

    execute(options[BEFORE_CREATE], instance, options);

    var el = options.el,
        data = options.data,
        props = options.props,
        parent = options.parent,
        replace = options.replace,
        computed = options.computed,
        template = options.template,
        components = options.components,
        directives = options.directives,
        partials = options.partials,
        filters = options.filters,
        events = options.events,
        watchers = options.watchers,
        methods = options.methods,
        propTypes = options.propTypes,
        extensions = options.extensions;


    extensions && extend(instance, extensions);

    var source = props;

    // 检查 props
    if (object(source)) {
      if (object(propTypes)) {
        source = Yox.validate(source, propTypes);
      }
      // 如果传了 props，则 data 应该是个 function
      if (data && !func(data)) {
        warn('"data" option expected to be a function.');
      }
    } else {
      source = {};
    }

    computed = computed ? copy(computed) : {};

    var counter = 0;
    computed[TEMPLATE_KEY] = {
      deps: TRUE,
      get: function get$$1() {
        return counter++;
      }
    };

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    var observer = new Observer({
      context: instance,
      data: source,
      computed: computed
    });
    instance.$observer = observer;

    // 后放 data
    var extend$$1 = func(data) ? execute(data, instance) : data;
    if (object(extend$$1)) {
      each$1(extend$$1, function (value, key) {
        if (has$1(source, key)) {
          warn('"' + key + '" is already defined as a prop. Use prop default value instead.');
        } else {
          source[key] = value;
        }
      });
    }

    // 等数据准备好之后，再触发 watchers
    watchers && observer.watch(watchers);

    // 监听各种事件
    instance.$emitter = new Emitter();
    events && instance.on(events);

    execute(options[AFTER_CREATE], instance);

    // 检查 template
    if (string(template)) {
      if (selector.test(template)) {
        template = api.html(api.find(template));
      }
      if (!tag.test(template)) {
        error$1('"template" option expected to have a root element.');
      }
    } else {
      template = NULL;
    }

    // 检查 el
    if (string(el)) {
      if (selector.test(el)) {
        el = api.find(el);
      }
    }
    if (el) {
      if (api.isElement(el)) {
        if (!replace) {
          api.html(el, '<div></div>');
          el = api.children(el)[0];
        }
      } else {
        error$1('"el" option expected to be a html element.');
      }
    }

    if (parent) {
      instance.$parent = parent;
    }

    if (methods) {
      each$1(methods, function (fn, name) {
        if (has$1(prototype, name)) {
          fatal('"' + name + '" method is conflicted with built-in methods.');
        }
        instance[name] = fn;
      });
    }

    components && instance.component(components);
    directives && instance.directive(directives);
    partials && instance.partial(partials);
    filters && instance.filter(filters);

    if (template) {
      // 过滤器和计算属性是预定义好的
      // 在组件创建之后就不会改变，因此在此固化不变的 context
      // 避免每次更新都要全量 extend
      var filter = registry.filter;

      instance.$context = extend({},
      // 全局过滤器
      filter && filter.data,
      // 本地过滤器
      filters,
      // 计算属性
      observer.computedGetters);
      // 确保组件根元素有且只有一个
      instance.$template = Yox.compile(template)[0];
      // 首次渲染
      instance.updateView(el || api.createElement('div'), instance.render());
    }
  }

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {*} defaultValue
   * @return {?*}
   */


  createClass(Yox, [{
    key: 'get',
    value: function get$$1(keypath, defaultValue) {
      return this.$observer.get(keypath, defaultValue);
    }

    /**
     * 设值
     *
     * @param {string|Object} keypath
     * @param {?*} value
     */

  }, {
    key: 'set',
    value: function set$$1(keypath, value) {

      var model$$1 = void 0,
          sync = void 0;
      if (string(keypath)) {
        model$$1 = {};
        model$$1[keypath] = value;
      } else if (object(keypath)) {
        model$$1 = keypath;
        sync = value === TRUE;
      } else {
        return;
      }

      this.updateModel(model$$1, sync);
    }

    /**
     * 监听事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     * @return {Yox} 支持链式
     */

  }, {
    key: 'on',
    value: function on(type, listener) {
      this.$emitter.on(type, listener);
      return this;
    }

    /**
     * 监听一次事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     * @return {Yox} 支持链式
     */

  }, {
    key: 'once',
    value: function once(type, listener) {
      this.$emitter.once(type, listener);
      return this;
    }

    /**
     * 取消监听事件
     *
     * @param {string|Object} type
     * @param {?Function} listener
     * @return {Yox} 支持链式
     */

  }, {
    key: 'off',
    value: function off(type, listener) {
      this.$emitter.off(type, listener);
      return this;
    }

    /**
     * 触发事件
     *
     * @param {string} type
     * @param {?*} data
     * @return {boolean} 是否正常结束
     */

  }, {
    key: 'fire',
    value: function fire(type, data) {

      // 外部为了使用方便，fire(type) 或 fire(type, data) 就行了
      // 内部为了保持格式统一
      // 需要转成 Event，这样还能知道 target 是哪个组件
      var event = type;
      if (string(type)) {
        event = new Event(type);
      }

      var instance = this;
      if (!event.target) {
        event.target = instance;
      }

      var args = [event];
      if (object(data)) {
        push(args, data);
      }

      var $parent = instance.$parent,
          $emitter = instance.$emitter;

      var isComplete = $emitter.fire(event.type, args, instance);
      if (isComplete && $parent) {
        isComplete = $parent.fire(event, data);
      }

      return isComplete;
    }

    /**
     * 监听数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     * @param {?boolean} sync
     * @return {Yox} 支持链式
     */

  }, {
    key: 'watch',
    value: function watch(keypath, watcher, sync) {
      this.$observer.watch(keypath, watcher, sync);
      return this;
    }

    /**
     * 监听一次数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     * @param {?boolean} sync
     * @return {Yox} 支持链式
     */

  }, {
    key: 'watchOnce',
    value: function watchOnce(keypath, watcher, sync) {
      this.$observer.watchOnce(keypath, watcher, sync);
      return this;
    }

    /**
     * 取消监听数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     * @return {Yox} 支持链式
     */

  }, {
    key: 'unwatch',
    value: function unwatch(keypath, watcher) {
      this.$observer.unwatch(keypath, watcher);
      return this;
    }

    /**
     * 只更新数据，不更新视图
     *
     * @param {Object} model
     */

  }, {
    key: 'updateModel',
    value: function updateModel(model$$1) {

      var instance = this,
          args = arguments;

      var oldValue = instance.get(TEMPLATE_KEY);

      instance.$observer.set(model$$1);

      if (oldValue === instance.get(TEMPLATE_KEY) || args.length === 1) {
        return;
      }

      if (args.length === 2 && args[1]) {
        instance.updateView(instance.$node, instance.render());
      } else {
        instance.forceUpdate();
      }
    }

    /**
     * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
     * 而你非常确定需要更新模板，强制刷新正是你需要的
     */

  }, {
    key: 'forceUpdate',
    value: function forceUpdate() {
      var instance = this;
      if (!instance.$pending) {
        instance.$pending = TRUE;
        prepend(function () {
          if (instance.$pending) {
            delete instance.$pending;
            instance.updateView(instance.$node, instance.render());
          }
        });
      }
    }

    /**
     * 把模板抽象语法树渲染成 virtual dom
     *
     * @return {Object}
     */

  }, {
    key: 'render',
    value: function render$$1() {

      var instance = this;
      var $template = instance.$template,
          $observer = instance.$observer,
          $context = instance.$context;


      extend($context, $observer.data);

      var _renderTemplate = render($template, $context, instance),
          nodes = _renderTemplate.nodes,
          deps = _renderTemplate.deps;

      var keys$$1 = keys(deps);
      each$1(keys$$1, function (key) {
        $observer.setCache(key, deps[key]);
      });
      $observer.setDeps(TEMPLATE_KEY, keys$$1);

      return nodes[0];
    }

    /**
     * 更新 virtual dom
     *
     * @param {HTMLElement|Vnode} oldNode
     * @param {Vnode} newNode
     */

  }, {
    key: 'updateView',
    value: function updateView(oldNode, newNode) {

      var instance = this;

      var $node = instance.$node,
          $options = instance.$options;


      if ($node) {
        execute($options[BEFORE_UPDATE], instance);
        instance.$node = patch(oldNode, newNode);
        execute($options[AFTER_UPDATE], instance);
      } else {
        execute($options[BEFORE_MOUNT], instance);
        $node = patch(oldNode, newNode);
        instance.$el = $node.el;
        instance.$node = $node;
        execute($options[AFTER_MOUNT], instance);
      }
    }

    /**
     * 导入编译后的子模板
     *
     * @param {string} name
     * @return {Array}
     */

  }, {
    key: 'importPartial',
    value: function importPartial(name) {
      return Yox.compile(this.partial(name));
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
      options.parent = this;
      var child = new Yox(options);
      push(this.$children || (this.$children = []), child);
      return child;
    }

    /**
     * 把指令中的表达式编译成函数
     *
     * @param {Directive} directive
     * @return {Function}
     */

  }, {
    key: 'compileDirective',
    value: function compileDirective(directive) {

      var instance = this;
      var value = directive.value,
          expr = directive.expr,
          keypath = directive.keypath,
          context = directive.context;


      if (expr && expr.type === CALL) {

        var getValue = function getValue(keypath) {
          return context.get(keypath).value;
        };

        return function (event) {
          var isEvent = Event.is(event);
          var callee = expr.callee,
              args = expr.args;

          if (!args.length) {
            if (isEvent) {
              args = [event];
            }
          } else {
            context.set(SPECIAL_KEYPATH, keypath);
            context.set(SPECIAL_EVENT, event);
            args = args.map(function (node) {
              return execute$1(node, getValue, instance);
            });
          }
          var method = instance[callee.source];
          if (execute(method, instance, args) === FALSE && isEvent) {
            event.prevent();
            event.stop();
          }
        };
      } else if (value) {
        return function (event, data) {
          if (event.type !== value) {
            event = new Event(event);
            event.type = value;
          }
          instance.fire(event, data);
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
          $node = instance.$node,
          $parent = instance.$parent,
          $emitter = instance.$emitter,
          $observer = instance.$observer;


      execute($options[BEFORE_DESTROY], instance);

      if ($parent && $parent.$children) {
        remove($parent.$children, instance);
      }

      if ($node) {
        if (arguments[0] !== TRUE) {
          vdom.patch($node, { text: CHAR_BLANK });
        }
      }

      $emitter.off();
      $observer.destroy();

      clear(instance);

      execute($options[AFTER_DESTROY], instance);
    }

    /**
     * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
     *
     * @param {Function} fn
     */

  }, {
    key: 'nextTick',
    value: function nextTick(fn) {
      append(fn);
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

    /**
     * 拷贝任意数据，支持深拷贝
     *
     * @param {*} data
     * @param {?boolean} deep 是否深拷贝
     * @return {*}
     */

  }, {
    key: 'copy',
    value: function copy$$1(data, deep) {
      return copy(data, deep);
    }

    /**
     * 在数组指定位置插入元素
     *
     * @param {string} keypath
     * @param {*} item
     * @param {number} index
     * @return {?boolean} 是否插入成功
     */

  }, {
    key: 'insert',
    value: function insert(keypath, item, index) {

      var list = this.get(keypath);
      if (!array(list)) {
        list = [];
      }

      var _list = list,
          length = _list.length;

      if (index === TRUE || index === length) {
        list.push(item);
      } else if (index === FALSE || index === 0) {
        list.unshift(item);
      } else if (index > 0 && index < length) {
        list.splice(index, 0, item);
      } else {
        return;
      }

      this.set(keypath, list);
      return TRUE;
    }

    /**
     * 在数组尾部添加元素
     *
     * @param {string} keypath
     * @param {*} item
     * @return {?boolean} 是否添加成功
     */

  }, {
    key: 'append',
    value: function append$$1(keypath, item) {
      return this.insert(keypath, item, TRUE);
    }

    /**
     * 在数组首部添加元素
     *
     * @param {string} keypath
     * @param {*} item
     * @return {?boolean} 是否添加成功
     */

  }, {
    key: 'prepend',
    value: function prepend$$1(keypath, item) {
      return this.insert(keypath, item, FALSE);
    }

    /**
     * 通过索引移除数组中的元素
     *
     * @param {string} keypath
     * @param {number} index
     * @return {?boolean} 是否移除成功
     */

  }, {
    key: 'removeAt',
    value: function removeAt(keypath, index) {
      var list = this.get(keypath);
      if (array(list) && index >= 0 && index < list.length) {
        list.splice(index, 1);
        this.set(keypath, list);
        return TRUE;
      }
    }

    /**
     * 直接移除数组中的元素
     *
     * @param {string} keypath
     * @param {*} item
     * @return {?boolean} 是否移除成功
     */

  }, {
    key: 'remove',
    value: function remove$$1(keypath, item) {
      var list = this.get(keypath);
      if (array(list)) {
        var index = indexOf(list, item);
        if (index >= 0) {
          list.splice(index, 1);
          this.set(keypath, list);
          return TRUE;
        }
      }
    }
  }]);
  return Yox;
}();

Yox.version = '0.42.3';

/**
 * 工具，便于扩展、插件使用
 */
Yox.is = is$1;
Yox.dom = api;
Yox.array = array$1;
Yox.object = object$1;
Yox.string = string$1;
Yox.logger = logger;
Yox.Event = Event;
Yox.Emitter = Emitter;

var prototype = Yox.prototype;

// 全局注册

var registry = {};

var Store = function () {
  function Store() {
    classCallCheck(this, Store);

    this.data = {};
  }

  /**
   * 异步取值
   *
   * @param {string} key
   * @param {Function} callback
   */


  createClass(Store, [{
    key: 'getAsync',
    value: function getAsync(key, callback) {
      var data = this.data;

      var value = data[key];
      if (func(value)) {
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
          push($pending, callback);
        }
      } else {
        callback(value);
      }
    }

    /**
     * 同步取值
     *
     * @param {string} key
     * @return {*}
     */

  }, {
    key: 'get',
    value: function get$$1(key) {
      return this.data[key];
    }
  }, {
    key: 'set',
    value: function set$$1(key, value) {
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

// 支持异步注册


var supportRegisterAsync = ['component'];

// 解析注册参数
function parseRegisterArguments(type, args) {
  var id = args[0];
  var value = args[1];
  var callback = void 0;
  if (has(supportRegisterAsync, type) && func(value)) {
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
each(merge(supportRegisterAsync, ['directive', 'partial', 'filter']), function (type) {
  prototype[type] = function () {
    var prop = '$' + type + 's';
    var store = this[prop] || (this[prop] = new Store());

    var _parseRegisterArgumen = parseRegisterArguments(type, arguments),
        args = _parseRegisterArgumen.args,
        callback = _parseRegisterArgumen.callback;

    return magic({
      args: args,
      get: function get$$1(id) {
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
      set: function set$$1(id, value) {
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
      get: function get$$1(id) {
        if (callback) {
          store.getAsync(id, callback);
        } else {
          return store.get(id);
        }
      },
      set: function set$$1(id, value) {
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
Yox.nextTick = append;

/**
 * 编译模板，暴露出来是为了打包阶段的模板预编译
 *
 * @param {string} template
 * @return {Array}
 */
Yox.compile = function (template) {
  return string(template) ? compile(template) : template;
};

/**
 * 验证 props
 *
 * @param {Object} props 传递的数据
 * @param {Object} propTypes 数据格式
 * @return {Object} 验证通过的数据
 */
Yox.validate = function (props, propTypes) {
  var result = {};
  each$1(propTypes, function (rule, key) {
    var type = rule.type,
        value = rule.value,
        required = rule.required;


    required = required === TRUE || func(required) && required(props);

    if (has$1(props, key)) {
      // 如果不写 type 或 type 不是 字符串 或 数组
      // 就当做此规则无效，和没写一样
      if (type) {
        var target = props[key],
            matched = void 0;
        // 比较类型
        if (!falsy$1(type)) {
          matched = is(target, type);
        } else if (!falsy(type)) {
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
          warn('"' + key + '" prop\'s type is not matched.');
        }
      }
    } else if (required) {
      warn('"' + key + '" prop is not found.');
    } else if (has$1(rule, 'value')) {
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

function magic(options) {
  var args = options.args,
      get$$1 = options.get,
      set$$1 = options.set;

  args = toArray$1(args);

  var key = args[0],
      value = args[1];
  if (object(key)) {
    execute(set$$1, NULL, key);
  } else if (string(key)) {
    var _args = args,
        length = _args.length;

    if (length === 2) {
      execute(set$$1, NULL, args);
    } else if (length === 1) {
      return execute(get$$1, NULL, key);
    }
  }
}

// 全局注册内置指令
Yox.directive({ ref: ref, event: bindEvent, model: model });

return Yox;

})));
