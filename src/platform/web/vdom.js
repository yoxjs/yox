
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

    let { name, attributes, directives, children } = node

    let attrs = { }, dires = [ ], styles
    let data = { attrs }

    // 指令的创建要确保顺序
    // 组件必须第一个执行
    // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
    // 因此 component 必须在 event 指令之前执行

    if (isComponent) {
      array.push(
        dires,
        {
          node,
          name: 'component',
          directive: instance.directive('component'),
        }
      )
    }
    else {
      array.each(
        attributes,
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
            attrs[name] = value
          }
        }
      )
    }

    array.each(
      directives,
      function (node) {
        let { name } = node
        if (name === viewSyntax.KEYWORD_UNIQUE) {
          data.key = node.value
        }
        else {
          array.push(
            dires,
            {
              name,
              node,
              directive: instance.directive(name),
            }
          )
        }
      }
    )

    if (styles) {
      data.style = styles
    }

    if (isRootElement || dires.length) {

      let map = array.toObject(dires, 'name')

      let notify = function (vnode, type) {
        array.each(
          dires,
          function (item) {
            let { directive } = item
            if (directive && is.func(directive[type])) {
              directive[type]({
                el: vnode.elm,
                node: item.node,
                directives: map,
                attrs,
                instance,
              })
            }
          }
        )
      }

      let update = function (oldNode, vnode) {
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
        insert: update,
        postpatch: update,
        destroy(vnode) {
          notify(vnode, 'detach')
        }
      }
    }

    // snabbdom 只支持字符串形式的 children
    children = children.map(
      function (child) {
        return child && object.has(child, 'sel') && object.has(child, 'elm')
          ? child
          : toString(child)
      }
    )

    return h(isComponent ? 'div' : name, data, children)

  }

  let importTemplate = function (name) {
    return instance.partial(name)
  }

  return viewEnginer.render(ast, createText, createElement, importTemplate, context)

}
