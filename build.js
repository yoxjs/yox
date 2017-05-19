
/**
 * 1. 构建出源码版本: yox.js 和 yox-legacy.js
 * 2. 执行此脚本 node build.js
 */

let fs = require('fs')
let path = require('path')
let uglifyjs = require('uglify-js')

function optimize(source) {

  /**
   * 因为 typeof 的问题，Babel 会加上下面这段代码，因此要删掉
   *
   * var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
   *   return typeof obj;
   * } : function (obj) {
   *   return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
   * };
   *
   */

  let startIndex = source.indexOf('var _typeof = typeof Symbol')
  let endCode = 'Symbol.prototype ? "symbol" : typeof obj;'
  let endIndex = source.indexOf(endCode) + endCode.length + 3 // 包括换行符加 };

  source = source.substr(0, startIndex) + source.substr(endIndex)

  /**
   * Babel 会把 typeof a === x 编译成 ((typeof a === 'undefined' ? 'undefined' : _typeof(a))) === x
   * 这里替换回 typeof a
   */
  source = source.replace(
   /\(typeof \w+ === 'undefined' \? 'undefined' : _typeof\(\w+\)\)/g,
   function ($0) {
     return 'typeof ' + $0.split(' ')[ 1 ]
   }
  )

  /**
   * 类属性 value: function has$$1
   * 转成 value: function
   */
  source = source.replace(
   /value: function [\w$]+/g,
   function () {
     return 'value: function '
   }
  )


  /**
   * var Node$2 = function Node(type) {
   *   classCallCheck(this, Node);
   *   this.type = type;
   * };
   *
   * 此例改成
   *
   * var Node$2 = function Node$2(type) {
   * 	 classCallCheck(this, Node$2);
   * 	 this.type = type;
   * }
   */
  source = source.replace(
    /var ([\w$]+) = function (\w+)\([^)]+\) {\n\s+classCallCheck\(this, \w+\);/g,
    function ($0, $1, $2) {
      if ($1 !== $2) {
        let [ part1, part2 ] = $0.split('=')
        part2 = part2.replace(new RegExp(`\\b${$2}\\b`, 'g'), $1)
        return `${part1}=${part2}`
      }
      return $0
    }
  )

  /**
   * babel 会把函数 function Node {} 转成 var Node = function Node {}
   * 我们全都转成匿名函数
   */
   source = source.replace(
     /var ([\w$]+) = function ([\w$]+)/g,
     function ($0, $1, $2) {
       if ($1 === $2) {
         return `var ${$1} = function `
       }
       throw new Error(`${$1} is not equals to ${$2}`)
     }
   )

   /**
    * 把 new TypeError 转成 new Error
    */
   source = source.replace(
     /new TypeError/g,
     'new Error'
   )

   /**
    * 把 var name = void 0 转成 var name
    */
   source = source.replace(
     /(\w+) = void 0/g,
     function ($0, $1) {
       return $1
     }
   )

   return source

}

function minify(source) {
  return uglifyjs.minify(
    source,
    {
      compress: {
        warnings: false,
        // see https://github.com/ecomfe/edp/issues/230
        conditionals: false
      },
      mangle: {
          reserved: ['require', 'exports', 'module']
      },
      sourceMap: { }
    }
  )
}

function readFile(file) {
  return fs.readFileSync(path.join(__dirname, 'dist', file)).toString()
}

function writeFile(file, content) {
  fs.writeFileSync(path.join(__dirname, 'dist', file), content)
}

function build(file, minifiedFile) {
  let sourceMapFile = `${file}.map`
  let source = optimize(readFile(file))
  let minified = minify(source)
  writeFile(file, source)
  writeFile(minifiedFile, minified.code)
  writeFile(sourceMapFile, minified.map)
}

build('yox.js', 'yox.min.js')
build('yox-legacy.js', 'yox-legacy.min.js')
