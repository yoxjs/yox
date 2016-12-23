(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Yox = factory());
}(this, (function () { 'use strict';

var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;

var THIS = '$this';



var doc = typeof document !== 'undefined' ? document : NULL;

var templateParse = {};

var expressionParse = {};

var IF = '#if';
var ELSE = 'else';
var ELSE_IF = 'else if';
var EACH = '#each';
var PARTIAL = '#partial';
var IMPORT = '>';
var COMMENT = '!';
var SPREAD = '...';

var DIRECTIVE_PREFIX = 'o-';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';

var KEY_REF = 'ref';
var KEY_LAZY = 'lazy';
var KEY_MODEL = 'model';

var KEY_UNIQUE = 'key';

var syntax = Object.freeze({
	IF: IF,
	ELSE: ELSE,
	ELSE_IF: ELSE_IF,
	EACH: EACH,
	PARTIAL: PARTIAL,
	IMPORT: IMPORT,
	COMMENT: COMMENT,
	SPREAD: SPREAD,
	DIRECTIVE_PREFIX: DIRECTIVE_PREFIX,
	DIRECTIVE_EVENT_PREFIX: DIRECTIVE_EVENT_PREFIX,
	SPECIAL_EVENT: SPECIAL_EVENT,
	SPECIAL_KEYPATH: SPECIAL_KEYPATH,
	KEY_REF: KEY_REF,
	KEY_LAZY: KEY_LAZY,
	KEY_MODEL: KEY_MODEL,
	KEY_UNIQUE: KEY_UNIQUE
});

var componentName = /[-A-Z]/;

var tag = /<[^>]+>/;

var selector = /^[#.]\w+$/;

var selfClosingTagName = /input|img|br/i;

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

function each$1(array$$1, callback, reversed) {
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

function reduce(array$$1, callback, initialValue) {
  return array$$1.reduce(callback, initialValue);
}

function diff(array1, array2, strict) {
  var result = [];
  each$1(array2, function (item) {
    if (!has$2(array1, item, strict)) {
      result.push(item);
    }
  });
  return result;
}

function merge() {
  var result = [];
  var push = function push(item) {
    result.push(item);
  };
  each$1(arguments, function (array$$1) {
    each$1(array$$1, push);
  });
  return result;
}

function toArray(array$$1) {
  return array(array$$1) ? array$$1 : slice.call(array$$1);
}

function toObject(array$$1, key) {
  var result = {};
  each$1(array$$1, function (item) {
    result[key ? item[key] : item] = item;
  });
  return result;
}

function indexOf(array$$1, item, strict) {
  if (strict !== FALSE) {
    return array$$1.indexOf(item);
  } else {
    var index = -1;
    each$1(array$$1, function (value, i) {
      if (item == value) {
        index = i;
        return FALSE;
      }
    });
    return index;
  }
}

function has$2(array$$1, item, strict) {
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
	each: each$1,
	reduce: reduce,
	diff: diff,
	merge: merge,
	toArray: toArray,
	toObject: toObject,
	indexOf: indexOf,
	has: has$2,
	last: last,
	remove: remove,
	falsy: falsy
});

function keys(object$$1) {
  return Object.keys(object$$1);
}

function each$$1(object$$1, callback) {
  each$1(keys(object$$1), function (key) {
    return callback(object$$1[key], key);
  });
}

function has$1(object$$1, key) {
  return object$$1.hasOwnProperty(key);
}

function extend() {
  var args = arguments,
      result = args[0];
  for (var i = 1, len = args.length; i < len; i++) {
    if (object(args[i])) {
      each$$1(args[i], function (value, key) {
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
    each$1(object$$1, function (item, index) {
      result[index] = deep ? copy(item) : item;
    });
  } else if (object(object$$1)) {
    result = {};
    each$$1(object$$1, function (value, key) {
      result[key] = deep ? copy(value) : value;
    });
  }
  return result;
}

function get$1(object$$1, keypath) {
  if (has$1(object$$1, keypath)) {
    return {
      value: object$$1[keypath]
    };
  }

  if (string(keypath) && keypath.indexOf('.') > 0) {
    var list = keypath.split('.');
    for (var i = 0, len = list.length; i < len && object$$1; i++) {
      if (i < len - 1) {
        object$$1 = object$$1[list[i]];
      } else if (has$1(object$$1, list[i])) {
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
    var list = keypath.split('.');
    var prop = list.pop();
    each$1(list, function (item, index) {
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
	each: each$$1,
	has: has$1,
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







var get$2 = function get$2(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get$2(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

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



var set$2 = function set$2(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      set$2(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
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
        each$$1(key, function (value, key) {
          data[key] = value;
        });
      } else if (string(key)) {
        data[key] = value;
      }
    }
  }]);
  return Store;
}();

var component = new Store();
var directive$1 = new Store();
var filter$1 = new Store();
var partial$1 = new Store();

var registry = Object.freeze({
	component: component,
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

var hasConsole = typeof console !== 'undefined';

function warn(msg) {
  if (debug && hasConsole) {
    console.warn(msg);
  }
}

function error$1(msg) {
  if (hasConsole) {
    console.error(msg);
  }
}

var logger = Object.freeze({
	warn: warn,
	error: error$1
});

var breaklinePrefixPattern = /^[ \t]*\n/;
var breaklineSuffixPattern = /\n[ \t]*$/;

var nonSingleQuotePattern = /^[^']*/;
var nonDoubleQuotePattern = /^[^"]*/;

function isBreakLine(str) {
  return str.indexOf('\n') >= 0 && !str.trim();
}

function trimBreakline(str) {
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

  each$1(str.split('\n'), function (lineStr) {
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
  each$1(sortedTokens, function (token) {
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

var Node = function Node(type) {
  classCallCheck(this, Node);

  this.type = type;
};

var Unary = function (_Node) {
  inherits(Unary, _Node);

  function Unary(operator, arg) {
    classCallCheck(this, Unary);

    var _this = possibleConstructorReturn(this, (Unary.__proto__ || Object.getPrototypeOf(Unary)).call(this, UNARY));

    _this.operator = operator;
    _this.arg = arg;
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

      switch (operator) {
        case Unary.PLUS:
          value = +value;
          break;
        case Unary.MINUS:
          value = -value;
          break;
        case Unary.BANG:
          value = !value;
          break;
        case Unary.WAVE:
          value = ~value;
          break;
      }
      return {
        value: value,
        deps: deps
      };
    }
  }]);
  return Unary;
}(Node);

Unary.PLUS = '+';
Unary.MINUS = '-';
Unary.BANG = '!';
Unary.WAVE = '~';

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

  createClass(Binary, [{
    key: 'stringify',
    value: function stringify() {
      var right = this.right,
          operator = this.operator,
          left = this.left;

      return '(' + left.stringify() + ') ' + operator + ' (' + right.stringify() + ')';
    }
  }, {
    key: 'execute',
    value: function execute(context) {
      var right = this.right,
          operator = this.operator,
          left = this.left;

      left = left.execute(context);
      right = right.execute(context);

      var value = void 0;
      switch (operator) {
        case Binary.OR:
          value = left.value || right.value;
          break;
        case Binary.AND:
          value = left.value && right.value;
          break;
        case Binary.SE:
          value = left.value === right.value;
          break;
        case Binary.SNE:
          value = left.value !== right.value;
          break;
        case Binary.LE:
          value = left.value == right.value;
          break;
        case Binary.LNE:
          value = left.value != right.value;
          break;
        case Binary.GT:
          value = left.value > right.value;
          break;
        case Binary.LT:
          value = left.value < right.value;
          break;
        case Binary.GTE:
          value = left.value >= right.value;
          break;
        case Binary.LTE:
          value = left.value <= right.value;
          break;
        case Binary.PLUS:
          value = left.value + right.value;
          break;
        case Binary.MINUS:
          value = left.value - right.value;
          break;
        case Binary.MULTIPLY:
          value = left.value * right.value;
          break;
        case Binary.DIVIDE:
          value = left.value / right.value;
          break;
        case Binary.MODULO:
          value = left.value % right.value;
          break;
      }

      return {
        value: value,
        deps: extend(left.deps, right.deps)
      };
    }
  }]);
  return Binary;
}(Node);

Binary.OR = '||';
Binary.AND = '&&';

Binary.SE = '===';

Binary.SNE = '!==';

Binary.LE = '==';

Binary.LNE = '!=';
Binary.GT = '>';
Binary.LT = '<';
Binary.GTE = '>=';
Binary.LTE = '<=';
Binary.PLUS = '+';
Binary.MINUS = '-';
Binary.MULTIPLY = '*';
Binary.DIVIDE = '/';
Binary.MODULO = '%';

var unaryMap = {};

unaryMap[Unary.PLUS] = unaryMap[Unary.MINUS] = unaryMap[Unary.BANG] = unaryMap[Unary.WAVE] = TRUE;

var unaryList = sortKeys(unaryMap);

var binaryMap = {};

binaryMap[Binary.OR] = 1;
binaryMap[Binary.AND] = 2;
binaryMap[Binary.LE] = 3;
binaryMap[Binary.LNE] = 3;
binaryMap[Binary.SE] = 3;
binaryMap[Binary.SNE] = 3;
binaryMap[Binary.LT] = 4;
binaryMap[Binary.LTE] = 4;
binaryMap[Binary.GT] = 4;
binaryMap[Binary.GTE] = 4;
binaryMap[Binary.PLUS] = 5;
binaryMap[Binary.MINUS] = 5;
binaryMap[Binary.MULTIPLY] = 6;
binaryMap[Binary.DIVIDE] = 6;
binaryMap[Binary.MODULO] = 6;

var binaryList = sortKeys(binaryMap);

var keyword = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED
};

var Array$1 = function (_Node) {
  inherits(Array, _Node);

  function Array(elements) {
    classCallCheck(this, Array);

    var _this = possibleConstructorReturn(this, (Array.__proto__ || Object.getPrototypeOf(Array)).call(this, ARRAY));

    _this.elements = elements;
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
      each$1(this.elements, function (node) {
        var result = node.execute(context);
        value.push(result.value);
        extend(deps, result.deps);
      });
      return {
        value: value,
        deps: deps
      };
    }
  }]);
  return Array;
}(Node);

var execute$1 = function (fn, context, args) {
  if (func(fn)) {
    if (array(args)) {
      return fn.apply(context, args);
    } else {
      return fn.call(context, args);
    }
  }
};

var Call = function (_Node) {
  inherits(Call, _Node);

  function Call(callee, args) {
    classCallCheck(this, Call);

    var _this = possibleConstructorReturn(this, (Call.__proto__ || Object.getPrototypeOf(Call)).call(this, CALL));

    _this.callee = callee;
    _this.args = args;
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

      value = execute$1(value, NULL, args.map(function (arg) {
        var result = arg.execute(context);
        extend(deps, result.deps);
        return result.value;
      }));

      return {
        value: value,
        deps: deps
      };
    }
  }]);
  return Call;
}(Node);

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

  createClass(Conditional, [{
    key: 'stringify',
    value: function stringify() {
      var test = this.test,
          consequent = this.consequent,
          alternate = this.alternate;

      return '(' + test.stringify() + ') ? (' + consequent.stringify() + ') : (' + alternate.stringify() + ')';
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
}(Node);

var Identifier = function (_Node) {
  inherits(Identifier, _Node);

  function Identifier(name) {
    classCallCheck(this, Identifier);

    var _this = possibleConstructorReturn(this, (Identifier.__proto__ || Object.getPrototypeOf(Identifier)).call(this, IDENTIFIER));

    _this.name = name;
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
      return {
        value: value,
        deps: deps
      };
    }
  }]);
  return Identifier;
}(Node);

var Literal = function (_Node) {
  inherits(Literal, _Node);

  function Literal(value) {
    classCallCheck(this, Literal);

    var _this = possibleConstructorReturn(this, (Literal.__proto__ || Object.getPrototypeOf(Literal)).call(this, LITERAL));

    _this.value = value;
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
}(Node);

var Member = function (_Node) {
  inherits(Member, _Node);

  function Member(object$$1, property) {
    classCallCheck(this, Member);

    var _this = possibleConstructorReturn(this, (Member.__proto__ || Object.getPrototypeOf(Member)).call(this, MEMBER));

    _this.object = object$$1;
    _this.property = property;
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

      each$1(this.flatten(), function (node, index) {
        if (node.type !== LITERAL) {
          if (index > 0) {
            var result = node.execute(context);
            extend(deps, result.deps);
            keys$$1.push(result.value);
          } else if (node.type === IDENTIFIER) {
            keys$$1.push(node.name);
          }
        } else {
          keys$$1.push(node.value);
        }
      });

      var key = stringify$1(keys$$1);

      var _context$get = context.get(key),
          value = _context$get.value,
          keypath = _context$get.keypath;

      deps[keypath] = value;

      return {
        value: value,
        deps: deps
      };
    }
  }]);
  return Member;
}(Node);

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
function parse$2(content) {
  var length = content.length;

  var index = 0,
      charCode = void 0,
      value = void 0;

  function getChar() {
    return content.charAt(index);
  }
  function getCharCode(i) {
    return content.charCodeAt(i != NULL ? i : index);
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

    return new Literal(parseFloat(content.substring(start, index)));
  }

  function parseString() {

    var start = index;

    skipString();

    return new Literal(content.substring(start + 1, index - 1));
  }

  function parseIdentifier() {

    var start = index;
    skipIdentifier();

    value = content.substring(start, index);
    if (keyword[value]) {
      return new Literal(keyword[value]);
    }

    if (value === 'this') {
      return new Identifier(THIS);
    }

    if (value) {
      return new Identifier(value);
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
        value = new Call(value, parseTuple(CPAREN));
        break;
      } else {
        if (charCode === PERIOD) {
          index++;
          value = new Member(value, new Literal(parseIdentifier().name));
        } else if (charCode === OBRACK) {
            index++;
            value = new Member(value, parseSubexpression(CBRACK));
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
          return new Array$1(parseTuple(CBRACK));
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
      return new Unary(op, value);
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
        stack.push(new Binary(stack.pop(), (stack.pop(), stack.pop()), stack.pop()));
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
      right = new Binary(right, (stack.pop(), stack.pop()), stack.pop());
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
        return new Conditional(test, consequent, alternate);
      } else {
        parseError$1(content);
      }
    }

    return test;
  }

  if (!expressionParse[content]) {
    var ast = parseExpression();
    expressionParse[content] = expressionParse[ast.stringify()] = ast;
  }

  return expressionParse[content];
}

var expression = Object.freeze({
	parse: parse$2
});

var SEPARATOR_KEY = '.';
var SEPARATOR_PATH = '/';
var LEVEL_CURRENT = '.';
var LEVEL_PARENT = '..';

function normalize(str) {
  if (str && str.indexOf('[') > 0 && str.indexOf(']') > 0) {
    return parse$2(str).stringify();
  }
  return str;
}

function parse$1(str) {
  return str ? normalize(str).split(SEPARATOR_KEY) : [];
}

function stringify$1(keypaths) {
  return keypaths.filter(function (term) {
    return term !== '' && term !== LEVEL_CURRENT;
  }).join(SEPARATOR_KEY);
}

function resolve(base, path) {
  var list = parse$1(base);
  each$1(path.split(SEPARATOR_PATH), function (term) {
    if (term === LEVEL_PARENT) {
      list.pop();
    } else {
      list.push(normalize(term));
    }
  });
  return stringify$1(list);
}

var Context = function () {
  function Context(data, parent) {
    classCallCheck(this, Context);

    this.data = copy(data);
    this.parent = parent;
    this.cache = {};
    this.cache[THIS] = data;
  }

  createClass(Context, [{
    key: 'push',
    value: function push(data) {
      return new Context(data, this);
    }
  }, {
    key: 'set',
    value: function set(key, value) {
      var data = this.data,
          cache = this.cache;

      if (has$1(cache, key)) {
        delete cache[key];
      }
      set$1(data, key, value);
    }
  }, {
    key: 'get',
    value: function get(key) {

      var instance = this;
      var _instance = instance,
          cache = _instance.cache;


      if (!has$1(cache, key)) {
        var result = void 0;
        var keys$$1 = [key];
        while (instance) {
          result = get$1(instance.data, key);
          if (result) {
            break;
          } else {
            instance = instance.parent;
            keys$$1.unshift(LEVEL_PARENT);
          }
        }
        key = keys$$1.join(SEPARATOR_PATH);
        if (result) {
          cache[key] = result.value;
        }
      }

      var value = cache[key];
      if (key === THIS) {
        key = LEVEL_CURRENT;
      }

      return {
        value: value,
        keypath: key
      };
    }
  }]);
  return Context;
}();

var Scanner = function () {
  function Scanner(str) {
    classCallCheck(this, Scanner);

    this.reset(str);
  }

  createClass(Scanner, [{
    key: 'reset',
    value: function reset(str) {
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
      return this.tail[index];
    }
  }]);
  return Scanner;
}();

var Node$2 = function () {
  function Node(type, hasChildren) {
    classCallCheck(this, Node);

    this.type = type;
    if (hasChildren !== FALSE) {
      this.children = [];
    }
  }

  createClass(Node, [{
    key: 'addChild',
    value: function addChild(node) {
      var children = this.children;

      if (node.type === TEXT) {
        var lastChild = last(children);
        if (lastChild && lastChild.type === TEXT) {
          lastChild.content += node.content;
          return;
        }
      }
      children.push(node);
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      var children = this.children;

      return children[0] ? children[0].content : TRUE;
    }
  }, {
    key: 'execute',
    value: function execute$1(data) {
      var context = data.context,
          keys$$1 = data.keys,
          addDeps = data.addDeps;

      var _expr$execute = this.expr.execute(context),
          value = _expr$execute.value,
          deps = _expr$execute.deps;

      var newDeps = {};
      each$$1(deps, function (value, key) {
        newDeps[resolve(stringify$1(keys$$1), key)] = value;
      });
      addDeps(newDeps);
      return {
        value: value,
        deps: newDeps
      };
    }
  }, {
    key: 'render',
    value: function render() {}
  }, {
    key: 'renderChildren',
    value: function renderChildren(data, children) {
      reduce(children || this.children, function (prev, current) {
        return current.render(data, prev);
      });
    }
  }]);
  return Node;
}();

var Attribute = function (_Node) {
  inherits(Attribute, _Node);

  function Attribute(name) {
    classCallCheck(this, Attribute);

    var _this = possibleConstructorReturn(this, (Attribute.__proto__ || Object.getPrototypeOf(Attribute)).call(this, ATTRIBUTE));

    _this.name = name;
    return _this;
  }

  createClass(Attribute, [{
    key: 'render',
    value: function render(data) {
      var name = this.name;
      var keys$$1 = data.keys,
          parent = data.parent;


      if (name.type === EXPRESSION) {
        var _name$execute = name.execute(data),
            value = _name$execute.value;

        name = value;
      }

      var node = new Attribute(name);
      node.keypath = keys$$1.join('.');
      parent.addAttr(node);

      this.renderChildren(extend({}, data, { parent: node }));
    }
  }]);
  return Attribute;
}(Node$2);

var Directive = function (_Node) {
  inherits(Directive, _Node);

  function Directive(name) {
    classCallCheck(this, Directive);

    var _this = possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this, DIRECTIVE));

    _this.name = name;
    return _this;
  }

  createClass(Directive, [{
    key: 'render',
    value: function render(data) {

      var node = new Directive(this.name);
      node.keypath = data.keys.join('.');
      data.parent.addDirective(node);

      this.renderChildren(extend({}, data, { parent: node }));
    }
  }]);
  return Directive;
}(Node$2);

var Each = function (_Node) {
  inherits(Each, _Node);

  function Each(expr, index) {
    classCallCheck(this, Each);

    var _this = possibleConstructorReturn(this, (Each.__proto__ || Object.getPrototypeOf(Each)).call(this, EACH$1));

    _this.expr = expr;
    _this.index = index;
    return _this;
  }

  createClass(Each, [{
    key: 'render',
    value: function render(data) {

      var instance = this;
      var expr = instance.expr,
          index = instance.index;
      var context = data.context,
          keys$$1 = data.keys;

      var _instance$execute = instance.execute(data),
          value = _instance$execute.value;

      var iterate = void 0;
      if (array(value)) {
        iterate = each$1;
      } else if (object(value)) {
        iterate = each$$1;
      }

      if (iterate) {
        (function () {
          var listContext = context.push(value);
          keys$$1.push(expr.stringify());
          iterate(value, function (item, i) {
            if (index) {
              listContext.set(index, i);
            }
            keys$$1.push(i);
            listContext.set(SPECIAL_KEYPATH, keys$$1.join('.'));
            instance.renderChildren(extend({}, data, { context: listContext.push(item) }));
            keys$$1.pop();
          });
          keys$$1.pop();
        })();
      }
    }
  }]);
  return Each;
}(Node$2);

var Element = function (_Node) {
  inherits(Element, _Node);

  function Element(name, component) {
    classCallCheck(this, Element);

    var _this = possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this, ELEMENT));

    _this.name = name;
    _this.component = component;
    _this.attrs = [];
    _this.directives = [];
    return _this;
  }

  createClass(Element, [{
    key: 'addAttr',
    value: function addAttr(node) {
      this.attrs.push(node);
    }
  }, {
    key: 'addDirective',
    value: function addDirective(node) {
      this.directives.push(node);
    }
  }, {
    key: 'render',
    value: function render(data) {

      var instance = this;
      var name = instance.name,
          component = instance.component,
          attrs = instance.attrs,
          directives = instance.directives;

      var node = new Element(name, component);
      node.keypath = data.keys.join('.');
      data.parent.addChild(node);

      data = extend({}, data, { parent: node });
      instance.renderChildren(data, attrs);
      instance.renderChildren(data, directives);
      instance.renderChildren(data);
    }
  }]);
  return Element;
}(Node$2);

var Else = function (_Node) {
  inherits(Else, _Node);

  function Else() {
    classCallCheck(this, Else);
    return possibleConstructorReturn(this, (Else.__proto__ || Object.getPrototypeOf(Else)).call(this, ELSE$1));
  }

  createClass(Else, [{
    key: 'render',
    value: function render(data, prev) {
      if (prev) {
        this.renderChildren(data);
      }
    }
  }]);
  return Else;
}(Node$2);

var ElseIf = function (_Node) {
  inherits(ElseIf, _Node);

  function ElseIf(expr) {
    classCallCheck(this, ElseIf);

    var _this = possibleConstructorReturn(this, (ElseIf.__proto__ || Object.getPrototypeOf(ElseIf)).call(this, ELSE_IF$1));

    _this.expr = expr;
    return _this;
  }

  createClass(ElseIf, [{
    key: 'render',
    value: function render(data, prev) {
      if (prev) {
        var _execute = this.execute(data),
            value = _execute.value;

        if (value) {
          this.renderChildren(data);
        } else {
          return prev;
        }
      }
    }
  }]);
  return ElseIf;
}(Node$2);

var Text = function (_Node) {
  inherits(Text, _Node);

  function Text(content) {
    classCallCheck(this, Text);

    var _this = possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, TEXT, FALSE));

    _this.content = content;
    return _this;
  }

  createClass(Text, [{
    key: 'render',
    value: function render(data) {
      var node = new Text(this.content);
      node.keypath = data.keys.join('.');
      data.parent.addChild(node);
    }
  }]);
  return Text;
}(Node$2);

var Expression = function (_Node) {
  inherits(Expression, _Node);

  function Expression(expr, safe) {
    classCallCheck(this, Expression);

    var _this = possibleConstructorReturn(this, (Expression.__proto__ || Object.getPrototypeOf(Expression)).call(this, EXPRESSION, FALSE));

    _this.expr = expr;
    _this.safe = safe;
    return _this;
  }

  createClass(Expression, [{
    key: 'render',
    value: function render(data) {
      var _execute = this.execute(data),
          value = _execute.value;

      if (value == NULL) {
        value = '';
      } else if (func(value) && value.$computed) {
        value = value();
      }

      if (!this.safe && string(value) && tag.test(value)) {
        each$1(data.parse(value), function (node) {
          node.render(data);
        });
      } else {
        var node = new Text(value);
        node.render(data);
      }
    }
  }]);
  return Expression;
}(Node$2);

var If = function (_Node) {
  inherits(If, _Node);

  function If(expr) {
    classCallCheck(this, If);

    var _this = possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).call(this, IF$1));

    _this.expr = expr;
    return _this;
  }

  createClass(If, [{
    key: 'render',
    value: function render(data) {
      var _execute = this.execute(data),
          value = _execute.value;

      if (value) {
        this.renderChildren(data);
      } else {
        return TRUE;
      }
    }
  }]);
  return If;
}(Node$2);

var Import = function (_Node) {
  inherits(Import, _Node);

  function Import(name) {
    classCallCheck(this, Import);

    var _this = possibleConstructorReturn(this, (Import.__proto__ || Object.getPrototypeOf(Import)).call(this, IMPORT$1, FALSE));

    _this.name = name;
    return _this;
  }

  return Import;
}(Node$2);

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

var Spread = function (_Node) {
  inherits(Spread, _Node);

  function Spread(expr) {
    classCallCheck(this, Spread);

    var _this = possibleConstructorReturn(this, (Spread.__proto__ || Object.getPrototypeOf(Spread)).call(this, SPREAD$1, FALSE));

    _this.expr = expr;
    return _this;
  }

  createClass(Spread, [{
    key: 'render',
    value: function render(data) {
      var _execute = this.execute(data),
          value = _execute.value;

      if (object(value)) {
        each$$1(value, function (value, key) {
          var node = new Attribute(key);
          node.addChild(new Text(value));
          node.render(data);
        });
      }
    }
  }]);
  return Spread;
}(Node$2);

var openingDelimiter = '\\{\\{\\s*';
var closingDelimiter = '\\s*\\}\\}';
var openingDelimiterPattern = new RegExp(openingDelimiter);
var closingDelimiterPattern = new RegExp(closingDelimiter);

var elementPattern = /<(?:\/)?[a-z]\w*/i;
var elementEndPattern = /(?:\/)?>/;

var attributePattern = /([-:@a-z0-9]+)(=["'])?/i;
var attributeValueStartPattern = /^=["']/;

var ERROR_PARTIAL_NAME = 'Expected legal partial name';
var ERROR_EXPRESSION = 'Expected expression';

var parsers = [{
  test: function test(source) {
    return source.startsWith(EACH);
  },
  create: function create(source) {
    var terms = source.slice(EACH.length).trim().split(':');
    var expr = parse$2(terms[0]);
    var index = void 0;
    if (terms[1]) {
      index = terms[1].trim();
    }
    return new Each(expr, index);
  }
}, {
  test: function test(source) {
    return source.startsWith(IMPORT);
  },
  create: function create(source) {
    var name = source.slice(IMPORT.length).trim();
    return name ? new Import(name) : ERROR_PARTIAL_NAME;
  }
}, {
  test: function test(source) {
    return source.startsWith(PARTIAL);
  },
  create: function create(source) {
    var name = source.slice(PARTIAL.length).trim();
    return name ? new Partial(name) : ERROR_PARTIAL_NAME;
  }
}, {
  test: function test(source) {
    return source.startsWith(IF);
  },
  create: function create(source) {
    var expr = source.slice(IF.length).trim();
    return expr ? new If(parse$2(expr)) : ERROR_EXPRESSION;
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE_IF);
  },
  create: function create(source, popStack) {
    var expr = source.slice(ELSE_IF.length);
    if (expr) {
      popStack();
      return new ElseIf(parse$2(expr));
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
      return new Spread(parse$2(expr));
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
    return new Expression(parse$2(source), safe);
  }
}];

var rootName = 'root';

function render$1(ast, data) {

  var rootElement = new Element(rootName);
  var deps = {};

  var renderAst = function renderAst(ast) {
    ast.render({
      keys: [],
      parent: rootElement,
      context: new Context(data),
      parse: function parse(template) {
        return _parse(template).children;
      },
      addDeps: function addDeps(childrenDeps) {
        extend(deps, childrenDeps);
      }
    });
  };

  if (ast.name === rootName) {
    each$1(ast.children, renderAst);
  } else {
    renderAst(ast);
  }

  var children = rootElement.children;

  if (children.length > 1) {
    error$1('Template should have only one root element.');
  }

  return {
    root: children[0],
    deps: deps
  };
}

function _parse(template, getPartial, setPartial) {

  if (templateParse[template]) {
    return templateParse[template];
  }

  var mainScanner = new Scanner(template),
      helperScanner = new Scanner(),
      rootNode = new Element(rootName),
      currentNode = rootNode,
      nodeStack = [],
      node = void 0,
      name = void 0,
      quote = void 0,
      content = void 0,
      isComponent = void 0,
      isSelfClosingTag = void 0,
      match = void 0,
      errorIndex = void 0;

  var attrLike = {};
  attrLike[ATTRIBUTE] = attrLike[DIRECTIVE] = TRUE;

  var pushStack = function pushStack(node) {
    nodeStack.push(currentNode);
    currentNode = node;
  };

  var popStack = function popStack() {
    currentNode = nodeStack.pop();
    return currentNode;
  };

  var addChild = function addChild(node) {
    var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'addChild';
    var name = node.name,
        type = node.type,
        content = node.content,
        children = node.children;


    switch (type) {
      case TEXT:
        if (isBreakLine(content)) {
          return;
        }
        if (content = trimBreakline(content)) {
          node.content = content;
        } else {
          return;
        }
        break;

      case SPREAD$1:
      case ATTRIBUTE:
        if (currentNode.attrs) {
          action = 'addAttr';
        }
        break;

      case DIRECTIVE:
        if (currentNode.directives) {
          action = 'addDirective';
        }
        break;

      case IMPORT$1:
        each$1(getPartial(name).children, function (node) {
          addChild(node);
        });
        return;

      case PARTIAL$1:
        setPartial(name, node);
        pushStack(node);
        return;

    }

    currentNode[action](node);

    if (children) {
      pushStack(node);
    }
  };

  var parseAttributeValue = function parseAttributeValue(content) {
    match = matchByQuote(content, quote);
    if (match) {
      addChild(new Text(match));
      content = content.substr(match.length);
    }
    if (content.charAt(0) === quote) {
      popStack();
    }
    return content;
  };

  var parseContent = function parseContent(content, isAttributesParsing) {

    helperScanner.reset(content);

    while (helperScanner.hasNext()) {
      content = helperScanner.nextBefore(openingDelimiterPattern);
      helperScanner.nextAfter(openingDelimiterPattern);

      if (content) {

        if (isAttributesParsing) {
          if (attrLike[currentNode.type]) {
            if (currentNode.children.length) {
              content = parseAttributeValue(content);
            } else {
              if (attributeValueStartPattern.test(content)) {
                quote = content.charAt(1);
                content = content.slice(2);
              } else {
                  popStack();
                }
            }
          }

          if (!attrLike[currentNode.type]) {
            while (match = attributePattern.exec(content)) {
              content = content.slice(match.index + match[0].length);

              name = match[1];

              addChild(name.startsWith(DIRECTIVE_PREFIX) || name.startsWith(DIRECTIVE_EVENT_PREFIX) || name === KEY_REF || name === KEY_LAZY || name === KEY_MODEL || name === KEY_UNIQUE ? new Directive(name) : new Attribute(name));

              if (string(match[2])) {
                quote = match[2].charAt(1);
                content = parseAttributeValue(content);
              } else {
                  popStack();
                }
            }
            content = '';
          }
        }

        if (content) {
          addChild(new Text(content));
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
          each$1(parsers, function (parser) {
            if (parser.test(content)) {
              node = parser.create(content, popStack);
              if (string(node)) {
                parseError(template, node, errorIndex);
              }
              if (isAttributesParsing && node.type === EXPRESSION && !attrLike[currentNode.type]) {
                node = new Attribute(node);
              }
              addChild(node);
              return FALSE;
            }
          });
        }
      }
    }
  };

  while (mainScanner.hasNext()) {
    content = mainScanner.nextBefore(elementPattern);

    if (content.trim()) {
      parseContent(content);
    }

    if (mainScanner.charAt(0) !== '<') {
      break;
    }

    errorIndex = mainScanner.pos;

    if (mainScanner.charAt(1) === '/') {
      content = mainScanner.nextAfter(elementPattern);
      name = content.slice(2);

      if (mainScanner.charAt(0) !== '>') {
        return parseError(template, 'Illegal tag name', errorIndex);
      } else if (name !== currentNode.name) {
        return parseError(template, 'Unexpected closing tag', errorIndex);
      }

      popStack();

      mainScanner.forward(1);
    } else {
        content = mainScanner.nextAfter(elementPattern);
        name = content.slice(1);
        isComponent = componentName.test(name);
        isSelfClosingTag = isComponent || selfClosingTagName.test(name);

        addChild(new Element(isComponent ? 'div' : name, isComponent ? name : ''));

        content = mainScanner.nextBefore(elementEndPattern);
        if (content) {
          parseContent(content, TRUE);
        }

        content = mainScanner.nextAfter(elementEndPattern);
        if (!content) {
          return parseError(template, 'Illegal tag name', errorIndex);
        }

        if (isSelfClosingTag) {
          popStack();
        }
      }
  }

  if (nodeStack.length) {
    return parseError(template, 'Missing end tag (</' + nodeStack[0].name + '>)', errorIndex);
  }

  templateParse[template] = rootNode;

  return rootNode;
}

function camelCase(str) {
  return str.replace(/-([a-z])/gi, function ($0, $1) {
    return $1.toUpperCase();
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function parse$3(str, separator, pair) {
  var result = [];
  if (string(str)) {
    (function () {
      var terms = void 0,
          key = void 0,
          value = void 0,
          item = void 0;
      each$1(str.split(separator), function (term) {
        terms = term.split(pair);
        key = terms[0];
        value = terms[1];
        if (key) {
          item = {
            key: key.trim()
          };
          if (value) {
            item.value = value.trim();
          }
          result.push(item);
        }
      });
    })();
  }
  return result;
}

var string$1 = Object.freeze({
	camelCase: camelCase,
	capitalize: capitalize,
	parse: parse$3
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
  each$1(tasks, function (task) {
    task();
  });
}

var validateProps = function (data, schema, onNotMatched, onNotFound) {
  var result = {};
  each$$1(schema, function (rule, key) {
    var type = rule.type,
        value = rule.value,
        required = rule.required;

    if (has$1(data, key)) {
      if (type) {
        (function () {
          var target = data[key],
              matched = void 0;

          if (string(type)) {
            matched = is(target, type);
          } else if (array(type)) {
            matched = type.some(function (t) {
              return is(target, t);
            });
          } else if (func(type)) {
            matched = type(target, data);
          }
          if (matched === TRUE) {
            result[key] = target;
          } else {
            onNotMatched(key);
          }
        })();
      }
    } else if (required) {
      onNotFound(key);
    } else if (has$1(rule, 'value')) {
      result[key] = func(value) ? value(data) : value;
    }
  });
  return result;
};

function updateDeps(instance, newDeps, oldDeps, watcher) {

  var addedDeps = void 0,
      removedDeps = void 0;
  if (array(oldDeps)) {
    addedDeps = diff(oldDeps, newDeps);
    removedDeps = diff(newDeps, oldDeps);
  } else {
    addedDeps = newDeps;
  }

  each$1(addedDeps, function (keypath) {
    instance.watch(keypath, watcher);
  });

  if (removedDeps) {
    each$1(removedDeps, function (dep) {
      instance.$watchEmitter.off(dep, watcher);
    });
  }
}

function refresh(instance, immediate) {
  if (immediate) {
    diff$1(instance);
  } else if (!instance.$diffing) {
    instance.$diffing = TRUE;
    add(function () {
      delete instance.$diffing;
      diff$1(instance);
    });
  }
}

function diff$1(instance) {
  var $children = instance.$children,
      $watchCache = instance.$watchCache,
      $watchEmitter = instance.$watchEmitter,
      $computedDeps = instance.$computedDeps;

  var keys$$1 = [];
  var addKey = function addKey(key, push) {
    if (!has$2(keys$$1, key)) {
      if (push) {
        keys$$1.push(key);
      } else {
        keys$$1.unshift(key);
      }
    }
  };

  var pickDeps = function pickDeps(key) {
    if ($computedDeps && !falsy($computedDeps[key])) {
      each$1($computedDeps[key], pickDeps);
      addKey(key, TRUE);
    } else {
      addKey(key);
    }
  };

  each$$1($watchCache, function (value, key) {
    pickDeps(key);
  });

  var changes = {};

  each$1(keys$$1, function (key) {
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
    each$1($children, function (child) {
      diff$1(child);
    });
  }
}

function validate(props, schema) {
  return validateProps(props, schema, function (key) {
    warn(key + ' is not matched.');
  }, function (key) {
    warn(key + ' is not found.');
  });
}

var component$1 = Object.freeze({
	updateDeps: updateDeps,
	refresh: refresh,
	validate: validate
});

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

function init(modules, api) {
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

var snabbdom = { init: init };

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
        each$$1(type, addListener);
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
        each$$1(type, addOnce);
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
        each$$1(listeners, function (list, type) {
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
          each$1(list, function (listener) {
            var result = execute$1(listener, context, data);

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
        each$$1(listeners, function (list, key) {
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
      return array(list) ? has$2(list, listener) : FALSE;
    }
  }]);
  return Emitter;
}();

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

  each$1(types, function (type) {
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
      each$1(node.children, function (item) {
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
            name: 'component',
            node: node,
            directive: instance.directive('component')
          });
        } else {
          each$1(node.attrs, function (node) {
            var name = node.name,
                value = node.getValue();
            if (name === 'style') {
              var list = parse$3(value, ';', ':');
              if (list.length) {
                styles = {};
                each$1(list, function (item) {
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

        each$1(node.directives, function (node) {
          var name = node.name;


          var directiveName = void 0;
          if (name.startsWith(DIRECTIVE_EVENT_PREFIX)) {
            name = name.slice(DIRECTIVE_EVENT_PREFIX.length);
            directiveName = 'event';
          } else if (name.startsWith(DIRECTIVE_PREFIX)) {
            name = name.slice(DIRECTIVE_PREFIX.length);

            if (name !== KEY_REF && name !== KEY_LAZY && name !== KEY_MODEL) {
              directiveName = name;
            }
          } else if (name === KEY_REF) {
            name = directiveName = 'ref';
          } else if (name === KEY_LAZY) {
            name = directiveName = 'lazy';
          } else if (name === KEY_MODEL) {
            name = directiveName = 'model';
          } else if (name === KEY_UNIQUE) {
            data.key = node.getValue();
          }

          if (directiveName) {
            directives.push({
              name: name,
              node: node,
              directive: instance.directive(directiveName)
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
              each$1(directives, function (item) {
                var directive = item.directive;

                if (directive && func(directive[type])) {
                  directive[type]({
                    el: vnode.elm,
                    node: item.node,
                    name: item.name,
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
      return node.content;
    }
  });
}

var magic = function (options) {
  var args = options.args,
      get = options.get,
      set = options.set;

  args = toArray(args);

  var key = args[0],
      value = args[1];
  if (object(key)) {
    execute$1(set, NULL, key);
  } else if (string(key)) {
    var _args = args,
        length = _args.length;

    if (length === 2) {
      execute$1(set, NULL, args);
    } else if (length === 1) {
      return execute$1(get, NULL, key);
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

var refDt = {

  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance;

    var value = node.getValue();
    if (value && string(value)) {
      (function () {
        var $refs = instance.$refs;

        if (object($refs)) {
          if (has$1($refs, value)) {
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
        name = _ref.name,
        node = _ref.node,
        instance = _ref.instance,
        listener = _ref.listener,
        directives = _ref.directives;


    if (!listener) {
      listener = instance.compileValue(node.keypath, node.getValue());
    }

    if (listener) {
      var lazy = directives.lazy;

      if (lazy) {
        var value = lazy.node.getValue();
        if (numeric(value) && value >= 0) {
          listener = debounce(listener, value);
        } else if (name === 'input') {
          name = 'change';
        }
      }

      var $component = el.$component;

      if ($component) {
        if (array($component)) {
          $component.push(function ($component) {
            $component.on(name, listener);
          });
        } else {
          $component.on(name, listener);
        }
      } else {
        on$1(el, name, listener);
        el.$event = function () {
          off$1(el, name, listener);
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
    el.checked = array(value) ? has$2(value, el.value, FALSE) : !!value;
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
    var keypath = node.keypath;


    var result = instance.get(node.getValue(), keypath);
    if (result) {
      keypath = result.keypath;
    } else {
      error$1('The ' + keypath + ' being used for two-way binding is ambiguous.');
    }

    var name = 'change',
        control = void 0,
        needSet = void 0;

    var type = el.type,
        $component = el.$component;

    if ($component) {
      control = componentControl;
    } else {
      control = specialControls[type];
      if (!control) {
        control = inputControl;
        if ('oninput' in el) {
          name = 'input';
        }
      }
      if (!has$1(attrs, 'value')) {
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
      name: name,
      instance: instance,
      directives: directives,
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
    each$1(attrs, function (node) {
      props[camelCase(node.name)] = node.getValue();
    });
    if (!has$1(props, 'value')) {
      var model = directives.model;

      if (model) {
        node = model.node;
        var result = instance.get(node.getValue(), node.keypath);
        if (result) {
          props.value = result.value;
        }
      }
    }
    var propTypes = options.propTypes;

    if (object(propTypes)) {
      props = validate(props, propTypes);
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
        each$1($component, function (callback) {
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

    execute$1(options[BEFORE_CREATE], instance, options);

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

      each$$1(computed, function (item, keypath) {
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
                if (cache && has$1($watchCache, keypath)) {
                  return $watchCache[keypath];
                }
              } else {
                delete getter.$dirty;
              }

              if (!deps) {
                instance.$computedStack.push([]);
              }
              var result = execute$1(get$$1, instance);

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
        each$1(added, function (keypath) {
          if (keypath.indexOf('*') < 0 && !has$1($watchCache, keypath)) {
            $watchCache[keypath] = instance.get(keypath);
          }
        });
      },
      onRemove: function onRemove(removed) {
        each$1(removed, function (keypath) {
          if (has$1($watchCache, keypath)) {
            delete $watchCache[keypath];
          }
        });
      }
    });
    instance.watch(watchers);

    execute$1(options[AFTER_CREATE], instance);

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
      execute$1(options[BEFORE_MOUNT], instance);
      instance.$template = instance.compileTemplate(template);
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
        var keys$$1 = parse$1(context);
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


      each$$1(model, function (newValue, key) {
        var keypath = normalize(key);
        if (keypath !== key) {
          delete model[key];
          model[keypath] = newValue;
        }
      });

      each$$1(model, function (value, keypath) {
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

      refresh(instance, immediate);
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
        execute$1($options[BEFORE_UPDATE], instance);
      }

      var context = {};

      extend(context, filter$1.data, $data, $filters.data, $computedGetters);

      each$$1(context, function (value, key) {
        if (func(value) && !value.$binded) {
          context[key] = value.bind(instance);
        }
      });

      var _view$render = render$1($template, context),
          root = _view$render.root,
          deps = _view$render.deps;

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
      execute$1($options[afterHook], instance);
    }
  }, {
    key: 'create',
    value: function create(options, extra) {
      options = extend({}, options, extra);
      options.parent = this;
      var child = new Yox(options);
      var children = this.$children || (this.$children = []);
      children.push(child);
      return child;
    }
  }, {
    key: 'compileTemplate',
    value: function compileTemplate(template) {
      var instance = this;
      if (string(template)) {
        return _parse(template, function (id) {
          var partial$$1 = instance.partial(id);
          return string(partial$$1) ? instance.compileTemplate(partial$$1) : partial$$1;
        }, function (id, node) {
          instance.partial(id, node);
        });
      }
      return template;
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
          var ast = parse$2(value);
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
                execute$1(instance[ast.callee.name], instance, args);
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
    value: function component$1(id, value) {

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
              var _options = options,
                  $pending = _options.$pending;

              if (!$pending) {
                $pending = options.$pending = [callback];
                options(function (replacement) {
                  delete options.$pending;
                  if (fromGlobal) {
                    Yox.component(id, replacement);
                  } else {
                    store.set(id, replacement);
                  }
                  each$1($pending, function (callback) {
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


      execute$1($options[BEFORE_DESTROY], instance);

      if ($children) {
        each$1($children, function (child) {
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

      each$$1(instance, function (value, key) {
        delete instance[key];
      });

      execute$1($options[AFTER_DESTROY], instance);
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

Yox.version = '0.19.2';

Yox.switcher = switcher;

Yox.syntax = syntax;

Yox.utils = { is: is$1, array: array$1, object: object$1, string: string$1, logger: logger, native: native, expression: expression, Store: Store, Emitter: Emitter, Event: Event };

each$1(['component', 'directive', 'filter', 'partial'], function (type) {
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

Yox.validate = validate;

Yox.use = function (plugin) {
  plugin.install(Yox);
};

Yox.directive({
  ref: refDt,
  event: event,
  model: modelDt,
  component: componentDt
});

return Yox;

})));
