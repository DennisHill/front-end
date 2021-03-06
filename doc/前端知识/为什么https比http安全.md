# 为什么HTTP不安全？

由于`HTTP`明文的特点，整个传输过程完全是透明的。任何人都能够在链路中截获、修改或者伪造请求/相应报文，数据不具有可信性。

# 什么样的通信过程是安全的？

通常认为，如果通信过程具备了四个特性，就可以认为是安全的。
- 私密性
- 完整性
- 身份认证
- 不可抵赖性

### 私密性

指对数据的保密，只能由可信的人访问，对其他人是不可见的秘密。

### 完整性

数据在传输过程中，没有被篡改，不多也不少，保持原状。

### 身份认证

确认对方的真实身份，保证消息只能发送给可信的人

### 不可抵赖性

意思是不能否认已经发生过的行为，不能"说话不算话"，"耍赖皮"

# HTTPS如何保证上述几个特性？

### 私密性的保证
私密性是信息安全的基础。实现私密性最常用的手段就是`加密`。通过某种方式转换成谁也看不懂的乱码，只有掌握特殊"钥匙"的人才能转换出原始的文本。

这里的"钥匙"就叫做密钥(`key`)。加密前的消息叫"明文"，加密后的乱码叫"密文"。使用密钥还原明文的过程叫"解密"。

按照密钥的使用方式，可以分为两大类：
- 对称加密
- 非对称加密

##### 对称加密
对称加密是指加密和解密时，使用的密钥是同一个。因此，只要保证了密钥的安全，那整个通信过程可以说具有了机密性。

对称加密看上去很好的实现了私密性，但是很大的问题在于，如何安全的将密钥传递给对方。如果密钥被截获，通信过程也就没有私密性可言了。

##### 非对称加密
针对对称加密的缺陷，就有了非对称加密算法的出现。

非对称加密有两个密钥，一个叫公钥(`public key`)，一个叫私钥(`private key`)。两个密钥是不同的。其中公钥可以公开给任何人使用，但私钥必须严格保密。

公钥和私钥有个特别的单向性：虽然都可以用来加密解密，但公钥加密后，只能用私钥解密。反之，用私钥加密的，只能用公钥解密。

非对称加密可以解决密钥交换的问题。网站秘密保管私钥，在网上任意分发公钥，想要登录网站，只需要用公钥进行加密就行了，这样发送使用公钥加密过的密文，只有持有私钥的人才能解密。黑客没有私钥，就无法破解密文。

##### 混合加密
但是很遗憾的是，由于非对称加密都是基于复杂的数学难题，运算速度很慢，相对于对称加密，速度差了几百倍。

因此`TLS`就采用了混合加密的方式。

** 在通信刚开始的时候，采用非对称算法，解决密钥交换的问题。先用随机数产生对称加密算法的会话密钥(`session key`)，然后使用非对称加密算法的公钥进行加密，这样对方拿到密文之后，用私钥进行解密，取出会话密钥。这样双方就完成对称加密密钥的安全传输。之后，就使用对称加密对消息进行加密。**

### 完整性的保证

实现完整性的手段主要是摘要算法，也就是通常说的散列函数、哈希函数。

##### 摘要算法

摘要算法可以把任意长度的数据压缩成固定长度、且独一无二的摘要字符串。换一个角度，可以认为摘要算法是一种特殊的加密算法，只是这个算法是单向的，只有算法，没有密钥，加密后的数据也无法解密，不能从摘要逆推出原文。

摘要算法保证了摘要信息和原文是等价的，所以，只需要在原文后附上他的摘要，就能够保证数据的完整性。

### 身份认证和不可抵赖性

##### 数字签名

数字签名的原理很简单，就是把公钥私钥的用法反过来。用私钥加密，公钥解密。由于非对称加密效率低，因此，只加密原文摘要即可。这样，只要与网站交换公钥，就可以通过签名和验签来确认消息的真实性。因为私钥保密，所以黑客不能伪造签名，也就能保证通信双方的身份。

##### 数字证书和CA

到目前为止，看似我们已经解决了`HTTPS`安全的四大特性，但是还有一个问题，就是公钥的信任问题。因为任何人都能发布公钥，所以还缺少防止黑客伪造公钥的手段。为了解决这个问题，引入一个可信的第三方，让他作为信任的起点，构建起公钥的信任链。这个第三方，就是通常所说的`CA`。

`CA`对公钥的签名认证是有格式的，不仅仅是把公钥绑定在持有者身份上，还要包含序列号、用途、颁发者、有效时间等等，把这些打成一个包，再进行签名，完整的证明公钥关联的各种信息，形成数字证书。



