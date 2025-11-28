import * as React from 'react'
import * as Utils from '../services/Utils'
//import Events from "../services/Events"
import FieldHelper from "../services/FieldHelper"

export interface IBaseField {
	//stateToValue(): any
	//valueToState(state:any): any
}

export abstract class BaseField extends React.Component<any, any> implements IBaseField {
	
	//static className:string = "BaseField"

	constructor(props:any) {
		super(props)
		
		//this.className = Utils.getClassName(this)
		this.state = {}
		this.valueToState(this.state)
	}

	onChange() {
		this.props.onChange(
			Utils.clone(this.stateToValue())
		)
		//Events.send("changed", {	
		//	field: this
		//})
	}

	/**
	 * Returns the actual JsonForms data node from the component state
	 */
	//abstract stateToValue(): any 
	//abstract valueToState(state:any): any

	static register() {
		FieldHelper.registerField(this)
	}
	
	valueToState(state: any) {
		state.fieldData = this.props.formData||{}
	}

	stateToValue():any {
		return this.state.fieldData
	}

}