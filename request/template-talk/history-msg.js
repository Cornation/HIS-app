export const getHistoryMsg = (params)=>{
	const { page = 1,rows = 10 } = params ?? {};
	let join = ()=>{
		let arr = [];
		
		//通过当前页码及页数，模拟数据内容
		let startIndex = (page-1) * rows;
		let endIndex = startIndex + rows;
		for(let i = startIndex; i < endIndex; i++){
			arr.push({
				"id":i,	// 消息的ID
				"content":`这是历史记录的第${i+1}条消息，第${page}页`,	// 消息内容
				"type":Math.random() > 0.5 ? 1 : 0	,// 此为消息类别，设 1 为发出去的消息，0 为收到对方的消息,
				"pic":"/static/logo.png"	// 头像
			})
		}
		
		/*
			颠倒数组中元素的顺序。将最新的数据排在本次接口返回数据的最后面。
			后端接口按 消息的时间降序查找出当前页的数据后，再将本页数据按消息时间降序排序返回。
			这是数据的重点，因为页面滚动条和上拉加载历史的问题。
		 */
		// arr.reverse();
		
		return arr;
	}
	
	// 此处用到 ES6 的 Promise 知识，不懂的请自行学习。
	return new Promise((done,fail)=>{
		// 无数据请求接口，由 setTimeout 模拟，正式项目替换为 ajax 即可。
		setTimeout(()=>{
			let data = join();
			done(data);
		},1000);
	})
}