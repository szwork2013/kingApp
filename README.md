git操作：

创建一个项目：

echo "# kingApp" >> README.md
git init
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/xiaoyang2022/kingApp.git
git push -u origin master

推送到已经有的项目：

git remote add origin https://github.com/xiaoyang2022/kingApp.git
git push -u origin master

更新项目文件：
//上传
$ git init
$ git add .
//这个比较重要
$ git commit -am "修改或版本说明"    
$ git push -u origin master
//有时容易出现：remote origin already exists.解决办法如下：
$ git remote rm origin
$ git push -u origin master

//下载
$ git pull 
//失败的话试：git pull origin master
$ git stash
$ git pull origin master 
//如果还有error,那么执行
$ git clean -d -fx
//提示origin存在错误
$ git remote rm origin



kingApp是king项目的C端产品。包含了A端、C端、B端。

## 开始之前需要准备安装的：

* MongoDB - 数据库；
* Express - http服务；
* AngularJS 2.X- 前端架构方案；
* Node.js - 系统环境；


## 相关环境

* Bower 

```bash
$ npm install -g bower
```

* Gulp 

```bash
$ npm install gulp -g
```

```bash
$ sudo npm install
```


## 启动应用


```bash
$ npm start
```

访问 [http://localhost:3000](http://localhost:3000)



### 启动生产模式 

```bash
$ npm start:prod
```


### 启动研发模式

```bash
MONGO_SEED=true npm start
```
 
```bash
MONGO_SEED=true npm start:prod 
```

### TLS (SSL)模式运行

```bash
$ sh ./scripts/generate-ssl-certs.sh
```

## 测试APP

```bash
$ npm test
```

测试服务端：

```bash
$ npm test:server
```

测试客户端：

```bash
$ npm test:client
```

### Gulp运行

研发环境：

```bash
$ gulp
```

生产环境：

```bash
$ gulp prod
```

