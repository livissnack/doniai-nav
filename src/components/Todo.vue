<template>
  <div class="util-box todo-panel">
    <header class="util-title">
      <h3 class="panel-title">今天工作任务（ {{ todoTotal }} ）</h3>
      <button type="button" class="todo-history">历史任务</button>
    </header>

    <ul class="todo-list">
      <li
        v-for="(todo, index) in todos"
        :key="`${todo.id}-${index}`"
        class="todo-item"
        :class="{ 'is-done-row': todo.is_completed && !todo.is_edit }"
      >
        <div class="todo-item__main">
          <o-checkbox
            v-if="!todo.is_edit"
            v-model="todo.is_completed"
            variant="success"
            size="small"
          >
            <span class="todo-item__text" :class="{ 'is-done': todo.is_completed }">
              {{ todo.remark }}
            </span>
          </o-checkbox>

          <div v-else class="todo-item__edit">
            <i class="fas fa-pen todo-item__edit-icon"></i>
            <input
              v-model="todo.remark"
              class="todo-item__input"
              type="text"
              @keyup.enter="editTodo(todo, index)"
            />
          </div>
        </div>

        <o-dropdown
          class="todo-item__dropdown"
          position="bottom-right"
          teleport
          aria-role="menu"
        >
          <template #trigger>
            <button type="button" class="todo-item__menu" aria-label="操作">
              <i class="fas fa-ellipsis-v"></i>
            </button>
          </template>
          <o-dropdown-item aria-role="menuitem" @click="switchEditTodo(todo)">
            {{ todo.is_edit ? '完成' : '编辑' }}
          </o-dropdown-item>
          <o-dropdown-item aria-role="menuitem">移动到今天</o-dropdown-item>
          <o-dropdown-item separator />
          <o-dropdown-item aria-role="menuitem" variant="danger" @click="deleteTodo(todo)">
            删除
          </o-dropdown-item>
        </o-dropdown>
      </li>
    </ul>

    <div class="todo-add">
      <i class="fas fa-plus-circle todo-add__icon"></i>
      <input
        v-model="new_todo_text"
        class="todo-add__input"
        type="text"
        placeholder="新任务"
        @keyup.enter="newTodo"
      />
    </div>
  </div>
</template>

<script>
import { removeArr } from '@/utils/helper.js'

export default {
  name: 'Todo',
  data() {
    return {
      new_todo_text: '',
      todo_input_model: 'add',
      todos: [
        {
          id: 1,
          remark: '8点40分写日计划',
          is_completed: true,
          is_edit: false,
        },
        {
          id: 2,
          remark: '10点喝水',
          is_completed: true,
          is_edit: false,
        },
        {
          id: 3,
          remark: '11点上厕所',
          is_completed: false,
          is_edit: false,
        },
        {
          id: 4,
          remark: '12点吃饭',
          is_completed: false,
          is_edit: false,
        },
        {
          id: 5,
          remark: '13点午休',
          is_completed: false,
          is_edit: false,
        },
      ],
    }
  },
  computed: {
    todoTotal() {
      return this.todos.length > 0 ? `${this.todos.length}` : '无'
    },
  },
  methods: {
    newTodo() {
      if (this.new_todo_text !== '' && this.todo_input_model === 'add') {
        this.todos.push({
          id: this.todos.length + 1,
          remark: this.new_todo_text,
          is_completed: false,
          is_edit: false,
        })
        this.new_todo_text = ''
      }
    },
    deleteTodo(item) {
      removeArr(this.todos, item)
    },
    switchEditTodo(item) {
      item.is_edit = !item.is_edit
    },
    editTodo(item, index) {
      item.is_edit = false
      this.todos[index] = { ...item }
    },
  },
}
</script>

<style lang="less" scoped>
.todo-panel {
  background: #fff;
  padding: 10px;
  border: 1px solid #e8e8e8;
  border-radius: 0 !important;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.06);
  overflow: visible;
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

.todo-history {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.875rem;
  font-weight: 700;
  color: #363636;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
    color: #f4645f;
  }
}

.todo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 200px;
  overflow-x: hidden;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 0;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.todo-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 2px;
  margin: 0;
  min-width: 0;

  &:hover {
    background: #f5f7fa;
  }

  &.is-done-row .todo-item__text {
    color: #9ca3af;
  }
}

.todo-item__main {
  flex: 1;
  min-width: 0;
  overflow: hidden;

  :deep(.o-chk),
  :deep(.checkbox) {
    width: 100%;
    margin-bottom: 0;
    align-items: flex-start;
  }

  :deep(.o-chk__label),
  :deep(.checkbox span:not(.check)) {
    flex: 1;
    min-width: 0;
  }
}

.todo-item__dropdown {
  flex-shrink: 0;
}

.todo-item__text {
  display: block;
  font-size: 14px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &.is-done {
    text-decoration: line-through;
    color: #9ca3af;
  }
}

.todo-item__edit {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
}

.todo-item__edit-icon {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 12px;
}

.todo-item__input {
  flex: 1;
  min-width: 0;
  height: 26px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  font-size: 13px;
  outline: none;

  &:focus {
    border-color: #20bc56;
  }
}

.todo-item__menu {
  flex-shrink: 0;
  border: none;
  background: none;
  padding: 4px 4px;
  color: #9ca3af;
  cursor: pointer;
  line-height: 1;

  &:hover {
    color: #4b5563;
  }
}

.todo-add {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin-top: 6px;
  padding: 6px 2px 0;
  border-top: 1px solid #f0f0f0;
  box-sizing: border-box;
}

.todo-add__icon {
  flex-shrink: 0;
  color: #9ca3af;
  font-size: 12px;
}

.todo-add__input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 28px;
  padding: 0 8px;
  border: 1px solid #e5e7eb;
  border-radius: 0;
  font-size: 13px;
  color: #374151;
  outline: none;
  background: #fff;
  box-sizing: border-box;

  &:focus {
    border-color: #20bc56;
  }

  &::placeholder {
    color: #9ca3af;
  }
}
</style>
