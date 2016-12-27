(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Yox = factory());
}(this, (function () { 'use strict';

var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;



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

function diff$1(array1, array2, strict) {
  var result = [];
  each(array2, function (item) {
    if (!has$1(array1, item, strict)) {
      result.push(item);
    }
  });
  return result;
}

function merge() {
  var result = [];
  each(arguments, function (array$$1) {
    push$1(result, array$$1);
  });
  return result;
}

function push$1(original, array$$1) {
  if (array(array$$1)) {
    each(array$$1, function (item) {
      original.push(item);
    });
  } else {
    original.push(array$$1);
  }
}

function toArray(array$$1) {
  return array(array$$1) ? array$$1 : slice.call(array$$1);
}

function toObject(array$$1, key) {
  var result = {};
  each(array$$1, function (item) {
    result[key ? item[key] : item] = item;
  });
  return result;
}

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

function has$1(array$$1, item, strict) {
  return indexOf(array$$1, item, strict) >= 0;
}

function last(array$$1) {
  return array$$1[array$$1.length - 1];
}

function remove(array$$1, item, strict) {
  var index = indexOf(array$$1, item, strict);
  if (index >= 0) {
    array$$1.splice(index, 1);
  }
}

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
	remove: remove,
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

function keys(object$$1) {
  return Object.keys(object$$1);
}

function each$1(object$$1, callback) {
  each(keys(object$$1), function (key) {
    return callback(object$$1[key], key);
  });
}

function has$2(object$$1, key) {
  return object$$1.hasOwnProperty(key);
}

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

function get$1(object$$1, keypath) {
  if (has$2(object$$1, keypath)) {
    return {
      value: object$$1[keypath]
    };
  }

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
            remove(list, listener);
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
        return array(list) && list.length > 0;
      }
      return array(list) ? has$1(list, listener) : FALSE;
    }
  }]);
  return Emitter;
}();

function camelCase(str) {
  return str.replace(/-([a-z])/gi, function ($0, $1) {
    return $1.toUpperCase();
  });
}

function capitalize(str) {
  return charAt$1(str, 0).toUpperCase() + str.slice(1);
}

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

function charAt$1(str, index) {
  return str.charAt(index);
}
function charCodeAt(str, index) {
  return str.charCodeAt(index);
}

var string$1 = Object.freeze({
	camelCase: camelCase,
	capitalize: capitalize,
	parse: parse$1,
	charAt: charAt$1,
	charCodeAt: charCodeAt
});

var hasConsole = typeof console !== 'undefined';

function warn(msg) {
  if (hasConsole) {
    console.warn('[Yox warn]: ' + msg);
  }
}

function error$1(msg) {
  if (hasConsole) {
    console.error('[Yox error]: ' + msg);
  }
}

var logger = Object.freeze({
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

function add(task) {
  if (!nextTasks.length) {
    nextTick$2(run);
  }
  nextTasks.push(task);
}

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
var COMMENT = '!';
var SPREAD = '...';

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';

var DIRECTIVE_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var DIRECTIVE_REF = 'ref';
var DIRECTIVE_LAZY = 'lazy';
var DIRECTIVE_MODEL = 'model';

var KEYWORD_UNIQUE = 'key';

var IF$1 = 1;

var ELSE_IF$1 = 2;

var ELSE$1 = 3;

var EACH$1 = 4;

var PARTIAL$1 = 5;

var IMPORT$1 = 6;

var EXPRESSION = 7;

var SPREAD$1 = 8;

var DIRECTIVE = 9;

var ELEMENT = 10;

var ATTRIBUTE = 11;

var TEXT = 12;

var Context = function () {
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
  }, {
    key: 'hasNext',
    value: function hasNext() {
      return this.tail;
    }
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

          keys$$1.push(expr.stringify());

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

var Element = function (_Node) {
  inherits(Element, _Node);

  function Element(options) {
    classCallCheck(this, Element);

    var _this = possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, ELEMENT));

    extend(_this, options);
    return _this;
  }

  createClass(Element, [{
    key: 'addChild',
    value: function addChild(child) {
      var children = void 0;
      if (child.type === ATTRIBUTE) {
        children = this.attrs || (this.attrs = []);
      } else if (child.type === DIRECTIVE) {
        children = this.directives || (this.directives = []);
      } else {
        children = this.children;
      }
      children.push(child);
    }
  }, {
    key: 'render',
    value: function render(data) {
      var options = {
        name: this.name,
        component: this.component,
        children: this.renderChildren(data)
      };
      var attrs = this.attrs,
          directives = this.directives;

      if (attrs) {
        options.attrs = this.renderChildren(data, attrs);
      }
      if (directives) {
        options.directives = this.renderChildren(data, directives);
      }
      return new Element(options);
    }
  }]);
  return Element;
}(Node);

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

      if (value == NULL) {
        value = '';
      } else if (func(value) && value.$computed) {
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

function isNumber(charCode) {
  return charCode >= 48 && charCode <= 57;
}

function isWhitespace(charCode) {
  return charCode === 32 || charCode === 9;
}

function isIdentifierStart(charCode) {
  return charCode === 36 || charCode === 95 || charCode >= 97 && charCode <= 122 || charCode >= 65 && charCode <= 90;
}

function isIdentifierPart(charCode) {
  return isIdentifierStart(charCode) || isNumber(charCode);
}

function sortKeys(obj) {
  return keys(obj).sort(function (a, b) {
    return b.length - a.length;
  });
}

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

function parseError$1(expression) {
  error$1('Failed to parse expression: [' + expression + '].');
}

var ARRAY = 1;

var BINARY = 2;

var CALL = 3;

var CONDITIONAL = 4;

var IDENTIFIER = 5;

var LITERAL = 6;

var MEMBER = 7;

var UNARY = 8;

var Node$2 = function Node$2(type) {
  classCallCheck(this, Node$2);

  this.type = type;
};

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

var unaryMap = {};

unaryMap[Unary.PLUS] = unaryMap[Unary.MINUS] = unaryMap[Unary.BANG] = unaryMap[Unary.WAVE] = TRUE;

var unaryList = sortKeys(unaryMap);

var binaryMap = {};

binaryMap[Binary.OR] = 1;

binaryMap[Binary.AND] = 2;

binaryMap[Binary.LE] = binaryMap[Binary.LNE] = binaryMap[Binary.SE] = binaryMap[Binary.SNE] = 3;

binaryMap[Binary.LT] = binaryMap[Binary.LTE] = binaryMap[Binary.GT] = binaryMap[Binary.GTE] = 4;

binaryMap[Binary.PLUS] = binaryMap[Binary.MINUS] = 5;

binaryMap[Binary.MULTIPLY] = binaryMap[Binary.DIVIDE] = binaryMap[Binary.MODULO] = 6;

var binaryList = sortKeys(binaryMap);

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

var COMMA = 44;
var PERIOD = 46;
var SQUOTE = 39;
var DQUOTE = 34;
var OPAREN = 40;
var CPAREN = 41;
var OBRACK = 91;
var CBRACK = 93;
var QUMARK = 63;
var COLON = 58;
var keyword = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED
};

var cache$1 = {};

function compile$1(content) {
  var length = content.length;

  var index = 0,
      charCode = void 0,
      value = void 0;

  function getChar() {
    return charAt$1(content, index);
  }
  function getCharCode(i) {
    return charCodeAt(content, i != NULL ? i : index);
  }

  function skipWhitespace() {
    while (isWhitespace(getCharCode())) {
      index++;
    }
  }

  function skipNumber() {
    while (isNumber(getCharCode())) {
      index++;
    }
  }

  function skipString() {
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
  }

  function skipIdentifier() {
    do {
      index++;
    } while (isIdentifierPart(getCharCode()));
  }

  function parseNumber() {

    var start = index;

    skipNumber();
    if (getCharCode() === PERIOD) {
      index++;
      skipNumber();
    }

    return new Literal({
      value: parseFloat(content.substring(start, index))
    });
  }

  function parseString() {

    var start = index;

    skipString();

    return new Literal({
      value: content.substring(start + 1, index - 1)
    });
  }

  function parseIdentifier() {

    var start = index;
    skipIdentifier();

    value = content.substring(start, index);
    if (keyword[value]) {
      return new Literal({
        value: keyword[value]
      });
    }

    if (value) {
      return new Identifier({
        name: value
      });
    }

    parseError$1(content);
  }

  function parseTuple(delimiter) {

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
  }

  function parseOperator(sortedOperatorList) {
    skipWhitespace();
    value = matchBestToken(content.slice(index), sortedOperatorList);
    if (value) {
      index += value.length;
      return value;
    }
  }

  function parseVariable() {

    value = parseIdentifier();

    while (index < length) {
      charCode = getCharCode();
      if (charCode === OPAREN) {
        index++;
        value = new Call({
          callee: value,
          args: parseTuple(CPAREN)
        });
        break;
      } else {
        if (charCode === PERIOD) {
          index++;
          value = new Member({
            object: value,
            property: new Literal({
              value: parseIdentifier().name
            })
          });
        } else if (charCode === OBRACK) {
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
  }

  function parseToken() {
    skipWhitespace();

    charCode = getCharCode();

    if (charCode === SQUOTE || charCode === DQUOTE) {
      return parseString();
    } else if (isNumber(charCode) || charCode === PERIOD) {
        return parseNumber();
      } else if (charCode === OBRACK) {
          index++;
          return new Array$1({
            elements: parseTuple(CBRACK)
          });
        } else if (charCode === OPAREN) {
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
  }

  function parseUnary(op) {
    value = parseToken();
    if (value) {
      return new Unary({
        operator: op,
        arg: value
      });
    }
    parseError$1(content);
  }

  function parseBinary() {

    var left = parseToken();
    var op = parseOperator(binaryList);
    if (!op) {
      return left;
    }

    var right = parseToken();
    var stack = [left, op, binaryMap[op], right];

    while (op = parseOperator(binaryList)) {
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

    right = stack.pop();
    while (stack.length > 1) {
      right = new Binary({
        right: right,
        operator: (stack.pop(), stack.pop()),
        left: stack.pop()
      });
    }

    return right;
  }

  function parseSubexpression(delimiter) {
    value = parseExpression();
    if (getCharCode() === delimiter) {
      index++;
      return value;
    }
    parseError$1(content);
  }

  function parseExpression() {

    var test = parseBinary();

    skipWhitespace();
    if (getCharCode() === QUMARK) {
      index++;

      var consequent = parseBinary();

      skipWhitespace();
      if (getCharCode() === COLON) {
        index++;

        var alternate = parseBinary();

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
  }

  return cache$1[content] || (cache$1[content] = parseExpression());
}

var cache = {};

var openingDelimiter = '\\{\\{\\s*';
var closingDelimiter = '\\s*\\}\\}';
var openingDelimiterPattern = new RegExp(openingDelimiter);
var closingDelimiterPattern = new RegExp(closingDelimiter);

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
      addChild(new Text({ content: match }));
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

  var parseContent = function parseContent(content) {
    helperScanner.init(content);
    while (helperScanner.hasNext()) {
      content = helperScanner.nextBefore(openingDelimiterPattern);
      helperScanner.nextAfter(openingDelimiterPattern);

      if (content) {
        if (level === LEVEL_TEXT) {
          if (levelNode.children.length) {
            content = parseAttributeValue(content);
          } else {
            if (content.charAt(0) === '=') {
              quote = content.charAt(1);
              content = content.slice(2);
            } else {
                popStack();
                level--;
              }
          }
        }

        if (level === LEVEL_ATTRIBUTE) {
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
              index = parser.create(content, popStack);
              if (string(index)) {
                parseError(template, index, mainScanner.pos + helperScanner.pos);
              } else if (level === LEVEL_ATTRIBUTE && node.type === EXPRESSION) {
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

    if (content) {
      parseContent(content);
    }

    if (mainScanner.charAt(0) !== '<') {
      break;
    }

    if (mainScanner.charAt(1) === '/') {
      content = mainScanner.nextAfter(elementPattern);
      name = content.slice(2);

      if (mainScanner.charAt(0) !== '>') {
        return parseError(template, 'Illegal tag name', mainScanner.pos);
      } else if (name !== currentNode.name) {
        return parseError(template, 'Unexpected closing tag', mainScanner.pos);
      }

      popStack();

      mainScanner.forward(1);
    } else {
        content = mainScanner.nextAfter(elementPattern);
        name = content.slice(1);

        if (componentNamePattern.test(name)) {
          addChild(new Element({
            name: 'div',
            component: name
          }));
          isSelfClosing = TRUE;
        } else {
          addChild(new Element({ name: name }));
          isSelfClosing = selfClosingTagNamePattern.test(name);
        }

        content = mainScanner.nextBefore(elementEndPattern);
        if (content) {
          level++;
          parseContent(content);
          level--;
        }

        content = mainScanner.nextAfter(elementEndPattern);

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

var tag = /<[^>]+>/;

var selector = /^[#.]\w+$/;

var component$1 = new Store();
var directive$1 = new Store();
var filter$1 = new Store();
var partial$1 = new Store();

var registry = Object.freeze({
	component: component$1,
	directive: directive$1,
	filter: filter$1,
	partial: partial$1
});

var debug = TRUE;

var switcher = Object.freeze({
	debug: debug
});

var BEFORE_CREATE = 'beforeCreate';

var AFTER_CREATE = 'afterCreate';

var BEFORE_MOUNT = 'beforeMount';

var AFTER_MOUNT = 'afterMount';

var BEFORE_UPDATE = 'beforeUpdate';

var AFTER_UPDATE = 'afterUpdate';

var BEFORE_DESTROY = 'beforeDestroy';

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
      }i = vnode$$1.data.hook;
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
        oldStartVnode = oldCh[++oldStartIdx];
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
        patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldStartVnode.elm, api.nextSibling(oldEndVnode.elm));
        oldStartVnode = oldCh[++oldStartIdx];
        newEndVnode = newCh[--newEndIdx];
      } else if (sameVnode(oldEndVnode, newStartVnode)) {
        patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue);
        api.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
        oldEndVnode = oldCh[--oldEndIdx];
        newStartVnode = newCh[++newStartIdx];
      } else {
        if (isUndef(oldKeyToIdx)) oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx);
        idxInOld = oldKeyToIdx[newStartVnode.key];
        if (isUndef(idxInOld)) {
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

var tagRE = /(?:<!--[\S\s]*?-->|<(?:"[^"]*"['"]*|'[^']*'['"]*|[^'">])+>)/g;
var parseTag = parseTag$1;

var empty = Object.create ? Object.create(null) : {};

function pushTextNode(list, html, start) {
    var end = html.indexOf('<', start);
    var content = html.slice(start, end === -1 ? undefined : end);

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
    name = name.replace(/-(\w)/g, function _replace($1, $2) {
        return $2.toUpperCase();
    });

    var firstChar = name.charAt(0).toLowerCase();
    return '' + firstChar + name.substring(1);
}

var entityRegex = new RegExp('&[a-z0-9]+;', 'gi');

var el = null;

function unescapeEntities(text, context) {
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

    if (!html) {
        return null;
    }

    var createdVNodes = [];

    var vnodes = convertNodes((0, _parse2.default)(html), createdVNodes, context);

    var res = void 0;
    if (!vnodes) {
        res = toVNode({ type: 'text', content: html }, createdVNodes, context);
    } else if (vnodes.length === 1) {
        res = vnodes[0];
    } else {
        res = vnodes;
    }

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

function create$2(parent, tagName) {
  parent.innerHTML = '<' + tagName + '></' + tagName + '>';
  return parent.firstChild;
}

function getContent(selector) {
  return find(selector).innerHTML;
}

function isElement(node) {
  return node.nodeType === 1;
}

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

function off$1(element, type, listener) {
  var $emitter = element.$emitter;

  var types = keys($emitter.listeners);

  $emitter.off(type, listener);

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

        if (node.component) {
          directives.push({
            node: node,
            name: 'component',
            directive: instance.directive('component')
          });
        } else if (array(node.attrs)) {
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

        if (array(node.directives)) {
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
        }

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

            data.hook = {
              insert: function insert(vnode) {
                notify(vnode, 'attach');
              },
              postpatch: function postpatch(oldNode, vnode) {
                notify(vnode, 'update');
              },
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
        return content;
      } else {
        return strings.default(content);
      }
    }
  });
}

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

  detach: function detach(_ref2) {
    var el = _ref2.el;
    var $ref = el.$ref;

    if ($ref) {
      $ref();
    }
  }

};

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
        if (array($component)) {
          $component.push(function ($component) {
            $component.on(type, listener);
          });
        } else {
          $component.on(type, listener);
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
        remove(value, el.value, FALSE);
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

    instance.$options = options;

    if (props && !object(props)) {
      props = NULL;
    }

    if (props && data && !func(data)) {
      warn('Passing a `data` option should be a function.');
    }

    instance.$data = props || {};

    extend(instance.$data, func(data) ? data.call(instance) : data);

    if (object(computed)) {
      instance.$computedGetters = {};
      instance.$computedSetters = {};

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

    if (string(el)) {
      if (selector.test(el)) {
        el = find(el);
      }
    }
    if (el) {
      if (isElement(el)) {
        if (!replace) {
          el = create$2(el, 'div');
        }
      } else {
        error$1('Passing a `el` option must be a html element.');
      }
    }

    if (parent) {
      instance.$parent = parent;
    }

    extend(instance, methods);
    extend(instance, extensions);

    instance.component(components);
    instance.directive(directives);
    instance.filter(filters);
    instance.partial(partials);

    if (el && template) {
      instance.$viewWatcher = function () {
        instance.$dirty = TRUE;
      };
      _execute(options[BEFORE_MOUNT], instance);
      instance.$template = Yox.compile(template);
      instance.updateView(el);
    }
  }

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
  }, {
    key: 'on',
    value: function on(type, listener) {
      this.$eventEmitter.on(type, listener);
    }
  }, {
    key: 'once',
    value: function once(type, listener) {
      this.$eventEmitter.once(type, listener);
    }
  }, {
    key: 'off',
    value: function off(type, listener) {
      this.$eventEmitter.off(type, listener);
    }
  }, {
    key: 'fire',
    value: function fire(type, data, noBubble) {

      if (data === TRUE) {
        noBubble = data;
        data = NULL;
      }

      var event$$1 = data;
      if (!(event$$1 instanceof Event)) {
        event$$1 = new Event(type);
        if (data) {
          event$$1.data = data;
        }
      }

      if (event$$1.type !== type) {
        data = event$$1.data;
        event$$1 = new Event(event$$1);
        event$$1.type = type;

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
  }, {
    key: 'watch',
    value: function watch(keypath, watcher) {
      this.$watchEmitter.on(keypath, watcher);
    }
  }, {
    key: 'watchOnce',
    value: function watchOnce(keypath, watcher) {
      this.$watchEmitter.once(keypath, watcher);
    }
  }, {
    key: 'updateModel',
    value: function updateModel(model) {

      var instance = this;

      var $data = instance.$data,
          $computedSetters = instance.$computedSetters;


      each$1(model, function (newValue, key) {
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

      extend(context, filter$1.data, $data, $filters.data, $computedGetters);

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
        var _ret2 = function () {
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

        if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
      } else {
        return function (event$$1) {
          instance.fire(value, event$$1);
        };
      }
    }
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
  }, {
    key: 'filter',
    value: function filter() {
      var store = this.$filters || (this.$filters = new Store());
      return magic({
        args: arguments,
        get: function get(id) {
          return store.get(id) || Yox.filter(id);
        },
        set: function set(id, value) {
          store.set(id, value);
        }
      });
    }
  }, {
    key: 'directive',
    value: function directive() {
      var store = this.$directives || (this.$directives = new Store());
      return magic({
        args: arguments,
        get: function get(id) {
          return store.get(id) || Yox.directive(id);
        },
        set: function set(id, value) {
          store.set(id, value);
        }
      });
    }
  }, {
    key: 'partial',
    value: function partial() {
      var store = this.$partials || (this.$partials = new Store());
      return magic({
        args: arguments,
        get: function get(id) {
          return store.get(id) || Yox.partial(id);
        },
        set: function set(id, value) {
          store.set(id, value);
        }
      });
    }
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
        remove($parent.$children, instance);
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
  }, {
    key: 'nextTick',
    value: function nextTick(fn) {
      add(fn);
    }
  }, {
    key: 'toggle',
    value: function toggle(keypath) {
      var value = !this.get(keypath);
      this.set(keypath, value);
      return value;
    }
  }, {
    key: 'increase',
    value: function increase(keypath, step, max) {
      var value = toNumber(this.get(keypath), 0) + (numeric(step) ? step : 1);
      if (!numeric(max) || value <= max) {
        this.set(keypath, value);
      }
      return value;
    }
  }, {
    key: 'decrease',
    value: function decrease(keypath, step, min) {
      var value = toNumber(this.get(keypath), 0) - (numeric(step) ? step : 1);
      if (!numeric(min) || value >= min) {
        this.set(keypath, value);
      }
      return value;
    }
  }]);
  return Yox;
}();

Yox.version = '0.19.12';

Yox.switcher = switcher;

Yox.utils = { is: is$1, array: array$1, object: object$1, string: string$1, logger: logger, native: native, Store: Store, Emitter: Emitter, Event: Event };

each(['component', 'directive', 'filter', 'partial'], function (type) {
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

Yox.nextTick = add;

Yox.compile = function (template) {
  return string(template) ? compile$$1(template) : template;
};

Yox.validate = function (props, schema) {
  var result = {};
  each$1(schema, function (rule, key) {
    var type = rule.type,
        value = rule.value,
        required = rule.required;

    if (has$2(props, key)) {
      if (type) {
        (function () {
          var target = props[key],
              matched = void 0;

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

Yox.directive({
  ref: refDt,
  event: event,
  model: modelDt,
  component: componentDt
});

return Yox;

})));
