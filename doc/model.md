你可以用 `model` 指令在 `<input>`、`<textarea>`、`<select>` 元素或组件上创建双向绑定，它会根据节点类型自动选择正确的方式进行更新。

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
<div>
  <input type="text" model="name">
</div>
```

```html
<div>
  <textarea model="name"></textarea>
</div>
```

如果希望控制同步的节奏，可通过 `lazy` 实现，如下：

通过 `change` 事件触发同步

```html
<div>
  <input type="text" model="name" lazy>
</div>
```

指定多少毫秒同步一次

```html
<div>
  <input type="text" model="name" lazy="500">
</div>
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
  <input type="radio" model="selected" value="1">
  <input type="radio" model="selected" value="2">
</div>
```

## Checkbox

单选框

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

多选框

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

## 组件

```js
{
  data: {
    name: 'yox'
  },
  components: {
    Input: {
      model: 'value',
      propTypes: {
        value: {
          type: 'string'
        }
      }
    }
  }
}
```

```html
<div>
  <Input model="name" />
</div>
```

组件 `options` 提供了一个 `model` 属性用于配置双向绑定字段，默认为 `value`。

不论是否配置 `model`，`propTypes` 都要定义该字段，否则传入组件的数据会被过滤。

> 如果你重写了 `Yox.checkPropTypes(props, propTypes)` 方法，`propTypes` 是否需要定义双向绑定字段就由你决定啦。

