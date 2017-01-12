
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

  let createComment = function () {
    return new Vnode({
      sel: '!',
    })
  }

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
          data.key = node.value
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

      if (oldComponent) {
        component = oldComponent
        if (is.object(component)) {
          component.set(
            array.toObject(node.attributes, 'name', 'value'),
            env.TRUE
          )
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
        return execute(
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

      object.each(
        directives,
        function (directive, key) {
          if (vnode && oldDirectives) {
            let oldDirective = oldDirectives[ key ]
            if (oldDirective) {
              if (oldDirective.value !== directive.value) {
                if (destroies[ key ]) {
                  destroies[ key ]()
                }
                destroies[ key ] = bind(key)
              }
              return
            }
          }
          destroies[ key ] = bind(key)
        }
      )

      if (oldDirectives) {
        object.each(
          oldDirectives,
          function (oldDirective, key) {
            if (destroies[ key ] && (!vnode || !directives[ key ])) {
              destroies[ key ]()
              delete destroies[ key ]
            }
          }
        )
      }

      payload.attributes = attributes
      payload.directives = directives

      hooks.insert =
      hooks.postpatch =
      hooks.destroy = env.noop

    }

    return h(
      isComponent ? 'div' : node.name,
      data,
      node.children.map(
        function (child) {
          return child instanceof Vnode
            ? child
            : toString(child)
        }
      )
    )

  }

  let importTemplate = function (name) {
    return instance.partial(name)
  }

  return viewEnginer.render(ast, createComment, createText, createElement, importTemplate, context)

}
