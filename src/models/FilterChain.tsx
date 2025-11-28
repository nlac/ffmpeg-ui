import * as Utils from "../services/Utils"
import InputStream from "./InputStream"
import Filter from "./FilterModel"
import Repository from "../services/Repository"
import * as ObjectFieldTemplates from '../templates/ObjectFieldTemplates'

type OutputStream = string

let _instance: FilterChain

export default class FilterChain {
	inputStreams: InputStream[] = []
	filters:any[] = []
	outputStreams: OutputStream[] = [
		Utils.generateUid()
	]
	rangeUid: string = ""
	$isClosed:boolean = true

	chainRules: any[] = []

	static instance():FilterChain {
		if (!_instance) {
			_instance = new FilterChain()
		}
		return _instance
	}

	getDefault() {
		return {
			inputStreams: [InputStream.instance().getDefault()],
			filters: [],
			outputStreams: [Utils.generateUid()]
		}
	}

	getSchema() {
		return {
			type: "object",
			properties: {
				inputStreams: {
					title: "Input streams",
					type: "array",
					items: InputStream.instance().getSchema()
				},
				filters: {
					title: "Filters",
					type: "array",
					items: Filter.instance().getSchema()
				},
				outputStreams: {
					title: "Output streams",
					type: "array",
					items: {
						type: "string"
					}
				},
				rangeUid: {
					type: "string"
				},
				$isClosed: {
					type:"boolean"
				}
			},
			default: this.getDefault()
		}
	}
	
	getUiSchema() {

		const disableAddRule = (desc:string) => {
			return Utils.clone({
				desc: desc,
				context: "!!formContext.parent(ctx, 1)",
				if: "formContext.parent(ctx, 1).rangeUid",
				then: "uiSchema['ui:options'].addable = false",
				active: true
			})
		}
		
		const disableItemRemoveRule = (desc:string) => {
			return Utils.clone({
				desc: desc,
				context: "!!formContext.parent(ctx, 2)",
				if: "formContext.parent(ctx, 2).rangeUid",
				then: "uiSchema['ui:options'].removable = false",
				active: true
			})
		}
				
		return {
			classNames: "no-title",
			"ui:ObjectFieldTemplate": ObjectFieldTemplates.TabTemplate,
			inputStreams: {
				classNames: "no-title",
				// TODO: merge rules properly (concat arrays)
				items: Utils.merge({arrayMerger:"append"}, InputStream.instance().getUiSchema(), {
					"ui:options": {
						formRoot: Repository.keys.filterChains,
						formRules: [
							disableItemRemoveRule("disabling deleting input streams in range trims")
						]
					}	
				}),
				"ui:options": {
					summary: "ctx.item.id + '-' + (ctx.item.mapping.type===undefined?'':ctx.item.mapping.type) + (ctx.item.mapping.index===undefined ? '' : '-' + ctx.item.mapping.index)",
					formRoot: Repository.keys.filterChains,
					formRules: [
						disableAddRule("disabling adding more inputstreams to range trims")
					]
				}
			},
			filters: {
				classNames: "no-title",
				items: Utils.merge({arrayMerger:"append"}, Filter.instance().getUiSchema(), {
					"ui:options": {
						formRoot: Repository.keys.filterChains,
						formRules: [
							//disableItemRemoveRule("disabling deleting trim filter in range trims")
						]
					}
				}),
				"ui:options": {
					summary: "Object.keys(ctx.item)[0] + (ctx.item[Object.keys(ctx.item)[0]].$isActive ? ' ☑':'')",
					helpUrl: "'http://ffmpeg.org/ffmpeg-filters.html#' + Object.keys(ctx.item)[0]",
					formRoot: Repository.keys.filterChains,
					formRules: [
						//disableAddRule("disabling adding more filters to range trims")
					]
				}
			},
			outputStreams: {
				classNames: "no-title",
				items: {
					"ui:placeholder": "id",
					"ui:options": {
						formRoot: Repository.keys.filterChains,
						formRules: [
							disableItemRemoveRule("disabling deleting output stream in range trims")
						]
					}
				},
				"ui:options": {
					summary: "ctx.item",
					formRoot: Repository.keys.filterChains,
					formRules: [
						disableAddRule("disabling adding more output stream to range trims")
					]
				}
			},
			rangeUid: {
				"ui:hidden": true
			},
			$isClosed: {
				"ui:hidden": true
			},
			"ui:options": {
				formRoot: Repository.keys.filterChains,
				formRules: Utils.simpleClone(this.chainRules)
			}
		}
	}

	static toCommand(chain: FilterChain) {
		return InputStream.toCommand(chain.inputStreams) + Filter.toCommand(chain.filters) 
		+ "" + chain.outputStreams.map(stream => "[" + stream + "]")
	}
}
