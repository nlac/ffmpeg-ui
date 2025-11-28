import BaseForm from "./BaseForm"
import * as Utils from "../services/Utils"
import Events from "../services/Events"
import Repository from '../services/Repository'
import OutputStream from "../models/OutputStream"
import StreamInputSelectorField from "../fields/StreamInputSelectorField"

export default class OutputMappingForm extends BaseForm {

	static className:string = "OutputMappingForm"

	unsubscribeBaseSourcesPrepended:any

	constructor(props:any) {
		super(props, {
			parentNode: Repository.getRoot(),
			key: Repository.keys.outputMapping,
			defaultFormData: [
				{}
			]
		})
		
		StreamInputSelectorField.register()
	}
	
	componentDidMount() {
		super.componentDidMount()
		
		this.unsubscribeBaseSourcesPrepended = Events.on("basesources-prepended|filterchainsform-changed", () => {
			this.onChange({
				formData: this.getFormData()
				//schema: this.getSchema()
				//uiSchema: this.getUiSchema()
			})
			setTimeout(() => {
				this.reRender()
			}, 200)
		})
	}

	componentWillUnmount() {
		if (this.unsubscribeBaseSourcesPrepended) {
			this.unsubscribeBaseSourcesPrepended()
		}
	}

	getSchema() {
		return {
			type: "array",
			title: "Select your output streams the final output will be assembled of",
			items: OutputStream.instance().getSchema()
		}
	}

	getUiSchema() {
		return {
			items: Utils.merge({}, {
				classNames: "no-title"
			}, OutputStream.instance().getUiSchema())
		}
	}
}