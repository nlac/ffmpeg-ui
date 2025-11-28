//import React from 'react'
//import * as Utils from "../services/Utils"
import Repository from "../services/Repository"
import Mapping, { MediaType } from "./Mapping"

let _instance: InputStream

/**
 * Input stream for a filter chain
 */
export default class InputStream {
	id: string = ""
	mapping?: Mapping

	static instance():InputStream {
		if (!_instance) {
			_instance = new InputStream()
		}
		return _instance
	}

	getDefault() {
		return {
			"id": "",
			"mapping": {
			  "type": "v"
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
				mapping: Mapping.instance().getSchema(),
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
				"ui:placeholder": "id",
				"ui:field": "StreamInputSelectorField",
				"ui:disabled": false
			},
			mapping: Mapping.instance().getUiSchema(),
			$isClosed: {
				classNames:"hidden"
			},
			"ui:options": {
				formRoot: Repository.keys.filterChains,
				formRules: [
					{
						desc: "disables inputstream properties for source streams",
						if: "!data.id || formContext.Repository.isInput(data.id) < 0",
						then: "uiSchema.mapping.type['ui:disabled'] = uiSchema.mapping.index['ui:disabled'] = true",
						//else: "uiSchema.id['ui:disabled'] = uiSchema.mapping.type['ui:disabled'] = uiSchema.mapping.index['ui:disabled'] = false",
						active: true
					}
				]
			}
		}
	}

	static toCommand(streams: InputStream[]) {
		let cmd:string = ""
		if (streams) {
			for(let i=0; i<streams.length; i++) {
				let idx = Repository.isInput(streams[i].id)
				if (idx >= 0) {
					let m = streams[i].mapping as Mapping
					cmd += Repository.toStreamSpecifier( idx, m.type as MediaType, m.index )
				} else {
					cmd += "[" + streams[i].id + "]"
				}				
			}
		}
		return cmd
	}

}
