
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
import * as string from '../../util/string'
import * as viewNodeType from '../../view/nodeType'

export let patch = snabbdom.init([ attributes, style ])

export function create(root, instance) {

  let counter = 0
  let traverse = function (node, enter, leave) {

    if (enter(node) === env.FALSE) {
      return
    }

    let children = [ ]
    if (is.array(node.children)) {
      array.each(
        node.children,
        function (item) {
          item = traverse(item, enter, leave)
          if (item != env.NULL) {
            children.push(item)
          }
        }
      )
    }

    return leave(node, children)

  }

  return traverse(
    root,
    function (node) {
      counter++
      if (node.type === viewNodeType.ATTRIBUTE || node.type === viewNodeType.DIRECTIVE) {
        return env.FALSE
      }
    },
    function (node, children) {
      counter--
      if (node.type === viewNodeType.ELEMENT) {

        let attrs = { }, directives = [ ], styles

        let data = { attrs }

        // 指令的创建要确保顺序
        // 组件必须第一个执行
        // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
        // 因此 component 必须在 event 指令之前执行

        // 组件的 attrs 作为 props 传入组件，不需要写到元素上
        if (node.component) {
          directives.push({
            name: 'component',
            node: node,
            directive: instance.directive('component'),
          })
        }
        else {
          array.each(
            node.attrs,
            function (node) {
              let { name } = node, value = node.getValue()
              if (name === 'style') {
                let list = string.parse(value, ';', ':')
                if (list.length) {
                  styles = { }
                  array.each(
                    list,
                    function (item) {
                      if (item.value) {
                        styles[string.camelCase(item.key)] = item.value
                      }
                    }
                  )
                }
              }
              else {
                attrs[name] = value
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
            else if (name.startsWith(syntax.DIRECTIVE_PREFIX)) {
              name = name.slice(syntax.DIRECTIVE_PREFIX.length)
              // ref 不支持 o-ref 写法
              if (name !== syntax.KEY_REF) {
                directiveName = name
              }
            }
            else if (name === syntax.KEY_REF) {
              name =
              directiveName = 'ref'
            }
            else if (name === syntax.KEY_UNIQUE) {
              data.key = node.getValue()
            }

            if (directiveName) {
              directives.push({
                name: name,
                node: node,
                directive: instance.directive(directiveName),
              })
            }
          }
        )

        if (styles) {
          data.style = styles
        }

        if (!counter || directives.length) {

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
                    attrs,
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
      else if (node.type === viewNodeType.TEXT) {
        return node.content
      }
    }
  )

}
