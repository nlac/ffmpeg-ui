import BaseFFMpegModel from "../BaseFFMpegModel"

export default class FadeFilter extends BaseFFMpegModel {
	
	name = "fade"

	getSchema() {
		return {
			title: this.name,
			properties: {
				type: {
					type: "string",
					title: "fade-in or out",
					enum: ["in", "out"],
					default: "in"
				},
				start_time: {
					type: "number",
					default: 0
				},
				duration: {
					type: "number"
				},
				color: {
					type: "string"
				}
			}
		}
	}

	getUiSchema() {
		return {
		
		}
	}
}
