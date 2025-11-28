import BaseFFMpegModel from "../BaseFFMpegModel"

export default class ScaleFilter extends BaseFFMpegModel {
	
	name = "scale"

	getSchema() {
		return {
			title: this.name,
			properties: {
				w: {
					type: "string",
					default: "0.5*iw"
				},
				h: {
					type: "string",
					default: "0.5*ih"
				}
			}
		}
	}

	getUiSchema() {
		return {
			w: {
				"ui:placeholder": "eg: 2*iw"
			},
			h: {
				"ui:placeholder": "eg: 2*ih"
			}
		}
	}
}
