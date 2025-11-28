import React from "react"
import * as Utils from '../services/Utils'
import {BaseField} from './BaseField'
//import Select from 'react-select'
//import Events from "../services/Events"
import CreatableSelect from 'react-select/creatable'
import Repository from "../services/Repository"
//import BaseForm from "../forms/BaseForm"
import FilterChain from "../models/FilterChain"

export default class StreamInputSelectorField extends BaseField {

	static className:string = "StreamInputSelectorField"

	constructor(props: any) {
		super(props)
	}
	
	valueToState(state: any) {
		state.fieldData = this.props.formData||""
	}
	
	getOptions = () => {
		let opts:any[] = Repository.getInputsRoot().map(input => {
			return {
				value: input.id,
				label: input.id
			}
		})

		/*
		Repository.getInputsRoot().forEach((input,i) => {
			if (Utils.isVideo(input.path)) {
				opts.push({
					value: Repository.toStreamSpecifier(i, "v"),
					label: Repository.toStreamSpecifier(i, "v") + " (" + input.id + ")"
				})
				opts.push({
					value: Repository.toStreamSpecifier(i, "a"),
					label: Repository.toStreamSpecifier(i, "a") + " (" + input.id + ")"
				})
			} else if (Utils.isAudio(input.path)) {
				opts.push({
					value: Repository.toStreamSpecifier(i, "a"),
					label: Repository.toStreamSpecifier(i, "a") + " (" + input.id + ")"
				})
			}
		})
		*/

		Repository.getFilterChainsRoot().forEach((fc:FilterChain) => {
			if (fc && fc.outputStreams && fc.outputStreams.length) {
				opts = opts.concat(fc.outputStreams.map(os => {
					return {
						value: os,
						label: os
					}
				}))
			}
		})
		
		return opts
	}

	onSelectChange = (opt:any) => {

		this.setState({
			fieldData: opt.value
		}, () => {
			this.onChange()
		})
	}
		
	getNewOptionData = (inputValue:string, optionLabel:any) => {
		return {
			value: ""+(inputValue||""),
			label: ""+(inputValue||"")
		}
	}

	getValue = () => {
		return this.getOptions().find(opt => opt.value == this.state.fieldData)		
	}

	componentDidMount() {
		
	}

	render() {
		return (
			<div className="custom-field custom-field-filter">

				<CreatableSelect
					placeholder={this.props.uiSchema["ui:placeholder"]||'Select a stream...'}
					options={this.getOptions()}
					getOptionLabel={opt => opt.label}
					getOptionValue={opt => opt.value}
					value={this.getValue()}
					getNewOptionData={this.getNewOptionData}
					onChange={this.onSelectChange}
					isDisabled={!!this.props.uiSchema["ui:disabled"]}
				></CreatableSelect>
			
			</div>
		)
	}
}