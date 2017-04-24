
import * as snabbdom from 'yox-snabbdom'

import Vnode from 'yox-snabbdom/Vnode'
import attrs from 'yox-snabbdom/modules/attrs'
import props from 'yox-snabbdom/modules/props'
import directives from 'yox-snabbdom/modules/directives'
import component from 'yox-snabbdom/modules/component'

import * as is from 'yox-common/util/is'
import * as env from 'yox-common/util/env'

import * as templateNodeType from 'yox-template-compiler/src/nodeType'
import compileTemplate from 'yox-template-compiler/compile'
import renderTemplate from 'yox-template-compiler/render'

import api from './api'

export const patch = snabbdom.init([ component, attrs, props, directives ], api)

export function create(ast, context, instance, addDep) {

  let createElementVnode = function (source, output) {

    let hooks = { },
      data = { instance, hooks, attrs: output.attrs, directives: output.directives },
      sourceChildren = source.children,
      outputChildren = output.children

    if (sourceChildren && sourceChildren.length === 1) {
      let child = sourceChildren[ 0 ]
      if (child.type === templateNodeType.EXPRESSION
        && child.safe === env.FALSE
      ) {
        data.props = {
          innerHTML: outputChildren[ 0 ].text,
        }
        outputChildren = env.NULL
      }
    }

    return snabbdom.createElementVnode(
      output.name,
      data,
      outputChildren,
      output.key,
      output.component
    )

  }

  let importTemplate = function (name) {
    let partial = instance.partial(name)
    return is.string(partial)
      ? compileTemplate(partial)
      : partial
  }

  return renderTemplate(ast, snabbdom.createCommentVnode, createElementVnode, importTemplate, addDep, context)

}
