> 本文为CSDN博主「dm_vincent」的原创文章。[原文链接](https://blog.csdn.net/dm_vincent/article/details/51605610)

本文介绍`scope`对象中`$apply`方法的实现。关于`$apply`和`$digest`方法，就像是一枚硬币的两面，它们之间的区别和联系，在[这篇译文](https://blog.csdn.net/dm_vincent/article/details/38705099)中做出了解答，有兴趣的同学可以看看。

当然，本文的重点还是在于该方法是如何实现的。下面言归正传，来看看相关源代码：

```

$apply: function(expr) {
  try {
    beginPhase('$apply');
    try {
      return this.$eval(expr);
    } finally {
      clearPhase();
    }
  } catch (e) {
    $exceptionHandler(e);
  } finally {
    try {
      $rootScope.$digest();
    } catch (e) {
      $exceptionHandler(e);
      throw e;
    }
  }
}
```

整体的流程其实很简单，实现代码也不过`20`行。
首先，从该方法的定义来看，`apply`方法接受一个`Angular`支持的表达式作为参数。

然后通过`beginPhase`方法设置当前运行状态，紧接着调用了`$eval`方法来得到一个返回值。最后调用`clearPhase`方法。注意是在`finally`代码块中调用的该方法。同时，在调用`$eval`方法的`try`代码块也对应了一个`finally`代码块。目的是保证最关键的`digest`循环会被触发：`$rootScope.$digest()`。

让我们上面出现的几个新概念：
- `beginPhase`方法 / `clearPhase`方法
- `$eval`方法

关于`beginPhase`方法 / `clearPhase`方法，实现也很简单：

```
function beginPhase(phase) {
  if ($rootScope.$$phase) {
    throw $rootScopeMinErr('inprog', '{0} already in progress', $rootScope.$$phase);
  }

  $rootScope.$$phase = phase;
}

function clearPhase() {
  $rootScope.$$phase = null;
}
```

因此在调用`$apply`时，`$rootScope`中的`$$phase`字段会被设置为`$apply`。看`beginPhase`的实现不难发现，如果当`$$phase`已经被设置为某个值时，`Angular`会直接抛出一个异常。所以通常情况下，不需要重复调用`$apply`方法。在`$apply`方法完成后，会调用`clearPhase`方法完成对当前状态的清空，方便下一次的调用。

那么下面的关键就是`$eval`的实现方法了：

```
$eval: function(expr, locals) {
  return $parse(expr)(this, locals);
}
```

很明显，`$eval`又把绣球抛给了`$parse`。当然从代码和字面意思来看，这个`$parse`的目的应该就是把一个表达式解析成一个函数吧，毕竟会立刻对解析得来的函数进行调用。

那么我们通过`Angular`文档中的例子来直观地认识一下什么是`Angular`的表达式：

```
var scope = ng.$rootScope.Scope();
scope.a = 1;
scope.b = 2;

expect(scope.$eval('a+b')).toEqual(3);
expect(scope.$eval(function(scope){ return scope.a + scope.b; })).toEqual(3);
```

- 从第一个例子中，我们可以知道它真的可以是一个表达式，就是一条语句：a+b。
- 从第二个例子中，我们可以知道它也能够是一个函数。

那么`$eval`的作用也就清晰起来了，给定一个表达式，使用当前`scope`对象作为上下文进行该表达式的求值。

所以，整个`$apply`方法的运行流程也就很清晰了。在完成求值并返回前，触发一轮`digest`循环。这也就解释了为什么`$apply`方法能够完成`Angular`和其他`JavaScript`框架(如`jQuery`)之间的交互。因为无论外部框架做了什么，都能够保证`digest`循环被触发。从而让`Angular`能够通过注册的`watchers`来帮助你完成`scope`上绑定的数据和视图之间的同步。

`scope`对象除了我们耳熟能详的`$digest`以及本节介绍的`$apply`以及`$eval`之外，其实还有很多有意思的方法供我们使用，比如`$evalAsync`以及`$applyAsync`。在下一节中，会对它们进行介绍。

感谢大家花费宝贵时间阅读我的文章，如果发现文中有不妥之处，请赐教！谢谢大家。
