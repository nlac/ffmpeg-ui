import React from 'react'
//import { JSONSchema6 } from "json-schema"
import BaseForm from "./BaseForm"
import * as Utils from "../services/Utils"
import StreamInputSelectorField from "../fields/StreamInputSelectorField"
import Events from "../services/Events"
import Repository, {Range} from '../services/Repository'
import FilterChain from "../models/FilterChain"
import Tooltip from '../services/Tooltip'

//import * as ObjectFieldTemplates from '../templates/ObjectFieldTemplates'

export default class FilterChainsForm extends BaseForm {

	static className:string = "FilterChainsForm"

	unsubscribeRangesFormChanged:any
	
	constructor(props:any) {
		super(props, {
			parentNode: Repository.getRoot(),
			key: Repository.keys.filterChains,
			defaultFormData: [
				//FilterChain.instance().getDefault()
			]
		})

		StreamInputSelectorField.register()
	}

	componentDidMount() {
		super.componentDidMount()

		// re-load everything on input changes, to update media objects
		this.unsubscribeRangesFormChanged = Events.on("rangesform-changed", (params:any) => {
			
			// on range change, update auto range trims
			if (this.getFormData()) {
				this.getFormData().forEach((item:FilterChain) => {
					if (item.rangeUid) {
						let range = Repository.getRangesRoot().find((range: Range) => range.uid === item.rangeUid) as Range
						if (range) {
							item.filters.forEach((filter:any) => {
								if (filter.trim) {
									filter.trim.start = range.start
									filter.trim.end = range.end
								}
							})
						}
					}
				})
			}
			
			this.reRender()
		})
	}

	componentWillUnmount() {
		this.unsubscribeRangesFormChanged()
	}


	getSchema() {
		return this.schema || (this.schema = {
			type: "array",
			title: "Your transformations here in 'inputs-filters-outputs' format",
			items: FilterChain.instance().getSchema()
		})
	}

	getUiSchema() {
		return this.uiSchema || (this.uiSchema = {
			//classNames: "no-title",
			items: Utils.merge({arrayMerger: "append"}, {}, FilterChain.instance().getUiSchema(), {
				"ui:options": {
					formRoot: Repository.keys.filterChains,
					formRules: [
						{
							desc: "disabling deleting source streams",
							if: "data.rangeUid",
							then: "uiSchema['ui:options'].removable = false",
							active: false
						}
					]
				}
			}),
			"ui:options": {
				summary: "ctx.item.outputStreams && ctx.item.outputStreams.join(',')"
			}
		})
	}

	isPrependEnabled() {
		return Repository.getRangesRoot() && Repository.getRangesRoot().some(r => !!r.sourceUid)
	}

	onPrepend(bAudio:boolean) {
		Repository.prependSourceFilters(bAudio)
		this.onChange({
			formData: this.getFormData()
		})
		this.reRender()
	}

	render() {
		return (
			this.present && 
			<div>
				{super.render()}
				<div className="container row text-right">
					<Tooltip content="Automatically adds ranges of video streams" placement="top">
						<button disabled={!this.isPrependEnabled()} className="btn btn-success op-button" onClick={() => this.onPrepend(false)}>Prepend video trims</button>
					</Tooltip>
					&nbsp;
					<Tooltip content="Automatically adds ranges of audio streams" placement="top">
						<button disabled={!this.isPrependEnabled()} className="btn btn-success op-button" onClick={() => this.onPrepend(true)}>Prepend audio trims</button>
					</Tooltip>
				</div>
			</div>
		)
	}

/*
	getRules():any {
		return [
			{
				condition: 'jp.nodes(formData, "$[?(@.rangeUid)].inputStreams")',
				action: ''
			}

		]
	}
*/
}