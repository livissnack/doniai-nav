<template>
  <div class="panel">
    <p class="panel-heading todo-title">
      今天工作任务
    </p>

    <a
      class="panel-block todo-list is-active"
      v-for="todo in todos"
      :key="todo.index"
    >
      <div class="todo-content">
        <b-checkbox
          size="is-small"
          type="is-success"
          v-model="todo.is_completed"
        >
          <span :class="todo.is_completed ? 'text-through' : ''">{{
            todo.remark
          }}</span>
        </b-checkbox>
      </div>
      <div class="todo-handle">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"></a>

          <div class="navbar-dropdown">
            <a class="navbar-item" @click="editTodo(todo)">
              编辑
            </a>
            <a class="navbar-item">
              移动到今天
            </a>
            <hr class="navbar-divider" />
            <a class="navbar-item" @click="deleleTodo(todo)">
              删除
            </a>
          </div>
        </div>
      </div>
    </a>
    <div class="panel-block">
      <p class="control">
        <input
          class="input is-small"
          v-model="new_todo_text"
          type="text"
          @keyup.enter="newTodo"
          placeholder="新任务"
        />
      </p>
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
          remark: '10点喝水',
          is_completed: true
        },
        {
          id: 2,
          remark: '11点上厕所',
          is_completed: false
        },
        {
          id: 3,
          remark: '12点吃饭',
          is_completed: false
        },
        {
          id: 4,
          remark: '13点午休',
          is_completed: false
        }
      ]
    }
  },
  methods: {
    newTodo() {
      if (this.new_todo_text !== '' && this.todo_input_model === 'add') {
        let newObj = {
          id: this.todos.length + 1,
          remark: this.new_todo_text,
          is_completed: false
        }
        this.todos.push(newObj)
      }
    },
    deleleTodo(item) {
      removeArr(this.todos, item)
    },
    editTodo() {
      this.todo_input_model = 'edit'
    }
  }
}
</script>

<style lang="less" scoped>
.panel {
  background: #ffffff;
  .todo-title {
    color: #363636;
    font-weight: 700;
    padding: 0.75rem;
    font-size: 1em;
  }
  .panel-heading {
    &:first-child {
      border-bottom: 1px solid #dbdbdb;
    }
  }
}

.todo-list {
  justify-content: space-between;
  .todo-content {
    display: flex;
    align-items: center;
  }
}

.text-through {
  text-decoration: line-through;
}
</style>
