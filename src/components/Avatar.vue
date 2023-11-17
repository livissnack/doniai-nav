<template>
  <div class="avatar-box">
    <div class="avatar" :class="circle ? 'avatar-circle' : ''">
      <img class="img" :src="imgSrc" alt="avatar-box" v-if="imgSrc">
      <div class="initials" v-if="initials">
        <span class="initials-text">{{ initials }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Avatar',
  props: {
    circle: {
      type: Boolean,
      default: false
    },
    imgSrc: {
      type: String,
      default: ''
    },
    initials: {
      type: String,
      default: 'GX'
    }
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>
@gx-size: 1.5rem;
.avatar-box {
  .avatar {
    width: @gx-size;
    height: @gx-size;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: hsl(240 5% 35.5%);
    font-size: calc(@gx-size * 0.5);
    color: #FFFFFF;
    user-select: none;
    vertical-align: middle;
    .img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      overflow: hidden;
    }
    .initials {
      font-size: 10px;
    }
  }
  .avatar-circle {
    border-radius: 50%;
    .img {
      border-radius: 50%;
    }
  }
}
</style>
