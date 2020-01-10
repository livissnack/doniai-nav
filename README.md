<h1 align="center">Doniai Nav</h1>

<p align="center">:tada: 基于VueJs的个人网址导航应用。</p>

![Build Status](https://img.shields.io/travis/livissnack/doniai-nav)
![Version](https://img.shields.io/github/package-json/v/livissnack/doniai-nav)
![StyleCI build status](https://github.styleci.io/repos/144818004/shield)
[![Issues](https://img.shields.io/github/issues/livissnack/doniai-nav.svg)](https://github.com/livissnack/doniai-nav/issues)
![Forks](https://img.shields.io/github/forks/livissnack/doniai-nav.svg)

## 安装

```sh
$ git clone git@github.com:livissnack/doniai-nav.git new_name
$ cd new_name
$ yarn install
```

## 配置

在使用本应用之前，你需要去 [高德地图](https://lbs.amap.com/) 注册账号，然后创建应用，获取应用的 `key` 值

## 使用

```node
$ yarn serve
```

- [浏览器访问 http://localhost:8080](http://localhost:8080)

## 部署

### vue 打包编译

```node
$ cd new_name
$ yarn build
```

将打包好的静态资源放置 nginx 资源目录下，使用 nginx 静态部署即可。

### 页面效果

![effect](/example/images/1.png)

## 所用技术

- [高德地图 api](https://lbs.amap.com/)
- [VueJs](https://lbs.amap.com/)

## License

the MIT License, http://livissnack.mit-license.org
