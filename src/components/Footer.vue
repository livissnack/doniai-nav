<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-grid">
        <section class="footer-brand">
          <p class="footer-eyebrow">Doniai Technology And Artist</p>
          <h4 class="footer-title">Doniai Nav</h4>
          <p class="footer-desc">
            为简约导航而生，愿景是做全球最好的简约导航网站。齐全的导航、简洁优雅的界面，在这里快速找到你需要的站点。
          </p>
          <ul class="footer-tags" aria-label="产品关键词">
            <li>简洁</li>
            <li>优雅</li>
            <li>高效</li>
          </ul>
          <ul class="footer-social">
            <li class="social-item wechat">
              <button
                type="button"
                class="social-btn"
                aria-label="微信"
                @click="toggleWechatQr"
              >
                <AppIcon name="weixin" pack="brands" />
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
              <a
                href="https://www.facebook.com/lewis.wang.330"
                target="_blank"
                rel="noopener"
                class="social-btn facebook"
                aria-label="Facebook"
              >
                <AppIcon name="facebook" pack="brands" />
              </a>
            </li>
            <li class="social-item">
              <a
                href="mailto:hstdsteel@hotmail.com"
                class="social-btn twitter"
                aria-label="邮件"
              >
                <AppIcon name="twitter" pack="brands" />
              </a>
            </li>
            <li class="social-item">
              <a
                href="https://www.linkedin.com/in/liang-wang-30273356"
                target="_blank"
                rel="noopener"
                class="social-btn linkedin"
                aria-label="LinkedIn"
              >
                <AppIcon name="linkedin" pack="brands" />
              </a>
            </li>
            <li class="social-item">
              <a
                href="https://github.com/livissnack"
                target="_blank"
                rel="noopener"
                class="social-btn github"
                aria-label="GitHub"
              >
                <AppIcon name="github-alt" pack="brands" />
              </a>
            </li>
          </ul>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">友情链接</h4>
          <ul class="footer-links">
            <li>
              <a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">黄石品信</a>
            </li>
            <li>
              <a href="https://www.doniai.com" target="_blank" rel="noopener">Doniai</a>
            </li>
          </ul>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">合作伙伴</h4>
          <p class="footer-muted">努力每天都是新的开始</p>
        </section>

        <section class="footer-block">
          <h4 class="footer-heading">联系方式</h4>
          <ul class="footer-contact">
            <li>
              <span class="contact-icon" aria-hidden="true"><AppIcon name="phone" /></span>
              <span>0714-3264731</span>
            </li>
            <li>
              <span class="contact-icon" aria-hidden="true"><AppIcon name="globe-americas" /></span>
              <a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">www.pxtoolsteel.com</a>
            </li>
            <li>
              <span class="contact-icon" aria-hidden="true"><AppIcon name="usps" pack="brands" /></span>
              <span>邮编 435000</span>
            </li>
          </ul>
        </section>
      </div>

      <div class="footer-bottom">
        <div class="footer-legal">
          <p class="legal-owner">
            版权所有
            <a href="http://www.pxtoolsteel.com" target="_blank" rel="noopener">
              黄石品信进出口贸易有限公司
            </a>
          </p>
          <p class="legal-address">黄石市黄石港区天津路商业中心1单元1304室</p>
          <div class="legal-badges">
            <a
              href="http://opensource.org/licenses/mit-license.php"
              target="_blank"
              rel="noopener"
              class="legal-badge"
            >
              电信与信息服务业务经营许可证
            </a>
            <a
              href="http://creativecommons.org/licenses/by-nc-sa/4.0/"
              target="_blank"
              rel="noopener"
              class="legal-badge icp-link"
            >
              <img
                alt="icp"
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAAUCAYAAACAl21KAAAEkElEQVQ4jXWUbWwTBQBA312v1+u1XUvXrkyKcxsKW/iYATTgHIIfQMKHzkjAGEWDBDRIMBITwx+CMRATjGgAgxoF0RghIRmEMGBqkMWhBuJANsY2xrqxjX6wXnvX3vVa/0hiML7/7/18glXqA0CiDPCAeYGek608uHLjRL3v4oofT/72et4oyE88M+tAcObMY1ePfherW94Mci0wRuLasX/8/7IQ2PDVxi0rSkaPMphXcUwIoB/p+sTY3/JR45M1LcCXwPF/S+I9EaVt3xdtL68/syqTG1Ae8jpYp4yyQRlk/rwIwXkRad3608+17tnZArj+LxTNX9xx6uPD46xZV8PaaBr/Z1dIdNskem3Gl+1npd3J5oOrOXDUotT9+Q+Acm+o7ubxbb1NyzqbAlMivBnqpP9wGnFyAFszIV9ECAdo33SeVepFIo89zFPLTiy//csXfcBUADF7tRcpd8rb0u2TLwzPYekcjcylNOLNcYSAC1fSJnd+FGd1OUrGIP51B82LTdqu13PonF3pFbLuYPUriEC0+OvZ3UXBDZJOmTZMegSctgXJHEKtijw7gHgri0yReL/BpGAeBIFURsQVlnYD1eJA1+nnzaGhxgleGQouSpWVhBonkqGENr8ce00U7/YG1M0zEcMqFbNDZHUTSiUqK1SIXVqYHGx/TVS9E+rSmkVNOAdKOa0dKtKiMhLLq7CHNIQ/s+gnRrH67yBvbSS4ZRZHDqYADw0zJLK9Y+RivVGxmBxenk5JTI9qRB+R2XvIw887YzTMrcSv+tCvpCiO5cl1pvAN3eHyjmvsOegi0hBgxqRx4kN5rGRXoyhK2YCWFim7fY1Vi20Klhfr+Ajl3/+BOMmJGXZQrJAILaqksq2P+IHLZE0HzSuc+BI9aGkJySc6He+uXfmopAxNLaupIhrysO9sGePaGL58Am7EEdMFSt1JBAMGRD/fDEb43V/P3s0ZImGVglxErZj2rQRiRSldYrhXY3pdP++/M5ttW5s4rs2AtMUKPUEwIHLkhI8MKjCBt99QmDulh+EeIKdTLGizJClgzin4IlgjFrGxq7zV6KL5jIe2kzpd4kyW1F+n0h2n0DIJM2UweZrKe0tuMNp+A91SUEIyUkCeJuS0jhcTHbsOGyMm+bgFsQFqn23AFVHATmAnJDJjBv7qIFSVQyxO/7FuDF8Ib40X90QV/5Q1C4Sc1oFDcL2UvLz7Uztn+OPnRpA8JSYuqMNOGlh6FlFVUIIeBNlJor2Xgi3hn1OLlSPhn9q0WnaqZ6R8vAgYQ7kRt6FEiv7IoinY41lsLQ2qjEMOILvBvJMhG0uhVJWjRCPk7+jkhrSSe3IGkwxCpv9DgFaHY/RpQxfI9I0h2hZOFUxNRw74wdDIDowjet3I4TIQReSgF1dEBecDR4AXBCv9E4CaGj63y4z99apk6x414KKQNbE0C4ciUciaOIJlOBQHppFB9IRwhO6/Kaq1BxRP+AOgePeQOrApdTWy3Ri/vTRvDS64rz5cX9QErxIQg5Lbh3aLm+5wQJcqmi4le8fOGAOp1qrHKd790d/O3PzDty0xQQAAAABJRU5ErkJggg=="
              />
              鄂ICP备2023012333号
            </a>
          </div>
        </div>

        <div class="footer-meta">
          <p class="legal-credit">
            由
            <a href="https://github.com/livissnack" target="_blank" rel="noopener">LivisSnack</a>
            设计与编码
            <span class="font-heart" aria-hidden="true">❤</span>
          </p>
          <span class="footer-time">{{ currentTime }}</span>
        </div>
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
  --footer-ink: #1f2937;
  --footer-muted: #6b7280;
  --footer-line: #e5e7eb;
  --footer-accent: #20bc56;
  --footer-brand: #5b3cc4;
  margin-top: 24px;
  color: var(--footer-muted);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.72) 0%, rgba(248, 250, 252, 0.96) 100%),
    radial-gradient(1200px 280px at 12% 0%, rgba(32, 188, 86, 0.07), transparent 60%),
    radial-gradient(900px 240px at 88% 0%, rgba(91, 60, 196, 0.06), transparent 55%),
    #f8fafc;
  border-top: 1px solid var(--footer-line);
}

.footer-inner {
  max-width: 1152px;
  margin: 0 auto;
  padding: 40px 20px 20px;
}

.footer-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.55fr) repeat(3, minmax(0, 1fr));
  gap: 32px 36px;
  align-items: start;
}

.footer-eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #9ca3af;
}

.footer-title {
  margin: 0 0 12px;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--footer-ink);
  letter-spacing: -0.02em;
}

.footer-desc {
  margin: 0 0 14px;
  max-width: 36em;
  font-size: 13px;
  line-height: 1.75;
  color: #4b5563;
}

.footer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  list-style: none;
  margin: 0 0 18px;
  padding: 0;

  li {
    padding: 4px 10px;
    border: 1px solid #d1d5db;
    background: rgba(255, 255, 255, 0.8);
    color: #374151;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }
}

.footer-heading {
  position: relative;
  margin: 0 0 16px;
  padding-bottom: 10px;
  font-size: 13px;
  font-weight: 700;
  color: var(--footer-ink);
  letter-spacing: 0.06em;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: 0;
    width: 28px;
    height: 2px;
    background: linear-gradient(90deg, var(--footer-accent), rgba(32, 188, 86, 0.15));
  }
}

.footer-links,
.footer-contact {
  list-style: none;
  margin: 0;
  padding: 0;
}

.footer-links li + li,
.footer-contact li + li {
  margin-top: 12px;
}

.footer-links a {
  position: relative;
  color: #4b5563;
  font-size: 13px;
  text-decoration: none;
  transition: color 0.18s ease;

  &:hover {
    color: var(--footer-brand);
  }
}

.footer-muted {
  margin: 0;
  max-width: 16em;
  color: #6b7280;
  font-size: 13px;
  line-height: 1.7;
}

.footer-contact li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.5;
  color: #4b5563;
}

.contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-top: 1px;
  color: var(--footer-accent);
  flex-shrink: 0;
}

.footer-contact a {
  color: inherit;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.18s ease;

  &:hover {
    color: var(--footer-brand);
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
  border: 1px solid transparent;
  color: #fff;
  cursor: pointer;
  text-decoration: none;
  transition: transform 0.18s ease, box-shadow 0.18s ease, filter 0.18s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
    filter: brightness(1.04);
  }
}

.wechat .social-btn {
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
  border: 1px solid var(--footer-line);
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.16);
  z-index: 10;

  &.is-visible {
    display: block;
  }

  img {
    display: block;
    width: 120px;
    height: auto;
    aspect-ratio: 857 / 873;
  }
}

.footer-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px 32px;
  margin-top: 34px;
  padding-top: 20px;
  border-top: 1px solid var(--footer-line);
}

.footer-legal {
  min-width: 0;
  flex: 1;
}

.legal-owner,
.legal-address {
  margin: 0;
  font-size: 12px;
  line-height: 1.7;
  color: #6b7280;
}

.legal-owner {
  a {
    margin-left: 6px;
    color: #374151;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.18s ease;

    &:hover {
      color: var(--footer-brand);
    }
  }
}

.legal-address {
  margin-top: 2px;
}

.legal-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.legal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.75);
  color: #4b5563;
  font-size: 12px;
  line-height: 1.3;
  text-decoration: none;
  transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease;

  &:hover {
    border-color: #c7d2fe;
    color: var(--footer-brand);
    background: #fff;
  }

  img {
    width: 14px;
    height: 16px;
    object-fit: contain;
  }
}

.footer-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
  text-align: right;
}

.legal-credit {
  margin: 0;
  font-size: 12px;
  color: #6b7280;

  a {
    color: var(--footer-brand);
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--footer-accent);
    }
  }
}

.font-heart {
  color: #e27575;
  margin-left: 2px;
}

.footer-time {
  font-size: 12px;
  color: #9ca3af;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}

@media screen and (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 28px 24px;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-meta {
    align-items: flex-start;
    text-align: left;
    padding-top: 4px;
  }
}

@media screen and (max-width: 640px) {
  .footer-inner {
    padding: 28px 16px 16px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 22px;
  }

  .footer-title {
    font-size: 1.3rem;
  }

  .footer-desc {
    font-size: 12px;
  }

  .wechat-qr {
    left: 0;
    transform: none;
  }

  .legal-badges {
    flex-direction: column;
    align-items: stretch;
  }

  .legal-badge {
    justify-content: flex-start;
  }

  .footer-meta {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 12px;
  }
}
</style>
