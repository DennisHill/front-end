> 假设你正在做一个在线的IM系统，如何在多个tab页之间，共享一个websocket实例呢？(来自字节跳动)

当时遇到这个问题，第一感觉是懵逼。我的知识储备告诉我，多个`tab`页面之间，是不能共享`websocket`实例的。挠破头皮想到了两个方案

* 在用户打开多个`tab`页面时，新的页面中，不建立`websocket`连接。然后多`tab`页之间进行消息通讯。这个方案会带来这么几个问题

    - 多`tab`之间如何通讯
    - 怎么判断打开的是不是第一个需要建立连接的页面
    - 如果关闭了第一个页面，那么之后的消息怎么处理

* 在两个页面都能访问到的地方，维持一个`websocket`连接，然后这个`websocket`连接接收到消息后，向两个页面发送消息。

所以，现在的问题就是，在什么地方维持`websocket`连接。

难受的时，当时完全没有一点想法。只好灰溜溜的过了这个题。

面试完，百度一下答案，发现了一丝端倪，共享线程`SharedWorker`。

这个玩意儿，可以发起网络请求，并且可以在多个页面之间共享。

具体代码如下

```
// index.html
<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Document</title>

</head>
<body>
<button id="btn"> CLICK ME</button>
<script>

var worker = new SharedWorker('worker.js');
worker.port.onmessage = function (e) {
  console.log(e);
};
document.getElementById('btn').addEventListener('click', function (e) {
  // 点击按钮时，通过port发送消息到shared worker
  worker.port.postMessage('nihao' + Math.random());
});
</script>
</body>
</html>


// worker.js
var portList = [];
var ws;

function getWsInstance () {
  var ws = new WebSocket("ws://echo.websocket.org");

  ws.onopen = function (evt) {
  };

  ws.onmessage = function (evt) {
    // 当websocket接收到消息时，通过portList中存放的port，
    // 将数据推送到主线程
    portList.forEach(port => {
      port.postMessage(evt.data);
    });
  };

  ws.onclose = function (evt) {
  };

  return ws;
}

// 当主线程调用new SharedWorker时，就会触发onconnect事件
onconnect = function (e) {
  // 当触发了这个事件时，就建立对应的websocket连接
  ws = ws || getWsInstance();
  var port = e.ports[0];
  // 然后把这个连接对应的port放在portList中
  portList.push(port);

  port.addEventListener('message', function (evt) {
    ws.send(evt.data);
  });

  port.start();

};


```
