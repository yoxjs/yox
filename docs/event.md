你可以使用 `on` 指令在 `元素节点` 或 `组件节点` 绑定事件，如下：

```html
<button on-click="submit">
  Submit
</button>
```

事件处理，有以下两种方式：

* 事件转换
* 调用方法

## 事件转换

事件转换，指的是把 `A` 事件转成 `B` 事件，如下：

```html
<button on-click="submit">
  Submit
</button>
```

这里把 `click` 转成 `submit`，为什么要做这种看似多此一举的事呢？

### 语义化

`DOM 事件` 通常没有业务层面的意义，比如 `click` 表示一次点击事件，但你并不知道点击了什么，是确定按钮还是取消按钮呢？

> 如果只知道 `click`，其实意味着你什么都不知道

事件转换意味着 `语义化`，语义化让代码逻辑更加清晰，这一点是显而易见的，比如 `submit` 意味着你可能即将向服务器提交一个请求。

当我们处于一个复杂的组件树中，事件可能从任何子组件（或孙组件）冒泡上来。因此，我们建议事件应该越语义化越好，这样当父组件接收到子组件（或孙组件）发出的事件时，才不会无所适从。

### DOM 事件

在 `元素节点` 上监听事件，`on-[type]` 中 `type` 和 DOM 事件名称完全一致（都是小写形式），如下：

```html
<button on-click="submit">
  Submit
</button>
```

Yox 会把 DOM 事件封装成 `Yox.Event`，因此在事件处理函数中，你能取到 `Yox.Event` 对象。

```js
function (domEvent) {
  this.fire(new Yox.Event('submit', domEvent))
}
```

> `fire(event)` 方法的默认行为是 `向上冒泡`。

DOM 事件转换后的事件名称，只支持以下两种格式：

* 符合变量命名规则，比如 `submit`
* 符合事件命名空间规则，比如 `submit.button`

> 关于事件命名空间，参考 **事件处理** - **事件命名空间**

我们通过一个例子加深印象：

```html
<button
  on-mousedown="mousedown"
  on-mouseup="mouse-up"
  on-mouseover="mouseOver"
  on-click="submit.button"
>
  Submit
</button>
```

Yox 不支持 `mouse-up`，在模板编译阶段就会报错。

### 组件事件

在 `组件节点` 上监听的事件，通常是子组件冒泡上来的事件，如下：

```html
<Button on-click="submit" />
```

Yox 会把子组件冒泡上来的事件封装成新的 `Yox.Event`，如下：

```js
function (event, data) {
  this.fire(new Yox.Event('submit', event), data)
}
```

> `fire(event, data)` 方法的默认行为是 `向上冒泡`。

`Button` 组件冒泡了一个 `click` 事件，父组件监听到 `click` 事件后转换成了 `submit` 事件，此时共有 `两个` 冒泡事件。

> 如果不需要事件冒泡，请调用方法。

子组件冒泡上来的事件名称有四种可能的格式：

* 符合变量命名规则的简单事件，比如 `submit`
* 符合变量命名规则的复杂事件，比如 `userRemove`
* 符合事件命名空间规则的简单事件，比如 `submit.button`
* 符合事件命名空间规则的复杂事件，比如 `userRemove.removeButton`

> 这里的 `简单` 和 `复杂` 仅仅表示事件名称是否包含多个单词

监听组件事件时，`on-[type]` 中的 `type` 会经过 `camelize` 处理，也就是说，连字符格式的事件名称会转成驼峰格式，举个例子：

```html
<Button
  on-user-remove="removeUser()"
/>
```

这里实际监听的是 `userRemove`，而不是 `user-remove`。

> 这样设计的原因是，连字符格式更符合 HTML 的开发习惯，如果你更喜欢使用驼峰格式，也无妨

如果子组件冒泡上来的事件包含命名空间，父组件监听事件时，`on-[type]` 中的 `type` 也可以加上该命名空间，举个例子：

```html
<Button
  on-user-remove.remove-button="removeUser()"
/>
```

这里监听的事件名称是 `userRemove`，事件命名空间是 `removeButton`，可以发现，事件命名空间同样会经过 `camelize` 处理。

> 关于事件命名空间，参考 **事件处理** - **事件命名空间**

最后，需要特别注意，组件事件名称和转换后的事件名称 `不能相同`，否则会报错，举个例子：

```html
<Button
  on-click="click"
/>
```

这种写法没有任何意义，冒泡事件本就可以直接处理，没必要再转换一个相同的事件。

综上，为了保证统一且规范的开发风格，我们在此给出事件名称的最佳实践，如下：

* 事件转换或调用 `fire(type)` 中的 `type`，使用驼峰格式，更符合 `JavaScript` 习惯
* 模板 `on-[type]` 中的 `type`，使用连字符格式，更符合 `HTML` 习惯

### 配置 events

转换后的事件，可以通过配置 `events` 监听。

```js
{
  events: {
    submit: function (event, data) {
      // this 指向当前组件实例
    }
  }
}
```

## 调用方法

你也可以调用 Yox 的实例方法，除了 `methods` 定义的业务层方法，还包括 Yox 内置的方法。

```html
<button on-click="toggle('isHidden')">
  Toggle
</button>
```

> 内置方法，参考 **API** - **实例方法**

### 调用参数

调用参数支持从 `data` 直接读取，如下：

数据

```js
{
  data: {
    users: [
      { id: '1', name: 'first' },
      { id: '2', name: 'second }
    ]
  },
  methods: {
    select: function (user, index) {

    }
  }
}
```

模板

```html
<div>
  {{#each users:index}}
    <button on-click="select(this, index)">
      {{name}}
    </button>
  {{/each}}
</div>
```

此外，还可以读取 `特殊变量`，如下：

```html
<button on-click="submit($event)">
  Submit
</button>
```

> 特殊变量，参考 **模板** - **特殊变量**（很重要，一定要看一遍）

## 停止事件传递

事件传递过程中，任何一个事件处理函数，返回 `false` 或调用 `event.stop()` 可以阻止事件继续传递。

> 事件支持向上或向下传递，参考 **事件处理** - **触发事件**

如果不需要阻止事件的默认行为，调用 `event.stop()` 更为合适。

> 返回 `false` 相当于 `event.prevent()` + `event.stop()`

```js
{
  events: {
    submit: function (event) {
      event.stop()
    }
  }
}
```

> `event.stop()` 是 `event.stopPropagation()` 的简单版本。


## 阻止事件默认行为

在事件处理函数中，调用 `event.prevent()` 可以阻止事件的默认行为。

> 通常是阻止 `DOM 事件` 的默认行为

```js
{
  events: {
    submit: function (event) {
      event.prevent()
    }
  }
}
```

> `event.prevent()` 是 `event.preventDefault()` 的简单版本。

## 绑定事件

你可以通过配置 `events` 绑定多个事件，这是 Yox 推荐的方式，如下：

```js
{
  events: {
    event1: function (event, data) {
      // 如果是组件事件，可能会有 data，这取决于发送方是否发送了数据
    },
    event2: function (event, data) {

    },
    ...
  }
}
```

如果你使用了 `pure` 版本，或者需要手动绑定事件，可以调用 Yox 实例的 `on()` 方法，如下：

```js
this.on(type, ?listener)
```

如果 `type` 是个 `Object`，可以一次绑定多个事件，如下：

```js
this.on({
  event1: function (event, data) {
    // 如果是组件事件，可能会有 data，这取决于发送方是否发送了数据
  },
  event2: function (event, data) {

  },
  ...
})
```

如果响应一次事件后需要解绑事件，可调用 `once()` 方法，方法签名完全相同。

## 解绑事件

你可以调用 Yox 实例的 `off()` 方法手动解绑事件，如下：

```js
this.off(?type, ?listener)
```

如果不传 `listener` 参数，可以解绑该 `type` 绑定的所有事件处理函数，如下：

```js
this.off('submit')
```

如果不传 `type` 参数，可以解绑该 Yox 绑定的所有事件处理函数，如下：

```js
this.off()
```

在一个事件驱动系统中，这是非常有用的特性，希望有一天你能体会到我们的良苦用心。

## 触发事件

你可以调用 Yox 实例的 `fire()` 方法发射事件，默认向上发射事件，即冒泡事件，它会一直冒泡到根组件。

```js
this.fire('submit')
```

你也可以带上一些数据，数据必须是个 `Object`，事件处理函数的第二个参数可以取到发送的数据。

```js
this.fire('submit', { name: 'yox' })
```

```js
{
  events: {
    submit: function (event, data) {
      // data 是 { name: 'yox' }
    }
  }
}
```

同理，你也可以向下发射事件，事件会一层接一层的向下传递，直到尽头。

```js
this.fire('submit', true)
this.fire('submit', { name: 'yox' }, true)
```

## 事件命名空间

`Yox` 实例还支持事件命名空间，前面提到的所有事件的命名空间都是 `""`，因此你感觉不到命名空间的存在。

### 绑定事件

绑定某个命名空间下的事件，如下：

```js
this.on('click.button', function (event) { })
```

发射某个命名空间下的事件，如下：

```js
this.fire('click.button')
```

如你所见，事件命名空间只是在 `事件名称` 后面加了一个 `.namespace` 而已。

它的使用规则同样很简单，只有当绑定的事件（接收方）和发射的事件（发送方）`同时` 包含命名空间时，才会判断命名空间是否匹配。

我们通过例子加深印象，首先绑定三个事件，如下：

```js
// 不指定命名空间
this.on('submit', function () {})
// 指定命名空间为 a
this.on('submit.a', function () {})
// 指定命名空间为 b
this.on('submit.b', function () {})
```

发射 `submit` 事件，这三个事件处理函数都会执行，如下：

```js
this.fire('submit')
```

> 发送方没有命名空间，不会判断命名空间是否匹配

发射 `submit.a` 事件，只有 `submit` 和 `submit.a` 会执行，如下：

```js
this.fire('submit.a')
```

> `submit` 会执行的原因是接收方没有命名空间，不会判断命名空间是否匹配

发射 `submit.b` 事件，只有 `submit` 和 `submit.b` 会执行，如下：

```js
this.fire('submit.b')
```

### 解绑事件

解绑事件，也可以指定命名空间，如下：

```js
this.off('click.button', listener)
```

如你所见，`事件名称`、`事件命名空间` 和 `事件处理函数` 三者必须同时匹配才能解绑成功。

如果不传 `listener` 参数，只要匹配 `事件名称` 和 `事件命名空间` 就能解绑成功，如下：

```js
this.off('click.button')
```

甚至可以省略 `事件名称`，此时只要匹配 `事件命名空间` 就能解绑成功，如下：

```js
this.off('.button')
```

## 事件对象

当 `DOM 事件` 或 `组件事件` 触发后，Yox 会把它封装成 `Yox.Event`，它有如下属性：

* `type`: 事件名称 + 事件命名空间（如果有的话）
* `phase`: 事件处于什么阶段
* `target`: 是哪个组件发出的事件
* `originalEvent`: 被封装的原始事件
* `isPrevented`: 是否已阻止事件的默认行为
* `isStoped`: 是否已停止向上或向下传递事件
* `listener`: 当前正在执行的事件处理函数

### type

`type` 就是 `fire(type)` 中的 `type`，它通常是事件名称。

如果指定了命名空间，它的格式为 `name.namespace`。

### phase

当 Yox 实例调用 `fire(type)` 方法发射一个事件，如果该实例绑定了这个事件，此时 `event.phase` 的值为 `0`，如下：

```js
{
  events: {
    mounted: function (event) {
      // 处理当前组件发出的事件
      // event.phase 是 0
    }
  },
  afterMount: function () {
    this.fire('mounted')
  }
}
```

> 可通过 `Yox.Event.PHASE_CURRENT` 读取常量值

当 Yox 实例 `向上` 发射事件，且事件已流转到父组件，此时 `event.phase` 的值为 `1`。

> 可通过 `Yox.Event.PHASE_UPWARD` 读取常量值

当 Yox 实例 `向下` 发射事件，且事件已流转到子组件，此时 `event.phase` 的值为 `-1`。

> 可通过 `Yox.Event.PHASE_DOWNWARD` 读取常量值

### target

触发事件后，内部会第一时间将 `event.target` 指向触发事件的 Yox 实例。

### originalEvent

`DOM 事件` 触发后，内部会把它封装成 `Yox.Event` 对象再进行分发，此时 `originalEvent` 指向 `DOM 事件`。

```html
<button on-click="click">
  Click
</button>
```

```js
// DOM 事件的事件处理函数
function (domEvent) {
  var event = new Yox.Event(domEvent.type, domEvent)
  // event.originalEvent 指向 domEvent
}
```

封装后的 `Yox.Event` 默认会开始向上冒泡，当在 `组件节点` 监听事件，并转换成另一个事件后，会把源事件再次封装，如下：

```js
function (type, event) {
  var newEvent = new Yox.Event(type, event)
  // event.originalEvent 指向 event
}
```

### listener

下面用一个例子说明为什么要加 `listener` 属性，如下：

```js
{
  events: {
    submit: function (event) {
      // event.listener 非常便于事件解绑
      this.off('submit', event.listener)
    }
  }
}
```

## 自定义事件

如果浏览器自带的 DOM 事件不满足需求，Yox 还支持自定义事件。

我们知道，当使用中文输入法进行文本输入时，如果没有敲击回车或空格，输入框会不停地触发 `input` 事件，这通常不是什么问题，但对于双向绑定来说，这样的体验并不好。

因此，我们内置了 `唯一的` 自定义事件 `model`，它可以过滤掉输入法正在输入过程中 `input` 事件。

对于跨端页面来说，通常还需要 `tap` 事件，下面简单示范如何实现它：

```js
Yox.dom.specialEvents.tap = {
  on: function (element, listener) {
    Yox.dom.on(
      element,
      isMobile ? 'touchstart' : 'click',
      listener
    )
  },
  off: function (element, listener) {
    Yox.dom.off(
      element,
      isMobile ? 'touchstart' : 'click',
      listener
    )
  }
}
```

```html
<button on-tap="submit()">
  Submit
</button>
```