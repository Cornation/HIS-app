<template>
	<view class="page">
		<!-- 顶部轮播图 -->
		<swiper class="banner" indicator-dots autoplay interval="3000" circular>
			<swiper-item v-for="index in 7" :key="index">
				<image :src="`../../static/banner/${index}.png`" mode="aspectFill" class="banner-img" />
			</swiper-item>
		</swiper>

		

		<!-- AI 问答入口 -->
		<view class="ai-chat-entry active-entry" @tap="goToAiChat">
			<view class="tool_wrap">
				<view class="tool_info">
					<view class="tool_name">AI问答</view>
					<view class="tool_hint">解你困惑，知你烦恼</view>
				</view>
				<image class="img" src="/static/user/card.png" mode="widthFix"></image>
			</view>
		</view>

		<!-- 医生问答入口 -->
		<view class="ai-chat-entry active-entry" @tap="goToChat">
			<view class="tool_wrap">
				<view class="tool_info">
					<view class="tool_name">医生问答</view>
					<view class="tool_hint">解你困惑，知你烦恼</view>
				</view>
				<image class="img" src="/static/user/card.png" mode="widthFix"></image>
			</view>
		</view>

		<!-- 科室列表 -->
		<view class="title">科室介绍</view>
		<view class="dept-container">
			<view class="dept-card" v-for="(value, key) in deptList" :key="key">
				<view class="dept-title">{{ value.deptName }}</view>
				<view class="dept-desc">{{ value.description }}</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex';

	export default {
		computed: {
			...mapState(['url', 'hasLogin', 'name', 'patientId', 'idCard', 'homeAddress', 'phoneNo', 'gender',
				'medicalRecordNo'
			])
		},
		data() {
			return {
				imgUrls: [],
				deptList: []
			}
		},
		onLoad() {
			this.getDept();
		},
		methods: {
			// 修改2：确保方法正确触发
			goToAiChat() {
				console.log("跳转到AI聊天页面");
				uni.navigateTo({
					url: '/pages/his/aiChat/aiChat'
				});
			},
			goToChat() {
				console.log("跳转到医生聊天页面");
				uni.navigateTo({
					url: '/pages/his/chat/chat'
				});
			},
			async getDept() {
				const [error, res] = await uni.request({
					url: 'http://' + this.url + '/appRegHistory/getDeptDescription',
					method: 'POST'
				});
				if (error || !res || !res.data) {
					uni.showToast({
						icon: 'none',
						title: '网络错误'
					});
					return;
				}
				this.deptList = Array.isArray(res.data.data) ? res.data.data : [];
				this.imgUrls = this.deptList
					.filter(item => item.url)
					.map(item => item.url);
			}
		}
	}
</script>
<style scoped>
	.page {
		background-color: #f5f5f5;
		padding-bottom: 100rpx;
	}

	.banner {
		width: 100%;
		height: 500rpx;
	}

	.banner-img {
		width: 100%;
		height: 100%;
		display: block;
		border-radius: 0;
	}

	.title {
		font-size: 36rpx;
		font-weight: bold;
		padding: 30rpx 24rpx 20rpx;
		color: #333;
	}

	.ai-chat-entry {
		width: 92%;
		margin: 20rpx auto;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.05);
		/* 修改3：确保可点击区域 */
		position: relative;
		z-index: 10;
		overflow: visible;
	}

	.tool_wrap {
		box-sizing: border-box;
		width: 100%;
		display: flex;
		padding: 30rpx;
	}

	.tool_info {
		flex: 1;
	}

	.tool_name {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.tool_hint {
		margin-top: 10rpx;
		font-size: 22rpx;
		color: #999;
	}

	.img {
		width: 60rpx;
		height: 60rpx;
	}

	.dept-container {
		display: flex;
		flex-direction: column;
		padding: 0 24rpx;
		gap: 24rpx;
		margin-bottom: 100rpx; /* ✅ 新增底部间距 */
	}

	.dept-card {
		background-color: #ffffff;
		border-radius: 20rpx;
		box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.05);
		padding: 24rpx;
	}

	.active-entry {
		position: relative;
		z-index: 15;
	}

	.active-entry:active {
		background-color: #f5f5f5;
		opacity: 0.9;
	}

	.dept-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #2c3e50;
		margin-bottom: 12rpx;
	}

	.dept-desc {
		font-size: 28rpx;
		color: #666666;
		line-height: 1.6;
	}
</style>