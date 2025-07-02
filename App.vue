<script>
	export default {
		onLaunch: function() {
			console.log('App Launch');

			// ✅ 从本地恢复用户登录状态
			const userInfo = uni.getStorageSync('userInfo');
			if (userInfo && userInfo.hasLogin) {
				console.log('恢复用户状态：', userInfo);
				this.$store.commit('login', userInfo);
			}

			// #ifdef APP-PLUS
			// 锁定屏幕方向
			plus.screen.lockOrientation('portrait-primary'); //锁定

			// 检测升级
			uni.request({
				url: 'https://uniapp.dcloud.io/update', //检查更新的服务器地址
				data: {
					appid: plus.runtime.appid,
					version: plus.runtime.version,
					imei: plus.device.imei
				},
				success: (res) => {
					console.log('success', res);
					if (res.statusCode == 200 && res.data.isUpdate) {
						let openUrl = plus.os.name === 'iOS' ? res.data.iOS : res.data.Android;
						// 提醒用户更新
						uni.showModal({
							title: '更新提示',
							content: res.data.note ? res.data.note : '是否选择更新',
							success: (showResult) => {
								if (showResult.confirm) {
									plus.runtime.openURL(openUrl);
								}
							}
						})
					}
				}
			})
			// #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>
