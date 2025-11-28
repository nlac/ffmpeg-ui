//import * as Utils from "../services/Utils"
import Repository from "../services/Repository"
import FilterChain from "./FilterChain"

export default abstract class BaseFFMpegModel {

	abstract name:string

	abstract getSchema()
	
	abstract getUiSchema()

	getChainRules():any {
		return []
	}

	finalSchema:any 
	finalUiSchema:any

	keyProp() {
		return this.name
	}

	getFinalSchema() {
		if (this.finalSchema) {
			return this.finalSchema
		}
		
		const keyProp = this.keyProp()
		const props = {}
		props[keyProp] = this.getSchema()
		props[keyProp].type = "object"
		props[keyProp].properties.$isActive = {
			type: "boolean",
			default: true,
			title: "active (here you can turn on-off the filter)"
		}
		//props[keyProp].properties.$isClosed = {
		//	type: "boolean"
		//}

		this.finalSchema = {
			type: "object",
			title: keyProp,
			//required: [
			//	keyProp
			//],
			properties: props
		}

		console.info("this.finalSchema for " + this.name + ":", this.finalSchema)

		return this.finalSchema
	}
	
	getFinalUiSchema() {
		if (this.finalUiSchema) {
			return this.finalUiSchema
		}
		const keyProp = this.keyProp()
		this.finalUiSchema = {}
		this.finalUiSchema[keyProp] = this.getUiSchema()
		this.finalUiSchema[keyProp].classNames = "no-title"
		//this.finalUiSchema[keyProp].$isClosed = {
		//	classNames: "hidden"
		//}
		
		console.info("this.finalUiSchema for " + this.name + ":", this.finalUiSchema)

		return this.finalUiSchema
	}

	static registerFilter() {
		// TODO: check to register only once
		const instance = new (this as any)()
		
		Repository.putFilter({
			name: instance.name,
			schema: instance.getFinalSchema(),
			uiSchema: instance.getFinalUiSchema()
		})

		FilterChain.instance().chainRules = FilterChain.instance().chainRules.concat( instance.getChainRules() )
	}
	
	static registerEncoder() {
		const instance = new (this as any)()
		
		Repository.putEncoder({
			name: instance.name,
			schema: instance.getFinalSchema(),
			uiSchema: instance.getFinalUiSchema(),
			isAudio: instance.isAudio
		})
	}
}