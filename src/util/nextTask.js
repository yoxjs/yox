
import nextTick from '../function/nextTick'

import * as array from './array'

let nextTasks = [ ]

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
  let tasks = nextTasks
  nextTasks = [ ]
  array.each(
    tasks,
    function (task) {
      task()
    }
  )
}
