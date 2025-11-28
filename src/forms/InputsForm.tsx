import BaseForm from "./BaseForm"
//import * as Utils from "../services/Utils"
import FileUploadField from "../fields/FileUploadField"
import Repository from "../services/Repository"

FileUploadField.register()

export default class InputsForm extends BaseForm {
	
	static className:string = "InputsForm"

	static isAnyValidInput() {
		return (Repository.getNode(Repository.keys.inputs)||[]).find((item:any) => {
			return item.id && item.url
		})
	}

	constructor(props:any) {
		super(props, {
			parentNode: Repository.getRoot(),
			key: Repository.keys.inputs,
			defaultFormData: Repository.getInputsRoot() || [
				{}
			]
		})
	}

	getSchema() {
		return {
			title: "Select video/audio/image files you'll work with",
			type: "array",
			items: {
				type: "object"
			}
		}
	}
	
	getUiSchema() {
		return {
			items: {
				"ui:field": "FileUploadField"
			},
			"ui:options": {
				summary: "ctx.item.id"
			}
		}
	}

}