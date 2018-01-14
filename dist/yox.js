(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Yox = factory());
}(this, (function () { 'use strict';













var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new Error("Cannot call a class as a function");
  }
};











var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new Error("Super expression must either be null or a function, not " + typeof superClass);
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

/**
 * 为了压缩，定义的常量
 */
var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;

var RAW_TRUE = 'true';
var RAW_FALSE = 'false';
var RAW_NULL = 'null';
var RAW_UNDEFINED = 'undefined';

var RAW_THIS = 'this';
var RAW_FUNCTION = 'function';

/**
 * 浏览器环境下的 window 对象
 *
 * @type {?Window}
 */
var win = typeof window !== RAW_UNDEFINED ? window : NULL;

/**
 * 浏览器环境下的 document 对象
 *
 * @type {?Document}
 */
var doc = typeof document !== RAW_UNDEFINED ? document : NULL;

/**
 * 空函数
 *
 * @type {Function}
 */
function noop() {
  /** yox */
}

var isDef = function (target) {
  return target !== UNDEFINED;
};

function is(value, type) {
  return type === 'numeric' ? numeric(value) : Object.prototype.toString.call(value).toLowerCase() === '[object ' + type + ']';
}

function func(value) {
  return is(value, RAW_FUNCTION);
}

function array(value) {
  return is(value, 'array');
}

function object(value) {
  // 低版本 IE 会把 null 和 undefined 当作 object
  return value && is(value, 'object');
}

function string(value) {
  return is(value, 'string');
}

function number(value) {
  return is(value, 'number');
}

function boolean(value) {
  return is(value, 'boolean');
}

function numeric(value) {
  return !isNaN(parseFloat(value)) && isFinite(value);
}

function primitive(value) {
  return string(value) || number(value) || boolean(value) || value == NULL;
}

var is$1 = {
	is: is,
	func: func,
	array: array,
	object: object,
	string: string,
	number: number,
	boolean: boolean,
	numeric: numeric,
	primitive: primitive
};

/**
 * 任性地执行一个函数，不管它有没有、是不是
 *
 * @param {?Function} fn 调用的函数
 * @param {*} context 执行函数时的 this 指向
 * @param {*} args 调用函数的参数，多参数时传入数组
 * @return {*} 调用函数的返回值
 */
var execute = function (fn, context, args) {
  if (func(fn)) {
    return array(args) ? fn.apply(context, args) : fn.call(context, args);
  }
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

  Event.prototype.prevent = function () {
    var instance = this;
    if (!instance.isPrevented) {
      var originalEvent = instance.originalEvent;

      if (originalEvent) {
        if (func(originalEvent.prevent)) {
          originalEvent.prevent();
        } else if (func(originalEvent.preventDefault)) {
          originalEvent.preventDefault();
        }
      }
      instance.isPrevented = TRUE;
    }
    return instance;
  };

  Event.prototype.stop = function () {
    var instance = this;
    if (!instance.isStoped) {
      var originalEvent = instance.originalEvent;

      if (originalEvent) {
        if (func(originalEvent.stop)) {
          originalEvent.stop();
        } else if (func(originalEvent.stopPropagation)) {
          originalEvent.stopPropagation();
        }
      }
      instance.isStoped = TRUE;
    }
    return instance;
  };

  return Event;
}();

Event.is = function (target) {
  return target instanceof Event;
};

/**
 * 为了压缩，定义的常用字符
 */

function charAt(str, index) {
  return str.charAt(index || 0);
}

function codeAt(str, index) {
  return str.charCodeAt(index || 0);
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
 * 合并两个数组
 *
 * @param {Array} array1
 * @param {Array} array2
 * @return {Array}
 */
function merge(array1, array2) {
  return array1.concat(array2);
}

/**
 * 添加
 *
 * @param {Array} original
 * @param {*} value
 * @param {string} action
 */
function addItem(original, value, action) {
  if (array(value)) {
    each(value, function (item) {
      original[action](item);
    });
  } else {
    original[action](value);
  }
}

/**
 * 往后加
 *
 * @param {Array} original
 * @param {*} item
 */
function push(original, item) {
  addItem(original, item, 'push');
}

/**
 * 往前加
 *
 * @param {Array} original
 * @param {*} item
 */
function unshift(original, item) {
  addItem(original, item, 'unshift');
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
  var result = {},
      hasValue = arguments.length === 3;
  each(array$$1, function (item, index) {
    result[key ? item[key] : item] = hasValue ? value : item;
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
 * @return {number} 删除的数量
 */
function remove(array$$1, item, strict) {
  var result = 0;
  each(array$$1, function (value, index) {
    if (strict === FALSE ? value == item : value === item) {
      array$$1.splice(index, 1);
      result++;
    }
  }, TRUE);
  return result;
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

var array$1 = {
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
};

/**
 * 连字符转成驼峰
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
 * 删除两侧空白符
 *
 * @param {*} str
 * @return {string}
 */
function trim(str) {
  return falsy$1(str) ? CHAR_BLANK : str.trim();
}

/**
 * 截取字符串
 *
 * @param {string} str
 * @param {number} start
 * @param {?number} end
 * @return {string}
 */
function slice(str, start, end) {
  return number(end) ? str.slice(start, end) : str.slice(start);
}

/**
 * 分割字符串
 *
 * @param {string} str
 * @param {string} delimiter
 * @return {Array}
 */
function split(str, delimiter) {
  return falsy$1(str) ? [] : str.split(new RegExp('\\s*' + delimiter.replace(/[.*?]/g, '\\$&') + '\\s*'));
}

/**
 * 获取子串的起始位置
 *
 * @param {string} str
 * @param {string} part
 * @return {number}
 */
function indexOf$1(str, part) {
  return str.indexOf(part);
}

/**
 * str 是否包含 part
 *
 * @param {string} str
 * @param {string} part
 * @return {boolean}
 */
function has$2(str, part) {
  return indexOf$1(str, part) >= 0;
}

/**
 * str 是否以 part 开始
 *
 * @param {string} str
 * @param {string} part
 * @return {boolean}
 */
function startsWith(str, part) {
  return indexOf$1(str, part) === 0;
}

/**
 * str 是否以 part 结束
 *
 * @param {string} str
 * @param {string} part
 * @return {boolean}
 */
function endsWith(str, part) {
  var offset = str.length - part.length;
  return offset >= 0 && str.lastIndexOf(part) === offset;
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

var string$1 = {
	camelCase: camelCase,
	trim: trim,
	slice: slice,
	split: split,
	indexOf: indexOf$1,
	has: has$2,
	startsWith: startsWith,
	endsWith: endsWith,
	falsy: falsy$1
};

var SEPARATOR_KEY = '.';

var normalizeCache = {};

function normalize(str) {
  if (!falsy$1(str)) {
    var start = indexOf$1(str, CHAR_OBRACK);
    if (start > 0 && indexOf$1(str, CHAR_CBRACK) > start) {
      if (!normalizeCache[str]) {
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
  }
  return str;
}

function filter(term) {
  return term !== CHAR_BLANK && term !== RAW_THIS;
}

function parse(str) {
  var filterable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TRUE;

  var result = normalize(str).split(SEPARATOR_KEY);
  return filterable ? result.filter(filter) : result;
}

function stringify(keypaths) {
  var filterable = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : TRUE;

  if (filterable) {
    keypaths = keypaths.filter(filter);
  }
  return keypaths.join(SEPARATOR_KEY);
}

function startsWith$1(keypath, prefix) {
  var temp;
  if (keypath === prefix) {
    return prefix.length;
  } else if (startsWith(keypath, temp = prefix + SEPARATOR_KEY)) {
    return temp.length;
  } else {
    return FALSE;
  }
}



function join(keypath1, keypath2) {
  // keypath 可以是两种形式
  // 1. 非空字符串
  // 2. 数字
  var result = [];
  if (!falsy$1(keypath1) || number(keypath1)) {
    push(result, keypath1);
  }
  if (!falsy$1(keypath2) || number(keypath2)) {
    push(result, keypath2);
  }
  return stringify(result, FALSE);
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

function sortByAsc(a, b) {
  return a.length - b.length;
}

function sortByDesc(a, b) {
  return b.length - a.length;
}

/**
 * 排序对象的 key
 *
 * @param {Object} object
 * @param {Object} desc 是否逆序，默认从小到大排序
 * @return {Array.<string>}
 */
function sort(object$$1, desc) {
  return keys(object$$1).sort(desc ? sortByDesc : sortByAsc);
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
  // 尽量不用 arguments
  // 提供三个扩展对象足够了吧...
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
      result[index] = deep ? copy(item, deep) : item;
    });
  } else if (object(object$$1)) {
    result = {};
    each$1(object$$1, function (value, key) {
      result[key] = deep ? copy(value, deep) : value;
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

  if (!falsy$1(keypath) && !exists(object$$1, keypath) && indexOf$1(keypath, CHAR_DOT) > 0) {
    var list = parse(keypath);
    for (var i = 0, len = list.length; i < len; i++) {
      if (i < len - 1) {
        object$$1 = object$$1[list[i]];
        if (object$$1 == NULL) {
          return;
        } else if (func(object$$1) && object$$1.getter) {
          object$$1 = object$$1();
        }
      } else {
        keypath = list[i];
      }
    }
  }

  if (exists(object$$1, keypath)) {
    var value = object$$1[keypath];
    if (func(value) && value.getter) {
      value = value();
    }
    return {
      value: value
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
    var name = pop(list);
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
      object$$1[name] = value;
    }
  } else {
    object$$1[keypath] = value;
  }
}

var object$1 = {
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
};

var guid = 0;

var Emitter = function () {

  /**
   *
   * @param {boolean} namespace 是否需要命名空间
   */
  function Emitter(namespace) {
    classCallCheck(this, Emitter);

    this.namespace = namespace;
    this.listeners = {};
  }

  Emitter.prototype.fire = function (type, data, context) {
    var namespace = this.namespace,
        listeners = this.listeners;

    var _parseType = parseType(type, namespace),
        name = _parseType.name,
        space = _parseType.space;

    var isComplete = TRUE,
        list = listeners[name];
    if (list) {

      var event = array(data) ? data[0] : data,
          isEvent = Event.is(event),
          fireId = guid++,
          i = -1,
          j,
          item,
          result;

      while (item = list[++i]) {

        // 当前执行 id
        item.id = fireId;

        if (space && item.space && space !== item.space) {
          continue;
        }

        result = execute(item.func, isDef(context) ? context : item.context, data);

        // 执行次数
        if (item.count > 0) {
          item.count++;
        } else {
          item.count = 1;
        }

        // 注册的 listener 可以指定最大执行次数
        if (item.count === item.max) {
          list.splice(i, 1);
        }

        // 如果没有返回 false，而是调用了 event.stop 也算是返回 false
        if (isEvent) {
          if (result === FALSE) {
            event.prevent().stop();
          } else if (event.isStoped) {
            result = FALSE;
          }
        }

        if (result === FALSE) {
          return isComplete = FALSE;
        }

        // 解绑了一些 event handler
        // 则往回找最远的未执行的 item
        if (i >= 0 && item !== list[i]) {
          j = i;
          while (item = list[i]) {
            if (item.id !== fireId) {
              j = i;
            }
            i--;
          }
          i = j - 1;
        }
      }

      if (!list.length) {
        delete listeners[name];
      }
    }

    return isComplete;
  };

  Emitter.prototype.has = function (type, listener) {
    var namespace = this.namespace,
        listeners = this.listeners,
        _parseType2 = parseType(type, namespace),
        name = _parseType2.name,
        space = _parseType2.space,
        result = TRUE;

    var each$$1 = function (list) {
      each(list, function (item, index) {
        if ((!space || space === item.space) && (!listener || listener === item.func)) {
          return result = FALSE;
        }
      });
      return result;
    };

    if (name) {
      var list = listeners[name];
      if (list) {
        each$$1(list);
      }
    } else if (space) {
      each$1(listeners, each$$1);
    }

    return !result;
  };

  return Emitter;
}();

extend(Emitter.prototype, {
  on: on(),
  once: on({ max: 1 }),
  off: function off(type, listener) {

    var instance = this;

    if (type == NULL) {
      instance.listeners = {};
    } else {
      var _parseType3 = parseType(type, instance.namespace),
          name = _parseType3.name,
          space = _parseType3.space;

      var each$$1 = function (list, name) {
        each(list, function (item, index) {
          if ((!space || space === item.space) && (!listener || listener === item.func)) {
            list.splice(index, 1);
          }
        }, TRUE);
        if (!list.length) {
          delete _listeners[name];
        }
      };

      var _listeners = instance.listeners;

      if (name) {
        var list = _listeners[name];
        if (list) {
          each$$1(list, name);
        }
      } else if (space) {
        each$1(_listeners, each$$1);
      }
    }
  }
});

function on(data) {
  return function (type, listener) {
    var namespace = this.namespace,
        listeners = this.listeners;


    var addListener = function (item, type) {
      if (func(item)) {
        item = { func: item };
      }
      if (object(item) && func(item.func)) {
        if (data) {
          extend(item, data);
        }

        var _parseType4 = parseType(type, namespace),
            name = _parseType4.name,
            space = _parseType4.space;

        item.space = space;
        push(listeners[name] || (listeners[name] = []), item);
      }
    };

    if (object(type)) {
      each$1(type, addListener);
    } else if (string(type)) {
      addListener(listener, type);
    }
  };
}

function parseType(type, namespace) {
  var result = {
    name: type,
    space: CHAR_BLANK
  };
  if (namespace) {
    var index = indexOf$1(type, CHAR_DOT);
    if (index >= 0) {
      result.name = slice(type, 0, index);
      result.space = slice(type, index + 1);
    }
  }
  return result;
}

var toString = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : CHAR_BLANK;

  if (str != NULL && str.toString) {
    return str.toString();
  }
  return defaultValue;
};

/**
 * 是否有原生的日志特性，没有必要单独实现
 *
 * @type {?Object}
 */
var Console = typeof console !== RAW_UNDEFINED ? console : NULL;

var debug = /yox/.test(toString(noop));

// 全局可覆盖
// 比如开发环境，开了 debug 模式，但是有时候觉得看着一堆日志特烦，想强制关掉
// 比如线上环境，关了 debug 模式，为了调试，想强制打开
function isDebug() {
  if (win) {
    var DEBUG = win.DEBUG;

    if (boolean(DEBUG)) {
      return DEBUG;
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
  if (Console && isDebug()) {
    Console.log('[Yox log]: ' + msg);
  }
}

/**
 * 打印警告日志
 *
 * @param {string} msg
 */
function warn(msg) {
  if (Console && isDebug()) {
    Console.warn('[Yox warn]: ' + msg);
  }
}

/**
 * 打印错误日志
 *
 * @param {string} msg
 */
function error$1(msg) {
  if (Console) {
    Console.error('[Yox error]: ' + msg);
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



var logger = {
	log: log,
	warn: warn,
	error: error$1,
	fatal: fatal
};

var isNative = function (fn) {
  if (func(fn)) {
    return has$2(fn.toString(), '[native code]');
  }
};

var nextTick;
if (typeof Promise === RAW_FUNCTION && isNative(Promise)) {
  var promise = Promise.resolve();
  nextTick = function nextTick(fn) {
    promise.then(fn);
    setTimeout(noop);
  };
} else if (typeof MutationObserver === RAW_FUNCTION) {
  nextTick = function nextTick(fn) {
    var observer = new MutationObserver(fn);
    var textNode = doc.createTextNode(CHAR_BLANK);
    observer.observe(textNode, {
      characterData: TRUE
    });
    textNode.data = CHAR_WHITESPACE;
  };
} else if (typeof setImmediate === RAW_FUNCTION) {
  nextTick = setImmediate;
} else {
  nextTick = setTimeout;
}

var nextTick$1 = function (fn) {
  nextTick(fn);
};

var nextTasks = [];

function runTasks() {
  var currentTasks = nextTasks;
  nextTasks = [];
  each(currentTasks, function (task) {
    task();
  });
}

function addTask(name, task) {
  if (!nextTasks.length) {
    nextTick$1(runTasks);
  }
  array$1[name](nextTasks, task);
}

/**
 * 在队尾添加异步任务
 *
 * @param {Function} task
 */
function append(task) {
  addTask('push', task);
}

/**
 * 在队首添加异步任务
 *
 * @param {Function} task
 */
function prepend(task) {
  addTask('unshift', task);
}

function createAttrs(vnode) {
  var el = vnode.el,
      component = vnode.component,
      attrs = vnode.attrs,
      api = this;

  if (!component && attrs) {
    each$1(attrs, function (value, name) {
      api.setAttr(el, name, value);
    });
  }
}

function updateAttrs(vnode, oldVnode) {
  var el = vnode.el,
      component = vnode.component,
      attrs = vnode.attrs,
      oldAttrs = oldVnode.attrs,
      api = this;

  if (component || !attrs && !oldAttrs) {
    return;
  }

  oldAttrs = oldAttrs || {};
  attrs = attrs || {};

  each$1(attrs, function (value, name) {
    if (!has$1(oldAttrs, name) || value !== oldAttrs[name]) {
      api.setAttr(el, name, value);
    }
  });

  each$1(oldAttrs, function (value, name) {
    if (!has$1(attrs, name)) {
      api.removeAttr(el, name);
    }
  });
}

var attrs = {
  create: createAttrs,
  update: updateAttrs
};

function createProps(vnode, oldVnode) {
  var component = vnode.component,
      props = vnode.props;

  if (!component && props) {
    var api = this,
        oldProps = oldVnode && oldVnode.props || {};
    each$1(props, function (value, name) {
      if (value !== oldProps[name]) {
        api.setProp(vnode.el, name, value);
      }
    });
  }
}

function removeProps(vnode, oldVnode) {
  var component = vnode.component,
      props = vnode.props,
      oldProps = oldVnode.props,
      api = this;

  if (!component && oldProps) {
    props = props || {};
    each$1(oldProps, function (value, name) {
      // 现在只有 innerText 和 innerHTML 会走进这里
      // 对于这两种属性，为了确保兼容性，不能设为 null 或 undefined，因为 IE 会认为是字符串 null 或 undefined
      // 但我们真实想要的是置为空字符串
      if (!has$1(props, name)) {
        api.setProp(vnode.el, name, CHAR_BLANK);
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
var props = {
  create: createProps,
  update: removeProps,
  postpatch: createProps
};

function bindDirective(vnode, key, api) {
  var el = vnode.el,
      tag = vnode.tag,
      attrs = vnode.attrs,
      directives = vnode.directives,
      component = vnode.component,
      instance = vnode.instance;


  var node = directives[key],
      options = {
    el: el,
    node: node,
    instance: instance,
    directives: directives,
    attrs: attrs || {}
  };

  if (component) {
    options.component = api.getComponent(el);
  }

  var bind = instance.directive(node.name),
      unbind = bind && bind(options);

  if (func(unbind)) {
    return unbind;
  }
}

function unbindDirective(vnode, key) {
  var unbinds = vnode.unbinds;

  if (unbinds && unbinds[key]) {
    unbinds[key]();
    delete unbinds[key];
  }
}

function updateDirectives(vnode, oldVnode) {

  var newDirectives = vnode.directives;
  var oldDirectives = oldVnode && oldVnode.directives;

  if (!newDirectives && !oldDirectives) {
    return;
  }

  newDirectives = newDirectives || {};
  oldDirectives = oldDirectives || {};

  var api = this,
      newUnbinds;

  each$1(newDirectives, function (directive, key) {
    var unbind;
    if (has$1(oldDirectives, key)) {
      var oldDirective = oldDirectives[key];
      if (directive.value !== oldDirective.value || directive.keypath !== oldDirective.keypath || directive.context.data !== oldDirective.context.data) {
        unbindDirective(oldVnode, key);
        unbind = bindDirective(vnode, key, api);
      }
    } else {
      unbind = bindDirective(vnode, key, api);
    }
    if (unbind) {
      (newUnbinds || (newUnbinds = {}))[key] = unbind;
    }
  });

  each$1(oldDirectives, function (directive, key) {
    if (!has$1(newDirectives, key)) {
      unbindDirective(oldVnode, key);
    }
  });

  var oldUnbinds = oldVnode && oldVnode.unbinds;
  if (oldUnbinds) {
    if (newUnbinds) {
      extend(newUnbinds, oldUnbinds);
    } else {
      newUnbinds = oldUnbinds;
    }
  }

  if (newUnbinds) {
    vnode.unbinds = newUnbinds;
  }
}

function destroyDirectives(vnode) {
  var unbinds = vnode.unbinds;

  if (unbinds) {
    each$1(unbinds, function (unbind) {
      unbind();
    });
  }
}

var directives = {
  create: updateDirectives,
  update: updateDirectives,
  destroy: destroyDirectives
};

function setRef(instance, ref, value) {
  if (ref) {
    var refs = instance.$refs || (instance.$refs = {});
    refs[ref] = value;
  }
}

function removeRef(instance, ref) {
  if (ref) {
    delete instance.$refs[ref];
  }
}

function createComponent(vnode) {
  var el = vnode.el,
      component = vnode.component,
      instance = vnode.instance,
      ref = vnode.ref;

  if (component) {
    el = this.getComponent(el);
  }
  setRef(instance, ref, el);
}

function updateComponent(vnode, oldVnode) {
  var el = vnode.el,
      component = vnode.component,
      instance = vnode.instance,
      ref = vnode.ref;


  if (component) {
    el = this.getComponent(el);
    el.set(vnode.attrs);
  }

  if (oldVnode && oldVnode.ref !== ref) {
    removeRef(instance, oldVnode.ref);
    setRef(instance, ref, el);
  }
}

function destroyComponent(vnode) {
  var el = vnode.el,
      component = vnode.component,
      instance = vnode.instance,
      ref = vnode.ref;
  // 不加 component 会产生递归
  // 因为组件元素既是父组件中的一个子元素，也是组件自己的根元素
  // 因此该元素会产生两个 vnode

  if (component) {
    this.getComponent(el).destroy();
  }
  removeRef(instance, ref);
}

var component = {
  create: createComponent,
  postpatch: updateComponent,
  destroy: destroyComponent
};

var TAG_COMMENT = '!';

var HOOK_CREATE = 'create';
var HOOK_UPDATE = 'update';
var HOOK_POSTPATCH = 'postpatch';
var HOOK_DESTROY = 'destroy';

var modules = [component, attrs, props, directives];

var moduleEmitter = new Emitter();

each([HOOK_CREATE, HOOK_UPDATE, HOOK_POSTPATCH, HOOK_DESTROY], function (hook) {
  each(modules, function (item) {
    moduleEmitter.on(hook, item[hook]);
  });
});

modules = NULL;

function isPatchable(vnode1, vnode2) {
  return vnode1.key === vnode2.key && vnode1.tag === vnode2.tag;
}

function createKeyToIndex(vnodes, startIndex, endIndex) {
  var result = {},
      key;
  while (startIndex <= endIndex) {
    key = vnodes[startIndex].key;
    if (isDef(key)) {
      result[key] = startIndex;
    }
    startIndex++;
  }
  return result;
}

function createCommentVnode(text) {
  return {
    tag: TAG_COMMENT,
    text: toString(text)
  };
}

function createTextVnode(text) {
  return {
    text: toString(text)
  };
}

function isTextVnode(vnode) {
  return vnode && has$1(vnode, 'text') && !has$1(vnode, 'tag');
}

function createElementVnode(tag, attrs$$1, props$$1, directives$$1, children, key, ref, instance) {
  return {
    tag: tag,
    attrs: attrs$$1,
    props: props$$1,
    directives: directives$$1,
    children: children,
    key: key,
    ref: ref,
    instance: instance,
    text: UNDEFINED
  };
}

function createComponentVnode(tag, attrs$$1, props$$1, directives$$1, children, key, ref, instance) {
  var vnode = createElementVnode(tag, attrs$$1, props$$1, directives$$1, children, key, ref, instance);
  vnode.component = TRUE;
  return vnode;
}

function init(api) {

  var createElement = function (parentNode, vnode) {
    var _vnode = vnode,
        el = _vnode.el,
        tag = _vnode.tag,
        component$$1 = _vnode.component,
        children = _vnode.children,
        text = _vnode.text,
        instance = _vnode.instance;


    if (falsy$1(tag)) {
      return vnode.el = api.createText(text);
    }

    if (tag === TAG_COMMENT) {
      return vnode.el = api.createComment(text);
    }

    // 不管是组件还是元素，必须先有一个元素
    el = vnode.el = api.createElement(component$$1 ? 'div' : tag, parentNode);

    if (component$$1) {

      api.setComponent(el, vnode);

      instance.component(tag, function (options) {

        if (!options) {
          fatal('"' + tag + '" component is not found.');
        }

        vnode = api.getComponent(el);

        if (vnode && tag === vnode.tag) {
          component$$1 = (vnode.parent || vnode.instance).create(options, {
            el: el,
            props: vnode.attrs,
            replace: TRUE
          });
          el = component$$1.$el;
          if (!el) {
            fatal('"' + tag + '" component must have a root element.');
          }

          vnode.el = el;
          api.setComponent(el, component$$1);

          moduleEmitter.fire(HOOK_CREATE, vnode, api);
        }
      });
    } else {

      if (array(children)) {
        addVnodes(el, children, 0, children.length - 1);
      } else if (string(text)) {
        api.append(el, api.createText(text));
      }

      moduleEmitter.fire(HOOK_CREATE, vnode, api);
    }

    return el;
  };

  var addVnodes = function (parentNode, vnodes, startIndex, endIndex, before) {
    while (startIndex <= endIndex) {
      addVnode(parentNode, vnodes[startIndex], before);
      startIndex++;
    }
  };

  var addVnode = function (parentNode, vnode, before) {
    var el = createElement(parentNode, vnode);
    if (el) {
      api.before(parentNode, el, before);
    }
  };

  var removeVnodes = function (parentNode, vnodes, startIndex, endIndex) {
    var vnode;
    while (startIndex <= endIndex) {
      vnode = vnodes[startIndex];
      if (vnode) {
        removeVnode(parentNode, vnode);
      }
      startIndex++;
    }
  };

  var removeVnode = function (parentNode, vnode) {
    var tag = vnode.tag,
        el = vnode.el,
        component$$1 = vnode.component;

    if (tag) {
      if (component$$1) {
        component$$1 = api.getComponent(el);
        if (component$$1.set) {
          destroyVnode(vnode);
        } else {
          api.remove(parentNode, el);
        }
        api.setComponent(el, NULL);
      } else {
        destroyVnode(vnode);
        api.remove(parentNode, el);
      }
    } else if (el) {
      api.remove(parentNode, el);
    }
  };

  var destroyVnode = function (vnode) {
    var children = vnode.children;

    if (children) {
      each(children, function (child) {
        destroyVnode(child);
      });
    }
    moduleEmitter.fire(HOOK_DESTROY, vnode, api);
  };

  var replaceVnode = function (parentNode, oldVnode, vnode) {
    api.before(parentNode, vnode.el, oldVnode.el);
    removeVnode(parentNode, oldVnode);
  };

  var updateChildren = function (parentNode, oldChildren, newChildren) {

    var oldStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var oldStartVnode = oldChildren[oldStartIndex];
    var oldEndVnode = oldChildren[oldEndIndex];

    var newStartIndex = 0;
    var newEndIndex = newChildren.length - 1;
    var newStartVnode = newChildren[newStartIndex];
    var newEndVnode = newChildren[newEndIndex];

    var oldKeyToIndex,
        oldIndex,
        activeVnode;

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

      // 下面有设为 NULL 的逻辑
      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex]; // Vnode has been moved left
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      }

      // 从头到尾比较，位置相同且值得 patch
      else if (isPatchable(oldStartVnode, newStartVnode)) {
          patchVnode(oldStartVnode, newStartVnode);
          oldStartVnode = oldChildren[++oldStartIndex];
          newStartVnode = newChildren[++newStartIndex];
        }

        // 从尾到头比较，位置相同且值得 patch
        else if (isPatchable(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode);
            oldEndVnode = oldChildren[--oldEndIndex];
            newEndVnode = newChildren[--newEndIndex];
          }

          // 比较完两侧的节点，剩下就是 位置发生改变的节点 和 全新的节点

          // 当 oldStartVnode 和 newEndVnode 值得 patch
          // 说明元素被移到右边了
          else if (isPatchable(oldStartVnode, newEndVnode)) {
              patchVnode(oldStartVnode, newEndVnode);
              api.before(parentNode, oldStartVnode.el, api.next(oldEndVnode.el));
              oldStartVnode = oldChildren[++oldStartIndex];
              newEndVnode = newChildren[--newEndIndex];
            }

            // 当 oldEndVnode 和 newStartVnode 值得 patch
            // 说明元素被移到左边了
            else if (isPatchable(oldEndVnode, newStartVnode)) {
                patchVnode(oldEndVnode, newStartVnode);
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
                    patchVnode(activeVnode, newStartVnode);
                    oldChildren[oldIndex] = NULL;
                  }
                  // 新元素
                  else {
                      activeVnode = createElement(parentNode, newStartVnode);
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
      addVnodes(parentNode, newChildren, newStartIndex, newEndIndex, activeVnode ? activeVnode.el : NULL);
    } else if (newStartIndex > newEndIndex) {
      removeVnodes(parentNode, oldChildren, oldStartIndex, oldEndIndex);
    }
  };

  var patchVnode = function (oldVnode, vnode) {

    if (oldVnode === vnode) {
      return;
    }

    var el = oldVnode.el,
        component$$1 = oldVnode.component;

    vnode.el = el;

    if (!isPatchable(oldVnode, vnode)) {
      var parentNode = api.parent(el);
      if (createElement(parentNode, vnode)) {
        parentNode && replaceVnode(parentNode, oldVnode, vnode);
      }
      return;
    }

    if (component$$1) {
      component$$1 = api.getComponent(el);
      if (!component$$1.set) {
        api.setComponent(el, vnode);
        return;
      }
    }

    var args = [vnode, oldVnode];
    moduleEmitter.fire(HOOK_UPDATE, args, api);

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
          updateChildren(el, oldChildren, newChildren);
        }
      }
      // 有新的没旧的 - 新增节点
      else if (newChildren) {
          if (string(oldText)) {
            api.text(el, CHAR_BLANK);
          }
          addVnodes(el, newChildren, 0, newChildren.length - 1);
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

    moduleEmitter.fire(HOOK_POSTPATCH, args, api);
  };

  return function (oldVnode, vnode) {

    patchVnode(api.isElement(oldVnode) ? {
      el: oldVnode,
      tag: api.tag(oldVnode)
    } : oldVnode, vnode);

    return vnode;
  };
}

var snabbdom = {
	createCommentVnode: createCommentVnode,
	createTextVnode: createTextVnode,
	isTextVnode: isTextVnode,
	createElementVnode: createElementVnode,
	createComponentVnode: createComponentVnode,
	init: init
};

var SYNTAX_IF = '#if';
var SYNTAX_ELSE = 'else';
var SYNTAX_ELSE_IF = 'else if';
var SYNTAX_EACH = '#each';
var SYNTAX_PARTIAL = '#partial';
var SYNTAX_IMPORT = '>';
var SYNTAX_SPREAD = '...';
var SYNTAX_COMMENT = /^!\s/;

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';
var SPECIAL_CHILDREN = '$children';

var DIRECTIVE_CUSTOM_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';
var DIRECTIVE_EVENT = 'event';
var DIRECTIVE_BINDING = 'binding';

var KEYWORD_REF = 'ref';
var KEYWORD_UNIQUE = 'key';

var HOOK_BEFORE_CREATE = 'beforeCreate';
var HOOK_AFTER_CREATE = 'afterCreate';
var HOOK_BEFORE_MOUNT = 'beforeMount';
var HOOK_AFTER_MOUNT = 'afterMount';
var HOOK_BEFORE_UPDATE = 'beforeUpdate';
var HOOK_AFTER_UPDATE = 'afterUpdate';
var HOOK_BEFORE_DESTROY = 'beforeDestroy';
var HOOK_AFTER_DESTROY = 'afterDestroy';

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
 * 对象表达式
 *
 * @type {number}
 */
var OBJECT = 8;

/**
 * 函数调用表达式，如 a()
 *
 * @type {number}
 */
var CALL = 9;

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
 * 节点基类
 */

var Node = function (type, raw) {
  classCallCheck(this, Node);

  this.type = type;
  this.raw = trim(raw);
};

/**
 * Array 节点
 *
 * @param {string} raw 源码
 * @param {Array.<Node>} elements 数组元素
 */

var Array$1 = function (_Node) {
  inherits(Array, _Node);

  function Array(raw, elements) {
    classCallCheck(this, Array);

    var _this = possibleConstructorReturn(this, _Node.call(this, ARRAY, raw));

    _this.elements = elements;
    return _this;
  }

  return Array;
}(Node);

/**
 * Object 节点
 *
 * @param {string} raw 源码
 * @param {Array.<string>} keys
 * @param {Array.<Node>} values
 */

var Object$1 = function (_Node) {
  inherits(Object, _Node);

  function Object(raw, keys, values) {
    classCallCheck(this, Object);

    var _this = possibleConstructorReturn(this, _Node.call(this, OBJECT, raw));

    _this.keys = keys;
    _this.values = values;
    return _this;
  }

  return Object;
}(Node);

/**
 * Binary 节点
 *
 * @param {string} raw
 * @param {Node} left
 * @param {string} operator
 * @param {Node} right
 */

var Binary = function (_Node) {
  inherits(Binary, _Node);

  function Binary(raw, left, operator, right) {
    classCallCheck(this, Binary);

    var _this = possibleConstructorReturn(this, _Node.call(this, BINARY, raw));

    _this.left = left;
    _this.operator = operator;
    _this.right = right;
    return _this;
  }

  return Binary;
}(Node);

/**
 * Call 节点
 *
 * @param {string} raw
 * @param {Node} callee
 * @param {Array.<Node>} args
 */

var Call = function (_Node) {
  inherits(Call, _Node);

  function Call(raw, callee, args) {
    classCallCheck(this, Call);

    var _this = possibleConstructorReturn(this, _Node.call(this, CALL, raw));

    _this.callee = callee;
    _this.args = args;
    return _this;
  }

  return Call;
}(Node);

/**
 * Ternary 节点
 *
 * @param {string} raw
 * @param {Node} test
 * @param {Node} yes
 * @param {Node} no
 */

var Ternary = function (_Node) {
  inherits(Ternary, _Node);

  function Ternary(raw, test, yes, no) {
    classCallCheck(this, Ternary);

    var _this = possibleConstructorReturn(this, _Node.call(this, TERNARY, raw));

    _this.test = test;
    _this.yes = yes;
    _this.no = no;
    return _this;
  }

  return Ternary;
}(Node);

/**
 * Identifier 节点
 *
 * @param {string} raw
 * @param {string} name
 */

var Identifier = function (_Node) {
  inherits(Identifier, _Node);

  function Identifier(raw, name) {
    classCallCheck(this, Identifier);

    var _this = possibleConstructorReturn(this, _Node.call(this, IDENTIFIER, raw));

    _this.name = name;
    _this.keypath = name;
    return _this;
  }

  return Identifier;
}(Node);

/**
 * Literal 节点
 *
 * @param {string} raw
 * @param {*} value
 */

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(raw, value) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, _Node.call(this, LITERAL, raw));

    _this.value = value;
    return _this;
  }

  return Literal;
}(Node);

/**
 * Member 节点
 *
 * @param {string} raw
 * @param {Node} object
 * @param {Node} prop
 */

var Member = function (_Node) {
  inherits(Member, _Node);

  function Member(raw, object, prop) {
    classCallCheck(this, Member);

    var _this = possibleConstructorReturn(this, _Node.call(this, MEMBER, raw));

    var props = [];
    if (object.type === MEMBER) {
      push(props, object.props);
    } else {
      push(props, object);
    }

    push(props, prop);

    _this.props = props;

    if (object.keypath && prop.type === LITERAL) {
      _this.keypath = join(object.keypath, prop.value);
    }

    return _this;
  }

  return Member;
}(Node);

/**
 * Unary 节点
 *
 * @param {string} raw
 * @param {string} operator
 * @param {Node} arg
 */

var Unary = function (_Node) {
  inherits(Unary, _Node);

  function Unary(raw, operator, arg) {
    classCallCheck(this, Unary);

    var _this = possibleConstructorReturn(this, _Node.call(this, UNARY, raw));

    _this.operator = operator;
    _this.arg = arg;
    return _this;
  }

  return Unary;
}(Node);

// 区分关键字和普通变量
// 举个例子：a === true
// 从解析器的角度来说，a 和 true 是一样的 token
var keywords = {};

keywords[RAW_TRUE] = TRUE;
keywords[RAW_FALSE] = FALSE;
keywords[RAW_NULL] = NULL;
keywords[RAW_UNDEFINED] = UNDEFINED;

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

  var length = content.length,
      index = 0,
      charCode;

  var throwError = function () {
    fatal('Failed to compile expression: ' + CHAR_BREAKLINE + content);
  };

  var getCharCode = function () {
    return codeAt(content, index);
  };

  var cutString = function (start, end) {
    return content.substring(start, end == NULL ? index : end);
  };

  var skipWhitespace = function () {
    while ((charCode = getCharCode()) && (charCode === CODE_WHITESPACE || charCode === CODE_TAB)) {
      index++;
    }
  };

  var skipNumber = function () {
    if (getCharCode() === CODE_DOT) {
      skipDecimal();
    } else {
      skipDigit();
      if (getCharCode() === CODE_DOT) {
        skipDecimal();
      }
    }
  };

  var skipDigit = function () {
    do {
      index++;
    } while (isDigit(getCharCode()));
  };

  var skipDecimal = function () {
    // 跳过点号
    index++;
    // 后面必须紧跟数字
    if (isDigit(getCharCode())) {
      skipDigit();
    } else {
      throwError();
    }
  };

  var skipString = function () {

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

  var skipIdentifier = function () {
    // 第一个字符一定是经过 isIdentifierStart 判断的
    // 因此循环至少要执行一次
    do {
      index++;
    } while (isIdentifierPart(getCharCode()));
  };

  var parseIdentifier = function (careKeyword) {

    var start = index;
    skipIdentifier();

    var literal = cutString(start);
    if (literal) {
      return careKeyword && has$1(keywords, literal) ? new Literal(literal, keywords[literal]) : new Identifier(literal, literal);
    }

    throwError();
  };

  var parseTuple = function (delimiter) {

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

  var parseObject = function () {

    var keys$$1 = [],
        values = [],
        current = keys$$1;

    // 跳过开始字符 {
    index++;

    while (index < length) {
      charCode = getCharCode();
      // }
      if (charCode === CODE_CBRACE) {
        index++;
        if (keys$$1.length !== values.length) {
          throwError();
        }
        return {
          keys: keys$$1.map(function (item) {
            if (item.type === IDENTIFIER) {
              return item.name;
            } else if (item.type === LITERAL) {
              return item.value;
            } else {
              throwError();
            }
          }),
          values: values
        };
      }
      // :
      else if (charCode === CODE_COLON) {
          current = values;
          index++;
        }
        // ,
        else if (charCode === CODE_COMMA) {
            current = keys$$1;
            index++;
          } else {
            push(current, parseExpression());
          }
    }

    throwError();
  };

  var parseOperator = function (sortedOperatorList) {

    skipWhitespace();

    var value = slice(content, index),
        match;
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

  var parseVariable = function () {

    var start = index,
        node = parseIdentifier(TRUE),
        temp;

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
          node = new Member(cutString(start), node, new Literal(temp.raw, temp.name));
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

  var parseToken = function () {

    skipWhitespace();

    charCode = getCharCode();

    var start = index,
        temp;

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
        } else if (charCode === CODE_OBRACE) {
          temp = parseObject();
          return new Object$1(cutString(start), temp.keys, temp.values);
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

  var parseBinary = function () {

    var stack = [index, parseToken(), index],
        next,
        length;

    // stack 的结构必须是 token 之后跟一个 index
    // 这样在裁剪原始字符串时，才有据可查

    // 处理优先级，确保循环结束时，是相同的优先级操作
    while (next = parseOperator(binaryList)) {

      length = stack.length;

      if (length > 7 && binaryMap[next] < stack[length - 4]) {
        stack.splice(length - 7, 6, new Binary(cutString(stack[length - 8], stack[length - 1]), stack[length - 7], stack[length - 5], stack[length - 2]));
      }

      push(stack, next);
      push(stack, binaryMap[next]);
      push(stack, index);
      push(stack, parseToken());
      push(stack, index);
    }

    while (TRUE) {
      length = stack.length;
      if (length > 8 && stack[length - 4] > stack[length - 9]) {
        stack.splice(length - 7, 6, new Binary(cutString(stack[length - 8], stack[length - 1]), stack[length - 7], stack[length - 5], stack[length - 2]));
      } else if (length > 7) {
        stack.splice(1, 6, new Binary(cutString(stack[0], stack[7]), stack[1], stack[3], stack[6]));
      } else {
        return stack[1];
      }
    }
  };

  var parseExpression = function (delimiter) {

    // 主要是区分三元和二元表达式
    // 三元表达式可以认为是 3 个二元表达式组成的
    // test ? yes : no

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

      var yes = parseBinary();
      skipWhitespace();

      if (getCharCode() === CODE_COLON) {
        index++;

        var no = parseBinary();
        skipWhitespace();

        return new Ternary(cutString(start), test, yes, no);
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
var IF = 5;

/**
 * else if 节点
 *
 * @type {number}
 */
var ELSE_IF = 6;

/**
 * else 节点
 *
 * @type {number}
 */
var ELSE = 7;

/**
 * each 节点
 *
 * @type {number}
 */
var EACH = 8;

/**
 * partial 节点
 *
 * @type {number}
 */
var PARTIAL = 9;

/**
 * import 节点
 *
 * @type {number}
 */
var IMPORT = 10;

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
var SPREAD = 12;

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

ifTypes[IF] = ifTypes[ELSE_IF] = elseTypes[ELSE_IF] = elseTypes[ELSE] = htmlTypes[ELEMENT] = htmlTypes[ATTRIBUTE] = htmlTypes[DIRECTIVE] = leafTypes[TEXT] = leafTypes[IMPORT] = leafTypes[SPREAD] = leafTypes[EXPRESSION] = builtInDirectives[DIRECTIVE_LAZY] = builtInDirectives[DIRECTIVE_MODEL] = TRUE;

name2Type['if'] = IF;
name2Type['each'] = EACH;
name2Type['partial'] = PARTIAL;

each$1(name2Type, function (type, name) {
  type2Name[type] = name;
});

/**
 * 节点基类
 */
var Node$2 = function (type) {
  classCallCheck(this, Node$2);

  this.type = type;
};

/**
 * 属性节点
 *
 * @param {string|Expression} name 属性名
 */

var Attribute = function (_Node) {
  inherits(Attribute, _Node);

  function Attribute(name) {
    classCallCheck(this, Attribute);

    var _this = possibleConstructorReturn(this, _Node.call(this, ATTRIBUTE));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, DIRECTIVE));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, EACH));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, ELEMENT));

    _this.name = name;
    if (component) {
      _this.component = component;
    }
    return _this;
  }

  return Element;
}(Node$2);

/**
 * else 节点
 */

var Else = function (_Node) {
  inherits(Else, _Node);

  function Else() {
    classCallCheck(this, Else);
    return possibleConstructorReturn(this, _Node.call(this, ELSE));
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

    var _this = possibleConstructorReturn(this, _Node.call(this, ELSE_IF));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, EXPRESSION));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, IF));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, IMPORT));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, PARTIAL));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, SPREAD));

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

    var _this = possibleConstructorReturn(this, _Node.call(this, TEXT));

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
var selfClosingTagNames = ['area', 'base', 'embed', 'track', 'source', 'param', 'input', 'col', 'img', 'br', 'hr'];

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
 * 换行符比较神奇，有时候你明明看不到换行符，却真的存在一个，那就是 \r
 *
 * @param {string} content
 * @return {string}
 */
function trimBreakline(content) {
  return content.replace(/^\s*[\n|\r]\s*|\s*[\n|\r]\s*$/g, CHAR_BLANK);
}

/**
 * 把一堆插值优化成表达式
 *
 * @param {Array} children
 */
function optimizeExpression(children) {

  // "xxx{{name}}" => 优化成 {{ 'xxx' + name }}
  // "xxx{{name1}}{{name2}} => 优化成 {{ 'xxx' + name1 + name2 }}"

  var current,
      blankString = new Literal(CHAR_BLANK, CHAR_BLANK);

  var addNode = function (node) {
    if (!current) {
      current = node;
    } else {
      // 为了确保是字符串拼接，而不是加法，多个相加时，第一个必须确保是空字符串
      if (current.type !== BINARY || current.raw !== CHAR_BLANK) {
        current = new Binary(CHAR_BLANK, blankString, '+', current);
      }
      current = new Binary(CHAR_BLANK, current, '+', node);
    }
  };

  each(children, function (child) {
    var _child = child,
        type = _child.type,
        expr = _child.expr,
        text = _child.text;

    if (type === EXPRESSION && expr.raw !== SPECIAL_CHILDREN) {
      addNode(child.expr);
    } else if (type === TEXT) {
      addNode(new Literal(CHAR_BLANK, text));
    } else if (type === IF) {

      var list = [],
          _children;

      var append = function (node) {
        var last$$1 = last(list);
        if (last$$1) {
          last$$1.no = node;
        }
        push(list, node);
      };

      while (child) {
        _children = child.children;
        if (_children) {
          _children = optimizeExpression(_children);
          if (_children) {
            _children = _children.expr;
          } else {
            current = NULL;
            return FALSE;
          }
        }
        if (!_children) {
          _children = blankString;
        }
        if (child.expr) {
          append(new Ternary(CHAR_BLANK, child.expr, _children, blankString));
        } else {
          append(_children);
        }
        child = child.next;
      }

      addNode(list[0]);
    } else {
      current = NULL;
      return FALSE;
    }
  });

  if (current) {
    return new Expression(current, TRUE);
  }
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
      currentQuote;

  var throwError = function (msg) {
    fatal('Error compiling template:' + CHAR_BREAKLINE + content + CHAR_BREAKLINE + '- ' + msg);
  };

  var popSelfClosingElementIfNeeded = function (popingTagName) {
    var lastNode = last(nodeStack);
    if (lastNode && lastNode.type === ELEMENT && lastNode.name !== popingTagName && has(selfClosingTagNames, lastNode.name)) {
      popStack(ELEMENT, lastNode.name);
    }
  };

  var popStack = function (type, expectedTagName) {

    /**
     * <div>
     *    <input>
     * </div>
     */
    if (expectedTagName) {
      popSelfClosingElementIfNeeded(expectedTagName);
    }

    var target;

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
          children = _target.children,
          component = _target.component;

      if (type === ELEMENT && expectedTagName && name !== expectedTagName) {
        throwError('end tag expected </' + name + '> to be </' + expectedTagName + '>.');
      }

      if (number(divider)) {
        delete target.divider;
      }

      // ==========================================
      // 以下是性能优化的逻辑
      // ==========================================

      // 如果 children 没实际的数据，删掉它
      // 避免在渲染阶段增加计算量
      if (children && !children.length) {
        children = NULL;
        delete target.children;
      }

      if (!children) {
        return;
      }

      if (type === ELEMENT) {

        var realChildren = children.slice(divider);
        if (realChildren.length > 1) {
          var result = optimizeExpression(realChildren);
          if (result) {
            children.length = divider;
            push(children, result);
          }
        }

        if (children.length - divider === 1) {
          var singleChild = last(children);
          if (singleChild.type === TEXT) {
            if (component) {
              var attr = new Attribute(SPECIAL_CHILDREN);
              attr.children = [singleChild];
              children[divider] = attr;
            } else {
              target.props = {
                textContent: singleChild.text
              };
              pop(children);
            }
          } else if (singleChild.type === EXPRESSION && singleChild.expr.raw !== SPECIAL_CHILDREN) {
            if (component) {
              var _attr = new Attribute(SPECIAL_CHILDREN);
              _attr.children = [singleChild];
              children[divider] = _attr;
            } else {
              var props = {};
              if (singleChild.safe === FALSE) {
                props.innerHTML = singleChild.expr;
              } else {
                props.textContent = singleChild.expr;
              }
              target.props = props;
              pop(children);
            }
          }

          if (!children.length) {
            delete target.children;
          }
        }
      } else {

        if (children.length > 1) {
          var _result = optimizeExpression(children);
          if (_result) {
            children.length = 0;
            push(children, _result);
          }
        }

        var _singleChild = children.length === 1 && children[0];

        if (type === ATTRIBUTE) {
          // <div key="xx">
          // <div ref="xx">
          if (name === KEYWORD_UNIQUE || name === KEYWORD_REF) {
            // 把数据从属性中提出来，减少渲染时的遍历
            var element = last(htmlStack);
            remove(element.children, target);
            if (!element.children.length) {
              delete element.children;
            }
            if (_singleChild) {
              // 为了提升性能，这些特殊属性不支持插值
              if (_singleChild.type === TEXT) {
                element[name] = _singleChild.text;
              } else if (_singleChild.type === EXPRESSION) {
                element[name] = _singleChild.expr;
              }
            }
            return;
          }
        }

        if (_singleChild) {
          if (_singleChild.type === TEXT) {
            // 指令的值如果是纯文本，可以预编译表达式，提升性能
            var text = _singleChild.text;

            if (type === DIRECTIVE) {
              target.expr = compile$1(text);
              target.value = text;
              delete target.children;
            }
            // 属性的值如果是纯文本，直接获取文本值
            // 减少渲染时的遍历
            else if (type === ATTRIBUTE) {
                target.value = text;
                delete target.children;
              }
          }
          // <div class="{{className}}">
          // 把 Attribute 转成 单向绑定 指令，可实现精确更新视图
          else if (type === ATTRIBUTE && _singleChild.type === EXPRESSION) {
              var expr = _singleChild.expr;

              target.expr = expr;
              delete target.children;
              if (string(expr.keypath)) {
                target.binding = expr.keypath;
              }
            }
        }
      }
    } else {
      throwError('{{/' + type2Name[type] + '}} is not a pair.');
    }
  };

  var addChild = function (node) {
    var type = node.type,
        text = node.text;


    if (type === TEXT) {
      if (isBreakline(text) || !(text = trimBreakline(text))) {
        return;
      }
      node.text = text;
    }

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
    if (!htmlStack.length) {
      popSelfClosingElementIfNeeded();
    }

    if (elseTypes[type]) {
      var ifNode = pop(ifStack);
      ifNode.next = node;
      popStack(ifNode.type);
      push(ifStack, node);
      push(nodeStack, node);
      return;
    }

    var prevNode;

    var currentNode = last(nodeStack);
    if (currentNode) {
      var children = currentNode.children,
          divider = currentNode.divider;

      if (children) {
        if (children.length !== divider) {
          prevNode = children[children.length - 1];
        }
      } else {
        children = currentNode.children = [];
      }
      push(children, node);
    } else {
      prevNode = last(nodeList);
      push(nodeList, node);
    }

    // 上一个 if 节点没有 else 分支
    // 在渲染时，如果这种 if 分支为 false，需要加上注释节点
    if (prevNode && ifTypes[prevNode.type] && !htmlStack.length) {
      prevNode.stump = TRUE;
    }

    if (ifTypes[type]) {
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
        if (match[1] === CHAR_SLASH) {
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
          currentChar,
          closed;
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
    if (startsWith(source, SYNTAX_EACH)) {
      var terms = split(slicePrefix(source, SYNTAX_EACH), CHAR_COLON);
      if (terms[0]) {
        return new Each(compile$1(trim(terms[0])), trim(terms[1]));
      }
      throwError('invalid each: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, SYNTAX_IMPORT)) {
      source = slicePrefix(source, SYNTAX_IMPORT);
      return source ? new Import(source) : throwError('invalid import: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, SYNTAX_PARTIAL)) {
      source = slicePrefix(source, SYNTAX_PARTIAL);
      return source ? new Partial(source) : throwError('invalid partial: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, SYNTAX_IF)) {
      source = slicePrefix(source, SYNTAX_IF);
      return source ? new If(compile$1(source)) : throwError('invalid if: ' + all);
    }
  }, function (source, all) {
    if (startsWith(source, SYNTAX_ELSE_IF)) {
      source = slicePrefix(source, SYNTAX_ELSE_IF);
      return source ? new ElseIf(compile$1(source)) : throwError('invalid else if: ' + all);
    }
  }, function (source) {
    if (startsWith(source, SYNTAX_ELSE)) {
      return new Else();
    }
  }, function (source, all) {
    if (startsWith(source, SYNTAX_SPREAD)) {
      source = slicePrefix(source, SYNTAX_SPREAD);
      return source ? new Spread(compile$1(source)) : throwError('invalid spread: ' + all);
    }
  }, function (source, all) {
    if (!SYNTAX_COMMENT.test(source)) {
      source = trim(source);
      return source ? new Expression(compile$1(source), !endsWith(all, '}}}')) : throwError('invalid expression: ' + all);
    }
  }];

  var parseHtml = function (content) {
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

  var parseDelimiter = function (content, all) {
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
      match;

  // 干掉 html 注释
  str = str.replace(/<!--[\s\S]*?-->/g, function () {
    return CHAR_BLANK;
  });

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

var unary = {};

unary[PLUS] = function (a) {
  return +a;
};
unary[MINUS] = function (a) {
  return -a;
};
unary[NOT] = function (a) {
  return !a;
};
unary[WAVE] = function (a) {
  return ~a;
};
unary[BOOLEAN] = function (a) {
  return !!a;
};

var binary = {};

binary[OR] = function (a, b) {
  return a || b;
};
binary[AND] = function (a, b) {
  return a && b;
};
binary[SE] = function (a, b) {
  return a === b;
};
binary[SNE] = function (a, b) {
  return a !== b;
};
binary[LE] = function (a, b) {
  return a == b;
};
binary[LNE] = function (a, b) {
  return a != b;
};
binary[LT] = function (a, b) {
  return a < b;
};
binary[LTE] = function (a, b) {
  return a <= b;
};
binary[GT] = function (a, b) {
  return a > b;
};
binary[GTE] = function (a, b) {
  return a >= b;
};
binary[PLUS] = function (a, b) {
  return a + b;
};
binary[MINUS] = function (a, b) {
  return a - b;
};
binary[MULTIPLY] = function (a, b) {
  return a * b;
};
binary[DIVIDE] = function (a, b) {
  return a / b;
};
binary[MODULO] = function (a, b) {
  return a % b;
};

var executor = {};

executor[LITERAL] = function (node) {
  return node.value;
};

executor[IDENTIFIER] = function (node, getter) {
  return getter(node.name);
};

executor[MEMBER] = function (node, getter, context) {
  var keypath = node.keypath;

  if (!keypath) {
    var keypaths = node.props.map(function (node, index) {
      var type = node.type;

      if (type !== LITERAL) {
        if (index > 0) {
          return execute$1(node, getter, context);
        } else if (type === IDENTIFIER) {
          return node.name;
        }
      } else {
        return node.value;
      }
    });
    keypath = stringify(keypaths, FALSE);
  }
  return getter(keypath);
};

executor[UNARY] = function (node, getter, context) {
  return unary[node.operator](execute$1(node.arg, getter, context));
};

executor[BINARY] = function (node, getter, context) {
  return binary[node.operator](execute$1(node.left, getter, context), execute$1(node.right, getter, context));
};

executor[TERNARY] = function (node, getter, context) {
  return execute$1(node.test, getter, context) ? execute$1(node.yes, getter, context) : execute$1(node.no, getter, context);
};

executor[ARRAY] = function (node, getter, context) {
  return node.elements.map(function (node) {
    return execute$1(node, getter, context);
  });
};

executor[OBJECT] = function (node, getter, context) {
  var result = {};
  each(node.keys, function (key, index) {
    result[key] = execute$1(node.values[index], getter, context);
  });
  return result;
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

var Context = function () {

  /**
   * @param {Object} context
   * @param {string} keypath
   * @param {?Context} parent
   */
  function Context(data, keypath, parent) {
    classCallCheck(this, Context);


    var instance = this,
        temp = {};
    temp[SPECIAL_KEYPATH] = keypath;

    instance.data = data;
    instance.temp = temp;
    instance.cache = {};

    if (parent) {
      instance.parent = parent;
    }
  }

  Context.prototype.push = function (data, keypath) {
    return new Context(data, keypath, this);
  };

  Context.prototype.pop = function () {
    return this.parent;
  };

  Context.prototype.set = function (key, value) {
    var temp = this.temp,
        cache = this.cache;

    var _formatKeypath = formatKeypath(key),
        keypath = _formatKeypath.keypath;

    if (keypath) {
      if (has$1(cache, keypath)) {
        delete cache[keypath];
      }
      temp[keypath] = value;
    }
  };

  Context.prototype.get = function (key) {

    var instance = this;
    var _instance = instance,
        data = _instance.data,
        temp = _instance.temp,
        cache = _instance.cache;

    var _formatKeypath2 = formatKeypath(key),
        keypath = _formatKeypath2.keypath,
        lookup = _formatKeypath2.lookup;

    if (!has$1(cache, keypath)) {

      var result;

      if (keypath) {

        var getValue = function (instance, keypath) {
          var data = instance.data,
              temp = instance.temp,
              result;

          if (exists(temp, keypath)) {
            result = {
              temp: TRUE,
              value: temp[keypath]
            };
          } else {
            result = get$1(data, keypath);
            if (result && isNative(result.value)) {
              warn('find a native function by ' + keypath + '.');
            }
          }
          return result;
        };

        if (lookup) {
          while (instance) {
            result = getValue(instance, keypath);
            if (result) {
              break;
            } else {
              instance = instance.parent;
            }
          }
        } else {
          result = getValue(instance, keypath);
        }
      } else {
        result = {
          value: data
        };
      }

      if (result) {
        result.keypath = join(instance.temp[SPECIAL_KEYPATH], keypath);
        cache[keypath] = result;
      }
    }

    cache = cache[keypath];
    if (cache) {
      return cache;
    }

    return {
      keypath: join(temp[SPECIAL_KEYPATH], keypath)
    };
  };

  return Context;
}();

function formatKeypath(keypath) {
  keypath = normalize(keypath);
  var lookup = TRUE,
      length = startsWith$1(keypath, RAW_THIS);
  if (number(length)) {
    keypath = slice(keypath, length);
    lookup = FALSE;
  }
  return { keypath: keypath, lookup: lookup };
}

var TEXT$1 = 'text';
var VALUE = 'value';

/**
 * 渲染抽象语法树
 *
 * @param {Object} ast 编译出来的抽象语法树
 * @param {Object} data 渲染模板的数据
 * @param {Yox} instance 组件实例
 * @return {Object}
 */
function render(ast, data, instance) {

  // 为了减少字符，一个 let 定义完所有变量
  // 这里不考虑是否一行过长
  var keypath = CHAR_BLANK,
      keypathList = [],
      context = new Context(data, keypath),
      nodeStack = [],
      htmlStack = [],
      partials = {},
      deps = {},
      enter = {},
      leave = {},
      cache,
      prevCache,
      currentCache,
      cacheDeps;

  var updateKeypath = function () {
    keypath = stringify(keypathList);
  };

  var addChild = function (parent, child) {

    if (parent && isDef(child)) {

      if (parent.type === ELEMENT) {

        var children = parent.children || (parent.children = []);
        var prevChild = last(children);

        if (array(child)) {
          each(child, function (item) {
            if (has$1(item, TEXT$1)) {
              item.parent = instance;
              children.push(item);
            }
          });
        } else if (object(child)) {
          if (has$1(child, TEXT$1)) {
            children.push(child);
          }
        } else {
          if (isTextVnode(prevChild)) {
            prevChild[TEXT$1] += toString(child);
          } else {
            children.push(createTextVnode(child));
          }
        }
      } else {
        if (has$1(parent, VALUE)) {
          parent.value += child;
        } else {
          parent.value = child;
        }
      }
    }
  };

  var addAttr = function (parent, key, value) {
    var attrs = parent.attrs || (parent.attrs = {});
    attrs[key] = value;
  };

  var addDirective = function (parent, name, modifier, value) {
    var directives = parent.directives || (parent.directives = {});
    return directives[join(name, modifier)] = {
      name: name,
      modifier: modifier,
      context: context,
      keypath: keypath,
      value: value
    };
  };

  var getValue = function (element, source, output) {
    var value;
    if (has$1(output, VALUE)) {
      value = output.value;
    } else if (has$1(source, VALUE)) {
      value = source.value;
    } else if (source.expr) {
      value = executeExpr(source.expr, source.binding || source.type === DIRECTIVE);
    }
    if (!isDef(value)) {
      if (source.expr || source.children) {
        value = CHAR_BLANK;
      } else if (element.component) {
        value = TRUE;
      } else {
        value = source.name;
      }
    }
    return value;
  };

  var pushStack = function (source) {
    var type = source.type,
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
        pushStack(node);
      });
    }

    execute(leave[type], NULL, [source, output]);

    if (htmlTypes[source.type]) {
      pop(htmlStack);
    }

    pop(nodeStack);

    return output;
  };

  // 缓存节点只处理一层，不支持下面这种多层缓存
  // <div key="{{xx}}">
  //     <div key="{{yy}}"></div>
  // </div>

  var executeExpr = function (expr, filter) {
    return execute$1(expr, function (key) {
      var _context$get = context.get(key),
          keypath = _context$get.keypath,
          value = _context$get.value,
          temp = _context$get.temp;

      if (!filter && !temp) {
        deps[keypath] = value;
        if (cacheDeps) {
          cacheDeps[key] = value;
        }
      }
      return value;
    }, instance);
  };

  enter[PARTIAL] = function (source) {
    partials[source.name] = source.children;
    return FALSE;
  };

  enter[IMPORT] = function (source) {
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
    fatal('"' + name + '" partial is not found.');
  };

  // 条件判断失败就没必要往下走了
  // 但如果失败的点原本是一个 DOM 元素
  // 就需要用注释节点来占位，否则 virtual dom 无法正常工作
  enter[IF] = function (source) {
    var _source = source,
        stump = _source.stump;

    while (TRUE) {
      // 有判断条件
      if (source.expr) {
        if (executeExpr(source.expr)) {
          pushStack({
            children: source.children
          });
          break;
        } else {
          if (source.next) {
            source = source.next;
          } else {
            if (stump) {
              addChild(last(htmlStack), createCommentVnode());
            }
            break;
          }
        }
      }
      // 无判断条件，即 else
      else {
          pushStack({
            children: source.children
          });
          break;
        }
    }
    return FALSE;
  };

  enter[EACH] = function (source) {
    var expr = source.expr,
        index = source.index,
        children = source.children;

    var value = executeExpr(expr),
        each$$1;

    if (array(value)) {
      each$$1 = each;
    } else if (object(value)) {
      each$$1 = each$1;
    }

    if (each$$1) {

      var eachKeypath = expr.keypath;
      if (isDef(eachKeypath)) {
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
      if (isDef(eachKeypath)) {
        pop(keypathList);
        updateKeypath();
      }
    }

    return FALSE;
  };

  var getKeywordValue = function (value) {
    if (string(value)) {
      return value;
    } else if (object(value)) {
      return executeExpr(value);
    }
  };

  enter[ELEMENT] = function (source, output) {
    var name = source.name,
        key = source.key,
        ref = source.ref;

    if (key) {
      var trackBy = getKeywordValue(key);
      if (isDef(trackBy)) {

        if (!currentCache) {
          prevCache = instance.$templateCache || {};
          currentCache = instance.$templateCache = {};
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
    if (ref) {
      output.ref = getKeywordValue(ref);
    }
  };

  leave[ELEMENT] = function (source, output) {
    var component = source.component,
        key = output.key,
        ref = output.ref,
        attrs = output.attrs,
        children = output.children,
        props,
        vnode,
        create;

    if (source.props) {
      props = {};
      each$1(source.props, function (expr, key) {
        var value;
        if (primitive(expr)) {
          value = expr;
        } else {
          var _keypath = expr.keypath;

          value = executeExpr(expr, _keypath);
          if (_keypath) {
            addDirective(output, DIRECTIVE_BINDING, key, _keypath).prop = TRUE;
          }
        }
        props[key] = value;
      });
    }

    if (component) {
      create = 'createComponentVnode';
      if (children) {
        if (!attrs) {
          attrs = {};
        }
        attrs[SPECIAL_CHILDREN] = children;
        children = UNDEFINED;
      }
    } else {
      create = 'createElementVnode';
    }

    vnode = snabbdom[create](source.name, attrs, props, output.directives, children, key, ref, instance);

    if (isDef(key)) {
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

    addAttr(element, name, getValue(element, source, output));
    if (binding) {
      addDirective(element, DIRECTIVE_BINDING, name, binding);
    }
  };

  leave[DIRECTIVE] = function (source, output) {

    // 1.如果指令的值是纯文本，会在编译阶段转成表达式抽象语法树
    //   on-click="submit()"
    //   ref="child"
    //
    // 2.如果指令的值包含插值语法，则会拼接出最终值
    //   on-click="haha{{name}}"

    var element = htmlStack[htmlStack.length - 2];

    addDirective(element, source.name, source.modifier, getValue(element, source, output)).expr = source.expr;
  };

  leave[SPREAD] = function (source, output) {

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
          addDirective(element, DIRECTIVE_BINDING, name, join(spreadKeypath, name));
        }
      });
    } else {
      fatal('"' + expr.raw + '" spread expected to be an object.');
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

var toNumber = function (str) {
  var defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

  if (numeric(str)) {
    return +str;
  }
  return defaultValue;
};

var Observer = function () {

  /**
   * @param {Object} options
   * @property {Object} options.data
   * @property {?Object} options.computed
   * @property {?*} options.context 执行 watcher 函数的 this 指向
   * @property {?Function} options.beforeFlush
   * @property {?Function} options.afterFlush
   */
  function Observer(options) {
    classCallCheck(this, Observer);


    var instance = this;

    instance.data = options.data || {};
    instance.context = options.context || instance;
    instance.emitter = new Emitter();
    instance.beforeFlush = options.beforeFlush;
    instance.afterFlush = options.afterFlush;

    // 谁依赖了谁
    instance.deps = {};
    // 谁被谁依赖
    instance.invertedDeps = {};
    // 谁被谁依赖
    instance.invertedFuzzyDeps = {};

    // 把计算属性拆为 getter 和 setter
    instance.computedGetters = {};
    instance.computedSetters = {};

    // 计算属性的缓存值
    instance.computedCache = {};

    // 辅助获取计算属性的依赖
    instance.computedStack = [];

    // 正在监听的 keypath
    instance.watchKeypaths = {};
    // 模糊监听，如 user.*
    instance.watchFuzzyKeypaths = {};

    // 计算属性也是数据
    if (object(options.computed)) {
      each$1(options.computed, function (item, keypath) {
        instance.addComputed(keypath, item);
      });
    }
  }

  /**
   * 添加计算属性
   *
   * @param {string} keypath
   * @param {Function|Object} computed
   */


  Observer.prototype.addComputed = function (keypath, computed) {

    var instance = this,
        cache = TRUE,
        get$$1,
        set$$1,
        deps;

    if (func(computed)) {
      get$$1 = computed;
    } else if (object(computed)) {
      if (boolean(computed.cache)) {
        cache = computed.cache;
      }
      if (func(computed.get)) {
        get$$1 = computed.get;
      }
      if (func(computed.set)) {
        set$$1 = computed.set;
      }
      if (computed.deps) {
        deps = computed.deps;
      }
    }

    if (get$$1) {

      var needDeps;

      if (deps) {
        needDeps = FALSE;
        if (array(deps)) {
          instance.setDeps(keypath, deps);
        }
      } else {
        needDeps = cache;
      }

      var getter = function () {

        if (cache && has$1(instance.computedCache, keypath)) {
          return instance.computedCache[keypath];
        }

        if (needDeps) {
          instance.computedStack.push([]);
        }

        var value = execute(get$$1, instance.context);
        instance.computedCache[keypath] = value;

        if (needDeps) {
          instance.setDeps(keypath, pop(instance.computedStack));
        }

        return value;
      };

      getter.getter = TRUE;
      instance.computedGetters[keypath] = getter;
    }

    if (set$$1) {
      var setter = function (value) {
        set$$1.call(instance.context, value);
      };
      setter.setter = TRUE;
      instance.computedSetters[keypath] = setter;
    }
  };

  /**
   * 获取数据
   *
   * @param {string} keypath
   * @param {?*} defaultValue
   * @return {?*}
   */


  Observer.prototype.get = function (keypath, defaultValue) {

    var instance = this,
        result;

    // 传入 '' 获取整个 data
    if (keypath === CHAR_BLANK) {
      return instance.data;
    }

    keypath = normalize(keypath);

    // 收集计算属性依赖
    var list = last(instance.computedStack);
    if (list) {
      push(list, keypath);
    }

    var _matchBestGetter = matchBestGetter(instance.computedGetters, keypath),
        getter = _matchBestGetter.getter,
        prop = _matchBestGetter.prop;

    if (getter) {
      getter = getter();
      if (prop) {
        if (exists(getter, prop)) {
          result = { value: getter[prop] };
        } else if (!primitive(getter)) {
          result = get$1(getter, prop);
        }
      } else {
        result = { value: getter };
      }
    }

    if (!result) {
      result = get$1(instance.data, keypath);
    }

    return result ? result.value : defaultValue;
  };

  /**
   * 更新数据
   *
   * @param {string|Object} keypath
   * @param {?*} value
   */


  Observer.prototype.set = function (keypath, value) {

    var instance = this,
        outerDifferences = {};

    // 数据监听有两种
    // 1. 类似计算属性的依赖关系，如计算属性 A 的依赖是 B 和 C，当 B 或 C 变了，必须检测 A 是否变了
    // 2. watch/watchOnce，只监听单一 keypath 的变化
    //
    // 当我们修改一项数据时
    // 如果是基本类型的数据，需要判断是否有 watcher 正在监听它，以及它是否命中模糊匹配，以及它是否是别的数据的依赖
    // 如果是引用类型的数据，除了有基本类型的判断，还得判断它的属性是否变化，如监听 user.name，修改了 user，也得判断 user.name 是否变化，此外，子属性的变化又会带来一次递归判断
    //
    // 一旦数据发生变化，如果它影响了计算属性，则需立即清除计算属性的缓存，才可获取最新值
    // 而 watcher 的触发则需等到 nextTick 后
    // 也就是说，你必须在设值时知道它会导致哪些数据发生变化，而不是在 nextTick 批量计算

    var addInverted = function (differences, inverted) {
      each$1(inverted, function (count, invertedKeypath) {
        addDifference(differences, invertedKeypath, UNDEFINED, instance.get(invertedKeypath), TRUE);
      });
    };

    var addDifference = function (differences, keypath, newValue, oldValue, force) {
      if (force || oldValue !== newValue) {
        if (has$1(differences, keypath)) {
          return;
        }
        // 自己
        differences[keypath] = oldValue;

        // 依赖
        var inverted = instance.invertedDeps[keypath];
        if (inverted) {
          addInverted(differences, inverted);
        }

        each$1(instance.invertedFuzzyDeps, function (inverted, fuzzyKeypath) {
          if (matchKeypath(keypath, fuzzyKeypath)) {
            addInverted(differences, inverted);
          }
        });

        // 我们认为 $ 开头的变量是不可递归的
        // 比如浏览器中常见的 $0 表示当前选中元素
        // DOM 元素是不能递归的
        if (startsWith(keypath, '$')) {
          return;
        }

        // 子属性
        var oldIsObject = object(oldValue),
            newIsObject = object(newValue);
        if (oldIsObject || newIsObject) {
          var keys$$1;
          if (oldIsObject) {
            keys$$1 = keys(oldValue);
            if (newIsObject) {
              each(keys(newValue), function (key) {
                if (!has(keys$$1, key)) {
                  push(keys$$1, key);
                }
              });
            }
          } else {
            keys$$1 = keys(newValue);
          }
          if (keys$$1) {
            each(keys$$1, function (key) {
              addDifference(differences, join(keypath, key), newIsObject ? newValue[key] : UNDEFINED, oldIsObject ? oldValue[key] : UNDEFINED);
            });
          }
        } else {
          var oldIsArray = array(oldValue),
              newIsArray = array(newValue);
          var oldLength = oldIsArray || string(oldValue) ? oldValue.length : UNDEFINED;
          var newLength = newIsArray || string(newValue) ? newValue.length : UNDEFINED;
          if (number(oldLength) || number(newLength)) {
            addDifference(differences, join(keypath, 'length'), newLength, oldLength);
            if (oldIsArray || newIsArray) {
              for (var i = 0, length = getMax(newLength, oldLength); i < length; i++) {
                addDifference(differences, join(keypath, i), newIsArray ? newValue[i] : UNDEFINED, oldIsArray ? oldValue[i] : UNDEFINED);
              }
            }
          }
        }
      }
    };

    var setValue = function (newValue, keypath) {

      keypath = normalize(keypath);

      var oldValue = instance.get(keypath),
          innerDifferences = {};

      addDifference(innerDifferences, keypath, newValue, oldValue);

      var setter = instance.computedSetters[keypath];
      if (setter) {
        setter(newValue);
      } else {
        var _matchBestGetter2 = matchBestGetter(instance.computedGetters, keypath),
            getter = _matchBestGetter2.getter,
            prop = _matchBestGetter2.prop;

        if (getter && prop) {
          getter = getter();
          if (primitive(getter)) {
            return;
          } else {
            set$1(getter, prop, newValue);
          }
        } else {
          set$1(instance.data, keypath, newValue);
        }
      }

      if (newValue !== oldValue) {

        var computedKeypaths = keys(instance.computedCache);

        each$1(innerDifferences, function (oldValue, keypath) {
          var newValue = instance.get(keypath);
          if (isChange(newValue, oldValue, instance.deps[keypath])) {
            outerDifferences[keypath] = oldValue;

            var invertedKeypaths = instance.invertedDeps[keypath];
            var invertedFuzzyKeypaths = [];

            each$1(instance.invertedFuzzyDeps, function (invertedKeypaths, fuzzyKeypath) {
              if (matchKeypath(keypath, fuzzyKeypath)) {
                push(invertedFuzzyKeypaths, fuzzyKeypath);
              }
            });

            // 计算属性要立即生效，否则取值会出问题
            each(computedKeypaths, function (computedKeypath, index) {
              var needRemove;
              if (computedKeypath === keypath || invertedKeypaths && invertedKeypaths[computedKeypath]) {
                needRemove = TRUE;
              } else {
                each(invertedFuzzyKeypaths, function (fuzzyKeypath) {
                  if (instance.invertedFuzzyDeps[fuzzyKeypath][computedKeypath]) {
                    needRemove = TRUE;
                    return FALSE;
                  }
                });
              }
              if (needRemove) {
                computedKeypaths.splice(index, 1);
                delete instance.computedCache[computedKeypath];
              }
            }, TRUE);
          }
        });
      }
    };

    if (string(keypath)) {
      setValue(value, keypath);
    } else if (object(keypath)) {
      each$1(keypath, setValue);
    }

    var result = [],
        differences = instance.differences;

    each$1(outerDifferences, function (oldValue, keypath) {
      var newValue = instance.get(keypath);
      if (isChange(newValue, oldValue, instance.deps[keypath])) {
        push(result, keypath);
        if (!differences) {
          differences = instance.differences = {};
        }
        if (!has$1(differences, keypath)) {
          differences[keypath] = oldValue;
        }
      }
    });

    if (result.length) {
      instance.flushAsync();
    }

    return result;
  };

  Observer.prototype.flush = function () {

    var instance = this;

    if (instance.pending) {
      delete instance.pending;
    }

    var differences = instance.differences;


    if (differences) {
      delete instance.differences;
    } else {
      return;
    }

    // 确定待 flush 的数据
    var flushing = {};

    each$1(differences, function (oldValue, keypath) {
      var newValue = instance.get(keypath);
      if (isChange(newValue, oldValue, instance.deps[keypath])) {
        flushing[keypath] = [newValue, oldValue, keypath];
      }
    });

    execute(instance.beforeFlush, instance, flushing);

    each$1(flushing, function (args, keypath) {

      instance.emitter.fire(keypath, args);

      each$1(instance.watchFuzzyKeypaths, function (value, key) {
        var match = matchKeypath(keypath, key);
        if (match) {
          var newArgs = copy(args);
          push(newArgs, match);
          instance.emitter.fire(key, newArgs);
        }
      });
    });

    execute(instance.afterFlush, instance, flushing);
  };

  Observer.prototype.flushAsync = function () {
    var instance = this;
    if (!instance.pending) {
      instance.pending = TRUE;
      append(function () {
        if (instance.pending) {
          instance.flush();
        }
      });
    }
  };

  Observer.prototype.setDeps = function (keypath, value) {
    var deps = this.deps,
        invertedDeps = this.invertedDeps,
        invertedFuzzyDeps = this.invertedFuzzyDeps;

    var oldValue = deps[keypath];
    if (oldValue !== value) {

      var added = [],
          removed = [];

      if (oldValue) {
        each([oldValue, value], function (deps) {
          each(deps, function (dep) {
            if (has(value, dep)) {
              if (!has(oldValue, dep)) {
                push(added, dep);
              }
            } else if (has(oldValue, dep)) {
              push(removed, dep);
            }
          });
        });
      } else {
        added = value;
      }

      if (removed.length) {

        var remove$$1 = function (dep, key) {

          var isFuzzy = isFuzzyKeypath(dep);
          var tempDeps = isFuzzy ? invertedFuzzyDeps : invertedDeps;

          var target = tempDeps[dep];
          if (target[key] > 0) {
            target[key]--;
            if (tempDeps[key]) {
              each$1(tempDeps[key], function (count, key) {
                remove$$1(dep, key);
              });
            }
          }

          if (!target[key]) {
            delete target[key];
          }
        };

        each(removed, function (dep) {
          remove$$1(dep, keypath);
        });
      }

      if (added.length) {

        var add = function (dep, key, autoCreate) {

          var isFuzzy = isFuzzyKeypath(dep);
          var tempDeps = isFuzzy ? invertedFuzzyDeps : invertedDeps;

          // dep 是 key 的一个依赖
          var target = tempDeps[dep];
          if (!target && autoCreate) {
            target = tempDeps[dep] = {};
          }
          if (target) {
            if (number(target[key])) {
              target[key]++;
            } else {
              target[key] = 1;
              if (key === keypath && invertedDeps[key]) {
                each$1(invertedDeps[key], function (value, parentKey) {
                  add(dep, parentKey);
                });
              }
            }
            // dep 同样是 key 的父级的依赖
            if (deps[dep]) {
              each$1(deps[dep], function (subKey) {
                add(subKey, key);
              });
            }
          }
        };

        each(added, function (dep) {
          add(dep, keypath, TRUE);
        });
      }

      deps[keypath] = value;
    }
  };

  /**
   * 取反 keypath 对应的数据
   *
   * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
   *
   * @param {string} keypath
   * @return {boolean} 取反后的布尔值
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
   * @param {string} keypath 值必须能转型成数字，如果不能，则默认从 0 开始递增
   * @param {?number} step 步进值，默认是 1
   * @param {?number} min 可以递增到的最小值，默认不限制
   * @return {number} 返回递增后的值
   */


  Observer.prototype.increase = function (keypath, step, max) {
    var value = toNumber(this.get(keypath), 0) + (numeric(step) ? step : 1);
    if (!numeric(max) || value <= max) {
      this.set(keypath, value);
    }
    return value;
  };

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


  Observer.prototype.decrease = function (keypath, step, min) {
    var value = toNumber(this.get(keypath), 0) - (numeric(step) ? step : 1);
    if (!numeric(min) || value >= min) {
      this.set(keypath, value);
    }
    return value;
  };

  /**
   * 在数组指定位置插入元素
   *
   * @param {string} keypath
   * @param {*} item
   * @param {number} index
   * @return {?boolean} 是否插入成功
   */


  Observer.prototype.insert = function (keypath, item, index) {

    var list = this.get(keypath);
    if (!array(list)) {
      list = [];
    } else {
      list = copy(list);
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
  };

  /**
   * 通过索引移除数组中的元素
   *
   * @param {string} keypath
   * @param {number} index
   * @return {?boolean} 是否移除成功
   */


  Observer.prototype.removeAt = function (keypath, index) {
    var list = this.get(keypath);
    if (array(list) && index >= 0 && index < list.length) {
      list = copy(list);
      list.splice(index, 1);
      this.set(keypath, list);
      return TRUE;
    }
  };

  /**
   * 直接移除数组中的元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否移除成功
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

  Observer.prototype.nextTick = function (fn) {
    append(fn);
  };

  /**
   * 销毁
   */


  Observer.prototype.destroy = function () {
    this.emitter.off();
    clear(this);
  };

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
    var instance = this;
    if (string(keypath)) {
      _unwatch(instance, keypath, watcher);
    } else if (object(keypath)) {
      each$1(keypath, function (watcher, keypath) {
        _unwatch(instance, keypath, watcher);
      });
    }
  }

});

function watch(instance, action, keypath, watcher, sync) {
  var emitter = instance.emitter,
      context = instance.context;


  var isFuzzy = isFuzzyKeypath(keypath);

  if (!emitter.has(keypath)) {
    if (isFuzzy) {
      instance.watchFuzzyKeypaths[keypath] = TRUE;
    } else {
      instance.watchKeypaths[keypath] = TRUE;
    }
  }

  emitter[action](keypath, {
    func: watcher,
    context: context
  });

  if (sync && !isFuzzy) {
    execute(watcher, context, [instance.get(keypath), UNDEFINED, keypath]);
  }
}

function _unwatch(instance, keypath, watcher) {
  var emitter = instance.emitter;

  if (emitter.has(keypath)) {
    emitter.off(keypath, watcher);
    if (!emitter.has(keypath)) {
      if (isFuzzyKeypath(keypath)) {
        delete instance.watchFuzzyKeypaths[keypath];
      } else {
        delete instance.watchKeypaths[keypath];
      }
    }
  }
}

function createWatch(action) {

  return function (keypath, watcher, sync) {

    var instance = this;

    if (string(keypath)) {
      watch(instance, action, keypath, watcher, sync);
    } else {
      if (watcher === TRUE) {
        sync = watcher;
      }
      each$1(keypath, function (value, keypath) {
        var watcher = value,
            innerSync = sync;
        if (object(value)) {
          watcher = value.watcher;
          if (boolean(value.sync)) {
            innerSync = value.sync;
          }
        }
        watch(instance, action, keypath, watcher, innerSync);
      });
    }
  };
}

var patternCache = {};

/**
 * 模糊匹配 Keypath
 *
 * @param {string} keypath
 * @param {string} pattern
 * @return {?Array.<string>}
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

  var result = {};

  each(sort(getters, TRUE), function (prefix) {
    var length = startsWith$1(keypath, prefix);
    if (length !== FALSE) {
      result.getter = getters[prefix];
      result.prop = slice(keypath, length);
      return FALSE;
    }
  });

  return result;
}

/**
 * 获取最大值
 *
 * @param {number|undefined} a
 * @param {number|undefined} b
 * @return {number}
 */
function getMax(a, b) {
  var max;
  if (a >= 0) {
    max = a;
    if (b > a) {
      max = b;
    }
  } else if (b >= 0) {
    max = b;
  }
  return max;
}

/**
 * 新旧值变化有两种情况：
 *
 * 1. 值不同
 * 2. 值相同，都是 undefined，并且有依赖，这通常表示一个虚拟值
 *
 * @param {*} newValue
 * @param {*} oldValue
 * @param {*} deps
 * @return {boolean}
 */
function isChange(newValue, oldValue, deps) {
  return newValue !== oldValue || newValue === UNDEFINED && deps;
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
  setProp(node, name, string(node[name]) ? CHAR_BLANK : NULL);
}

function setAttr(node, name, value) {
  var isBoolean = boolean(node[name]);
  if (isBoolean) {
    value = value === TRUE || value === RAW_TRUE || value === name;
  }
  if (attr2Prop[name]) {
    setProp(node, attr2Prop[name], value);
  } else if (isBoolean) {
    setProp(node, name, value);
  } else {
    node.setAttribute(name, value);
  }
}

function removeAttr(node, name) {
  if (attr2Prop[name]) {
    removeProp(node, attr2Prop[name]);
  } else if (boolean(node[name])) {
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

function on$1(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function off(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

function getComponent(element) {
  return element.component;
}

function setComponent(element, component) {
  return element.component = component;
}

var domApi = {
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
	on: on$1,
	off: off,
	getComponent: getComponent,
	setComponent: setComponent
};

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

var api = copy(domApi);

// import * as oldApi from './oldApi'

// if (env.doc && !env.doc.addEventListener) {
//   object.extend(api, oldApi)
// }

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

var EMITTER_KEY = '_emitter';

/**
 * 绑定事件
 *
 * @param {HTMLElement} element
 * @param {string} type
 * @param {Function} listener
 * @param {?*} context
 */
api.on = function (element, type, listener, context) {
  var emitter = element[EMITTER_KEY] || (element[EMITTER_KEY] = new Emitter());
  if (!emitter.has(type)) {
    var nativeListener = function (e, type) {
      if (!Event.is(e)) {
        e = new Event(api.createEvent(e, element));
      }
      if (type) {
        e.type = type;
      }
      emitter.fire(e.type, e, context);
    };
    emitter[type] = nativeListener;
    var special = api.specialEvents[type];
    if (special) {
      special.on(element, nativeListener);
    } else {
      _on(element, type, nativeListener);
    }
  }
  emitter.on(type, listener);
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
  var emitter = element[EMITTER_KEY];
  var types = keys(emitter.listeners);
  // emitter 会根据 type 和 listener 参数进行适当的删除
  emitter.off(type, listener);
  // 根据 emitter 的删除结果来操作这里的事件 listener
  each(types, function (type, index) {
    if (emitter[type] && !emitter.has(type)) {
      var nativeListener = emitter[type];
      var special = api.specialEvents[type];
      if (special) {
        special.off(element, nativeListener);
      } else {
        _off(element, type, nativeListener);
      }
      delete emitter[type];
      types.splice(index, 1);
    }
  }, TRUE);
  if (!types.length) {
    api.removeProp(element, EMITTER_KEY);
  }
};

/**
 * 节流调用
 *
 * @param {Function} fn 需要节制调用的函数
 * @param {number} delay 调用的时间间隔
 * @param {?boolean} sync 是否立即触发
 * @return {Function}
 */
var debounce = function (fn, delay, sync) {

  var timer;

  return function () {

    if (!timer) {

      var args = toArray$1(arguments);
      if (sync) {
        execute(fn, NULL, args);
      }

      timer = setTimeout(function () {
        timer = NULL;
        if (!sync) {
          execute(fn, NULL, args);
        }
      }, delay);
    }
  };
};

// 避免连续多次点击，主要用于提交表单场景
// 移动端的 tap 事件可自行在业务层打补丁实现
var syncTypes = [CLICK, TAP];

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

  var destroy = noop;

  if (!listener) {
    var result = instance.compileDirective(node);
    if (result) {
      listener = result.listener;
      if (result.destroy) {
        destroy = result.destroy;
      }
    }
  }

  if (type && listener) {
    var lazy = directives.lazy;

    if (lazy) {
      var value = lazy.value;

      if (numeric(value) && value >= 0) {
        listener = debounce(listener, value, has(syncTypes, type));
      } else if (type === INPUT) {
        type = CHANGE;
      }
    }

    if (component) {
      component.on(type, listener);
      return function () {
        component.off(type, listener);
        destroy();
      };
    } else {
      api.on(el, type, listener);
      return function () {
        api.off(el, type, listener);
        destroy();
      };
    }
  }
};

var VALUE$1 = 'value';

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

  attr: VALUE$1
};

var selectControl = {
  set: function set$$1(el, keypath, instance) {
    var value = toString(instance.get(keypath));
    var options = el.options,
        selectedIndex = el.selectedIndex;

    var selectedOption = options[selectedIndex];
    if (selectedOption && value !== selectedOption.value) {
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
        instance.append(keypath, el.value);
      } else {
        instance.removeAt(keypath, indexOf(value, el.value, FALSE));
      }
    } else {
      instance.set(keypath, el.checked);
    }
  },

  attr: 'checked'
};

var componentControl = {
  set: function set$$1(component, keypath, instance) {
    component.set(VALUE$1, instance.get(keypath));
  },
  sync: function sync(component, keypath, instance) {
    instance.set(keypath, component.get(VALUE$1));
  }
};

var specialControls = {
  radio: radioControl,
  checkbox: checkboxControl,
  select: selectControl
};

var model = function (_ref) {
  var el = _ref.el,
      node = _ref.node,
      instance = _ref.instance,
      directives = _ref.directives,
      attrs = _ref.attrs,
      component = _ref.component;
  var value = node.value,
      context = node.context;

  if (falsy$1(value)) {
    return;
  }

  var _context$get = context.get(value),
      keypath = _context$get.keypath;

  var set$$1 = function () {
    if (control) {
      control.set(target, keypath, instance);
    }
  };
  var sync = function () {
    control.sync(target, keypath, instance);
  };

  var target,
      control,
      unbindTarget,
      unbindInstance;
  if (component) {

    target = component;
    control = componentControl;
    if (!has$1(attrs, VALUE$1)) {
      set$$1();
    }
    component.watch(VALUE$1, sync);
    unbindTarget = function unbindTarget() {
      component.unwatch(VALUE$1, sync);
    };
  } else {

    target = el;
    control = specialControls[el.type] || specialControls[api.tag(el)];

    var type = CHANGE;
    if (!control) {
      control = inputControl;
      if (exists(el, 'autofocus')) {
        type = INPUT;
      }
    }

    if (!control.attr || !has$1(attrs, control.attr)) {
      set$$1();
    }

    unbindTarget = bindEvent({
      el: el,
      node: node,
      instance: instance,
      directives: directives,
      type: type,
      listener: sync
    });
  }

  prepend(function () {
    if (set$$1) {
      instance.watch(keypath, set$$1);
      unbindInstance = function unbindInstance() {
        instance.unwatch(keypath, set$$1);
      };
    }
  });

  return function () {
    unbindTarget && unbindTarget();
    unbindInstance && unbindInstance();
    set$$1 = NULL;
  };
};

var binding = function (_ref) {
  var el = _ref.el,
      node = _ref.node,
      instance = _ref.instance,
      component = _ref.component;

  var _node$context$get = node.context.get(node.value),
      keypath = _node$context$get.keypath;

  var set = function (value) {
    var name = node.modifier;
    if (node.prop) {
      api.setProp(el, name, value);
    } else {
      if (component) {
        component.set(name, value);
      } else {
        api.setAttr(el, name, value);
      }
    }
  };

  // 同批次的修改
  // 不应该响应 watch
  // 因为模板已经全量更新
  prepend(function () {
    if (set) {
      instance.watch(keypath, set);
    }
  });

  return function () {
    instance.unwatch(keypath, set);
    set = NULL;
  };
};

var TEMPLATE_KEY = '_template';
var TEMPLATE_VALUE = 9;

var patch = init(api);

var Yox = function () {
  function Yox(options) {
    classCallCheck(this, Yox);


    var instance = this;

    if (!object(options)) {
      options = {};
    }

    // 如果不绑着，其他方法调不到钩子
    instance.$options = options;

    execute(options[HOOK_BEFORE_CREATE], instance, options);

    var _options = options,
        el = _options.el,
        data = _options.data,
        props = _options.props,
        parent = _options.parent,
        replace = _options.replace,
        computed = _options.computed,
        template = _options.template,
        components = _options.components,
        directives = _options.directives,
        partials = _options.partials,
        filters = _options.filters,
        events = _options.events,
        watchers = _options.watchers,
        methods = _options.methods,
        propTypes = _options.propTypes,
        extensions = _options.extensions;


    extensions && extend(instance, extensions);

    var source;
    if (object(propTypes)) {
      source = Yox.validate(props || {}, propTypes);
      // validate 可能过滤 $children 字段
      // 这里确保外面传入的 $children 还在
      if (props && has$1(props, SPECIAL_CHILDREN)) {
        source[SPECIAL_CHILDREN] = props[SPECIAL_CHILDREN];
      }
    } else {
      source = props || {};
    }

    // 如果传了 props，则 data 应该是个 function
    if (props && object(data)) {
      warn('"data" option expected to be a function.');
    }

    // 先放 props
    // 当 data 是函数时，可以通过 this.get() 获取到外部数据
    instance.$observer = new Observer({
      context: instance,
      data: source,
      computed: computed,
      beforeFlush: function beforeFlush(flushing) {
        // 疑似变化
        if (has$1(flushing, TEMPLATE_KEY)) {

          var updateView = function () {
            instance.updateView(instance.$node, instance.render());
          };

          // 强制更新
          if (flushing[TEMPLATE_KEY][1] === TEMPLATE_VALUE) {
            updateView();
          }
          // 排查依赖
          else {
              each(this.deps[TEMPLATE_KEY], function (dep) {
                if (flushing[dep]) {
                  updateView();
                  return FALSE;
                }
              });
            }

          delete flushing[TEMPLATE_KEY];
        }
      }
    });

    // 后放 data
    var extend$$1 = func(data) ? execute(data, instance, options) : data;
    if (object(extend$$1)) {
      each$1(extend$$1, function (value, key) {
        if (has$1(source, key)) {
          warn('"' + key + '" is already defined as a prop. Use prop default value instead.');
        } else {
          source[key] = value;
        }
      });
    }

    // 监听各种事件
    // 支持命名空间
    instance.$emitter = new Emitter(TRUE);

    var templateError = '"template" option expected to have just one root element.';

    // 检查 template
    if (string(template)) {
      if (selector.test(template)) {
        template = api.html(api.find(template));
      }
      if (!tag.test(template)) {
        error$1(templateError);
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

    // 聪明的 set...
    var smartSet = function (key, value) {
      if (func(value)) {
        instance[key](execute(value, instance));
      } else if (object(value)) {
        instance[key](value);
      }
    };

    smartSet('component', components);
    smartSet('directive', directives);
    smartSet('partial', partials);
    smartSet('filter', filters);

    execute(options[HOOK_AFTER_CREATE], instance);

    if (template) {
      // 确保组件根元素有且只有一个
      template = Yox.compile(template);
      if (template.length > 1) {
        fatal(templateError);
      }
      instance.$template = template[0];
      // 首次渲染
      instance.updateView(el || api.createElement('div'), instance.render());
    }

    // 确保早于 AFTER_MOUNT 执行
    if (watchers || events) {
      prepend(function () {
        if (instance.$emitter) {
          watchers && instance.watch(watchers);
          events && instance.on(events);
        }
      });
    }
  }

  /**
   * 添加计算属性
   *
   * @param {string} keypath
   * @param {Function|Object} computed
   */


  Yox.prototype.addComputed = function (keypath, computed) {
    return this.$observer.addComputed(keypath, computed);
  };

  /**
   * 取值
   *
   * @param {string} keypath
   * @param {*} defaultValue
   * @return {?*}
   */


  Yox.prototype.get = function (keypath, defaultValue) {
    return this.$observer.get(keypath, defaultValue);
  };

  /**
   * 设值
   *
   * @param {string|Object} keypath
   * @param {?*} value
   * @return {boolean} 是否会引起视图更新
   */


  Yox.prototype.set = function (keypath, value) {
    return has(this.$observer.set(keypath, value), TEMPLATE_KEY);
  };

  /**
   * 监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */


  Yox.prototype.on = function (type, listener) {
    this.$emitter.on(type, listener);
    return this;
  };

  /**
   * 监听一次事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */


  Yox.prototype.once = function (type, listener) {
    this.$emitter.once(type, listener);
    return this;
  };

  /**
   * 取消监听事件
   *
   * @param {string|Object} type
   * @param {?Function} listener
   * @return {Yox} 支持链式
   */


  Yox.prototype.off = function (type, listener) {
    this.$emitter.off(type, listener);
    return this;
  };

  /**
   * 触发事件
   *
   * @param {string} type
   * @param {?*} data
   * @return {boolean} 是否正常结束
   */


  Yox.prototype.fire = function (type, data) {

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
  };

  /**
   * 监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   * @return {Yox} 支持链式
   */


  Yox.prototype.watch = function (keypath, watcher, sync) {
    this.$observer.watch(keypath, watcher, sync);
    return this;
  };

  /**
   * 监听一次数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @param {?boolean} sync
   * @return {Yox} 支持链式
   */


  Yox.prototype.watchOnce = function (keypath, watcher, sync) {
    this.$observer.watchOnce(keypath, watcher, sync);
    return this;
  };

  /**
   * 取消监听数据变化
   *
   * @param {string|Object} keypath
   * @param {?Function} watcher
   * @return {Yox} 支持链式
   */


  Yox.prototype.unwatch = function (keypath, watcher) {
    this.$observer.unwatch(keypath, watcher);
    return this;
  };

  /**
   * 对于某些特殊场景，修改了数据，但是模板的依赖中并没有这一项
   * 而你非常确定需要更新模板，强制刷新正是你需要的
   */


  Yox.prototype.forceUpdate = function (sync) {
    var $observer = this.$observer;
    var differences = $observer.differences;

    if (!differences) {
      differences = $observer.differences = {};
    }

    differences[TEMPLATE_KEY] = TEMPLATE_VALUE;
    if (sync) {
      $observer.flush();
    } else {
      $observer.flushAsync();
    }
  };

  /**
   * 把模板抽象语法树渲染成 virtual dom
   *
   * @return {Object}
   */


  Yox.prototype.render = function () {

    var instance = this;
    var $template = instance.$template,
        $observer = instance.$observer,
        $context = instance.$context;


    if (!$context) {
      $context = instance.$context = extend({}, registry.filter, instance.$filters);
    }

    extend($context, $observer.data, $observer.computedGetters);

    var _renderTemplate = render($template, $context, instance),
        nodes = _renderTemplate.nodes,
        deps = _renderTemplate.deps;

    $observer.setDeps(TEMPLATE_KEY, keys(deps));

    return nodes[0];
  };

  /**
   * 更新 virtual dom
   *
   * @param {HTMLElement|Vnode} oldNode
   * @param {Vnode} newNode
   */


  Yox.prototype.updateView = function (oldNode, newNode) {

    var instance = this,
        afterHook;

    var $node = instance.$node,
        $options = instance.$options;


    if ($node) {
      execute($options[HOOK_BEFORE_UPDATE], instance);
      instance.$node = patch(oldNode, newNode);
      afterHook = HOOK_AFTER_UPDATE;
    } else {
      execute($options[HOOK_BEFORE_MOUNT], instance);
      $node = patch(oldNode, newNode);
      instance.$el = $node.el;
      instance.$node = $node;
      afterHook = HOOK_AFTER_MOUNT;
    }

    // 跟 nextTask 保持一个节奏
    // 这样可以预留一些优化的余地
    append(function () {
      if (instance.$node) {
        execute($options[afterHook], instance);
      }
    });
  };

  /**
   * 创建子组件
   *
   * @param {Object} options 组件配置
   * @param {?Object} extra 添加进组件配置，但不修改配置的数据，比如 el、props 等
   * @return {Yox} 子组件实例
   */


  Yox.prototype.create = function (options, extra) {
    options = extend({}, options, extra);
    options.parent = this;
    var child = new Yox(options);
    push(this.$children || (this.$children = []), child);
    return child;
  };

  /**
   * 导入编译后的子模板
   *
   * @param {string} name
   * @return {Array}
   */


  Yox.prototype.importPartial = function (name) {
    return Yox.compile(this.partial(name));
  };

  /**
   * 把指令中的表达式编译成函数
   *
   * @param {Directive} directive
   * @return {Function}
   */


  Yox.prototype.compileDirective = function (directive) {

    var instance = this;
    var value = directive.value,
        expr = directive.expr,
        keypath = directive.keypath,
        context = directive.context;


    if (expr && expr.type === CALL) {
      var callee = expr.callee,
          args = expr.args,
          method = instance[callee.name];

      if (method) {

        var getValue = function (node) {
          return execute$1(node, function (keypath) {
            return context.get(keypath).value;
          }, instance);
        };

        var watchKeypath = join(keypath, '**');
        var watchHandler = function (newValue, oldValue, absoluteKeypath) {

          if (keypath) {
            var length = startsWith$1(absoluteKeypath, keypath);
            context.set(absoluteKeypath.substr(length), newValue);
          } else {
            context.set(absoluteKeypath, newValue);
          }
        };

        instance.watch(watchKeypath, watchHandler);

        return {
          destroy: function destroy() {
            instance.unwatch(watchKeypath, watchHandler);
          },

          listener: function listener(event) {
            var isEvent = Event.is(event),
                result;
            if (!args.length) {
              if (isEvent) {
                result = execute(method, instance, event);
              }
            } else {
              if (isEvent) {
                context.set(SPECIAL_EVENT, event);
              }
              result = execute(method, instance, args.map(getValue));
            }
            if (result === FALSE && isEvent) {
              event.prevent().stop();
            }
          }
        };
      }
    } else if (value) {
      return {
        listener: function listener(event, data) {
          if (event.type !== value) {
            event = new Event(event);
            event.type = value;
          }
          instance.fire(event, data);
        }
      };
    }
  };

  /**
   * 销毁组件
   */


  Yox.prototype.destroy = function () {

    var instance = this;

    var $options = instance.$options,
        $node = instance.$node,
        $parent = instance.$parent,
        $emitter = instance.$emitter,
        $observer = instance.$observer;


    execute($options[HOOK_BEFORE_DESTROY], instance);

    if ($parent && $parent.$children) {
      remove($parent.$children, instance);
    }

    if ($node) {
      patch($node, { text: CHAR_BLANK });
    }

    $emitter.off();
    $observer.destroy();

    clear(instance);

    execute($options[HOOK_AFTER_DESTROY], instance);
  };

  /**
   * 因为组件采用的是异步更新机制，为了在更新之后进行一些操作，可使用 nextTick
   *
   * @param {Function} fn
   */


  Yox.prototype.nextTick = function (fn) {
    this.$observer.nextTick(fn);
  };

  /**
   * 取反 keypath 对应的数据
   *
   * 不管 keypath 对应的数据是什么类型，操作后都是布尔型
   *
   * @param {string} keypath
   * @return {boolean} 取反后的布尔值
   */


  Yox.prototype.toggle = function (keypath) {
    return this.$observer.toggle(keypath);
  };

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


  Yox.prototype.increase = function (keypath, step, max) {
    return this.$observer.increase(keypath, step, max);
  };

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


  Yox.prototype.decrease = function (keypath, step, min) {
    return this.$observer.decrease(keypath, step, min);
  };

  /**
   * 拷贝任意数据，支持深拷贝
   *
   * @param {*} data
   * @param {?boolean} deep 是否深拷贝
   * @return {*}
   */


  Yox.prototype.copy = function (data, deep) {
    return copy(data, deep);
  };

  /**
   * 在数组指定位置插入元素
   *
   * @param {string} keypath
   * @param {*} item
   * @param {number} index
   * @return {?boolean} 是否插入成功
   */


  Yox.prototype.insert = function (keypath, item, index) {
    return this.$observer.insert(keypath, item, index);
  };

  /**
   * 在数组尾部添加元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否添加成功
   */


  Yox.prototype.append = function (keypath, item) {
    return this.$observer.insert(keypath, item, TRUE);
  };

  /**
   * 在数组首部添加元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否添加成功
   */


  Yox.prototype.prepend = function (keypath, item) {
    return this.$observer.insert(keypath, item, FALSE);
  };

  /**
   * 通过索引移除数组中的元素
   *
   * @param {string} keypath
   * @param {number} index
   * @return {?boolean} 是否移除成功
   */


  Yox.prototype.removeAt = function (keypath, index) {
    return this.$observer.removeAt(keypath, index);
  };

  /**
   * 直接移除数组中的元素
   *
   * @param {string} keypath
   * @param {*} item
   * @return {?boolean} 是否移除成功
   */


  Yox.prototype.remove = function (keypath, item) {
    return this.$observer.remove(keypath, item);
  };

  return Yox;
}();

Yox.version = '0.54.4';

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

var COMPONENT = 'component';

function getResourceAsync(data, name, callback) {
  var value = data[name];
  if (func(value)) {
    var $pending = value.$pending;

    if (!$pending) {
      $pending = value.$pending = [callback];
      value(function (replacement) {
        delete value.$pending;
        data[name] = replacement;
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

function setResource(data, name, value) {
  if (object(name)) {
    each$1(name, function (value, key) {
      data[key] = value;
    });
  } else {
    data[name] = value;
  }
}

/**
 * 全局/本地注册
 *
 * @param {Object|string} name
 * @param {?Object} value
 */
each([COMPONENT, 'directive', 'partial', 'filter'], function (type) {
  prototype[type] = function (name, value) {
    var instance = this,
        prop = '$' + type + 's',
        data = instance[prop];
    if (string(name)) {
      var length = arguments.length,
          hasValue = data && has$1(data, name);
      if (length === 1) {
        return hasValue ? data[name] : Yox[type](name);
      } else if (length === 2 && type === COMPONENT && func(value)) {
        return hasValue ? getResourceAsync(data, name, value) : Yox[type](name, value);
      }
    }
    setResource(data || (instance[prop] = {}), name, value);
  };
  Yox[type] = function (name, value) {
    var data = registry[type];
    if (string(name)) {
      var length = arguments.length,
          hasValue = data && has$1(data, name);
      if (length === 1) {
        return hasValue ? data[name] : UNDEFINED;
      } else if (length === 2 && type === COMPONENT && func(value)) {
        return hasValue ? getResourceAsync(data, name, value) : value();
      }
    }
    setResource(data || (registry[type] = {}), name, value);
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
 * 验证 props，无爱请重写
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

    if (isDef(props[key])) {
      // 如果不写 type 或 type 不是 字符串 或 数组
      // 就当做此规则无效，和没写一样
      if (type) {
        var target = props[key],
            matched;
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
      if (type === RAW_FUNCTION) {
        result[key] = value;
      } else {
        result[key] = func(value) ? value(props) : value;
      }
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

// 全局注册内置指令
Yox.directive({ event: bindEvent, model: model, binding: binding });

return Yox;

})));
