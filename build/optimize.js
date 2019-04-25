export default function (source) {

  /**
   * 把 Object.freeze 去掉
   */
  source = source.replace(
    /Object\.freeze\(([^)]+)\)/g,
    function ($0, $1) {
      return $1
    }
  )

  /**
   * 类属性 value: function has$$1
   * 转成 value: function
   */
  source = source.replace(
    /\.prototype\.(\w+) = function [$\w]+\(/g,
    function ($0, $1) {
      return '.prototype.' + $1 + ' = function ('
    }
  )

  /**
   * 编译后 function Node {} 会转成 var Node = function Node {}
   * 我们全都转成匿名函数
   */
  source = source.replace(
    /(\b)([\w$]+) = function ([\w$]+) /g,
    function ($0, $1, $2, $3) {
      return `${$1}${$2} = function `
    }
  )

  /**
   * 把 void 0 转成 UNDEFINED
   */
  source = source.replace(
    /void 0/g,
    function ($0, $1, $2) {
      return `UNDEFINED`
    }
  )

  /**
   * 处理 legacy 版本
   */
  if (/shim start/.test(source)) {
    let shim = ''
    source = source
      .replace(
        /\/\/ shim start([\s\S]+?)\/\/ shim end/,
        function ($0, $1) {
          shim = $1
          return ''
        }
      )
      .replace(
        /'use strict';/,
        function ($0) {
          return $0 + shim
        }
      )
  }

  return source

}