
/**
 * 组件实例的私有方法
 * 不暴露给外部
 */

import validateProps from '../function/validate'

import * as env from '../config/env'

import * as is from './is'
import * as array from './array'
import * as object from './object'
import * as logger from './logger'
import * as nextTask from './nextTask'

export function updateDeps(instance, newDeps, oldDeps, watcher) {

  let addedDeps, removedDeps
  if (is.array(oldDeps)) {
    addedDeps = array.diff(oldDeps, newDeps)
    removedDeps = array.diff(newDeps, oldDeps)
  }
  else {
    addedDeps = newDeps
  }

  array.each(
    addedDeps,
    function (keypath) {
      instance.watch(keypath, watcher)
    }
  )

  if (removedDeps) {
    array.each(
      removedDeps,
      function (dep) {
        instance.$watchEmitter.off(dep, watcher)
      }
    )
  }

}

export function refresh(instance, immediate) {
  if (immediate) {
    diff(instance)
  }
  else if (!instance.$diffing) {
    instance.$diffing = env.TRUE
    nextTask.add(
      function () {
        delete instance.$diffing
        diff(instance)
      }
    )
  }
}

function diff(instance) {

  let {
    $children,
    $watchCache,
    $watchEmitter,
    $computedDeps,
  } = instance

  // 排序，把依赖最少的放前面
  let keys = [ ]
  let addKey = function (key, push) {
    if (!array.has(keys, key)) {
      if (push) {
        keys.push(key)
      }
      else {
        keys.unshift(key)
      }
    }
  }

  let pickDeps = function (key) {
    if ($computedDeps && !array.falsy($computedDeps[key])) {
      array.each(
        $computedDeps[key],
        pickDeps
      )
      addKey(key, env.TRUE)
    }
    else {
      addKey(key)
    }
  }

  object.each(
    $watchCache,
    function (value, key) {
      pickDeps(key)
    }
  )

  let changes = { }

  array.each(
    keys,
    function (key) {
      let oldValue = $watchCache[key]
      let newValue = instance.get(key)
      if (newValue !== oldValue) {
        $watchCache[key] = newValue
        $watchEmitter.fire(key, [ newValue, oldValue, key ], instance)
      }
    }
  )

  let {
    $dirty,
    $dirtyIgnore,
  } = instance

  if ($dirty) {
    delete instance.$dirty
  }
  if ($dirtyIgnore) {
    delete instance.$dirtyIgnore
    return
  }

  if ($dirty) {
    instance.updateView()
  }
  else if ($children) {
    array.each(
      $children,
      function (child) {
        diff(child)
      }
    )
  }

}

export function validate(props, schema) {
  return validateProps(
    props,
    schema,
    function (key) {
      logger.warn(`${key} is not matched.`)
    },
    function (key) {
      logger.warn(`${key} is not found.`)
    }
  )
}
