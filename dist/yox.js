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
var noop = function noop() {/** yox */};

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
 * 合并多个数组，不去重
 *
 * @return {Array}
 */
function merge() {
  var args = toArray(arguments);
  var result = [];
  args.unshift(result);
  execute(push$1, NULL, args);
  return result;
}

function add(action) {
  return function (original) {
    var args = arguments;
    for (var i = 1, len = args.length; i < len; i++) {
      if (array(args[i])) {
        each(args[i], function (item) {
          original[action](item);
        });
      } else {
        original[action](args[i]);
      }
    }
  };
}

/**
 * push 数组
 *
 * @param {Array} original
 */
var push$1 = add('push');

/**
 * unshift 数组
 *
 * @param {Array} original
 */
var unshift = add('unshift');

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
function toObject(array$$1, key, value) {
  var result = {};
  each(array$$1, function (item) {
    result[key ? item[key] : item] = value ? item[value] : item;
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
function remove(array$$1, item, strict) {
  var index = indexOf(array$$1, item, strict);
  if (index >= 0) {
    array$$1.splice(index, 1);
  }
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
	push: push$1,
	unshift: unshift,
	toArray: toArray,
	toObject: toObject,
	indexOf: indexOf,
	has: has$1,
	last: last,
	remove: remove,
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
    execute(set, NULL, key);
  } else if (string(key)) {
    var _args = args,
        length = _args.length;

    if (length === 2) {
      execute(set, NULL, args);
    } else if (length === 1) {
      return execute(get, NULL, key);
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

/**
 * 为了压缩，定义的常用字符
 */

function charAt$1(str) {
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return str.charAt(index);
}

function codeAt$1(str) {
  var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  return str.charCodeAt(index);
}

var CHAR_BLANK = '';
var CHAR_ASTERISK = '*';

var CHAR_DOT = '.';
var CODE_DOT = codeAt$1(CHAR_DOT);

var CHAR_HASH = '#';
var CODE_HASH = codeAt$1(CHAR_HASH);

var CHAR_DASH = '-';
var CODE_DASH = codeAt$1(CHAR_DASH);

var CHAR_EQUAL = '=';
var CODE_EQUAL = codeAt$1(CHAR_EQUAL);

var CHAR_SLASH = '/';
var CODE_SLASH = codeAt$1(CHAR_SLASH);

var CHAR_COMMA = ',';
var CODE_COMMA = codeAt$1(CHAR_COMMA);

var CHAR_COLON = ':';
var CODE_COLON = codeAt$1(CHAR_COLON);

var CHAR_SEMCOL = ';';
var CODE_SEMCOL = codeAt$1(CHAR_SEMCOL);

var CHAR_SQUOTE = "'";
var CODE_SQUOTE = codeAt$1(CHAR_SQUOTE);

var CHAR_DQUOTE = '"';
var CODE_DQUOTE = codeAt$1(CHAR_DQUOTE);

var CHAR_OPAREN = '(';
var CODE_OPAREN = codeAt$1(CHAR_OPAREN);

var CHAR_CPAREN = ')';
var CODE_CPAREN = codeAt$1(CHAR_CPAREN);

var CHAR_OBRACK = '[';
var CODE_OBRACK = codeAt$1(CHAR_OBRACK);

var CHAR_CBRACK = ']';
var CODE_CBRACK = codeAt$1(CHAR_CBRACK);

var CHAR_OBRACE = '{';
var CODE_OBRACE = codeAt$1(CHAR_OBRACE);

var CHAR_CBRACE = '}';
var CODE_CBRACE = codeAt$1(CHAR_CBRACE);

var CHAR_LEFT = '<';
var CODE_LEFT = codeAt$1(CHAR_LEFT);

var CHAR_RIGHT = '>';
var CODE_RIGHT = codeAt$1(CHAR_RIGHT);

var CHAR_QUMARK = '?';
var CODE_QUMARK = codeAt$1(CHAR_QUMARK);

var CHAR_TAB = '\t';
var CODE_TAB = codeAt$1(CHAR_TAB);

var CHAR_BREAKLINE = '\n';
var CODE_BREAKLINE = codeAt$1(CHAR_BREAKLINE);

var CHAR_WHITESPACE = ' ';
var CODE_WHITESPACE = codeAt$1(CHAR_WHITESPACE);

/**
 * 转成驼峰
 *
 * @param {string} str
 * @return {string}
 */
function camelCase(str) {
  if (has$3(str, CHAR_DASH)) {
    return str.replace(/-([a-z])/gi, function ($0, $1) {
      return $1.toUpperCase();
    });
  }
  return str;
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
 * 判断长度大于 0 的字符串
 *
 * @param {*} str
 * @return {boolean}
 */
function falsy$1(str) {
  return !string(str) || str === CHAR_BLANK;
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
function parse(str, separator, pair) {
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

function trim(str) {
  return falsy$1(str) ? CHAR_BLANK : str.trim();
}
function indexOf$1(str, part) {
  return str.indexOf(part);
}
function has$3(str, part) {
  return indexOf$1(str, part) >= 0;
}
function startsWith(str, part) {
  return indexOf$1(str, part) === 0;
}
function endsWith(str, part) {
  return str === part || str.lastIndexOf(part) === part.length;
}

// export function replace(str, pattern, replacement) {
//   pattern = pattern.replace(/[$.]/g, '\\$&')
//   return str.replace(
//     new RegExp(`(?:^|\\b)${pattern}(?:$|\\b)`, 'g'),
//     replacement
//   )
// }
//

var string$1 = Object.freeze({
	camelCase: camelCase,
	capitalize: capitalize,
	falsy: falsy$1,
	parse: parse,
	trim: trim,
	indexOf: indexOf$1,
	has: has$3,
	startsWith: startsWith,
	endsWith: endsWith
});

var SEPARATOR_KEY = CHAR_DOT;
var SEPARATOR_PATH = CHAR_SLASH;
var LEVEL_CURRENT = CHAR_DOT;
var LEVEL_PARENT = '' + CHAR_DOT + CHAR_DOT;

function normalize(str) {
  if (!falsy$1(str) && indexOf$1(str, CHAR_OBRACK) > 0 && indexOf$1(str, CHAR_CBRACK) > 0) {
    // array[0] => array.0
    // object['key'] => array.key
    return str.replace(/\[\s*?([\S]+)\s*?\]/g, function ($0, $1) {
      var code = codeAt$1($1);
      if (code === CODE_SQUOTE || code === CODE_DQUOTE) {
        $1 = $1.slice(1, -1);
      }
      return '' + SEPARATOR_KEY + $1;
    });
  }
  return str;
}

function parse$1(str) {
  return falsy$1(str) ? [] : normalize(str).split(SEPARATOR_KEY);
}

function stringify(keypaths) {
  return keypaths.filter(function (term) {
    return term !== CHAR_BLANK && term !== LEVEL_CURRENT;
  }).join(SEPARATOR_KEY);
}

function resolve(base, path) {
  var list = parse$1(base);
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
function copy$1(object$$1, deep) {
  var result = object$$1;
  if (array(object$$1)) {
    result = [];
    each(object$$1, function (item, index) {
      result[index] = deep ? copy$1(item) : item;
    });
  } else if (object(object$$1)) {
    result = {};
    each$1(object$$1, function (value, key) {
      result[key] = deep ? copy$1(value) : value;
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
  if (string(keypath) && indexOf$1(keypath, CHAR_DOT) > 0) {
    var list = parse$1(keypath);
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
  if (string(keypath) && indexOf$1(keypath, CHAR_DOT) > 0) {
    var originalObject = object$$1;
    var list = parse$1(keypath);
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
	copy: copy$1,
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
            remove(list, listener);
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
            var result = execute(listener, context, data);

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
          if (key !== type || has$3(key, CHAR_ASTERISK)) {
            key = ['^', key.replace(/\./g, '\\.').replace(/\*\*/g, '([\.\\w]+?)').replace(/\*/g, '(\\w+)'), endsWith(key, '' + CHAR_ASTERISK + CHAR_ASTERISK) ? CHAR_BLANK : '$'];
            var match = type.match(new RegExp(key.join(CHAR_BLANK)));
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
        return !falsy(list);
      }
      return array(list) ? has$1(list, listener) : FALSE;
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
    var textNode = doc.createTextNode(CHAR_BLANK);
    observer.observe(textNode, {
      characterData: TRUE
    });
    textNode.data = CHAR_WHITESPACE;
  };
} else if (typeof setImmediate === 'function') {
  nextTick$1 = setImmediate;
} else {
  nextTick$1 = setTimeout;
}

var nextTick$2 = nextTick$1;

var nextTasks = [];

/**
 * 添加异步任务
 *
 * @param {Function} task
 */
function add$1(task) {
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
 * @param {Node} left
 * @param {string} operator
 * @param {Node} right
 */

var Binary = function (_Node) {
  inherits(Binary, _Node);

  function Binary(left, operator, right) {
    classCallCheck(this, Binary);

    var _this = possibleConstructorReturn(this, (Binary.__proto__ || Object.getPrototypeOf(Binary)).call(this, BINARY));

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
 * @param {string} raw
 */

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(value, raw) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this, LITERAL));

    _this.value = value;
    if (raw) {
      _this.raw = raw;
    }
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

/**
 * 把树形的 Member 节点转换成一维数组的形式
 *
 * @param {Member} node
 * @return {Array.<Node>}
 */
function flattenMember(node) {

  var result = [];

  var next = void 0;
  do {
    next = node.object;
    if (node.type === MEMBER) {
      unshift(result, node.prop);
    } else {
      unshift(result, node);
    }
  } while (node = next);

  return result;
}

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
      return '[' + node.elements.map(recursion).join(CHAR_COMMA) + ']';

    case BINARY:
      return stringify$1(node.left) + ' ' + node.operator + ' ' + stringify$1(node.right);

    case CALL:
      return stringify$1(node.callee) + '(' + node.args.map(recursion).join(CHAR_COMMA) + ')';

    case CONDITIONAL:
      return stringify$1(node.test) + ' ? ' + stringify$1(node.consequent) + ' : ' + stringify$1(node.alternate);

    case IDENTIFIER:
      return node.name;

    case LITERAL:
      return has$2(node, 'raw') ? node.raw : node.value;

    case MEMBER:
      return flattenMember(node).map(function (node, index) {
        if (node.type === LITERAL) {
          var _node = node,
              value = _node.value;

          return numeric(value) ? '' + CHAR_OBRACK + value + CHAR_CBRACK : '' + CHAR_DOT + value;
        } else {
          node = stringify$1(node);
          return index > 0 ? '' + CHAR_OBRACK + node + CHAR_CBRACK : node;
        }
      }).join(CHAR_BLANK);

    case UNARY:
      return '' + node.operator + stringify$1(node.arg);

    default:
      return CHAR_BLANK;
  }
}

/**
 * 表达式求值
 *
 * @param {Node} node
 * @param {Context} context
 * @return {*}
 */
function execute$1(node, context) {

  var deps = {},
      value = void 0,
      result = void 0;

  (function () {
    switch (node.type) {
      case ARRAY:
        value = [];
        each(node.elements, function (node) {
          result = execute$1(node, context);
          push$1(value, result.value);
          extend(deps, result.deps);
        });
        break;

      case BINARY:
        var left = node.left,
            right = node.right;

        left = execute$1(left, context);
        right = execute$1(right, context);
        value = Binary[node.operator](left.value, right.value);
        extend(deps, left.deps, right.deps);
        break;

      case CALL:
        result = execute$1(node.callee, context);
        deps = result.deps;
        value = execute(result.value, NULL, node.args.map(function (node) {
          var result = execute$1(node, context);
          extend(deps, result.deps);
          return result.value;
        }));
        break;

      case CONDITIONAL:
        var test = node.test,
            consequent = node.consequent,
            alternate = node.alternate;

        test = execute$1(test, context);
        if (test.value) {
          consequent = execute$1(consequent, context);
          value = consequent.value;
          extend(deps, test.deps, consequent.deps);
        } else {
          alternate = execute$1(alternate, context);
          value = alternate.value;
          extend(deps, test.deps, alternate.deps);
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
        each(flattenMember(node), function (node, index) {
          var type = node.type;

          if (type !== LITERAL) {
            if (index > 0) {
              var _result = execute$1(node, context);
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
        result = execute$1(node.arg, context);
        value = Unary[node.operator](result.value);
        deps = result.deps;
        break;
    }
  })();

  return { value: value, deps: deps };
}

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
 * 用倒排 token 去匹配 content 的开始内容
 *
 * @param {string} content
 * @param {Array.<string>} sortedTokens 数组长度从大到小排序
 * @return {?string}
 */
function matchBestToken(content, sortedTokens) {
  var result = void 0;
  each(sortedTokens, function (token) {
    if (startsWith(content, token)) {
      result = token;
      return FALSE;
    }
  });
  return result;
}

/**
 * 把表达式编译成抽象语法树
 *
 * @param {string} content 表达式字符串
 * @return {Object}
 */
function compile$1(content) {

  if (has$2(compileCache$1, content)) {
    return compileCache$1[content];
  }

  var length = content.length;

  var index = 0,
      charCode = void 0;

  var getCharCode = function getCharCode() {
    return codeAt$1(content, index);
  };
  var throwError = function throwError() {
    error$1('Failed to compile expression: ' + CHAR_BREAKLINE + content);
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
      if (codeAt$1(content, index - 1) === quote) {
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

    var literal = content.substring(index, (skipIdentifier(), index));
    if (literal) {
      return careKeyword && has$2(keywords, literal) ? new Literal(keywords[literal])
      // this 也视为 IDENTIFIER
      : new Identifier(literal);
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
        push$1(list, parseExpression());
      }
    }

    throwError();
  };

  var parseOperator = function parseOperator(sortedOperatorList) {
    skipWhitespace();
    var literal = matchBestToken(content.slice(index), sortedOperatorList);
    if (literal) {
      index += literal.length;
      return literal;
    }
  };

  var parseVariable = function parseVariable() {

    var node = parseIdentifier(TRUE);

    while (index < length) {
      // a(x)
      charCode = getCharCode();
      if (charCode === CODE_OPAREN) {
        return new Call(node, parseTuple(CODE_CPAREN));
      } else {
        // a.x
        if (charCode === CODE_DOT) {
          index++;
          node = new Member(node, new Literal(parseIdentifier().name));
        }
        // a[x]
        else if (charCode === CODE_OBRACK) {
            node = new Member(node, parseExpression(CODE_CBRACK));
          } else {
            break;
          }
      }
    }

    return node;
  };

  var parseToken = function parseToken() {

    skipWhitespace();

    charCode = getCharCode();
    // 'xx' 或 "xx"
    if (charCode === CODE_SQUOTE || charCode === CODE_DQUOTE) {
      // 截出的字符串包含引号
      var value = content.substring(index, (skipString(), index));
      return new Literal(value.slice(1, -1), value);
    }
    // 1.1 或 .1
    else if (isDigit(charCode) || charCode === CODE_DOT) {
        return new Literal(
        // 写的是什么进制就解析成什么进制
        parseFloat(content.substring(index, (skipNumber(), index))));
      }
      // [xx, xx]
      else if (charCode === CODE_OBRACK) {
          return new Array$1(parseTuple(CODE_CBRACK));
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
      return new Unary(action, parseToken());
    }
    throwError();
  };

  var parseBinary = function parseBinary() {

    var left = parseToken();
    var action = parseOperator(binaryList);
    if (!action) {
      return left;
    }

    var stack = [left, action, binaryMap[action], parseToken()];
    var right = void 0,
        next = void 0;

    while (next = parseOperator(binaryList)) {

      // 处理左边
      if (stack.length > 3 && binaryMap[next] < stack[stack.length - 2]) {
        right = stack.pop();
        stack.pop();
        action = stack.pop();
        left = stack.pop();
        push$1(stack, new Binary(left, action, right));
      }

      push$1(stack, next, binaryMap[next], parseToken());
    }

    // 处理右边
    // 右边只有等到所有 token 解析完成才能开始
    // 比如 a + b * c / d
    // 此时右边的优先级 >= 左边的优先级，因此可以脑残的直接逆序遍历

    right = stack.pop();
    while (stack.length > 1) {
      stack.pop();
      action = stack.pop();
      left = stack.pop();
      right = new Binary(left, action, right);
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
    var test = parseBinary();
    skipWhitespace();

    if (getCharCode() === CODE_QUMARK) {
      index++;

      var consequent = parseBinary();
      skipWhitespace();

      if (getCharCode() === CODE_COLON) {
        index++;

        var alternate = parseBinary();
        skipWhitespace();

        return new Conditional(test, consequent, alternate);
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

    this.data = copy$1(data);
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
          keys$$1 = parse$1(keypath);
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
          levelMap[LEVEL_CURRENT] = FALSE;
          levelMap[LEVEL_PARENT] = TRUE;

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
                  unshift(keys$$1, LEVEL_PARENT);
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
        if (has$2(cache, keypath)) {
          return {
            keypath: keypath,
            value: cache[keypath]
          };
        }
      }

      warn$1('Failed to lookup "' + key + '" data.');

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
        return CHAR_BLANK;
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
          return CHAR_BLANK;
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
    key: 'codeAt',
    value: function codeAt(index) {
      return codeAt$1(this.tail, index);
    }
  }]);
  return Scanner;
}();

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

var openingDelimiterPattern = new RegExp(DELIMITER_OPENING);
var closingDelimiterPattern = new RegExp(DELIMITER_CLOSING);

var elementPattern = /<(?:\/)?[-a-z]\w*/i;
var elementEndPattern = /(?:\/)?>/;

var attributePattern = /([-:@a-z0-9]+)(?==["'])?/i;

var nonSingleQuotePattern = /^[^']*/;
var nonDoubleQuotePattern = /^[^"]*/;

var componentNamePattern = /[-A-Z]/;
var selfClosingTagNamePattern = /input|img|br/i;

// 如果传入的函数改写了 toString，就调用 toString() 求值
var toString$1 = Function.prototype.toString;

// 2 种 level
// 当 level 为 LEVEL_ATTRIBUTE 时，表示只可以处理属性和指令
// 当 level 为 LEVEL_TEXT 时，表示只可以处理属性和指令的值

var LEVEL_ATTRIBUTE = 1;
var LEVEL_TEXT = 2;

// 属性层级的节点类型
var attrTypes = {};
attrTypes[ATTRIBUTE] = attrTypes[DIRECTIVE] = TRUE;

// 叶子节点类型
var leafTypes = {};
leafTypes[EXPRESSION] = leafTypes[IMPORT$1] = leafTypes[SPREAD$1] = leafTypes[TEXT] = TRUE;

// 内置指令，无需加前缀
var buildInDirectives = {};
buildInDirectives[DIRECTIVE_REF] = buildInDirectives[DIRECTIVE_LAZY] = buildInDirectives[DIRECTIVE_MODEL] = buildInDirectives[KEYWORD_UNIQUE] = TRUE;

function markNodes(nodes) {
  if (array(nodes)) {
    nodes[CHAR_DASH] = TRUE;
  }
  return nodes;
}

function isNodes(nodes) {
  return nodes[CHAR_DASH] === TRUE;
}

/**
 * 合并多个节点
 *
 * 用于处理属性值和指令值
 *
 * @param {?Array} nodes
 * @return {*}
 */
function mergeNodes(nodes) {
  if (array(nodes)) {
    var length = nodes.length;
    // name=""

    if (length === 0) {
      return CHAR_BLANK;
    }
    // name="{{value}}"
    else if (length === 1) {
        return nodes[0];
      }
      // name="{{value1}}{{value2}}"
      else if (length > 1) {
          return nodes.join(CHAR_BLANK);
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

  var value = enter(node);
  if (value !== FALSE) {
    if (!value) {
      var children = node.children,
          attrs = node.attrs;

      if (array(children)) {
        children = traverseList(children, recursion);
      }
      if (array(attrs)) {
        attrs = traverseList(attrs, recursion);
      }
      value = leave(node, children, attrs);
    }
    return value;
  }
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
      if (array(item) && !isNodes(item)) {
        list.push(item);
      } else {
        push$1(list, item);
      }
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
  return markNodes(list);
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
 * @param {Function} importTemplate 导入子模板，如果是纯模板，可不传
 * @param {Object} data 渲染模板的数据，如果渲染纯模板，可不传
 * @return {Object} { node: x, deps: { } }
 */
function render(ast, createText, createElement, importTemplate, data) {

  var keys$$1 = [];
  var getKeypath = function getKeypath() {
    return stringify(keys$$1);
  };
  getKeypath.toString = getKeypath;

  data[SPECIAL_KEYPATH] = getKeypath;
  var context = new Context(data);

  var partials = {};

  var deps = {};
  var executeExpr = function executeExpr(expr) {
    var result = execute$1(expr, context);
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

            var list = [];

            push$1(keys$$1, stringifyExpr(expr));
            context = context.push(value);

            iterate(value, function (item, i) {
              if (index) {
                context.set(index, i);
              }

              push$1(keys$$1, i);
              context = context.push(item);

              push$1(list, traverseList(children, recursion));

              keys$$1.pop();
              context = context.pop();
            });

            keys$$1.pop();
            context = context.pop();

            return {
              v: markNodes(list)
            };

        }
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    }, function (node, children, attrs) {
      var type = node.type,
          name = node.name,
          modifier = node.modifier,
          component = node.component,
          content = node.content;

      var keypath = getKeypath();

      var _ret2 = function () {
        switch (type) {
          case TEXT:
            return {
              v: markNodes(createText({
                keypath: keypath,
                content: content
              }))
            };

          case EXPRESSION:
            var expr = node.expr,
                safe = node.safe;

            content = executeExpr(expr);
            if (func(content) && content.toString !== toString$1) {
              content = content.toString();
            }
            content = createText({
              safe: safe,
              keypath: keypath,
              content: content
            });
            return {
              v: safe ? content : markNodes(content)
            };

          case ATTRIBUTE:
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
                modifier: modifier,
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
                var list = [];
                each$1(content, function (value, name) {
                  push$1(list, {
                    name: name,
                    value: value,
                    keypath: keypath
                  });
                });
                return {
                  v: {
                    v: markNodes(list)
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
                if (has$2(node, 'modifier')) {
                  if (node.name && node.modifier !== CHAR_BLANK) {
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
              }, component)
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
var compileCache = {};

var parsers = [{
  test: function test(source) {
    return startsWith(source, EACH);
  },
  create: function create(source) {
    var terms = trim(source.slice(EACH.length)).split(CHAR_COLON);
    var expr = trim(terms[0]);
    if (expr) {
      return new Each(compile$1(expr), trim(terms[1]));
    }
  }
}, {
  test: function test(source) {
    return startsWith(source, IMPORT);
  },
  create: function create(source) {
    var name = trim(source.slice(IMPORT.length));
    if (name) {
      return new Import(name);
    }
  }
}, {
  test: function test(source) {
    return startsWith(source, PARTIAL);
  },
  create: function create(source) {
    var name = trim(source.slice(PARTIAL.length));
    if (name) {
      return new Partial(name);
    }
  }
}, {
  test: function test(source) {
    return startsWith(source, IF);
  },
  create: function create(source) {
    var expr = trim(source.slice(IF.length));
    if (expr) {
      return new If(compile$1(expr));
    }
  }
}, {
  test: function test(source) {
    return startsWith(source, ELSE_IF);
  },
  create: function create(source, delimiter, popStack) {
    source = trim(source.slice(ELSE_IF.length));
    if (source) {
      popStack();
      return new ElseIf(compile$1(source));
    }
  }
}, {
  test: function test(source) {
    return startsWith(source, ELSE);
  },
  create: function create(source, delimiter, popStack) {
    popStack();
    return new Else();
  }
}, {
  test: function test(source) {
    return startsWith(source, SPREAD);
  },
  create: function create(source) {
    source = trim(source.slice(SPREAD.length));
    if (source) {
      return new Spread(compile$1(source));
    }
  }
}, {
  test: function test(source) {
    return !startsWith(source, COMMENT);
  },
  create: function create(source, delimiter) {
    source = trim(source);
    if (source) {
      return new Expression(compile$1(source), !endsWith(delimiter, '}}}'));
    }
  }
}];

/**
 * 是否是纯粹的换行
 *
 * @param {string} content
 * @return {boolean}
 */
function isBreakline(content) {
  return has$3(content, CHAR_BREAKLINE) >= 0 && !trim(content);
}

/**
 * trim 文本开始和结束位置的换行符
 *
 * @param {string} content
 * @return {boolean}
 */
function trimBreakline(content) {
  return content.replace(/^[ \t]*\n|\n[ \t]*$/g, CHAR_BLANK);
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

  var match = content.match(quote === CHAR_DQUOTE ? nonDoubleQuotePattern : nonSingleQuotePattern);

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
 * @return {Object}
 */
function compile$$1(template) {

  var result = compileCache[template];
  if (result) {
    return result;
  }

  // 当前内容
  var content = void 0;
  // 记录标签名、属性名、指令名
  var name = void 0;
  // 记录属性值、指令值的开始引号，方便匹配结束引号
  var quote = void 0;
  // 分隔符
  var delimiter = void 0;
  // 是否自闭合
  var isSelfClosing = void 0;

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
      msg += CHAR_DOT;
    } else {
      (function () {
        var line = 0,
            col = 0,
            index = 0;
        each(template.split(CHAR_BREAKLINE), function (lineStr) {
          line++;
          col = 0;

          var length = lineStr.length;

          if (pos >= index && pos <= index + length) {
            col = pos - index;
            return FALSE;
          }

          index += length;
        });
        msg += ', at line ' + line + ', col ' + col + '.';
      })();
    }
    error$1('' + msg + CHAR_BREAKLINE + template);
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
    var type = node.type,
        content = node.content;


    if (type === TEXT) {
      if (isBreakline(content) || !(content = trimBreakline(content))) {
        return;
      }
      node.content = content;
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

  // 属性和指令支持以下 4 种写法：
  // 1. name
  // 2. name="value"
  // 3. name="{{value}}"
  // 4. name="prefix{{value}}suffix"
  var parseAttribute = function parseAttribute(content) {

    if (falsy(levelNode.children)) {
      if (content && codeAt$1(content) === CODE_EQUAL) {
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
              levelNode = new Directive(camelCase(name));
            } else {
              if (startsWith(name, DIRECTIVE_EVENT_PREFIX)) {
                name = name.slice(DIRECTIVE_EVENT_PREFIX.length);
                levelNode = new Directive('event', camelCase(name));
              } else if (startsWith(name, DIRECTIVE_CUSTOM_PREFIX)) {
                name = name.slice(DIRECTIVE_CUSTOM_PREFIX.length);
                levelNode = new Directive(camelCase(name));
              } else {
                if (levelNode.component) {
                  name = camelCase(name);
                }
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
        if (codeAt$1(content) === CODE_SLASH) {
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
    if (mainScanner.codeAt(0) !== CODE_LEFT) {
      break;
    }

    // 结束标签
    if (mainScanner.codeAt(1) === CODE_SLASH) {
      // 取出 </tagName
      content = mainScanner.nextAfter(elementPattern);
      name = content.slice(2);

      // 没有匹配到 >
      if (mainScanner.codeAt(0) !== CODE_RIGHT) {
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

  result = children[0];
  if (children.length > 1 || result.type !== ELEMENT) {
    error$1('Template should contain exactly one root element.');
  }

  return compileCache[template] = result;
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

/**
 * @param {?string} options.el
 * @param {?string} options.sel
 * @param {?string} options.data
 * @param {?string} options.text
 * @param {?string} options.html
 * @param {?string|Array} options.children
 */

var Vnode = function Vnode(options) {
  classCallCheck(this, Vnode);

  extend(this, options);
};

function createElement(tagName) {
  return doc.createElement(tagName);
}

function createFragment(content) {
  var fragment = doc.createDocumentFragment();
  html(fragment, content);
  return fragment;
}

function createText(text) {
  return doc.createTextNode(text);
}

function createEvent(event) {
  return event;
}

function isElement(node) {
  return node.nodeType === 1;
}

function isFragment(node) {
  return node.nodeType === 11;
}

function before(parentNode, newNode, referenceNode) {
  parentNode.insertBefore(newNode, referenceNode);
}

function replace(parentNode, newNode, oldNode) {
  parentNode.replaceChild(newNode, oldNode);
}

function remove$1(parentNode, child) {
  parentNode.removeChild(child);
}

function append(parentNode, child) {
  parentNode.appendChild(child);
}

function parent(node) {
  return node.parentElement;
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
  node.textContent = content;
}

function html(node, content) {
  if (isElement(node)) {
    node.innerHTML = content;
  } else if (isFragment(node)) {
    each(children(node), function (child) {
      remove$1(node, child);
    });
    var element = createElement('div');
    element.innerHTML = content;
    each(children(element), function (child) {
      append(node, child);
    });
  }
}

function find(selector, context) {
  return (context || doc).querySelector(selector);
}

function on$1(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function off$1(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

var domApi = Object.freeze({
	createElement: createElement,
	createFragment: createFragment,
	createText: createText,
	createEvent: createEvent,
	isElement: isElement,
	isFragment: isFragment,
	before: before,
	replace: replace,
	remove: remove$1,
	append: append,
	parent: parent,
	next: next,
	tag: tag$1,
	children: children,
	text: text,
	html: html,
	find: find,
	on: on$1,
	off: off$1
});

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

var whitespacePattern = /\s+/;

var emptyNode = new Vnode({
  sel: CHAR_BLANK,
  data: {},
  children: []
});

function isSameVnode(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.sel === vnode2.sel;
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

function init$1(modules) {
  var api = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : domApi;


  var moduleEmitter = new Emitter();

  each(moduleHooks, function (hook) {
    each(modules, function (item) {
      moduleEmitter.on(hook, item[hook]);
    });
  });

  var stringifySel = function stringifySel(el) {
    var list = [api.tag(el)];
    var id = el.id,
        className = el.className;

    if (id) {
      push$1(list, '' + CHAR_HASH + id);
    }
    if (className) {
      push$1(list, '' + CHAR_DOT + className.split(whitespacePattern).join(CHAR_DOT));
    }
    return list.join(CHAR_BLANK);
  };

  var parseSel = function parseSel(sel) {

    var tagName = void 0,
        id = void 0,
        className = void 0;

    var hashIndex = indexOf$1(sel, CHAR_HASH);
    if (hashIndex > 0) {
      tagName = sel.slice(0, hashIndex);
      sel = sel.slice(hashIndex + 1);
    }

    var dotIndex = indexOf$1(sel, CHAR_DOT);
    if (dotIndex > 0) {
      var temp = sel.slice(0, dotIndex);
      if (tagName) {
        id = temp;
      } else {
        tagName = temp;
      }
      className = sel.slice(dotIndex + 1).split(CHAR_DOT).join(CHAR_WHITESPACE);
    } else {
      if (tagName) {
        id = sel;
      } else {
        tagName = sel;
      }
    }

    return { tagName: tagName, id: id, className: className };
  };

  var createVnode = function createVnode(el) {
    return new Vnode({
      sel: stringifySel(el),
      data: {},
      children: [],
      el: el
    });
  };

  var createElement$$1 = function createElement$$1(vnode, insertedQueue) {
    var sel = vnode.sel,
        data = vnode.data,
        children$$1 = vnode.children,
        raw = vnode.raw,
        text$$1 = vnode.text;


    var hook = data && data.hook || {};
    execute(hook[HOOK_INIT], NULL, vnode);

    if (string(sel)) {
      var _parseSel = parseSel(sel),
          tagName = _parseSel.tagName,
          id = _parseSel.id,
          className = _parseSel.className;

      var el = api.createElement(tagName);
      if (id) {
        el.id = id;
      }
      if (className) {
        el.className = className;
      }

      vnode.el = el;

      if (array(children$$1)) {
        addVnodes(el, children$$1, 0, children$$1.length - 1, insertedQueue);
      } else if (string(text$$1)) {
        api.append(el, api[raw ? 'createFragment' : 'createText'](text$$1));
      }

      if (data) {
        data = [emptyNode, vnode];
        moduleEmitter.fire(HOOK_CREATE, data);

        execute(hook[HOOK_CREATE], NULL, data);

        if (hook[HOOK_INSERT]) {
          insertedQueue.push(vnode);
        }
      }

      return el;
    } else {
      return vnode.el = api[raw ? 'createFragment' : 'createText'](text$$1);
    }
  };

  var addVnodes = function addVnodes(parentNode, vnodes, startIndex, endIndex, insertedQueue, before$$1) {
    for (var i = startIndex; i <= endIndex; i++) {
      addVnode(parentNode, vnodes[i], insertedQueue, before$$1);
    }
  };

  var addVnode = function addVnode(parentNode, vnode, insertedQueue, before$$1) {
    api.before(parentNode, createElement$$1(vnode, insertedQueue), before$$1);
  };

  var removeVnodes = function removeVnodes(parentNode, vnodes, startIndex, endIndex) {
    for (var i = startIndex; i <= endIndex; i++) {
      removeVnode(parentNode, vnodes[i]);
    }
  };

  var removeVnode = function removeVnode(parentNode, vnode) {
    var sel = vnode.sel,
        el = vnode.el,
        data = vnode.data;

    if (sel) {
      destroyVnode(vnode);
      api.remove(parentNode, el);

      if (data) {
        moduleEmitter.fire(HOOK_REMOVE, vnode);
        if (data.hook) {
          execute(data.hook[HOOK_REMOVE], NULL, vnode);
        }
      }
    } else {
      api.remove(parentNode, el);
    }
  };

  var destroyVnode = function destroyVnode(vnode) {
    var data = vnode.data,
        children$$1 = vnode.children;

    if (data) {

      // 先销毁 children
      if (children$$1) {
        each(children$$1, function (child) {
          destroyVnode(child);
        });
      }

      moduleEmitter.fire(HOOK_DESTROY, vnode);

      if (data.hook) {
        execute(data.hook[HOOK_DESTROY], NULL, vnode);
      }
    }
  };

  var replaceVnode = function replaceVnode(parentNode, oldVnode, vnode) {
    if (parentNode) {
      api.before(parentNode, vnode.el, oldVnode.el);
      removeVnode(parentNode, oldVnode);
    }
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
      else if (isSameVnode(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode, insertedQueue);
          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex];
        }

        // 再从尾到头比较，位置相同且值得 patch
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode, insertedQueue);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
          }

          // 比较完两侧的节点，剩下就是 位置发生改变的节点 和 全新的节点

          // 当 oldStartVnode 和 newEndVnode 值得 patch
          // 说明元素被移到右边了
          else if (isSameVnode(oldStartVnode, newEndVnode)) {
              patchVnode(oldStartVnode, newEndVnode, insertedQueue);
              api.before(parentNode, oldStartVnode.el, api.next(oldEndVnode.el));
              oldStartVnode = oldChildren[++oldStartIndex];
              newEndVnode = newChildren[--newEndIndex];
            }

            // 当 oldEndVnode 和 newStartVnode 值得 patch
            // 说明元素被移到左边了
            else if (isSameVnode(oldEndVnode, newStartVnode)) {
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
                      createElement$$1(newStartVnode, insertedQueue);
                      activeVnode = newStartVnode;
                    }

                  api.before(parentNode, activeVnode.el, oldStartVnode.el);
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

    var hook = data && data.hook || {};

    var args = [oldVnode, vnode];
    execute(hook[HOOK_PREPATCH], NULL, args);

    var el = vnode.el = oldVnode.el;
    if (!isSameVnode(oldVnode, vnode)) {
      createElement$$1(vnode, insertedQueue);
      replaceVnode(api.parent(el), oldVnode, vnode);
      return;
    }

    if (data) {
      moduleEmitter.fire(HOOK_UPDATE, args);
      execute(hook[HOOK_UPDATE], NULL, args);
    }

    var newRaw = vnode.raw;
    var newText = vnode.text;
    var newChildren = vnode.children;

    var oldRaw = oldVnode.raw;
    var oldText = oldVnode.text;
    var oldChildren = oldVnode.children;

    if (string(newText)) {
      if (newText !== oldText) {
        if (newRaw) {
          api.replace(api.parent(el), api.createFragment(newText), el);
        } else {
          api.text(el, newText);
        }
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
            api[oldRaw ? 'html' : 'text'](el, CHAR_BLANK);
          }
          addVnodes(el, newChildren, 0, newChildren.length - 1, insertedQueue);
        }
        // 有旧的没新的 - 删除节点
        else if (oldChildren) {
            removeVnodes(el, oldChildren, 0, oldChildren.length - 1);
          }
          // 有旧的 text 没有新的 text
          else if (string(oldText)) {
              api[oldRaw ? 'html' : 'text'](el, CHAR_BLANK);
            }
    }

    execute(hook[HOOK_POSTPATCH], NULL, args);
  };

  return function (oldVnode, vnode) {

    moduleEmitter.fire(HOOK_PRE);

    if (!oldVnode.sel && api.isElement(oldVnode)) {
      oldVnode = createVnode(oldVnode);
    }

    var insertedQueue = [];
    if (isSameVnode(oldVnode, vnode)) {
      patchVnode(oldVnode, vnode, insertedQueue);
    } else {
      createElement$$1(vnode, insertedQueue);
      replaceVnode(api.parent(oldVnode.el), oldVnode, vnode);
    }

    each(insertedQueue, function (vnode) {
      execute(vnode.data.hook[HOOK_INSERT], NULL, vnode);
    });

    moduleEmitter.fire(HOOK_POST);

    return vnode;
  };
}

var h = function (sel, data) {

  var children = void 0,
      text = void 0;

  var lastArg = last(arguments);
  if (array(lastArg)) {
    children = lastArg;
    each(children, function (child, i) {
      if (!(child instanceof Vnode)) {
        children[i] = new Vnode({
          text: child
        });
      }
    });
  } else if (string(lastArg)) {
    text = lastArg;
  }

  return new Vnode({
    sel: sel,
    text: text,
    children: children,
    data: object(data) ? data : {}
  });
};

function updateStyle(oldVnode, vnode) {

  var oldStyle = oldVnode.data.style;
  var newStyle = vnode.data.style;

  if (!oldStyle && !newStyle) {
    return;
  }

  oldStyle = oldStyle || {};
  newStyle = newStyle || {};

  var style = vnode.el.style;


  each$1(newStyle, function (value, name) {
    if (value !== oldStyle[name]) {
      style[name] = value;
    }
  });

  each$1(oldStyle, function (value, name) {
    if (!has$2(newStyle, name)) {
      style[name] = CHAR_BLANK;
    }
  });
}

var style = {
  create: updateStyle,
  update: updateStyle
};

var booleanLiteral = 'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare' + 'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,draggable' + 'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple' + 'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly' + 'required,reversed,scoped,seamless,selected,sortable,spellcheck,translate' + 'truespeed,typemustmatch,visible';

var booleanMap = toObject(booleanLiteral.split(CHAR_COMMA));

function updateAttrs(oldVnode, vnode) {

  var oldAttrs = oldVnode.data.attrs;
  var newAttrs = vnode.data.attrs;

  if (!oldAttrs && !newAttrs) {
    return;
  }

  oldAttrs = oldAttrs || {};
  newAttrs = newAttrs || {};

  var el = vnode.el;


  each$1(newAttrs, function (value, name) {
    if (value !== oldAttrs[name]) {
      if (!value && booleanMap[name]) {
        el.removeAttribute(name);
      } else {
        el.setAttribute(name, value);
      }
    }
  });

  each$1(oldAttrs, function (value, name) {
    if (!has$2(newAttrs, name)) {
      el.removeAttribute(name);
    }
  });
}

var attributes = {
  create: updateAttrs,
  update: updateAttrs
};

var toString$2 = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHAR_BLANK;

  try {
    return str.toString();
  } catch (e) {
    return defaultValue;
  }
};

var patch = init$1([attributes, style]);

function create$1(ast, context, instance) {

  var createText = function createText(node) {
    var safe = node.safe,
        content = node.content;

    if (safe !== FALSE || !string(content) || !tag.test(content)) {
      return content;
    }
    return new Vnode({
      text: content,
      raw: TRUE
    });
  };

  var createElement = function createElement(node, isComponent) {

    var hooks = {},
        attributes$$1 = {},
        directives = {},
        styles = void 0,
        component = void 0;

    var data = {
      hook: hooks
    };

    if (isComponent) {
      component = [];
    } else {
      each(node.attributes, function (node) {
        var name = node.name,
            value = node.value;

        if (name === 'style') {
          var list = parse(value, CHAR_SEMCOL, CHAR_COLON);
          if (list.length) {
            styles = {};
            each(list, function (item) {
              if (item.value) {
                styles[camelCase(item.key)] = item.value;
              }
            });
          }
        } else {
          attributes$$1[name] = node;
          var attrs = data.attrs || (data.attrs = {});
          attrs[name] = value;
        }
      });
    }

    each(node.directives, function (node) {
      var name = node.name,
          modifier = node.modifier;

      if (name === KEYWORD_UNIQUE) {
        data.key = node.value;
      } else {
        var key = name;
        if (modifier) {
          key = '' + name + CHAR_DOT + modifier;
        }
        if (!directives[key]) {
          directives[key] = node;
        }
      }
    });

    if (styles) {
      data.style = styles;
    }

    var upsert = function upsert(oldVnode, vnode) {

      // 如果只有 oldVnode，且 oldVnode 没有 directives，表示插入
      // 如果只有 oldVnode，且 oldVnode 有 directives，表示销毁
      // 如果有 oldVnode 和 vnode，表示更新

      var nextVnode = vnode || oldVnode;

      // 数据要挂在元素上，vnode 非常不稳定，内部很可能新建了一个对象
      var $data = oldVnode.el.$data || (oldVnode.el.$data = {});

      var oldDestroies = $data.destroies || {};
      var oldDirectives = $data.directives;
      var oldComponent = $data.component;

      if (oldComponent) {
        component = oldComponent;
        if (object(component)) {
          component.set(toObject(node.attributes, 'name', 'value'), TRUE);
        }
      } else if (component) {
        instance.component(node.name, function (options) {
          if (array(component)) {
            oldComponent = component;
            component = instance.create(options, {
              el: nextVnode.el,
              props: toObject(node.attributes, 'name', 'value'),
              replace: TRUE
            });
            $data.component = component;
            each(oldComponent, function (callback) {
              callback(component);
            });
          }
        });
      }

      var bind = function bind(key) {
        var node = directives[key];
        var directive = instance.directive(node.name);
        if (directive) {
          return directive({
            el: nextVnode.el,
            node: node,
            instance: instance,
            directives: directives,
            attributes: attributes$$1,
            component: component
          });
        }
      };

      each$1(directives, function (directive, key) {
        if (vnode && oldDirectives) {
          var oldDirective = oldDirectives[key];
          if (oldDirective) {
            if (oldDirective.value !== directive.value) {
              if (oldDestroies[key]) {
                oldDestroies[key]();
              }
              oldDestroies[key] = bind(key);
            }
            return;
          }
        }
        oldDestroies[key] = bind(key);
      });

      if (oldDirectives) {
        each$1(oldDirectives, function (oldDirective, key) {
          if (oldDestroies[key] && (!vnode || !directives[key])) {
            oldDestroies[key]();
            delete oldDestroies[key];
          }
        });
        // 元素被销毁
        if (!vnode) {
          oldVnode.el.$data = NULL;
        }
      }

      $data.attributes = attributes$$1;
      $data.directives = directives;
      $data.destroies = oldDestroies;

      hooks.insert = hooks.postpatch = hooks.destroy = noop;
    };

    hooks.insert = hooks.postpatch = hooks.destroy = upsert;

    return h(isComponent ? 'div' : node.name, data, node.children.map(function (child) {
      return child instanceof Vnode ? child : toString$2(child);
    }));
  };

  var importTemplate = function importTemplate(name) {
    return instance.partial(name);
  };

  return render(ast, createText, createElement, importTemplate, context);
}

var find$1 = find;
var isElement$1 = isElement;

function create$2(tagName, parent$$1) {
  if (parent$$1) {
    html(parent$$1, '<' + tagName + '></' + tagName + '>');
    return children(parent$$1)[0];
  }
  return createElement(tagName);
}

function getContent(selector) {
  return find(selector).innerHTML;
}

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
function on$2(element, type, listener, context) {
  var $emitter = element.$emitter || (element.$emitter = new Emitter());
  if (!$emitter.has(type)) {
    var nativeListener = function nativeListener(e) {
      e = new Event(createEvent(e, element));
      $emitter.fire(e.type, e, context);
    };
    $emitter[type] = nativeListener;
    on$1(element, type, nativeListener);
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
function off$2(element, type, listener) {
  var $emitter = element.$emitter;

  var types = keys($emitter.listeners);
  // emitter 会根据 type 和 listener 参数进行适当的删除
  $emitter.off(type, listener);
  // 根据 emitter 的删除结果来操作这里的事件 listener
  each(types, function (type) {
    if ($emitter[type] && !$emitter.has(type)) {
      off$1(element, type, $emitter[type]);
      delete $emitter[type];
    }
  });
}

var native = Object.freeze({
	find: find$1,
	isElement: isElement$1,
	create: create$2,
	getContent: getContent,
	on: on$2,
	off: off$2
});

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
    if (has$2($refs, value)) {
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
      push$1(component, set$$1);
    } else {
      set$$1(component);
    }
  } else {
    set$$1(el);
  }

  return function () {
    if (has$2($refs, value)) {
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
 * @return {Function}
 */
var debounce = function (fn, delay) {

  var timer = void 0;

  return function () {

    if (!timer) {

      execute(fn, NULL, toArray(arguments));

      timer = setTimeout(function () {
        timer = NULL;
      }, delay);
    }
  };
};

var event = function (_ref) {
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
    listener = instance.compileValue(node.keypath, node.value);
  }

  if (type && listener) {
    var lazy = directives.lazy;

    if (lazy) {
      if (numeric(lazy.value) && lazy.value >= 0) {
        listener = debounce(listener, lazy.value);
      } else if (type === 'input') {
        type = 'change';
      }
    }

    if (component) {
      var _ret = function () {
        var bind = function bind(component) {
          component.on(type, listener);
        };
        if (array(component)) {
          push$1(component, bind);
        } else {
          bind(component);
        }
        return {
          v: function v() {
            component.off(type, listener);
            if (array(component)) {
              remove(component, bind);
            }
          }
        };
      }();

      if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
    } else {
      on$2(el, type, listener);
      return function () {
        off$2(el, type, listener);
      };
    }
  }
};

var inputControl = {
  set: function set(_ref) {
    var el = _ref.el,
        keypath = _ref.keypath,
        instance = _ref.instance;

    var value = toString$2(instance.get(keypath));
    if (value !== el.value) {
      el.value = value;
    }
  },
  sync: function sync(_ref2) {
    var el = _ref2.el,
        keypath = _ref2.keypath,
        instance = _ref2.instance;

    instance.set(keypath, el.value);
  }
};

var radioControl = {
  set: function set(_ref3) {
    var el = _ref3.el,
        keypath = _ref3.keypath,
        instance = _ref3.instance;

    el.checked = el.value === toString$2(instance.get(keypath));
  },
  sync: function sync(_ref4) {
    var el = _ref4.el,
        keypath = _ref4.keypath,
        instance = _ref4.instance;

    if (el.checked) {
      instance.set(keypath, el.value);
    }
  }
};

var checkboxControl = {
  set: function set(_ref5) {
    var el = _ref5.el,
        keypath = _ref5.keypath,
        instance = _ref5.instance;

    var value = instance.get(keypath);
    el.checked = array(value) ? has$1(value, el.value, FALSE) : boolean(value) ? value : !!value;
  },
  sync: function sync(_ref6) {
    var el = _ref6.el,
        keypath = _ref6.keypath,
        instance = _ref6.instance;

    var value = instance.get(keypath);
    if (array(value)) {
      if (el.checked) {
        push$1(value, el.value);
      } else {
        remove(value, el.value, FALSE);
      }
      instance.set(keypath, copy$1(value));
    } else {
      instance.set(keypath, el.checked);
    }
  }
};

var specialControls = {
  radio: radioControl,
  checkbox: checkboxControl
};

var model = function (_ref7) {
  var el = _ref7.el,
      node = _ref7.node,
      instance = _ref7.instance,
      directives = _ref7.directives,
      attributes = _ref7.attributes;
  var value = node.value,
      keypath = node.keypath;


  var result = instance.get(value, keypath);
  if (result) {
    keypath = result.keypath;
  } else {
    error$1('The ' + keypath + ' being used for two-way binding is ambiguous.');
    return;
  }

  var type = 'change';
  var control = specialControls[el.type];
  if (!control) {
    control = inputControl;
    if ('oninput' in el) {
      type = 'input';
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

  if (!has$2(attributes, 'value')) {
    set$$1();
  }

  instance.watch(keypath, set$$1);

  return event({
    el: el,
    node: node,
    instance: instance,
    directives: directives,
    type: type,
    listener: function listener() {
      control.sync(data);
    }
  });
};

var Yox = function () {
  function Yox(options) {
    classCallCheck(this, Yox);


    var instance = this;

    execute(options[BEFORE_CREATE], instance, options);

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
    extend(instance.$data, func(data) ? execute(data, instance) : data);

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
              var result = execute(get$$1, instance);

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
          if (!has$3(keypath, CHAR_ASTERISK) && !has$2($watchCache, keypath)) {
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

    execute(options[AFTER_CREATE], instance);

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
        el = find$1(el);
      }
    }
    if (el) {
      if (isElement$1(el)) {
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
      execute(options[BEFORE_MOUNT], instance);
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
        var keys$$1 = parse$1(context);
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
        model$$1 = copy$1(keypath);
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
     * 取消监听数据变化
     *
     * @param {string|Object} keypath
     * @param {?Function} watcher
     */

  }, {
    key: 'unwatch',
    value: function unwatch(keypath, watcher) {
      this.$watchEmitter.off(keypath, watcher);
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
        diff(instance);
      } else if (!instance.$diffing) {
        instance.$diffing = TRUE;
        add$1(function () {
          delete instance.$diffing;
          diff(instance);
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
        execute($options[BEFORE_UPDATE], instance);
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
        instance.$el = $currentNode.el;
      }

      instance.$currentNode = $currentNode;
      execute($options[afterHook], instance);
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

      if (falsy$1(value)) {
        return;
      }

      var instance = this;
      if (indexOf$1(value, CHAR_OPAREN) > 0) {
        var _ret2 = function () {
          var ast = compile$1(value);
          if (ast.type === CALL) {
            return {
              v: function v(event$$1) {
                var isEvent = event$$1 instanceof Event;
                var args = copy$1(ast.args);
                if (!args.length) {
                  if (isEvent) {
                    push$1(args, event$$1);
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
                          return event$$1;
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
                execute(fn, instance, args);
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


      execute($options[BEFORE_DESTROY], instance);

      if ($children) {
        each($children, function (child) {
          child.destroy();
        }, TRUE);
      }

      if ($parent && $parent.$children) {
        remove($parent.$children, instance);
      }

      if ($currentNode) {
        if (arguments[0] !== TRUE) {
          patch($currentNode, { text: CHAR_BLANK });
        }
      }

      $watchEmitter.off();
      $eventEmitter.off();

      each$1(instance, function (value, key) {
        delete instance[key];
      });

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
      add$1(fn);
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
    key: 'copy',
    value: function copy(target, deep) {
      return copy$1(target, deep);
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

Yox.version = '0.24.3';

/**
 * 工具，便于扩展、插件使用
 */
Yox.is = is$1;
Yox.array = array$1;
Yox.object = object$1;
Yox.string = string$1;
Yox.native = native;
Yox.Event = Event;
Yox.Emitter = Emitter;

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
Yox.nextTick = add$1;

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


    required = required === TRUE || func(required) && required(props);

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
          } else if (required) {
            warn$1('Passing a "' + key + '" prop is not matched.');
          }
        })();
      }
    } else if (required) {
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

  oldDeps = oldDeps || [];

  each(newDeps, function (dep) {
    if (!has$1(oldDeps, dep)) {
      instance.watch(dep, watcher);
    }
  });

  each(oldDeps, function (dep) {
    if (!has$1(newDeps, dep)) {
      instance.unwatch(dep, watcher);
    }
  });
}

function diff(instance) {
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
      diff(child);
    });
  }
}

// 全局注册内置指令
Yox.directive({ ref: ref, event: event, model: model });

return Yox;

})));
