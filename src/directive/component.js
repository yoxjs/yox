
import * as env from '../config/env'
import * as is from '../util/is'
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
      let value = node.getValue()
      props[node.name] = value
      if (!is.primitive(value)) {
        object.extend(propDeps, node.deps)
      }
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
    let component = instance.create(
      options,
      {
        el,
        props,
        replace: env.TRUE,
      }
    )
    component.$propDeps = propDeps

    // 父级无法判断子组件对引用数据的依赖
    instance.watch(
      '*',
      function (newValue, oldValue, keypath) {
        if (
          component.$propDeps.some(
            function (dep) {
              return keypath.startsWith(dep)
            }
          )
        ) {
          if (!component.$diffing) {
            component.$diffing = env.TRUE
            instance.nextTick(
              function () {
                delete component.$diffing
                component.diff()
              }
            )
          }
        }
      }
    )

    el.$component = component
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
