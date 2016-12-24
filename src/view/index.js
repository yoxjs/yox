
import * as env from '../config/env'
import * as cache from '../config/cache'
import * as syntax from '../config/syntax'
import * as pattern from '../config/pattern'

import * as util from './util'
import * as nodeType from './nodeType'

import Context from './helper/Context'
import Scanner from './helper/Scanner'

import Attribute from './node/Attribute'
import Directive from './node/Directive'
import Each from './node/Each'
import Element from './node/Element'
import Else from './node/Else'
import ElseIf from './node/ElseIf'
import Expression from './node/Expression'
import If from './node/If'
import Import from './node/Import'
import Partial from './node/Partial'
import Spread from './node/Spread'
import Text from './node/Text'

import * as is from '../util/is'
import * as array from '../util/array'
import * as object from '../util/object'
import * as logger from '../util/logger'
import * as expression from '../expression/index'

const openingDelimiter = '\\{\\{\\s*'
const closingDelimiter = '\\s*\\}\\}'
const openingDelimiterPattern = new RegExp(openingDelimiter)
const closingDelimiterPattern = new RegExp(closingDelimiter)

const elementPattern = /<(?:\/)?[a-z]\w*/i
const elementEndPattern = /(?:\/)?>/

const attributePattern = /([-:@a-z0-9]+)(=["'])?/i
const attributeValueStartPattern = /^=["']/

const ERROR_PARTIAL_NAME = 'Expected legal partial name'
const ERROR_EXPRESSION = 'Expected expression'

const parsers = [
  {
    test: function (source) {
      return source.startsWith(syntax.EACH)
    },
    create: function (source) {
      let terms = source.slice(syntax.EACH.length).trim().split(':')
      let expr = expression.parse(terms[0])
      let index
      if (terms[1]) {
        index = terms[1].trim()
      }
      return new Each(expr, index)
    }
  },
  {
    test: function (source) {
       return source.startsWith(syntax.IMPORT)
    },
    create: function (source) {
      let name = source.slice(syntax.IMPORT.length).trim()
      return name
        ? new Import(name)
        : ERROR_PARTIAL_NAME
    }
  },
  {
    test: function (source) {
       return source.startsWith(syntax.PARTIAL)
    },
    create: function (source) {
      let name = source.slice(syntax.PARTIAL.length).trim()
      return name
        ? new Partial(name)
        : ERROR_PARTIAL_NAME
    }
  },
  {
    test: function (source) {
       return source.startsWith(syntax.IF)
    },
    create: function (source) {
      let expr = source.slice(syntax.IF.length).trim()
      return expr
        ? new If(expression.parse(expr))
        : ERROR_EXPRESSION
    }
  },
  {
    test: function (source) {
      return source.startsWith(syntax.ELSE_IF)
    },
    create: function (source, popStack) {
      let expr = source.slice(syntax.ELSE_IF.length)
      if (expr) {
        popStack()
        return new ElseIf(expression.parse(expr))
      }
      return ERROR_EXPRESSION
    }
  },
  {
    test: function (source) {
      return source.startsWith(syntax.ELSE)
    },
    create: function (source, popStack) {
      popStack()
      return new Else()
    }
  },
  {
    test: function (source) {
      return source.startsWith(syntax.SPREAD)
    },
    create: function (source) {
      let expr = source.slice(syntax.SPREAD.length)
      if (expr) {
        return new Spread(expression.parse(expr))
      }
      return ERROR_EXPRESSION
    }
  },
  {
    test: function (source) {
      return !source.startsWith(syntax.COMMENT)
    },
    create: function (source) {
      let safe = env.TRUE
      if (source.startsWith('{')) {
        safe = env.FALSE
        source = source.slice(1)
      }
      return new Expression(expression.parse(source), safe)
    }
  }
]

const rootName = 'root'

/**
 * 把抽象语法树渲染成 Virtual DOM
 *
 * @param {Object} ast
 * @param {Object} data
 * @return {Object}
 */
export function render(ast, data) {

  let rootElement = new Element(rootName)
  let deps = { }

  // 非转义插值需要解析模板字符串
  let renderAst = function (ast) {
    ast.render({
      keys: [ ],
      parent: rootElement,
      context: new Context(data),
      parse: function (template) {
        return parse(template).children
      },
      addDeps: function (childrenDeps) {
        object.extend(deps, childrenDeps)
      }
    })
  }

  if (ast.name === rootName) {
    array.each(
      ast.children,
      renderAst
    )
  }
  else {
    renderAst(ast)
  }

  let { children } = rootElement
  if (children.length > 1) {
    logger.error('Component template should contain exactly one root element.')
  }

  return {
    root: children[0],
    deps,
  }

}

/**
 * 把模板解析为抽象语法树
 *
 * @param {string} template
 * @param {Function} getPartial 当解析到 IMPORT 节点时，需要获取模板片段
 * @param {Function} setPartial 当解析到 PARTIAL 节点时，需要注册模板片段
 * @return {Object}
 */
export function parse(template, getPartial, setPartial) {

  if (cache.templateParse[template]) {
    return cache.templateParse[template]
  }

  let nodeStack = [ ],
    name,
    quote,
    content,
    isComponent,
    isSelfClosingTag,
    match,
    errorIndex

  let mainScanner = new Scanner(template)
  let helperScanner = new Scanner()

  // level 有三级
  // 0 表示可以 add Element 和 Text
  // 1 表示只能 add Attribute 和 Directive
  // 2 表示只能 add Text

  const LEVEL_ELEMENT = 0
  const LEVEL_ATTRIBUTE = 1
  const LEVEL_TEXT = 2

  let level = LEVEL_ELEMENT, levelNode

  let rootNode = new Element(rootName)
  let currentNode = rootNode

  let pushStack = function (node) {
    nodeStack.push(currentNode)
    currentNode = node
  }

  let popStack = function () {
    currentNode = nodeStack.pop()
    return currentNode
  }

  let addChild = function (node, action = 'addChild') {

    let { name, type, content, children } = node

    switch (type) {
      case nodeType.TEXT:
        if (util.isBreakLine(content)) {
          return
        }
        if (content = util.trimBreakline(content)) {
          node.content = content
        }
        else {
          return
        }
        break

      case nodeType.SPREAD:
      case nodeType.ATTRIBUTE:
        if (currentNode.attrs) {
          action = 'addAttr'
        }
        break

      case nodeType.DIRECTIVE:
        if (currentNode.directives) {
          action = 'addDirective'
        }
        break

      case nodeType.IMPORT:
        array.each(
          getPartial(name).children,
          function (node) {
            addChild(node)
          }
        )
        return

      case nodeType.PARTIAL:
        setPartial(name, node)
        pushStack(node)
        return

    }

    currentNode[action](node)

    if (children) {
      pushStack(node)
    }
  }

  let parseAttributeValue = function (content) {
    match = util.matchByQuote(content, quote)
    if (match) {
      addChild(
        new Text(match)
      )
      content = content.substr(match.length)
    }
    if (content.charAt(0) === quote) {
      popStack()
      level--
    }
    return content
  }

  // 这个函数涉及分隔符和普通模板的深度解析
  // 是最核心的函数
  let parseContent = function (content) {

    helperScanner.reset(content)

    while (helperScanner.hasNext()) {

      // 分隔符之前的内容
      content = helperScanner.nextBefore(openingDelimiterPattern)
      helperScanner.nextAfter(openingDelimiterPattern)

      if (content) {

        // 支持以下 5 种 attribute
        // name
        // {{name}}
        // name="value"
        // name="{{value}}"
        // {{name}}="{{value}}"

        // 当前节点是 ATTRIBUTE 或 DIRECTIVE
        // 表示至少已经有了 name
        if (level === LEVEL_TEXT) {

          // 走进这里，只可能是以下几种情况：
          // 1. 属性名是字面量，属性值已包含表达式
          // 2. 属性名是表达式，属性值不确定是否存在

          // 当前属性的属性值是字面量结尾
          if (levelNode.children.length) {
            content = parseAttributeValue(content)
          }
          else {
            // 属性值开头部分是字面量
            if (attributeValueStartPattern.test(content)) {
              quote = content.charAt(1)
              content = content.slice(2)
            }
            // 没有属性值
            else {
              popStack()
              level--
            }
          }

        }



        if (level === LEVEL_ATTRIBUTE) {
          // 下一个属性的开始
          while (match = attributePattern.exec(content)) {
            content = content.slice(match.index + match[0].length)

            name = match[1]

            levelNode = name.startsWith(syntax.DIRECTIVE_PREFIX)
              || name.startsWith(syntax.DIRECTIVE_EVENT_PREFIX)
              || name === syntax.KEY_REF
              || name === syntax.KEY_LAZY
              || name === syntax.KEY_MODEL
              || name === syntax.KEY_UNIQUE
            ? new Directive(name)
            : new Attribute(name)

            addChild(levelNode)
            level++

            // 包含 ="
            if (is.string(match[2])) {
              quote = match[2].charAt(1)
              content = parseAttributeValue(content)
            }
            // 没有引号，即 checked、disabled 等
            else {
              popStack()
              level--
            }
          }
        }
        else if (content) {
          addChild(
            new Text(content)
          )
        }

      }

      // 分隔符之间的内容
      content = helperScanner.nextBefore(closingDelimiterPattern)
      helperScanner.nextAfter(closingDelimiterPattern)

      if (content) {
        if (content.charAt(0) === '/') {
          popStack()
        }
        else {
          if (content.charAt(0) === '{' && helperScanner.charAt(0) === '}') {
            helperScanner.forward(1)
          }
          array.each(
            parsers,
            function (parser, index) {
              if (parser.test(content)) {
                // 用 index 节省一个变量定义
                index = parser.create(content, popStack)
                if (is.string(index)) {
                  util.parseError(template, index, errorIndex)
                }
                else if (level === LEVEL_ATTRIBUTE
                  && node.type === nodeType.EXPRESSION
                ) {
                  levelNode = new Attribute(index)
                  level++
                  addChild(levelNode)
                }
                else {
                  addChild(index)
                }
                return env.FALSE
              }
            }
          )
        }
      }

    }
  }

  while (mainScanner.hasNext()) {
    content = mainScanner.nextBefore(elementPattern)

    if (content.trim()) {
      // 处理标签之间的内容
      parseContent(content)
    }

    // 接下来必须是 < 开头（标签）
    // 如果不是标签，那就该结束了
    if (mainScanner.charAt(0) !== '<') {
      break
    }

    errorIndex = mainScanner.pos

    // 结束标签
    if (mainScanner.charAt(1) === '/') {
      content = mainScanner.nextAfter(elementPattern)
      name = content.slice(2)

      if (mainScanner.charAt(0) !== '>') {
        return util.parseError(template, 'Illegal tag name', errorIndex)
      }
      else if (name !== currentNode.name) {
        return util.parseError(template, 'Unexpected closing tag', errorIndex)
      }

      popStack()

      mainScanner.forward(1)
    }
    // 开始标签
    else {
      content = mainScanner.nextAfter(elementPattern)
      name = content.slice(1)
      isComponent = pattern.componentName.test(name)
      isSelfClosingTag = isComponent || pattern.selfClosingTagName.test(name)

      // 低版本浏览器不支持自定义标签，因此需要转成 div
      levelNode = new Element(
        isComponent ? 'div' : name,
        isComponent ? name : ''
      )

      addChild(levelNode)

      // 截取 <name 和 > 之间的内容
      // 用于提取 attribute
      content = mainScanner.nextBefore(elementEndPattern)
      if (content) {
        level++
        parseContent(content)
        level--
      }

      content = mainScanner.nextAfter(elementEndPattern)
      if (!content) {
        return util.parseError(template, 'Illegal tag name', errorIndex)
      }

      if (isSelfClosingTag) {
        popStack()
      }
    }
  }

  if (nodeStack.length) {
    return util.parseError(template, `Missing end tag (</${nodeStack[0].name}>)`, errorIndex)
  }

  cache.templateParse[template] = rootNode

  return rootNode

}
