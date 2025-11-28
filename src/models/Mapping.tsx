
let _instance: Mapping

export type MediaType = "v"|"a"|0|1|2|3|4|5|6|7|8|9

export type StreamIndexType = 0|1|2|3|4|5|6|7|8|9

export default class Mapping {

	static instance():Mapping {
		if (!_instance) {
			_instance = new Mapping()
		}
		return _instance
	}

	type?: MediaType
	index?: StreamIndexType

	getSchema() {
		return {
			type: "object",
			properties: {
				type: {
					type: "string",
					enum: ["v", "a", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
					enumNames: ["video", "audio", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
				},
				index: {
					type: "number",
					enum: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
				}
			}
		}
	}

	getUiSchema() {
		return {
			classNames: "no-title",
			"ui:disabled": false,
			type: {
				classNames: "no-title",
				"ui:placeholder": "type"
			},
			index: {
				classNames: "no-title",
				"ui:placeholder": "index"
			}
		}
	}
}