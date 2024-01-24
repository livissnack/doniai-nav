<template>
    <div class="container">
        <b-navbar>
            <template slot="brand">
                <b-navbar-item tag="router-link" :to="{ path: '/' }">
                    <h3 class="nav-brand text-primary">Doniai导航</h3>
                </b-navbar-item>
            </template>
            <template slot="start" v-if="!newPage">
                <b-navbar-item :active="menu.id === currentActiveMenuId" @click="handleChangeData(menu)" href="#"
                    v-for="menu in menus" :key="menu.id">{{ menu.name }}</b-navbar-item>
            </template>

            <template slot="start" v-if="newPage">
                <b-navbar-item class="is-active" @click="handleJumpPage(newUrl)">{{ pageTitle }}</b-navbar-item>
                <slot name="custommenu"></slot>
            </template>

            <template slot="end">
                <b-navbar-item @click="handleLogin">
                    <span class="text-primary">登录</span>
                </b-navbar-item>
                <b-navbar-item @click="handleRegister">
                    <span class="text-primary">注册</span>
                </b-navbar-item>
            </template>
        </b-navbar>
    </div>
</template>
  
<script>
import Mixins from '@/utils/mixin.js'
import jsonMenus from '@/services/menu.json'
export default {
    mixins: [Mixins],
    name: 'Navbar',
    props: {
        currentActiveMenuId: {
            type: Number,
            default: 1
        },
        newPage: {
            type: Boolean,
            default: false
        },
        pageTitle: {
            type: String,
            default: '' 
        },
        newUrl: {
            type: String,
            default: '' 
        }
    },
    data() {
        return {
            menus: jsonMenus['menus'],
        }
    },
    methods: {
        handleChangeData(menu) {
            this.$emit("updateCurrentNavs", { menu_id: menu.id })
        },
        handleJumpPage(path) {
            this.$router.push({
                path: `${path}`
            })
        }
    }
}
</script>
  

<style lang="less" scoped>
.nav-brand {
    font-size: 18px;
}

.text-primary {
    color: #15b982;
}

.is-active {
    color: #7957d5 !important;
    font-weight: bold;
}

/deep/ .navbar-start {
  text-align: left;
}

/deep/ .navbar-end {
  text-align: left;
}
</style>