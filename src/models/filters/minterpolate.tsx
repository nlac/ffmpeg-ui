import BaseFFMpegModel from "../BaseFFMpegModel"

/**
 * https://ffmpeg.org/ffmpeg-filters.html#minterpolate
 */
export default class MinterpolateFilter extends BaseFFMpegModel {
	
	name = "minterpolate"

	getSchema() {
		return {
			properties: {
				fps: {
					type: "number",
					default: 30
				},
				mi_mode: {
					type: "string",
					enum: ["dup", "blend", "mci"],
					default: "mci"
				},
					mc_mode: {
						type: "string",
						enum: ["obmc","aobmc"],
						default: "obmc"
					},
					me_mode: {
						type: "string",
						enum: ["bidir", "bilat"],
						default: "bilat"
					},
					me: {
						type: "string",
						enum: ["esa","tts","tdls","ntss","fss","ds","hexbs","epzs","umh"],
						default: "epzs"
					},
					mb_size: {
						type: "number",
						default: 16
					},
					search_param: {
						type: "number",
						default: 32
					},
					vsbmc: {
						type: "number",
						default: 0
					},
				scd: {
					type: "string",
					enum: ["none", "fdiff"],
					default: "fdiff"
				},
				scd_threshold: {
					type: "number",
					default: 5
				}
			}
		}
	}

	getUiSchema() {
		return {
			mc_mode: {},
			"ui:options": {
				formRules: [
					{
						desc: "disabling non-mci props",
						if: "data.mi_mode != 'mci'",
						then: "uiSchema.mc_mode = {'ui:disabled':true}; uiSchema.me_mode = {'ui:disabled':true}; uiSchema.me = {'ui:disabled':true}; uiSchema.mb_size = {'ui:disabled':true}; uiSchema.search_param = {'ui:disabled':true}; uiSchema.vsbmc = {'ui:disabled':true}",
						active: true
					},
					{
						desc: "disabling scd_threshold",
						if: "data.scd != 'fdiff'",
						then: "uiSchema.scd_threshold = {'ui:disabled':true}",
						active: true
					}
				]
			}
		}
	}
}
