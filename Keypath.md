顾名思义，`keypath` 表示 key 的路径，如 `user.profile.name`。

渲染模板需要数据，而数据通常带有层级结构，比如用户列表：

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
    methods: {
        select: function (keypath) {
            console.log(keypath, this.get(keypath));
        }
    }
}
```

渲染用户列表时，我们给每个用户添加一个按钮，并且希望点击按钮能知道是点了哪个用户：
 
```html
{{#each users}}
    {{name}}
    <button on-click="select($keypath)">
        Select
    </button>
{{/each}}
```

当我们点击第二个用户时，会打印出如下数据：

```
users.1 Object {name: "John"}
```

概括的说，`keypath` 表示的是**当前的数据层级**。



