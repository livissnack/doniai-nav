<template>
  <div class="panel">
    <div class="todo-title panel-heading">
      <div><h3>今天工作任务</h3></div>
      <div class="todo-num">任务总数：{{ todoTotal }}</div>
    </div>

    <a class="panel-block todo-list" v-for="(todo, index) in todos" :key="index">
      <div class="todo-content">
        <b-checkbox
          size="is-small"
          type="is-success"
          v-model="todo.is_completed"
        >
          <span :class="todo.is_completed ? 'text-through' : ''" v-if="!todo.is_edit">{{
            todo.remark
          }}</span>
        </b-checkbox>

          <p class="control has-icons-left" v-if="todo.is_edit">
            <input
                class="input is-small"
                v-model="todo.remark"
                type="search"
                @keyup.enter="editTodo(todo, index)"
                :placeholder="todo.is_edit ? todo.remark : ''"
            />
            <span class="icon is-small is-left">
              <i class="fas fa-edit"></i>
            </span>
          </p>
      </div>
      <div class="todo-handle">
        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link"></a>

          <div class="navbar-dropdown">
            <a class="navbar-item" @click="switchEditTodo(todo)">
              {{ todo.is_edit ? '完成' : '编辑' }}
            </a>
            <a class="navbar-item">
              移动到今天
            </a>
            <hr class="navbar-divider" />
            <a class="navbar-item" @click="deleteTodo(todo)">
              删除
            </a>
          </div>
        </div>
      </div>
    </a>
    <div class="panel-block">
      <p class="control has-icons-left">
        <input
          class="input is-small"
          v-model="new_todo_text"
          type="search"
          @keyup.enter="newTodo"
          placeholder="新任务"
        />
        <span class="icon is-small is-left">
          <i class="fas fa-plus-circle"></i>
        </span>
      </p>
    </div>
  </div>
</template>

<script>
import {removeArr} from '@/utils/helper.js'

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
          id: 1,
          remark: '10点喝水',
          is_completed: true,
          is_edit: false,
        },
        {
          id: 2,
          remark: '11点上厕所',
          is_completed: false,
          is_edit: false,
        },
        {
          id: 3,
          remark: '12点吃饭',
          is_completed: false,
          is_edit: false,
        },
        {
          id: 4,
          remark: '13点午休',
          is_completed: false,
          is_edit: false,
        }
      ]
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
        let newObj = {
          id: this.todos.length + 1,
          remark: this.new_todo_text,
          is_completed: false,
          is_edit: false,
        }
        this.todos.push(newObj)
      }
    },
    deleteTodo(item) {
      removeArr(this.todos, item)
    },
    switchEditTodo(item) {
      item.is_edit = !item.is_edit
    },
    editTodo(item, index) {
      item.is_edit = !item.is_edit
      this.todos[index] = item
    }
  }
}
</script>

<style lang="less" scoped>
.panel {
  background: #ffffff;
  .todo-title {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    div {
      h3 {
        font-size: 1em;
        font-weight: 700;
        color: #363636;
      }
    }
    .todo-num {
      font-size: 15px;
    }
  }

  .todo-title {
    background: #ffffff;
    color: #363636;
    font-weight: 700;
    padding: 0.75rem;
  }
  .panel-heading {
    padding: 0.75rem;
    font-size: 1.05em;
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
    font-size: 1em;
  }
}

.text-through {
  text-decoration: line-through;
}
</style>
