import snabbdom from 'snabbdom'

import h from 'snabbdom/h'
import style from 'snabbdom/modules/style'
import attributes from 'snabbdom/modules/attributes'

import * as syntax from '../../config/syntax'
import * as lifecycle from '../../config/lifecycle'

import {
  NULL,
  FALSE,
} from '../../config/env'

import {
  parseStyle,
} from './helper'

import {
  each,
  toObject,
} from '../../util/array'

import {
  each as objectEach,
} from '../../util/object'

import {
  isArray,
  isFunction,
} from '../../util/is'

import {
  TEXT,
  ATTRIBUTE,
  DIRECTIVE,
  ELEMENT,
} from '../../compiler/nodeType'


export let patch = snabbdom.init([ attributes, style ])

export function create(node, instance) {

  let counter = 0

  let {
    DIRECTIVE_PREFIX,
    DIRECTIVE_EVENT_PREFIX,
  } = syntax

  let traverse = function (node, enter, leave) {

    if (enter(node) === FALSE) {
      return
    }

    let children = [ ]
    if (isArray(node.children)) {
      each(
        node.children,
        function (item) {
          item = traverse(item, enter, leave)
          if (item != NULL) {
            children.push(item)
          }
        }
      )
    }

    return leave(node, children)

  }

  return traverse(
    node,
    function (node) {
      counter++
      if (node.type === ATTRIBUTE || node.type === DIRECTIVE) {
        return FALSE
      }
    },
    function (node, children) {
      counter--
      if (node.type === ELEMENT) {

        let attrs = { }, directives = [ ], styles

        // 指令的创建要确保顺序
        // 组件必须第一个执行
        // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
        // 因此 component 必须在 event 指令之前执行

        // 组件的 attrs 作为 props 传入组件，不需要写到元素上
        if (node.custom) {
          directives.push({
            name: 'component',
            node,
            directive: instance.getDirective('component'),
          })
        }
        else {
          objectEach(
            node.getAttributes(),
            function (value, key) {
              if (key === 'style') {
                styles = parseStyle(value)
              }
              else {
                attrs[key] = value
              }
            }
          )
        }

        each(
          node.directives,
          function (node) {
            let { name } = node

            let directiveName
            if (name.startsWith(DIRECTIVE_EVENT_PREFIX)) {
              name = name.substr(DIRECTIVE_EVENT_PREFIX.length)
              directiveName = 'event'
            }
            else {
              name =
              directiveName = name.substr(DIRECTIVE_PREFIX.length)
            }

            directives.push({
              name,
              node,
              directive: instance.getDirective(directiveName),
            })
          }
        )

        let data = { attrs }

        if (styles) {
          data.style = styles
        }

        if (!counter || directives.length) {

          // 方便指令内查询
          let map = toObject(directives, 'name')

          let notify = function (vnode, type) {
            each(
              directives,
              function (item) {
                let { directive } = item
                if (directive && isFunction(directive[type])) {
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
              notify(vnode, lifecycle.ATTACH)
            },
            update: function (oldNode, vnode) {
              notify(vnode, lifecycle.UPDATE)
            },
            destroy: function (vnode) {
              notify(vnode, lifecycle.DETACH)
            }
          }
        }

        return h(node.name, data, children)
      }
      else if (node.type === TEXT) {
        return node.content
      }
    }
  )

}
