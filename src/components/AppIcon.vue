<template>
  <Icon
    :icon="iconId"
    :class="rootClass"
    :width="sizeValue"
    :height="sizeValue"
    :aria-hidden="ariaHidden"
    :aria-label="ariaLabel"
    :role="ariaLabel ? 'img' : undefined"
  />
</template>

<script>
import { Icon } from '@iconify/vue'
import { computed } from 'vue'
import { resolveFaIconName } from '@/icons/fa5Aliases'
import { parseFaClass } from '@/icons/parseFaClass'

const PACK_PREFIX = {
  solid: 'fa6-solid',
  s: 'fa6-solid',
  fas: 'fa6-solid',
  fa: 'fa6-solid',
  regular: 'fa6-regular',
  r: 'fa6-regular',
  far: 'fa6-regular',
  brands: 'fa6-brands',
  b: 'fa6-brands',
  fab: 'fa6-brands',
}

export default {
  name: 'AppIcon',
  components: { Icon },
  inheritAttrs: false,
  props: {
    name: { type: String, default: '' },
    pack: { type: String, default: 'solid' },
    iconClass: { type: String, default: '' },
    spin: { type: Boolean, default: false },
    size: { type: [String, Number], default: '1em' },
  },
  setup(props, { attrs }) {
    const iconId = computed(() => {
      let pack = props.pack
      let name = props.name
      let spin = props.spin

      if (props.iconClass) {
        const parsed = parseFaClass(props.iconClass)
        pack = parsed.pack
        name = parsed.name
        spin = spin || parsed.spin
      }

      const prefix = PACK_PREFIX[pack] || PACK_PREFIX.solid
      const resolved = resolveFaIconName(name)
      return { id: `${prefix}:${resolved}`, spin }
    })

    const resolvedSpin = computed(() => iconId.value.spin)
    const resolvedIconId = computed(() => iconId.value.id)

    const rootClass = computed(() => {
      const list = ['app-icon']
      if (resolvedSpin.value) list.push('app-icon--spin')
      if (attrs.class) list.push(attrs.class)
      return list
    })

    const sizeValue = computed(() => props.size || '1em')

    return {
      iconId: resolvedIconId,
      rootClass,
      sizeValue,
      ariaHidden: attrs['aria-hidden'],
      ariaLabel: attrs['aria-label'],
    }
  },
}
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: -0.125em;
  line-height: 1;
}

.app-icon--spin {
  animation: app-icon-spin 1s linear infinite;
}

@keyframes app-icon-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
