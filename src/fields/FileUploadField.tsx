import React from "react"
import * as Utils from '../services/Utils'
import {BaseField} from './BaseField'
import Dropzone from 'react-dropzone'

/**
formData: {
	id: string
	uid: string
	type: mime
	name: string - the file name with extension
	path: string - unfortunately same as the name, without folder path
	url: string
	size: int
	...
}
 */
class FileUploadField extends BaseField {
	
	static className:string = "FileUploadField"
	
	dropZoneRef:any

	constructor(props: any) {
		super(props)
	}

	valueToState(state: any) {
		state.fieldData = [this.props.formData||{}]
	}

	stateToValue():any {
		return this.state.fieldData[0]
	}

	onIdChange = (e:any) => {
		const v = new String(e.target.value)
		this.setState((state:any) => {
			state.fieldData[0].id = v
		}, () => {
			this.onChange()
		})
	}

	generateId(file:any) {
		if (!file || !file.name) {
			return ""
		}
		return file.name || ""
	}

	onDrop = (acceptedFiles:any) => {

		// setting files
		this.setState((state:any, props:any) => {
			
			let newData = acceptedFiles.map((file:any) => {
				return Utils.merge({}, {
					url: URL.createObjectURL(file),
					id: this.generateId(file),
					uid: Utils.generateUid()
				}, file)
			})

			let keep:any = {}
			if (state.fieldData[0]) {
				keep.uid = state.fieldData[0].uid
				if (state.fieldData[0].id)
					keep.id = state.fieldData[0].id
			}

			state.fieldData = newData

			Utils.merge({}, state.fieldData[0], keep)

		}, () => {
			// !!! notifying JsonForms about the data change !!!
			this.onChange()
		})

	}

	thumbs = () => {
		return this.state.fieldData.map((file:any, i:number) => {
			if (!file.url) {
				if (file.path) {
					return <div key={i}>Please select the file below</div>
				} else {
					return ""
				}
			}
			if (Utils.isVideo(file.path)) {
				return (
					<video key={i} src={file.url} controls={false} className="thumb"></video>
				)
			}
			if (Utils.isAudio(file.path)) {
				return (
					<audio key={i} src={file.url} controls={false} className="thumb"></audio>
				)
			}
			return (
				<img key={i} src={file.url} className="thumb"></img>
			)
		})
	}

	onDropZoneCreated = (ref:any) => {
		if (ref && ref.click && !this.dropZoneRef) {
			this.dropZoneRef = ref
			setTimeout(() => {
				//ref.click()
			}, 300)
		}
	}

	render() {

		return (
			<div className="custom-field custom-field-fileupload">
				{this.state.fieldData[0] && this.state.fieldData[0].id && <div className="form-group field field-string">
					<input placeholder="Id" className="form-control" type="text" value={this.state.fieldData[0].id} onChange={this.onIdChange} />
				</div>}
				<Dropzone 
					onDrop={this.onDrop}
					multiple={false}
					accept={["video/*","audio/*","image/*"]}
				>
					{
						({getRootProps, getInputProps, acceptedFiles}) => (
							<div {...getRootProps()}>
								<input {...getInputProps()} /> 
								<div className="upload" ref={this.onDropZoneCreated}>
									{this.thumbs()}
									{this.state.fieldData.length && this.state.fieldData[0].name ? (
										<ul className="list-unstyled thumb-info">
											<li>{this.state.fieldData[0].name}</li>
											<li>{Number(0.001*this.state.fieldData[0].size).toFixed(3)} kbytes</li>
										</ul>
									) : (
										<span>Drag 'n' drop a file here or click to select one</span>
									)}
								</div>
							</div>
						)
					}
				</Dropzone>

			</div>
		)
	}
}

export default FileUploadField