(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Yox = factory());
}(this, (function () { 'use strict';

var TRUE = true;
var FALSE = false;
var NULL = null;
var UNDEFINED = undefined;



var doc = document;

var templateParse = {};

var expressionParse = {};
var expressionCompile = {};

var keypathNormalize = {};
var keypathWildcardMatches = {};

var cache = Object.freeze({
	templateParse: templateParse,
	expressionParse: expressionParse,
	expressionCompile: expressionCompile,
	keypathNormalize: keypathNormalize,
	keypathWildcardMatches: keypathWildcardMatches
});

var debug = FALSE;

var sync$1 = TRUE;

var switcher = Object.freeze({
	debug: debug,
	sync: sync$1
});

var hasConsole = typeof console !== 'undefined';

var warn = function warn(msg) {
  if (debug && hasConsole) {
    console.warn(msg);
  }
};

var error$1 = function error$1(msg) {
  if (hasConsole) {
    console.error(msg);
  }
};

var IF = '#if';
var ELSE = 'else';
var ELSE_IF = 'else if';
var EACH = '#each';
var PARTIAL = '#partial';
var IMPORT = '>';
var COMMENT = '!';

var DIRECTIVE_PREFIX = '@';
var DIRECTIVE_EVENT_PREFIX = 'on-';

var SPECIAL_EVENT = '$event';
var SPECIAL_KEYPATH = '$keypath';

var syntax = Object.freeze({
	IF: IF,
	ELSE: ELSE,
	ELSE_IF: ELSE_IF,
	EACH: EACH,
	PARTIAL: PARTIAL,
	IMPORT: IMPORT,
	COMMENT: COMMENT,
	DIRECTIVE_PREFIX: DIRECTIVE_PREFIX,
	DIRECTIVE_EVENT_PREFIX: DIRECTIVE_EVENT_PREFIX,
	SPECIAL_EVENT: SPECIAL_EVENT,
	SPECIAL_KEYPATH: SPECIAL_KEYPATH
});

var componentName = /[-A-Z]/;

var tag = /<[^>]+>/;

var selfClosingTagName = /input|img|br/i;

var toString = Object.prototype.toString;

function is(arg, type) {
  return toString.call(arg).toLowerCase() === '[object ' + type + ']';
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

function numeric(arg) {
  return !isNaN(parseFloat(arg)) && isFinite(arg);
}

var is$1 = Object.freeze({
	func: func,
	array: array,
	object: object,
	string: string,
	number: number,
	boolean: boolean,
	numeric: numeric
});

var toString$1 = function (str, defaultValue) {
  if (string(str)) {
    return str;
  }
  if (numeric(str)) {
    return '' + str;
  }
  return arguments.length === 2 ? defaultValue : '';
};

var slice = Array.prototype.slice;


function each$1(array$$1, callback) {
  for (var i = 0, len = array$$1.length; i < len; i++) {
    if (callback(array$$1[i], i) === FALSE) {
      break;
    }
  }
}

function reduce(array$$1, callback, initialValue) {
  return array$$1.reduce(callback, initialValue);
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
  try {
    'length' in array$$1;
  } catch (e) {
    return [];
  }
  return array(array$$1) ? array$$1 : slice.call(array$$1);
}

function toObject(array$$1, key) {
  var result = {};
  each$1(array$$1, function (item) {
    result[item[key]] = item;
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

function hasItem(array$$1, item, strict) {
  return indexOf(array$$1, item, strict) >= 0;
}

function lastItem(array$$1) {
  return array$$1[array$$1.length - 1];
}

function removeItem(array$$1, item, strict) {
  var index = indexOf(array$$1, item, strict);
  if (index >= 0) {
    array$$1.splice(index, 1);
  }
}

var array$1 = Object.freeze({
	each: each$1,
	reduce: reduce,
	merge: merge,
	toArray: toArray,
	toObject: toObject,
	indexOf: indexOf,
	hasItem: hasItem,
	lastItem: lastItem,
	removeItem: removeItem
});

function keys(object$$1) {
  return Object.keys(object$$1);
}

function each$$1(object$$1, callback) {
  each$1(keys(object$$1), function (key) {
    return callback(object$$1[key], key);
  });
}

function count(object$$1) {
  return keys(object$$1).length;
}

function has$1(object$$1, name) {
  return object$$1.hasOwnProperty(name);
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
  keypath = toString$1(keypath);

  if (has$1(object$$1, keypath)) {
    return {
      value: object$$1[keypath]
    };
  }

  if (keypath.indexOf('.') > 0) {
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

function set$1(object$$1, keypath, value) {
  var autoFill = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : TRUE;

  keypath = toString$1(keypath);
  if (keypath.indexOf('.') > 0) {
    var originalObject = object$$1;
    var list = keypath.split('.');
    var prop = list.pop();
    each$1(list, function (item, index) {
      if (object$$1[item]) {
        object$$1 = object$$1[item];
      } else if (autoFill) {
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
	count: count,
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





var asyncGenerator = function () {
  function AwaitValue(value) {
    this.value = value;
  }

  function AsyncGenerator(gen) {
    var front, back;

    function send(key, arg) {
      return new Promise(function (resolve, reject) {
        var request = {
          key: key,
          arg: arg,
          resolve: resolve,
          reject: reject,
          next: null
        };

        if (back) {
          back = back.next = request;
        } else {
          front = back = request;
          resume(key, arg);
        }
      });
    }

    function resume(key, arg) {
      try {
        var result = gen[key](arg);
        var value = result.value;

        if (value instanceof AwaitValue) {
          Promise.resolve(value.value).then(function (arg) {
            resume("next", arg);
          }, function (arg) {
            resume("throw", arg);
          });
        } else {
          settle(result.done ? "return" : "normal", result.value);
        }
      } catch (err) {
        settle("throw", err);
      }
    }

    function settle(type, value) {
      switch (type) {
        case "return":
          front.resolve({
            value: value,
            done: true
          });
          break;

        case "throw":
          front.reject(value);
          break;

        default:
          front.resolve({
            value: value,
            done: false
          });
          break;
      }

      front = front.next;

      if (front) {
        resume(front.key, front.arg);
      } else {
        back = null;
      }
    }

    this._invoke = send;

    if (typeof gen.return !== "function") {
      this.return = undefined;
    }
  }

  if (typeof Symbol === "function" && Symbol.asyncIterator) {
    AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
      return this;
    };
  }

  AsyncGenerator.prototype.next = function (arg) {
    return this._invoke("next", arg);
  };

  AsyncGenerator.prototype.throw = function (arg) {
    return this._invoke("throw", arg);
  };

  AsyncGenerator.prototype.return = function (arg) {
    return this._invoke("return", arg);
  };

  return {
    wrap: function (fn) {
      return function () {
        return new AsyncGenerator(fn.apply(this, arguments));
      };
    },
    await: function (value) {
      return new AwaitValue(value);
    }
  };
}();





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
        each$$1(key, function (value, name) {
          data[name] = value;
        });
      } else {
        data[key] = value;
      }
    }
  }]);
  return Store;
}();

var component = new Store();
var directive = new Store();
var filter = new Store();
var partial = new Store();

var registry = Object.freeze({
	component: component,
	directive: directive,
	filter: filter,
	partial: partial
});

var INIT = 'init';

var CREATE = 'create';

var COMPILE = 'compile';

var ATTACH = 'attach';

var UPDATE = 'update';

var DETACH = 'detach';

var lifecycle = Object.freeze({
	INIT: INIT,
	CREATE: CREATE,
	COMPILE: COMPILE,
	ATTACH: ATTACH,
	UPDATE: UPDATE,
	DETACH: DETACH
});

var LITERAL = 1;
var ARRAY = 2;
var IDENTIFIER = 3;
var THIS = 4;
var MEMBER = 5;
var UNARY = 6;
var BINARY = 7;
var CONDITIONAL = 8;
var CALL = 9;

var THIS_ARG = '$_$';

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
function sortKeys(obj) {
  return keys(obj).sort(function (a, b) {
    return b.length - a.length;
  });
}

var unaryOperatorMap = {
  '+': TRUE,
  '-': TRUE,
  '!': TRUE,
  '~': TRUE
};

var sortedUnaryOperatorList = sortKeys(unaryOperatorMap);

var binaryOperatorMap = {
  '||': 1,
  '&&': 2,
  '|': 3,
  '^': 4,
  '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  '<<': 8,
  '>>': 8,
  '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10
};

var sortedBinaryOperatorList = sortKeys(binaryOperatorMap);

var keywords = {
  'true': TRUE,
  'false': FALSE,
  'null': NULL,
  'undefined': UNDEFINED
};

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

function throwError(expression) {
  error$1('Failed to parse expression: [' + expression + '].');
}

function createConditional(test, consequent, alternate) {
  return {
    type: CONDITIONAL,
    test: test,
    consequent: consequent,
    alternate: alternate
  };
}

function createBinary(right, operator, left) {
  return {
    type: BINARY,
    operator: operator,
    left: left,
    right: right
  };
}

function createUnary(operator, argument) {
  return {
    type: UNARY,
    operator: operator,
    argument: argument
  };
}

function createLiteral(value) {
  return {
    type: LITERAL,
    value: value
  };
}

function createIdentifier(name) {
  return {
    type: IDENTIFIER,
    name: name
  };
}

function createThis() {
  return {
    type: THIS
  };
}

function createMember(object$$1, property) {
  return {
    type: MEMBER,
    object: object$$1,
    property: property
  };
}

function createArray(elements) {
  return {
    type: ARRAY,
    elements: elements
  };
}

function createCall(callee, args) {
  return {
    type: CALL,
    'arguments': args,
    callee: callee
  };
}

function parse$1(content) {
  var length = content.length;

  var index = 0;
  var charCode = void 0;
  var value = void 0;

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
      return throwError(content);
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

    return createLiteral(parseFloat(content.substring(start, index)));
  }

  function parseString() {

    var start = index;

    skipString();

    return createLiteral(content.substring(start + 1, index - 1));
  }

  function parseIdentifier() {

    var start = index;
    skipIdentifier();

    value = content.substring(start, index);
    if (keywords[value]) {
      return createLiteral(keywords[value]);
    } else if (value === 'this') {
      return createThis();
    }

    return value ? createIdentifier(value) : throwError(content);
  }

  function parseTuple(delimiter) {

    var args = [],
        closed = void 0;

    while (index < length) {
      charCode = getCharCode();
      if (charCode === delimiter) {
        index++;
        closed = TRUE;
      } else if (charCode === COMMA) {
        index++;
      } else {
        args.push(parseExpression());
      }
    }

    return closed ? args : throwError(content);
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
        value = createCall(value, parseTuple(CPAREN));
        break;
      } else {
        if (charCode === PERIOD) {
          index++;
          value = createMember(value, createLiteral(parseIdentifier().name));
        } else if (charCode === OBRACK) {
            index++;
            value = createMember(value, parseSubexpression(CBRACK));
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
          return createArray(parseTuple(CBRACK));
        } else if (charCode === OPAREN) {
            index++;
            return parseSubexpression(CPAREN);
          } else if (isIdentifierStart(charCode)) {
            return parseVariable();
          }
    value = parseOperator(sortedUnaryOperatorList);
    return value ? parseUnary(value) : throwError(content);
  }

  function parseUnary(operator) {
    value = parseToken();
    if (!value) {
      return throwError(content);
    }
    return createUnary(operator, value);
  }

  function parseBinary() {

    var left = parseToken();
    var operator = parseOperator(sortedBinaryOperatorList);
    if (!operator) {
      return left;
    }

    var right = parseToken();
    var stack = [left, operator, binaryOperatorMap[operator], right];

    while (operator = parseOperator(sortedBinaryOperatorList)) {
      if (stack.length > 3 && binaryOperatorMap[operator] < stack[stack.length - 2]) {
        stack.push(createBinary(stack.pop(), (stack.pop(), stack.pop()), stack.pop()));
      }

      right = parseToken();
      if (!right) {
        return throwError(content);
      }
      stack.push(operator, binaryOperatorMap[operator], right);
    }

    right = stack.pop();
    while (stack.length > 1) {
      right = createBinary(right, (stack.pop(), stack.pop()), stack.pop());
    }

    return right;
  }

  function parseSubexpression(delimiter) {
    value = parseExpression();
    if (getCharCode() === delimiter) {
      index++;
      return value;
    } else {
      return throwError(content);
    }
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
        return createConditional(test, consequent, alternate);
      } else {
        return throwError(content);
      }
    }

    return test;
  }

  var expressionParse$$1 = expressionParse;

  if (!expressionParse$$1[content]) {
    var node = parseExpression();
    node.$raw = content;
    expressionParse$$1[content] = node;
  }

  return expressionParse$$1[content];
}

function compile(ast) {

  var content = void 0;

  if (string(ast)) {
    content = ast;
    ast = parse$1(content);
  } else if (ast) {
    content = ast.$raw;
  }

  var expressionCompile$$1 = expressionCompile;


  if (!expressionCompile$$1[content]) {
    (function () {
      var args = [];
      var hasThis = void 0;

      traverse(ast, {
        enter: function enter(node) {
          if (node.type === IDENTIFIER) {
            args.push(node.name);
          } else if (node.type === THIS) {
            hasThis = TRUE;
            args.push(THIS_ARG);
          }
        }
      });

      if (hasThis) {
        content = content.replace(/\bthis\b/, THIS_ARG);
      }

      var fn = new Function(args.join(', '), 'return ' + content);
      fn.$arguments = args;
      expressionCompile$$1[content] = fn;
    })();
  }

  return expressionCompile$$1[content];
}

function traverse(ast) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (func(options.enter) && options.enter(ast) === FALSE) {
    return;
  }

  switch (ast.type) {

    case CONDITIONAL:
      traverse(ast.test, options);
      traverse(ast.consequent, options);
      traverse(ast.alternate, options);
      break;

    case BINARY:
      traverse(ast.left, options);
      traverse(ast.right, options);
      break;

    case UNARY:
      traverse(ast.argument, options);
      break;

    case MEMBER:
      traverse(ast.object, options);
      traverse(ast.property, options);
      break;

    case CALL:
      traverse(ast.callee, options);
      each$1(ast.arguments, function (arg) {
        traverse(arg, options);
      });
      break;

    case ARRAY:
      each$1(ast.elements, function (element) {
        traverse(element, options);
      });
      break;

  }

  if (func(options.leave)) {
    options.leave(ast);
  }
}

var Context = function () {
  function Context(data, parent) {
    classCallCheck(this, Context);

    var instance = this;
    instance.data = data;
    instance.parent = parent;
    instance.cache = {};
    instance.cache[THIS_ARG] = data;
  }

  createClass(Context, [{
    key: 'push',
    value: function push(data) {
      return new Context(data, this);
    }
  }, {
    key: 'set',
    value: function set(keypath, value) {
      var data = this.data,
          cache = this.cache;

      if (has$1(cache, keypath)) {
        delete cache[keypath];
      }
      if (keypath.indexOf('.') > 0) {
        var terms = keypath.split('.');
        var prop = terms.pop();
        var result = get$1(data, terms.join('.'));
        if (result) {
          result.value[prop] = value;
        }
      } else {
        data[keypath] = value;
      }
    }
  }, {
    key: 'get',
    value: function get(keypath) {

      var instance = this;
      var _instance = instance,
          cache = _instance.cache;

      if (!has$1(cache, keypath)) {
        var result = void 0;
        while (instance) {
          result = get$1(instance.data, keypath);
          if (result) {
            cache[keypath] = result.value;
            break;
          } else {
            instance = instance.parent;
          }
        }
      }

      return cache[keypath];
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

var IF$1 = 1;

var ELSE_IF$1 = 2;

var ELSE$1 = 3;

var EACH$1 = 4;

var PARTIAL$1 = 5;

var IMPORT$1 = 6;

var EXPRESSION = 7;

var DIRECTIVE = 8;

var ELEMENT = 9;

var ATTRIBUTE = 10;

var TEXT = 11;

var Node = function () {
  function Node(hasChildren) {
    classCallCheck(this, Node);

    if (hasChildren !== FALSE) {
      this.children = [];
    }
  }

  createClass(Node, [{
    key: 'addChild',
    value: function addChild(node) {
      var children = this.children;

      if (node.type === TEXT) {
        var lastChild = lastItem(children);
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
    value: function execute(context) {
      var fn = compile(this.expr);

      return fn.apply(NULL, fn.$arguments.map(function (name) {
        return context.get(name);
      }));
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

    var _this = possibleConstructorReturn(this, (Attribute.__proto__ || Object.getPrototypeOf(Attribute)).call(this));

    _this.type = ATTRIBUTE;
    _this.name = name;
    return _this;
  }

  createClass(Attribute, [{
    key: 'render',
    value: function render(data) {
      var name = this.name;

      if (name.type === EXPRESSION) {
        name = name.execute(data.context);
      }

      var node = new Attribute(name);
      node.keypath = data.keys.join('.');
      data.parent.addAttr(node);

      this.renderChildren(extend({}, data, { parent: node }));
    }
  }]);
  return Attribute;
}(Node);

var Directive = function (_Node) {
  inherits(Directive, _Node);

  function Directive(name) {
    classCallCheck(this, Directive);

    var _this = possibleConstructorReturn(this, (Directive.__proto__ || Object.getPrototypeOf(Directive)).call(this));

    _this.type = DIRECTIVE;
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
}(Node);

var Each = function (_Node) {
  inherits(Each, _Node);

  function Each(name, index) {
    classCallCheck(this, Each);

    var _this = possibleConstructorReturn(this, (Each.__proto__ || Object.getPrototypeOf(Each)).call(this));

    _this.type = EACH$1;
    _this.name = name;
    _this.index = index;
    return _this;
  }

  createClass(Each, [{
    key: 'render',
    value: function render(data) {

      var instance = this;
      var name = instance.name,
          index = instance.index;
      var context = data.context,
          keys$$1 = data.keys;


      var iterator = context.get(name);

      var each$$1 = void 0;
      if (array(iterator)) {
        each$$1 = each$1;
      } else if (object(iterator)) {
        each$$1 = each$$1;
      }

      if (each$$1) {
        keys$$1.push(name);
        each$$1(iterator, function (item, i) {
          if (index) {
            context.set(index, i);
          }
          keys$$1.push(i);
          context.set(SPECIAL_KEYPATH, keys$$1.join('.'));
          instance.renderChildren(extend({}, data, { context: context.push(item) }));
          keys$$1.pop();
        });
        keys$$1.pop();
      }
    }
  }]);
  return Each;
}(Node);

var Element = function (_Node) {
  inherits(Element, _Node);

  function Element(name, custom) {
    classCallCheck(this, Element);

    var _this = possibleConstructorReturn(this, (Element.__proto__ || Object.getPrototypeOf(Element)).call(this));

    _this.type = ELEMENT;
    _this.name = name;
    _this.custom = custom;
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
    key: 'getAttributes',
    value: function getAttributes() {
      var result = {};
      each$1(this.attrs, function (node) {
        result[node.name] = node.getValue();
      });
      return result;
    }
  }, {
    key: 'render',
    value: function render(data) {

      var instance = this;
      var node = new Element(instance.name, instance.custom);
      node.keypath = data.keys.join('.');
      data.parent.addChild(node);

      data = extend({}, data, { parent: node });
      instance.renderChildren(data, instance.attrs);
      instance.renderChildren(data, instance.directives);
      instance.renderChildren(data);
    }
  }]);
  return Element;
}(Node);

var Else = function (_Node) {
  inherits(Else, _Node);

  function Else() {
    classCallCheck(this, Else);

    var _this = possibleConstructorReturn(this, (Else.__proto__ || Object.getPrototypeOf(Else)).call(this));

    _this.type = ELSE$1;
    return _this;
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
}(Node);

var ElseIf = function (_Node) {
  inherits(ElseIf, _Node);

  function ElseIf(expr) {
    classCallCheck(this, ElseIf);

    var _this = possibleConstructorReturn(this, (ElseIf.__proto__ || Object.getPrototypeOf(ElseIf)).call(this));

    _this.type = ELSE_IF$1;
    _this.expr = expr;
    return _this;
  }

  createClass(ElseIf, [{
    key: 'render',
    value: function render(data, prev) {
      if (prev) {
        if (this.execute(data.context)) {
          this.renderChildren(data);
        } else {
          return prev;
        }
      }
    }
  }]);
  return ElseIf;
}(Node);

var Text = function (_Node) {
  inherits(Text, _Node);

  function Text(content) {
    classCallCheck(this, Text);

    var _this = possibleConstructorReturn(this, (Text.__proto__ || Object.getPrototypeOf(Text)).call(this, FALSE));

    _this.type = TEXT;
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
}(Node);

var Expression = function (_Node) {
  inherits(Expression, _Node);

  function Expression(expr, safe) {
    classCallCheck(this, Expression);

    var _this = possibleConstructorReturn(this, (Expression.__proto__ || Object.getPrototypeOf(Expression)).call(this, FALSE));

    _this.type = EXPRESSION;
    _this.expr = expr;
    _this.safe = safe;
    return _this;
  }

  createClass(Expression, [{
    key: 'render',
    value: function render(data) {

      var content = this.execute(data.context);
      if (content == NULL) {
        content = '';
      }

      if (func(content) && content.computed) {
        content = content();
      }

      if (!this.safe && string(content) && tag.test(content)) {
        each$1(data.parse(content), function (node) {
          node.render(data);
        });
      } else {
        var node = new Text(content);
        node.render(data);
      }
    }
  }]);
  return Expression;
}(Node);

var If = function (_Node) {
  inherits(If, _Node);

  function If(expr) {
    classCallCheck(this, If);

    var _this = possibleConstructorReturn(this, (If.__proto__ || Object.getPrototypeOf(If)).call(this));

    _this.type = IF$1;
    _this.expr = expr;
    return _this;
  }

  createClass(If, [{
    key: 'render',
    value: function render(data) {
      if (this.execute(data.context)) {
        this.renderChildren(data);
      } else {
        return TRUE;
      }
    }
  }]);
  return If;
}(Node);

var Import = function (_Node) {
  inherits(Import, _Node);

  function Import(name) {
    classCallCheck(this, Import);

    var _this = possibleConstructorReturn(this, (Import.__proto__ || Object.getPrototypeOf(Import)).call(this, FALSE));

    _this.type = IMPORT$1;
    _this.name = name;
    return _this;
  }

  return Import;
}(Node);

var Partial = function (_Node) {
  inherits(Partial, _Node);

  function Partial(name) {
    classCallCheck(this, Partial);

    var _this = possibleConstructorReturn(this, (Partial.__proto__ || Object.getPrototypeOf(Partial)).call(this));

    _this.type = PARTIAL$1;
    _this.name = name;
    return _this;
  }

  return Partial;
}(Node);

var getLocationByIndex = function (str, index) {

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
};

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

var openingDelimiterPattern = /\{\{\s*/;
var closingDelimiterPattern = /\s*\}\}/;

var elementPattern = /<(?:\/)?[a-z]\w*/i;
var elementEndPattern = /(?:\/)?>/;

var attributePattern = /([-:@a-z0-9]+)(=["'])?/i;
var attributeValueStartPattern = /^=["']/;

var parsers = [{
  test: function test(source) {
    return source.startsWith(EACH);
  },
  create: function create(source) {
    var terms = source.slice(EACH.length).trim().split(':');
    var name = terms[0].trim();
    var index = void 0;
    if (terms[1]) {
      index = terms[1].trim();
    }
    return new Each(name, index);
  }
}, {
  test: function test(source) {
    return source.startsWith(IMPORT);
  },
  create: function create(source) {
    var name = source.slice(IMPORT.length).trim();
    return name ? new Import(name) : 'Expected legal partial name';
  }
}, {
  test: function test(source) {
    return source.startsWith(PARTIAL);
  },
  create: function create(source) {
    var name = source.slice(PARTIAL.length).trim();
    return name ? new Partial(name) : 'Expected legal partial name';
  }
}, {
  test: function test(source) {
    return source.startsWith(IF);
  },
  create: function create(source) {
    var expr = source.slice(IF.length).trim();
    return expr ? new If(parse$1(expr)) : 'Expected expression';
  }
}, {
  test: function test(source) {
    return source.startsWith(ELSE_IF);
  },
  create: function create(source, popStack) {
    var expr = source.slice(ELSE_IF.length);
    if (expr) {
      popStack();
      return new ElseIf(parse$1(expr));
    }
    return 'Expected expression';
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
    return !source.startsWith(COMMENT);
  },
  create: function create(source) {
    var safe = TRUE;
    if (source.startsWith('{')) {
      safe = FALSE;
      source = source.slice(1);
    }
    return new Expression(parse$1(source), safe);
  }
}];

var rootName = 'root';

function render$1(ast, data) {

  var rootElement = new Element(rootName);
  var rootContext = new Context(data);
  var keys = [];

  var renderAst = function renderAst(node) {
    node.render({
      keys: keys,
      parent: rootElement,
      context: rootContext,
      parse: function parse(template) {
        return _parse(template).children;
      }
    });
  };

  if (ast.name === rootName) {
    each$1(ast.children, renderAst);
  } else {
    renderAst(ast);
  }

  var children = rootElement.children;

  if (children.length !== 1 || children[0].type !== ELEMENT) {
    warn('Template should have only one root element.');
  }

  return children[0];
}

function _parse(template, getPartial, setPartial) {
  var templateParse$$1 = templateParse;


  if (templateParse$$1[template]) {
    return templateParse$$1[template];
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
  attrLike[ATTRIBUTE] = TRUE;
  attrLike[DIRECTIVE] = TRUE;

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

              addChild(name.startsWith(DIRECTIVE_PREFIX) || name.startsWith(DIRECTIVE_EVENT_PREFIX) ? new Directive(name) : new Attribute(name));

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

        if (isComponent || isSelfClosingTag) {
          popStack();
        }
      }
  }

  if (nodeStack.length) {
    return parseError(template, 'Missing end tag (</' + nodeStack[0].name + '>)', errorIndex);
  }

  templateParse$$1[template] = rootNode;

  return rootNode;
}

function normalize(keypath) {
  var keypathNormalize$$1 = keypathNormalize;


  if (!keypathNormalize$$1[keypath]) {
    keypathNormalize$$1[keypath] = keypath.indexOf('[') < 0 ? keypath : stringify(parse$1(keypath));
  }

  return keypathNormalize$$1[keypath];
}

function stringify(node) {
  var result = [];
  do {
    var _node = node,
        name = _node.name,
        property = _node.property;

    if (property) {
      result.push(property.value);
    } else if (name) {
      result.push(name);
    }
  } while (node = node.object);
  return result.length > 0 ? result.reverse().join('.') : '';
}

function getWildcardMatches(keypath) {
  var keypathWildcardMatches$$1 = keypathWildcardMatches;


  if (!keypathWildcardMatches$$1[keypath]) {
    (function () {
      var result = [];
      var terms = normalize(keypath).split('.');
      var toWildcard = function toWildcard(isTrue, index) {
        return isTrue ? '*' : terms[index];
      };
      each$1(getBoolCombinations(terms.length), function (items) {
        result.push(items.map(toWildcard).join('.'));
      });
      keypathWildcardMatches$$1[keypath] = result;
    })();
  }

  return keypathWildcardMatches$$1[keypath];
}

function getWildcardNames(keypath, wildcardKeypath) {

  var result = [];
  if (wildcardKeypath.indexOf('*') < 0) {
    return result;
  }

  var list = keypath.split('.');
  each$1(wildcardKeypath.split('.'), function (name, index) {
    if (name === '*') {
      result.push(list[index]);
    }
  });

  return result;
}

function getBoolCombinations(num) {
  var result = [];
  var toBool = function toBool(value) {
    return value == 1;
  };
  var length = parseInt(new Array(num + 1).join('1'), 2);
  for (var i = 0, binary, j, item; i <= length; i++) {
    binary = i.toString(2);
    if (binary.length < num) {
      binary = '0' + binary;
    }

    item = [];
    for (j = 0; j < num; j++) {
      item.push(toBool(binary[j]));
    }
    result.push(item);
  }
  return result;
}

var nextTick = void 0;

if (typeof MutationObserver === 'function') {
  nextTick = function nextTick(fn) {
    var observer = new MutationObserver(fn);
    var textNode = doc.createTextNode('');
    observer.observe(textNode, {
      characterData: TRUE
    });
    textNode.data = ' ';
  };
} else if (typeof setImmediate === 'function') {
  nextTick = function nextTick(fn) {
    setImmediate(fn);
  };
} else {
  nextTick = function nextTick(fn) {
    setTimeout(fn);
  };
}

var nextTick$1 = nextTick;

var nextTasks = [];

function add(task) {
  if (!nextTasks.length) {
    nextTick$1(run);
  }
  nextTasks.push(task);
}

function run() {
  each$1(nextTasks, function (task) {
    task();
  });
  nextTasks.length = 0;
}

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

function compileAttr$1(instance, keypath, value) {
  if (value.indexOf('(') > 0) {
    var _ret = function () {
      var ast = parse$1(value);
      if (ast.type === CALL) {
        return {
          v: function v(e) {
            var isEvent = e instanceof Event;
            var args = copy(ast.arguments);
            if (!args.length) {
              if (isEvent) {
                args.push(e);
              }
            } else {
              args = args.map(function (item) {
                var name = item.name,
                    type = item.type;

                if (type === LITERAL) {
                  return item.value;
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
                  name = stringify(item);
                }

                var result = testKeypath(instance, keypath, name);
                if (result) {
                  return result.value;
                }
              });
            }
            instance[ast.callee.name].apply(instance, args);
          }
        };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } else {
    return function () {
      instance.fire(value, arguments);
    };
  }
}

function testKeypath(instance, keypath, name) {

  var terms = keypath ? keypath.split('.') : [];
  if (!name) {
    name = terms.pop();
  }

  var data = instance.$data,
      result = void 0;

  do {
    terms.push(name);
    keypath = terms.join('.');
    result = get$1(data, keypath);
    if (result) {
      return {
        keypath: keypath,
        value: result.value
      };
    }
    terms.splice(-2);
  } while (terms.length || keypath.indexOf('.') > 0);
}

function get$3(instance, type, name, silent) {
  var prop = '$' + type + 's';
  if (instance[prop] && has$1(instance[prop], name)) {
    return instance[prop][name];
  } else {
    var value = registry[type].get(name);
    if (value) {
      return value;
    } else if (!silent) {
      error$1(name + ' ' + type + ' is not found.');
    }
  }
}

function set$3(instance, type, name, value) {
  var prop = '$' + type + 's';
  if (!instance[prop]) {
    instance[prop] = {};
  }
  instance[prop][name] = value;
}

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

var Emitter = function () {
  function Emitter() {
    classCallCheck(this, Emitter);

    this.listeners = {};
  }

  createClass(Emitter, [{
    key: 'on',
    value: function on(type, listener) {
      var listeners = this.listeners;

      var list = listeners[type] || (listeners[type] = []);
      list.push(listener);
    }
  }, {
    key: 'once',
    value: function once(type, listener) {
      var instance = this;
      listener.$once = function () {
        instance.off(type, listener);
        delete listener.$once;
      };
      instance.on(type, listener);
    }
  }, {
    key: 'off',
    value: function off(type, listener) {
      var listeners = this.listeners;

      if (type == NULL) {
        each$$1(listeners, function (list, type) {
          if (array(listeners[type])) {
            listeners[type].length = 0;
          }
        });
      } else {
        var list = listeners[type];
        if (array(list)) {
          if (listener == NULL) {
            list.length = 0;
          } else {
            removeItem(list, listener);
          }
        }
      }
    }
  }, {
    key: 'fire',
    value: function fire(type, data, context) {

      if (arguments.length === 2) {
        context = NULL;
      }

      var list = this.listeners[type],
          isStoped = void 0;

      if (array(list)) {
        each$1(list, function (listener) {
          var result = void 0;
          if (array(data)) {
            result = listener.apply(context, data);
          } else {
            result = data != NULL ? listener.call(context, data) : listener.call(context);
          }
          var $once = listener.$once;

          if (func($once)) {
            $once();
          }

          var event = data && data[0];
          if (event && event instanceof Event) {
            if (result === FALSE) {
              event.prevent();
              event.stop();
            } else if (event.isStoped) {
              result = FALSE;
            }
          }

          if (result === FALSE) {
            isStoped = TRUE;
            return result;
          }
        });
      }

      return isStoped;
    }
  }, {
    key: 'has',
    value: function has(type, listener) {
      var list = this.listeners[type];
      if (listener == NULL) {
        return array(list) && list.length > 0;
      }
      return array(list) ? hasItem(list, listener) : FALSE;
    }
  }]);
  return Emitter;
}();

var camelCase = function (name) {
  return name.replace(/-([a-z])/gi, function ($0, $1) {
    return $1.toUpperCase();
  });
};

function nativeAddEventListener(element, type, listener) {
  element.addEventListener(type, listener, FALSE);
}

function nativeRemoveEventListener(element, type, listener) {
  element.removeEventListener(type, listener, FALSE);
}

function createEvent(nativeEvent) {
  return nativeEvent;
}

function find(selector, context) {
  if (!context) {
    context = doc;
  }
  return context.querySelector(selector);
}

function on$1(element, type, listener) {
  var $emitter = element.$emitter || (element.$emitter = new Emitter());
  if (!$emitter.has(type)) {
    var nativeListener = function nativeListener(e) {
      e = new Event(createEvent(e, element));
      $emitter.fire(e.type, e);
    };
    $emitter[type] = nativeListener;
    nativeAddEventListener(element, type, nativeListener);
  }
  $emitter.on(type, listener);
}

function off$1(element, type, listener) {
  var $emitter = element.$emitter;

  var types = keys($emitter.listeners);

  $emitter.off(type, listener);

  each$1(types, function (type) {
    if ($emitter[type] && !$emitter.has(type)) {
      nativeRemoveEventListener(element, type, $emitter[type]);
      delete $emitter[type];
    }
  });
}

function parseStyle(str) {
  var result = {};

  if (string(str)) {
    (function () {
      var pairs = void 0,
          name = void 0,
          value = void 0;

      each$1(str.split(';'), function (term) {
        if (term && term.trim()) {
          pairs = term.split(':');
          if (pairs.length === 2) {
            name = pairs[0].trim();
            value = pairs[1].trim();
            if (name) {
              result[camelCase(name)] = value;
            }
          }
        }
      });
    })();
  }

  return result;
}

var patch = snabbdom.init([attributes, style]);

function create$1(node, instance) {

  var counter = 0;

  var DIRECTIVE_PREFIX$$1 = DIRECTIVE_PREFIX,
      DIRECTIVE_EVENT_PREFIX$$1 = DIRECTIVE_EVENT_PREFIX;


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

  return traverse(node, function (node) {
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

        if (node.custom) {
          directives.push({
            name: 'component',
            node: node,
            directive: instance.getDirective('component')
          });
        } else {
          each$$1(node.getAttributes(), function (value, key) {
            if (key === 'style') {
              styles = parseStyle(value);
            } else {
              attrs[key] = value;
            }
          });
        }

        each$1(node.directives, function (node) {
          var name = node.name;


          var directiveName = void 0;
          if (name.startsWith(DIRECTIVE_EVENT_PREFIX$$1)) {
            name = name.slice(DIRECTIVE_EVENT_PREFIX$$1.length);
            directiveName = 'event';
          } else {
            name = directiveName = name.slice(DIRECTIVE_PREFIX$$1.length);
          }

          directives.push({
            name: name,
            node: node,
            directive: instance.getDirective(directiveName)
          });
        });

        var data = { attrs: attrs };

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
                    instance: instance
                  });
                }
              });
            };

            data.hook = {
              insert: function insert(vnode) {
                notify(vnode, ATTACH);
              },
              update: function update(oldNode, vnode) {
                notify(vnode, UPDATE);
              },
              destroy: function destroy(vnode) {
                notify(vnode, DETACH);
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

var ref = {

  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance;


    var child = el['$component'];
    var value = node.getValue();
    if (child && value) {
      set$3(instance, 'ref', value, child);
      el.$ref = value;
    }
  },

  detach: function detach(_ref2) {
    var el = _ref2.el,
        instance = _ref2.instance;


    if (el.$ref) {
      delete instance.$refs[el.$ref];
      el.$ref = NULL;
    }
  }
};

var refDt = Object.freeze({
	default: ref
});

var event$1 = {

  attach: function attach(_ref) {
    var el = _ref.el,
        name = _ref.name,
        node = _ref.node,
        instance = _ref.instance;


    var listener = instance.compileAttr(node.keypath, node.getValue());
    if (listener) {
      var $component = el.$component;

      if ($component) {
        $component.on(name, listener);
      } else {
        on$1(el, name, listener);
        el['$' + name] = listener;
      }
    }
  },

  detach: function detach(_ref2) {
    var el = _ref2.el,
        name = _ref2.name,
        node = _ref2.node;

    var listener = '$' + name;
    if (el[listener]) {
      off$1(el, name, el[listener]);
      el[listener] = NULL;
    }
  }

};

var eventDt = Object.freeze({
	default: event$1
});

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

var supportInputTypes = ['text', 'number', 'tel', 'url', 'email', 'search'];

var controlTypes = {
  normal: {
    set: function set(_ref) {
      var el = _ref.el,
          keypath = _ref.keypath,
          instance = _ref.instance;

      el.value = instance.get(keypath);
    },
    sync: function sync(_ref2) {
      var el = _ref2.el,
          keypath = _ref2.keypath,
          instance = _ref2.instance;

      instance.set(keypath, el.value);
    }
  },
  radio: {
    set: function set(_ref3) {
      var el = _ref3.el,
          keypath = _ref3.keypath,
          instance = _ref3.instance;

      el.checked = el.value == instance.get(keypath);
    },
    sync: function sync(_ref4) {
      var el = _ref4.el,
          keypath = _ref4.keypath,
          instance = _ref4.instance;

      if (el.checked) {
        instance.set(keypath, el.value);
      }
    }
  },
  checkbox: {
    set: function set(_ref5) {
      var el = _ref5.el,
          keypath = _ref5.keypath,
          instance = _ref5.instance;

      var value = instance.get(keypath);
      el.checked = array(value) ? hasItem(value, el.value, FALSE) : !!value;
    },
    sync: function sync(_ref6) {
      var el = _ref6.el,
          keypath = _ref6.keypath,
          instance = _ref6.instance;

      var array$$1 = instance.get(keypath);
      if (array(array$$1)) {
        if (el.checked) {
          array$$1.push(el.value);
        } else {
          array$$1.removeItem(array$$1, el.value, FALSE);
        }
        instance.set(keypath, copy(array$$1));
      } else {
        instance.set(keypath, el.checked);
      }
    }
  }
};

function getEventInfo(el, lazyDirective) {

  var name = 'change',
      interval = void 0;

  var type = el.type,
      tagName = el.tagName;

  if (tagName === 'INPUT' && hasItem(supportInputTypes, type) || tagName === 'TEXTAREA') {
    if (lazyDirective) {
      var value = lazyDirective.node.getValue();
      if (numeric(value) && value >= 0) {
        name = 'input';
        interval = value;
      }
    } else {
      name = 'input';
    }
  }

  return {
    name: name,
    interval: interval,
    control: controlTypes[type] || controlTypes.normal
  };
}

var model = {

  attach: function attach(_ref7) {
    var el = _ref7.el,
        node = _ref7.node,
        instance = _ref7.instance,
        directives = _ref7.directives;

    var _getEventInfo = getEventInfo(el, directives.lazy),
        name = _getEventInfo.name,
        interval = _getEventInfo.interval,
        control = _getEventInfo.control;

    var keypath = node.keypath;


    var value = node.getValue();
    var result = testKeypath(instance, keypath, value);
    if (!result) {
      error$1('The ' + keypath + ' being used for two-way binding is ambiguous.');
    }

    keypath = result.keypath;

    var data = {
      el: el,
      keypath: keypath,
      instance: instance
    };
    control.set(data);

    instance.watch(keypath, function () {
      control.set(data);
    });

    var listener = function listener() {
      control.sync(data);
    };

    if (interval) {
      listener = debounce(listener, interval);
    }

    el.$model = function () {
      off$1(el, name, listener);
      el.$model = NULL;
    };

    on$1(el, name, listener);
  },

  detach: function detach(_ref8) {
    var el = _ref8.el;

    el.$model();
  }

};

var modelDt = Object.freeze({
	default: model
});

var component$1 = {

  attach: function attach(_ref) {
    var el = _ref.el,
        node = _ref.node,
        instance = _ref.instance;

    el.$component = instance.create(instance.getComponent(node.custom), {
      el: el,
      props: copy(node.getAttributes(), true),
      replace: TRUE
    });
  },

  update: function update(_ref2) {
    var el = _ref2.el,
        node = _ref2.node;

    el.$component.set(copy(node.getAttributes(), true));
  },

  detach: function detach(_ref3) {
    var el = _ref3.el;

    el.$component.dispose();
    el.$component = NULL;
  }

};

var componentDt = Object.freeze({
	default: component$1
});

directive.set({
  ref: refDt,
  event: eventDt,
  model: modelDt,
  component: componentDt
});

var Yox = function () {
  function Yox(options) {
    classCallCheck(this, Yox);
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
        partials = options.partials;

    template = tag.test(template) ? template : find(template).innerHTML;

    el = string(el) ? find(el) : el;

    if (!el || el.nodeType !== 1) {
      error$1('Passing a `el` option must be a html element.');
    }
    if (props && (object(data) || array(data))) {
      warn('Passing a `data` option with object and array to component is discouraged.');
    }

    if (!replace) {
      el.innerHTML = '<div></div>';
      el = el.firstChild;
    }

    var instance = this;

    if (parent) {
      instance.$parent = parent;
    }

    var hooks = {};
    each$$1(lifecycle, function (name) {
      hooks['on' + name] = name;
    });

    instance.$eventEmitter = new Emitter();

    each$$1(hooks, function (value, key) {
      if (func(options[key])) {
        instance.on(value, options[key]);
      }
    });

    instance.fire(INIT);

    if (object(methods)) {
      each$$1(methods, function (value, key) {
        instance[key] = value;
      });
    }

    data = func(data) ? data.call(instance) : data;
    if (object(props)) {
      if (!object(data)) {
        data = {};
      }
      extend(data, props);
    }
    if (data) {
      instance.$data = data;
    }

    if (object(components)) {
      instance.$components = components;
    }
    if (object(directives)) {
      instance.$directives = directives;
    }
    if (object(filters)) {
      instance.$filters = filters;
    }
    if (object(partials)) {
      instance.$partials = partials;
    }

    if (object(computed)) {
      (function () {
        var $computedGetters = instance.$computedGetters = {};

        var $computedSetters = instance.$computedSetters = {};

        var $computedCache = instance.$computedCache = {};

        var $computedStack = instance.$computedStack = [];

        var $computedWatchers = instance.$computedWatchers = {};

        var $computedDeps = instance.$computedDeps = {};

        each$$1(computed, function (item, keypath) {
          var get$$1 = void 0,
              set$$1 = void 0,
              cache = TRUE;
          if (func(item)) {
            get$$1 = item;
          } else if (object(item)) {
            if (has$1(item, 'cache')) {
              cache = item.cache;
            }
            if (func(item.get)) {
              get$$1 = item.get;
            }
            if (func(item.set)) {
              set$$1 = item.set;
            }
          }

          if (get$$1) {
            var getter = function getter() {

              if (cache && has$1($computedCache, keypath)) {
                return $computedCache[keypath];
              }

              $computedStack.push([]);
              var result = get$$1.call(instance);

              var newDeps = $computedStack.pop();
              var oldDeps = $computedDeps[keypath];
              $computedDeps[keypath] = newDeps;

              var addedDeps = [];
              var removedDeps = [];
              if (array(oldDeps)) {
                each$1(merge(oldDeps, newDeps), function (dep) {
                  var oldExisted = hasItem(oldDeps, dep);
                  var newExisted = hasItem(newDeps, dep);
                  if (oldExisted && !newExisted) {
                    removedDeps.push(dep);
                  } else if (!oldExisted && newExisted) {
                    addedDeps.push(dep);
                  }
                });
              } else {
                addedDeps = newDeps;
              }

              each$1(addedDeps, function (dep) {
                if (!array($computedWatchers[dep])) {
                  $computedWatchers[dep] = [];
                }
                $computedWatchers[dep].push(keypath);
              });

              each$1(removedDeps, function (dep) {
                removeItem($computedWatchers[dep], keypath);
              });

              $computedCache[keypath] = result;

              return result;
            };
            getter.computed = TRUE;
            $computedGetters[keypath] = getter;
          }

          if (set$$1) {
            $computedSetters[keypath] = set$$1.bind(instance);
          }
        });
      })();
    }

    if (object(events)) {
      each$$1(events, function (listener, type) {
        if (func(listener)) {
          instance.on(type, listener);
        }
      });
    }

    instance.$watchEmitter = new Emitter();

    if (object(watchers)) {
      each$$1(watchers, function (watcher, keypath) {
        instance.watch(keypath, watcher);
      });
    }

    instance.fire(CREATE);

    instance.$template = _parse(template, function (name) {
      return instance.getPartial(name);
    }, function (name, node) {
      set$3(instance, 'partial', name, node);
    });

    instance.fire(COMPILE);

    instance.updateView(el);
  }

  createClass(Yox, [{
    key: 'get',
    value: function get(keypath) {
      var $data = this.$data,
          $computedStack = this.$computedStack,
          $computedGetters = this.$computedGetters;


      if (array($computedStack)) {
        var deps = lastItem($computedStack);
        if (deps) {
          deps.push(keypath);
        }

        var getter = $computedGetters[keypath];
        if (getter) {
          return getter();
        }
      }

      var result = get$1($data, keypath);
      if (result) {
        return result.value;
      }
    }
  }, {
    key: 'set',
    value: function set(keypath, value) {
      var model = keypath;
      if (string(keypath)) {
        model = {};
        model[keypath] = value;
      }
      var instance = this;
      if (instance.updateModel(model)) {
        if (sync$1) {
          instance.updateView();
        } else if (!instance.$syncing) {
          instance.$syncing = TRUE;
          add(function () {
            delete instance.$syncing;
            instance.updateView();
          });
        }
      }
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
    value: function fire(type, data, bubble) {
      if (arguments.length === 2 && data === TRUE) {
        bubble = TRUE;
        data = NULL;
      }
      if (data && has$1(data, 'length') && !array(data)) {
        data = toArray(data);
      }
      var instance = this;
      var $parent = instance.$parent,
          $eventEmitter = instance.$eventEmitter;

      if (!$eventEmitter.fire(type, data, instance)) {
        if (bubble && $parent) {
          $parent.fire(type, data, bubble);
        }
      }
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
    key: 'toggle',
    value: function toggle(keypath) {
      this.set(keypath, !this.get(keypath));
    }
  }, {
    key: 'updateModel',
    value: function updateModel(model) {

      var instance = this;

      var $data = instance.$data,
          $watchEmitter = instance.$watchEmitter,
          $computedCache = instance.$computedCache,
          $computedWatchers = instance.$computedWatchers,
          $computedSetters = instance.$computedSetters;


      var hasComputed = object($computedWatchers),
          changes = {},
          setter = void 0,
          oldValue = void 0;

      each$$1(model, function (value, key) {
        oldValue = instance.get(key);
        if (value !== oldValue) {

          changes[key] = [value, oldValue];

          if (hasComputed && array($computedWatchers[key])) {
            each$1($computedWatchers[key], function (watcher) {
              if (has$1($computedCache, watcher)) {
                delete $computedCache[watcher];
              }
            });
          }

          if (hasComputed) {
            setter = $computedSetters[key];
            if (setter) {
              setter(value);
              return;
            }
          }

          set$1($data, key, value);
        }
      });

      if (count(changes)) {
        each$$1(changes, function (args, key) {
          each$1(getWildcardMatches(key), function (wildcardKeypath) {
            $watchEmitter.fire(wildcardKeypath, merge(args, getWildcardNames(key, wildcardKeypath)), instance);
          });
        });
        return changes;
      }
    }
  }, {
    key: 'updateView',
    value: function updateView(el) {

      var instance = this;

      var $data = instance.$data,
          $filters = instance.$filters,
          $template = instance.$template,
          $currentNode = instance.$currentNode,
          $computedGetters = instance.$computedGetters;


      var context = {};

      extend(context, filter.data, $data, $filters);
      each$$1(context, function (value, key) {
        if (func(value)) {
          context[key] = value.bind(instance);
        }
      });

      if (object($computedGetters)) {
        extend(context, $computedGetters);
      }

      var newNode = create$1(render$1($template, context), instance);

      if ($currentNode) {
        $currentNode = patch($currentNode, newNode);
        instance.fire(UPDATE);
      } else {
        $currentNode = patch(el, newNode);
        instance.$el = $currentNode.elm;
        instance.fire(ATTACH);
      }

      instance.$currentNode = $currentNode;
    }
  }, {
    key: 'create',
    value: function create(options, extra) {
      options = extend({}, options, extra);
      options.parent = this;
      return new Yox(options);
    }
  }, {
    key: 'compileAttr',
    value: function compileAttr(keypath, value) {
      return compileAttr$1(this, keypath, value);
    }
  }, {
    key: 'getComponent',
    value: function getComponent(name) {
      return get$3(this, 'component', name);
    }
  }, {
    key: 'getFilter',
    value: function getFilter(name) {
      return get$3(this, 'filter', name);
    }
  }, {
    key: 'getDirective',
    value: function getDirective(name) {
      return get$3(this, 'directive', name, true);
    }
  }, {
    key: 'getPartial',
    value: function getPartial(name) {
      return get$3(this, 'partial', name);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this.$watchEmitter.off();
      this.$eventEmitter.off();
      this.fire(DETACH);
    }
  }]);
  return Yox;
}();

Yox.version = '0.11.0';

Yox.switcher = switcher;

Yox.syntax = syntax;

Yox.cache = cache;

Yox.utils = { is: is$1, event: event, array: array$1, object: object$1 };

Yox.component = function (id, value) {
  component.set(id, value);
};

Yox.directive = function (id, value) {
  directive.set(id, value);
};

Yox.filter = function (id, value) {
  filter.set(id, value);
};

Yox.partial = function (id, value) {
  partial.set(id, value);
};

Yox.nextTick = function (fn) {
  add(fn);
};

Yox.use = function (plugin) {
  plugin.install(Yox);
};

return Yox;

})));
