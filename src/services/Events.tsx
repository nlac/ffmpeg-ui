
export default class Events {
	
	static subscribers:any[] = []

	static on(key:string, callback:any): any {
		this.subscribers.push({
			key:key,
			callback:callback
		})

		return () => {
			const i = this.subscribers.findIndex((item:any)=>{
				return item.key === key && item.callback === callback
			})
			if (i>=0) {
				this.subscribers.splice(i, 1)
			}
		}
	}

	static send(key:string, params:any) {
		this.subscribers.forEach((item:any) => {
			if (new RegExp(item.key, "i").test(key)) {
				//if (item.key == key) {
				item.callback(key, params)
			}
		})
	}

}