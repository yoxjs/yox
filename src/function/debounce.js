
import * as env from '../config/env'
import * as array from '../util/array'

/**
 * 节流调用
 *
 * @param {Function} fn 需要节制调用的函数
 * @param {number=} delay 调用的时间间隔，默认 50ms
 * @param {boolean=} lazy 是否在最后调用
 * @return {Function}
 */
export default function (fn, delay, lazy) {

  let prevTime, timer

  function createTimer(args) {
    timer = setTimeout(
      function () {
        timer = env.NULL
        prevTime = Date.now()
        fn.apply(env.NULL, array.toArray(args))
      },
      delay
    )
  }

  return function () {

    if (lazy
      && prevTime > 0
      && Date.now() - prevTime < delay
    ) {
      clearTimeout(timer)
      timer = env.NULL
    }

    if (!timer) {
      createTimer(arguments)
    }

  }
}
