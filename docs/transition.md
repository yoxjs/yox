
你可以用 `transition` 在 `元素节点` 或 `组件节点` 上创建过渡动画，如下：

```html
<div transition="name">
  xx
</div>
```

## 钩子函数

`name` 指向一个由两个钩子函数组成的对象，如下：

```js
{
  // 淡入动画，可选
  enter: function (node) {
    // node 是一个 DOM 元素
    // 用 CSS3 尽情地浪吧
  },
  // 淡出动画，可选
  leave: function (node, done) {
    // node 是一个 DOM 元素
    // 用 CSS3 尽情地浪吧
    // 等到动画结束后，调用 done()
  }
}
```

当节点加入 DOM 树，会触发 `enter` 钩子函数，当节点从 DOM 树移除，会触发 `leave` 钩子函数。

当卸载节点时，如果没有配置 `leave` 钩子，节点会立刻从 DOM 树移除，如果配置了 `leave` 钩子，则可以通过 `done` 来控制何时移除节点。

> `done` 最终必须被调用

## 全局注册

通用性较强的过渡动画，建议全局注册，如下：

```js
// 单个注册
Yox.transition('name', {
  enter: function (node) {},
  leave: function (node, done) {}
})

// 批量注册
Yox.transition({
  name1: {
    enter: function (node) {},
    leave: function (node, done) {}
  },
  name2: {
    enter: function (node) {},
    leave: function (node, done) {}
  },
  ...
})
```

## 本地注册

通用性不强的过渡动画，建议本地注册，如下：

```js
{
   transitions: {
    name1: {
      enter: function (node) {},
      leave: function (node, done) {}
    },
    name2: {
      enter: function (node) {},
      leave: function (node, done) {}
    },
  }
}
```

