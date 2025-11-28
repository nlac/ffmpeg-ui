import BaseFFMpegModel from "../BaseFFMpegModel"

export default class LibMp3Lame extends BaseFFMpegModel {
	
	name = "libmp3lame"
	isAudio = true

	getSchema() {
		return {
			properties: {
				$mode: {
					title: "mode",
					type: "string",
					enum: ["vbr", "cbr", "abr"],
					default: "vbr"
				},
				"q:a": {
					type: "number",
					enum: ["",0,1,2,3,4,5,6,7,8,9],
					default: 1
				},
				"b:a": {
					type: "string",
					enum: ["", "8k", "16k", "24k", "32k", "40k", "48k", "64k", "80k", "96k", "112k", "128k", "160k", "192k", "224k", "256k", "320k"],
					default: "192k"
				},
				"abr": {
					type: "number",
					enum: ["", 1],
					default: ""
				}
			}
		}
	}

	getUiSchema() {
		return {
			abr: {
				classNames: "hidden"
				//"ui:widget": "hidden"
			},
			"ui:options": {
				formRules: [
					{
						desc: "enable vbr options",
						if: "data.$mode == 'vbr'",
						then: "uiSchema['b:a']= {classNames: 'hidden'}; data['b:a'] = undefined; data['q:a'] = schema.properties['q:a'].default; data.abr = undefined",
						active: true
					},
					{
						desc: "enable cbr options",
						if: "data.$mode == 'cbr'",
						then: "uiSchema['q:a'] = {classNames: 'hidden'}; data['q:a'] = undefined; data['b:a'] = schema.properties['b:a'].default; data.abr = undefined",
						active: true
					},
					{
						desc: "enable abr options",
						if: "data.$mode == 'abr'",
						then: "uiSchema['q:a'] = {classNames: 'hidden'}; data['q:a'] = undefined; data['b:a'] = schema.properties['b:a'].default; data.abr = 1",
						active: true
					}
				]
			}
		}
	}
}
