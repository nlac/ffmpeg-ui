import BaseFFMpegModel from "../BaseFFMpegModel"

export default class ATrimFilter extends BaseFFMpegModel {
	
	name = "atrim"

	getSchema() {
		return {
			title: this.name,
			properties: {
				start: {
					type: "number",
					default: 0
				},
				end: {
					type: "number"
				},
				duration: {
					type: "number"
				}
			}
		}
	}

	getUiSchema() {
		return {
			start: {
				title: "start timestamp"
			},
			end: {
				title: "end timestamp"
			},
			duration: {
				title: "duration from start"
			}
		}
	}
}
