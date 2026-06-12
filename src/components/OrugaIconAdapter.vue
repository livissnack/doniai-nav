<template>
  <AppIcon :name="iconName" :pack="iconPack" :size="size || '1em'" :spin="spin" />
</template>

<script>
import AppIcon from '@/components/AppIcon.vue'

export default {
  name: 'OrugaIconAdapter',
  components: { AppIcon },
  props: {
    icon: { type: [String, Array], default: '' },
    size: { type: [String, Number], default: null },
    spin: { type: Boolean, default: false },
  },
  computed: {
    iconPack() {
      const pack = Array.isArray(this.icon) ? this.icon[0] : 'fas'
      if (pack === 'fab' || pack === 'fa-brands') return 'brands'
      if (pack === 'far' || pack === 'fa-regular') return 'regular'
      return 'solid'
    },
    iconName() {
      const raw = Array.isArray(this.icon) ? this.icon[1] : this.icon
      return String(raw || '').replace(/^fa-/, '')
    },
  },
}
</script>
