export default {
  data() {
    return {}
  },
  methods: {
    handleLogin() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: '登录功能尚未开放！',
        type: 'is-info',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    },
    handleRegister() {
      this.$buefy.snackbar.open({
        duration: 3000,
        message: '注册该功能尚未开放！',
        type: 'is-info',
        position: 'is-bottom-right',
        actionText: 'Msg'
      })
    }
  }
}
