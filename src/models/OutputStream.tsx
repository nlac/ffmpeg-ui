
import * as Utils from "../services/Utils"
import Repository from "../services/Repository"
import Mapping, { MediaType } from "./Mapping"

let _instance: OutputStream

/**
 * Input stream for a filter chain
 */
export default class OutputStream {
	id: string = ""
	mapping?: Mapping

	static instance():OutputStream {
		if (!_instance) {
			_instance = new OutputStream()
		}
		return _instance
	}

	getDefault() {
		return {
			"id": "",
			"mapping": {
			  "type": "v",
			  "index": 0
			}
		}
	}

	getSchema() {
		return {
			type: "object",
			properties: {
				id: {
					type: "string",
					default: ""
				},
				mapping: Utils.merge({}, Mapping.instance().getSchema(), {
					title: "Output mapping"
				}),
				$isClosed: {
					type: "boolean"
				}
			}
		}
	}

	getUiSchema() {
		return {
			id: {
				classNames: "no-title",
				"ui:placeholder": "Select an output stream...",
				"ui:field": "StreamInputSelectorField"
			},
			mapping: Mapping.instance().getUiSchema(),
			$isClosed: {
				classNames:"hidden"
			},
			"ui:options": {
				formRoot: Repository.keys.filterChains,
				formRules: [
					{
						desc: "disables outputstream properties for source streams",
						if: "!data.id || formContext.Repository.isInput(data.id) < 0",
						then: "uiSchema.mapping.type['ui:disabled'] = uiSchema.mapping.index['ui:disabled'] = true",
						active: true
					}
				]
			}
		}
	}

	static toCommand(streams: OutputStream[]) {
		let cmd:string = ""
		if (streams) {
			for(let i=0; i<streams.length; i++) {
				let idx = Repository.isInput(streams[i].id)
				if (idx >= 0) {
					let m = (streams[i].mapping || {}) as Mapping
					cmd += " -map " + Repository.toStreamSpecifier( idx, m.type as MediaType, m.index )
				} else if (streams[i].id) {
					cmd += " -map [" + streams[i].id + "]"
				}				
			}
		}
		return cmd
	}

}