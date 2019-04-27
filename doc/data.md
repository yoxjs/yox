## 风格

与 Vue 不同，我们采用了 `get()` 和 `set()` 的方式。

相比 Vue，我们认为这种方式有以下优势：

1. 兼容低端浏览器
2. 保持数据的纯粹性，无需 `defineProperty` 或任何形式的改写
3. 无需预设值，可以响应值任何的变化
4. `get('anything')` 无需担心空异常报错

## 取值

```js
var value = this.get('name')
```

读取一个可能不存在的值，常见的做法如下：

```js
var value = this.get('name')
if (value == null) {
  value = 1
}
```

为了减少这种模板代码，我们为 `get` 方法提供了第二个参数，可以用它来配置默认值。

```js
var value = this.get('name', 1)
```

需要注意的是，以上两种写法不等价，如果获取的值正好是个 `undefined` 或 `null`，我们认为它是一个合理的返回值。

只有当获取的值确实**不存在**时，才会返回默认值。

## 设值

```js
// 单个设值
this.set('title', 'yox guide')

// 批量设值
this.set({
  title: 'yox guide',
  name: 'yox'
})

// 因为是异步更新视图
// 使用单个设值还是批量设值请随意，不影响性能
```

### 更新视图

```html
<div>
  name: {{name}}
  age: {{age}}
</div>
```

视图依赖的数据发生了变化会更新视图。

上面的例子中，模板依赖了 `name` 和 `age`，这两项数据中的任何一个发生了变化，都会触发更新。

由于更新视图实际上是操作 DOM，代价略显昂贵，因此这个过程是异步的。

> 如果模板的依赖没有发生变化，则不会更新视图。

## Keypath

取值和设值的第一个参数支持 **keypath**，举个例子：

```js
this.get('user.name');
```

```js
this.set('user.name', 'yox');
this.set({
  'user.name': 'yox'
});
```

内部会妥善处理数据为空的情况，因此请放心使用 `get()` 和 `set()`，无需担心空异常。

> 放肆地 `get('anything')` 难道不是秒杀 Vue 的一项功能吗？

对于数组项的操作，我们推荐使用以下方式：

```js
this.get('list.0.name');
```



