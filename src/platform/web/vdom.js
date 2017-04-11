
import * as snabbdom from 'yox-snabbdom'

import Vnode from 'yox-snabbdom/Vnode'
import attrs from 'yox-snabbdom/modules/attrs'
import props from 'yox-snabbdom/modules/props'
import style from 'yox-snabbdom/modules/style'

import execute from 'yox-common/function/execute'
import toString from 'yox-common/function/toString'

import * as char from 'yox-common/util/char'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'

import compileTemplate from 'yox-template-compiler/compile'
import renderTemplate from 'yox-template-compiler/render'
import * as templateSyntax from 'yox-template-compiler/src/syntax'

import api from './api'

export const patch = snabbdom.init([ attrs, props, style ], api)

export function create(ast, context, instance) {

  let createComment = function (content) {
    return new Vnode({
      sel: Vnode.SEL_COMMENT,
      text: content,
    })
  }

  let createElement = function (node, isComponent) {

    let hooks = { }, attributes = { }, directives = { }, styles, component

    let data = {
      hooks,
      props: node.properties,
    }

    let vnode = {
      data,
      sel: node.name,
      children: node.children.map(
        function (child) {
          return child instanceof Vnode
            ? child
            : new Vnode({ text: toString(child) })
        }
      )
    }

    if (!isComponent) {
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
        if (name === templateSyntax.KEYWORD_UNIQUE) {
          vnode.key = node.value
        }
        if (name === templateSyntax.KEYWORD_STATIC) {
          vnode.static = env.TRUE
        }
        else {
          name = modifier
            ? `${name}${char.CHAR_DOT}${modifier}`
            : name
          if (!directives[ name ]) {
            directives[ name ] = node
          }
        }
      }
    )

    if (styles) {
      data.style = styles
    }

    hooks.insert =
    hooks.postpatch =
    hooks.destroy = function (oldVnode, vnode) {

      // 如果只有 oldVnode，且 oldVnode 没有 directives，表示插入
      // 如果只有 oldVnode，且 oldVnode 有 directives，表示销毁
      // 如果有 oldVnode 和 vnode，表示更新

      // 获取 el 直接用 oldVnode.el 即可
      // 插入和销毁时，只有 oldVnode
      // 更新时，vnode.el 是从 oldVnode.el 赋值过来的

      let payload = oldVnode.payload || (oldVnode.payload = { })
      if (vnode) {
        vnode.payload = payload
      }

      let destroies = payload.destroies || (payload.destroies = { })

      let oldComponent = payload.component
      let oldDirectives = payload.directives

      let oldValue = payload.value
      let newValue = payload.value = instance.get(node.keypath)

      if (oldComponent) {
        component = oldComponent
        if (is.object(component)) {
          // 更新
          if (vnode) {
            component.set(
              array.toObject(node.attributes, 'name', 'value'),
              env.TRUE
            )
          }
          // 销毁
          else {
            component.destroy(env.TRUE)
          }
        }
      }
      // 创建
      else if (isComponent) {
        component = payload.component = [ ]
        instance.component(
          node.name,
          function (options) {
            if (is.array(component)) {
              oldComponent = component
              component = payload.component =
              instance.create(
                options,
                {
                  el: oldVnode.el,
                  props: array.toObject(node.attributes, 'name', 'value'),
                  replace: env.TRUE,
                }
              )
              oldVnode.el = component.$el;
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
        destroies[ key ] = execute(
          instance.directive(node.name),
          env.NULL,
          {
            el: oldVnode.el,
            node,
            instance,
            directives,
            attributes,
            component,
          }
        )
      }

      let unbind = function (key) {
        if (destroies[ key ]) {
          destroies[ key ]()
          delete destroies[ key ]
        }
      }

      object.each(
        directives,
        function (directive, key) {
          if (oldDirectives) {
            let oldDirective = oldDirectives[ key ]
            if (vnode) {
              // 更新
              if (oldDirective) {
                if (oldDirective.value !== directive.value
                  || oldValue !== newValue
                ) {
                  if (destroies[ key ]) {
                    destroies[ key ]()
                  }
                  bind(key)
                }
                return
              }
            }
            // 销毁
            else if (oldDirective) {
              unbind(key)
              return
            }
          }
          // 创建
          bind(key)
        }
      )

      if (oldDirectives) {
        object.each(
          oldDirectives,
          function (oldDirective, key) {
            if (!vnode || !directives[ key ]) {
              unbind(key)
            }
          }
        )
      }

      payload.attributes = attributes
      payload.directives = directives

    }

    return new Vnode(vnode)

  }

  let importTemplate = function (name) {
    let partial = instance.partial(name)
    return is.string(partial)
      ? compileTemplate(partial)
      : partial
  }

  return renderTemplate(ast, createComment, createElement, importTemplate, context)

}
