<template>
  <div>
    <div class="section-box">
      <UtilDesk />
    </div>
    <div class="section-box">
      <QuickTools />
    </div>
    <div class="section-box">
      <Music />
    </div>
    <div class="section-box">
      <Weather />
    </div>
    <div class="section-box task-todo">
      <Todo />
    </div>
    <div class="section-box">
      <SystemMonitoring />
    </div>
  </div>
</template>
  
<script>
import Weather from '@/components/Weather.vue'
import Todo from '@/components/Todo.vue'
import UtilDesk from '@/components/UtilDesk.vue'
import Music from '@/components/Music.vue'
import QuickTools from '@/components/tools/index.vue'
import SystemMonitoring from '@/components/SystemMonitoring.vue'
export default {
    name: 'Sidebar',
    components: {
        Weather,
        Music,
        UtilDesk,
        Todo,
        QuickTools,
      SystemMonitoring,
    },
}
</script>
  

<style lang="less" scoped>
.section-box {
    margin-bottom: 20px;
  }
</style>