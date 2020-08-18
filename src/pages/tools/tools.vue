<template>
	<form class='loginView'>
		<view class="input-view-item">
			<input class="input" v-model="topicId" placeholder="输入topicId"/>
		</view>
		<view class="input-view-item">
			<input class="input" v-model="count" placeholder="输入count"/>
		</view>
		<view class="button-view">
			<button type="primary" @click="updateData">添加/更新话题回答</button>
		</view>
	</form>
</template>

<script>
	import NoData from '../components/no-data'
	import {
		mapState,
		mapMutations
	} from 'vuex'
	import * as util from '../../common/util'
	export default {
		components: {
			NoData
		},
		data() {
			return {
				topicId: '',
				count: '',
			};
		},
        computed: mapState(['userInfo']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
			async updateData () {
				uni.showLoading({
					title: '加载中...'
				})
				try {
					let res = await wx.cloud.callFunction({
						name: 'interval',
						data: {
							topicId: this.topicId,
							count: this.count,
						}
					})
					uni.hideLoading()
					uni.showToast({
						title: `${res.errMsg}`,
						duration: 2000,
						icon: 'none'
					});
				} catch (e) {
					uni.hideLoading()
					uni.showToast({
						title: `超时`,
						duration: 2000,
						icon: 'none'
					});
				}
			}
		},
		// 加了这个页面才可以被分享
		onShareAppMessage () {
		},
		async onLoad() {
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
	.input-view-item
		border-bottom 1px solid $uni-border-color
</style>
