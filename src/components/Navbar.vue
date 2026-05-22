<template>
  <nav class="site-nav">
    <div class="site-nav-inner">
      <router-link to="/" class="nav-brand" @click.native="closeMenu">
        <span class="nav-brand-icon">D</span>
        <span class="nav-brand-text">Doniai导航</span>
      </router-link>

      <button
        type="button"
        class="nav-toggle"
        aria-label="切换菜单"
        @click="menuOpen = !menuOpen"
      >
        <i :class="['fas', menuOpen ? 'fa-times' : 'fa-bars']"></i>
      </button>

      <div class="nav-menu" :class="{ 'is-open': menuOpen }">
        <template v-if="!newPage">
          <button
            v-for="menu in visibleMenus"
            :key="menu.id"
            type="button"
            class="nav-tab"
            :class="{ 'is-active': menu.id === currentActiveMenuId }"
            @click="handleChangeData(menu)"
          >
            {{ menu.name }}
          </button>
        </template>
        <template v-else>
          <button
            type="button"
            class="nav-tab is-active"
            @click="handleJumpPage(newUrl)"
          >
            {{ pageTitle }}
          </button>
          <slot name="custommenu"></slot>
        </template>
      </div>

      <div class="nav-actions">
        <div v-if="isLoggedIn" class="nav-user" v-click-outside="closeUserMenu">
          <button
            type="button"
            class="nav-user-trigger"
            :class="{ 'is-open': userMenuOpen }"
            @click="userMenuOpen = !userMenuOpen"
          >
            <span class="nav-user-avatar" aria-hidden="true">{{ avatarLetter }}</span>
            <span class="nav-user-label">{{ displayName }}</span>
            <i class="fas fa-chevron-down nav-user-chevron" aria-hidden="true"></i>
          </button>
          <div v-show="userMenuOpen" class="nav-user-dropdown">
            <div class="dropdown-user-name">{{ displayName }}</div>
            <div class="dropdown-user-email">{{ userEmail }}</div>
            <hr class="dropdown-divider" />
            <router-link to="/admin" class="dropdown-item" @click.native="closeAll">
              <i class="fas fa-sliders-h"></i> 管理面板
            </router-link>
            <button type="button" class="dropdown-item danger" @click="handleLogout">
              <i class="fas fa-sign-out-alt"></i> 退出登录
            </button>
          </div>
        </div>
        <template v-else-if="!skipAuth">
          <button type="button" class="nav-action" @click="goLogin">登录</button>
          <button type="button" class="nav-action nav-action--primary" @click="goRegister">
            注册
          </button>
        </template>
      </div>
    </div>
  </nav>
</template>

<script>
import jsonMenus from '@/services/menu.json'
import { authStore, authActions, canAccessMenu, isSkipAuthMode } from '@/store/auth'

export default {
  name: 'Navbar',
  directives: {
    clickOutside: {
      bind(el, binding) {
        el._clickOutside = (e) => {
          if (!el.contains(e.target)) binding.value(e)
        }
        document.addEventListener('click', el._clickOutside)
      },
      unbind(el) {
        document.removeEventListener('click', el._clickOutside)
      },
    },
  },
  props: {
    currentActiveMenuId: {
      type: Number,
      default: 1,
    },
    newPage: {
      type: Boolean,
      default: false,
    },
    pageTitle: {
      type: String,
      default: '',
    },
    newUrl: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      menus: jsonMenus.menus,
      menuOpen: false,
      userMenuOpen: false,
    }
  },
  computed: {
    isLoggedIn() {
      return !!authStore.user
    },
    displayName() {
      return authStore.user?.displayName || authStore.user?.username || ''
    },
    avatarLetter() {
      const name = this.displayName
      return name ? name.charAt(0).toUpperCase() : '?'
    },
    userEmail() {
      return authStore.user?.email || ''
    },
    visibleMenus() {
      return this.menus.filter((m) => {
        if (m.requireAuth) return this.isLoggedIn
        return true
      })
    },
    skipAuth() {
      return isSkipAuthMode()
    },
  },
  methods: {
    closeMenu() {
      this.menuOpen = false
    },
    closeUserMenu() {
      this.userMenuOpen = false
    },
    closeAll() {
      this.closeMenu()
      this.closeUserMenu()
    },
    handleChangeData(menu) {
      if (!canAccessMenu(menu.id)) {
        this.$buefy.toast.open({
          message: '请先登录后访问「私人」栏目',
          type: 'is-warning',
        })
        if (!isSkipAuthMode()) {
          this.$router.push({ path: '/login', query: { redirect: '/' } })
        }
        return
      }
      this.closeAll()
      this.$emit('updateCurrentNavs', { menu_id: menu.id })
    },
    handleJumpPage(path) {
      this.closeAll()
      this.$router.push({ path })
    },
    goLogin() {
      this.$router.push({ path: '/login' })
    },
    goRegister() {
      this.$router.push({ path: '/register' })
    },
    async handleLogout() {
      await authActions.logout()
      this.closeAll()
      this.$buefy.toast.open({ message: '已退出登录', type: 'is-info' })
      if (this.$route.path === '/admin') {
        this.$router.push({ path: '/' })
      }
      if (this.currentActiveMenuId === 2) {
        this.$emit('updateCurrentNavs', { menu_id: 1 })
      }
    },
  },
}
</script>

<style lang="less" scoped>
.site-nav {
  background: #fff;
  box-shadow: 0 1px 0 rgba(15, 23, 42, 0.06), 0 4px 12px rgba(15, 23, 42, 0.04);
}

.site-nav-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 16px;
  min-height: 52px;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  text-decoration: none;
  color: inherit;

  &:hover .nav-brand-text {
    color: #20bc56;
  }
}

.nav-brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  line-height: 1;
  box-shadow: 0 2px 8px rgba(32, 188, 86, 0.35);
}

.nav-brand-text {
  font-size: 17px;
  font-weight: 700;
  color: #15b982;
  transition: color 0.2s;
  white-space: nowrap;
}

.nav-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin-left: auto;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #4b5563;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    border-color: #20bc56;
    color: #20bc56;
  }
}

.nav-menu {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.nav-tab {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 32px;
  padding: 0 14px;
  border: none;
  border-radius: 16px;
  background: transparent;
  color: #4b5563;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;

  &:hover {
    background: #f3f4f6;
    color: #1f2937;
  }

  &.is-active {
    background: #ecfdf3;
    color: #20bc56;
    font-weight: 600;
    box-shadow: inset 0 0 0 1px rgba(32, 188, 86, 0.25);
  }

  .menu-lock {
    font-size: 10px;
    opacity: 0.5;
  }
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.nav-user {
  position: relative;
}

.nav-user-trigger {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 32px;
  padding: 0 12px 0 6px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  font-family: inherit;
  font-size: 14px;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  box-sizing: border-box;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;

  &:hover,
  &.is-open {
    border-color: #20bc56;
    background: #f0fdf4;
  }

  &.is-open .nav-user-chevron {
    transform: rotate(180deg);
    color: #20bc56;
  }
}

.nav-user-avatar {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c65b, #20bc56);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
}

.nav-user-label {
  flex: 0 1 auto;
  min-width: 0;
  font-size: 14px;
  font-weight: 600;
  color: #20bc56;
  line-height: 1;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-user-chevron {
  flex-shrink: 0;
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.2s, color 0.2s;
}

.nav-user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 50;
  min-width: 200px;
  padding: 8px 0;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.15);
  border: 1px solid #e5e7eb;
}

.dropdown-user-name {
  padding: 8px 16px 2px;
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.dropdown-user-email {
  padding: 0 16px 8px;
  font-size: 12px;
  color: #9ca3af;
}

.dropdown-divider {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #f0f0f0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 10px 16px;
  border: none;
  background: none;
  font-size: 14px;
  color: #374151;
  text-decoration: none;
  text-align: left;
  cursor: pointer;

  &:hover {
    background: #f0fdf4;
    color: #20bc56;
  }

  &.danger:hover {
    background: #fef2f2;
    color: #dc2626;
  }
}

.nav-action {
  height: 32px;
  padding: 0 14px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: #fff;
  color: #15b982;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s, color 0.2s;

  &:hover {
    border-color: #20bc56;
    background: #f0fdf4;
  }

  &--primary {
    border-color: #20bc56;
    background: linear-gradient(135deg, #22c65b, #20bc56);
    color: #fff;

    &:hover {
      background: linear-gradient(135deg, #2dd36f, #22c65b);
      border-color: #22c65b;
    }
  }
}

@media screen and (max-width: 1023px) {
  .site-nav-inner {
    flex-wrap: wrap;
    padding: 10px 12px;
    min-height: auto;
  }

  .nav-toggle {
    display: inline-flex;
  }

  .nav-menu {
    display: none;
    order: 4;
    flex: 1 1 100%;
    flex-wrap: wrap;
    gap: 8px;
    padding: 4px 0 8px;

    &.is-open {
      display: flex;
    }
  }

  .nav-actions {
    order: 3;
    margin-left: auto;
  }

  .nav-toggle {
    order: 2;
  }

  .nav-brand {
    order: 1;
  }

  .nav-user-dropdown {
    right: 0;
    left: auto;
  }
}

@media screen and (max-width: 480px) {
  .nav-brand-text {
    font-size: 15px;
  }

  .nav-user-label {
    max-width: 72px;
    font-size: 13px;
  }

  .nav-user-trigger {
    padding: 0 10px 0 4px;
    gap: 6px;
  }
}
</style>
