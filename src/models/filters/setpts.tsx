import BaseFFMpegModel from "../BaseFFMpegModel"

export default class SetPtsFilter extends BaseFFMpegModel {
	
	name = "setpts"

	getSchema() {
		return {
			properties: {
				singleValue: {
					title: "value",
					type: "string"
				}
			}
		}
	}

	getUiSchema() {
		return {
			singleValue: {
				"ui:placeholder": "eg. 15*PTS"
			}
		
		}
	}
}
