<template>
  <view>
    <z-paging ref="paging" v-model="talkList"
              use-chat-record-mode use-virtual-list cell-height-mode="dynamic"
              safe-area-inset-bottom bottom-bg-color="#f8f8f8"
              @query="getHistoryMsg"
              @keyboardHeightChange="keyboardHeightChange"
              @hidedKeyboard="hidedKeyboard">
      <template #cell="{item}">
        <view style="transform: scaleY(-1)">
          <chat-item :item="item"></chat-item>
        </view>
      </template>
      <template #bottom>
        <chat-input-bar ref="inputBar" @send="send" @handleOpen="handleopen"/>
      </template>
    </z-paging>

    <!-- <user-model ref="userModel" :chatIntegral="chatIntegral" @save="updateUserInfo"/> -->
    <u-top-tips ref="uTips"/>
  </view>
</template>

<script>
import chatInputBar from '@/components/chat-input-bar/chat-input-bar.vue'
import chatItem from '@/components/chat-item/chat-item.vue'
import userModel from '@/components/user-model/user-model.vue'
import { zhipuChat } from '@/utils/zhipu.js'

import uTopTips from '@/uview-ui/components/u-top-tips/u-top-tips.vue'
const globalData = getApp().globalData

export default {
  components: { chatInputBar, chatItem, userModel,uTopTips },
  data() {
    return {
      talkList: [],
      sendState: false,
      userInfo: null,
      chatIntegral: 0
    }
  },
  onLoad() {
    this.userInfo = this.getLoginUserInfo?.() || null
  },
  methods: {
    updateUserInfo() {
      this.userInfo = this.getLoginUserInfo?.() || null
    },
    getHistoryMsg() {
      this.$refs.paging.complete([{
        content: '小康为您服务，欢迎问我问题！',
        type: 0, end: true, icon: '/static/logo.png'
      }])
    },
    keyboardHeightChange(res) {
      this.$refs.inputBar.updateKeyboardHeightChange(res)
    },
    hidedKeyboard() {
      this.$refs.inputBar.hidedKeyboard()
    },
    handleopen() {
      this.$refs.userModel.open('base')
    },
    async send(msg) {
      if (!msg) {
        this.$refs.uTips.show({ title: '请输入内容', type: 'error', duration: 2300 })
        return
      }
      if (this.sendState) return
      this.sendState = true
      this.$refs.inputBar.setMsg('')
    
      // 用户消息添加到 talkList
      this.talkList.unshift({
        content: msg,
        type: 1,
        end: true,
        icon: this.userInfo?.icon || '/static/avatar.png'
      })
    
      // 添加“AI正在思考”占位
      const aiMsg = {
        content: '思考中...',
        type: 0,
        end: false,
        icon: '/static/logo.png'
      }
      this.talkList.unshift(aiMsg)
      this.$forceUpdate()
    
      try {
        const reply = await zhipuChat(msg) // ✅ 调用智谱AI接口
        aiMsg.content = reply
      } catch (e) {
        aiMsg.content = 'AI请求失败：' + e
      } finally {
        aiMsg.end = true
        this.$forceUpdate()
        this.sendState = false
      }
    }

  }
}
</script>

<style lang="scss">

	page {
		background-color: #f3f3f3;
		font-size: 28rpx;
		box-sizing: border-box;
		color: #333;
		letter-spacing: 0;
		word-wrap: break-word;
	}
</style>
