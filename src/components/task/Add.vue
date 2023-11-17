<template>
  <div class="popup-box">
    <div class="modal" :class="popupStatus ? 'is-active' : ''">
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            {{ popupTitle }}
          </p>
          <button class="delete" aria-label="close" @click="popupStatus = false"></button>
        </header>
        <section class="modal-card-body">
          <b-field label="待办内容：">
            <b-input size="is-small" maxlength="200" placeholder="例如：明天10点确认产品方案" type="textarea"></b-input>
          </b-field>
          <b-field label="添加执行人：">
            <b-taginput icon-pack="fas" v-model="tags" size="is-small" placeholder="添加执行人">
            </b-taginput>
          </b-field>
          <b-field label="设置截止时间：">
            <b-datepicker
                v-model="selected"
                size="is-small"
                :show-week-number="showWeekNumber"
                :locale="locale"
                icon-pack="fas"
                icon="calendar"
                :icon-right="selected ? 'close-circle' : ''"
                icon-right-clickable
                @icon-right-click="clearDate"
                trap-focus>
            </b-datepicker>
          </b-field>
          <b-field label="描述说明：">
            <b-input size="is-small" maxlength="200" placeholder="请填写描述说明，也可拖放文件到此处" type="textarea"></b-input>
          </b-field>
          <b-field label="添加参与人：">
            <b-taginput icon-pack="fas" v-model="tags" size="is-small" placeholder="添加参与人">
            </b-taginput>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success">新建</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AddTask',
  props: {
    popupStatus: {
      type: Boolean,
      default: false
    },
    popupTitle: {
      type: String,
      default: '新建待办'
    },
  },
  data() {
    return {
      selected: new Date(),
      showWeekNumber: true,
      locale: {
        firstDayOfWeek: 1,
        daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
        monthsOfYear: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
      },
      tags: []
    }
  },
  methods: {
    initPopupDialog() {
      this.popupStatus = true
    }
  }
}
</script>

<style lang="less" scoped>
.modal-card-body {
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
