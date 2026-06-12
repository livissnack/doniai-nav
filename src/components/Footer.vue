<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <section class="footer-brand">
          <h4 class="footer-title">Doniai Nav</h4>
          <p class="footer-desc">
            <span class="brand-accent">Doniai</span> Technology And Artist
            <br />
            <strong>为简约导航而生</strong>，愿景是做全球最好的简约导航网站。
            齐全的导航、简洁优雅的界面，在这里快速找到你需要的站点。
            <br />
            <strong>简洁 · 优雅 · 高效</strong>
          </p>
          <ul class="footer-social">
            <li class="social-item wechat">
              <button
                type="button"
                class="social-btn"
                aria-label="微信"
                @click="toggleWechatQr"
              >
                <AppIcon name="weixin" pack="brands"  />
              </button>
              <div class="wechat-qr" :class="{ 'is-visible': wechatQrVisible }">
                <img
                  src="../assets/wechat_qrcode.webp"
                  alt="微信二维码"
                  width="857"
                  height="873"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </li>
            <li class="social-item">
              <a href="https://www.facebook.com/lewis.wang.330" target="_blank" rel="noopener" class="social-btn facebook" aria-label="Facebook">
                <AppIcon name="facebook" pack="brands"  />
              </a>
            </li>
            <li class="social-item">
              <a href="mailto:hstdsteel@hotmail.com" class="social-btn twitter" aria-label="Twitter">
                <AppIcon name="twitter" pack="brands"  />
              </a>
            </li>
            <li class="social-item">
              <a href="https://www.linkedin.com/in/liang-wang-30273356" target="_blank" rel="noopener" class="social-btn linkedin" aria-label="LinkedIn">
                <AppIcon name="linkedin" pack="brands"  />
              </a>
            </li>
            <li class="social-item">
              <a href="https://github.com/livissnack" target="_blank" rel="noopener" class="social-btn github" aria-label="GitHub">
                <AppIcon name="github-alt" pack="brands"  />
              </a>
            </li>
          </ul>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">友情链接</h4>
          <ul class="footer-links">
            <li><a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">黄石品信</a></li>
            <li><a href="https://www.doniai.com" target="_blank" rel="noopener">Doniai</a></li>
          </ul>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">合作伙伴</h4>
          <ul class="footer-links">
            <li><span class="footer-muted">努力每天都是新的开始</span></li>
          </ul>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">联系方式</h4>
          <ul class="footer-contact">
            <li><AppIcon name="phone"  /><span>0714-3264731</span></li>
            <li>
              <AppIcon name="globe-americas"  />
              <a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">www.pxtoolsteel.com</a>
            </li>
            <li><AppIcon name="usps" pack="brands" /><span>邮编 435000</span></li>
          </ul>
        </section>
      </div>

      <div class="footer-divider"></div>

      <div class="footer-legal">
        <p class="legal-line">
          <strong>版权所有：</strong>
          <a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">黄石品信进出口贸易有限公司</a>
        </p>
        <p class="legal-line">
          <strong>地址：</strong>黄石市黄石港区天津路商业中心1单元1304室
        </p>
        <p class="legal-line">
          <a href="http://opensource.org/licenses/mit-license.php" target="_blank" rel="noopener">《中华人民共和国电信与信息服务业务经营许可证》</a>
          <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener" class="icp-link">
            <img alt="icp" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAUCAYAAACAl21KAAAEkElEQVQ4jXWUbWwTBQBA312v1+u1XUvXrkyKcxsKW/iYATTgHIIfQMKHzkjAGEWDBDRIMBITwx+CMRATjGgAgxoF0RghIRmEMGBqkMWhBuJANsY2xrqxjX6wXnvX3vVa/0hiML7/7/18glXqA0CiDPCAeYGek608uHLjRL3v4oofT/72et4oyE88M+tAcObMY1ePfherW94Mci0wRuLasX/8/7IQ2PDVxi0rSkaPMphXcUwIoB/p+sTY3/JR45M1LcCXwPF/S+I9EaVt3xdtL68/syqTG1Ae8jpYp4yyQRlk/rwIwXkRad3608+17tnZArj+LxTNX9xx6uPD46xZV8PaaBr/Z1dIdNskem3Gl+1npd3J5oOrOXDUotT9+Q+Acm+o7ubxbb1NyzqbAlMivBnqpP9wGnFyAFszIV9ECAdo33SeVepFIo89zFPLTiy//csXfcBUADF7tRcpd8rb0u2TLwzPYekcjcylNOLNcYSAC1fSJnd+FGd1OUrGIP51B82LTdqu13PonF3pFbLuYPUriEC0+OvZ3UXBDZJOmTZMegSctgXJHEKtijw7gHgri0yReL/BpGAeBIFURsQVlnYD1eJA1+nnzaGhxgleGQouSpWVhBonkqGENr8ce00U7/YG1M0zEcMqFbNDZHUTSiUqK1SIXVqYHGx/TVS9E+rSmkVNOAdKOa0dKtKiMhLLq7CHNIQ/s+gnRrH67yBvbSS4ZRZHDqYADw0zJLK9Y+RivVGxmBxenk5JTI9qRB+R2XvIw887YzTMrcSv+tCvpCiO5cl1pvAN3eHyjmvsOegi0hBgxqRx4kN5rGRXoyhK2YCWFim7fY1Vi20Klhfr+Ajl3/+BOMmJGXZQrJAILaqksq2P+IHLZE0HzSuc+BI9aGkJySc6He+uXfmopAxNLaupIhrysO9sGePaGL58Am7EEdMFSt1JBAMGRD/fDEb43V/P3s0ZImGVglxErZj2rQRiRSldYrhXY3pdP++/M5ttW5s4rs2AtMUKPUEwIHLkhI8MKjCBt99QmDulh+EeIKdTLGizJClgzin4IlgjFrGxq7zV6KL5jIe2kzpd4kyW1F+n0h2n0DIJM2UweZrKe0tuMNp+A91SUEIyUkCeJuS0jhcTHbsOGyMm+bgFsQFqn23AFVHATmAnJDJjBv7qIFSVQyxO/7FuDF8Ib40X90QV/5Q1C4Sc1oFDcL2UvLz7Uztn+OPnRpA8JSYuqMNOGlh6FlFVUIIeBNlJor2Xgi3hn1OLlSPhn9q0WnaqZ6R8vAgYQ7kRt6FEiv7IoinY41lsLQ2qjEMOILvBvJMhG0uhVJWjRCPk7+jkhrSSe3IGkwxCpv9DgFaHY/RpQxfI9I0h2hZOFUxNRw74wdDIDowjet3I4TIQReSgF1dEBecDR4AXBCv9E4CaGj63y4z99apk6x414KKQNbE0C4ciUciaOIJlOBQHppFB9IRwhO6/Kaq1BxRP+AOgePeQOrApdTWy3Ri/vTRvDS64rz5cX9QErxIQg5Lbh3aLm+5wQJcqmi4le8fOGAOp1qrHKd790d/O3PzDty0xQQAAAABJRU5ErkJggg==" />
            鄂ICP备2023012333号
          </a>
        </p>
        <p class="legal-line legal-credit">
          由 <a href="https://github.com/livissnack" target="_blank" rel="noopener">LivisSnack</a> 设计与编码
          <span class="font-heart">❤</span>
        </p>
      </div>

      <div class="footer-meta">
        <span class="footer-time">{{ currentTime }}</span>
      </div>
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
      wechatQrVisible: false,
    }
  },
  mounted() {
    this._timer = setInterval(() => {
      this.currentTime = timeNow()
    }, 1000)
  },
  beforeUnmount() {
    if (this._timer) clearInterval(this._timer)
  },
  methods: {
    toggleWechatQr() {
      this.wechatQrVisible = !this.wechatQrVisible
    },
  },
}
</script>

<style lang="less" scoped>
.site-footer {
  margin-top: 24px;
  background: linear-gradient(180deg, #fafafa 0%, #f3f3f3 100%);
  border-top: 1px solid #e0e0e0;
  color: #5a5a5a;
}

.footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 36px 20px 22px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.4fr repeat(3, 1fr);
  gap: 28px 24px;
}

.footer-title {
  margin: 0 0 12px;
  font-size: 1.45rem;
  font-weight: 700;
  color: #2e2e2e;
  letter-spacing: 0.02em;
}

.footer-desc {
  margin: 0 0 18px;
  font-size: 13px;
  line-height: 1.75;
  color: #5c5c5c;

  strong {
    color: #3a3a3a;
    font-weight: 600;
  }
}

.brand-accent {
  font-weight: 700;
  color: #6943d0;
}

.footer-heading {
  margin: 0 0 14px;
  padding-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333333;
  letter-spacing: 0.04em;
  border-bottom: 2px solid rgba(32, 188, 86, 0.5);
  display: inline-block;
}

.footer-links,
.footer-contact {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li + li,
.footer-contact li + li {
  margin-top: 10px;
}

.footer-links a,
.footer-contact a {
  color: #4a4a4a;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #6943d0;
  }
}

.footer-muted {
  color: #737373;
  font-size: 13px;
  line-height: 1.6;
}

.footer-contact li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #555555;

  i {
    width: 16px;
    color: #20bc56;
    text-align: center;
  }
}

.footer-social {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}

.social-item {
  position: relative;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
  }

  i {
    font-size: 16px;
  }
}

.wechat .social-btn,
.social-btn.wechat {
  background: linear-gradient(135deg, #15b982, #01d18b);
}

.social-btn.facebook {
  background: #3f51b5;
}

.social-btn.twitter {
  background: #03a9f4;
}

.social-btn.linkedin {
  background: #0288d1;
}

.social-btn.github {
  background: #fd7114;
}

.wechat-qr {
  display: none;
  position: absolute;
  left: 50%;
  bottom: calc(100% + 10px);
  transform: translateX(-50%);
  padding: 8px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.18);
  z-index: 10;

  &.is-visible {
    display: block;
  }

  img {
    display: block;
    width: 120px;
    height: auto;
    aspect-ratio: 857 / 873;
    border-radius: 6px;
  }
}

.footer-divider {
  margin: 30px 0 22px;
  border-top: 1px solid #e0e0e0;
}

.footer-legal {
  text-align: center;
}

.legal-line {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.75;
  color: #6b6b6b;

  a {
    color: #5a5a5a;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: #6943d0;
    }
  }

  strong {
    color: #444444;
    font-weight: 600;
  }
}

.icp-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
}

.legal-credit {
  margin-top: 6px;
  color: #6b6b6b;

  a {
    color: #6943d0;

    &:hover {
      color: #20bc56;
    }
  }
}

.font-heart {
  color: #e27575;
  margin-left: 2px;
}

.footer-meta {
  margin-top: 18px;
  text-align: right;
}

.footer-time {
  font-size: 12px;
  color: #888888;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

@media screen and (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media screen and (max-width: 640px) {
  .footer-inner {
    padding: 24px 16px 16px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .footer-title {
    font-size: 1.25rem;
  }

  .footer-desc {
    font-size: 12px;
  }

  .footer-social {
    gap: 10px;
  }

  .wechat-qr {
    left: 0;
    transform: none;
  }

  .footer-heading {
    display: block;
    width: fit-content;
  }

  .footer-legal {
    text-align: left;
  }

  .legal-line {
    font-size: 11px;
    color: #6b6b6b;
  }

  .icp-link {
    display: inline-flex;
    margin-left: 0;
    margin-top: 4px;
  }

  .footer-meta {
    text-align: center;
    margin-top: 12px;
  }
}
</style>
