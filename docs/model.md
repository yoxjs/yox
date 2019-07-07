你可以用 `model` 指令在 `表单控件节点` 或 `组件节点` 上创建双向绑定，它会根据节点类型自动选择正确的方式进行数据同步和更新。

## 输入框

对于支持 `input` 事件的输入框（如 text、password、search、number、url 等），默认监听 `input` 事件，因此同步是实时的。

```js
{
  data: {
    name: ''
  }
}
```

```html
<input type="text" model="name">
```

```html
<textarea model="name"></textarea>
```

如果希望控制同步的节奏，可通过 `lazy` 实现，如下：

通过 `change` 事件触发同步

```html
<input type="text" model="name" lazy>
```

指定多少毫秒同步一次

```html
<input type="text" model="name" lazy="500">
```

## Radio

```js
{
  data: {
    selected: 1
  }
}
```

```html
<div>
  <!-- 因为 selected 为 1，因此默认会选中第一个 radio -->
  <input type="radio" model="selected" name="xx" value="1">
  <input type="radio" model="selected" name="xx" value="2">
</div>
```

## Checkbox

单选

```js
{
  data: {
    checked: false
  }
}
```

```html
<div>
  <input type="checkbox" model="checked">
</div>
```

多选

```js
{
  data: {
    checkedNames: []
  }
}
```

```html
<div>
  <input type="checkbox" model="checkedNames" value="Jack">
  <input type="checkbox" model="checkedNames" value="John">
  <input type="checkbox" model="checkedNames" value="Mike">
</div>
```

## Select

单选

```js
{
  data: {
    selected: 'Jack'
  }
}
```

```html
<select model="selected">
  <option>Jack</option>
  <option>John</option>
  <option>Mike</option>
</select>
```

多选

```js
{
  data: {
    selectedNames: []
  }
}
```

```html
<select multiple model="selectedNames">
  <option>Jack</option>
  <option>John</option>
  <option>Mike</option>
</select>
```

## 组件

我们先揭秘 `<input type="text">` 的双向绑定是如何实现的。

首先，把绑定的数据设置到 `<input>` 元素的 `value` 属性上，当用户交互使它的值发生变化，再把最新的 `value` 属性值同步回绑定的数据，这样一来一回，数据和视图始终保持一致。

相同的思路，我们再来看组件的双向绑定。

首先，我们默认组件会有一个 `value` 属性，当使用 `model` 指令时，会自动把绑定的数据传给组件的 `value` 属性，如下：

```html
<Input model="name" />
```

然后，我们监听 `<Input>` 组件的变化，一旦 `value` 变化了，再把 `newValue` 同步给绑定的数据，如下：

```js
input.watch(
  'value',
  function (newValue) {
    context.set('name', newValue)
  }
)
```

我们根据这个流程实现了组件的双向绑定机制，组件默认同步 `value` 属性，如果不符合需求，可自定义属性名，如下：

```js
{
  // 设置双向绑定的属性
  model: 'checked',
  template: 'balabala',
  ...
}
```

也许你觉得这个设计破坏了单向数据流，是的，我们也发现了这个问题，那为什么依然采用这个设计呢？

第一，这种设计最简单，不信的话，可以体验一把 [Checkbox](https://jsrun.net/LCyKp/edit) 组件。

第二，我们推荐使用单向数据流，即子组件不篡改父组件传入的数据（只读），如果你能做到这一点，全局只有双向绑定组件会破坏它，我们评估下来，风险可以承受。