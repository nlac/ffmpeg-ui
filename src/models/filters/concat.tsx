import BaseFFMpegModel from "../BaseFFMpegModel"

export default class ConcatFilter extends BaseFFMpegModel {
	
	name = "concat"

	getSchema() {
		return {
			title: this.name,
			properties: {
				n: {
					title: "n of segments",
					type: "number",
					default: 2
				},
				v: {
					title: "n of output video streams (== n of video streams in each segments)",
					type: "number",
					default: 1
				},
				a: {
					title: "n of output audio streams (== n of audio streams in each segments)",
					type: "number",
					default: 0
				}
			}
		}
	}

	getUiSchema() {
		return {
			"ui:options": {
				formRules: [
				]
			}
		}
	}

	getChainRules() {
		return [
			{
				desc: "setting n to the nuber of input streams",
				if: "data && data.filters && data.filters.some(f => !!f.concat)",
				then: "data.filters.forEach(f => {if (f.concat) { if (f.concat.n != data.inputStreams.length) { f.concat.n = data.inputStreams.length}}})",
				active: true
			}
		]
	}
}
