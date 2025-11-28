//import React from 'react'
//import * as Utils from "../services/Utils"
import Repository from '../services/Repository'
import Libx264Encoder from "./encoders/libx264"
import LibMp3Lame from "./encoders/libmp3lame"

let _instance: Encoder
const vSchema:any = new Libx264Encoder().getSchema().properties

export default class Encoder {
	
	name:string = ""
	videoSchema:any
	videoUiSchema:any
	audioSchema:any
	audioUiSchema:any

	static instance():Encoder {
		if (!_instance) {
			_instance = new Encoder()
		}
		return _instance
	}

	constructor() {
		// Register all encoders here
		Libx264Encoder.registerEncoder()
		LibMp3Lame.registerEncoder()
	}

	getDefault() {
		return {
			video: [{
				libx264: {
					crf: vSchema.crf.default,
					preset: vSchema.preset.default
				}
			}],
			audio: [{
				none: {}
			}],
			fps: "30"
		}
	}

	getVideoSchema() {
		if (this.videoSchema) {
			return this.videoSchema
		}

		const schema = {
			type: "object",
			title: "Video",
			oneOf: Repository.getEncoders().filter(enc => !enc.isAudio).map(info => info.schema)
		}

		schema.oneOf.push({
			type: "object",
			title: "copy",
			required: ["copy"],
			properties: {
				copy: {
					type: "object"
				}
			}
		})
		schema.oneOf.push({
			type: "object",
			title: "none",
			required: ["none"],
			properties: {
				none: {
					type: "object"
				}
			}
		})

		console.info("merged video encoder schema:", schema)

		return this.videoSchema = schema
	}
	
	getAudioSchema() {
		if (this.audioSchema) {
			return this.audioSchema
		}

		const schema = {
			type: "object",
			title: "Audio",
			oneOf: Repository.getEncoders().filter(enc => !!enc.isAudio).map(info => info.schema),
			default: {}
		}
		
		schema.oneOf.push({
			type: "object",
			title: "copy",
			required: ["copy"],
			properties: {
				copy: {
					type: "object"
				}
			}
		})
		schema.oneOf.push({
			type: "object",
			title: "none",
			required: ["none"],
			properties: {
				none: {
					type: "object"
				}
			}
		})

		console.info("merged audio encoder schema:", schema)

		return this.audioSchema = schema
	}

	getVideoUiSchema() {
		if (this.videoUiSchema) {
			return this.videoUiSchema
		}

		// need to build a common uiSchema...
		const uiSchema = {
			classNames: "no-title",
			name: {
				classNames:"hidden"
			},
			copy: {
				classNames:"no-title"
			},
			none: {
				classNames:"no-title"
			},
			"ui:options": {
				removable: false,
				orderable: false,
				formRoot: Repository.keys.encoding,
				formRules: [
				]
			}
		}

		// merge all 1st-level props
		Repository.getEncoders().filter(enc => !enc.isAudio).forEach(info => {

			for(let key in info.uiSchema) {
				if (key !== "ui:options") {
					uiSchema[key] = info.uiSchema[key]
					uiSchema[key].$isActive = {
						classNames: "hidden"
					}	
				}
			}

			const uiOpt = info.uiSchema["ui:options"]
			if (uiOpt && uiOpt.formRules) {
				uiSchema["ui:options"].formRules = uiSchema["ui:options"].formRules.concat(uiOpt.formRules)
			}
		})


		console.info("merged video encoder uiSchema:", uiSchema)
		
		return this.videoUiSchema = uiSchema
	}

	getAudioUiSchema() {
		if (this.audioUiSchema) {
			return this.audioUiSchema
		}

		// need to build a common uiSchema...
		const uiSchema = {
			classNames: "no-title",
			name: {
				classNames:"hidden"
			},
			copy: {
				classNames:"no-title"
			},
			none: {
				classNames:"no-title"
			},
			"ui:options": {
				removable: false,
				orderable: false,
				formRoot: Repository.keys.encoding,
				formRules: [
				]
			}
		}

		// merge all 1st-level props
		Repository.getEncoders().filter(enc => !!enc.isAudio).forEach(info => {

			//console.info("cached filter:", info)

			for(let key in info.uiSchema) {
				if (key !== "ui:options") {
					uiSchema[key] = info.uiSchema[key]
				}
				uiSchema[key].$isActive = {
					classNames: "hidden"
				}	
			}
			
			const uiOpt = info.uiSchema["ui:options"]
			if (uiOpt && uiOpt.formRules) {
				uiSchema["ui:options"].formRules = uiSchema["ui:options"].formRules.concat(uiOpt.formRules)
			}
		})


		console.info("merged audio encoder uiSchema:", uiSchema)
		
		return this.audioUiSchema = uiSchema
	}


	static toCommand(enc: any) {
		const v = enc && enc.video && enc.video[0]
		const a = enc && enc.audio && enc.audio[0]
		const fps = enc && enc.fps

		let cmd = ""
		
		if (v) {
			if (v.none) {
				cmd += " -vn"
			} if (v.copy) {
				cmd += " -c:v copy"
			} else {
				const name = Object.keys(v)[0]
				cmd += " -c:v " + name
				for(let i in v[name]) {
					if (!i.match(/^\$/) && v[name][i] !== undefined) {
						cmd += (" -" + i + " " + v[name][i])
					}
				}
			}
		}
		
		if (a) {
			if (a.none) {
				cmd += " -an"
			} if (a.copy) {
				cmd += " -c:a copy"
			} else {
				const name = Object.keys(a)[0]
				cmd += " -c:a " + name
				for(let i in a[name]) {
					if (!i.match(/^\$/) && a[name][i] !== undefined) {
						cmd += (" -" + i + " " + a[name][i])
					}
				}
			}
		}

		if (fps) {
			cmd += " -r " + fps + " "
		}

		return cmd + ""
	}

}
