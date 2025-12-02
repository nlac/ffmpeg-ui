import React from 'react'
import { Tabs, Tab, Modal, Button } from 'react-bootstrap'
import InputsForm from "../forms/InputsForm"
import RangesForm from "../forms/RangesForm"
import FilterChainsForm from "../forms/FilterChainsForm"
import EncodingForm from "../forms/EncodingForm"
import Events from "../services/Events"
import Repository from "../services/Repository"
import OutputMappingForm from '../forms/OutputMappingForm'
import copy from 'copy-to-clipboard'

export default class WorkFlow extends React.Component<any, any> {

	rawFormData: any

	toClipboard = (text: string) => {
		copy(text, {
			format: "text/plain"
		})
		this.setState({showComingSoon: true})		
	}

	hideModal = () => {
		this.setState({showComingSoon: false})
	}

	constructor(props: any) {
		super(props)
		this.state = {
			key: 1,
			showComingSoon: false
		}
	}

	handleSelect = (e: any) => {
		this.setState({ key: e }, () => {
			if (e == 7) {
				this.rawFormData = JSON.stringify(Repository.getNode(), null, 2)
				//console.info("this.rawFormData:", this.rawFormData)
				this.forceUpdate()
			}
		})
	}

	isFilterChainsDisabled() {
		return false //!InputsForm.isAnyValidInput()
	}

	getCommand() {
		return Repository.computeCommand()
	}

	render() {
		return (
			<div>
				<Modal show={this.state.showComingSoon} onHide={this.hideModal}>
					<Modal.Header closeButton>
						<Modal.Title>Copied to clipboard</Modal.Title>
					</Modal.Header>
				</Modal>
				<Tabs
					id="Workflow"
					defaultActiveKey={1}
					animation={false}
					activeKey={this.state.key}
					onSelect={this.handleSelect}
					bsStyle="tabs"
				>
					<Tab eventKey={1} title="Inputs ⯈">
						<div className="container keep-t">
							<InputsForm></InputsForm>
						</div>
					</Tab>
					<Tab eventKey={2} title="Ranges ⯈">
						<div className="container keep-t">
							<RangesForm></RangesForm>
						</div>
					</Tab>
					<Tab eventKey={3} title="Filters ⯈" disabled={this.isFilterChainsDisabled()}>
						<div className="container keep-t">
							<FilterChainsForm></FilterChainsForm>
						</div>
					</Tab>
					<Tab eventKey={4} title="Output mapping ⯈">
						<div className="container keep-t">
							<OutputMappingForm></OutputMappingForm>
						</div>
					</Tab>
					<Tab eventKey={5} title="Encoding ⯈">
						<div className="container keep-t">
							<EncodingForm></EncodingForm>
						</div>
					</Tab>
					<Tab eventKey={6} title="FFMpeg command">
						<div className="container keep-t">
							<button className="btn btn-primary" onClick={() => this.toClipboard(this.getCommand())}>Copy to clipboard</button>
							<pre className="keep-t">{this.getCommand()}</pre>
						</div>
					</Tab>
					<Tab eventKey={7} title="Raw form data">
						<div className="container keep-t">
							<pre className="keep-t">{this.rawFormData}</pre>
						</div>
					</Tab>
				</Tabs>
			</div>
		)
	}
}