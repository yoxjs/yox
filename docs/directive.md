
## 内置指令

Yox 只有两个内置指令，如下：

* 事件监听：参考 **事件处理**
* 双向绑定：参考 **双向绑定**


## 自定义指令

如果内置指令不满足需求，Yox 还支持自定义指令，它的前缀是 `o-`，如下：

```html
<div o-[name]="[value]"></div>
```

为了实现更高级的功能，自定义指令还支持 `修饰符`，如下：

```html
<div o-[name].[modifier]="[value]"></div>
```

> 用 o 开头是因为 `o-` 有点像刀柄，蜜汁决策...

### 指令名称

`o-[name]` 中的 `name` 会经过 `camelize` 处理，也就是说，不论 `name` 怎么写，最终都不会是 `连字符` 格式。

```html
<div o-stand-up="value" o-get-out="value"></div>
```

这两个自定义指令的名称分别是 `standUp` 和  `getOut`，注册指令时，千万别写错了哦。

### 指令修饰符

修饰符是专门为复杂指令设计的特性，它的格式有些类似事件指令的 `命名空间`，如下：

```html
<div o-[name].[modifier]="[value]"></div>
```

> 不论内置指令还是自定义指令，它的格式都是 `name.modifier`，只是在事件指令中，把 `modifier` 叫作命名空间更符合大部分人的认知。

如果你写了修饰符，`[modifier]` 会设置到指令对象的 `modifier` 属性上；如果没有写修饰符，那么 `modifier` 属性将是 `undefined`。

为了方便理解，我们特地准备了一个在线示例：[传送门](http://jsrun.pro/8jyKp/edit)。


### 钩子函数

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

#### node

`node` 参数表示指令的宿主节点，它可以是 `元素节点`，如下：

```html
<div o-custom="value"></div>
```

也可以是 `组件节点`，如下：

```html
<Component o-custom="value" />
```

判断方式非常简单，如下：

```js
if (vnode.isComponent) {
  // node 是一个 Yox 实例
}
else {
  // node 是一个 DOM 元素
}
```

#### vnode

`vnode` 是 `virtual dom` 节点，它记录着节点的完整信息。

开发自定义指令，我们需要了解的有以下几个属性：

* `isComponent`: 是否是组件节点
* `context`: 渲染节点的上下文环境，这是一个 `Yox` 实例
* `lazy`: 参考 **Lazy** - **自定义指令**
* `data`: `vnode` 生命周期内读写自定义数据的容器

#### directive

`directive` 记录着指令的完整信息。

##### ns

`ns` 是指令的命名空间，对于自定义指令来说，这个值始终是 `o`。

> 因为自定义的前缀是 `o-`

##### name

对于自定义指令来说，这个值是 `o-[name]="[value]"` 中的 `name`。

##### key

`key` 是 `节点` 级别每个指令的 `unique key`。

我们可以通过 `key` 在 `vnode.data` 上设置指令的数据，比如解绑事件需要的 `event handler`。

##### modifier

对于自定义指令来说，这个值是 `o-[name].[modifier]="[value]"` 中的 `modifier`，如果没写修饰符，它的值是 `undefined`。

##### value

`value` 是指令值的 `字面量`，如果是基本类型的字面量，Yox 会自动转型，举例如下：

* `o-custom="1"`: `value` 是基本类型，自动转型为 `1`
* `o-custom="true"`: `value` 是基本类型，自动转型为 `true`
* `o-custom="'1'"`: `value` 是基本类型，自动转型为 `"1"`
* `o-custom="name"`: `value` 不是基本类型（标识符），输出为字符串 `"name"`
* `o-custom="{ name: 'yox' }"`: `value` 不是基本类型（对象），输出为字符串 `"{ name: 'yox' }"`

##### getter

如果 `value` 是一个合法表达式，且 `不是` 基本类型的字面量，Yox 会把它编译成 `getter` 函数，如下：

```html
<div o-custom="a + b"></div>
```

为表达式求值非常简单，如下：

```js
var value = directive.getter()
```

##### handler

如果 `value` 是一个合法表达式，且是一个 `函数调用`，比如常见的 `on-click="submit()"`，Yox 会把它编译成 `handler` 函数，你需要做的就是在合适的时机调用它。

需要注意，指令只能调用 Yox 组件的实例方法，比如 `methods` 注册的业务方法，或是 Yox 内置的实例方法，常见的有 `set`、`fire`、`toggle` 等。

### 全局注册

通用性较强的指令，建议全局注册，如下：

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

### 本地注册

通用性不强的指令，建议本地注册，如下：

```js
{
  directives: {
    name: directive
  }
}
```

### 示例

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
      'click',
      vnode.data[directive.key]
    )
  }
})
```

```html
<div o-log="{name: 'yox'}"></div>
```



