import React from 'react'
import * as Utils from "../services/Utils"
import { utils } from 'react-bootstrap'
import Repository from '../services/Repository';

//https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#array-field-template

function Down(props:any) {
	return (
		<button
			disabled={props.disabled || !props.el.hasMoveDown}
			className="btn btn-default btn-sm"
			onClick={props.el.onReorderClick(props.el.index,props.el.index + 1)}>
			<i className="glyphicon glyphicon-arrow-down"></i>
		</button>
	)
}

const Up = (props:any) => {
	return (
		<button 
			disabled={props.disabled || !props.el.hasMoveUp}
			className="btn btn-default btn-sm"
			onClick={props.el.onReorderClick(props.el.index,props.el.index - 1)}>
			<i className="glyphicon glyphicon-arrow-up"></i>
		</button>
	)
}

function Close(props:any) {
	return (
		<button 
			className="btn btn-default btn-sm"
			onClick={props.toggle}>
				<i className={props.getClosed() ? "glyphicon glyphicon-zoom-in" : "glyphicon glyphicon-zoom-out"}></i>
		</button>
	)
}

const Del = (props:any) => {
	return (
		<button 
			disabled={props.disabled}
			className="btn btn-danger btn-sm"
			onClick={props.el.onDropIndexClick(props.el.index)}>
			<i className="glyphicon glyphicon-remove"></i>
		</button>
	)
}

const Help = (props:any) => {
	return (
		<button 
			title="Click to open a new help tab"
			className="btn btn-default btn-sm"
			onClick={() => window.open(props.url)}>
			<i className="glyphicon glyphicon-question-sign"></i>
		</button>
	)
}

function ArrayItem({el, idx, arrayProps}:any) {
	
	// this is cloned!!! check BaseForms.tsx, class MyArrayItem
	const arrayItemProps = el.children.props
	const arrayItemUiOptions = arrayItemProps.uiSchema["ui:options"] || {}

	const [closed, setClosed] = React.useState(arrayProps.formData[idx] && arrayProps.formData[idx]["$isClosed"])

	const getClosed = () => {
		return closed //arrayProps.formData[idx].$isClosed
	}

	// looking for a rendered editor for "$isClosed"
	//const closerId:string = arrayProps.idSchema.$id + "_" + idx + "_$isClosed"

	const toggle = () => {
		//const el:any = document.querySelector("#" + closerId)
		//if (el) {
			//el.click()
		//}
		setClosed(!closed)
		
		if (typeof arrayProps.formData[idx] === "object") {
			arrayProps.formData[idx]["$isClosed"] = !closed
		}
	}

	const arrayUiOptions = arrayProps.uiSchema["ui:options"]

	const getSummary = () => {
		let summary = arrayUiOptions && arrayUiOptions.summary
		if (summary === undefined) {
			return "item" + idx
		}
		return summary && Utils.evaluate(summary, {
			item: arrayProps.formData[idx]
		})
	
	}

	const getRemovable = () => {
		return arrayItemUiOptions.removable !== false
	}
	
	const getOrderable = () => {
		return arrayItemUiOptions.orderable !== false
	}

	const hasHelpUrl = () => {
		return arrayUiOptions && arrayUiOptions.helpUrl
	}

	const getHelpUrl = () => {
		const help = arrayUiOptions && arrayUiOptions.helpUrl
		return help && Utils.evaluate(help, {
			item: arrayProps.formData[idx]
		})
	}

	return (
		<div key={el.key} className={el.className}>
			<div className="array-item-children">
				<div className={getClosed() ? "hidden" : ""}>
					{el.children}
				</div>
				<div className={getClosed() ? "array-item-summary" : "hidden"}>
					<a onClick={e => toggle()}>{getSummary()}</a>
				</div>
			</div>
			<div className="array-item-ops">
				<div className="btn-group">
					{hasHelpUrl() && <Help url={getHelpUrl()}></Help>}
					{<Up el={el} disabled={!getOrderable()}></Up>}
					{<Down el={el} disabled={!getOrderable()}></Down>}
					{<Close el={el} toggle={toggle} getClosed={getClosed}></Close>}
					{<Del el={el} disabled={!getRemovable()}></Del>}
				</div>
			</div>
		</div>
	)
}

function Closeable(props:any) {
	// console.info("Closeable called:  ", props.items[0] && props.items[0].children)
	// old cond for add: props.canAdd
	
	const arrayUiSchema = props.uiSchema
	const arraySchemaUiOptions = arrayUiSchema["ui:options"] || {}

	const isAddable = () => {
		return arraySchemaUiOptions.addable !== false
	}

	return (
		<fieldset className={"array-template-closeable " + props.className}>
			
			{props.title && <legend>{props.title}</legend>}
			
			{props.items && props.items.map((el:any, idx:number) => (
				<ArrayItem 
					key={el.key} 
					el={el} 
					idx={idx} 
					arrayProps={props} 
				>
				</ArrayItem>
			))}

			{isAddable() && (
				<div className="array-item-add">
					<button className="btn btn-primary" onClick={props.onAddClick} type="button">
						<i className="glyphicon glyphicon-plus"></i>
					</button>
				</div>
			)}
		</fieldset>
	)
}

export {
	Closeable
}
