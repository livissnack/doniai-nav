<template>
  <div class="util-box tools-panel">
    <header class="util-title">
      <h3 class="panel-title">常用工具</h3>
      <div class="tools-switch">
        <o-switch
          v-model="showTools"
          variant="success"
          size="small"
          @update:model-value="handleShowTools"
        />
      </div>
    </header>

    <div v-if="showTools" class="tools-body">
      <a
        v-for="(item, index) in list"
        :key="index"
        :href="item.path"
        class="tools-item"
        :class="{ 'is-recommend': item.recommend }"
      >
        <span class="tools-item__icon" :class="iconTone(index)">
          <AppIcon :name="String(item.icon).replace(/^fa-/, '')"  />
        </span>
        <span class="tools-item__name">{{ item.name }}</span>
        <AppIcon name="chevron-right" class="tools-item__arrow"  />
      </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickTools',
  data() {
    return {
      list: [
        {
          name: '中国教育在线-掌上高考',
          icon: 'fire-alt',
          path: 'https://gaokao.cn/',
          recommend: true,
        },
        {
          name: 'JSON格式化',
          icon: 'feather',
          path: '/json',
          recommend: true,
        },
        {
          name: '云笔记',
          icon: 'book',
          path: '/docs',
          recommend: true,
        },
        {
          name: '密码生成器',
          icon: 'key',
          path: '/utils/password',
          recommend: false,
        },
        {
          name: 'TV一下',
          icon: 'tv',
          path: '/player',
          recommend: false,
        },
        {
          name: 'Base64加解密',
          icon: 'bold',
          path: '/utils/base64',
          recommend: false,
        },
        {
          name: '贷款利率计算器',
          icon: 'money-bill',
          path: '/utils/loan-rate',
          recommend: false,
        },
        {
          name: '封面生成器',
          icon: 'images',
          path: '/utils/cover',
          recommend: false,
        },
      ],
      showTools: true,
    }
  },
  created() {
    this.getShowTools()
  },
  methods: {
    getShowTools() {
      const status = localStorage.getItem('doniaiNavDayToolsShowStatus')
      if (status === null) {
        return
      }
      this.showTools = status === 'true'
    },
    handleShowTools(value) {
      this.showTools = value
      localStorage.setItem('doniaiNavDayToolsShowStatus', value)
    },
    iconTone(index) {
      const tones = ['is-warm', 'is-blue', 'is-green', 'is-purple', 'is-orange']
      return tones[index % tones.length]
    },
  },
}
</script>

<style lang="less" scoped>
.tools-panel {
  background: #fff;
  padding: 10px;
  overflow: hidden;
  border: 1px solid #e8e8e8;
  border-radius: 0;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
}

.util-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px 8px;
  margin: 0;
}

.panel-title {
  margin: 0;
  font-size: 1em;
  font-weight: 700;
  color: #363636;
}

.tools-switch {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.tools-body {
  max-height: 196px;
  overflow-y: auto;
  padding: 0 2px;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 999px;
  }
}

.tools-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-width: 0;
  padding: 7px 6px;
  margin: 0;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #374151;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: #f5f7fa;
    text-decoration: none;

    .tools-item__name {
      color: #ff4500;
    }

    .tools-item__arrow {
      opacity: 1;
      transform: translateX(2px);
    }
  }

  &.is-recommend .tools-item__name {
    color: #d33d3d;
    font-weight: 500;
  }

  &.is-recommend:hover .tools-item__name {
    color: #e11d48;
  }
}

.tools-item__icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-size: 12px;
  color: #fff;

  &.is-warm { background: #f97316; }
  &.is-blue { background: #3b82f6; }
  &.is-green { background: #22c55e; }
  &.is-purple { background: #8b5cf6; }
  &.is-orange { background: #fb923c; }
}

.tools-item__name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.tools-item__arrow {
  flex-shrink: 0;
  font-size: 10px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
</style>
