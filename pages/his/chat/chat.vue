<template>
	<view class="container" :style="pageHeight">
		<view class="box-1">
			<scroll-view 
				scroll-y 
				refresher-background="transparent"
				style="height: 100%;" 
				@refresherrefresh="refresherrefresh"
				:refresher-enabled="true"
				:scroll-with-animation="false"
				:refresher-triggered="scrollView.refresherTriggered"
				:scroll-into-view="scrollView.intoView"
			>
				<view class="talk-list">
					<view 
						v-for="(item,index) in talkList" 
						:key="item.id" 
						:id="'msg-'+item.id"
					>
						<view class="item flex-col" :class=" item.type == 1 ? 'push':'pull' ">
							<image :src="item.pic" mode="aspectFill" class="pic"></image>
							<view class="content">
								<template v-if="item.contentType === 'image'">
									<image :src="item.content" mode="widthFix" style="width: 400rpx;"></image>
								</template>
								<template v-else>
									{{item.content}}
								</template>
							</view>
						</view>
					</view>
					
				</view>
			</scroll-view>
		</view>
		<view class="box-2">
			<view class="flex-col">
				<view style="margin-right: 20rpx;">
					<uni-icons type="image" size="24" color="#42b983" @tap="handleImageClick"></uni-icons>
				</view>
				<view class="flex-grow">
					<input type="text" class="content" v-model="content" placeholder="请输入聊天内容" placeholder-style="color:#DDD;" :cursor-spacing="6">
				</view>
				<button class="send" @tap="handleSendClick">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex'

export default {
	data() {
		return {
			scrollView: {
				refresherTriggered: false,
				intoView: "",
				safeAreaHeight: 0
			},
			talkList: [],
			ajax: {
				rows: 20,
				page: 1,
				flag: true,
			},
			content: ''
		}
	},
	computed: {
		...mapState(['url', 'id']), // 从 Vuex 中读取 url 和 id
		pageHeight() {
			const safeAreaHeight = this.scrollView.safeAreaHeight;
			if (safeAreaHeight > 0) {
				return `height: calc(${safeAreaHeight}px - var(--window-top));`
			}
			return "";
		}
	},
	onLoad() {
		console.log('onLoad 被触发');
		console.log('onLoad 执行，患者ID:', this.id);
		console.log('后端地址 webUrl:', this.url);
		// #ifdef H5
		this.scrollView.safeAreaHeight = uni.getSystemInfoSync().safeArea.height;
		// #endif
		this.getMessage();
	},
	methods: {
		async getMessage() {
			this.ajax.flag = false;
		
			const payload = {
				doctorId: 77,
				patientId: Number(this.id)
			};
		
			console.log('请求消息记录（表单格式）:', payload);
		
			try {
				const [err, res] = await uni.request({
					url: `http://${this.url}/appChat/getChatMessages`,
					method: 'post',
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: payload
				});
		
				console.log('获取消息接口响应:', [err, res]);
		
				if (res?.data?.code === 200) {
					const raw = res.data.data || [];
					const formatted = raw.map(msg => ({
						id: msg.id,
						content: msg.content,
						contentType: msg.msgType === 2 ? 'image' : 'text',
						type: msg.senderType === 1 ? 1 : 2,
						pic: msg.senderType === 1 ? '/static/logo.png' : '/static/doctor.png'
					}));
					this.talkList = formatted.reverse();
					if (formatted.length > 0) {
						this.scrollView.intoView = `msg-${formatted[formatted.length - 1].id}`;
					}
				} else {
					console.error('消息获取失败，返回数据:', res?.data);
					uni.showToast({ title: '消息获取失败', icon: 'none' });
				}
			} catch (e) {
				console.error('网络异常:', e);
				uni.showToast({ title: '网络错误', icon: 'none' });
			}
		
			this.scrollView.refresherTriggered = false;
			this.ajax.flag = true;
		},

		handleSendClick() {
			console.log('点击发送按钮，内容为：', this.content);
			if (!this.content) {
				uni.showToast({ title: '请输入有效的内容', icon: 'none' });
				return;
			}
			this.sendMessage(this.content, 'text');
			this.content = '';
		},
		handleImageClick() {
			uni.chooseImage({
				count: 1,
				sizeType: ['original'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const imageUrl = res.tempFilePaths[0];
					this.sendMessage(imageUrl, 'image');
				}
			});
		},
		async sendMessage(content, contentType = 'text') {
			const payload = {
				doctorId: 77,
				patientId: Number(this.id),
				content: content
			};
		
			console.log('发送请求体（表单格式）:', payload);
		
			try {
				const [err, res] = await uni.request({
					url: `http://${this.url}/appChat/sendPatientTextMessage`,
					method: 'post',
					header: {
						'content-type': 'application/x-www-form-urlencoded'
					},
					data: payload
				});
		
				console.log('发送消息接口响应:', [err, res]);
		
				if (res?.data?.code !== 200) {
					console.error('发送消息失败，返回数据:', res?.data);
					uni.showToast({ icon: 'none', title: res?.data?.message || '发送失败' });
					return;
				}
		
				const msg = res.data.data;
				this.talkList.unshift({
					id: msg.id,
					content: msg.content,
					contentType: msg.msgType === 2 ? 'image' : 'text',
					type: 1,
					pic: '/static/logo.png'
				});
			} catch (e) {
				console.error('发送请求失败：', e);
				uni.showToast({ icon: 'none', title: '发送失败' });
			}
		}

	}
}
</script>





<style lang="scss">
	// @import "../../lib/global.scss";
	@import "@/lib/global.scss";
	page{
		background-color: #F3F3F3;
		font-size: 28rpx;
	}
	.container{
		height: calc(100vh - var(--window-top));
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;
		align-content: center;
		justify-content: space-between;
		align-items: stretch;
	}
	
	/* 加载数据提示 */
	.tips{
		position: fixed;
		left: 0;
		top:var(--window-top);
		width: 100%;
		z-index: 9;
		background-color: rgba(0,0,0,0.15);
		height: 72rpx;
		line-height: 72rpx;
		transform:translateY(-80rpx);
		transition: transform 0.3s ease-in-out 0s;
		
		&.show{
			transform:translateY(0);
		}
	}
	
	.box-1{
		width: 100%;
		height: 0;
		flex: 1 0 auto;
		box-sizing: content-box;
	}
	.box-2{
		height: auto;
		z-index: 2;
		border-top: #e5e5e5 solid 1px;
		box-sizing: content-box;
		background-color: #F3F3F3;
		
		/* 兼容iPhoneX */
		padding-bottom: 0;  
		padding-bottom: constant(safe-area-inset-bottom);  
		padding-bottom: env(safe-area-inset-bottom);  
		
		>view{
			padding: 0 20rpx;
			height: 100rpx;
		}
		
		.content{
			background-color: #fff;
			height: 64rpx;
			padding: 0 20rpx;
			border-radius: 32rpx;
			font-size: 28rpx;
		}
		
		.send{
			background-color: #42b983;
			color: #fff;
			height: 64rpx;
			margin-left: 20rpx;
			border-radius: 32rpx;
			padding: 0;
			width: 120rpx;
			line-height: 62rpx;
			
			&:active{
				background-color: #5fc496;
			}
		}
	}
	
	.talk-list{
		padding-bottom: 20rpx;
		display: flex;
		flex-direction: column-reverse;
		flex-wrap: nowrap;
		align-content: flex-start;
		justify-content: flex-end;
		align-items: stretch;
		
		// 添加弹性容器，让内容自动在顶部
		&::before{
			content: '.';
			display: inline;
			visibility: hidden;
			line-height: 0;
			font-size: 0;
			flex: 1 0 auto;
			height: 1px;
		}
		
		
		/* 消息项，基础类 */
		.item{
			padding: 20rpx 20rpx 0 20rpx;
			align-items:flex-start;
			align-content:flex-start;
			color: #333;
			
			.pic{
				width: 92rpx;
				height: 92rpx;
				border-radius: 50%;
				border: #fff solid 1px;
			}
			
			.content{
				padding: 20rpx;
				border-radius: 4px;
				max-width: 500rpx;
				word-break: break-all;
				line-height: 52rpx;
				position: relative;
			}
			
			/* 收到的消息 */
			&.pull{
				.content{
					margin-left: 32rpx;
					background-color: #fff;
					
					&::after{
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-right: 20rpx solid #fff;
						position: absolute;
						top: 30rpx;
						left: -18rpx;
					}
				}
			}
			
			/* 发出的消息 */
			&.push{
				/* 主轴为水平方向，起点在右端。使不修改DOM结构，也能改变元素排列顺序 */
				flex-direction: row-reverse;
				
				.content{
					margin-right: 32rpx;
					background-color: #a0e959;
					
					&::after{
						content: '';
						display: block;
						width: 0;
						height: 0;
						border-top: 16rpx solid transparent;
						border-bottom: 16rpx solid transparent;
						border-left: 20rpx solid #a0e959;
						position: absolute;
						top: 30rpx;
						right: -18rpx;
					}
				}
			}
		}
	}
</style>