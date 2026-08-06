<template>
  <div class="files-panel">
    <div class="files-toolbar">
      <div class="breadcrumb-wrap">
        <span class="breadcrumb-icon" title="文件存储">
          <AppIcon name="hdd" />
        </span>
        <nav class="path-tabs" aria-label="目录路径">
          <button
            type="button"
            class="path-tab"
            :class="{ active: !pathSegments.length }"
            @click="goRoot"
          >
            全部文件
          </button>
          <template v-for="(seg, i) in crumbParts.head" :key="`h-${i}-${seg.name}`">
            <span class="path-sep" aria-hidden="true"><AppIcon name="chevron-right" /></span>
            <button type="button" class="path-tab" @click="goTo(seg.index)">{{ seg.name }}</button>
          </template>
          <template v-if="crumbParts.middle.length">
            <span class="path-sep" aria-hidden="true"><AppIcon name="chevron-right" /></span>
            <div class="crumb-more" v-click-outside="() => (showCrumbMore = false)">
              <button type="button" class="path-tab" @click="showCrumbMore = !showCrumbMore">…</button>
              <div v-if="showCrumbMore" class="crumb-dropdown">
                <button
                  v-for="seg in crumbParts.middle"
                  :key="`m-${seg.index}`"
                  type="button"
                  @click="goTo(seg.index); showCrumbMore = false"
                >
                  {{ seg.name }}
                </button>
              </div>
            </div>
          </template>
          <template v-for="seg in crumbParts.tail" :key="`t-${seg.index}-${seg.name}`">
            <span class="path-sep" aria-hidden="true"><AppIcon name="chevron-right" /></span>
            <button
              type="button"
              class="path-tab"
              :class="{ active: seg.index === pathSegments.length - 1 }"
              :title="seg.name"
              @click="goTo(seg.index)"
            >
              {{ seg.name }}
            </button>
          </template>
        </nav>
        <span v-if="quotaText" class="quota-chip" :title="quotaText">{{ quotaText }}</span>
      </div>
      <div class="tool-btns">
        <div class="search-box">
          <AppIcon name="search" />
          <input v-model="listKeyword" type="search" placeholder="搜索当前目录…" />
        </div>
        <div class="create-menu" v-click-outside="closeCreateMenu">
          <button
            type="button"
            class="btn-tool"
            :class="{ open: showCreateMenu }"
            @click="showCreateMenu = !showCreateMenu"
          >
            <AppIcon name="plus" /> 新建
            <AppIcon name="chevron-down" class="caret" />
          </button>
          <div v-if="showCreateMenu" class="create-dropdown" role="menu">
            <button
              v-for="t in newFileTypes"
              :key="t.kind"
              type="button"
              class="create-item"
              role="menuitem"
              @click="openCreateFileModal(t)"
            >
              <span class="create-item__icon" :class="fileKindClass(t.kind)">
                <AppIcon :name="t.icon" />
              </span>
              <span class="create-item__text">
                <strong>{{ t.label }}</strong>
                <em>{{ t.ext }}</em>
              </span>
            </button>
            <div class="create-divider" />
            <button type="button" class="create-item" role="menuitem" @click="newFolderFromMenu">
              <span class="create-item__icon folder">
                <AppIcon name="folder-plus" />
              </span>
              <span class="create-item__text">
                <strong>文件夹</strong>
              </span>
            </button>
          </div>
        </div>
        <button type="button" class="btn-upload primary" @click="openUploadModal">
          <AppIcon name="cloud-upload-alt" /> 上传
        </button>
        <button type="button" class="btn-tool icon-only" title="回收站" @click="openTrashModal">
          <AppIcon name="trash-alt" />
        </button>
        <button type="button" class="btn-tool icon-only" title="刷新" @click="loadList(); refreshQuota()">
          <AppIcon name="sync-alt" />
        </button>
      </div>
    </div>

    <div v-if="selectedPaths.length > 1" class="batch-bar">
      <span>已选 {{ selectedPaths.length }} 项</span>
      <button type="button" class="btn-tool" @click="batchMoveSelected">移动</button>
      <button type="button" class="btn-tool danger" @click="openBatchDelete">删除</button>
      <button type="button" class="btn-ghost" @click="clearSelection">取消选择</button>
    </div>

    <div
      class="files-workspace"
      :class="{ 'has-viewer': useSplitViewer }"
    >
    <div
      class="files-body"
      :class="{ 'drop-over': listDropOver }"
      @contextmenu.prevent="onBlankContextMenu"
      @dragover="onListDragOver"
      @dragleave="onListDragLeave"
      @drop.prevent="onListDrop"
    >
      <div v-if="loading" class="files-loading">
        <AppIcon name="spinner" spin />
        <p>加载文件列表…</p>
      </div>
      <div v-else class="files-list" @click="closeCtxMenu">
        <div class="files-list-head">
          <span class="col-name sortable" @click="toggleSort('name')">
            名称
            <em v-if="sortKey === 'name'">{{ sortDir === 'asc' ? '↑' : '↓' }}</em>
          </span>
          <span class="col-size sortable" @click="toggleSort('size')">
            大小
            <em v-if="sortKey === 'size'">{{ sortDir === 'asc' ? '↑' : '↓' }}</em>
          </span>
          <span class="col-time sortable" @click="toggleSort('mtime')">
            修改时间
            <em v-if="sortKey === 'mtime'">{{ sortDir === 'asc' ? '↑' : '↓' }}</em>
          </span>
        </div>

        <div
          v-if="currentPath"
          class="file-row is-up"
          @dblclick="goUp"
          @dragover.prevent="onDragOverParent"
          @dragleave="onDragLeaveParent"
          @drop.prevent="onDropToParent"
          :class="{ 'is-drop': dropTargetPath === '..' }"
        >
          <span class="file-cell">
            <span class="file-icon up"><AppIcon name="level-up-alt" /></span>
            <span class="file-text">
              <span class="file-name">返回上级目录</span>
            </span>
          </span>
          <span class="col-size">—</span>
          <span class="col-time">—</span>
        </div>

        <div
          v-for="item in displayItems"
          :key="item.path"
          class="file-row"
          :class="{
            selected: isSelected(item.path),
            'is-dir': item.isDir,
            'is-drop': dropTargetPath === item.path,
            'is-dragging': dragPath === item.path,
            'is-renaming': renamingPath === item.path,
            'is-open': viewerPath === item.path && viewerOpen,
          }"
          :draggable="renamingPath !== item.path"
          :title="fileTitle(item)"
          @click.stop="selectItem(item, $event)"
          @dblclick="onRowDblClick(item)"
          @contextmenu.prevent.stop="openCtxMenu(item, $event)"
          @dragstart="onDragStart(item, $event)"
          @dragend="onDragEnd"
          @dragover.prevent="onDragOverItem(item, $event)"
          @dragleave="onDragLeaveItem(item)"
          @drop.prevent="onDropItem(item)"
        >
          <span class="file-cell">
            <span class="file-icon" :class="item.isDir ? 'folder' : fileIconClass(item)">
              <AppIcon :name="item.isDir ? 'folder' : fileIcon(item)" />
            </span>
            <span class="file-text">
              <input
                v-if="renamingPath === item.path"
                :ref="(el) => setRenameInputRef(el, item.path)"
                v-model="renameDraft"
                class="file-rename-input"
                maxlength="120"
                @click.stop
                @dblclick.stop
                @keydown.enter.prevent="commitInlineRename"
                @keydown.esc.prevent="cancelInlineRename"
                @blur="commitInlineRename"
              />
              <template v-else>
                <span class="file-name" :title="item.name">{{ item.name }}</span>
                <span v-if="!item.isDir" class="file-sub">
                  {{ formatSize(item.size) }} · {{ formatTime(item.updatedAt) }}
                </span>
              </template>
            </span>
          </span>
          <span class="col-size">{{ item.isDir ? '—' : formatSize(item.size) }}</span>
          <span class="col-time">{{ formatTime(item.updatedAt) }}</span>
          <div class="row-actions" @click.stop @dblclick.stop>
            <button
              v-if="item.isDir && renamingPath !== item.path"
              type="button"
              class="icon-act"
              title="打包下载"
              @click="downloadItem(item)"
            >
              <AppIcon name="download" />
            </button>
            <button
              v-if="!item.isDir && renamingPath !== item.path"
              type="button"
              class="icon-act"
              title="打开"
              @click="openItem(item)"
            >
              <AppIcon name="folder-open" />
            </button>
            <button
              v-if="!item.isDir && renamingPath !== item.path"
              type="button"
              class="icon-act"
              title="下载"
              @click="downloadItem(item)"
            >
              <AppIcon name="download" />
            </button>
            <button
              v-if="renamingPath !== item.path"
              type="button"
              class="icon-act more"
              title="更多"
              @click="openCtxMenu(item, $event)"
            >
              <AppIcon name="ellipsis-v" />
            </button>
          </div>
        </div>

        <div v-if="!displayItems.length" class="empty-state">
          <div class="empty-illus">
            <AppIcon name="inbox" />
          </div>
          <p>{{ listKeyword ? '无匹配文件' : '文件夹为空' }}</p>
          <span>{{ listKeyword ? '试试其他关键词' : '点击「新建」创建文档，或拖拽文件到此处上传' }}</span>
          <div class="empty-actions">
            <button type="button" class="btn-tool" @click="showCreateMenu = true">
              <AppIcon name="plus" /> 新建
            </button>
            <button type="button" class="btn-upload primary" @click="openUploadModal">
              <AppIcon name="cloud-upload-alt" /> 上传
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 上传弹窗 -->
    <div v-if="showUploadModal" class="modal-mask" @click.self="closeUploadModal">
      <div class="modal-box upload-modal" role="dialog" aria-labelledby="upload-title">
        <header class="modal-head">
          <h3 id="upload-title">上传文件</h3>
          <button type="button" class="btn-close" :disabled="uploadBusy" @click="closeUploadModal">
            <AppIcon name="times" />
          </button>
        </header>
        <p class="modal-desc">
          目标目录：{{ currentPath || '全部文件' }} · 支持多文件，可拖拽到下方区域
        </p>
        <div
          class="drop-zone"
          :class="{ over: dragOver, busy: uploadBusy }"
          @dragenter.prevent="onDragEnter"
          @dragover.prevent="onDragOver"
          @dragleave.prevent="onDragLeave"
          @drop.prevent="onDropFiles"
          @click="triggerUploadPick"
        >
          <AppIcon name="cloud-upload-alt" />
          <p>拖拽文件到此处，或点击选择</p>
          <span>支持同时选择多个文件</span>
          <input
            ref="uploadInput"
            type="file"
            multiple
            hidden
            @change="onPickFiles"
          />
        </div>

        <ul v-if="uploadQueue.length" class="upload-list">
          <li v-for="job in uploadQueue" :key="job.id" class="upload-item">
            <div class="upload-item__top">
              <span class="upload-item__name" :title="job.name">{{ job.name }}</span>
              <span class="upload-item__status" :class="`is-${job.status}`">
                {{ uploadStatusLabel(job) }}
              </span>
            </div>
            <div class="upload-bar">
              <div class="upload-bar__fill" :style="{ width: `${job.progress}%` }" />
            </div>
            <div class="upload-item__meta">
              <span>{{ formatSize(job.size) }}</span>
              <span v-if="job.error" class="upload-item__err">{{ job.error }}</span>
              <span class="upload-item__acts">
                <button
                  v-if="job.status === 'error'"
                  type="button"
                  class="link-btn"
                  @click="retryUploadJob(job)"
                >
                  重试
                </button>
                <button
                  v-if="job.status === 'pending' || job.status === 'uploading'"
                  type="button"
                  class="link-btn"
                  @click="cancelUploadJob(job)"
                >
                  取消
                </button>
                <button
                  v-if="job.status !== 'uploading'"
                  type="button"
                  class="link-btn danger"
                  @click="removeUploadJob(job)"
                >
                  移除
                </button>
              </span>
            </div>
          </li>
        </ul>

        <footer class="modal-foot">
          <label class="conflict-select">
            同名文件
            <select v-model="uploadConflict" :disabled="uploadBusy">
              <option value="rename">自动重命名</option>
              <option value="overwrite">覆盖</option>
              <option value="error">跳过/报错</option>
            </select>
          </label>
          <button type="button" class="btn-ghost" :disabled="uploadBusy" @click="closeUploadModal">
            {{ uploadBusy ? '上传中…' : '关闭' }}
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="uploadBusy || !uploadQueue.some((j) => j.status === 'pending')"
            @click="startUploadQueue"
          >
            {{ uploadBusy ? '上传中…' : '开始上传' }}
          </button>
        </footer>
      </div>
    </div>

    <!-- 新建文件 -->
    <div v-if="showNameModal" class="doc-modal-mask" @click.self="closeNameModal">
      <div class="doc-modal" role="dialog" :aria-labelledby="nameModalTitleId">
        <div class="doc-modal-icon" :class="nameModalIconClass">
          <AppIcon :name="nameModalIcon" />
        </div>
        <h3 :id="nameModalTitleId" class="doc-modal-title">{{ nameModalTitle }}</h3>
        <p class="doc-modal-desc">{{ nameModalDesc }}</p>
        <div class="doc-modal-form">
          <div class="field-hint">
            <AppIcon name="folder-open" />
            <span>位置：{{ currentPathLabel }}</span>
          </div>
          <label class="field-label">名称 <span class="required">*</span></label>
          <input
            ref="nameModalInput"
            v-model="nameModalValue"
            type="text"
            class="field-input"
            maxlength="120"
            @keyup.enter="confirmNameModal"
          />
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="nameModalBusy" @click="closeNameModal">
            取消
          </button>
          <button
            type="button"
            class="btn-primary"
            :disabled="nameModalBusy || !nameModalValue.trim()"
            @click="confirmNameModal"
          >
            <AppIcon v-if="nameModalBusy" name="spinner" spin />
            {{ nameModalBusy ? '处理中…' : nameModalConfirmLabel }}
          </button>
        </div>
      </div>
    </div>

    <!-- 移动到 -->
    <div v-if="showMoveModal" class="doc-modal-mask" @click.self="closeMoveModal">
      <div class="doc-modal doc-modal--wide" role="dialog" aria-labelledby="move-modal-title">
        <div class="doc-modal-icon doc-modal-icon--folder">
          <AppIcon name="folder" />
        </div>
        <h3 id="move-modal-title" class="doc-modal-title">移动到</h3>
        <p class="doc-modal-desc">
          将「{{ moveItem?.name }}」移动到所选文件夹
        </p>
        <div class="move-browser">
          <div class="move-path">
            <button type="button" class="path-chip" :class="{ active: !moveBrowsePath }" @click="browseMove('')">
              全部文件
            </button>
            <template v-for="(seg, i) in moveBrowseSegments" :key="`m-${i}-${seg}`">
              <AppIcon name="chevron-right" class="move-sep" />
              <button
                type="button"
                class="path-chip"
                :class="{ active: i === moveBrowseSegments.length - 1 }"
                @click="browseMoveToIndex(i)"
              >
                {{ seg }}
              </button>
            </template>
          </div>
          <div class="move-list">
            <button
              v-if="moveBrowsePath"
              type="button"
              class="move-row"
              @dblclick="browseMoveParent"
            >
              <AppIcon name="level-up-alt" />
              <span>上级目录</span>
            </button>
            <button
              v-for="f in moveFolders"
              :key="f.path"
              type="button"
              class="move-row"
              :disabled="f.path === moveItem?.path"
              @dblclick="browseMove(f.path)"
              @click="moveBrowsePath = f.path"
            >
              <AppIcon name="folder" />
              <span>{{ f.name }}</span>
              <AppIcon name="chevron-right" class="row-go" />
            </button>
            <div v-if="!moveFolders.length" class="move-empty">此目录下没有子文件夹</div>
          </div>
          <p class="move-target">
            目标：<strong>{{ moveBrowsePath || '全部文件（根目录）' }}</strong>
          </p>
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="moveBusy" @click="closeMoveModal">取消</button>
          <button type="button" class="btn-primary" :disabled="moveBusy" @click="confirmMove">
            <AppIcon v-if="moveBusy" name="spinner" spin />
            {{ moveBusy ? '移动中…' : '移动到此处' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 删除确认 -->
    <div v-if="showDeleteModal" class="doc-modal-mask" @click.self="closeDeleteModal">
      <div class="doc-modal doc-modal--danger" role="dialog" aria-labelledby="files-delete-title">
        <div class="doc-modal-icon doc-modal-icon--danger">
          <AppIcon name="trash-alt" />
        </div>
        <h3 id="files-delete-title" class="doc-modal-title">确认删除</h3>
        <p class="doc-modal-desc">
          确定将「{{ deleteTarget?.name }}」{{ deleteTarget?.isDir && !deleteTarget?._batch ? '及其内容' : '' }}移入回收站吗？
          <br />
          <span class="doc-modal-warn">可在回收站中恢复</span>
        </p>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" :disabled="deleting" @click="closeDeleteModal">取消</button>
          <button type="button" class="btn-danger" :disabled="deleting" @click="confirmDelete">
            <AppIcon v-if="deleting" name="spinner" spin />
            {{ deleting ? '删除中…' : '确认删除' }}
          </button>
        </div>
      </div>
    </div>

    <teleport to="body">
      <ul
        v-if="ctx.visible"
        class="files-ctx-menu"
        :style="{ left: ctx.x + 'px', top: ctx.y + 'px' }"
        @click.stop
      >
        <template v-if="ctx.item">
          <li @click="ctxOpen">
            <AppIcon name="folder-open" />
            <span>打开</span>
          </li>
          <li v-if="!ctx.item.isDir" @click="ctxDownload">
            <AppIcon name="download" />
            <span>下载</span>
          </li>
          <li @click="ctxRename">
            <AppIcon name="edit" />
            <span>重命名</span>
          </li>
          <li @click="ctxMove">
            <AppIcon name="folder" />
            <span>移动到…</span>
          </li>
          <li v-if="ctx.item.isDir" @click="ctxDownloadZip">
            <AppIcon name="file-archive" />
            <span>打包下载</span>
          </li>
          <li v-if="!ctx.item.isDir" @click="ctxDuplicate">
            <AppIcon name="clone" />
            <span>创建副本</span>
          </li>
          <li @click="ctxCopyPath">
            <AppIcon name="copy" />
            <span>复制路径</span>
          </li>
          <li class="danger" @click="ctxDelete">
            <AppIcon name="trash-alt" />
            <span>删除</span>
          </li>
        </template>
        <template v-else>
          <li @click="openCreateFileModal(newFileTypes[0])">
            <AppIcon name="file-word" />
            <span>新建 Word</span>
          </li>
          <li @click="openCreateFileModal(newFileTypes[1])">
            <AppIcon name="file-excel" />
            <span>新建 Excel</span>
          </li>
          <li @click="openCreateFolderModal">
            <AppIcon name="folder-plus" />
            <span>新建文件夹</span>
          </li>
          <li @click="openUploadModal(); closeCtxMenu()">
            <AppIcon name="cloud-upload-alt" />
            <span>上传文件</span>
          </li>
          <li @click="loadList(); closeCtxMenu()">
            <AppIcon name="sync-alt" />
            <span>刷新</span>
          </li>
        </template>
      </ul>
    </teleport>

    <!-- 预览 / 编辑 -->
    <div
      v-if="viewerOpen"
      class="viewer-mask"
      :class="{ 'viewer-mask--split': useSplitViewer }"
      @click.self="requestCloseViewer"
    >
      <div
        class="viewer-box"
        :class="{
          'viewer-box--wide': ['excel', 'word', 'ppt', 'video', 'markdown'].includes(viewerMode),
          'viewer-box--media': ['video', 'audio'].includes(viewerMode),
          'viewer-box--split': useSplitViewer,
        }"
      >
        <header class="viewer-head">
          <span class="viewer-title">
            <AppIcon name="file" />
            {{ viewerName }}
            <em v-if="viewerDirty" class="dirty-dot">未保存</em>
          </span>
          <div class="viewer-actions">
            <template v-if="viewerMode === 'markdown'">
              <button
                type="button"
                class="btn-tool"
                :class="{ active: !mdPreview }"
                @click="mdPreview = false"
              >
                编辑
              </button>
              <button
                type="button"
                class="btn-tool"
                :class="{ active: mdPreview }"
                @click="mdPreview = true"
              >
                预览
              </button>
            </template>
            <button
              v-if="canSave"
              type="button"
              class="btn-save"
              :disabled="viewerSaving"
              @click="saveViewer"
            >
              <AppIcon :name="viewerSaving ? 'spinner' : 'save'" :spin="viewerSaving" />
              保存
            </button>
            <button type="button" class="btn-tool" @click="downloadViewer">
              <AppIcon name="download" />
              下载
            </button>
            <button type="button" class="btn-close" @click="requestCloseViewer">
              <AppIcon name="times" />
            </button>
          </div>
        </header>
        <div class="viewer-body">
          <textarea
            v-if="viewerMode === 'text' || (viewerMode === 'markdown' && !mdPreview)"
            v-model="textContent"
            class="text-editor"
          />
          <div
            v-else-if="viewerMode === 'markdown' && mdPreview"
            class="md-preview"
            v-html="mdHtml"
          />
          <UniverOfficeViewer
            v-else-if="['excel', 'word', 'ppt'].includes(viewerMode) && officeBuffer"
            ref="univerViewer"
            :mode="univerMode"
            :buffer="officeBuffer"
            :file-name="viewerName"
            @error="onUniverError"
          />
          <div v-else-if="viewerMode === 'video'" class="media-view">
            <video
              ref="mediaEl"
              class="video-el"
              controls
              autoplay
              playsinline
            />
          </div>
          <div v-else-if="viewerMode === 'audio'" class="media-view media-view--audio">
            <div class="audio-card">
              <AppIcon name="music" class="audio-icon" />
              <p class="audio-name">{{ viewerName }}</p>
              <audio ref="mediaEl" class="audio-el" controls autoplay />
            </div>
          </div>
          <div v-else-if="viewerMode === 'unsupported'" class="unsupported-view">
            <p>该格式暂不支持在线预览。请下载后用本地软件打开。</p>
            <button type="button" class="btn-tool" @click="downloadViewer">下载文件</button>
          </div>
          <img
            v-else-if="viewerMode === 'image' && viewerBlobUrl"
            :src="viewerBlobUrl"
            class="img-view"
            alt=""
          />
          <iframe
            v-else-if="viewerMode === 'pdf' && viewerBlobUrl"
            :src="viewerBlobUrl"
            class="pdf-view"
          />
        </div>
      </div>
    </div>
    </div>

    <!-- 回收站 -->
    <div v-if="showTrashModal" class="doc-modal-mask" @click.self="showTrashModal = false">
      <div class="doc-modal doc-modal--wide" role="dialog">
        <div class="doc-modal-icon doc-modal-icon--danger"><AppIcon name="trash-alt" /></div>
        <h3 class="doc-modal-title">回收站</h3>
        <p class="doc-modal-desc">删除的文件可在此恢复或彻底清除</p>
        <div class="trash-list">
          <div v-if="!trashItems.length" class="move-empty">回收站为空</div>
          <label v-for="t in trashItems" :key="t.id" class="trash-row">
            <input v-model="trashSelected" type="checkbox" :value="t.id" />
            <span class="trash-name">{{ t.name }}</span>
            <span class="trash-meta">{{ t.originalPath }}</span>
          </label>
        </div>
        <div class="doc-modal-foot">
          <button type="button" class="btn-ghost" @click="showTrashModal = false">关闭</button>
          <button
            type="button"
            class="btn-tool"
            :disabled="trashBusy || !trashSelected.length"
            @click="restoreTrash(trashSelected)"
          >
            恢复
          </button>
          <button
            type="button"
            class="btn-danger"
            :disabled="trashBusy || !trashSelected.length"
            @click="purgeTrash(trashSelected)"
          >
            彻底删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  fetchFileList,
  createFolder,
  uploadFileWithProgress,
  uploadBinary,
  renameFile,
  moveFile,
  copyFile,
  batchFiles,
  deleteFile,
  fetchTrash,
  fetchQuota,
  fetchFileText,
  saveFileText,
  fetchFileBlob,
  downloadZipFolder,
  streamFileUrl,
} from '@/services/filesApi'
import { formatFileSize, normalizeFileItem } from '@/utils/formatFileSize'
import { univerSnapshotToXlsxBlob } from '@/utils/univerWorkbook'
import { documentSnapshotToDocxBlob } from '@/utils/univerDoc'
import { slideSnapshotToPptxBlob } from '@/utils/univerSlide'
import { prefetchUniver, logUniverPerf } from '@/utils/univerLoad'
import {
  NEW_FILE_TYPES,
  buildEmptyFileBlob,
  normalizeNewFileName,
  uniqueFileName,
  joinFilePath,
} from '@/utils/createEmptyFile'
import { isVideoExt, isAudioExt, mediaMime } from '@/utils/fileMedia'
import { collapseBreadcrumb, filterAndSortItems, formatQuota } from '@/utils/filesPanelLogic'
import { renderMarkdown } from '@/utils/markdown'
import UniverOfficeViewer from '@/components/docs/UniverOfficeViewer.vue'

let uploadSeq = 0

export default {
  name: 'FilesPanel',
  components: { UniverOfficeViewer },
  props: {
    active: { type: Boolean, default: true },
    initialFile: { type: String, default: '' },
  },
  directives: {
    clickOutside: {
      mounted(el, binding) {
        el._clickOutside = (e) => {
          if (!el.contains(e.target)) binding.value(e)
        }
        document.addEventListener('click', el._clickOutside)
      },
      unmounted(el) {
        document.removeEventListener('click', el._clickOutside)
      },
    },
  },
  data() {
    return {
      currentPath: '',
      items: [],
      loading: false,
      selectedPath: '',
      selectedPaths: [],
      lastClickedPath: '',
      listKeyword: '',
      sortKey: 'name',
      sortDir: 'asc',
      quota: null,
      showTrashModal: false,
      trashItems: [],
      trashSelected: [],
      trashBusy: false,
      uploadConflict: 'rename',
      uploadConcurrency: 2,
      viewerDirty: false,
      textBaseline: '',
      mdPreview: true,
      listDropOver: false,
      listLoaded: false,
      showCrumbMore: false,
      narrow: false,
      viewerOpen: false,
      viewerPath: '',
      viewerName: '',
      viewerMode: '',
      viewerSaving: false,
      textContent: '',
      officeBuffer: null,
      viewerBlobUrl: '',
      showUploadModal: false,
      showCreateMenu: false,
      newFileTypes: NEW_FILE_TYPES,
      creatingFile: false,
      dragOver: false,
      dragDepth: 0,
      uploadBusy: false,
      uploadQueue: [],
      // name modal: create-file | create-folder
      showNameModal: false,
      nameModalMode: '',
      nameModalValue: '',
      nameModalBusy: false,
      nameModalType: null,
      // inline rename
      renamingPath: '',
      renameDraft: '',
      renameSaving: false,
      renameItem: null,
      _renameInputs: {},
      _renameSkipBlur: false,
      // move
      showMoveModal: false,
      moveItem: null,
      moveBrowsePath: '',
      moveFolders: [],
      moveBusy: false,
      // delete
      showDeleteModal: false,
      deleteTarget: null,
      deleting: false,
      // context + dnd
      ctx: { visible: false, x: 0, y: 0, item: null },
      dragPath: '',
      dropTargetPath: '',
      _mediaPlayer: null,
    }
  },
  computed: {
    pathSegments() {
      if (!this.currentPath) return []
      return this.currentPath.split('/').filter(Boolean)
    },
    currentPathLabel() {
      return this.currentPath || '全部文件（根目录）'
    },
    canSave() {
      return ['text', 'markdown', 'excel', 'word', 'ppt'].includes(this.viewerMode)
    },
    mdHtml() {
      if (this.viewerMode !== 'markdown') return ''
      try {
        return renderMarkdown(this.textContent || '')
      } catch {
        return ''
      }
    },
    univerMode() {
      if (this.viewerMode === 'word') return 'doc'
      if (this.viewerMode === 'ppt') return 'slide'
      return 'sheet'
    },
    nameModalTitleId() {
      return `files-name-modal-${this.nameModalMode || 'x'}`
    },
    nameModalTitle() {
      if (this.nameModalMode === 'create-folder') return '新建文件夹'
      return this.nameModalType?.label ? `新建${this.nameModalType.label}` : '新建文件'
    },
    nameModalDesc() {
      if (this.nameModalMode === 'create-folder') return '用于整理文件的目录'
      return '将创建空白文件并自动打开'
    },
    nameModalConfirmLabel() {
      return '创建'
    },
    nameModalIcon() {
      if (this.nameModalMode === 'create-folder') return 'folder-plus'
      return this.nameModalType?.icon || 'file'
    },
    nameModalIconClass() {
      if (this.nameModalMode === 'create-folder') return 'doc-modal-icon--folder'
      const k = this.nameModalType?.kind
      if (k === 'docx') return 'doc-modal-icon--page'
      if (k === 'xlsx') return 'doc-modal-icon--project'
      return 'doc-modal-icon--page'
    },
    moveBrowseSegments() {
      if (!this.moveBrowsePath) return []
      return this.moveBrowsePath.split('/').filter(Boolean)
    },
    displayItems() {
      return filterAndSortItems(this.items, {
        keyword: this.listKeyword,
        sortKey: this.sortKey,
        sortDir: this.sortDir,
      })
    },
    crumbParts() {
      return collapseBreadcrumb(this.pathSegments)
    },
    quotaText() {
      if (!this.quota) return ''
      return `${formatQuota(this.quota.used)} / ${formatQuota(this.quota.limit)}`
    },
    hasMultiSelection() {
      return this.selectedPaths.length > 1
    },
    isNarrow() {
      return this.narrow
    },
    useSplitViewer() {
      return this.viewerOpen && !this.narrow
    },
  },
  watch: {
    active: {
      immediate: true,
      handler(v) {
        if (v && !this.listLoaded) {
          this.bootstrapPanel()
        }
      },
    },
    initialFile(v) {
      if (v && this.active) this.openPathFromOutside(v)
    },
    textContent() {
      if (this.viewerMode === 'text' || this.viewerMode === 'markdown') {
        this.viewerDirty = this.textContent !== this.textBaseline
      }
    },
  },
  mounted() {
    this.syncNarrow()
    this._onResize = () => this.syncNarrow()
    window.addEventListener('resize', this._onResize)
    this._onDocClick = () => this.closeCtxMenu()
    this._onKey = (e) => this.onGlobalKey(e)
    this._onPaste = (e) => this.onPanelPaste(e)
    document.addEventListener('click', this._onDocClick)
    document.addEventListener('keydown', this._onKey)
    document.addEventListener('paste', this._onPaste)
    if (this.active) this.bootstrapPanel()
  },
  beforeUnmount() {
    this.revokeBlob()
    this.destroyMediaPlayer()
    window.removeEventListener('resize', this._onResize)
    document.removeEventListener('click', this._onDocClick)
    document.removeEventListener('keydown', this._onKey)
    document.removeEventListener('paste', this._onPaste)
  },
  methods: {
    formatSize: formatFileSize,
    formatQuota,
    syncNarrow() {
      this.narrow = window.innerWidth <= 768
    },
    async bootstrapPanel() {
      await this.loadList()
      this.listLoaded = true
      this.refreshQuota()
      if (this.initialFile) this.openPathFromOutside(this.initialFile)
    },
    async openPathFromOutside(path) {
      const p = String(path || '').replace(/^\/+/, '')
      if (!p) return
      const parts = p.split('/')
      const name = parts.pop()
      const dir = parts.join('/')
      if (dir !== this.currentPath) {
        this.currentPath = dir
        await this.loadList()
      }
      const ext = name.includes('.') ? `.${name.split('.').pop()}` : ''
      this.openFile(p, name, ext)
    },
    async refreshQuota() {
      try {
        const { data } = await fetchQuota()
        if (data?.ok && data.quota) this.quota = data.quota
      } catch {
        /* ignore */
      }
    },
    onGlobalKey(e) {
      const tag = e.target?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target?.isContentEditable

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        if (this.viewerOpen && this.canSave) {
          e.preventDefault()
          this.saveViewer()
        }
        return
      }

      if (e.key === 'Escape') {
        if (this.renamingPath) {
          this.cancelInlineRename()
          return
        }
        if (this.ctx.visible) {
          this.closeCtxMenu()
          return
        }
        if (this.showTrashModal) {
          this.showTrashModal = false
          return
        }
        if (this.showNameModal) {
          this.closeNameModal()
          return
        }
        if (this.showMoveModal) {
          this.closeMoveModal()
          return
        }
        if (this.showDeleteModal) {
          this.closeDeleteModal()
          return
        }
        if (this.showUploadModal && !this.uploadBusy) {
          this.closeUploadModal()
          return
        }
        if (this.viewerOpen) {
          this.requestCloseViewer()
        }
        return
      }

      if (typing || this.showNameModal || this.showMoveModal || this.showDeleteModal || this.renamingPath) {
        return
      }

      if (this.viewerOpen && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return

      if (e.key === 'F2') {
        const item = this.getPrimarySelectedItem()
        if (item) this.startInlineRename(item)
        return
      }
      if (e.key === 'Delete') {
        if (this.selectedPaths.length) {
          this.openBatchDelete()
        } else if (this.selectedPath) {
          const item = this.items.find((i) => i.path === this.selectedPath)
          if (item) this.openDeleteModal(item)
        }
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        this.moveSelection(e.key === 'ArrowDown' ? 1 : -1, e.shiftKey)
        return
      }
      if (e.key === 'Enter') {
        const item = this.getPrimarySelectedItem()
        if (item) this.openItem(item)
      }
    },
    getPrimarySelectedItem() {
      const path = this.selectedPaths[this.selectedPaths.length - 1] || this.selectedPath
      return this.displayItems.find((i) => i.path === path) || this.items.find((i) => i.path === path)
    },
    moveSelection(delta, extend) {
      const list = this.displayItems
      if (!list.length) return
      const cur = this.selectedPaths[this.selectedPaths.length - 1] || this.selectedPath
      let idx = list.findIndex((i) => i.path === cur)
      if (idx < 0) idx = delta > 0 ? -1 : 0
      const next = Math.max(0, Math.min(list.length - 1, idx + delta))
      const item = list[next]
      if (!item) return
      if (extend) {
        if (!this.selectedPaths.includes(item.path)) this.selectedPaths = [...this.selectedPaths, item.path]
        this.selectedPath = item.path
      } else {
        this.selectedPaths = [item.path]
        this.selectedPath = item.path
        this.lastClickedPath = item.path
      }
    },
    toggleSort(key) {
      if (this.sortKey === key) {
        this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortKey = key
        this.sortDir = 'asc'
      }
    },
    isSelected(path) {
      return this.selectedPaths.includes(path) || this.selectedPath === path
    },
    selectItem(item, e) {
      this.closeCtxMenu()
      if (e?.ctrlKey || e?.metaKey) {
        const set = new Set(this.selectedPaths)
        if (set.has(item.path)) set.delete(item.path)
        else set.add(item.path)
        this.selectedPaths = [...set]
        this.selectedPath = item.path
        this.lastClickedPath = item.path
        return
      }
      if (e?.shiftKey && this.lastClickedPath) {
        const list = this.displayItems
        const a = list.findIndex((i) => i.path === this.lastClickedPath)
        const b = list.findIndex((i) => i.path === item.path)
        if (a >= 0 && b >= 0) {
          const [lo, hi] = a < b ? [a, b] : [b, a]
          this.selectedPaths = list.slice(lo, hi + 1).map((i) => i.path)
          this.selectedPath = item.path
          return
        }
      }
      this.selectedPaths = [item.path]
      this.selectedPath = item.path
      this.lastClickedPath = item.path
    },
    clearSelection() {
      this.selectedPaths = []
      this.selectedPath = ''
    },
    onListDragOver(e) {
      if (e.dataTransfer?.types?.includes('Files')) {
        e.preventDefault()
        this.listDropOver = true
      }
    },
    onListDragLeave() {
      this.listDropOver = false
    },
    onListDrop(e) {
      this.listDropOver = false
      const files = Array.from(e.dataTransfer?.files || [])
      if (!files.length) return
      e.preventDefault()
      e.stopPropagation()
      this.showUploadModal = true
      this.enqueueFiles(files)
    },
    onPanelPaste(e) {
      if (!this.active || this.viewerOpen || this.renamingPath) return
      const files = Array.from(e.clipboardData?.files || [])
      if (!files.length) return
      e.preventDefault()
      this.showUploadModal = true
      this.enqueueFiles(files)
      this.$toast.open({ message: `已加入 ${files.length} 个粘贴文件`, type: 'is-success' })
    },
    requestCloseViewer() {
      if (this.viewerDirty) {
        this.$dialog.confirm({
          title: '未保存的更改',
          message: '关闭将丢失未保存内容，是否继续？',
          type: 'is-warning',
          confirmText: '关闭',
          onConfirm: () => this.closeViewer(),
        })
        return
      }
      this.closeViewer()
    },
    markOfficeDirty() {
      this.viewerDirty = true
    },
    formatTime(ts) {
      const n = Number(ts)
      if (!Number.isFinite(n) || n <= 0) return '—'
      const ms = n < 1e12 ? n * 1000 : n
      return new Date(ms).toLocaleString()
    },
    fileIcon(item) {
      const ext = (item.ext || '').toLowerCase()
      if (ext === '.doc') return 'file-word'
      if (ext === '.docx') return 'file-word'
      if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'file-excel'
      if (ext === '.ppt') return 'file-powerpoint'
      if (ext === '.pptx') return 'file-powerpoint'
      if (isVideoExt(ext)) return 'file-video'
      if (isAudioExt(ext)) return 'file-audio'
      if (['.md', '.txt'].includes(ext)) return 'file-alt'
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return 'file-image'
      if (ext === '.pdf') return 'file-pdf'
      if (ext === '.zip') return 'file-archive'
      return 'file'
    },
    fileIconClass(item) {
      const ext = (item.ext || '').toLowerCase()
      if (ext === '.doc' || ext === '.ppt') return 'legacy'
      if (ext === '.docx') return 'word'
      if (['.xls', '.xlsx', '.csv'].includes(ext)) return 'excel'
      if (ext === '.pptx') return 'ppt'
      if (isVideoExt(ext)) return 'video'
      if (isAudioExt(ext)) return 'audio'
      if (['.md', '.txt'].includes(ext)) return 'text'
      if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext)) return 'image'
      if (ext === '.pdf') return 'pdf'
      return 'file'
    },
    fileTitle(item) {
      const ext = (item.ext || '').toLowerCase()
      if (ext === '.doc' || ext === '.ppt') return `${item.name}（旧版格式，仅支持下载）`
      return item.name
    },
    fileKindClass(kind) {
      if (kind === 'docx') return 'word'
      if (kind === 'xlsx') return 'excel'
      if (kind === 'pptx') return 'ppt'
      if (kind === 'md' || kind === 'txt') return 'text'
      return 'file'
    },
    closeCreateMenu() {
      this.showCreateMenu = false
    },
    newFolderFromMenu() {
      this.closeCreateMenu()
      this.openCreateFolderModal()
    },
    openCreateFolderModal() {
      this.closeCreateMenu()
      this.closeCtxMenu()
      this.cancelInlineRename()
      this.nameModalMode = 'create-folder'
      this.nameModalType = null
      this.nameModalValue = uniqueFileName(
        '新建文件夹',
        this.items.map((i) => i.name),
      )
      this.showNameModal = true
      this.$nextTick(() => this.$refs.nameModalInput?.focus?.())
    },
    openCreateFileModal(type) {
      this.closeCreateMenu()
      this.closeCtxMenu()
      this.cancelInlineRename()
      if (!type) return
      this.nameModalMode = 'create-file'
      this.nameModalType = type
      this.nameModalValue = uniqueFileName(
        `${type.defaultBase}${type.ext}`,
        this.items.map((i) => i.name),
      )
      this.showNameModal = true
      this.$nextTick(() => {
        const input = this.$refs.nameModalInput
        if (!input) return
        input.focus()
        const base = this.nameModalValue.replace(new RegExp(`\\${type.ext}$`, 'i'), '')
        input.setSelectionRange(0, base.length)
      })
    },
    setRenameInputRef(el, path) {
      if (!this._renameInputs) this._renameInputs = {}
      if (el) this._renameInputs[path] = el
      else delete this._renameInputs[path]
    },
    onRowDblClick(item) {
      if (this.renamingPath === item.path) return
      this.openItem(item)
    },
    startInlineRename(item) {
      this.closeCtxMenu()
      if (!item || this.renameSaving) return
      this.selectedPath = item.path
      this.renamingPath = item.path
      this.renameItem = item
      this.renameDraft = item.name
      this._renameSkipBlur = false
      this.$nextTick(() => {
        const input = this._renameInputs?.[item.path]
        if (!input) return
        input.focus()
        const dot = item.isDir ? -1 : item.name.lastIndexOf('.')
        input.setSelectionRange(0, dot > 0 ? dot : item.name.length)
      })
    },
    cancelInlineRename() {
      this._renameSkipBlur = true
      this.renamingPath = ''
      this.renameDraft = ''
      this.renameItem = null
      this.$nextTick(() => {
        this._renameSkipBlur = false
      })
    },
    async commitInlineRename() {
      if (this._renameSkipBlur || this.renameSaving) return
      const item = this.renameItem
      if (!item || this.renamingPath !== item.path) return

      let newName = String(this.renameDraft || '').trim().replace(/[\\/:*?"<>|]/g, '_')
      if (!newName) {
        this.$toast.open({ message: '名称无效', type: 'is-danger' })
        this.cancelInlineRename()
        return
      }
      if (!item.isDir && item.ext) {
        const lower = newName.toLowerCase()
        if (!lower.endsWith(item.ext.toLowerCase())) {
          newName += item.ext
        }
      }
      if (newName === item.name) {
        this.cancelInlineRename()
        return
      }

      this.renameSaving = true
      this._renameSkipBlur = true
      try {
        const { data } = await renameFile(item.path, newName)
        if (data?.ok) {
          this.items = (data.items || []).map(normalizeFileItem).filter(Boolean)
          this.selectedPath = joinFilePath(this.currentPath, newName)
          this.$toast.open({ message: '已重命名', type: 'is-success' })
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '重命名失败', type: 'is-danger' })
      } finally {
        this.renameSaving = false
        this.renamingPath = ''
        this.renameDraft = ''
        this.renameItem = null
        this.$nextTick(() => {
          this._renameSkipBlur = false
        })
      }
    },
    closeNameModal() {
      if (this.nameModalBusy) return
      this.showNameModal = false
      this.nameModalMode = ''
      this.nameModalValue = ''
      this.nameModalType = null
    },
    async confirmNameModal() {
      if (this.nameModalBusy) return
      if (this.nameModalMode === 'create-folder') {
        await this.submitCreateFolder()
        return
      }
      if (this.nameModalMode === 'create-file') {
        await this.submitCreateFile()
      }
    },
    async submitCreateFolder() {
      const name = String(this.nameModalValue || '')
        .trim()
        .replace(/[\\/:*?"<>|]/g, '_')
      if (!name) {
        this.$toast.open({ message: '名称无效', type: 'is-danger' })
        return
      }
      this.nameModalBusy = true
      try {
        const { data } = await createFolder(this.currentPath, name)
        if (data?.ok) {
          this.items = (data.items || []).map(normalizeFileItem).filter(Boolean)
          this.$toast.open({ message: '已创建', type: 'is-success' })
          this.nameModalBusy = false
          this.closeNameModal()
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      } finally {
        this.nameModalBusy = false
      }
    },
    async submitCreateFile() {
      const type = this.nameModalType
      if (!type) return
      const name = normalizeNewFileName(this.nameModalValue, type.ext)
      if (!name) {
        this.$toast.open({ message: '文件名无效', type: 'is-danger' })
        return
      }
      const path = joinFilePath(this.currentPath, name)
      this.nameModalBusy = true
      try {
        const blob = await buildEmptyFileBlob(type.kind)
        const file = new File([blob], name, { type: blob.type || 'application/octet-stream' })
        await uploadBinary(file, path)
        this.$toast.open({ message: `已创建 ${name}`, type: 'is-success' })
        this.nameModalBusy = false
        this.closeNameModal()
        await this.loadList()
        this.openFile(path, name, type.ext)
      } catch (e) {
        this.$toast.open({ message: e?.msg || '创建失败', type: 'is-danger' })
      } finally {
        this.nameModalBusy = false
      }
    },
    async openMoveModal(item) {
      this.closeCtxMenu()
      this.moveItem = item
      this.moveBrowsePath = this.currentPath
      this.showMoveModal = true
      await this.refreshMoveFolders()
    },
    closeMoveModal() {
      if (this.moveBusy) return
      this.showMoveModal = false
      this.moveItem = null
      this.moveFolders = []
    },
    async browseMove(path) {
      this.moveBrowsePath = path || ''
      await this.refreshMoveFolders()
    },
    browseMoveToIndex(i) {
      const segs = this.moveBrowseSegments.slice(0, i + 1)
      return this.browseMove(segs.join('/'))
    },
    browseMoveParent() {
      const segs = this.moveBrowseSegments
      segs.pop()
      return this.browseMove(segs.join('/'))
    },
    async refreshMoveFolders() {
      try {
        const { data } = await fetchFileList(this.moveBrowsePath)
        const list = (data?.items || []).map(normalizeFileItem).filter(Boolean)
        this.moveFolders = list.filter((i) => i.isDir)
      } catch {
        this.moveFolders = []
      }
    },
    async confirmMove() {
      if (!this.moveItem || this.moveBusy) return
      const targetDir = this.moveBrowsePath || ''
      const paths = this.moveItem._batchPaths || [this.moveItem.path]
      this.moveBusy = true
      try {
        if (paths.length > 1) {
          await batchFiles('move', paths, targetDir)
        } else {
          await moveFile(paths[0], targetDir)
        }
        this.$toast.open({ message: '已移动', type: 'is-success' })
        this.moveBusy = false
        this.closeMoveModal()
        this.clearSelection()
        await this.loadList()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '移动失败', type: 'is-danger' })
      } finally {
        this.moveBusy = false
      }
    },
    async moveItemToDir(item, targetDir) {
      if (!item) return
      const parent = item.path.includes('/')
        ? item.path.slice(0, item.path.lastIndexOf('/'))
        : ''
      if ((targetDir || '') === parent) return
      if (item.isDir && targetDir && (targetDir === item.path || targetDir.startsWith(`${item.path}/`))) {
        this.$toast.open({ message: '不能将文件夹移动到自身内部', type: 'is-danger' })
        return
      }
      try {
        await moveFile(item.path, targetDir || '')
        this.$toast.open({ message: `已移入「${targetDir || '根目录'}」`, type: 'is-success' })
        await this.loadList()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '移动失败', type: 'is-danger' })
      }
    },
    openDeleteModal(item) {
      this.closeCtxMenu()
      this.deleteTarget = item
      this.showDeleteModal = true
    },
    closeDeleteModal() {
      if (this.deleting) return
      this.showDeleteModal = false
      this.deleteTarget = null
    },
    async confirmDelete() {
      if (!this.deleteTarget || this.deleting) return
      this.deleting = true
      try {
        if (this.deleteTarget._batch) {
          await batchFiles('delete', this.selectedPaths)
          this.$toast.open({ message: '已移入回收站', type: 'is-success' })
          this.clearSelection()
          await this.loadList()
          this.refreshQuota()
        } else {
          const { data } = await deleteFile(this.deleteTarget.path)
          if (data?.ok) {
            this.items = (data.items || []).map(normalizeFileItem).filter(Boolean)
            this.selectedPaths = this.selectedPaths.filter((p) => p !== this.deleteTarget.path)
            if (this.selectedPath === this.deleteTarget.path) this.selectedPath = ''
            this.$toast.open({ message: data.message || '已移入回收站', type: 'is-success' })
          }
        }
        this.deleting = false
        this.closeDeleteModal()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
      } finally {
        this.deleting = false
      }
    },
    openCtxMenu(item, e) {
      this.selectedPath = item.path
      const pad = 8
      let x = e.clientX
      let y = e.clientY
      const w = 180
      const h = 280
      if (x + w > window.innerWidth - pad) x = window.innerWidth - w - pad
      if (y + h > window.innerHeight - pad) y = window.innerHeight - h - pad
      this.ctx = { visible: true, x, y, item }
    },
    onBlankContextMenu(e) {
      if (e.target.closest?.('.file-row')) return
      const pad = 8
      let x = e.clientX
      let y = e.clientY
      if (x + 180 > window.innerWidth - pad) x = window.innerWidth - 180 - pad
      if (y + 220 > window.innerHeight - pad) y = window.innerHeight - 220 - pad
      this.ctx = { visible: true, x, y, item: null }
    },
    closeCtxMenu() {
      if (this.ctx.visible) this.ctx = { visible: false, x: 0, y: 0, item: null }
    },
    ctxOpen() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (item) this.openItem(item)
    },
    ctxDownload() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (item && !item.isDir) this.downloadItem(item)
    },
    ctxRename() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (item) this.startInlineRename(item)
    },
    ctxMove() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (item) this.openMoveModal(item)
    },
    async ctxDuplicate() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (!item || item.isDir) return
      try {
        await copyFile(item.path, this.currentPath)
        this.$toast.open({ message: '已创建副本', type: 'is-success' })
        await this.loadList()
        this.refreshQuota()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '复制失败', type: 'is-danger' })
      }
    },
    async ctxDownloadZip() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (!item?.isDir) return
      try {
        await downloadZipFolder(item.path, `${item.name}.zip`)
      } catch (e) {
        this.$toast.open({ message: e?.msg || '打包失败', type: 'is-danger' })
      }
    },
    openBatchDelete() {
      if (!this.selectedPaths.length) return
      this.deleteTarget = { name: `${this.selectedPaths.length} 项`, isDir: true, _batch: true }
      this.showDeleteModal = true
    },
    async openTrashModal() {
      this.closeCtxMenu()
      this.showTrashModal = true
      await this.reloadTrash()
    },
    async reloadTrash() {
      try {
        const { data } = await fetchTrash()
        this.trashItems = data?.trash || []
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载回收站失败', type: 'is-danger' })
      }
    },
    async restoreTrash(ids) {
      this.trashBusy = true
      try {
        await batchFiles('restore', ids)
        await this.reloadTrash()
        await this.loadList()
        this.$toast.open({ message: '已恢复', type: 'is-success' })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '恢复失败', type: 'is-danger' })
      } finally {
        this.trashBusy = false
      }
    },
    async purgeTrash(ids) {
      this.trashBusy = true
      try {
        await batchFiles('purge', ids)
        await this.reloadTrash()
        this.refreshQuota()
        this.$toast.open({ message: '已彻底删除', type: 'is-success' })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '删除失败', type: 'is-danger' })
      } finally {
        this.trashBusy = false
      }
    },
    async batchMoveSelected() {
      if (!this.selectedPaths.length) return
      const first = this.items.find((i) => i.path === this.selectedPaths[0])
      if (first) this.openMoveModal({ ...first, _batchPaths: [...this.selectedPaths] })
    },
    async ctxCopyPath() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (!item) return
      try {
        await navigator.clipboard.writeText(item.path)
        this.$toast.open({ message: '路径已复制', type: 'is-success' })
      } catch {
        this.$toast.open({ message: item.path, type: 'is-info', duration: 4000 })
      }
    },
    ctxDelete() {
      const item = this.ctx.item
      this.closeCtxMenu()
      if (item) this.openDeleteModal(item)
    },
    onDragStart(item, e) {
      this.dragPath = item.path
      this.closeCtxMenu()
      try {
        e.dataTransfer.setData('text/plain', item.path)
        e.dataTransfer.effectAllowed = 'move'
      } catch {
        /* ignore */
      }
    },
    onDragEnd() {
      this.dragPath = ''
      this.dropTargetPath = ''
    },
    onDragOverItem(item) {
      if (!this.dragPath || this.dragPath === item.path) return
      if (!item.isDir) return
      if (item.path === this.dragPath || this.dragPath.startsWith?.(`${item.path}/`)) return
      this.dropTargetPath = item.path
    },
    onDragLeaveItem(item) {
      if (this.dropTargetPath === item.path) this.dropTargetPath = ''
    },
    async onDropItem(item) {
      const from = this.dragPath
      this.dropTargetPath = ''
      this.dragPath = ''
      if (!from || !item?.isDir) return
      const dragged = this.items.find((i) => i.path === from)
      if (!dragged) return
      await this.moveItemToDir(dragged, item.path)
    },
    onDragOverParent() {
      if (!this.dragPath || !this.currentPath) return
      this.dropTargetPath = '..'
    },
    onDragLeaveParent() {
      if (this.dropTargetPath === '..') this.dropTargetPath = ''
    },
    async onDropToParent() {
      const from = this.dragPath
      this.dropTargetPath = ''
      this.dragPath = ''
      if (!from || !this.currentPath) return
      const dragged = this.items.find((i) => i.path === from)
      if (!dragged) return
      const segs = this.pathSegments.slice(0, -1)
      await this.moveItemToDir(dragged, segs.join('/'))
    },
    async loadList() {
      this.loading = true
      try {
        const { data } = await fetchFileList(this.currentPath)
        if (data?.ok) {
          this.items = (data.items || [])
            .map(normalizeFileItem)
            .filter(Boolean)
        }
      } catch (e) {
        this.$toast.open({ message: e?.msg || '加载失败', type: 'is-danger' })
      } finally {
        this.loading = false
      }
    },
    goRoot() {
      this.currentPath = ''
      this.loadList()
    },
    goUp() {
      const parts = this.pathSegments
      parts.pop()
      this.currentPath = parts.join('/')
      this.loadList()
    },
    goTo(index) {
      const parts = this.pathSegments.slice(0, index + 1)
      this.currentPath = parts.join('/')
      this.loadList()
    },
    openUploadModal() {
      this.showUploadModal = true
      this.uploadQueue = []
      this.dragOver = false
      this.dragDepth = 0
    },
    closeUploadModal() {
      if (this.uploadBusy) return
      this.showUploadModal = false
      this.uploadQueue = []
      this.dragOver = false
      this.dragDepth = 0
    },
    triggerUploadPick() {
      if (this.uploadBusy) return
      this.$refs.uploadInput?.click()
    },
    onDragEnter() {
      this.dragDepth += 1
      this.dragOver = true
    },
    onDragOver() {
      this.dragOver = true
    },
    onDragLeave() {
      this.dragDepth = Math.max(0, this.dragDepth - 1)
      if (this.dragDepth === 0) this.dragOver = false
    },
    onDropFiles(e) {
      this.dragDepth = 0
      this.dragOver = false
      const files = Array.from(e.dataTransfer?.files || [])
      this.enqueueFiles(files)
    },
    onPickFiles(e) {
      const files = Array.from(e.target.files || [])
      this.enqueueFiles(files)
      e.target.value = ''
    },
    enqueueFiles(files) {
      const list = files.filter((f) => f && f.size >= 0)
      if (!list.length) return
      for (const file of list) {
        this.uploadQueue.push({
          id: `u_${Date.now()}_${++uploadSeq}`,
          file,
          name: file.name,
          size: file.size,
          progress: 0,
          status: 'pending',
          error: '',
        })
      }
    },
    uploadStatusLabel(job) {
      if (job.status === 'pending') return '待上传'
      if (job.status === 'uploading') return `${job.progress}%`
      if (job.status === 'done') return '完成'
      if (job.status === 'error') return '失败'
      return ''
    },
    async startUploadQueue() {
      if (this.uploadBusy) return
      const pending = this.uploadQueue.filter((j) => j.status === 'pending')
      if (!pending.length) return
      this.uploadBusy = true
      let ok = 0
      let fail = 0
      const concurrency = Math.max(1, Number(this.uploadConcurrency) || 2)
      let cursor = 0
      const runOne = async () => {
        while (cursor < pending.length) {
          const job = pending[cursor]
          cursor += 1
          job.status = 'uploading'
          job.progress = 0
          job.error = ''
          job._abort = new AbortController()
          try {
            await uploadFileWithProgress(job.file, this.currentPath, {
              conflict: this.uploadConflict,
              signal: job._abort.signal,
              onProgress: (pct) => {
                job.progress = pct
              },
            })
            job.status = 'done'
            job.progress = 100
            ok += 1
          } catch (err) {
            job.status = 'error'
            job.error = err?.msg || '上传失败'
            fail += 1
          }
        }
      }
      try {
        await Promise.all(Array.from({ length: Math.min(concurrency, pending.length) }, () => runOne()))
        await this.loadList()
        this.refreshQuota()
        if (fail === 0) {
          this.$toast.open({ message: `已上传 ${ok} 个文件`, type: 'is-success' })
        } else {
          this.$toast.open({
            message: `完成 ${ok} 个，失败 ${fail} 个`,
            type: 'is-warning',
          })
        }
      } finally {
        this.uploadBusy = false
      }
    },
    retryUploadJob(job) {
      if (!job || job.status !== 'error') return
      job.status = 'pending'
      job.progress = 0
      job.error = ''
      this.startUploadQueue()
    },
    cancelUploadJob(job) {
      try {
        job._abort?.abort?.()
      } catch {
        /* ignore */
      }
      if (job.status === 'pending' || job.status === 'uploading') {
        job.status = 'error'
        job.error = '已取消'
      }
    },
    removeUploadJob(job) {
      this.uploadQueue = this.uploadQueue.filter((j) => j.id !== job.id)
    },
    async newFolder() {
      this.openCreateFolderModal()
    },
    openItem(item) {
      if (item.isDir) {
        this.currentPath = item.path
        this.clearSelection()
        this.loadList()
        return
      }
      this.openFile(item.path, item.name, item.ext)
    },
    async downloadItem(item) {
      try {
        if (item.isDir) {
          await downloadZipFolder(item.path, `${item.name}.zip`)
          return
        }
        const res = await fetchFileBlob(item.path)
        const blob = new Blob([res.data])
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = item.name
        a.click()
        URL.revokeObjectURL(url)
      } catch (e) {
        this.$toast.open({ message: e?.msg || '下载失败', type: 'is-danger' })
      }
    },
    async openFile(path, name, ext) {
      const e = (ext || '').toLowerCase()
      const open0 = performance.now()
      this.closeViewer()
      this.viewerPath = path
      this.viewerName = name
      this.viewerOpen = true
      this.viewerDirty = false
      this.mdPreview = true

      try {
        if (e === '.md') {
          const { data } = await fetchFileText(path)
          this.viewerMode = 'markdown'
          this.textContent = data?.content ?? ''
          this.textBaseline = this.textContent
          return
        }
        if (['.txt', '.json', '.yaml', '.yml', '.xml', '.log', '.html', '.htm'].includes(e)) {
          const { data } = await fetchFileText(path)
          this.viewerMode = 'text'
          this.textContent = data?.content ?? ''
          this.textBaseline = this.textContent
          logUniverPerf('open text fetch', performance.now() - open0, name)
          return
        }

        if (isVideoExt(e) && e !== '.flv') {
          this.viewerMode = 'video'
          this.viewerBlobUrl = streamFileUrl(path)
          await this.$nextTick()
          await this.setupMediaPlayer(e)
          return
        }
        if (isAudioExt(e)) {
          this.viewerMode = 'audio'
          this.viewerBlobUrl = streamFileUrl(path)
          await this.$nextTick()
          await this.setupMediaPlayer(e)
          return
        }

        let univerMode = null
        if (['.xlsx', '.xls', '.csv'].includes(e)) univerMode = 'sheet'
        else if (e === '.docx') univerMode = 'doc'
        else if (e === '.pptx') univerMode = 'slide'
        if (univerMode) prefetchUniver(univerMode)

        const tFetch = performance.now()
        const res = await fetchFileBlob(path)
        logUniverPerf('fetch file blob', performance.now() - tFetch, {
          name,
          bytes: res.data?.byteLength || res.data?.length || 0,
        })
        const buf = res.data
        this.officeBuffer = buf
        const mime = mediaMime(e)
        this.viewerBlobUrl = URL.createObjectURL(
          mime ? new Blob([buf], { type: mime }) : new Blob([buf]),
        )

        if (['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(e)) {
          this.viewerMode = 'image'
        } else if (e === '.pdf') {
          this.viewerMode = 'pdf'
        } else if (univerMode === 'sheet') {
          this.viewerMode = 'excel'
        } else if (univerMode === 'doc') {
          this.viewerMode = 'word'
        } else if (univerMode === 'slide') {
          this.viewerMode = 'ppt'
        } else if (e === '.flv') {
          this.viewerMode = 'video'
          await this.$nextTick()
          await this.setupMediaPlayer(e)
        } else if (e === '.doc' || e === '.ppt') {
          this.viewerMode = 'unsupported'
        } else {
          this.viewerMode = 'unsupported'
        }
        logUniverPerf('openFile until viewer mount', performance.now() - open0, this.viewerMode)
      } catch (err) {
        this.$toast.open({ message: err?.msg || '打开失败', type: 'is-danger' })
        this.viewerOpen = false
      }
    },
    destroyMediaPlayer() {
      try {
        this._mediaPlayer?.destroy?.()
      } catch {
        /* ignore */
      }
      this._mediaPlayer = null
      const el = this.$refs.mediaEl
      if (el) {
        try {
          el.pause?.()
          el.removeAttribute('src')
          el.load?.()
        } catch {
          /* ignore */
        }
      }
    },
    async setupMediaPlayer(ext) {
      this.destroyMediaPlayer()
      const el = this.$refs.mediaEl
      const url = this.viewerBlobUrl
      if (!el || !url) return
      const e = String(ext || '').toLowerCase()

      if (e === '.flv') {
        try {
          const flvjs = (await import('flv.js')).default
          if (flvjs.isSupported()) {
            const player = flvjs.createPlayer({ type: 'flv', url })
            player.attachMediaElement(el)
            player.load()
            this._mediaPlayer = player
            el.play?.().catch(() => {})
            return
          }
        } catch (err) {
          console.warn('flv play failed', err)
        }
      }

      el.src = url
      el.load?.()
      el.play?.().catch(() => {})
    },
    onUniverError() {
      this.$toast.open({ message: '编辑器加载失败', type: 'is-danger' })
      this.viewerMode = 'unsupported'
    },
    triggerBlobDownload(blob, name) {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
    },
    async downloadViewer() {
      try {
        const snap = this.$refs.univerViewer?.getSnapshot?.()
        if (this.viewerMode === 'excel' && snap) {
          const blob = await univerSnapshotToXlsxBlob(snap, this.viewerName)
          this.triggerBlobDownload(blob, this.viewerName.replace(/\.csv$/i, '.xlsx') || 'workbook.xlsx')
          return
        }
        if (this.viewerMode === 'word' && snap) {
          const blob = await documentSnapshotToDocxBlob(snap, this.viewerName)
          this.triggerBlobDownload(blob, this.viewerName.replace(/\.doc$/i, '.docx') || 'document.docx')
          return
        }
        if (this.viewerMode === 'ppt' && snap) {
          const blob = await slideSnapshotToPptxBlob(snap, this.viewerName)
          this.triggerBlobDownload(blob, this.viewerName.replace(/\.ppt$/i, '.pptx') || 'presentation.pptx')
          return
        }
        if (this.viewerBlobUrl) {
          const a = document.createElement('a')
          a.href = this.viewerBlobUrl
          a.download = this.viewerName
          a.click()
          return
        }
        await this.downloadItem({ path: this.viewerPath, name: this.viewerName })
      } catch (e) {
        this.$toast.open({ message: e?.msg || '下载失败', type: 'is-danger' })
      }
    },
    async saveViewer() {
      this.viewerSaving = true
      try {
        if (this.viewerMode === 'text' || this.viewerMode === 'markdown') {
          await saveFileText(this.viewerPath, this.textContent)
          this.textBaseline = this.textContent
          this.viewerDirty = false
        } else if (this.viewerMode === 'excel') {
          const snap = this.$refs.univerViewer?.getSnapshot?.()
          if (!snap) throw { msg: '无法读取表格内容' }
          const blob = await univerSnapshotToXlsxBlob(snap, this.viewerName)
          const outName = this.viewerName.replace(/\.csv$/i, '.xlsx')
          const file = new File([blob], outName, { type: blob.type })
          const savePath = this.viewerPath.replace(/\.csv$/i, '.xlsx')
          await uploadBinary(file, savePath)
          this.viewerName = outName
          this.viewerPath = savePath
        } else if (this.viewerMode === 'word') {
          const snap = this.$refs.univerViewer?.getSnapshot?.()
          if (!snap) throw { msg: '无法读取文档内容' }
          const blob = await documentSnapshotToDocxBlob(snap, this.viewerName)
          const outName = this.viewerName.replace(/\.doc$/i, '.docx')
          const file = new File([blob], outName, {
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          })
          const savePath = this.viewerPath.replace(/\.doc$/i, '.docx')
          await uploadBinary(file, savePath)
          this.viewerName = outName
          this.viewerPath = savePath
        } else if (this.viewerMode === 'ppt') {
          const snap = this.$refs.univerViewer?.getSnapshot?.()
          if (!snap) throw { msg: '无法读取演示文稿内容' }
          const blob = await slideSnapshotToPptxBlob(snap, this.viewerName)
          const outName = this.viewerName.replace(/\.ppt$/i, '.pptx')
          const file = new File([blob], outName, {
            type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          })
          const savePath = this.viewerPath.replace(/\.ppt$/i, '.pptx')
          await uploadBinary(file, savePath)
          this.viewerName = outName
          this.viewerPath = savePath
        }
        this.$toast.open({ message: '已保存', type: 'is-success' })
        this.viewerDirty = false
        await this.loadList()
        this.refreshQuota()
      } catch (e) {
        this.$toast.open({ message: e?.msg || '保存失败', type: 'is-danger' })
      } finally {
        this.viewerSaving = false
      }
    },
    removeItem(item) {
      this.openDeleteModal(item)
    },
    revokeBlob() {
      if (this.viewerBlobUrl && String(this.viewerBlobUrl).startsWith('blob:')) {
        URL.revokeObjectURL(this.viewerBlobUrl)
      }
      this.viewerBlobUrl = ''
    },
    closeViewer() {
      this.destroyMediaPlayer()
      this.revokeBlob()
      this.viewerOpen = false
      this.officeBuffer = null
      this.viewerMode = ''
      this.viewerDirty = false
      this.textBaseline = ''
    },
    async reloadAfterBackup() {
      await this.loadList()
      this.refreshQuota()
    },
  },
}
</script>

<style lang="less" scoped>
@primary: #20bc56;
@border: #e2e8f0;
@text: #1e293b;
@muted: #64748b;

.files-panel {
  height: 100%;
  min-height: 0;
  background: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-box {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 10px;
  border: 1px solid @border;
  border-radius: 10px;
  background: #fff;
  min-width: 160px;

  input {
    border: none;
    outline: none;
    width: 140px;
    font-size: 13px;
  }
}

.quota-chip {
  margin-left: 8px;
  font-size: 11px;
  color: @muted;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 2px 8px;
  white-space: nowrap;
}

.batch-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  background: #ecfdf5;
  border-bottom: 1px solid #bbf7d0;
  font-size: 13px;
}

.files-workspace {
  flex: 1;
  min-height: 0;
  display: flex;
  overflow: hidden;

  &.has-viewer .files-body {
    width: 42%;
    max-width: 520px;
    border-right: 1px solid @border;
  }
}

.files-body.drop-over {
  outline: 2px dashed @primary;
  outline-offset: -4px;
  background: #f0fdf4;
}

.sortable {
  cursor: pointer;
  user-select: none;

  em {
    font-style: normal;
    margin-left: 4px;
  }
}

.crumb-more {
  position: relative;
}

.crumb-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 20;
  min-width: 140px;
  background: #fff;
  border: 1px solid @border;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.12);
  padding: 4px;

  button {
    display: block;
    width: 100%;
    border: none;
    background: transparent;
    text-align: left;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;

    &:hover {
      background: #f0fdf4;
    }
  }
}

.dirty-dot {
  margin-left: 8px;
  font-size: 11px;
  font-style: normal;
  color: #d97706;
  background: #fffbeb;
  padding: 2px 6px;
  border-radius: 999px;
}

.md-preview {
  padding: 24px 32px;
  overflow: auto;
  line-height: 1.7;
  background: #fff;
}

.viewer-mask--split {
  position: static;
  inset: auto;
  flex: 1;
  min-width: 0;
  background: transparent;
  backdrop-filter: none;
  padding: 0;
  display: flex;
}

.viewer-box--split {
  max-width: none;
  width: 100%;
  height: 100%;
  border-radius: 0;
  box-shadow: none;
}

.conflict-select {
  margin-right: auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: @muted;

  select {
    height: 32px;
    border-radius: 8px;
    border: 1px solid @border;
  }
}

.trash-list {
  max-height: 280px;
  overflow: auto;
  border: 1px solid @border;
  border-radius: 12px;
  padding: 6px;
}

.trash-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;

  &:hover {
    background: #f8fafc;
  }

  .trash-name {
    font-weight: 600;
    font-size: 13px;
  }

  .trash-meta {
    grid-column: 2;
    font-size: 11px;
    color: @muted;
  }
}

.upload-item__acts {
  margin-left: auto;
  display: inline-flex;
  gap: 8px;
}

.link-btn {
  border: none;
  background: none;
  color: @primary;
  font-size: 12px;
  cursor: pointer;

  &.danger {
    color: #ef4444;
  }
}

.files-toolbar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 18px;
  border-bottom: 1px solid @border;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}

.files-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
}

.breadcrumb-wrap {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
  flex: 1;
}

.breadcrumb-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f0fdf4;
  color: @primary;
  margin-top: 2px;

  :deep(.app-icon) {
    font-size: 15px;
    color: inherit;
  }
}

.path-tabs {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 2px;
  min-width: 0;
  max-width: 100%;
}

.path-sep {
  display: inline-flex;
  align-items: center;
  color: #94a3b8;
  padding: 0 2px;

  :deep(.app-icon) {
    font-size: 10px;
    width: 10px;
    height: 10px;
  }
}

.path-tab {
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid transparent;
  background: transparent;
  color: @primary;
  font-size: 13px;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 8px;
  cursor: pointer;
  line-height: 1.3;

  &:hover {
    background: #f0fdf4;
    border-color: rgba(32, 188, 86, 0.2);
  }

  &.active {
    background: #fff;
    border-color: @border;
    color: @text;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }
}

.tool-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  flex-shrink: 0;
}

.create-menu {
  position: relative;
}

.create-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  z-index: 30;
  min-width: 220px;
  padding: 6px;
  background: #fff;
  border: 1px solid @border;
  border-radius: 12px;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.12);
}

.create-item {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  color: @text;

  &:hover {
    background: #f0fdf4;
  }
}

.create-item__icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;

  &.word {
    background: #dbeafe;
    color: #2563eb;
  }
  &.excel {
    background: #dcfce7;
    color: #16a34a;
  }
  &.ppt {
    background: #ffedd5;
    color: #ea580c;
  }
  &.text {
    background: #f1f5f9;
    color: #475569;
  }
  &.folder {
    background: #fef3c7;
    color: #d97706;
  }
}

.create-item__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  strong {
    font-size: 13px;
    font-weight: 600;
  }

  em {
    font-style: normal;
    font-size: 11px;
    color: @muted;
  }
}

.create-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 4px 6px;
}

.btn-upload,
.btn-tool {
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  color: @text;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;

  :deep(.app-icon) {
    font-size: 13px;
  }

  :deep(.caret) {
    font-size: 10px;
    opacity: 0.7;
  }

  &.open {
    border-color: @primary;
    color: @primary;
    background: #f0fdf4;
  }

  &:hover {
    border-color: @primary;
    color: @primary;
    background: #f0fdf4;
  }

  &.primary {
    background: linear-gradient(135deg, #22c65b, @primary);
    border-color: transparent;
    color: #fff;
    box-shadow: 0 4px 12px rgba(32, 188, 86, 0.3);

    &:hover {
      color: #fff;
      transform: translateY(-1px);
    }
  }

  &.icon-only {
    padding: 8px 12px;
  }
}

.files-list {
  min-height: 100%;
  padding: 0 0 24px;
}

.files-list-head,
.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 100px 160px 108px;
  align-items: center;
  gap: 8px;
  padding: 0 16px 0 18px;
}

.files-list-head {
  position: sticky;
  top: 0;
  z-index: 2;
  height: 40px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: @muted;
  background: rgba(248, 250, 252, 0.96);
  backdrop-filter: blur(6px);
  border-bottom: 1px solid @border;
}

.file-row {
  position: relative;
  min-height: 56px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background 0.12s, box-shadow 0.12s;

  &:hover {
    background: #f8fafc;

    .row-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &.selected {
    background: #ecfdf5;

    .row-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  &.is-open {
    box-shadow: inset 3px 0 0 @primary;
  }

  &.is-drop {
    background: #dcfce7;
    box-shadow: inset 0 0 0 2px rgba(32, 188, 86, 0.35);
  }

  &.is-dragging {
    opacity: 0.45;
  }

  &.is-renaming {
    background: #f0fdf4;
    box-shadow: inset 0 0 0 1px rgba(32, 188, 86, 0.25);
  }

  &.is-up {
    color: @muted;
    font-weight: 500;
    min-height: 48px;
  }

  .col-size,
  .col-time {
    font-size: 12px;
    color: @muted;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
}

.file-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.file-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.file-name {
  font-weight: 600;
  font-size: 13px;
  color: @text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-rename-input {
  width: 100%;
  max-width: 420px;
  height: 32px;
  border: 1px solid @primary;
  border-radius: 8px;
  padding: 0 10px;
  font-size: 13px;
  font-weight: 600;
  color: @text;
  outline: none;
  box-sizing: border-box;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.18);
}

.file-sub {
  display: none;
  font-size: 11px;
  color: #94a3b8;
}

.file-icon {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-size: 17px;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.04);

  &.folder {
    background: linear-gradient(145deg, #fef3c7, #fde68a);
    color: #d97706;
  }
  &.word {
    background: linear-gradient(145deg, #dbeafe, #bfdbfe);
    color: #2563eb;
  }
  &.excel {
    background: linear-gradient(145deg, #dcfce7, #bbf7d0);
    color: #16a34a;
  }
  &.ppt {
    background: linear-gradient(145deg, #ffedd5, #fed7aa);
    color: #ea580c;
  }
  &.text {
    background: #f1f5f9;
    color: #475569;
  }
  &.image {
    background: linear-gradient(145deg, #fce7f3, #fbcfe8);
    color: #db2777;
  }
  &.pdf {
    background: linear-gradient(145deg, #fee2e2, #fecaca);
    color: #dc2626;
  }
  &.legacy {
    background: #f1f5f9;
    color: #94a3b8;
    opacity: 0.9;
  }
  &.video {
    background: linear-gradient(145deg, #ede9fe, #ddd6fe);
    color: #7c3aed;
  }
  &.audio {
    background: linear-gradient(145deg, #e0e7ff, #c7d2fe);
    color: #4f46e5;
  }
  &.file {
    background: #f1f5f9;
    color: #64748b;
  }
  &.up {
    background: #e2e8f0;
    color: #64748b;
  }
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.12s;
}

.icon-act {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: @muted;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);

  &:hover {
    color: @primary;
    background: #f0fdf4;
  }

  &.more:hover {
    color: #334155;
    background: #f1f5f9;
  }
}

.empty-state {
  text-align: center;
  padding: 72px 24px;
  color: @muted;

  .empty-illus {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;
    border-radius: 20px;
    background: #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: center;

    :deep(.app-icon) {
      font-size: 32px;
      color: #cbd5e1;
    }
  }

  p {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #64748b;
  }

  > span {
    font-size: 13px;
  }

  .empty-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    gap: 10px;
  }
}

.files-loading {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 64px;
  color: @muted;

  :deep(.app-icon) {
    font-size: 28px;
    color: @primary;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

.doc-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 500;
  background: rgba(15, 23, 42, 0.48);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.doc-modal {
  width: 100%;
  max-width: 420px;
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px 22px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  animation: files-modal-in 0.22s ease-out;

  &--wide {
    max-width: 480px;
  }

  &--danger {
    border: 1px solid #fecaca;
  }
}

@keyframes files-modal-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.doc-modal-icon {
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;

  &--project {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #15803d;
  }
  &--page {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #1d4ed8;
  }
  &--folder {
    background: linear-gradient(135deg, #fef3c7, #fde68a);
    color: #b45309;
  }
  &--danger {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
  }
}

.doc-modal-title {
  margin: 0 0 6px;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: @text;
}

.doc-modal-desc {
  margin: 0 0 20px;
  text-align: center;
  font-size: 13px;
  color: @muted;
  line-height: 1.5;
}

.doc-modal-warn {
  display: inline-block;
  margin-top: 6px;
  color: #dc2626;
  font-weight: 600;
}

.doc-modal-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: @text;

  .required {
    color: #ef4444;
  }
}

.field-input {
  width: 100%;
  height: 42px;
  border: 1px solid @border;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: @primary;
    box-shadow: 0 0 0 3px rgba(32, 188, 86, 0.15);
  }
}

.field-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8fafc;
  color: @muted;
  font-size: 12px;
  margin-bottom: 4px;
}

.doc-modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.btn-ghost,
.btn-primary,
.btn-danger {
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-ghost {
  background: #f1f5f9;
  color: @muted;

  &:hover {
    background: #e2e8f0;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #22c65b, @primary);
  color: #fff;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-danger {
  background: #ef4444;
  color: #fff;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.move-browser {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.move-path {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.path-chip {
  border: none;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  color: @muted;
  cursor: pointer;

  &.active {
    background: #dcfce7;
    color: #15803d;
    font-weight: 600;
  }
}

.move-sep {
  font-size: 10px;
  color: #94a3b8;
}

.move-list {
  max-height: 220px;
  overflow: auto;
  border: 1px solid @border;
  border-radius: 12px;
  padding: 6px;
}

.move-row {
  width: 100%;
  border: none;
  background: transparent;
  border-radius: 8px;
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  color: @text;
  font-size: 13px;

  &:hover:not(:disabled) {
    background: #f0fdf4;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .row-go {
    margin-left: auto;
    color: #94a3b8;
    font-size: 11px;
  }
}

.move-empty {
  padding: 24px;
  text-align: center;
  color: @muted;
  font-size: 13px;
}

.move-target {
  margin: 0;
  font-size: 12px;
  color: @muted;

  strong {
    color: @text;
  }
}

.media-view {
  flex: 1;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f172a;
  padding: 16px;

  &--audio {
    background: linear-gradient(160deg, #0f172a, #1e293b);
  }
}

.video-el {
  width: 100%;
  max-height: min(70vh, 640px);
  background: #000;
  border-radius: 8px;
}

.audio-card {
  width: min(420px, 100%);
  text-align: center;
  color: #e2e8f0;
}

.audio-icon {
  font-size: 48px;
  color: #a5b4fc;
  margin-bottom: 12px;
}

.audio-name {
  margin: 0 0 20px;
  font-size: 15px;
  word-break: break-all;
}

.audio-el {
  width: 100%;
}

.viewer-box--media {
  .viewer-body {
    background: #0f172a;
  }
}

.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 320;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-box {
  width: min(520px, 100%);
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
  padding: 20px 22px 16px;
}

.upload-modal {
  width: min(560px, 100%);
}

.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;

  h3 {
    margin: 0;
    font-size: 17px;
    color: @text;
  }
}

.modal-desc {
  margin: 0 0 14px;
  font-size: 13px;
  color: @muted;
  line-height: 1.5;
}

.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
}

.btn-ghost,
.btn-primary {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-ghost {
  border: 1px solid @border;
  background: #fff;
  color: @muted;

  &:hover:not(:disabled) {
    color: @text;
    background: #f8fafc;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #22c65b, @primary);
  color: #fff;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.drop-zone {
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  background: #f8fafc;
  transition: border-color 0.15s, background 0.15s;
  color: @muted;

  :deep(.app-icon) {
    font-size: 28px;
    color: @primary;
    margin-bottom: 8px;
  }

  p {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: 600;
    color: @text;
  }

  span {
    font-size: 12px;
  }

  &.over {
    border-color: @primary;
    background: #f0fdf4;
  }

  &.busy {
    pointer-events: none;
    opacity: 0.7;
  }
}

.upload-list {
  list-style: none;
  margin: 14px 0 0;
  padding: 0;
  max-height: 220px;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.upload-item {
  border: 1px solid @border;
  border-radius: 10px;
  padding: 10px 12px;
  background: #fff;
}

.upload-item__top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 6px;
}

.upload-item__name {
  font-size: 13px;
  font-weight: 500;
  color: @text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-item__status {
  flex-shrink: 0;
  font-size: 12px;
  color: @muted;

  &.is-uploading {
    color: @primary;
  }
  &.is-done {
    color: #166534;
  }
  &.is-error {
    color: #b91c1c;
  }
}

.upload-bar {
  height: 6px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
}

.upload-bar__fill {
  height: 100%;
  background: linear-gradient(90deg, #22c65b, @primary);
  transition: width 0.15s ease;
}

.upload-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  font-size: 11px;
  color: #94a3b8;
}

.upload-item__err {
  color: #b91c1c;
}

.backup-section {
  margin-bottom: 14px;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    color: @text;
  }
}

.backup-hint {
  margin: 0 0 8px;
  font-size: 12px;
  color: @muted;
}

.backup-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.backup-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid @border;
  background: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  color: @text;

  &:hover:not(:disabled) {
    border-color: @primary;
    background: #f0fdf4;
  }

  &.primary {
    background: #f0fdf4;
    border-color: rgba(32, 188, 86, 0.35);
    color: #166534;
    font-weight: 600;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.viewer-mask {
  position: fixed;
  inset: 0;
  z-index: 300;
  background: rgba(15, 23, 42, 0.55);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 20px;
}

.viewer-box {
  width: 100%;
  max-width: 1180px;
  background: #fff;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.2);

  &--wide {
    max-width: min(1400px, 100%);
  }
}

.viewer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid @border;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
}

.viewer-title {
  font-weight: 600;
  font-size: 15px;
  color: @text;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  :deep(.app-icon) {
    color: @primary;
    flex-shrink: 0;
  }
}

.viewer-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.btn-save {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: linear-gradient(135deg, #22c65b, @primary);
  color: #fff;
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(32, 188, 86, 0.3);

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.viewer-body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: #fafbfc;
  display: flex;
  flex-direction: column;

  :deep(.univer-office-viewer) {
    flex: 1;
    min-height: 480px;
  }
}

.text-editor {
  width: 100%;
  min-height: 100%;
  height: 100%;
  border: none;
  padding: 20px 24px;
  font-family: Consolas, Monaco, monospace;
  font-size: 14px;
  line-height: 1.6;
  resize: none;
  outline: none;
  box-sizing: border-box;
  background: #fff;
}

.unsupported-view {
  text-align: center;
  padding: 64px 24px;
  color: @muted;

  p {
    margin-bottom: 20px;
    font-size: 15px;
  }
}

.img-view {
  max-width: 100%;
  display: block;
  margin: 0 auto;
  padding: 24px;
}

.pdf-view {
  width: 100%;
  height: 100%;
  min-height: 480px;
  border: none;
  background: #fff;
}

.btn-close {
  border: none;
  background: #f1f5f9;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  color: @muted;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #fee2e2;
    color: #ef4444;
  }
}

@media (max-width: 768px) {
  .files-toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
    padding: 10px 12px;
  }

  .path-tab {
    max-width: 120px;
    padding: 4px 8px;
    font-size: 12px;
  }

  .tool-btns {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
  }

  .create-menu {
    grid-column: 1;
  }

  .btn-upload {
    justify-content: center;
    grid-column: 1 / -1;
  }

  .files-list-head,
  .file-row {
    grid-template-columns: minmax(0, 1fr) 96px;
    padding-right: 10px;
  }

  .files-list-head .col-size,
  .files-list-head .col-time,
  .file-row > .col-size,
  .file-row > .col-time {
    display: none;
  }

  .row-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .file-sub {
    display: block;
  }

  .viewer-mask {
    padding: 0;
  }

  .viewer-box {
    max-width: none;
    border-radius: 0;
    min-height: 100dvh;
  }

  .viewer-head {
    flex-wrap: wrap;
    padding: 10px 12px;
  }

  .modal-mask,
  .doc-modal-mask {
    padding: 12px;
    align-items: flex-end;
  }

  .modal-box,
  .doc-modal {
    width: 100%;
    border-radius: 14px 14px 0 0;
  }
}
</style>

<style lang="less">
.files-ctx-menu {
  position: fixed;
  z-index: 10060;
  min-width: 168px;
  margin: 0;
  padding: 6px;
  list-style: none;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.14);

  li {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 36px;
    padding: 0 10px;
    border-radius: 8px;
    color: #334155;
    font-size: 13px;
    cursor: pointer;

    &:hover {
      background: #f0fdf4;
      color: #15803d;
    }

    &.danger {
      color: #dc2626;

      &:hover {
        background: #fef2f2;
        color: #dc2626;
      }
    }
  }
}
</style>
