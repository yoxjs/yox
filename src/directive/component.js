
import * as env from '../config/env'
import * as array from '../util/array'
import * as object from '../util/object'
import * as validator from '../util/validator'

function getComponentInfo(node, instance) {
  let { component, attrs } = node
  let options = instance.component(component)
  let props = { }, propDeps = { }
  array.each(
    attrs,
    function (node) {
      props[node.name] = node.getValue()
      object.extend(propDeps, node.deps)
    }
  )
  if (object.has(options, 'propTypes')) {
    validator.validate(props, options.propTypes)
  }
  return {
    options,
    props,
    propDeps: object.keys(propDeps),
  }
}

export default {

  attach: function ({ el, node, instance }) {
    let { options, props, propDeps } = getComponentInfo(node, instance)
    el.$component = instance.create(
      options,
      {
        el,
        props,
        replace: env.TRUE,
        extensions: {
          $propDeps: propDeps,
        }
      }
    )
  },

  update: function ({ el, node, instance}) {
    let { props, propDeps } = getComponentInfo(node, instance)
    let { $component } = el
    $component.$propDeps = propDeps
    $component.$sync = env.TRUE
    $component.set(props)
    delete $component.$sync
  },

  detach: function ({ el }) {
    el.$component.destroy(env.TRUE)
    el.$component = env.NULL
  }

}
