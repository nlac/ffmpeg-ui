//import * as Utils from '../services/Utils'

export default class FieldHelper {
	
	protected static fields: any = {}

	static registerField(fieldClass: any, fieldClassName?:string) {
		this.fields[fieldClassName || fieldClass.className] = fieldClass
	}

	static getFields() {
		return this.fields
	}

}