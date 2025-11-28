//import React from 'react'
//import * as Utils from "../services/Utils"
import Repository from '../services/Repository'

import ATrimFilter from "./filters/atrim"
import ConcatFilter from "./filters/concat"
import FadeFilter from "./filters/fade"
import MinterpolateFilter from "./filters/minterpolate"
import ScaleFilter from "./filters/scale"
import SetPtsFilter from "./filters/setpts"
import TrimFilter from "./filters/trim"


let _instance: Filter

export default class Filter {
	
	name:string = ""
	schema:any
	uiSchema:any

	static instance():Filter {
		if (!_instance) {
			_instance = new Filter()
		}
		return _instance
	}

	constructor() {
		// Register all filters here
		ATrimFilter.registerFilter()
		ConcatFilter.registerFilter()
		FadeFilter.registerFilter()
		MinterpolateFilter.registerFilter()
		ScaleFilter.registerFilter()
		SetPtsFilter.registerFilter()
		TrimFilter.registerFilter()
	}

	getDefault() {
		return {}
	}

	getSchema() {
		if (this.schema) {
			return this.schema
		}
		// simply put individual schemas into the anyOf array
		const schema = {
			type: "object",
			/*properties: {
				$isClosed: {
					type: "boolean"
				}
			},*/
			anyOf: Repository.getFilters().map(info => info.schema)
		}

		//console.info("merged filter schema:", schema)

		return this.schema = schema
	}

	getUiSchema() {
		if (this.uiSchema) {
			return this.uiSchema
		}

		// need to build a common uiSchema...
		const uiSchema = {
			classNames: "no-title",
			name: {
				classNames:"hidden"
			},
			"ui:options": {
				formRoot: Repository.keys.filterChains,
				formRules: [
					{
						desc: "disable editing filters completely for range trims ",
						context: "formContext.parent(ctx, 2)",
						if: "formContext.parent(ctx, 2).rangeUid",
						then: "uiSchema['ui:disabled'] = true",
						active: false
					}	
				]
			}
		}

		// merge all 1st-level props
		Repository.getFilters().forEach(info => {
			for(let key in info.uiSchema) {
				if (key !== "ui:options") {
					uiSchema[key] = info.uiSchema[key]
				}
			}
			const uiOpt = info.uiSchema["ui:options"]
			if (uiOpt && uiOpt.formRules) {
				uiSchema["ui:options"].formRules = uiSchema["ui:options"].formRules.concat(uiOpt.formRules)
			}
		})


		console.info("merged uiSchema:", uiSchema)
		
		return this.uiSchema = uiSchema
	}

	static toCommand(filters:any[]) {
		let cmd = ""
		if (filters) {
			for(let i=0; i<filters.length; i++) {
				let filter = filters[i], keyProp = Object.keys(filter)[0], props = filter[keyProp]
				if (!props.$isActive) {
					continue
				}

				cmd += (keyProp + "=")
				if (props.singleValue !== undefined) {
					cmd += props.singleValue
				} else {
					for(let key in props) {
						if (key === "$isActive") {
							continue
						}
						const val = props[key]
						if (key && val !== undefined && val !== "") {
							cmd += (key + "=" + val + ":")
						}
					}
					cmd = cmd.replace(/:$/, "")
				}
				cmd += ","
			}
		}
		return cmd.replace(/,$/, "")
	}

}
