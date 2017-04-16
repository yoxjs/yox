
import * as snabbdom from 'yox-snabbdom'

import Vnode from 'yox-snabbdom/Vnode'
import attrs from 'yox-snabbdom/modules/attrs'
import props from 'yox-snabbdom/modules/props'

import execute from 'yox-common/function/execute'
import toString from 'yox-common/function/toString'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'
import * as char from 'yox-common/util/char'
import * as array from 'yox-common/util/array'
import * as object from 'yox-common/util/object'
import * as string from 'yox-common/util/string'
import * as keypathUtil from 'yox-common/util/keypath'

import * as templateSyntax from 'yox-template-compiler/src/syntax'
import * as templateNodeType from 'yox-template-compiler/src/nodeType'
import compileTemplate from 'yox-template-compiler/compile'
import renderTemplate from 'yox-template-compiler/render'

import api from './api'

export const patch = snabbdom.init([ attrs, props ], api)

export function create(ast, context, instance) {

  let createComment = function (content) {
    return new Vnode({
      sel: Vnode.SEL_COMMENT,
      text: content,
    })
  }

  let createElement = function (output, source, trackBy) {

    let hooks = { },
      attributes = { },
      directives = { },
      data = { hooks },
      isComponent = source.component,
      sourceChildren = source.children,
      outputChildren = output.children,
      outputAttributes = output.attributes

    if (sourceChildren && sourceChildren.length === 1) {
      let child = sourceChildren[ 0 ]
      if (child.type === templateNodeType.EXPRESSION
        && child.safe === env.FALSE
      ) {
        data.props = {
          innerHTML: outputChildren[ 0 ],
        }
        outputChildren.length = 0
      }
    }

    let vnode = {
      data,
      sel: output.name,
      key: trackBy,
      children: outputChildren.map(
        function (child) {
          return Vnode.is(child)
            ? child
            : new Vnode({ text: toString(child) })
        }
      )
    }

    let addDirective = function (directive) {
      directives[
        keypathUtil.join(directive.name, directive.modifier)
      ] = directive
    }

    array.each(
      outputAttributes,
      function (node) {
        let { name, value, keypath, bindTo } = node
        if (is.string(bindTo)) {
          addDirective(
            {
              keypath,
              name: templateSyntax.DIRECTIVE_MODEL,
              modifier: name,
              value: bindTo,
              oneway: env.TRUE,
            }
          )
        }
        else if (!isComponent) {
          attributes[ name ] = node
          let attrs = data.attrs || (data.attrs = { })
          attrs[ name ] = value
        }
      }
    )

    array.each(
      output.directives,
      addDirective
    )

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
      let newValue = payload.value = instance.get(output.keypath)

      let component
      if (oldComponent) {
        component = oldComponent
        if (is.object(component)) {
          // 更新
          if (vnode) {
            component.set(
              array.toObject(outputAttributes, 'name', 'value'),
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
          output.name,
          function (options) {
            if (is.array(component)) {
              oldComponent = component
              component = payload.component =
              instance.create(
                options,
                {
                  el: oldVnode.el,
                  props: array.toObject(outputAttributes, 'name', 'value'),
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
