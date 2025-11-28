import React from "react"
import * as Utils from '../services/Utils'
import { BaseField } from './BaseField'
import Select from 'react-select'
import Events from "../services/Events"
import CreatableSelect from 'react-select/creatable'
import Repository from "../services/Repository"

class MediaRangeField extends BaseField {
	
	static className:string = "MediaRangeField"
	
	unsubscribeInputChanges: any

	// DOM node reference
	videoRef: any

	playBetween: boolean = false

	// form data of InputsForm
	sources: any = []
	timesSource: any = []

	// selected source from this.sources
	selectedSource: any

	/**
	 * Field constructor
	 * @param props:
	 * props.uiSchema.key
	 * props.uiSchema.sourcesKey
	 */
	constructor(props: any) {
		super(props)

		this.valueToState(this.state = {})

		// choosen media files on Inputs tab
		this.sources = Repository.getInputsRoot()
		this.selectedSource = this.getSelectedSource()

		this.updateTimesSource()
	}

	// value comes from the repo
	valueToState(state: any) {
		state.fieldData = Utils.merge(
			{}, 
			{ start: 0, end: undefined, sourceUid: undefined, id:undefined }, 
			this.props.formData || {}
		)
		if (!state.fieldData.uid) {
			state.fieldData.uid = Utils.generateUid()
		}
		
	}

	stateToValue(): any {
		return this.state.fieldData
	}
	
	updateTimesSource() {
		this.timesSource = Repository.getRangesRoot()
	}

	onVideoRefCreated = (ref: any) => {
		if (!ref) {
			return
		}

		if (this.videoRef) {
			ref.currentTime = 0

			this.setState((state: any, props: any) => {
				state.fieldData.start = 0
				state.fieldData.end = undefined
			}, () => {
				// store -> ui
				this.onChange()
			})
		} else {
			// store -> ui
			ref.currentTime = this.stateToValue().start
		}

		this.videoRef = ref
		
		// setting initial end time to the video duration, once
		this.videoRef.ondurationchange = (e:any) => {
			this.videoRef.ondurationchange = null
			if (this.state.fieldData.end === undefined) {
				this.setEnd(this.videoRef.duration)
			}
		};

		this.videoRef.ontimeupdate = (e: any) => {
			this.setState({
				currentTime: this.videoRef.currentTime
			})

			let nodeData = this.stateToValue()

			if (this.playBetween && nodeData.end && this.videoRef.currentTime >= nodeData.end) {
				this.playBetween = false
				this.videoRef.pause()
				this.videoRef.currentTime = nodeData.end
			}
		}

		this.videoRef.onplaying = this.videoRef.onseeking = (e: any) => {
			this.setState({
				seeking: true
			})
		}

		this.videoRef.onpause = this.videoRef.onseeked = this.videoRef.onended = (e: any) => {
			this.setState({
				seeking: false
			})
		}

	}

	setStart(e?: any) {

		this.setState((state: any, props: any) => {
			
			state.fieldData.start = this.videoRef.currentTime || 0
			this.getRangeId(state.fieldData)

		}, () => {
			// notifying the Jsonforms lib about the change
			this.onChange()
			this.forceUpdate()

			setTimeout(() => {
				Events.send("starttime-changed", {
					field: this
				})
			}, 300)
		})
	}

	setEnd(end?: any) {

		this.setState((state: any, props: any) => {

			state.fieldData.end = Number.isFinite(end) ? end : (this.videoRef.currentTime || undefined)
			this.getRangeId(state.fieldData)

		}, () => {
			// notifying the Jsonforms lib about the change
			this.onChange()
			this.forceUpdate()

			setTimeout(() => {
				Events.send("endtime-changed", {
					field: this
				})
			}, 300)
		})
	}

	jumpStart(e?: any) {
		this.videoRef.currentTime = this.stateToValue().start || 0
	}

	jumpEnd(e?: any) {
		this.videoRef.currentTime = this.stateToValue().end || 9999999999
	}

	formatTs(ts: any) {
		if (ts === undefined || ts === null) {
			return ""
		}
		return Number(ts||0).toFixed(2)
		//ts = String(ts || 0)
		//return ts.substr(0, Math.min(2, ts.length))
	}

	play() {
		if (this.state.seeking) {
			this.videoRef.pause()
		} else {
			this.jumpStart()
			this.playBetween = true
			this.videoRef.play()
		}
	}

	getRangeId(fieldData: any) {
		if (!fieldData.sourceUid) {
			fieldData.id = undefined
			return
		}
		
		const pattern = "_" + this.formatTs(fieldData.start) + "-" + this.formatTs(fieldData.end)
		
		fieldData.id = (fieldData.id || this.getSelectedSource(fieldData.sourceUid).id).replace(/_[\d.]+-[\d.]*/, "") + pattern
	}

	getSelectedSource(_uid?:string) {
		_uid = _uid || this.state.fieldData.sourceUid
		return _uid && this.sources.find(({uid}: any) => _uid === uid)
	}

	onSelectChange = (data: any) => {
		if (data.uid === this.state.fieldData.sourceUid) {
			return;
		}

		let newTimes:any = {
			sourceUid: data.uid,
			start: this.timesSource.length ? (this.timesSource[this.timesSource.length-1].end || 0) : 0,
			end: undefined
		}

		this.getRangeId(newTimes)

		this.selectedSource = undefined

		this.setState({
			fieldData: newTimes
		}, () => {
			this.selectedSource = this.getSelectedSource()
			//this.getRangeId(this.state.fieldData)
			this.onChange()
		})

	}

	onIdChange = (e:any) => {
		const v = new String(e.target.value)
		this.setState((state:any) => {
			state.fieldData.id = v
		}, () => {
			this.onChange()
		})
	}

	getStartOptions = () => {
		return Repository.getRangesRoot().map(function(interval:any) {
			return {
				value:interval.end,
				label:interval.end
			}
		})
	}

	onStartChange = (opt:any, meta:any) => {
		if (meta.action === "create-option" || meta.action === "select-option") {
			this.setState((state:any) => {
				state.fieldData.start = opt.end
				this.getRangeId(state.fieldData)
			}, () => {
				this.onChange()
				this.forceUpdate()
				this.jumpStart()
				
				setTimeout(() => {
					Events.send("starttime-changed", {
						field: this
					})
				}, 100)
			})
			
		}
	}

	onEndChange = (opt:any, meta:any) => {
		if (meta.action === "create-option" || meta.action === "select-option") {
			this.setState((state:any) => {
				state.fieldData.end = opt.start
				this.getRangeId(state.fieldData)
			}, () => {
				this.onChange()
				this.forceUpdate()
				this.jumpEnd()
				
				setTimeout(() => {
					Events.send("endtime-changed", {
						field: this
					})
				}, 300)
			})
			
		}
	}

	getNewStartOptionData = (inputValue:any, optionLabel:any) => {
		return {
			end: inputValue
		}
	}
	
	getNewEndOptionData = (inputValue:any, optionLabel:any) => {
		return {
			start: inputValue
		}
	}

	componentWillUnmount() {
		if (this.videoRef) {
			this.videoRef.onplaying = this.videoRef.onseeking = this.videoRef.ontimeupdate = null
			this.videoRef.onpause = this.videoRef.onseeked = this.videoRef.onended = null
			this.videoRef.ondurationchange = null
		}
		if (this.unsubscribeInputChanges) {
			this.unsubscribeInputChanges()
		}
	}

	componentDidMount() {

		this.unsubscribeInputChanges = Events.on("endtime-changed|starttime-changed", (name:any, params: any) => {
			if (params.field !== this) {
				this.updateTimesSource()
				this.forceUpdate()
			}
		})

	}

	render() {
		return (
			<div className="custom-field custom-field-media">
				<div className="container-fluid pad-l-0 pad-r-0">

					<div className="row">
						{this.state.fieldData.sourceUid && 
							<div className="col-sm-6">
								<div className="form-group field field-string">
									<input type="text" className="form-control" onChange={this.onIdChange} value={this.state.fieldData.id}/>
								</div>	
							</div>
						}
						{this.sources && this.sources.length &&
							<div className="col-sm-6">
								<Select
									placeholder="Select a media..."
									onChange={(value: any) => this.onSelectChange(value)}
									options={this.sources.filter((m:any) => Utils.isVideo(m.path) || Utils.isAudio(m.path))}
									getOptionLabel={({ id }) => id}
									getOptionValue={({ id }) => id}
									value={this.sources.filter(({ uid }: any) => uid === this.state.fieldData.sourceUid)}
								></Select>
							</div>
						}
					</div>

					<div className="row">
						{this.selectedSource && 
							<div className="col-xs-12">
								{/* type={Utils.getMime(this.selectedSource.name)} */}
								
								{Utils.isVideo(this.selectedSource.name) && <video ref={this.onVideoRefCreated} preload="auto" controls={true} className="media">
									<source src={this.selectedSource.url}></source>
								</video>}
								{Utils.isAudio(this.selectedSource.name) && <audio ref={this.onVideoRefCreated} preload="auto" controls={true} className="media">
									<source src={this.selectedSource.url}></source>
								</audio>}
							</div>
						}
					</div>

					<div className="row">
						{this.selectedSource && 
							<div className="col-sm-5">
								<span className="startTs">
									<CreatableSelect
										options={this.timesSource}
										getOptionLabel={({ end }) => this.formatTs(end)}
										getOptionValue={({ end }) => end}
										onChange={this.onStartChange}
										value={{end: this.state.fieldData.start}}
										getNewOptionData={this.getNewStartOptionData}
									/>
								</span>
								<button disabled={this.state.seeking} className="btn btn-primary btn-small" onClick={() => this.setStart()}>
									<i className="glyphicon glyphicon-arrow-down"></i>
								</button>
								<button className="btn btn-default btn-small" disabled={this.state.seeking} onClick={() => this.jumpStart()}>
									<i className="glyphicon glyphicon-step-backward"></i>
								</button>
							</div>
						}

						{this.selectedSource && <div className="col-sm-2 text-center">
							<button className="btn btn-default btn-small" onClick={() => this.play()}>
								{this.state.seeking && <i className="glyphicon glyphicon-pause"></i>}
								{!this.state.seeking && <i className="glyphicon glyphicon-play"></i>}
								{this.formatTs(this.videoRef && this.videoRef.currentTime)}
							</button>
						</div>}

						{this.selectedSource && !this.props.startOnly && 
							<div className="col-sm-5 text-right">
								<button className="btn btn-default btn-small" disabled={this.state.seeking} onClick={() => this.jumpEnd()}>
									<i className="glyphicon glyphicon-step-forward"></i>
								</button>
								<button className="btn btn-primary btn-small" disabled={this.state.seeking} onClick={() => this.setEnd()}>
									<i className="glyphicon glyphicon-arrow-down"></i>
								</button>
								<span className="endTs">
									<CreatableSelect
										options={this.timesSource.filter((fieldData:any) => Number(fieldData.end||0) > Number(this.state.fieldData.start||0))}
										getOptionLabel={({ start }) => this.formatTs(start)}
										getOptionValue={({ start }) => start}
										onChange={this.onEndChange}
										value={{start: this.state.fieldData.end}}
										getNewOptionData={this.getNewEndOptionData}
									/>
								</span>
							</div>
						}

					</div>
				</div>
			</div>
		)
	}
}

export default MediaRangeField