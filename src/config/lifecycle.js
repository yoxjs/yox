
/**
 * 数据监听、事件监听尚未初始化。
 *
 * @type {string}
 */
export const INIT = 'init'

/**
 * 已创建计算属性，方法，数据监听，事件监听。
 * 但是还没有开始编译模板，$el 还不存在。
 *
 * @type {string}
 */
export const CREATE = 'create'

/**
 * 在模板编译结束后调用。
 *
 * @type {string}
 */
export const COMPILE = 'compile'

/**
 * 组件第一次加入 DOM 树调用。
 *
 * @type {string}
 */
export const ATTACH = 'attach'

/**
 * 数据更新时调用。
 *
 * @type {string}
 */
export const UPDATE = 'update'

/**
 * 组件从 DOM 树移除时调用。
 *
 * @type {string}
 */
export const DETACH = 'detach'
