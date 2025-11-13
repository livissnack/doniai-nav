<!-- src/components/CompactMonitor.vue -->
<template>
  <div class="compact-monitor">
    <div class="monitor-header">
      <h3 class="monitor-title">🖥️ 服务器监控</h3>
      <select v-model="selectedServerId" @change="handleServerChange" class="server-select">
        <option v-for="server in servers" :key="server.id" :value="server.id">
          {{ server.name }}
        </option>
      </select>
    </div>

    <div class="monitor-content">
      <!-- 服务器基础信息表格 -->
      <div class="info-table">
        <div class="table-row header">
          <div class="table-cell">属性</div>
          <div class="table-cell">值</div>
        </div>
        <div class="table-row" v-for="(value, key) in currentServer.info" :key="key">
          <div class="table-cell">{{ getLabel(key) }}</div>
          <div class="table-cell">{{ key === 'expiryDate' ? getDaysRemaining(value) : value }}</div>
        </div>
      </div>

      <!-- 系统资源使用情况 -->
      <div class="resource-section">
        <h4 class="section-title">💻 系统资源</h4>
        <div class="resource-item">
          <div class="resource-label">CPU 使用率</div>
          <div class="resource-progress">
            <div class="progress-bar">
              <div class="progress-fill cpu" :style="{ width: currentServer.resources.cpuUsage + '%' }"></div>
            </div>
            <div class="resource-value">{{ currentServer.resources.cpuUsage }}%</div>
          </div>
        </div>

        <div class="resource-item">
          <div class="resource-label">内存使用</div>
          <div class="resource-progress">
            <div class="progress-bar">
              <div class="progress-fill memory" :style="{ width: currentServer.resources.memoryUsage + '%' }"></div>
            </div>
            <div class="resource-value">{{ currentServer.resources.memoryUsed }}/{{ currentServer.resources.memoryTotal }}</div>
          </div>
        </div>

        <div class="resource-item">
          <div class="resource-label">硬盘使用</div>
          <div class="resource-progress">
            <div class="progress-bar">
              <div class="progress-fill disk" :style="{ width: currentServer.resources.diskUsage + '%' }"></div>
            </div>
            <div class="resource-value">{{ currentServer.resources.diskUsed }}/{{ currentServer.resources.diskTotal }}</div>
          </div>
        </div>
      </div>

      <!-- 网络流量信息 -->
      <div class="network-info">
        <h4 class="section-title">🌐 网络流量</h4>
        <div class="traffic-item">
          <span class="traffic-label">📤 上传</span>
          <span class="traffic-value">{{ formatBytes(currentServer.network.uploadTotal) }}</span>
        </div>
        <div class="traffic-item">
          <span class="traffic-label">📥 下载</span>
          <span class="traffic-value">{{ formatBytes(currentServer.network.downloadTotal) }}</span>
        </div>
        <div class="traffic-item">
          <span class="traffic-label">📈 上传速度</span>
          <span class="traffic-value">{{ formatBytes(currentServer.network.uploadSpeed) }}/s</span>
        </div>
        <div class="traffic-item">
          <span class="traffic-label">📉 下载速度</span>
          <span class="traffic-value">{{ formatBytes(currentServer.network.downloadSpeed) }}/s</span>
        </div>
      </div>
    </div>

    <div class="monitor-footer">
      <button class="refresh-btn" @click="refreshData">🔄 刷新</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CompactMonitor',
  data() {
    return {
      selectedServerId: 1,
      servers: [
        {
          id: 1,
          name: '主服务器',
          info: {
            os: 'Ubuntu 20.04',
            cpu: 'Intel i7-9700K',
            memory: '32GB',
            expiryDate: '2024-12-31'
          },
          resources: {
            cpuUsage: 45,
            memoryUsed: '12.8GB',
            memoryTotal: '32GB',
            memoryUsage: 40,
            diskUsed: '128GB',
            diskTotal: '512GB',
            diskUsage: 25
          },
          network: {
            uploadTotal: 123456789,
            downloadTotal: 987654321,
            uploadSpeed: 1024000,
            downloadSpeed: 2048000
          }
        },
        {
          id: 2,
          name: '备份服务器',
          info: {
            os: 'CentOS 8',
            cpu: 'AMD Ryzen 7',
            memory: '16GB',
            expiryDate: '2025-06-30'
          },
          resources: {
            cpuUsage: 30,
            memoryUsed: '6.2GB',
            memoryTotal: '16GB',
            memoryUsage: 39,
            diskUsed: '200GB',
            diskTotal: '1TB',
            diskUsage: 20
          },
          network: {
            uploadTotal: 456789123,
            downloadTotal: 321987654,
            uploadSpeed: 512000,
            downloadSpeed: 1024000
          }
        }
      ]
    }
  },
  computed: {
    currentServer() {
      return this.servers.find(server => server.id === this.selectedServerId) || this.servers[0];
    }
  },
  methods: {
    getLabel(key) {
      const labels = {
        os: '操作系统',
        cpu: '处理器',
        memory: '内存',
        expiryDate: '到期时间'
      };
      return labels[key] || key;
    },
    getDaysRemaining(expiryDate) {
      const today = new Date();
      const expiry = new Date(expiryDate);
      const diffTime = expiry - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${diffDays} 天`;
    },
    handleServerChange() {
      console.log('切换到服务器:', this.currentServer.name);
    },
    refreshData() {
      // 模拟刷新数据
      console.log('刷新数据');
    },
    formatBytes(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
  }
}
</script>

<style scoped>
.compact-monitor {
  max-width: 400px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 16px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.monitor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.monitor-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.server-select {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  font-size: 14px;
}

.monitor-content {
  margin-bottom: 16px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.table-row {
  display: flex;
  border-bottom: 1px solid #eee;
}

.table-row.header {
  background-color: #f1f3f4;
  font-weight: 600;
}

.table-cell {
  padding: 8px 12px;
  flex: 1;
  font-size: 14px;
}

.table-cell:first-child {
  flex: 0 0 80px;
  color: #666;
}

.section-title {
  margin: 0 0 10px 0;
  font-size: 15px;
  font-weight: 600;
  color: #444;
  border-bottom: 1px solid #eee;
  padding-bottom: 6px;
}

.resource-section {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  margin-bottom: 16px;
}

.resource-item {
  margin-bottom: 12px;
}

.resource-item:last-child {
  margin-bottom: 0;
}

.resource-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.resource-progress {
  display: flex;
  align-items: center;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 10px;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
}

.progress-fill.cpu {
  background: linear-gradient(90deg, #ff9a9e, #fad0c4);
}

.progress-fill.memory {
  background: linear-gradient(90deg, #a1c4fd, #c2e9fb);
}

.progress-fill.disk {
  background: linear-gradient(90deg, #ffecd2, #fcb69f);
}

.resource-value {
  font-size: 13px;
  font-weight: 500;
  min-width: 70px;
  text-align: right;
}

.network-info {
  background: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.traffic-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.traffic-item:last-child {
  margin-bottom: 0;
}

.traffic-label {
  color: #666;
  font-size: 14px;
}

.traffic-value {
  font-weight: 500;
  font-size: 14px;
}

.monitor-footer {
  text-align: center;
}

.refresh-btn {
  padding: 8px 16px;
  background: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;
}

.refresh-btn:hover {
  background: #3367d6;
}
</style>
