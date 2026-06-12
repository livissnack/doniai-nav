<template>
  <component :is="tag" ref="host" :class="rootClass" />
</template>

<script>
import { registerSidebarHost, unregisterSidebarHost } from '@/utils/sidebarPortal'

export default {
  name: 'SidebarColumn',
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    rootClass: {
      type: [String, Array, Object],
      default: 'column sidebar-column',
    },
  },
  mounted() {
    registerSidebarHost(this.$refs.host)
  },
  activated() {
    registerSidebarHost(this.$refs.host)
  },
  deactivated() {
    unregisterSidebarHost(this.$refs.host)
  },
  beforeUnmount() {
    unregisterSidebarHost(this.$refs.host)
  },
}
</script>
