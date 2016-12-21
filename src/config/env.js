
/**
 * 为了压缩，定义的常量
 *
 * @type {boolean}
 */
export const TRUE = true
export const FALSE = false
export const NULL = null
export const UNDEFINED = undefined

export const THIS = '$this'

/**
 * 浏览器环境下的 window 对象
 *
 * @type {?Window}
 */
export const win = typeof window !== 'undefined' ? window : NULL

/**
 * 浏览器环境下的 document 对象
 *
 * @type {?Document}
 */
export const doc = typeof document !== 'undefined' ? document : NULL
