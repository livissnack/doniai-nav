<template>
  <footer class="footer">
    <div class="container">
      <div class="columns">
        <div class="column">
          <h4 class="site-description">Doniai Nav</h4>
          <p class="footer-description">
            <em>Doniai</em>
            Technology And Art
            <em>ist</em>
            <br />
            <strong>为 简约 导航而生，愿景是做全球最好的简约导航网站</strong>
            <a href
              >齐全的导航，简洁优雅的界面，有任何需求的站点，在这里都可以快速的找到。</a
            >
            <br />
            <strong>简洁-优雅-高效</strong>
          </p>
          <ul class="footer-connect">
            <li class="connect-icon wechat">
              <a
                href="#"
                @mouseenter="showWechatQr"
                @mouseleave="hiddenWechatQr"
              >
                <i class="fab fa-weixin"></i>
              </a>
              <div class="whchat-qr-code" :class="wechat_class_name">
                <img
                  src="../assets/wechat_qrcode.webp"
                  alt="liang-wang"
                  width="120"
                />
              </div>
            </li>
            <li class="connect-icon facebook">
              <a href="https://www.facebook.com/lewis.wang.330" target="_blank">
                <i class="fab fa-facebook"></i>
              </a>
            </li>
            <li class="connect-icon twitter">
              <a href="#" title="Twitter: hstdsteel@hotmail.com">
                <i class="fab fa-twitter"></i>
              </a>
            </li>
            <li class="connect-icon linkedin">
              <a
                href="https://www.linkedin.com/in/liang-wang-30273356"
                target="_blank"
              >
                <i class="fab fa-linkedin"></i>
              </a>
            </li>
            <li class="connect-icon githup">
              <a
                href="https://githup.com/livissnack"
                target="_blank"
                title="githup"
              >
                <i class="fab fa-github-alt"></i>
              </a>
            </li>
          </ul>
        </div>
        <div class="column">
          <h4 class="ft-title">友情链接</h4>
          <div class="text-center">
            <div>
              <a href="http://www.pxtoolsteel.com" target="_blank">黄石品信</a>
            </div>
            <div>
              <a href="https://www.doniai.com" target="_blank">Doniai</a>
            </div>
          </div>
        </div>
        <div class="column">
          <h4 class="ft-title">合作伙伴</h4>
          <div class="text-center">
            <div>
              <a href="#">努力每天都是新的开始</a>
            </div>
          </div>
        </div>
        <div class="column">
          <h4 class="ft-title">联系方式</h4>
          <div class="text-center">
            <div>
              <i class="fas fa-phone"></i>
              电话：0714-3264731
            </div>
            <div>
              <i class="fas fa-globe-americas"></i>
              网址：
              <a href="http://www.pxtoolsteel.com" target="_blank"
                >www.pxtoolsteel.com</a
              >
            </div>
            <div>
              <i class="fab fa-usps"></i>
              邮编：435000
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="content has-text-centered">
      <p>
        <strong>版权所有: </strong>
        <a href="http://www.pxtoolsteel.com" target="_blank"
          >黄石品信进出口贸易有限公司</a
        >
        &nbsp;&nbsp;
        <strong>地址: </strong>
        <a href="#">黄石市黄石港区天津路商业中心1单元1304室</a>
        <br />
        <a href="http://opensource.org/licenses/mit-license.php"
          >《中华人民共和国电信与信息服务业务经营许可证》</a
        >
        <a
          href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
          target="_blank"
        >
        <img alt="icp" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAUCAYAAACAl21KAAAEkElEQVQ4jXWUbWwTBQBA312v1+u1XUvXrkyKcxsKW/iYATTgHIIfQMKHzkjAGEWDBDRIMBITwx+CMRATjGgAgxoF0RghIRmEMGBqkMWhBuJANsY2xrqxjX6wXnvX3vVa/0hiML7/7/18glXqA0CiDPCAeYGek608uHLjRL3v4oofT/72et4oyE88M+tAcObMY1ePfherW94Mci0wRuLasX/8/7IQ2PDVxi0rSkaPMphXcUwIoB/p+sTY3/JR45M1LcCXwPF/S+I9EaVt3xdtL68/syqTG1Ae8jpYp4yyQRlk/rwIwXkRad3608+17tnZArj+LxTNX9xx6uPD46xZV8PaaBr/Z1dIdNskem3Gl+1npd3J5oOrOXDUotT9+Q+Acm+o7ubxbb1NyzqbAlMivBnqpP9wGnFyAFszIV9ECAdo33SeVepFIo89zFPLTiy//csXfcBUADF7tRcpd8rb0u2TLwzPYekcjcylNOLNcYSAC1fSJnd+FGd1OUrGIP51B82LTdqu13PonF3pFbLuYPUriEC0+OvZ3UXBDZJOmTZMegSctgXJHEKtijw7gHgri0yReL/BpGAeBIFURsQVlnYD1eJA1+nnzaGhxgleGQouSpWVhBonkqGENr8ce00U7/YG1M0zEcMqFbNDZHUTSiUqK1SIXVqYHGx/TVS9E+rSmkVNOAdKOa0dKtKiMhLLq7CHNIQ/s+gnRrH67yBvbSS4ZRZHDqYADw0zJLK9Y+RivVGxmBxenk5JTI9qRB+R2XvIw887YzTMrcSv+tCvpCiO5cl1pvAN3eHyjmvsOegi0hBgxqRx4kN5rGRXoyhK2YCWFim7fY1Vi20Klhfr+Ajl3/+BOMmJGXZQrJAILaqksq2P+IHLZE0HzSuc+BI9aGkJySc6He+uXfmopAxNLaupIhrysO9sGePaGL58Am7EEdMFSt1JBAMGRD/fDEb43V/P3s0ZImGVglxErZj2rQRiRSldYrhXY3pdP++/M5ttW5s4rs2AtMUKPUEwIHLkhI8MKjCBt99QmDulh+EeIKdTLGizJClgzin4IlgjFrGxq7zV6KL5jIe2kzpd4kyW1F+n0h2n0DIJM2UweZrKe0tuMNp+A91SUEIyUkCeJuS0jhcTHbsOGyMm+bgFsQFqn23AFVHATmAnJDJjBv7qIFSVQyxO/7FuDF8Ib40X90QV/5Q1C4Sc1oFDcL2UvLz7Uztn+OPnRpA8JSYuqMNOGlh6FlFVUIIeBNlJor2Xgi3hn1OLlSPhn9q0WnaqZ6R8vAgYQ7kRt6FEiv7IoinY41lsLQ2qjEMOILvBvJMhG0uhVJWjRCPk7+jkhrSSe3IGkwxCpv9DgFaHY/RpQxfI9I0h2hZOFUxNRw74wdDIDowjet3I4TIQReSgF1dEBecDR4AXBCv9E4CaGj63y4z99apk6x414KKQNbE0C4ciUciaOIJlOBQHppFB9IRwhO6/Kaq1BxRP+AOgePeQOrApdTWy3Ri/vTRvDS64rz5cX9QErxIQg5Lbh3aLm+5wQJcqmi4le8fOGAOp1qrHKd790d/O3PzDty0xQQAAAABJRU5ErkJggg==" style="margin-right: 5px;">
          鄂ICP备2023012333号
        </a>
        <br />
        <strong>由</strong>
        <a href="https://github.com/livissnack" target="_blank">LivisSnack</a>
        <strong>设计与编码</strong>
        <span class="font-heart">❤</span>
      </p>
    </div>
    <div class="utils-box">
      <div></div>
      <div class="datetime">{{ currentTime }}</div>
    </div>
  </footer>
</template>

<script>
import { timeNow } from '@/utils/helper.js'
export default {
  name: 'Footer',
  data() {
    return {
      currentTime: timeNow(),
      wechat_class_name: 'wechat-hidden'
    }
  },
  mounted() {
    setInterval(() => {
      this.currentTime = timeNow()
    }, 1000)
  },
  methods: {
    showWechatQr() {
      this.wechat_class_name = 'wechat-show'
    },
    hiddenWechatQr() {
      this.wechat_class_name = 'wechat-hidden'
    }
  }
}
</script>

<style lang="less" scoped>
.divider {
  border-bottom-color: hsla(0, 0%, 100%, 0.15);
  border-right-color: hsla(0, 0%, 100%, 0.15);
  margin-top: 2rem;
  margin-bottom: 2rem;
  border-top: 1px solid #d3e0e9;
  border-bottom: 1px solid #d3e0e9;
}

.font-heart {
  color: #e27575;
  font-size: 14px;
}

.box-center {
  margin: 0 auto;
}

a {
  color: rgba(0, 0, 0, 0.87);
  &:hover {
    text-decoration: underline;
  }
}

.ft-title {
  font-size: 18px;
  font-weight: bold;
}

.footer-header {
  margin-bottom: 20px;
  img {
    width: 100px;
    border-radius: 6px;
    position: relative;
    height: auto;
    vertical-align: middle;
    margin-right: 0.75rem;
  }
  span {
    font-size: 18px;
    line-height: 24px;
  }
}

.lh-3 {
  line-height: 1.75rem;
  font-size: 1rem;
}

.tdu {
  margin-top: 20px;
  font-size: 1rem;
}

.site-description {
  color: #464646;
  text-align: left;
  font-size: 1.7rem;
  letter-spacing: -0.5px;
}

.footer-description {
  em {
    font-style: normal;
    font-weight: bolder;
    color: #00adb5;
  }
  a {
    color: #8e8e8e;
  }
  strong {
    font-weight: 700;
  }
  color: #8e8e8e;
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  letter-spacing: -0.2px;
}

.footer-connect {
  margin-left: -3px;
  list-style: none;
  display: flex;
  justify-content: flex-start;
}

.connect-icon {
  margin-top: 5px;
  display: inline-block;
  font-size: 18px;
  margin-right: 8px;
  width: 40px;
  text-align: center;
  border-radius: 4px;
  line-height: 1.9em;
  box-sizing: border-box;
  a {
    padding: 0.2em 0 0;
    display: block;
    border-radius: 4px;
    cursor: pointer;
    text-decoration: none;
    i {
      color: #fff;
      position: relative;
    }
  }
}

.wechat {
  background: linear-gradient(90deg, #15b982, #01d18b);
}

.twitter {
  background: #03a9f4;
}

.facebook {
  background: #3f51b5;
}

.linkedin {
  background: #0288d1;
}

.githup {
  background: #fd7114;
}

.zeroed {
  list-style: none;
  text-align: left;
  margin-top: -25px;
  li {
    a {
      color: #8e8e8e;
      letter-spacing: -0.2px;
      font-size: 0.85rem;
      font-weight: 500;
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

.mr30 {
  margin-left: 30px;
  color: #343434;
  margin-bottom: 35px;
  font-size: 1.1rem;
  margin-top: 20px;
}

.utils-box {
  display: flex;
  justify-content: space-between;
}

.wechat-hidden {
  display: none;
}

.wechat-show {
  display: block;
}

.whchat-qr-code {
  position: absolute;
  bottom: 24%;
  left: -8%;
  -webkit-transform: translate(50%, -10px);
  transform: translate(50%, -10px);
  -webkit-box-shadow: 0 4px 6px rgba(0, 0, 0, 0.46);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.46);
}

.license-logo {
  position: relative;
  top: 4px;
}
</style>
