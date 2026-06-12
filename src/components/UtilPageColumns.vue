<template>
  <div class="util-page-columns">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'UtilPageColumns',
}
</script>

<style lang="less" scoped>
.util-page-columns {
  :deep(.columns) {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -12px;
  }

  :deep(.column) {
    flex: 1;
    padding: 0 12px;
    min-width: 0;
  }

  :deep(.column.is-three-quarters) {
    flex: none;
    width: 75%;
  }

  :deep(.column .sidebar) {
    width: 100%;
    max-width: 100%;
  }

  @media screen and (max-width: 768px) {
    :deep(.columns) {
      flex-direction: column;
      gap: 16px;
      margin: 0;
    }

    :deep(.column.is-three-quarters),
    :deep(.column) {
      width: 100% !important;
      flex: none !important;
      padding: 0;
      max-width: 100%;
      min-width: 0;
    }

    :deep(.column.is-three-quarters) {
      order: 1;
    }

    :deep(.sidebar-column) {
      order: 2;
    }

    :deep(.global-sidebar-host),
    :deep(.sidebar) {
      width: 100%;
      max-width: 100%;
      min-width: 0;
    }
  }
}
</style>
