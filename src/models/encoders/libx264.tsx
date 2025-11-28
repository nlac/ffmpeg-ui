import BaseFFMpegModel from "../BaseFFMpegModel"

export default class Libx264Encoder extends BaseFFMpegModel {
	
	name = "libx264"
	isAudio = false

	getSchema() {
		return {
			properties: {
				crf: {
					type: "number",
					default: 23
				},
				preset: {
					type: "string",
					enum: ["veryslow","slower","slow","medium","fast","faster","veryfast","superfast","ultrafast"],
					default: "medium"
				},
				tune: {
					type: "string",
					enum: ["film","animation","grain","stillimage","fastdecode","zerolatency"]
				}
			}
		}
	}

	getUiSchema() {
		return {
		}
	}
}
