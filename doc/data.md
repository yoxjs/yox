## 风格

Yox 采用了 `get()` 和 `set()` 的方式。

我们认为这种方式会带来以下好处：

1. 兼容低端浏览器
2. 保持数据的纯粹性，无需 `defineProperty` 或任何形式的改写
3. 无需预设值，可以响应值的任何变化
4. `get('anything')` 无需担心空异常

## 取值

```js
var value = this.get('name')
```

读取一个可能不存在的值，常见的做法如下：

```js
var value = this.get('name')
if (value == null) {
  value = 'yox'
}
```

为了减少这种模板代码，我们为 `get()` 方法提供了第二个参数，可以用它来设置默认值。

```js
var value = this.get('name', 'yox')
```

注意，以上两种写法不完全等价，如果获取的值正好是个 `undefined` 或 `null`，我们认为它是一个合理的返回值。只有当获取的值 `不存在` 时，才会返回默认值。

## 设值

```js
// 单个设值
this.set('title', 'yox guide')

// 批量设值
this.set({
  title: 'yox guide',
  name: 'yox'
})
```

### 更新视图

视图依赖的数据发生了变化会自动更新视图。

```html
<div>
  name: {{name}}
  age: {{age}}
</div>
```

模板依赖了 `name` 和 `age`，这两个数据中的任何一个发生了变化，都会更新视图。

## Keypath

取值和设值的第一个参数支持 `keypath`，举个例子：

```js
var name = this.get('user.name')
```

```js
this.set('user.name', 'yox')
this.set({
  'user.name': 'yox'
})
```

内部会妥善处理数据为空的情况，因此请放心使用 `get()` 和 `set()`，无需担心空异常。

> 放肆地 `get('anything')` 难道不是秒杀 Vue 的一项功能吗？

对于数组项的操作，我们推荐使用以下方式：

```js
this.get('list.0.name')
this.set('list.0.name', 'yox')
```

而不是下面这样，实际上，Yox 并不支持这种写法。

```js
this.get('list[0]name')
this.set('list[0]name', 'yox')
```

