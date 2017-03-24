
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

import * as viewEnginer from 'yox-template-compiler'
import * as viewSyntax from 'yox-template-compiler/src/syntax'

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
      hook: hooks,
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
        if (name === viewSyntax.KEYWORD_UNIQUE) {
          vnode.key = node.value
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

      let nextVnode = vnode || oldVnode

      let payload = oldVnode.payload || (oldVnode.payload = { })
      let destroies = payload.destroies || (payload.destroies = { })

      let oldComponent = payload.component
      let oldDirectives = payload.directives

      let oldValue = payload.value
      let newValue = payload.value = instance.get(node.keypath)

      if (oldComponent) {
        component = oldComponent
        if (is.object(component)) {
          if (vnode) {
            component.set(
              array.toObject(node.attributes, 'name', 'value'),
              env.TRUE
            )
          }
          else {
            component.destroy(env.TRUE)
          }
        }
      }
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
                  el: nextVnode.el,
                  props: array.toObject(node.attributes, 'name', 'value'),
                  replace: env.TRUE,
                }
              )
              nextVnode.el = component.$el;
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
            el: nextVnode.el,
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
          // 新增
          bind(key)
        }
      )

      if (oldDirectives) {
        object.each(
          oldDirectives,
          function (oldDirective, key) {
            // 删掉元素或者删掉指令都要销毁指令
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
    return instance.partial(name)
  }

  return viewEnginer.render(ast, createComment, createElement, importTemplate, context)

}
