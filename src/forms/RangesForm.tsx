//import React from 'react'
//import Form from "react-jsonschema-form"
//import { JSONSchema6 } from "json-schema"
import BaseForm from "./BaseForm"
//import * as Utils from "../services/Utils"
import MediaRangeField from "../fields/MediaRangeField"
import Repository from "../services/Repository"
import Events from "../services/Events"

MediaRangeField.register()

export default class RangesForm extends BaseForm {

	static className:string = "RangesForm"

	unsubscribeInputsFormChanged:any

	static isAnyValidInput() {
		return (Repository.getNode(Repository.keys.inputs)||[]).find((item:any) => {
			return item.id && item.url
		})
	}

	constructor(props:any) {
		super(props, {
			parentNode: Repository.getRoot(),
			key: Repository.keys.ranges,
			defaultFormData: [
				{}
			]
		})		
	}

	getSchema() {
		return {
			title: "Select the ranges you'll work with",
			type: "array",
			items: {
				type: "object"
			}
		}
	}
	
	getUiSchema() {
		return {
			items: {
				"ui:field": "MediaRangeField"
			},
			"ui:options": {
				summary: "ctx.item.id"
			}
		}
	}
	
	componentDidMount() {
		super.componentDidMount()

		// re-load everything on input changes, to update media objects
		this.unsubscribeInputsFormChanged = Events.on("inputsform-changed", (params:any) => {
			this.reRender()
		})
	}

	componentWillUnmount() {
		this.unsubscribeInputsFormChanged()
	}

}