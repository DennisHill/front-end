> 天街小雨润如酥，草色遥看近却无。  ——唐 韩愈 《早春呈水部张十八员外》

看一下[`MDN`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind)的解释：
`bind`会创建一个新的函数，当新函数被调用时，`this`会被设置为提供的值，并将参数序列作为原函数参数的前若干项。
> The bind() method creates a new function that, when called, has its this keyword set to the provided value, with a given sequence of arguments preceding any provided when the new function is called.

根据以上文档，于是
```
Function.prototype.myBind = function (context) {
    var _this = this;
    return function () {
        return _this.apply(context);
    }
}
```
考虑到函数可能有返回值，于是，`return _this.apply(context)`
```
var foo = {
    value: 1
};

function bar() {
	return this.value;
}

var bindFoo = bar.myBind(foo);

console.log(bindFoo()); // 1
```

根据文档，`bind`传入的参数，会被当做前若干项参数。`bind`时可以传入若干参数，调用时，再传入若干个参数。于是考虑使用`arguments`，于是第二版用`arguments`处理一下
```
Function.prototype.myBind = function (context) {
    var _this = this;
    // 从第二个参数到最后一个参数
    var args = Array.prototype.slice.call(arguments, 1);
    return function () {
        // 这个arguments是指bind返回的函数传入的参数
        var bindArgs = Array.prototype.slice.call(arguments);
        return self.apply(context, args.concat(bindArgs));
    }

}
var foo = {
    value: 1
};

function bar(name, age) {
    console.log(this.value);
    console.log(name);
    console.log(age);

}

var bindFoo = bar.myBind(foo, 'daisy');
bindFoo('18');
// 1
// daisy
// 18
```

到这里，似乎已经完事了。但是，事情并没有这么简单。因为`bind`还有一个特点，就是**构造函数**。

> 当使用`new`操作符时，这种行为就等同于把原函数当做构造器，提供的`this`将被忽略。

```
var value = 2;

var foo = {
    value: 1
};

function bar(name, age) {
    this.habit = 'shopping';
    console.log(this.value);
    console.log(name);
    console.log(age);
}

bar.prototype.friend = 'kevin';

var bindFoo = bar.bind(foo, 'daisy');

var obj = new bindFoo('18');
// undefined
// daisy
// 18
console.log(obj.habit);
console.log(obj.friend);
// shopping
// kevin
```
虽然在全局以及`foo`都生命了`value`，但是，依然输出`undefined`，说明绑定的`this`失效了。
> 此时，`this`指向的是`obj`。

通过修改返回函数的原型来改写一下
```
Function.prototype.myBind = function (context) {
    var _this = this;
    var args = Array.prototype.slice.call(arguments, 1);
    var fBound = function () {
        var bindArgs = Array.prototype.slice.call(arguments);
        // this instanceof fBound
        // 当作为构造函数时，this 指向实例，此时结果为 true，
        // 将绑定函数的 this 指向该实例，可以让实例获得来自绑定函数的值
        return _this.apply(this instanceof fBound ? this : context, args.concat(bindArgs));
    }
    // 修改返回函数的 prototype 为绑定函数的 prototype，实例就可以继承绑定函数的原型中的值
    fBound.prototype = this.prototype;
    return fBound;
}
```