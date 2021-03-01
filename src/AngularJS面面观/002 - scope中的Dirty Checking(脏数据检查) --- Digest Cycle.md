> 本文为CSDN博主「dm_vincent」的原创文章.[原文链接](https://blog.csdn.net/dm_vincent/article/details/51407292)

# Dirty Checking的实现方式

了解`Angular`的开发人员都知道，是一种叫做脏数据检查`(Dirty Checking)`的机制实现了双向绑定这一前端开发中的黑科技。那么在Angular中到底是如何实现它的呢？本文就一一来揭开它的神秘面纱。

一言以蔽之，在`angular`中是通过`Digest Cycle`来完成脏数据检查从而完成双向绑定进而实现`scope`和`view`的同步的。下面分几个方面来介绍一下什么是`Digest Cycle(DC)`

## DC中的检查单元-Watcher
在上一篇文章中，已经说明了在数据绑定表达式`{{ }}`的背后，是`watcher`在起作用。那么这个`watcher`到底是什么呢？它又是如何实现的呢？

直接上代码，摘自`v1.5.5`的`rootScope.js`

```
$watch: function(watchExp, listener, objectEquality, prettyPrintExpression) {
  var get = $parse(watchExp);
  if (get.$$watchDelegate) {
    return get.$$watchDelegate(this, listener, objectEquality, get, watchExp);
  }
  var scope = this,
      array = scope.$$watchers,
      watcher = {
        fn: listener,
        last: initWatchVal,
        get: get,
        exp: prettyPrintExpression || watchExp,
        eq: !!objectEquality
      };

  lastDirtyWatch = null;

  if (!isFunction(listener)) {
    watcher.fn = noop;
  }

  if (!array) {
    array = scope.$$watchers = [];
  }
  // we use unshift since we use a while loop in $digest for speed.
  // the while loop reads in reverse order.
  array.unshift(watcher);
  incrementWatchersCount(this, 1);

  return function deregisterWatch() {
    if (arrayRemove(array, watcher) >= 0) {
      incrementWatchersCount(scope, -1);
    }
    lastDirtyWatch = null;
  };
}
```
> `angular`文档中对于该方法的描述是：Registers a listener callback to be executed whenever the watchExpression changes. 即当`watchExp`发生变化的时候就调用`listener`代表的回调函数。

前面提到过传入的`watch`表达式会被翻译成一个`watch`函数。从上面的代码中，也很清晰的发现了这一点：

```
var get = $parse(watchExp);
```

`angular`调用了另一个服务`$parse`完成了从表达式到函数的转换。至于`$parse`的实现，目前我也还没仔细研究，以后有机会再专门写文章介绍。

然后，下面这段代码：

```
if (get.$$watchDelegate) {
  return get.$$watchDelegate(this, listener, objectEquality, get, watchExp);
}
```

当编译得到的`watch function`中存在`$$watchDelegate`这个属性时，就会直接返回。这实际上是一个性能优化的措施，在后面的文章中会进行分析。

后面会声明一个数组变量：

```
array = scope.$$watchers;
......
if (!array) {
  array = scope.$$watchers = [];
}
```

很明显，这个数组用来保存当前`scope`中的所有`watchers`。顺便说一句，`angular`中所有以两个`$`符号开头的变量名都是作为内部变量或者内部方法，一般在我们的应用逻辑中不应该使用它们。而这个数组就是后面执行`$digest`时重点关注的对象。

在创建`watcher`对象时，它有5个属性：

```
watcher = {
  fn: listener,
  last: initWatchVal,
  get: get,
  exp: prettyPrintExpression || watchExp,
  eq: !!objectEquality
};
```

`fn`就是传入的`listener`，关于`listener`，它的形式是这样的：`function(newVal, oldVal, scope)`
顾名思义在调用它的时候，会将当前的最新值，前值以及当前`scope`传入。

但是`listener`也并不是必须的：

```
if (!isFunction(listener)) {
  watcher.fn = noop;
}
```

既然`watcher`的主要目的是对`scope`上的某个属性进行监控，不设置`listener`有什么意义呢？其实，我也不是很清楚它的应用场景有哪些。但是从逻辑上来说，毕竟每次`DC`的时候都会执行到`watchExp`，所以对于没有设置`listener`的`watcher`，或多或少可以起到通知的效果吧。比如在`watchExp`进行`digest`次数的统计) 有点牵强，有经验的同学请赐教……

至于`exp`和`eq`，在后面阅读代码的时候自然就会再次碰到，有了更多上下文背景知识，理解这些新的概念的时候就会相对容易一些。现在暂时性的先忽略掉。

其实在阅读代码的时候，遇到看不明白的地方是非常非常非常正常的事情，此时不要感觉到气馁，也不要过于较劲非要把它弄明白。这样做就相当于是在做深度优先遍历，探索的层次太深了，恐怕你就不知道你在哪里了！最后的结局往往就是放弃，我想很多尝试过阅读代码的同学们都有过这种体验吧。而阅读代码更像是在进行广度优先遍历，我们需要首先弄明白代码的整体结构，然后根据需要逐层推进，各个击破，最终领悟。

最后的返回值是一个函数：

```
return function deregisterWatch() {
  if (arrayRemove(array, watcher) >= 0) {
    incrementWatchersCount(scope, -1);
  }
  lastDirtyWatch = null;
};
```

很明显，返回的这个函数是用来注销当前`watcher`：将当前`watcher`从数组中删除并减少计数器的值。
以上就是DC中的检查单元：`watcher`。将不必要的复杂性剖离后，背后的逻辑也没有那么神秘。

## DC中判断数据是否变化的几种逻辑
声明好了`watcher`，那么在一轮`DC`中，是不是会将注册过的`watcher`中的`listener`统统调用一次呢？
很明显，答案是否定的。如果真要这么设计，任何程序员都会摇摇头：性能会有多差啊！
确实，不可能将所有`watcher`中的`listener`全部都调用一次。是否调用的关键就在于`$watch`中的第一个参数`watchExp`。

只有在当前的值和上次检测的值不同时，才需要调用`listener`。基于这个逻辑，我们可以写下下面的示意代码：

```
forEach($$watchers, function(watcher) {
  newVal = watcher.get(scope);
  oldVal = watcher.last;
  if (newVal !== oldVal) {
    watcher.last = newValue;
    watcher.listenerFn(newVal, oldVal, scope);
  }
});
```

首先对`watchExp`求值得到当前值`newVal`。
然后将该值和前值`oldVal`进行比较，如果不相等：
1. 将last设为当前值
2. 调用listener

从上面的逻辑中，我们能够发现几个问题：
1. 在一轮`DC`中，尽管每个`watcher`上的`listener`不一定会被调用，但是每个`watcher`上的`watchExp`是会被调用一次的。因此最为应用程序的开发者，对于它的性能我们需要做到心中有数，即在`watchExp`中不宜进行过于复杂的判断和操作。
2. 在比较当前值`newVal`和前值`oldVal`的时候，目前使用的是`!==`来进行比较。但是考虑下面的这种情况，又觉得有些不对：

```
[1, 2, 3] !== [1, 2, 3] // true
```
即使两个数组的元素一模一样，得到的判断仍然是：他俩不一样，需要调用`listener`

好了，那么如何克服这个问题呢？即当元素内容一样的时候，不调用`listener`。这就涉及到了`DC`中判断数据是否变“脏”的几种逻辑：
- 基于值的检查
- 基于引用的检查
- 基于集合的检查

对于第一种，基于值的检查。很好理解，就是我们在面对相同数组时需要的逻辑。如果数组元素相同，则判断它们是相同的。此时`$watch`方法的第三个参数`eq`就派上用场了，下面是文档中对它的解释：

> @param {boolean=} [objectEquality=false] Compare for object equality using {@link angular.equals} instead of comparing for reference equality.

默认为`false`。使用基于引用的判断方式。也就是我们上面使用的`!==`。如果设置为`true`，那么就会使用`angular.equals`方法来进行比较。至于`angular.equals`这个方法，它定义在`Angular.js`这个文件中，其中定义的都是一些工具类方法。它会递归地对其中的所有属性进行比对。因此，只有两个对象的值一模一样时，才会判断它们是相同的。

那么第三种呢，它对应的方法是`$watchCollection`，现在介绍它还有点太早了，它的主要目的是对数组和对象的比较过程进行优化。在后续的文章中会进行介绍。

## DC的执行者$digest
在上面执行`DC`的伪代码中，我们会调用`watchExp`，将当前的值和前值进行比对来确定是否需要调用`listener`。那么一个很直接的问题就是，第一次调用的时候，这个前值`oldVal`是如何确定的呢？

如果我们`watch`了`scope`上的一个并没有设置过的属性，那么在第一次`DC`的时候，该`watch`上的`listener`永远不会被执行。这是因为我们还没有设置`watcher`的`last`属性，没有设置的属性默认就是`undefined`，而`undefined`和`undefined`进行比较的时候，会返回`true`。因此，当我们需要在第一次`DC`的时候执行所有`watcher`的`listener`时，就必须对每个`watcher`设置`last`属性。

因此，也就有了代码中的这一段：

```
watcher = {
  fn: listener,
  last: initWatchVal,
  get: get,
  exp: prettyPrintExpression || watchExp,
  eq: !!objectEquality
};
```

将`last`设置为了`initWatchVal`。
对代码进行搜索可以知道`initWatchVal`是这样定义的：

```
function initWatchVal() {}
```

比较巧妙的利用了`JavaScript`中引用相等判断(`Reference Equality`)规则。即只有该函数自身和自身进行比较的时候，才会相等。它和任何其它的值进行比较的时候，都会返回`false`。将它设置为一个`watcher`的`last`值再适合不过了。

另外一个需要注意的问题是，如果`listener`中对`scope`中的其它属性进行了修改，而恰巧该属性也有对应的`watcher`时，该如何是好？这样就造成了潜在的不一致，举个简单的例子。

现在我们有两个`watcher`:`A`和`B`，分别针对属性`a`和属性`b`。针对`a`的`watcher A`首先执行，如果在`B`的`listener`中改变了属性`a`，那么由于`A`已经执行过了，就不会判断出`a`又变“脏”了的事实。这只是一种可能性，当`watcher`数量增多，各种各样的可能性都是存在的。因此，`angular`用最悲观的方式来看待这一问题：只要`listener`被执行了，就认为有可能存在有的数据又变“脏”了的情况。所以我们需要反复的执行DC，来确保再没有`listener`被执行。只有当一轮`DC`中一个`listener`都没有被执行时，`DC`才可以不用再被执行。

所以，`DC`并不是一蹴而就的过程。它需要反复确认所有的被检查值都“稳定”了，它才能休息。那么是不是意味着DC可能会执行非常多次，乃至于无限执行下去的情况呢？

答案显然是否定的。在实际开发过程中，我们应该遇到过这个异常：
```
$digest() iterations reached. Aborting!
```

它告诉我们`DC`似乎进入了一个无休止的循环状态中，因此为了不造成浏览器失去响应，`angular`主动放弃治疗！这个`10`是直接定义在`angular`的源码中的，当然我们也可以通过`$rootScopeProvider`来修改它：

```
this.digestTtl = function(value) {
  if (arguments.length) {
    TTL = value;
  }
  return TTL;
};
```

这里的TTL(可能是Time To Live的意思)就是DC的最大执行次数。

以上的逻辑反映到伪代码中是这样的：

```
var ttl = 10;
do {
  var dirty = false;
  var length = $$watchers.length;
  var watcher;
  for(var idx = 0; idx < length; idx++) {
    watcher = $$watchers[idx];
    newVal = watcher.watchFn(scope);
    oldVal = watcher.last;
    if (!newVal.equals(oldVal)) {
      watcher.last = newVal;
      watcher.listener(newVal, oldVal, scope);
      dirty = true;
    }
  }
  ttl -= 1;
  if (dirty && ttl === 0) {
    throw '10 $digest() iterations reached. Aborting!';
  }
} while (dirty);
```

上面`DC`的逻辑离`angular`真正的实现还差的比较远。但是核心的逻辑已经初具雏形了。剩下的很多代码都是针对这个过程的各种优化措施。在下一篇文章中会对这些优化措施进行介绍。
