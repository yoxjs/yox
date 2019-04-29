
## Yox.dom

### createElement

* 签名: `(tag: string, isSvg?: boolean): Element`

* 用法: 创建一个元素节点。

### createText

* 签名: `(text: string): Text`
* 用法: 创建一个文本节点。

### createComment

* 签名: `(text: string): Comment`
* 用法: 创建一个注释节点。

### prop

* 签名: `(node: HTMLElement, name: string, value?: string | number | boolean): string | number | boolean | void`
* 用法: 读取或设置元素的 `property`。

### removeProp

* 签名: `(node: HTMLElement, name: string): void`
* 用法: 移除元素的 `property`。

### attr

* 签名: `(node: HTMLElement, name: string, value?: string): string | void`
* 用法: 读取或设置元素的 `attribute`。

### removeAttr

* 签名: `(node: HTMLElement, name: string): void`
* 用法: 移除元素的 `attribute`。

### before

* 签名: `(parentNode: Node, node: Node, referenceNode: Node): void`
* 用法: 在 `referenceNode` 前面插入 `node`。

### append

* 签名: `(parentNode: Node, node: Node): void`
* 用法: 在 `parentNode` 尾部添加 `node`。

### replace

* 签名: `(parentNode: Node, node: Node, oldNode: Node): void`
* 用法: 把 `oldNode` 替换为 `node`。

### remove

* 签名: `(parentNode: Node, node: Node): void`
* 用法: 移除 `node`。

### parent

* 签名: `(node: Node): Node | void`
* 用法: 获取 `node` 的父节点。

### next

* 签名: `(node: Node): Node | void`
* 用法: 获取 `node` 的右侧相邻节点。

### find

* 签名: `(selector: string): Element | void`
* 用法: 全局查找元素。

> 对低版本 IE 来说，`selector` 仅限 `#id` 格式

### tag

* 签名: `(node: Node): string | void`
* 用法: 获取 `node` 的标签名称的小写形式。

### text

* 签名: `(node: Node, text?: string, isStyle?: boolean): string | void`
* 用法: 获取或设置节点的文本内容。

### html

* 签名: `(node: Element, html?: string, isStyle?: boolean): string | void`
* 用法: 获取或设置元素节点的 `html` 内容。

### addClass

* 签名: `(node: HTMLElement, className: string): void`
* 用法: 给元素添加 `class`。

### removeClass

* 签名: `(node: HTMLElement, className: string): void`
* 用法: 删除元素的 `class`。

### on

* 签名: `(node: HTMLElement, type: string, listener: type.nativeEventListener, context?: any): void`
* 用法: 绑定事件。

### off

* 签名: `(node: HTMLElement, type: string, listener: type.nativeEventListener): void`
* 用法: 解绑事件。
