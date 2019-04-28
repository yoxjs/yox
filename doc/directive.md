如果内置指令不满足需求，Yox 还支持自定义指令，它的前缀是 `o-`，如下：

```html
<div o-[name]="value"></div>
```

## 名称格式

`o-[name]` 中的 `name` 会经过 `camelize` 处理，也就是说，不论 `name` 怎么写，最终都不会是 `连字符` 格式。

```html
<div o-stand-up="value" o-get-out="value"></div>
```

这两个自定义指令的名称分别是 `standUp` 和  `getOut`，注册指令时，千万别写错了哦。


## 钩子函数

Yox 的指令是一个由两个钩子函数组成的对象，如下：

```js
{
  bind: function (node, directive, vnode) {

    // 当指令写在组件上，isComponent 为 true
    // 比如 <Dog o-x="x" />
    if (vnode.isComponent) {
      // node 是一个 Yox 实例
    }
    else {
      // node 是一个 DOM 元素
    }

    // 如果指令需要销毁，比如绑定了事件
    // 需要在 vnode.data[directive.key] 上设置销毁用到的数据
    // 或者简单一些，直接设置一个销毁函数
    vnode.data[directive.key] = function () {
      // 销毁逻辑
    }

  },
  // 如果指令不用销毁，可省略 unbind
  unbind: function (node, directive, vnode) {
    // 执行销毁
    vnode.data[directive.key]()
  }
}
```

### node

`node` 参数表示指令的宿主节点，它可以是 `元素节点`，如下：

```html
<div o-custom="value"></div>
```

也可以是 `组件节点`，如下：

```html
<Component o-custom="value" />
```

判断方式如下：

```js
if (vnode.isComponent) {
  // 组件节点
}
else {
  // 元素节点
}
```

### vnode

`vnode` 是 `virtual dom` 节点，它记录着节点的完整信息。

开发自定义指令，我们需要了解的有以下几个属性：

* `isComponent`: 是否是组件节点
* `context`: 渲染节点的上下文环境，这是一个 `Yox` 实例
* `lazy`: 节点上设置的 `lazy`，这是一个 `Object`
* `data`: `vnode` 生命周期内读写自定义数据的容器

### directive

`directive` 记录着指令的完整信息。

#### ns

`ns` 是指令的命名空间，对于自定义指令来说，这个值始终是 `o`。

> 因为自定义的前缀是 `o-`

#### name

对于自定义指令来说，这个值是 `o-[name]="xx"` 中的 `name`。

#### key

`key` 是 `节点` 级别每个指令的 `unique key`，它的格式为 `[ns].[name]`。

我们可以通过 `key` 在 `vnode.data` 上设置指令的数据，比如解绑事件需要的 `event handler`。

#### value

`value` 是指令值的 `字面量`，如果是基本类型的字面量，Yox 会自动转型，举例如下：

* `o-custom="1"`: `value` 是基本类型，自动转型为 `1`
* `o-custom="true"`: `value` 是基本类型，自动转型为 `true`
* `o-custom="'1'"`: `value` 是基本类型，自动转型为 `'1'`
* `o-custom="name"`: `value` 不是基本类型（标识符），输出为字符串 `"name"`
* `o-custom="{ name: 'yox' }"`: `value` 不是基本类型（对象），输出为字符串 `"{ name: 'yox' }"`

#### getter

如果指令的值 `不是` 基本类型的字面量，Yox 会把它编译成 `getter` 函数，取值非常简单，如下：

```js
var value = directive.getter()
```

#### handler

如果指令的值是 `调用函数` 的形式，比如常见的 `on-click="submit()"`，Yox 会把它编译成 `handler` 函数，你需要做的就是在合适的时机调用它。

注意，只能调用 `methods` 中定义的方法。

## 注册

对于通用性较强的指令，建议全局注册，如下：

```js
// 单个注册
Yox.directive('name', directive)

// 批量注册
Yox.directive({
  name1: directive1,
  name2: directive2,
  ...
})
```

对于通用性不强的指令，建议本地注册，如下：

```js
{
  directives: {
    name: directive
  }
}
```

## 例子

下面实现一个发送点击日志的例子。

```js
Yox.directive('log', {
  bind: function (node, directive, vnode) {

    // 调用取值函数获取表达式的值
    var value = directive.getter()

    var listener = function () {
      // 向服务器发送 value
    }

    // 绑定点击事件
    Yox.dom.on(node, 'click', listener)

    // 记录当前的事件处理函数，便于 unbind 钩子解绑事件
    vnode.data[directive.key] = listener

  },
  unbind: function (node, directive, vnode) {
    Yox.dom.off(
      node,
      vnode.data[directive.key]
    )
  }
})
```

```html
<div o-log="{id: 'xx'}"></div>
```



