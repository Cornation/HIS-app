import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
	state: {
		// url: 'localhost:9999',
		id: null,
		url: '172.20.10.2:10013',
		hasLogin: false,
		name: '',
		patientId: '',
		idCard: '',
		homeAddress: '',
		phoneNo: '',
		gender: '',
		medicalRecordNo: '',
		dateOfBirth: ''
	},
	mutations: {
		login(state, provider) {
			state.hasLogin = true;
			state.name = provider.name;
			state.patientId = provider.patientId || provider.id;
			state.idCard = provider.idCard || provider.identificationNo;
			state.homeAddress = provider.homeAddress;
			state.phoneNo = provider.phoneNo;
			state.medicalRecordNo = provider.medicalRecordNo;
			state.dateOfBirth = provider.dateOfBirth;
			const genderCode = provider.gender;
			if (genderCode === 0 || genderCode === '0') {
				state.gender = '男';
			} else if (genderCode === 1 || genderCode === '1') {
				state.gender = '女';
			} else if (provider.gender === '男' || provider.gender === '女') {
				state.gender = provider.gender;
			}
		},
		logout(state) {
			state.hasLogin = false;
			state.name = '';
			state.patientId = '';
			state.idCard = '';
			state.homeAddress = '';
			state.phoneNo = '';
			state.gender = '';
			state.medicalRecordNo = '';
			state.dateOfBirth = '';
			uni.removeStorageSync('userInfo'); // 同步清除本地缓存
		}

	},
	actions: {
		// lazy loading openid
		getUserOpenId: async function ({
			commit,
			state
		}) {
			return await new Promise((resolve, reject) => {
				if (state.openid) {
					resolve(state.openid)
				} else {
					uni.login({
						success: (data) => {
							commit('login')
							setTimeout(function () { //模拟异步请求服务器获取 openid
								const openid = '123456789'
								console.log('uni.request mock openid[' + openid + ']');
								commit('setOpenid', openid)
								resolve(openid)
							}, 1000)
						},
						fail: (err) => {
							console.log('uni.login 接口调用失败，将无法正常使用开放接口等服务', err)
							reject(err)
						}
					})
				}
			})
		}
	}
})

export default store
