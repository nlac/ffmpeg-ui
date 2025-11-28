//import { JSONSchema6 } from "json-schema"
import BaseForm from "./BaseForm"
//import * as Utils from "../services/Utils"
//import FilterChainField from "../fields/FilterChainField"
import EncoderModel from "../models/EncoderModel"
import Repository from '../services/Repository'
import * as ObjectFieldTemplates from '../templates/ObjectFieldTemplates'

export default class EncodingForm extends BaseForm {

	static className:string = "EncodingForm"

	constructor(props:any) {
		super(props, {
			parentNode: Repository.getRoot(),
			key: Repository.keys.encoding,
			defaultFormData: EncoderModel.instance().getDefault()
		})
	}

	getSchema() {
		return this.schema || (this.schema = {
			type: "object",
			title: "Set your video/audio encoder and fps",
			properties: {
				video: {
					type: "array",
					title: "Video",
					items: EncoderModel.instance().getVideoSchema()
				},
				audio: {
					type: "array",
					title: "Audio",
					items: EncoderModel.instance().getAudioSchema()
				},
				fps: {
					type: "number",
					title: "Fps",
					default: ""
				}
			}
		})
	}

	getUiSchema() {
		return this.uiSchema || (this.uiSchema = {
			//classNames: "no-title",
			"ui:ObjectFieldTemplate": ObjectFieldTemplates.TabTemplate,
			video: {
				classNames: "no-title no-ops",
				items: EncoderModel.instance().getVideoUiSchema(),
				"ui:options": {
					addable: false
				}
			},
			audio: {
				classNames: "no-title no-ops",
				items: EncoderModel.instance().getAudioUiSchema(),
				"ui:options": {
					addable: false
				}
			}
		})
	}
}