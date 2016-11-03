顾名思义，`keypath` 表示 key 的路径，如 `user.profile.name`。

渲染模板需要数据，而数据通常是带有层次结构的，比如用户列表：

```javascript
{
    data: {
        users: [
            {
                name: 'Jack',
                age: 1
            },
            {
                name: 'John',
                age: 2
            },
            {
                name: 'Mike',
                age: 3
            }
        ]
    },
    select: function (keypath) {
        console.log(this.get(keypath));
    }
}
```

我们渲染这个列表时，给每个用户添加一个按钮，我们希望点击按钮能知道当前是哪个用户：

```html
{{#each users}}
    {{name}}
    <button on-click="select($keypath)">
        Select
    </button>
{{/each}}
```




