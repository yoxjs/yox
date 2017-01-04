
import snabbdom from 'snabbdom'

import h from 'snabbdom/h'
import style from 'snabbdom/modules/style'
import attributes from 'snabbdom/modules/attributes'

import * as pattern from '../../config/pattern'

import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import * as viewEnginer from 'yox-template-compiler'
import * as viewSyntax from 'yox-template-compiler/src/syntax'

export let patch = snabbdom.init([ attributes, style ])

function isVNode(node) {
  return node
    && object.has(node, 'sel')
    && object.has(node, 'elm')
}

export function create(ast, context, instance) {

  let createText = function (node) {
    let { safe, content } = node
    if (safe !== env.FALSE || !is.string(content) || !pattern.tag.test(content)) {
      return content
    }
    return viewEnginer.compile(content, env.TRUE)
      .map(
        function (node) {
          return viewEnginer.render(node, createText, createElement).node
        }
      )
  }

  let createElement = function (node, isRootElement, isComponent) {

    let directives = [ ], attributes, styles

    let data = { }

    // 指令的创建要确保顺序
    // 组件必须第一个执行
    // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
    // 因此 component 必须在 event 指令之前执行

    if (isComponent) {
      array.push(
        directives,
        {
          node,
          name: 'component',
          directive: instance.directive('component'),
        }
      )
    }
    else {
      array.each(
        node.attributes,
        function (node) {
          let { name, value } = node
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
            if (!attributes) {
              attributes = [ ]
            }
            attributes[name] = value
          }
        }
      )
    }

    array.each(
      node.directives,
      function (node) {
        let { name } = node
        if (name === viewSyntax.KEYWORD_UNIQUE) {
          data.key = node.value
        }
        else {
          array.push(
            directives,
            {
              name,
              node,
              directive: instance.directive(name),
            }
          )
        }
      }
    )

    if (attributes) {
      data.attrs = attributes
    }
    if (styles) {
      data.style = styles
    }

    if (directives.length) {

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
                directives: map,
                attributes,
                instance,
              })
            }
          }
        )
      }

      let upsert = function (oldNode, vnode) {
        if (oldNode.attached) {
          notify(vnode, 'update')
        }
        else {
          notify(oldNode, 'attach')
          vnode = oldNode
        }
        vnode.attached = env.TRUE
      }

      data.hook = {
        insert: upsert,
        postpatch: upsert,
        destroy(vnode) {
          notify(vnode, 'detach')
        }
      }
    }

    return h(
      isComponent ? 'div' : node.name,
      data,
      // snabbdom 只支持字符串形式的 children
      node.children.map(
        function (child) {
          return isVNode(child) ? child : toString(child)
        }
      )
    )

  }

  let importTemplate = function (name) {
    return instance.partial(name)
  }

  return viewEnginer.render(ast, createText, createElement, importTemplate, context)

}
