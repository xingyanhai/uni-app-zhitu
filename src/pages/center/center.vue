<template>
	<view class="center">
		<view class="logo" :hover-class="!userInfo.isLogin ? 'logo-hover' : ''">
			<button class="get-user-button" @getuserinfo="getUserInfoClick" open-type="getUserInfo">
				<image class="logo-img" mode="widthFix" :src="userInfo.avatarUrl ? userInfo.avatarUrl :avatarUrl"></image>
				<view class="logo-title">
					<view class="uer-name">{{userInfo.nickName ? userInfo.nickName : '点击授权用户信息'}}
					</view>
				</view>
			</button>
		</view>
		<view class="center-list">
			<view class="center-list-item border-bottom" @click="goAbout">
				<text class="list-icon">&#xe603;</text>
				<text class="list-text">{{(config && config.notice && config.notice.entryName) || '关于'}}</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
            <view class="center-list-item border-bottom">
                <text class="list-icon">&#xe62d;</text>
                <view class="list-text">
					<button class="share common-open-type-button" open-type="share">分享好友</button>
				</view>
                <text class="navigat-arrow">&#xe65e;</text>
            </view>
			<view class="center-list-item border-bottom">
                <text class="list-icon">&#xe609;</text>
                <view class="list-text">
					<button class="share common-open-type-button" open-type="feedback">反馈建议</button>
				</view>
                <text class="navigat-arrow">&#xe65e;</text>
            </view>
			<view class="center-list-item" @click="toPage('/pages/tools/tools')" v-if="userPower === -1">
				<text class="list-icon">&#xe609;</text>
				<text class="list-text">tools</text>
				<text class="navigat-arrow">&#xe65e;</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		mapState,
		mapMutations
	} from 'vuex'
	export default {
		data() {
			return {
				avatarUrl: '/static/img/logo.png',
			}
		},
		computed: mapState(['userInfo','config', 'userPower', 'shareImgUrl']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
            getUserInfoClick (e) {
              e.detail.userInfo.isLogin = true
              wx.cloud.init()                              //调用前需先调用init
              wx.cloud.callFunction({
                name: 'addDataToCould',
                data: {
                  dbName: 'userList',
                  primaryKey: 'openId',
                  list: [e.detail.userInfo]
                }
              }).then(async res => {
                await this.getUserInfo()
                uni.showToast(
                  {
                    title: `获取信息成功!`,
                    icon: 'none',
                  }
                );
              })
            },
			goAbout() {
				uni.navigateTo({
					url: '/pages/about/about'
				});
			},
			toPage (url) {
				uni.navigateTo({
					url
				});
			},
		},
       // 加了这个页面才可以被分享
		onShareAppMessage: function (res) {
		},
		onLoad() {
			console.log(this.userPower)
			// this.getUserInfo()
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
	.center {
		flex-direction: column;
		min-height: 100vh;
	}
	.logo {
		padding-top 50px
		margin-bottom 20px
		display: block;
		width: 100%;
		box-sizing: border-box;
		overflow: hidden;
		background-color $uni-list-item-color;
		.get-user-button {
			display: flex;
			width: 100%;
			height: 100%;
			background-color: transparent;
			border: none;
			padding: 20px 0 0;
			margin: 0;
			border-radius: 0;
			justify-content: start;
			align-items center
			box-sizing: border-box;
			overflow: hidden;
			margin-top: -1px;
			&:after {
				border none
			}
		}
		.logo-img {
			width: 75px;
			height: 75px;
			border: 2px solid #fff;
			margin 0 20px
			border-radius 50%;
		}
		.logo-title {
			display: block;
			text-align: center;
			color: #fff;
			.uer-name {
				font-size: 16px;
				line-height: 40px;
			}
			.phone-number {
				font-size: 14px;
			}
		}
	}

	.logo-hover {
		opacity: 0.8;
	}

	.center-list {
		background-color: $uni-list-item-color;
		margin-top: 20upx;
		width: 750upx;
		flex-direction: column;
	}

	.center-list-item {
		height: 90upx;
		width: 750upx;
		box-sizing: border-box;
		flex-direction: row;
		padding: 0upx 20upx;
	}

	.border-bottom {
		border-bottom-width: 0.5px;
		border-color: $uni-border-color;
		border-bottom-style: solid;
	}

	.list-icon {
		width: 40upx;
		height: 90upx;
		line-height: 90upx;
		font-size: 34upx;
		color: $uni-text-color;
		text-align: center;
		font-family: texticons;
		margin-right: 20upx;
	}

	.list-text {
		height: 90upx;
		line-height: 90upx;
		font-size: 14px;
		color: $uni-text-color;
		flex: 1;
		text-align: left;
	}

	.navigat-arrow {
		height: 90upx;
		width: 40upx;
		line-height: 90upx;
		font-size: 34upx;
		color: #555;
		text-align: right;
		font-family: texticons;
	}
	.share {
		font-size 14px
		line-height: 90upx
		width 100%
	}
</style>
