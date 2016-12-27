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
 * 浏览器环境下的 window 对象
 *
 * @type {?Window}
 */


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
  var result = [];
  each(arguments, function (array$$1) {
    push$1(result, array$$1);
  });
  return result;
}

/**
 * 压入一个数组
 *
 * @param {Array} original
 * @param {Array|*} array
 */
function push$1(original, array$$1) {
  if (array(array$$1)) {
    each(array$$1, function (item) {
      original.push(item);
    });
  } else {
    original.push(array$$1);
  }
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

var _execute = function (fn, context, args) {
  if (func(fn)) {
    if (array(args)) {
      return fn.apply(context, args);
    } else {
      return fn.call(context, args);
    }
  }
};

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
    _execute(set, NULL, key);
  } else if (string(key)) {
    var _args = args,
        length = _args.length;

    if (length === 2) {
      _execute(set, NULL, args);
    } else if (length === 1) {
      return _execute(get, NULL, key);
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

function stringify$1(keypaths) {
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
      list.push(normalize(term));
    }
  });
  return stringify$1(list);
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

  createClass(Store, [{
    key: 'get',
    value: function get(key) {
      return this.data[key];
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
          onAdd = this.onAdd;

      var added = [];

      var addListener = function addListener(listener, type) {
        if (func(listener)) {
          var list = listeners[type] || (listeners[type] = []);
          if (!list.length) {
            added.push(type);
          }
          list.push(listener);
        }
      };

      if (object(type)) {
        each$1(type, addListener);
      } else if (string(type)) {
        addListener(listener, type);
      }

      if (added.length && func(onAdd)) {
        onAdd(added);
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
          onRemove = this.onRemove;

      var removed = [];

      if (type == NULL) {
        each$1(listeners, function (list, type) {
          if (array(listeners[type])) {
            listeners[type].length = 0;
            removed.push(type);
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
            removed.push(type);
          }
        }
      }

      if (removed.length && func(onRemove)) {
        onRemove(removed);
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
            var result = _execute(listener, context, data);

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
            key: key.trim()
          };
          if (string(value)) {
            item.value = value.trim();
          }
          result.push(item);
        }
      });
    })();
  }
  return result;
}

/**
 * 为了压缩而存在的两个方法
 */
function charAt$1(str, index) {
  return str.charAt(index);
}
function charCodeAt(str, index) {
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
	charAt: charAt$1,
	charCodeAt: charCodeAt
});

/**
 * 是否有原生的日志特性，没有必要单独实现
 *
 * @param {boolean}
 */
var hasConsole = typeof console !== 'undefined';

var tester = function tester() {/** yox */};
var isDebug = /yox/.test(tester.toString());

/**
 * 打印普通日志
 *
 * @param {string} msg
 */
function log(msg) {
  if (hasConsole && isDebug) {
    console.log('[Yox log]: ' + msg);
  }
}

/**
 * 打印警告日志
 *
 * @param {string} msg
 */
function warn(msg) {
  if (hasConsole && isDebug) {
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

var logger = Object.freeze({
	log: log,
	warn: warn,
	error: error$1
});

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
  nextTasks.push(task);
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

var breaklinePattern = /^[ \t]*\n[ \t]*$/;
var breaklinePrefixPattern = /^[ \t]*\n/;
var breaklineSuffixPattern = /\n[ \t]*$/;

var nonSingleQuotePattern = /^[^']*/;
var nonDoubleQuotePattern = /^[^"]*/;

function trimBreakline(str) {
  if (breaklinePattern.test(str)) {
    return '';
  }
  return str.replace(breaklinePrefixPattern, '').replace(breaklineSuffixPattern, '');
}

function matchByQuote(str, nonQuote) {
  var match = str.match(nonQuote === '"' ? nonDoubleQuotePattern : nonSingleQuotePattern);
  return match ? match[0] : '';
}

function getLocationByIndex(str, index) {

  var line = 0,
      col = 0,
      pos = 0;

  each(str.split('\n'), function (lineStr) {
    line++;
    col = 0;

    var length = lineStr.length;

    if (index >= pos && index <= pos + length) {
      col = index - pos;
      return FALSE;
    }

    pos += length;
  });

  return {
    line: line,
    col: col
  };
}

function parseError(str, errorMsg, errorIndex) {
  if (errorIndex == NULL) {
    errorMsg += '.';
  } else {
    var _getLocationByIndex = getLocationByIndex(str, errorIndex),
        line = _getLocationByIndex.line,
        col = _getLocationByIndex.col;

    errorMsg += ', at line ' + line + ', col ' + col + '.';
  }
  error$1(errorMsg);
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

var DIRECTIVE_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var DIRECTIVE_REF = 'ref';
var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';

var KEYWORD_UNIQUE = 'key';

var DELIMITER_OPENING = '\\{\\{\\s*';
var DELIMITER_CLOSING = '\\s*\\}\\}';

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
    key: 'format',
    value: function format(keypath) {
      var instance = this,
          keys$$1 = parse(keypath);
      if (keys$$1[0] === 'this') {
        keys$$1.shift();
        return {
          keypath: stringify$1(keys$$1),
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
              keypath: stringify$1(keys$$1.slice(index)),
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
  }]);
  return Scanner;
}();

/**
 * 节点基类
 */

var Node = function () {
  function Node(type, hasChildren) {
    classCallCheck(this, Node);

    this.type = type;
    if (hasChildren !== FALSE) {
      this.children = [];
    }
  }

  createClass(Node, [{
    key: 'addChild',
    value: function addChild(child) {
      this.children.push(child);
    }
  }, {
    key: 'renderExpression',
    value: function renderExpression(data) {
      var context = data.context,
          keys$$1 = data.keys,
          addDeps = data.addDeps;

      var _expr$execute = this.expr.execute(context),
          value = _expr$execute.value,
          deps = _expr$execute.deps;

      var newDeps = {};
      each$1(deps, function (value, key) {
        newDeps[resolve(stringify$1(keys$$1), key)] = value;
      });
      addDeps(newDeps);
      return {
        value: value,
        deps: newDeps
      };
    }
  }, {
    key: 'renderChildren',
    value: function renderChildren(data, children) {
      if (!children) {
        children = this.children;
      }
      var list = [],
          item = void 0;
      var i = 0,
          node = void 0,
          next = void 0;
      while (node = children[i]) {
        item = node.render(data);
        if (item) {
          push$1(list, item);
          if (node.type === IF$1 || node.type === ELSE_IF$1) {
            // 跳过后面紧跟着的 elseif else
            while (next = children[i + 1]) {
              if (next.type === ELSE_IF$1 || next.type === ELSE$1) {
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
  }, {
    key: 'renderTexts',
    value: function renderTexts(data) {
      var nodes = this.renderChildren(data);
      var length = nodes.length;

      if (length === 1) {
        return nodes[0].content;
      } else if (length > 1) {
        return nodes.map(function (node) {
          return node.content;
        }).join('');
      }
    }
  }, {
    key: 'renderCondition',
    value: function renderCondition(data) {
      var _renderExpression = this.renderExpression(data),
          value = _renderExpression.value;

      if (value) {
        return this.renderChildren(data);
      }
    }
  }]);
  return Node;
}();

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 * @param {?*} value 属性值
 */

var Attribute = function (_Node) {
  inherits(Attribute, _Node);

  function Attribute(options) {
    classCallCheck(this, Attribute);

    var _this = possibleConstructorReturn(this, (Attribute.__proto__ || Object.getPrototypeOf(Attribute)).call(this, ATTRIBUTE, !has$2(options, 'value')));

    extend(_this, options);
    return _this;
  }

  createClass(Attribute, [{
    key: 'render',
    value: function render(data) {
      var name = this.name;

      if (name.type === EXPRESSION) {
        var _name$renderExpressio = name.renderExpression(data),
            value = _name$renderExpressio.value;

        name = value;
      }

      return new Attribute({
        name: name,
        value: this.renderTexts(data),
        keypath: stringify$1(data.keys)
      });
    }
  }]);
  return Attribute;
}(Node);

/**
 * 指令节点
 *
 * on-click="submit"  name 是 event, subName 是 click，value 是 submit
 *
 * @param {string} name 指令名
 * @param {?string} subName 指令子名
 * @param {?*} value 指令值
 */

var Directive = function (_Node) {
  inherits(Directive, _Node);

  function Directive(options) {
    classCallCheck(this, Directive);

    var _this = possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this, DIRECTIVE, !has$2(options, 'value')));

    extend(_this, options);
    return _this;
  }

  createClass(Directive, [{
    key: 'render',
    value: function render(data) {
      return new Directive({
        name: this.name,
        subName: this.subName,
        value: this.renderTexts(data),
        keypath: stringify$1(data.keys)
      });
    }
  }]);
  return Directive;
}(Node);

/**
 * each 节点
 *
 * @param {Expression} expr
 * @param {string} index
 */

var Each = function (_Node) {
  inherits(Each, _Node);

  function Each(options) {
    classCallCheck(this, Each);

    var _this = possibleConstructorReturn(this, (Each.__proto__ || Object.getPrototypeOf(Each)).call(this, EACH$1));

    extend(_this, options);
    return _this;
  }

  createClass(Each, [{
    key: 'render',
    value: function render(data) {

      var instance = this;
      var expr = instance.expr,
          index = instance.index,
          children = instance.children;

      var _instance$renderExpre = instance.renderExpression(data),
          value = _instance$renderExpre.value;

      var iterate = void 0;
      if (array(value)) {
        iterate = each;
      } else if (object(value)) {
        iterate = each$1;
      }

      if (iterate) {
        var _ret = function () {
          data = copy(data);

          var result = [];
          var _data = data,
              context = _data.context,
              keys$$1 = _data.keys;

          var listContext = context.push(value);

          keys$$1.push(normalize(expr.stringify()));

          iterate(value, function (item, i) {
            if (index) {
              listContext.set(index, i);
            }

            keys$$1.push(i);
            listContext.set(SPECIAL_KEYPATH, stringify$1(keys$$1));

            data.context = listContext.push(item);
            push$1(result, instance.renderChildren(data));

            keys$$1.pop();
          });

          keys$$1.pop();

          return {
            v: result
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }
  }]);
  return Each;
}(Node);

/**
 * 元素节点
 *
 * @param {string} name
 * @param {?string} component
 */

var Element = function (_Node) {
  inherits(Element, _Node);

  function Element(options) {
    classCallCheck(this, Element);

    var _this = possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, ELEMENT));

    extend(_this, options);
    if (!array(options.attrs)) {
      _this.attrs = [];
    }
    if (!array(options.directives)) {
      _this.directives = [];
    }
    return _this;
  }

  createClass(Element, [{
    key: 'addChild',
    value: function addChild(child) {
      var children = void 0;
      if (child.type === ATTRIBUTE) {
        children = this.attrs;
      } else if (child.type === DIRECTIVE) {
        children = this.directives;
      } else {
        children = this.children;
      }
      children.push(child);
    }
  }, {
    key: 'render',
    value: function render(data) {
      return new Element({
        name: this.name,
        component: this.component,
        children: this.renderChildren(data),
        attrs: this.renderChildren(data, this.attrs),
        directives: this.renderChildren(data, this.directives)
      });
    }
  }]);
  return Element;
}(Node);

/**
 * else 节点
 */

var Else = function (_Node) {
  inherits(Else, _Node);

  function Else() {
    classCallCheck(this, Else);
    return possibleConstructorReturn(this, (Else.__proto__ || Object.getPrototypeOf(Else)).call(this, ELSE$1));
  }

  createClass(Else, [{
    key: 'render',
    value: function render(data) {
      return this.renderChildren(data);
    }
  }]);
  return Else;
}(Node);

/**
 * else if 节点
 *
 * @param {Expression} expr 判断条件
 */

var ElseIf = function (_Node) {
  inherits(ElseIf, _Node);

  function ElseIf(options) {
    classCallCheck(this, ElseIf);

    var _this = possibleConstructorReturn(this, (ElseIf.__proto__ || Object.getPrototypeOf(ElseIf)).call(this, ELSE_IF$1));

    extend(_this, options);
    return _this;
  }

  createClass(ElseIf, [{
    key: 'render',
    value: function render(data) {
      return this.renderCondition(data);
    }
  }]);
  return ElseIf;
}(Node);

/**
 * 文本节点
 *
 * @param {*} content
 * @param {boolean} safe 是否安全渲染，即是否转义
 */

var Text = function (_Node) {
  inherits(Text, _Node);

  function Text(options) {
    classCallCheck(this, Text);

    var _this = possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, TEXT, FALSE));

    extend(_this, options);
    return _this;
  }

  createClass(Text, [{
    key: 'render',
    value: function render(data) {
      return new Text({
        content: this.content,
        safe: this.safe,
        keypath: stringify$1(data.keys)
      });
    }
  }]);
  return Text;
}(Node);

/**
 * 表达式节点
 *
 * @param {string} expr
 * @param {boolean} safe
 */

var Expression = function (_Node) {
  inherits(Expression, _Node);

  function Expression(options) {
    classCallCheck(this, Expression);

    var _this = possibleConstructorReturn(this, (Expression.__proto__ || Object.getPrototypeOf(Expression)).call(this, EXPRESSION, FALSE));

    extend(_this, options);
    return _this;
  }

  createClass(Expression, [{
    key: 'render',
    value: function render(data) {
      var _renderExpression = this.renderExpression(data),
          value = _renderExpression.value;

      if (func(value) && value.$computed) {
        value = value();
      }

      return new Text({
        content: value,
        safe: this.safe,
        keypath: stringify$1(data.keys)
      });
    }
  }]);
  return Expression;
}(Node);

/**
 * if 节点
 *
 * @param {Expression} expr 判断条件
 */

var If = function (_Node) {
  inherits(If, _Node);

  function If(options) {
    classCallCheck(this, If);

    var _this = possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).call(this, IF$1));

    extend(_this, options);
    return _this;
  }

  createClass(If, [{
    key: 'render',
    value: function render(data) {
      return this.renderCondition(data);
    }
  }]);
  return If;
}(Node);

/**
 * import 节点
 *
 * @param {string} name
 */

var Import = function (_Node) {
  inherits(Import, _Node);

  function Import(options) {
    classCallCheck(this, Import);

    var _this = possibleConstructorReturn(this, (Import.__proto__ || Object.getPrototypeOf(Import)).call(this, IMPORT$1, FALSE));

    extend(_this, options);
    return _this;
  }

  createClass(Import, [{
    key: 'render',
    value: function render(data) {
      var partial = data.partial(this.name);
      if (partial.type === ELEMENT) {
        return partial.render(data);
      } else if (partial.type === PARTIAL$1) {
        return this.renderChildren(data, partial.children);
      }
    }
  }]);
  return Import;
}(Node);

/**
 * Partial 节点
 *
 * @param {string} name
 */

var Partial = function (_Node) {
  inherits(Partial, _Node);

  function Partial(options) {
    classCallCheck(this, Partial);

    var _this = possibleConstructorReturn(this, (Partial.__proto__ || Object.getPrototypeOf(Partial)).call(this, PARTIAL$1));

    extend(_this, options);
    return _this;
  }

  createClass(Partial, [{
    key: 'render',
    value: function render(data) {
      data.partial(this.name, this);
    }
  }]);
  return Partial;
}(Node);

/**
 * 延展操作 节点
 *
 * @param {Expression} expr
 */

var Spread = function (_Node) {
  inherits(Spread, _Node);

  function Spread(options) {
    classCallCheck(this, Spread);

    var _this = possibleConstructorReturn(this, (Spread.__proto__ || Object.getPrototypeOf(Spread)).call(this, SPREAD$1, FALSE));

    extend(_this, options);
    return _this;
  }

  createClass(Spread, [{
    key: 'render',
    value: function render(data) {
      var _renderExpression = this.renderExpression(data),
          value = _renderExpression.value;

      if (object(value)) {
        var _ret = function () {
          var result = [],
              keypath = stringify$1(data.keys);
          each$1(value, function (value, name) {
            result.push(new Attribute({
              name: name,
              value: value,
              keypath: keypath
            }));
          });
          return {
            v: result
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
      }
    }
  }]);
  return Spread;
}(Node);

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
 * 懒得说各种细节错误，表达式都输出了看不出原因我也没办法
 *
 * @param {string} expression
 */
function parseError$1(expression) {
  error$1('Failed to parse expression: [' + expression + '].');
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

/**
 * 节点基类
 */
var Node$2 = function Node$2(type) {
  classCallCheck(this, Node$2);

  this.type = type;
};

/**
 * Unary 节点
 *
 * @param {string} operator
 * @param {Node} arg
 */

var Unary = function (_Node) {
  inherits(Unary, _Node);

  function Unary(options) {
    classCallCheck(this, Unary);

    var _this = possibleConstructorReturn(this, (Unary.__proto__ || Object.getPrototypeOf(Unary)).call(this, UNARY));

    extend(_this, options);
    return _this;
  }

  createClass(Unary, [{
    key: 'stringify',
    value: function stringify() {
      var operator = this.operator,
          arg = this.arg;

      return '' + operator + arg.stringify();
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var operator = this.operator,
          arg = this.arg;

      var _arg$execute = arg.execute(context),
          value = _arg$execute.value,
          deps = _arg$execute.deps;

      return {
        value: OPERATOR[operator](value),
        deps: deps
      };
    }
  }]);
  return Unary;
}(Node$2);

var OPERATOR = {};
OPERATOR[Unary.PLUS = '+'] = function (value) {
  return +value;
};
OPERATOR[Unary.MINUS = '-'] = function (value) {
  return -value;
};
OPERATOR[Unary.BANG = '!'] = function (value) {
  return !value;
};
OPERATOR[Unary.WAVE = '~'] = function (value) {
  return ~value;
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

  function Binary(options) {
    classCallCheck(this, Binary);

    var _this = possibleConstructorReturn(this, (Binary.__proto__ || Object.getPrototypeOf(Binary)).call(this, BINARY));

    extend(_this, options);
    return _this;
  }

  createClass(Binary, [{
    key: 'stringify',
    value: function stringify() {
      var left = this.left,
          operator = this.operator,
          right = this.right;

      return left.stringify() + ' ' + operator + ' ' + right.stringify();
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var left = this.left,
          operator = this.operator,
          right = this.right;

      left = left.execute(context);
      right = right.execute(context);
      return {
        value: OPERATOR$1[operator](left.value, right.value),
        deps: extend(left.deps, right.deps)
      };
    }
  }]);
  return Binary;
}(Node$2);

var OPERATOR$1 = {};
OPERATOR$1[Binary.OR = '||'] = function (a, b) {
  return a || b;
};
OPERATOR$1[Binary.AND = '&&'] = function (a, b) {
  return a && b;
};
OPERATOR$1[Binary.SE = '==='] = function (a, b) {
  return a === b;
};
OPERATOR$1[Binary.SNE = '!=='] = function (a, b) {
  return a !== b;
};
OPERATOR$1[Binary.LE = '=='] = function (a, b) {
  return a == b;
};
OPERATOR$1[Binary.LNE = '!='] = function (a, b) {
  return a != b;
};
OPERATOR$1[Binary.LT = '<'] = function (a, b) {
  return a < b;
};
OPERATOR$1[Binary.LTE = '<='] = function (a, b) {
  return a <= b;
};
OPERATOR$1[Binary.GT = '>'] = function (a, b) {
  return a > b;
};
OPERATOR$1[Binary.GTE = '>='] = function (a, b) {
  return a >= b;
};
OPERATOR$1[Binary.PLUS = '+'] = function (a, b) {
  return a + b;
};
OPERATOR$1[Binary.MINUS = '-'] = function (a, b) {
  return a - b;
};
OPERATOR$1[Binary.MULTIPLY = '*'] = function (a, b) {
  return a * b;
};
OPERATOR$1[Binary.DIVIDE = '/'] = function (a, b) {
  return a / b;
};
OPERATOR$1[Binary.MODULO = '%'] = function (a, b) {
  return a % b;
};

// 一元操作符
var unaryMap = {};

unaryMap[Unary.PLUS] = unaryMap[Unary.MINUS] = unaryMap[Unary.BANG] = unaryMap[Unary.WAVE] = TRUE;

var unaryList = sortKeys(unaryMap);

// 二元操作符
// 操作符和对应的优先级，数字越大优先级越高
var binaryMap = {};

binaryMap[Binary.OR] = 1;

binaryMap[Binary.AND] = 2;

binaryMap[Binary.LE] = binaryMap[Binary.LNE] = binaryMap[Binary.SE] = binaryMap[Binary.SNE] = 3;

binaryMap[Binary.LT] = binaryMap[Binary.LTE] = binaryMap[Binary.GT] = binaryMap[Binary.GTE] = 4;

binaryMap[Binary.PLUS] = binaryMap[Binary.MINUS] = 5;

binaryMap[Binary.MULTIPLY] = binaryMap[Binary.DIVIDE] = binaryMap[Binary.MODULO] = 6;

var binaryList = sortKeys(binaryMap);

/**
 * Array 节点
 *
 * @param {Array.<Node>} elements
 */

var Array$1 = function (_Node) {
  inherits(Array, _Node);

  function Array(options) {
    classCallCheck(this, Array);

    var _this = possibleConstructorReturn(this, (Array.__proto__ || Object.getPrototypeOf(Array)).call(this, ARRAY));

    extend(_this, options);
    return _this;
  }

  createClass(Array, [{
    key: 'stringify',
    value: function stringify() {
      var elements = this.elements;

      elements = elements.map(function (element) {
        return element.stringify();
      });
      return '[' + elements.join(', ') + ']';
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var value = [],
          deps = {};
      each(this.elements, function (node) {
        var result = node.execute(context);
        value.push(result.value);
        extend(deps, result.deps);
      });
      return { value: value, deps: deps };
    }
  }]);
  return Array;
}(Node$2);

/**
 * Call 节点
 *
 * @param {Node} callee
 * @param {Array.<Node>} args
 */

var Call = function (_Node) {
  inherits(Call, _Node);

  function Call(options) {
    classCallCheck(this, Call);

    var _this = possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this, CALL));

    extend(_this, options);
    return _this;
  }

  createClass(Call, [{
    key: 'stringify',
    value: function stringify() {
      var callee = this.callee,
          args = this.args;

      args = args.map(function (arg) {
        return arg.stringify();
      });
      return callee.stringify() + '(' + args.join(', ') + ')';
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var callee = this.callee,
          args = this.args;

      var _callee$execute = callee.execute(context),
          value = _callee$execute.value,
          deps = _callee$execute.deps;

      return {
        value: _execute(value, NULL, args.map(function (arg) {
          var result = arg.execute(context);
          extend(deps, result.deps);
          return result.value;
        })),
        deps: deps
      };
    }
  }]);
  return Call;
}(Node$2);

/**
 * Conditional 节点
 *
 * @param {Node} test
 * @param {Node} consequent
 * @param {Node} alternate
 */

var Conditional = function (_Node) {
  inherits(Conditional, _Node);

  function Conditional(options) {
    classCallCheck(this, Conditional);

    var _this = possibleConstructorReturn(this, (Conditional.__proto__ || Object.getPrototypeOf(Conditional)).call(this, CONDITIONAL));

    extend(_this, options);
    return _this;
  }

  createClass(Conditional, [{
    key: 'stringify',
    value: function stringify() {
      var test = this.test,
          consequent = this.consequent,
          alternate = this.alternate;

      return test.stringify() + ' ? ' + consequent.stringify() + ' : ' + alternate.stringify();
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var test = this.test,
          consequent = this.consequent,
          alternate = this.alternate;

      test = test.execute(context);
      if (test.value) {
        consequent = consequent.execute(context);
        return {
          value: consequent.value,
          deps: extend(test.deps, consequent.deps)
        };
      } else {
        alternate = alternate.execute(context);
        return {
          value: alternate.value,
          deps: extend(test.deps, alternate.deps)
        };
      }
    }
  }]);
  return Conditional;
}(Node$2);

/**
 * Identifier 节点
 *
 * @param {string} name
 */

var Identifier = function (_Node) {
  inherits(Identifier, _Node);

  function Identifier(options) {
    classCallCheck(this, Identifier);

    var _this = possibleConstructorReturn(this, (Identifier.__proto__ || Object.getPrototypeOf(Identifier)).call(this, IDENTIFIER));

    extend(_this, options);
    return _this;
  }

  createClass(Identifier, [{
    key: 'stringify',
    value: function stringify() {
      return this.name;
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var deps = {};

      var _context$get = context.get(this.name),
          value = _context$get.value,
          keypath = _context$get.keypath;

      deps[keypath] = value;
      return { value: value, deps: deps };
    }
  }]);
  return Identifier;
}(Node$2);

/**
 * Literal 节点
 *
 * @param {string} value
 */

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(options) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this, LITERAL));

    extend(_this, options);
    return _this;
  }

  createClass(Literal, [{
    key: 'stringify',
    value: function stringify() {
      var value = this.value;

      if (string(value)) {
        return value.indexOf('"') >= 0 ? '\'' + value + '\'' : '"' + value + '"';
      }
      return value;
    }
  }, {
    key: 'execute',
    value: function execute() {
      return {
        value: this.value,
        deps: {}
      };
    }
  }]);
  return Literal;
}(Node$2);

/**
 * Member 节点
 *
 * @param {Identifier} object
 * @param {Node} property
 */

var Member = function (_Node) {
  inherits(Member, _Node);

  function Member(options) {
    classCallCheck(this, Member);

    var _this = possibleConstructorReturn(this, (Member.__proto__ || Object.getPrototypeOf(Member)).call(this, MEMBER));

    extend(_this, options);
    return _this;
  }

  createClass(Member, [{
    key: 'flatten',
    value: function flatten() {
      var result = [];

      var current = this,
          next = void 0;
      do {
        next = current.object;
        if (current.type === MEMBER) {
          result.unshift(current.property);
        } else {
          result.unshift(current);
        }
      } while (current = next);

      return result;
    }
  }, {
    key: 'stringify',
    value: function stringify(list) {
      return this.flatten().map(function (node, index) {
        if (node.type === LITERAL) {
          var _node = node,
              value = _node.value;

          return numeric(value) ? '[' + value + ']' : '.' + value;
        } else {
          node = node.stringify();
          return index > 0 ? '[' + node + ']' : node;
        }
      }).join('');
    }
  }, {
    key: 'execute',
    value: function execute(context) {

      var deps = {},
          keys$$1 = [];

      each(this.flatten(), function (node, index) {
        var type = node.type;

        if (type !== LITERAL) {
          if (index > 0) {
            var result = node.execute(context);
            extend(deps, result.deps);
            keys$$1.push(result.value);
          } else if (type === IDENTIFIER) {
            keys$$1.push(node.name);
          }
        } else {
          keys$$1.push(node.value);
        }
      });

      var _context$get = context.get(stringify$1(keys$$1)),
          value = _context$get.value,
          keypath = _context$get.keypath;

      deps[keypath] = value;

      return { value: value, deps: deps };
    }
  }]);
  return Member;
}(Node$2);

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
var keyword = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED
};

// 编译结果缓存
var cache$1 = {};

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
  var getCharCode = function getCharCode(i) {
    return charCodeAt(content, i != NULL ? i : index);
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
      if (getCharCode(index - 1) === quote) {
        closed = TRUE;
        break;
      }
    }
    if (!closed) {
      return parseError$1(content);
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

    return new Literal({
      value: parseFloat(content.substring(start, index))
    });
  };

  var parseString = function parseString() {

    var start = index;

    skipString();

    return new Literal({
      value: content.substring(start + 1, index - 1)
    });
  };

  var parseIdentifier = function parseIdentifier() {

    var start = index;
    skipIdentifier();

    value = content.substring(start, index);
    if (keyword[value]) {
      return new Literal({
        value: keyword[value]
      });
    }

    // this 也视为 IDENTIFIER
    if (value) {
      return new Identifier({
        name: value
      });
    }

    parseError$1(content);
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
        args.push(parseExpression());
      }
    }

    if (closed) {
      return args;
    }

    parseError$1(content);
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
        value = new Call({
          callee: value,
          args: parseTuple(CPAREN)
        });
        break;
      } else {
        // a.x
        if (charCode === PERIOD) {
          index++;
          value = new Member({
            object: value,
            property: new Literal({
              value: parseIdentifier().name
            })
          });
        }
        // a[x]
        else if (charCode === OBRACK) {
            index++;
            value = new Member({
              object: value,
              property: parseSubexpression(CBRACK)
            });
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
          return new Array$1({
            elements: parseTuple(CBRACK)
          });
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
    parseError$1(content);
  };

  var parseUnary = function parseUnary(op) {
    value = parseToken();
    if (value) {
      return new Unary({
        operator: op,
        arg: value
      });
    }
    parseError$1(content);
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
        stack.push(new Binary({
          right: stack.pop(),
          operator: (stack.pop(), stack.pop()),
          left: stack.pop()
        }));
      }

      right = parseToken();
      if (right) {
        stack.push(op, binaryMap[op], right);
      } else {
        parseError$1(content);
      }
    }

    // 处理右边
    // 右边只有等到所有 token 解析完成才能开始
    // 比如 a + b * c / d
    // 此时右边的优先级 >= 左边的优先级，因此可以脑残的直接逆序遍历

    right = stack.pop();
    while (stack.length > 1) {
      right = new Binary({
        right: right,
        operator: (stack.pop(), stack.pop()),
        left: stack.pop()
      });
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
    parseError$1(content);
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
        return new Conditional({
          test: test,
          consequent: consequent,
          alternate: alternate
        });
      } else {
        parseError$1(content);
      }
    }

    return test;
  };

  return cache$1[content] = parseExpression();
}

var cache = {};

var openingDelimiterPattern = new RegExp(DELIMITER_OPENING);
var closingDelimiterPattern = new RegExp(DELIMITER_CLOSING);

var elementPattern = /<(?:\/)?[-a-z]\w*/i;
var elementEndPattern = /(?:\/)?>/;

var attributePattern = /([-:@a-z0-9]+)(=["'])?/i;

var componentNamePattern = /[-A-Z]/;
var selfClosingTagNamePattern = /input|img|br/i;

var ERROR_PARTIAL_NAME = 'Expected legal partial name';
var ERROR_EXPRESSION = 'Expected expression';

var parsers = [{
  test: function test(source) {
    return source.startsWith(EACH);
  },
  create: function create(source) {
    var terms = source.slice(EACH.length).trim().split(':');
    var expr = compile$1(terms[0]);
    var index = void 0;
    if (terms[1]) {
      index = terms[1].trim();
    }
    return new Each({ expr: expr, index: index });
  }
}, {
  test: function test(source) {
    return source.startsWith(IMPORT);
  },
  create: function create(source) {
    var name = source.slice(IMPORT.length).trim();
    return name ? new Import({ name: name }) : ERROR_PARTIAL_NAME;
  }
}, {
  test: function test(source) {
    return source.startsWith(PARTIAL);
  },
  create: function create(source) {
    var name = source.slice(PARTIAL.length).trim();
    return name ? new Partial({ name: name }) : ERROR_PARTIAL_NAME;
  }
}, {
  test: function test(source) {
    return source.startsWith(IF);
  },
  create: function create(source) {
    var expr = source.slice(IF.length).trim();
    return expr ? new If({ expr: compile$1(expr) }) : ERROR_EXPRESSION;
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE_IF);
  },
  create: function create(source, popStack) {
    var expr = source.slice(ELSE_IF.length);
    if (expr) {
      popStack();
      return new ElseIf({ expr: compile$1(expr) });
    }
    return ERROR_EXPRESSION;
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE);
  },
  create: function create(source, popStack) {
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
      return new Spread({ expr: compile$1(expr) });
    }
    return ERROR_EXPRESSION;
  }
}, {
  test: function test(source) {
    return !source.startsWith(COMMENT);
  },
  create: function create(source) {
    var safe = TRUE;
    if (source.startsWith('{')) {
      safe = FALSE;
      source = source.slice(1);
    }
    return new Expression({
      expr: compile$1(source),
      safe: safe
    });
  }
}];

var LEVEL_ELEMENT = 0;
var LEVEL_ATTRIBUTE = 1;
var LEVEL_TEXT = 2;

var buildInDirectives = {};
buildInDirectives[DIRECTIVE_REF] = buildInDirectives[DIRECTIVE_LAZY] = buildInDirectives[DIRECTIVE_MODEL] = buildInDirectives[KEYWORD_UNIQUE] = TRUE;

/**
 * 把抽象语法树渲染成 Virtual DOM
 *
 * @param {Object} ast
 * @param {Object} data
 * @return {Object}
 */
function render$1(ast, data, partial) {

  var deps = {};

  return {
    root: ast.render({
      keys: [],
      context: new Context(data),
      partial: partial,
      addDeps: function addDeps(childrenDeps) {
        extend(deps, childrenDeps);
      }
    }),
    deps: deps
  };
}

/**
 * 把模板编译为抽象语法树
 *
 * @param {string} template
 * @return {Object}
 */
function compile$$1(template) {

  if (cache[template]) {
    return cache[template];
  }

  var name = void 0,
      quote = void 0,
      content = void 0,
      isSelfClosing = void 0,
      match = void 0;

  var mainScanner = new Scanner(template);
  var helperScanner = new Scanner();

  // level 有三级
  // 0 表示可以 add Element 和 Text
  // 1 表示只能 add Attribute 和 Directive
  // 2 表示只能 add Text

  var level = LEVEL_ELEMENT,
      levelNode = void 0;

  var nodeStack = [];
  var rootNode = new Element({ name: 'root' });
  var currentNode = rootNode;

  var pushStack = function pushStack(node) {
    nodeStack.push(currentNode);
    currentNode = node;
  };

  var popStack = function popStack() {
    currentNode = nodeStack.pop();
    return currentNode;
  };

  var addChild = function addChild(node) {
    var type = node.type,
        content = node.content,
        children = node.children;


    if (type === TEXT) {
      if (content = trimBreakline(content)) {
        node.content = content;
      } else {
        return;
      }
    }

    if (node.invalid !== TRUE) {
      currentNode.addChild(node);
    }

    if (children) {
      pushStack(node);
    }
  };

  var parseAttributeValue = function parseAttributeValue(content) {
    match = matchByQuote(content, quote);
    if (match) {
      addChild(new Text({
        content: match
      }));
    }
    var _match = match,
        length = _match.length;

    if (content.charAt(length) === quote) {
      popStack();
      level--;
      length++;
    }
    if (length) {
      content = content.slice(length);
    }
    return content;
  };

  // 核心函数，负责分隔符和普通字符串的深度解析
  var parseContent = function parseContent(content) {
    helperScanner.init(content);
    while (helperScanner.hasNext()) {

      // 分隔符之前的内容
      content = helperScanner.nextBefore(openingDelimiterPattern);
      helperScanner.nextAfter(openingDelimiterPattern);

      if (content) {

        // 支持以下 8 种写法：
        // 1. name
        // 2. name="value"
        // 3. name="{{value}}"
        // 4. name="prefix{{value}}suffix"
        // 5. {{name}}
        // 6. {{name}}="value"
        // 7. {{name}}="{{value}}"
        // 8. {{name}}="prefix{{value}}suffix"

        // 已开始解析 ATTRIBUTE 或 DIRECTIVE
        // 表示至少已经有了 name
        if (level === LEVEL_TEXT) {
          // 命中 8 种写法中的 3 4
          // 因为前面处理过 {{ }}，所以 levelNode 必定有 child
          if (levelNode.children.length) {
            content = parseAttributeValue(content);
          } else {
            // 命中 8 种写法中的 6 7 8
            if (content.charAt(0) === '=') {
              quote = content.charAt(1);
              content = content.slice(2);
            }
            // 命中 8 种写法中的 5
            else {
                popStack();
                level--;
              }
            // 8 种写法中的 1 2 在下面的 if 会一次性处理完，逻辑走不进这里
          }
        }

        if (level === LEVEL_ATTRIBUTE) {
          // 下一个属性的开始
          while (content && (match = attributePattern.exec(content))) {
            content = content.slice(match.index + match[0].length);
            name = match[1];

            if (buildInDirectives[name]) {
              levelNode = new Directive({ name: name });
            } else {
              if (name.startsWith(DIRECTIVE_EVENT_PREFIX)) {
                name = name.slice(DIRECTIVE_EVENT_PREFIX.length);
                if (name) {
                  levelNode = new Directive({ name: 'event', subName: name });
                }
              } else if (name.startsWith(DIRECTIVE_PREFIX)) {
                name = name.slice(DIRECTIVE_PREFIX.length);
                levelNode = new Directive({ name: name });
                if (!name || buildInDirectives[name]) {
                  levelNode.invalid = TRUE;
                }
              } else {
                levelNode = new Attribute({ name: name });
              }
            }

            addChild(levelNode);
            level++;

            match = match[2];
            if (match) {
              quote = match.charAt(1);
              content = parseAttributeValue(content);
            } else {
              popStack();
              level--;
            }
          }
        } else if (content) {
          addChild(new Text({ content: content }));
        }
      }

      // 分隔符之间的内容
      content = helperScanner.nextBefore(closingDelimiterPattern);
      helperScanner.nextAfter(closingDelimiterPattern);

      if (content) {
        if (content.charAt(0) === '/') {
          popStack();
        } else {
          if (content.charAt(0) === '{' && helperScanner.charAt(0) === '}') {
            helperScanner.forward(1);
          }
          each(parsers, function (parser, index) {
            if (parser.test(content)) {
              // 用 index 节省一个变量定义
              index = parser.create(content, popStack);
              if (string(index)) {
                parseError(template, index, mainScanner.pos + helperScanner.pos);
              } else if (level === LEVEL_ATTRIBUTE && index.type === EXPRESSION) {
                levelNode = new Attribute({ name: index });
                level++;
                addChild(levelNode);
              } else {
                addChild(index);
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
    if (mainScanner.charAt(0) !== '<') {
      break;
    }

    // 结束标签
    if (mainScanner.charAt(1) === '/') {
      // 取出 </tagName
      content = mainScanner.nextAfter(elementPattern);
      name = content.slice(2);

      // 没有匹配到 >
      if (mainScanner.charAt(0) !== '>') {
        return parseError(template, 'Illegal tag name', mainScanner.pos);
      } else if (currentNode.type === ELEMENT && name !== currentNode.name) {
        return parseError(template, 'Unexpected closing tag', mainScanner.pos);
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
          // 低版本浏览器不支持自定义标签，需要转成 div
          addChild(new Element({
            name: 'div',
            component: name
          }));
          isSelfClosing = TRUE;
        } else {
          addChild(new Element({ name: name }));
          isSelfClosing = selfClosingTagNamePattern.test(name);
        }

        // 截取 <name 和 > 之间的内容
        // 用于提取 Attribute 和 Directive
        content = mainScanner.nextBefore(elementEndPattern);
        if (content) {
          level++;
          parseContent(content);
          level--;
        }

        content = mainScanner.nextAfter(elementEndPattern);
        // 没有匹配到 > 或 />
        if (!content) {
          return parseError(template, 'Illegal tag name', mainScanner.pos);
        }

        if (isSelfClosing) {
          popStack();
        }
      }
  }

  if (nodeStack.length) {
    return parseError(template, 'Missing end tag (</' + nodeStack[0].name + '>)', mainScanner.pos);
  }

  var children = rootNode.children;

  if (children.length > 1) {
    error$1('Component template should contain exactly one root element.');
  }

  return cache[template] = children[0];
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

var component$1 = new Store();
var directive = new Store();
var filter = new Store();
var partial = new Store();

var registry = Object.freeze({
	component: component$1,
	directive: directive,
	filter: filter,
	partial: partial
});

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

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var attrRE = /([\w-]+)|(['"])(.*?)\2/g;

// create optimized lookup object for
// void elements as listed here:
// http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
var lookup = Object.create ? Object.create(null) : {};
lookup.area = true;
lookup.base = true;
lookup.br = true;
lookup.col = true;
lookup.embed = true;
lookup.hr = true;
lookup.img = true;
lookup.input = true;
lookup.keygen = true;
lookup.link = true;
lookup.menuitem = true;
lookup.meta = true;
lookup.param = true;
lookup.source = true;
lookup.track = true;
lookup.wbr = true;

var parseTag$1 = function (tag) {
    var i = 0;
    var key;
    var res = {
        type: 'tag',
        name: '',
        voidElement: false,
        attrs: {},
        children: []
    };

    tag.replace(attrRE, function (match) {
        if (i % 2) {
            key = match;
        } else {
            if (i === 0) {
                if (lookup[match] || tag.charAt(tag.length - 2) === '/') {
                    res.voidElement = true;
                }
                res.name = match;
            } else {
                res.attrs[key] = match.replace(/^['"]|['"]$/g, '');
            }
        }
        i++;
    });

    return res;
};

/*jshint -W030 */
var tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;
var parseTag = parseTag$1;
// re-used obj for quick lookups of components
var empty = Object.create ? Object.create(null) : {};
// common logic for pushing a child node onto a list
function pushTextNode(list, html, start) {
    // calculate correct end of the content slice in case there's
    // no tag after the text node.
    var end = html.indexOf('<', start);
    var content = html.slice(start, end === -1 ? undefined : end);
    // if a node is nothing but whitespace, no need to add it.
    if (!/^\s*$/.test(content)) {
        list.push({
            type: 'text',
            content: content
        });
    }
}

var parse$2 = function parse$2(html, options) {
    options || (options = {});
    options.components || (options.components = empty);
    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var byTag = {};
    var inComponent = false;

    html.replace(tagRE, function (tag, index) {
        if (inComponent) {
            if (tag !== '</' + current.name + '>') {
                return;
            } else {
                inComponent = false;
            }
        }

        var isOpen = tag.charAt(1) !== '/';
        var isComment = tag.indexOf('<!--') === 0;
        var start = index + tag.length;
        var nextChar = html.charAt(start);
        var parent;

        if (isOpen && !isComment) {
            level++;

            current = parseTag(tag);
            if (current.type === 'tag' && options.components[current.name]) {
                current.type = 'component';
                inComponent = true;
            }

            if (!current.voidElement && !inComponent && nextChar && nextChar !== '<') {
                pushTextNode(current.children, html, start);
            }

            byTag[current.tagName] = current;

            // if we're at root, push new base node
            if (level === 0) {
                result.push(current);
            }

            parent = arr[level - 1];

            if (parent) {
                parent.children.push(current);
            }

            arr[level] = current;
        }

        if (isComment || !isOpen || current.voidElement) {
            if (!isComment) {
                level--;
            }
            if (!inComponent && nextChar !== '<' && nextChar) {
                // trailing text node
                // if we're at the root, push a base text node. otherwise add as
                // a child to the current node.
                parent = level === -1 ? result : arr[level].children;
                pushTextNode(parent, html, start);
            }
        }
    });

    return result;
};

var utils = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createTextVNode = createTextVNode;
exports.transformName = transformName;
exports.unescapeEntities = unescapeEntities;

var _vnode = vnode;

var _vnode2 = _interopRequireDefault(_vnode);

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function createTextVNode(text, context) {
    return (0, _vnode2.default)(undefined, undefined, undefined, unescapeEntities(text, context));
}

function transformName(name) {
    // Replace -a with A to help camel case style property names.
    name = name.replace(/-(\w)/g, function _replace($1, $2) {
        return $2.toUpperCase();
    });
    // Handle properties that start with a -.
    var firstChar = name.charAt(0).toLowerCase();
    return '' + firstChar + name.substring(1);
}

// Regex for matching HTML entities.
var entityRegex = new RegExp('&[a-z0-9]+;', 'gi');
// Element for setting innerHTML for transforming entities.
var el = null;

function unescapeEntities(text, context) {
    // Create the element using the context if it doesn't exist.
    if (!el) {
        el = context.createElement('div');
    }
    return text.replace(entityRegex, function (entity) {
        el.innerHTML = entity;
        return el.textContent;
    });
}
});

var strings$1 = createCommonjsModule(function (module, exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function (html) {
    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    var context = options.context || document;

    // If there's nothing here, return null;
    if (!html) {
        return null;
    }

    // Maintain a list of created vnodes so we can call the create hook.
    var createdVNodes = [];

    // Parse the string into the AST and convert to VNodes.
    var vnodes = convertNodes((0, _parse2.default)(html), createdVNodes, context);

    var res = void 0;
    if (!vnodes) {
        // If there are no vnodes but there is string content, then the string
        // must be just text or at least invalid HTML that we should treat as
        // text (since the AST parser didn't find any well-formed HTML).
        res = toVNode({ type: 'text', content: html }, createdVNodes, context);
    } else if (vnodes.length === 1) {
        // If there's only one root node, just return it as opposed to an array.
        res = vnodes[0];
    } else {
        // Otherwise we have an array of VNodes, which we should return.
        res = vnodes;
    }

    // Call the 'create' hook for each created node.
    options.hooks && options.hooks.create && createdVNodes.forEach(function (node) {
        options.hooks.create(node);
    });
    return res;
};

var _parse = parse$2;

var _parse2 = _interopRequireDefault(_parse);

var _h = h;

var _h2 = _interopRequireDefault(_h);

var _utils = utils;

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
    } else {
        obj[key] = value;
    }return obj;
}

function convertNodes(nodes, createdVNodes, context) {
    if (nodes instanceof Array && nodes.length > 0) {
        return nodes.map(function (node) {
            return toVNode(node, createdVNodes, context);
        });
    } else {
        return undefined;
    }
}

function toVNode(node, createdVNodes, context) {
    var newNode = void 0;
    if (node.type === 'text') {
        newNode = (0, _utils.createTextVNode)(node.content, context);
    } else {
        newNode = (0, _h2.default)(node.name, buildVNodeData(node, context), convertNodes(node.children, createdVNodes, context));
    }
    createdVNodes.push(newNode);
    return newNode;
}

function buildVNodeData(node, context) {
    var data = {};
    if (!node.attrs) {
        return data;
    }

    var attrs = Object.keys(node.attrs).reduce(function (memo, name) {
        if (name !== 'style' && name !== 'class') {
            var val = (0, _utils.unescapeEntities)(node.attrs[name], context);
            memo ? memo[name] = val : memo = _defineProperty({}, name, val);
        }
        return memo;
    }, null);
    if (attrs) {
        data.attrs = attrs;
    }

    var style = parseStyle(node);
    if (style) {
        data.style = style;
    }

    var classes = parseClass(node);
    if (classes) {
        data.class = classes;
    }

    return data;
}

function parseStyle(node) {
    try {
        return node.attrs.style.split(';').reduce(function (memo, styleProp) {
            var res = styleProp.split(':');
            var name = (0, _utils.transformName)(res[0].trim());
            if (name) {
                var val = res[1].replace('!important', '').trim();
                memo ? memo[name] = val : memo = _defineProperty({}, name, val);
            }
            return memo;
        }, null);
    } catch (e) {
        return null;
    }
}

function parseClass(node) {
    try {
        return node.attrs.class.split(' ').reduce(function (memo, className) {
            className = className.trim();
            if (className) {
                memo ? memo[className] = true : memo = _defineProperty({}, className, true);
            }
            return memo;
        }, null);
    } catch (e) {
        return null;
    }
}
});

var strings = strings$1;

function addListener(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function removeListener(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

function createEvent(event) {
  return event;
}

function findElement(selector, context) {
  return (context || doc).querySelector(selector);
}

function find(selector, context) {
  return findElement(selector, context);
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
      e = new Event(createEvent(e, element));
      $emitter.fire(e.type, e, context);
    };
    $emitter[type] = nativeListener;
    addListener(element, type, nativeListener);
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
      removeListener(element, type, $emitter[type]);
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

var toString$1 = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

  try {
    return str.toString();
  } catch (e) {
    return defaultValue;
  }
};

var patch = snabbdom.init([attributes, style]);

function create$1(root, instance) {

  var counter = 0;
  var traverse = function traverse(node, enter, leave) {

    if (enter(node) === FALSE) {
      return;
    }

    var children = [];
    if (array(node.children)) {
      each(node.children, function (item) {
        item = traverse(item, enter, leave);
        if (item != NULL) {
          children.push(item);
        }
      });
    }

    return leave(node, children);
  };

  return traverse(root, function (node) {
    counter++;
    if (node.type === ATTRIBUTE || node.type === DIRECTIVE) {
      return FALSE;
    }
  }, function (node, children) {
    counter--;
    if (node.type === ELEMENT) {
      var _ret = function () {

        var attrs = {},
            directives = [],
            styles = void 0;

        var data = { attrs: attrs };

        // 指令的创建要确保顺序
        // 组件必须第一个执行
        // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
        // 因此 component 必须在 event 指令之前执行

        if (node.component) {
          directives.push({
            node: node,
            name: 'component',
            directive: instance.directive('component')
          });
        } else {
          each(node.attrs, function (node) {
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
              attrs[name] = value;
            }
          });
        }

        each(node.directives, function (node) {
          var name = node.name;

          if (name === KEYWORD_UNIQUE) {
            data.key = node.value;
          } else {
            directives.push({
              name: name,
              node: node,
              directive: instance.directive(name)
            });
          }
        });

        if (styles) {
          data.style = styles;
        }

        if (!counter || directives.length) {
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
                    attrs: attrs,
                    instance: instance
                  });
                }
              });
            };

            var update = function update(oldNode, vnode) {
              if (oldNode.attached) {
                notify(vnode, 'update');
                vnode.attached = TRUE;
              } else {
                notify(oldNode, 'attach');
                oldNode.attached = TRUE;
              }
            };

            data.hook = {
              insert: update,
              postpatch: update,
              destroy: function destroy(vnode) {
                notify(vnode, 'detach');
              }
            };
          })();
        }

        return {
          v: h(node.name, data, children)
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else if (node.type === TEXT) {
      var safe = node.safe,
          content = node.content;

      if (safe || !string(content) || !tag.test(content)) {
        return toString$1(content);
      } else {
        return strings.default(content);
      }
    }
  });
}

/**
 * <Component ref="component" />
 * <input ref="input">
 */

var refDt = {
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
            error$1('Ref ' + value + ' is existed.');
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
            $component.push(setRef);
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
          $component.push(bind);
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
        value.push(el.value);
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

var modelDt = {
  attach: function attach(_ref9) {
    var el = _ref9.el,
        node = _ref9.node,
        instance = _ref9.instance,
        directives = _ref9.directives,
        attrs = _ref9.attrs;
    var value = node.value,
        keypath = node.keypath;


    var result = instance.get(value, keypath);
    if (result) {
      keypath = result.keypath;
    } else {
      error$1('The ' + keypath + ' being used for two-way binding is ambiguous.');
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
      if (!has$2(attrs, 'value')) {
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
      component = _node.component,
      attrs = _node.attrs;

  instance.component(component, function (options) {
    var props = {};
    each(attrs, function (node) {
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

var componentDt = {
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

    _execute(options[BEFORE_CREATE], instance, options);

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
      warn('Passing a `data` option should be a function.');
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$data = props || {};

    // 后放 data
    extend(instance.$data, func(data) ? data.call(instance) : data);

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
              var result = _execute(get$$1, instance);

              var newDeps = deps || instance.$computedStack.pop();
              var oldDeps = instance.$computedDeps[keypath];
              if (newDeps !== oldDeps) {
                updateDeps(instance, newDeps, oldDeps, watcher);
              }

              instance.$computedDeps[keypath] = newDeps;
              $watchCache[keypath] = result;

              return result;
            };
            getter.$binded = getter.$computed = TRUE;
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
      onAdd: function onAdd(added) {
        each(added, function (keypath) {
          if (keypath.indexOf('*') < 0 && !has$2($watchCache, keypath)) {
            $watchCache[keypath] = instance.get(keypath);
          }
        });
      },
      onRemove: function onRemove(removed) {
        each(removed, function (keypath) {
          if (has$2($watchCache, keypath)) {
            delete $watchCache[keypath];
          }
        });
      }
    });
    instance.watch(watchers);

    _execute(options[AFTER_CREATE], instance);

    // 检查 template
    if (string(template)) {
      if (selector.test(template)) {
        template = getContent(template);
      }
      if (!tag.test(template)) {
        error$1('Passing a `template` option must have a root element.');
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
        error$1('Passing a `el` option must be a html element.');
      }
    }

    if (parent) {
      instance.$parent = parent;
    }

    if (methods) {
      (function () {
        var prototype = instance.constructor.prototype;

        each$1(methods, function (fn, name) {
          if (has$2(prototype, name)) {
            error$1('Passing a \'' + name + '\' method is conflicted with built-in methods.');
          }
          instance[name] = fn;
        });
      })();
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
      _execute(options[BEFORE_MOUNT], instance);
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
          keys$$1.push(keypath);
          context = stringify$1(keys$$1);
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
            result.push(keypath);
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

      var model = void 0,
          immediate = void 0;
      if (string(keypath)) {
        model = {};
        model[keypath] = value;
      } else if (object(keypath)) {
        model = copy(keypath);
        immediate = value === TRUE;
      } else {
        return;
      }

      this.updateModel(model, immediate);
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
     * @param {?boolean} noBubble 事件默认冒泡，不冒泡请传 true
     */

  }, {
    key: 'fire',
    value: function fire(type, data, noBubble) {

      if (data === TRUE) {
        noBubble = data;
        data = NULL;
      }

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
      if (done && $parent && !noBubble) {
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
    value: function updateModel(model) {

      var instance = this;

      var $data = instance.$data,
          $computedSetters = instance.$computedSetters;


      each$1(model, function (newValue, key) {
        // 格式化 Keypath
        var keypath = normalize(key);
        if (keypath !== key) {
          delete model[key];
          model[keypath] = newValue;
        }
      });

      each$1(model, function (value, keypath) {
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
        _execute($options[BEFORE_UPDATE], instance);
      }

      var context = {};

      extend(context,
      // 全局过滤器
      filter.data,
      // 本地数据，这意味着 data 也能写函数，只是用 filter 来隔离过滤器
      $data,
      // 本地过滤器
      $filters.data,
      // 本地计算属性
      $computedGetters);

      each$1(context, function (value, key) {
        if (func(value) && !value.$binded) {
          context[key] = value.bind(instance);
        }
      });

      var _viewEnginer$render = render$1($template, context, instance.partial.bind(instance)),
          root = _viewEnginer$render.root,
          deps = _viewEnginer$render.deps;

      instance.$viewDeps = keys(deps);
      updateDeps(instance, instance.$viewDeps, $viewDeps, $viewWatcher);

      var newNode = create$1(root, instance),
          afterHook = void 0;
      if ($currentNode) {
        afterHook = AFTER_UPDATE;
        $currentNode = patch($currentNode, newNode);
      } else {
        afterHook = AFTER_MOUNT;
        $currentNode = patch(arguments[0], newNode);
        instance.$el = $currentNode.elm;
      }

      instance.$currentNode = $currentNode;
      _execute($options[afterHook], instance);
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
      children.push(child);
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
        var _ret3 = function () {
          var ast = compile$1(value);
          if (ast.type === CALL) {
            return {
              v: function v(e) {
                var isEvent = e instanceof Event;
                var args = copy(ast.args);
                if (!args.length) {
                  if (isEvent) {
                    args.push(e);
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
                      name = node.stringify();
                    }

                    var result = instance.get(name, keypath);
                    if (result) {
                      return result.value;
                    }
                  });
                }
                _execute(instance[ast.callee.name], instance, args);
              }
            };
          }
        }();

        if ((typeof _ret3 === 'undefined' ? 'undefined' : _typeof(_ret3)) === "object") return _ret3.v;
      } else {
        return function (event$$1) {
          instance.fire(value, event$$1);
        };
      }
    }

    /**
     * 本地组件的 getter/setter
     *
     * @param {string|Object} id
     * @param {?string|Function} value
     */

  }, {
    key: 'component',
    value: function component(id, value) {

      var callback = void 0;
      if (func(value)) {
        callback = value;
        value = NULL;
      }

      var store = this.$components || (this.$components = new Store());
      magic({
        args: value ? [id, value] : [id],
        get: function get(id) {

          var options = store.get(id),
              fromGlobal = void 0;
          if (!options) {
            options = Yox.component(id);
            fromGlobal = TRUE;
          }

          if (func(options)) {
            (function () {
              var _options2 = options,
                  $pending = _options2.$pending;

              if (!$pending) {
                $pending = options.$pending = [callback];
                options(function (replacement) {
                  delete options.$pending;
                  if (fromGlobal) {
                    Yox.component(id, replacement);
                  } else {
                    store.set(id, replacement);
                  }
                  each($pending, function (callback) {
                    callback(replacement);
                  });
                });
              } else {
                $pending.push(callback);
              }
            })();
          } else if (object(options)) {
            callback(options);
          }
        },
        set: function set(id, value) {
          store.set(id, value);
        }
      });
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


      _execute($options[BEFORE_DESTROY], instance);

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

      _execute($options[AFTER_DESTROY], instance);
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
  }]);
  return Yox;
}();

Yox.version = '0.19.20';

/**
 * 工具，便于扩展、插件使用
 *
 * @type {Object}
 */
Yox.utils = { is: is$1, array: array$1, object: object$1, string: string$1, logger: logger, native: native, Store: Store, Emitter: Emitter, Event: Event };

var prototype = Yox.prototype;

/**
 * 全局/本地注册
 *
 * @param {Object|string} id
 * @param {?Object} value
 */

each(['component', 'directive', 'filter', 'partial'], function (type) {
  if (!has$2(prototype, type)) {
    prototype[type] = function () {
      var prop = '$' + type + 's';
      var store = this[prop] || (this[prop] = new Store());
      return magic({
        args: arguments,
        get: function get(id) {
          return store.get(id) || Yox[type](id);
        },
        set: function set(id, value) {
          store.set(id, value);
        }
      });
    };
  }
  Yox[type] = function () {
    return magic({
      args: arguments,
      get: function get(id) {
        return registry[type].get(id);
      },
      set: function set(id, value) {
        registry[type].set(id, value);
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
            warn('Passing a "' + key + '" prop is not matched.');
          }
        })();
      }
    } else if (required) {
      warn('Passing a "' + key + '" prop is not found.');
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

  var changes = {};

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
Yox.directive({
  ref: refDt,
  event: event,
  model: modelDt,
  component: componentDt
});

return Yox;

})));
