> `new`干了些什么？

`JavaScript高级程序设计`一书中，`6.2.2`一节中提到，使用`new`操作符调用构造函数，经历4个步骤

1. 创建一个新对象
2. 将构造函数的作用域赋给新对象(因此this就指向了这个新对象)
3. 执行构造函数中的代码
4. 返回新对象

按以上步骤，实现一个`new`函数，则应有如下步骤

```
function myNew (fn) {
    var obj = {};
    fn.apply(obj);
    return obj;
}

```

这样是有问题的。因为没有考虑原型。这样不但无法调用原型上的方法，而且使用`instanceof`检测类型时也是有问题的。

```
function Person () {
	this.name = 'Jack';
}

var p1 = new Person();
var p2 = myNew(Person);

console.log(p1 instanceof Object); // true
console.log(p2 instanceof Object); // true
console.log(p1 instanceof Person); // true
console.log(p2 instanceof Person); // false
`````

因为`p2`的原型指向`Object.prototype`。所以，需要手动改变一下其原型的指向。

```
function myNew(fn) {
    var obj = {};
    obj.__proto__ = fn.prototype; // 改变这个对象的原型指向
    fn.apply(obj);
    return obj;
}
var p2 = myNew(Person);
console.log(p1 instanceof Person); // true
console.log(p2 instanceof Person); // true
```

考虑到构造函数的参数以及构造函数本身`return`的情况的话，还可以做进一步改造

> 关于构造函数`return`的情况，请查看`《关于this那些事》`

```
function myNew(constructor) {
    var args = Array.prototype.slice.call(arguments, 1);
    var obj = {};
    obj.__proto__ = constructor.prototype; // 改变这个对象的原型指向
    var ret = constructor.apply(obj, args);
    if (ret && ret instanceof Object) {
        return ret;
    }
    return obj;
}

```
