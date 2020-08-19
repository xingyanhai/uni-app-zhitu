

<template>
	<view class="wrap">
		<view class="list" v-if="dataList && dataList.length">
			<view class="item" v-for="(value, index) in dataList"
				  :key="index"
				  @tap="toDetail(value)">
				<view class="title">
					{{value.questionName}}
				</view>
				<view class="content">
					<view class="left">
						<view class="author">
							<view class="author-left">
								<image class="author-img" :src="value.authorImg"></image>
								<view class="author-name">{{value.authorName}}</view>
							</view>
							<view class="author-text">{{value.authorBadgeText}}</view>
						</view>
						<view>
							<view class="answer-up-num">{{value.answerUpNum}}赞</view>
							<view>共{{value.answerImgList.length}}张图片</view>
						</view>
						<view>{{value.editTimeText}}</view>
					</view>
					<view class="right">
						<image class="img" mode="aspectFill" :src="value.answerImgList[0]"></image>
					</view>
				</view>
				<view class="bottom">
					<view class="num1">问题关注量{{value.questionFollowNum}}</view>
					<view>浏览量{{value.questionReadNum}}</view>
				</view>
			</view>
		</view>
		<view class="common-no-data-box">
			{{loadMoreText || ''}}
		</view>
	</view>
</template>

<script>
	import SearchBtn from '../components/search-btn'

	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				search: '',
				loadMoreText: '加载中...',
				pageNo:1,
				pageSize: 20,
				dataList: [],
				loading: false
			};
		},
		components: {SearchBtn},
        computed: mapState(['userInfo']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
			copy (item) {
				console.log(item)
				let text = `${item.src}\n${item.text}`
				wx.setClipboardData({
					data: text,
					success (res) {
						wx.getClipboardData({
							success (res) {
								console.log(res.data) // data
							}
						})
					}
				})
			},
			async getData() {
				if(this.loading) {
					return
				}
				this.loading = true
				this.loadMoreText = '加载中...'
				let res = await wx.cloud.callFunction({
					name: 'getDbListData',
					data: {
						dbName: 'zhihuImgAnswer',
						pageNo: this.pageNo,
						pageSize: this.pageSize,
						limitType: 3,
						params: {
						},
						orderName: 'answerUpNum',
						orderType: 'desc'
					}
				})
				this.loading = false
				this.totalCount = res.result.totalCount
				const data = res.result.data;
				if(data && data.length) {
					this.pageNo += 1
				}
				let list = [];
				for (var i = 0; i < data.length; i++) {
					let item = data[i];
					list.push({
						...item
					});
				}
				this.dataList = this.dataList.concat(list);
				if(data.length < this.pageSize) {
					this.loadMoreText = '没有更多了'
				}
				if(this.dataList && this.dataList.length<=0) {
					this.loadMoreText = '暂无数据'
					this.dataList = list;
				}
			},

			toDetail (data) {
				uni.navigateTo({
					url: `/pages/answer/detail?id=${data._id}`
				})
			}
		},
		onReachBottom() {
			console.log('滑动到页面底部')
			if ((this.pageNo -1) *this.pageSize >= this.totalCount || this.dataList.length >= this.totalCount) {
				this.loadMoreText = '没有更多了'
				return;
			}
			this.getData();
		},
		// 加了这个页面才可以被分享
		onShareAppMessage: function (res) {
		},
		async onLoad() {
			this.getData()
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
.wrap
	display block
	width 100%
.search-box
	box-sizing border-box
	display block
	width 100%
	padding 10px

.list
	display flex
	flex-direction column
	width 100%
	.item
		display block
		margin 5px
		padding 5px
		border-radius 5px
		background-color #fff
		.title
			width 100%;
			font-size 18px
			margin 5px 0
		.content
			display flex
			width 100%
			overflow hidden
			justify-content space-between
			.left
				display block
				flex 1
				max-width calc(100vw - 120px)
				.answer-up-num
					margin-right 10px
				.author
					line-height 30px
					width 100%
					display flex
					align-items center
					font-size 12px;
					.author-left
						display flex
						align-items center
						.author-img
							width 22px;
							height 22px;
							border-radius 2px
						.author-name
							padding-left 3px
							white-space nowrap
					.author-text
						color $uni-text-light-color
						padding-left 3px
						flex 1
						white-space: nowrap;
						text-overflow: ellipsis;
						overflow: hidden;
						word-break: break-all;
			.right
				padding-left: 12px;
				overflow hidden
				flex-shrink 0
				.img
					border-radius: 4px;
					height: 60px;
					width: 90px;
		.bottom
			display flex
			font-size 12px
			line-height 30px
			justify-content flex-end
			view
				color $uni-text-light-color
			.num1
				margin-right 10px
.center
	text-align center
	margin 20px 0
	color #999
	width 100%
	display block
</style>
