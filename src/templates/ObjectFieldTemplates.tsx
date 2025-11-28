import React from 'react'
import {Tabs, Tab} from 'react-bootstrap'
import * as Utils from '../services/Utils'

//https://react-jsonschema-form.readthedocs.io/en/latest/advanced-customization/#object-field-template

const stringify = (obj:any) => {
	return (
		<div>{JSON.stringify(obj)}</div>
	)
}
const stringifyKeys = (obj:any) => {
	return (
		<div>{JSON.stringify(Object.keys(obj))}</div>
	)
}

const isHidden = (prop) => {
	return prop.content.props.uiSchema && prop.content.props.uiSchema["ui:hidden"]
}

function TabTemplate(info:any) {
	return (
		<div>
			{info.title && <legend>{info.title}</legend>}
			<Tabs className="tabs-container" id={"tabs-" + Utils.generateUid()}>
				{info.properties.map((prop:any) => (
					!isHidden(prop) && <Tab eventKey={prop.content.key} title={prop.content.props.schema.title || prop.content.key} key={prop.content.key}>
						{prop.content}
					</Tab>
			))}
			</Tabs>
			{info.description}
		</div>
	)
}

export {
	TabTemplate
}