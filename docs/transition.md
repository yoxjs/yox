
你可以用 `transition` 在 `元素节点` 或 `组件节点` 上创建过渡动画。

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
    // 用 CSS3 尽情的浪吧
  },
  // 淡出动画，可选
  leave: function (node, done) {
    // node 是一个 DOM 元素
    // 用 CSS3 尽情的浪吧
    // 等到动画结束后，调用 done()
  }
}
```

## 全局注册

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

