
/**
 * 组件实例的私有方法
 * 不暴露给外部
 */

import * as env from '../config/env'

import * as is from './is'
import * as array from './array'
import * as object from './object'
import * as nextTask from './nextTask'

export function testKeypath(instance, keypath, name) {

  let terms = keypath ? keypath.split('.') : [ ]
  if (!name) {
    name = terms.pop()
  }

  let data = instance.$data, result

  do {
    terms.push(name)
    keypath = terms.join('.')
    result = object.get(data, keypath)
    if (result) {
      return {
        keypath,
        value: result.value,
      }
    }
    terms.splice(-2)
  }
  while (terms.length || keypath.indexOf('.') > 0)

}

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

export function updateView(instance, immediate) {
  if (immediate) {
    instance.updateView()
  }
  else if (!instance.$syncing) {
    instance.$syncing = env.TRUE
    nextTask.add(
      function () {
        delete instance.$syncing
        instance.updateView()
      }
    )
  }
  delete instance.$dirty
}

export function diff(instance, changes) {

  if (!is.object(changes)) {
    changes = { }
  }

  let {
    $watchCache,
    $watchEmitter,
  } = instance

  object.each(
    $watchCache,
    function (oldValue, key) {
      let newValue = instance.get(key)
      if (newValue !== oldValue) {
        $watchCache[key] = newValue
        if (!object.has(changes, key)) {
          changes[key] = [ newValue, oldValue, key ]
        }
      }
    }
  )

  object.each(
    changes,
    function (args, key) {
      $watchEmitter.fire(key, args, instance)
    }
  )

  return changes

}
