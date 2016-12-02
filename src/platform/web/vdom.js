
import snabbdom from 'snabbdom'

import h from 'snabbdom/h'
import style from 'snabbdom/modules/style'
import attributes from 'snabbdom/modules/attributes'

import * as native from './native'

import * as env from '../../config/env'
import * as syntax from '../../config/syntax'

import * as is from '../../util/is'
import * as array from '../../util/array'
import * as object from '../../util/object'
import * as nodeType from '../../compiler/nodeType'

export let patch = snabbdom.init([ attributes, style ])

const UNIQUE_KEY = 'key'

/**
 * 把 style-name: value 解析成对象的形式
 *
 * @param {string} str
 * @return {Object}
 */
function parseStyle(str) {

  let result = { }

  if (is.string(str)) {
    let terms, name, value
    array.each(
      str.split(';'),
      function (term) {
        terms = term.split(':')
        name = terms[0]
        value = terms[1]
        if (name && value) {
          name = name.trim()
          value = value.trim()
          if (name) {
            result[camelCase(name)] = value
          }
        }
      }
    )
  }

  return result

}

export function create(root, instance) {
  let counter = 0
  return root.traverse(
    function (node) {
      counter++
      if (node.type === nodeType.ATTRIBUTE || node.type === nodeType.DIRECTIVE) {
        return env.FALSE
      }
    },
    function (node, children) {
      counter--
      if (node.type === nodeType.ELEMENT) {

        let attrs = { }, directives = [ ], styles

        // 指令的创建要确保顺序
        // 组件必须第一个执行
        // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
        // 因此 component 必须在 event 指令之前执行

        let attributes = node.getAttributes()
        // 组件的 attrs 作为 props 传入组件，不需要写到元素上
        if (node.custom) {
          directives.push({
            name: 'component',
            node,
            directive: instance.getDirective('component'),
          })
        }
        else {
          object.each(
            attributes,
            function (value, key) {
              if (key === 'style') {
                styles = parseStyle(value)
              }
              else if (key !== UNIQUE_KEY) {
                attrs[key] = value
              }
            }
          )
        }

        array.each(
          node.directives,
          function (node) {
            let { name } = node

            let directiveName
            if (name.startsWith(syntax.DIRECTIVE_EVENT_PREFIX)) {
              name = name.slice(syntax.DIRECTIVE_EVENT_PREFIX.length)
              directiveName = 'event'
            }
            else {
              name =
              directiveName = name.slice(syntax.DIRECTIVE_PREFIX.length)
            }

            directives.push({
              name,
              node,
              directive: instance.getDirective(directiveName),
            })
          }
        )

        let data = { attrs }

        if (object.has(attributes, UNIQUE_KEY)) {
          data.key = attributes.key
        }

        if (styles) {
          data.style = styles
        }

        if (!counter || directives.length) {

          // 方便指令内查询
          let map = array.toObject(directives, 'name')

          let notify = function (vnode, type) {
            array.each(
              directives,
              function (item) {
                let { directive } = item
                if (directive && is.func(directive[type])) {
                  directive[type]({
                    el: vnode.elm,
                    node: item.node,
                    name: item.name,
                    directives: map,
                    instance,
                  })
                }
              }
            )
          }

          data.hook = {
            insert: function (vnode) {
              notify(vnode, 'attach')
            },
            postpatch: function (oldNode, vnode) {
              notify(vnode, 'update')
            },
            destroy: function (vnode) {
              notify(vnode, 'detach')
            }
          }
        }

        return h(node.name, data, children)
      }
      else if (node.type === nodeType.TEXT) {
        return node === root
          ? { text: node.content }
          : node.content
      }
    }
  )

}
