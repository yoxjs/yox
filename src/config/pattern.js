
/**
 * 组件名称 - 包含大写字母或连字符
 *
 * @type {RegExp}
 */
export let componentName = /[-A-Z]/

/**
 * html 标签
 *
 * @type {RegExp}
 */
export let tag = /<[^>]+>/

/**
 * 自闭合的标签
 *
 * @type {RegExp}
 */
export let selfClosingTagName = /input|img|br/i
