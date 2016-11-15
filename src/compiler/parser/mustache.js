
import * as env from '../../config/env'
import * as cache from '../../config/cache'
import * as syntax from '../../config/syntax'
import * as pattern from '../../config/pattern'

import * as nodeType from '../nodeType'

import Context from '../helper/Context'
import Scanner from '../helper/Scanner'

import Attribute from '../node/Attribute'
import Directive from '../node/Directive'
import Each from '../node/Each'
import Element from '../node/Element'
import Else from '../node/Else'
import ElseIf from '../node/ElseIf'
import Expression from '../node/Expression'
import If from '../node/If'
import Import from '../node/Import'
import Partial from '../node/Partial'
import Text from '../node/Text'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as string from '../../util/string'
import * as logger from '../../util/logger'
import * as expression from '../../util/expression'

const openingDelimiter = '\\{\\{\\s*'
const closingDelimiter = '\\s*\\}\\}'
const openingDelimiterPattern = new RegExp(openingDelimiter)
const closingDelimiterPattern = new RegExp(closingDelimiter)

const elementPattern = /<(?:\/)?[a-z]\w*/i
const elementEndPattern = /(?:\/)?>/

const attributePattern = /([-:@a-z0-9]+)(=["'])?/i
const attributeValueStartPattern = /^=["']/

const parsers = [
  {
    test: function (source) {
      return source.startsWith(syntax.EACH)
    },
    create: function (source) {
      let terms = source.slice(syntax.EACH.length).trim().split(':')
      let name = terms[0].trim()
      let index
      if (terms[1]) {
        index = terms[1].trim()
      }
      return new Each(name, index)
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
        : 'Expected legal partial name'
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
        : 'Expected legal partial name'
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
        : 'Expected expression'
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
      return 'Expected expression'
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
  let rootContext = new Context(data)
  let keys = [ ]

  // 非转义插值需要解析模板字符串
  let renderAst = function (node) {
    node.render({
      keys,
      parent: rootElement,
      context: rootContext,
      parse: function (template) {
        return parse(template).children
      },
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
  if (children.length !== 1 || children[0].type !== nodeType.ELEMENT) {
    logger.warn('Template should have only one root element.')
  }

  return children[0]

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

  let { templateParse } = cache

  if (templateParse[template]) {
    return templateParse[template]
  }

  // 支持延展操作符
  template = template.replace(
    new RegExp(`${openingDelimiter}\\.\\.\\.\\s*([$\\w]+)${closingDelimiter}`, 'g'),
    function ($0, $1) {
      return `{{#each ${$1}:key}} {{key}}="{{this}}"{{/each}}`
    }
  )

  let mainScanner = new Scanner(template),
    helperScanner = new Scanner(),
    rootNode = new Element(rootName),
    currentNode = rootNode,
    nodeStack = [ ],
    node,
    name,
    quote,
    content,
    isComponent,
    isSelfClosingTag,
    match,
    errorIndex

  let attrLike = { }
  attrLike[nodeType.ATTRIBUTE] = env.TRUE
  attrLike[nodeType.DIRECTIVE] = env.TRUE

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
        if (string.isBreakLine(content)) {
          return
        }
        if (content = string.trimBreakline(content)) {
          node.content = content
        }
        else {
          return
        }
        break

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
    match = string.matchByQuote(content, quote)
    if (match) {
      addChild(
        new Text(match)
      )
      content = content.substr(match.length)
    }
    if (content.charAt(0) === quote) {
      popStack()
    }
    return content
  }

  // 这个函数涉及分隔符和普通模板的深度解析
  // 是最核心的函数
  let parseContent = function (content, isAttributesParsing) {

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

        if (isAttributesParsing) {

          // 当前节点是 ATTRIBUTE
          // 表示至少已经有了属性名
          if (attrLike[currentNode.type]) {

            // 走进这里，只可能是以下几种情况
            // 1. 属性名是字面量，属性值已包含表达式
            // 2. 属性名是表达式，属性值不确定是否存在

            // 当前属性的属性值是字面量结尾
            if (currentNode.children.length) {
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
              }
            }

          }

          if (!attrLike[currentNode.type]) {
            // 下一个属性的开始
            while (match = attributePattern.exec(content)) {
              content = content.slice(match.index + match[0].length)

              name = match[1]

              addChild(
                name.startsWith(syntax.DIRECTIVE_PREFIX)
                  || name.startsWith(syntax.DIRECTIVE_EVENT_PREFIX)
                ? new Directive(name)
                : new Attribute(name)
              )

              if (is.string(match[2])) {
                quote = match[2].charAt(1)
                content = parseAttributeValue(content)
                // else 可能跟了一个表达式
              }
              // 没有引号，即 checked、disabled 等
              else {
                popStack()
              }
            }
            content = ''
          }
        }

        if (content) {
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
            function (parser) {
              if (parser.test(content)) {
                node = parser.create(content, popStack)
                if (is.string(node)) {
                  string.parseError(template, node, errorIndex)
                }
                if (isAttributesParsing
                  && node.type === nodeType.EXPRESSION
                  && !attrLike[currentNode.type]
                ) {
                  node = new Attribute(node)
                }
                addChild(node)
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
        return string.parseError(template, 'Illegal tag name', errorIndex)
      }
      else if (name !== currentNode.name) {
        return string.parseError(template, 'Unexpected closing tag', errorIndex)
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
      addChild(
        new Element(
          isComponent ? 'div' : name,
          isComponent ? name : ''
        )
      )

      // 截取 <name 和 > 之间的内容
      // 用于提取 attribute
      content = mainScanner.nextBefore(elementEndPattern)
      if (content) {
        parseContent(content, env.TRUE)
      }

      content = mainScanner.nextAfter(elementEndPattern)
      if (!content) {
        return string.parseError(template, 'Illegal tag name', errorIndex)
      }

      if (isComponent || isSelfClosingTag) {
        popStack()
      }
    }
  }

  if (nodeStack.length) {
    return string.parseError(template, `Missing end tag (</${nodeStack[0].name}>)`, errorIndex)
  }

  templateParse[template] = rootNode

  return rootNode

}
