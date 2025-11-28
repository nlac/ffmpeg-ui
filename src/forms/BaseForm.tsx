import React from 'react'
import Form from "react-jsonschema-form"
import FieldHelper from "../services/FieldHelper"
import Repository from "../services/Repository"
import * as Utils from "../services/Utils"
import Events from "../services/Events"
import * as ArrayFieldTemplates from '../templates/ArrayFieldTemplates'
import RuledJsonSchemaForm from "../services/RuledJsonSchemaForm"
//import RuledJsonSchemaForm from "ruled-jsonschema-form"

export default abstract class BaseForm extends React.Component<any, any> {
	
	static className:string = ""

	present:boolean = true

	schema: any
	uiSchema:any

	defaultFormData:any

	/**
	 * Base constructor of a form
	 * 
	 * @param props may contain the followings: key, parentNode, defaultFormData
	 * @param extendedProps same as props
	 */
	constructor(props:any, extendedProps?:any) {
		super(props)
		extendedProps = extendedProps || {}

		const extProps = Utils.merge({}, {}, {
			parentNode: extendedProps.parentNode || props.parentNode || Repository.getRoot()
		}, props, extendedProps)

		if (extProps.key === undefined) {
			throw "no key for form " + this.constructor["className"]
		}
		if (!extProps.parentNode || (typeof extProps.parentNode !== "object")) {
			throw "no proper parentNode for form " + this.constructor["className"]
		}

		this.state = {
			parentNode: extProps.parentNode,
			key: extProps.key
		}

		if (extProps.defaultFormData !== undefined && !(extProps.key in extProps.parentNode)) {
			// filling initial formData
			this.defaultFormData = extProps.defaultFormData
		}
	}

	abstract getSchema():any
	abstract getUiSchema():any


	componentDidMount() {
		if (this.defaultFormData !== undefined) {
			setTimeout(() => {
				this.onChange({
					formData: this.defaultFormData
				})
			}, 200)
		}
	}

	getFormData() {
		return this.state.parentNode[this.state.key]
	}

	setFormData(data:any) {		
		return this.state.parentNode[this.state.key] = data
	}

	/**
	 * 
	 * @param state 
	 * @param extProps 
	 */
	initState(state: any, extProps: any) {
		Utils.merge({}, state, extProps||{})
	}

	getFields() {
		return FieldHelper.getFields()
	}

	reRender() {
		this.present = false
		this.forceUpdate(() => {
			//setTimeout(() => {
				this.present = true
				this.forceUpdate()	
			//}, 500)
		})
	}
	
	/**
	 * Called by the lib on form change
	 * @param params params.formData holds the form data
	 */
	onChange(params:any) {

		// ensure UIDs
		if (Array.isArray(params.formData)) {
			params.formData.forEach(d => {
				if (d && (typeof d === "object") && !d.uid) {
					d.uid = Utils.generateUid()
				}
			})
		}

		this.setState((state:any, props:any) => {
			this.setFormData(Utils.clone(params.formData))
		}, () => {

			Repository.computeCommand()

			this.forceUpdate()
			Events.send(this.constructor["className"].toLowerCase() + "-changed", {
				form: this
			})
		})
	}

	getFormContext() {
		return {
			rootKey: this.state.key,
			Repository: Repository,
			parent: ({idSchema, uiSchema}:any, back:number = 1) => {
				const formRoot = uiSchema["ui:options"].formRoot || "root"
				const path:string = idSchema.$id.replace(/^root_/, formRoot + "_")
				let keys:any[] = path.split("_")
				keys.length -= back
				return Repository.getByPath(keys)
			}
		}
	}

	render() {
		return (
			this.present && 
			<RuledJsonSchemaForm
				schema={this.getSchema()}
				uiSchema={this.getUiSchema()}
				formData={this.getFormData()}
				fields={this.getFields()}
				onChange={this.onChange.bind(this)}
				ArrayFieldTemplate={ArrayFieldTemplates.Closeable}
				formContext={this.getFormContext()}
				liveValidate={false}		
			></RuledJsonSchemaForm>
		)
	}
}
