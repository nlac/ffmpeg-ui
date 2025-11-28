import * as Utils from "../services/Utils"

let _instance: Persistence

const key = "ffmpegui"

export default class Persistence {

	root:any

	static instance():Persistence {
		if (!_instance) {
			_instance = new Persistence()
		}
		return _instance
	}

	private constructor() {
		this.load()
	}

	load() {
		let json = String(window.localStorage.getItem(key))
		if (!json || json === "undefined" || json === "null") {
			json = "{}"
		}
		this.root = Utils.evaluate(json)
		
		if (!this.root.projects) {
			this.root.projects = {}
		}
		
		return this.root
	}

	save() {
		window.localStorage.setItem(key, JSON.stringify(this.root))
	}

	get() {
		return this.root
	}





	getProjectNames() {
		return Object.keys(this.root.projects)
	}

	getProject(name:string) {
		return this.root.projects[name]
	}

	setProject(name:string, data:any) {
		this.root.projects[name] = data
		this.save()
	}

	deleteProject(name:string) {
		delete this.root.projects[name]
		this.save()
	}

	getSelectedProjectName() {
		return this.root.selectedProjectName
	}

	setSelectedProjectName(name:string) {
		this.root.selectedProjectName = name
		this.save()
	}

}