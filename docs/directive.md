
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

```js
// 全局注册
Yox.directive({
  standUp: function (node, directive) {

  },
  getOut: function (node, directive) {

  }
})
```

### 指令修饰符

修饰符是专门为复杂指令设计的特性，它的格式有些类似事件指令的 `命名空间`，如下：

```html
<div o-[name].[modifier]="[value]"></div>
```

> 不论内置指令还是自定义指令，它的格式都是 `name.modifier`，只是在事件指令中，把 `modifier` 叫作命名空间更符合大部分人的认知。

如果你写了修饰符，`[modifier]` 会设置到指令对象的 `modifier` 属性上；如果没有写修饰符，那么 `modifier` 属性将是 `undefined`。

为了方便理解，我们特地准备了一个在线示例：[传送门](http://jsrun.net/8jyKp/edit)。


### 钩子函数

Yox 的指令是一个函数，如下：

```js
function (node, directive) {
  // vnode 创建时调用
  return {
    afterMount: function (directive) {
      // 可选，vnode 挂载 DOM 树之后触发
    },
    beforeUpdate: function (directive) {
      // 可选，vnode 更新之前触发
    },
    afterUpdate: function (directive) {
      // 可选，vnode 更新之后触发
    },
    beforeDestroy: function (directive) {
      // 可选，vnode 卸载之前触发
    },
  }
}

#### node

`node` 参数表示指令的宿主元素。

#### directive

`directive` 记录着指令的完整信息。

##### ns

`ns` 是指令的命名空间，对于自定义指令来说，这个值始终是 `o`。

> 因为自定义的前缀是 `o-`

##### name

对于自定义指令来说，这个值是 `o-[name]="[value]"` 中的 `name`。

##### modifier

对于自定义指令来说，这个值是 `o-[name].[modifier]="[value]"` 中的 `modifier`，如果没写修饰符，它的值是 `undefined`。

##### value

`value` 是指令值，如果是基本类型的字面量，Yox 会自动转型，举例如下：

* `o-custom="1"`: `value` 是基本类型，自动转型为 `1`
* `o-custom="true"`: `value` 是基本类型，自动转型为 `true`
* `o-custom="'1'"`: `value` 是基本类型，自动转型为 `"1"`
* `o-custom="name"`: `value` 不是基本类型，输出为变量 `name` 的值
* `o-custom="{ name: 'yox' }"`: `value` 不是基本类型，输出为对象 `{ name: 'yox' }`

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
Yox.directive(
  'log',
  function (node, directive) {

    // 调用取值函数获取表达式的值
    var value = directive.value

    var listener = function () {
      // 向服务器发送 value
    }

    // 绑定点击事件
    Yox.dom.on(node, 'click', listener)

    return {
      afterUpdate: function (directive) {
        value = directive.value
      },
      beforeDestroy: function () {
        Yox.dom.off(node, 'click', listener)
      }
    }
  }
})
```

```html
<div o-log="{name: 'yox'}"></div>
```



