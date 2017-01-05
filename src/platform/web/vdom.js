
import snabbdom from 'snabbdom'

import h from 'snabbdom/h'
import style from 'snabbdom/modules/style'
import attributes from 'snabbdom/modules/attributes'

import * as pattern from '../../config/pattern'

import execute from 'yox-common/function/execute'
import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import * as viewEnginer from 'yox-template-compiler'
import * as viewSyntax from 'yox-template-compiler/src/syntax'

export const patch = snabbdom.init([ attributes, style ])

function isVNode(node) {
  return node
    && object.has(node, 'sel')
    && object.has(node, 'elm')
}

const DIRECTIVE_COMPONENT = 'component'

const HOOK_ATTACH = 'attach'
const HOOK_UPDATE = 'update'
const HOOK_DETACH = 'detach'

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

  let createElement = function (node, isComponent) {

    let hooks = { }, attributes = { }, styles
    let directiveMap = { }, directiveKeys = [ ]

    let data = {
      hook: hooks,
    }

    let addDirective = function (name, node) {
      let key = [ name, node.subName ].join(':')
      if (!directiveMap[ key ]) {
        directiveMap[ key ] = {
          name,
          node,
          options: instance.directive(name),
        }
        array.push(
          directiveKeys,
          key
        )
      }
    }

    // 指令的创建要确保顺序
    // 组件必须第一个执行
    // 因为如果在组件上写了 on-click="xx" 其实是监听从组件 fire 出的 click 事件
    // 因此 component 必须在 event 指令之前执行

    // 销毁时，
    // 数组要逆序执行
    // 否则先销毁组件指令，会导致后面依赖组件指令的指令全挂

    if (isComponent) {
      addDirective(DIRECTIVE_COMPONENT, node)
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
                    styles[ string.camelCase(item.key) ] = item.value
                  }
                }
              )
            }
          }
          else {
            attributes[ name ] = value
          }
        }
      )
    }

    array.each(
      node.directives,
      function (node) {
        let { name, subName } = node
        if (name === viewSyntax.KEYWORD_UNIQUE) {
          data.key = node.value
        }
        else {
          addDirective(name, node)
        }
      }
    )

    if (object.keys(attributes).length) {
      data.attrs = attributes
    }
    if (styles) {
      data.style = styles
    }

    let callHook = function (key, type, el, directives, attributes) {
      let { options, node } = directives[ key ]
      if (options) {
        execute(
          options[type],
          env.NULL,
          {
            key,
            node,
            el,
            directives,
            attributes,
            instance,
          }
        )
      }
    }
    let upsert = function (vnode, newVnode) {

      // 如果只有 vnode，且 vnode 没有 directiveMap，表示插入
      // 如果只有 vnode，且 vnode 有 directiveMap，表示销毁
      // 如果有 vnode 和 newVnode，表示更新

      let attach = function (key) {
        callHook(
          key,
          HOOK_ATTACH,
          vnode.elm,
          directiveMap,
          attributes
        )
      }

      let update = function (key) {
        callHook(
          key,
          HOOK_UPDATE,
          vnode.elm,
          directiveMap,
          attributes
        )
      }

      let detach = function (key) {
        callHook(
          key,
          HOOK_DETACH,
          vnode.elm,
          vnode.directiveMap,
          vnode.attributes
        )
      }

      // 用占位元素创建组件时
      // 占位元素和组件真实的根元素都会触发一次钩子
      // 坑爹的是，两次钩子的元素是相同的（都是组件根元素）
      // 因此，区分占位元素和组件根元素变得很蛋疼
      array.each(
        directiveKeys,
        function (key, directive) {
          // 更新
          if (newVnode && vnode.directiveMap) {
            // 更新时可能出现新指令
            directive = vnode.directiveMap[key]
            if (directive) {
              if (directive.name === DIRECTIVE_COMPONENT) {
                update(key)
              }
              else if (directive.node.value !== directiveMap[key].node.value) {
                detach(key)
                attach(key)
              }
            }
            else {
              attach(key)
            }
          }
          // 插入
          else {
            attach(key)
          }
        }
      )

      // 1. 销毁
      // 2. 更新时的删除
      if (vnode.directiveKeys) {
        array.each(
          vnode.directiveKeys.reverse(),
          function (key) {
            if (!newVnode || !directiveMap[key]) {
              detach(key)
            }
          }
        )
      }

      let nextVnode = newVnode || vnode
      nextVnode.attributes = attributes
      nextVnode.directiveMap = directiveMap
      nextVnode.directiveKeys = directiveKeys

      hooks.insert =
      hooks.postpatch =
      hooks.destroy = env.noop

    }

    /**
     * 指令的生命周期
     *
     * attach: 新增指令 或 元素被插入
     * detach: 删除指令 或 元素被移除
     * update: 指令变化
     */

    hooks.insert =
    hooks.postpatch =
    hooks.destroy = upsert

    return h(
      isComponent ? 'div' : node.name,
      data,
      node.children.map(
        function (child) {
          // snabbdom 只支持字符串形式的 children
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
