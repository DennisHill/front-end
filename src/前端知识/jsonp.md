> 满堂花醉三千客 一剑霜寒十四州

### 嘛是jsonp

1. 一个众所周知的问题，`Ajax`请求是不能跨域的，甭管你是静态页面、动态网页、web服务、WCF，只要是跨域请求，一律不准。

2. 不过我们又发现，`Web`页面上调用`js`文件时则不受是否跨域的影响（不仅如此，我们还发现凡是拥有`src`这个属性的标签都拥有跨域的能力，比如`<script>`、`<img>`、`<iframe>`）。

3. 于是如果想通过纯web端跨域访问数据就可以这样：在远程服务器上设法把数据装进`js`格式的文件里，供客户端调用和进一步处理。

4. 恰巧有一种叫做`JSON`的纯字符数据格式可以简洁的描述复杂数据，更妙的是`JSON`还被`js`原生支持，所以在客户端几乎可以随心所欲的处理这种格式的数据。

5. 这样子解决方案就呼之欲出了，`web`客户端通过与调用脚本一模一样的方式，来调用跨域服务器上动态生成的`js`格式文件，显而易见，服务器之所以要动态生成`JSON`文件，目的就在于把客户端需要的数据装入进去。

6. 客户端在对`js`文件调用成功之后，也就获得了自己所需的数据，剩下的就是按照自己需求进行处理和展现了。

7. 为了便于客户端使用数据，逐渐形成了一种非正式传输协议，人们把它称作`JSONP`，该协议的一个要点就是允许用户传递一个`callback`参数给服务端，然后服务端返回数据时会将这个`callback`参数作为函数名来包裹住`JSON`数据，这样客户端就可以随意定制自己的函数来自动处理返回数据了。

### JSONP的客户端实现

#### First Blood

1. 假设远程服务器有个`app.js`文件，代码如下

```
alert('111111')；
```

2. `html`页面如下

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <script src="http://xx.xx.xx.xx/app.js"></script>
</head>
<body>

</body>
</html>
```

很显然页面会显示一个弹出框

3. 现在稍微改动一下

```
<!-- html代码 -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <script>
    var handler = function (data) {
        alert(data)
    }
  </script>
  <script src="http://xx.xx.xx.xx/app.js"></script>
</head>
<body>

</body>
</html>
```

```
// 远程服务器的 app.js 代码
handler({"result":"我是远程js带来的数据"});
```

毫无疑问，是可以运行成功的

4. 动态生成`handler`函数名

```
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Title</title>
  <script>
    var xxxHandler = function(data){
        alert(data);
    };
    // 提供jsonp服务的url地址（不管是什么类型的地址，最终生成的返回值都是一段javascript代码）
    var url = "http://xx.xx.xx.xx/xyz?param1=123&callback=xxxHandler";
    // 创建script标签，设置其属性
    var script = document.createElement('script');
    script.setAttribute('src', url);
    // 把script标签加入head，此时调用开始
    document.body.appendChild(script); 
  </script>
</head>
<body>

</body>
</html>
```

这次改动，不再把远程`js`文件写死。在调用的`url`中传递了一个`code`参数，告诉服务器参数信息，而`callback`参数则告诉服务器，本地回调函数叫做`xxxHandler`，所以请把查询结果传入这个函数中进行调用。


5. 最后，不废话了，直接上最后封装过的代码

```
(function (global) {
  function jsonp (url, params, callback) {
    let queryStringArr = [];
    for (var k in params) {
      queryStringArr.push(`${k}=${param[k]}`);
    }

    let random = Math.random().toString().replace('.', '');
    let callbackFunctionName = 'jsonp_' + random;
    queryStringArr.push(`callback=${callbackFunctionName}`);

    let script = document.createElement('script');
    script.src = url + '?' + queryStringArr.join('&');
    document.body.appendChild(script);

    global[callbackFunctionName] = function (param) {
      callback(param);
      document.body.removeChild(script);
    };
  }

  global.jsonp = jsonp;
})(window);

```
