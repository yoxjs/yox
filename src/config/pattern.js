
/**
 * 组件名称 - 包含大写字母或连字符
 *
 * @type {RegExp}
 */
export const componentName = /[-A-Z]/

/**
 * html 标签
 *
 * @type {RegExp}
 */
export const tag = /<[^>]+>/

/**
 * 自闭合的标签
 *
 * @type {RegExp}
 */
export const selfClosingTagName = /input|img|br/i
