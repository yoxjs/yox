
import * as env from '../config/env'
import nextTick from '../function/nextTick'

import * as array from './array'

let currentTasks, nextTasks = [ ]

/**
 * 添加异步任务
 *
 * @param {Function} task
 */
export function add(task) {
  if (!nextTasks.length) {
    nextTick(run)
  }
  nextTasks.push(task)
}

/**
 * 立即执行已添加的任务
 */
export function run() {
  currentTasks = nextTasks
  nextTasks = [ ]
  array.each(
    currentTasks,
    function (task) {
      task()
    }
  )
  currentTasks = env.NULL
}
