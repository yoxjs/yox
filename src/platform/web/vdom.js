
import * as snabbdom from 'yox-snabbdom'

import h from 'yox-snabbdom/h'
import Vnode from 'yox-snabbdom/Vnode'
import style from 'yox-snabbdom/modules/style'
import attributes from 'yox-snabbdom/modules/attributes'

import execute from 'yox-common/function/execute'
import toString from 'yox-common/function/toString'

import * as char from 'yox-common/util/char'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import * as viewEnginer from 'yox-template-compiler'
import * as viewSyntax from 'yox-template-compiler/src/syntax'

import * as pattern from '../../config/pattern'

export const patch = snabbdom.init([ attributes, style ])

export function create(ast, context, instance) {

  let createText = function (node) {
    let { safe, content } = node
    if (safe !== env.FALSE || !is.string(content) || !pattern.tag.test(content)) {
      return content
    }
    return new Vnode({
      text: content,
      raw: env.TRUE,
    })
  }

  let createElement = function (node, isComponent) {

    let hooks = { }, attributes = { }, directives = { }, styles, component

    let data = {
      hook: hooks,
    }

    if (isComponent) {
      component = [ ]
    }
    else {
      array.each(
        node.attributes,
        function (node) {
          let { name, value } = node
          if (name === 'style') {
            let list = string.parse(value, char.CHAR_SEMCOL, char.CHAR_COLON)
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
            attributes[ name ] = node
            let attrs = data.attrs || (data.attrs = { })
            attrs[ name ] = value
          }
        }
      )
    }

    array.each(
      node.directives,
      function (node) {
        let { name, modifier } = node
        if (name === viewSyntax.KEYWORD_UNIQUE) {
          data.key = node.value
        }
        else {
          let key = name
          if (modifier) {
            key = `${name}${char.CHAR_DOT}${modifier}`
          }
          if (!directives[ key ]) {
            directives[ key ] = node
          }
        }
      }
    )

    if (styles) {
      data.style = styles
    }

    let upsert = function (oldVnode, vnode) {

      // 如果只有 oldVnode，且 oldVnode 没有 directives，表示插入
      // 如果只有 oldVnode，且 oldVnode 有 directives，表示销毁
      // 如果有 oldVnode 和 vnode，表示更新

      let nextVnode = vnode || oldVnode

      // 数据要挂在元素上，vnode 非常不稳定，内部很可能新建了一个对象
      let $data = oldVnode.el.$data || (oldVnode.el.$data = { })

      let oldDestroies = $data.destroies || { }
      let oldDirectives = $data.directives
      let oldComponent = $data.component

      if (oldComponent) {
        component = oldComponent
        if (is.object(component)) {
          component.set(
            array.toObject(node.attributes, 'name', 'value'),
            env.TRUE
          )
        }
      }
      else if (component) {
        instance.component(
          node.name,
          function (options) {
            if (is.array(component)) {
              oldComponent = component
              component = instance.create(
                options,
                {
                  el: nextVnode.el,
                  props: array.toObject(node.attributes, 'name', 'value'),
                  replace: env.TRUE,
                }
              )
              $data.component = component
              array.each(
                oldComponent,
                function (callback) {
                  callback(component)
                }
              )
            }
          }
        )
      }


      let bind = function (key) {
        let node = directives[ key ]
        let directive = instance.directive(node.name)
        if (directive) {
          return directive({
            el: nextVnode.el,
            node,
            instance,
            directives,
            attributes,
            component,
          })
        }
      }

      object.each(
        directives,
        function (directive, key) {
          if (vnode && oldDirectives) {
            let oldDirective = oldDirectives[ key ]
            if (oldDirective) {
              if (oldDirective.value !== directive.value) {
                if (oldDestroies[ key ]) {
                  oldDestroies[ key ]()
                }
                oldDestroies[ key ] = bind(key)
              }
              return
            }
          }
          oldDestroies[ key ] = bind(key)
        }
      )

      if (oldDirectives) {
        object.each(
          oldDirectives,
          function (oldDirective, key) {
            if (oldDestroies[ key ] && (!vnode || !directives[ key ])) {
              oldDestroies[ key ]()
              delete oldDestroies[ key ]
            }
          }
        )
        // 元素被销毁
        if (!vnode) {
          oldVnode.el.$data = env.NULL
        }
      }


      $data.attributes = attributes
      $data.directives = directives
      $data.destroies = oldDestroies

      hooks.insert =
      hooks.postpatch =
      hooks.destroy = env.noop

    }

    hooks.insert =
    hooks.postpatch =
    hooks.destroy = upsert

    return h(
      isComponent ? 'div' : node.name,
      data,
      node.children.map(
        function (child) {
          return (child instanceof Vnode) ? child : toString(child)
        }
      )
    )

  }

  let importTemplate = function (name) {
    return instance.partial(name)
  }

  return viewEnginer.render(ast, createText, createElement, importTemplate, context)

}
