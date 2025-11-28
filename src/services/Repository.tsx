//import React from 'react'
import * as Utils from "../services/Utils"
//import Events from "./Events"
//import Filter from '../models/FilterModel'
import FilterChain from "../models/FilterChain"
import Mapping, {MediaType} from '../models/Mapping'
import OutputStream from '../models/OutputStream'
import EncoderModel from '../models/EncoderModel'
import Persistence from './Persistence'

//const window:any
//const localStorage:any

class FormKeys {
	inputs:any = "inputs"
	ranges:any = "ranges"
	filterChains:any = "filterChains"
		inputStreams:any = "inputStreams"
		outputStreams:any = "outputStreams"
		filterChain:any = "filterChain"
	encoding:any = "encoding"
	outputMapping:any = "outputMapping"
}

const formKeys = new FormKeys()

class Input {
	uid:string = ""    // uid
	id:string = ""     // user-written id
	name:string = ""   // comes from fs
	path:string = ""   // comes from fs
	size:number = 0    // comes from fs
	type:string = ""   // comes from fs
}

class Range {
	sourceUid:string = ""   //fk
	uid:string = ""    // uid
	id:string = ""
	start?:number
	end?:number
}

let root:any = {}
const filters:any[] = []
const encoders:any[] = []

class Repository {
	
	keys: FormKeys = formKeys
	command:string = ""

	constructor() {
	}
	
	emptyRoot() {
		let r:any
		if (r = this.getInputsRoot()) {
			r.length = 1
			r[0] = {}
		}
		if (r = this.getRangesRoot()) {
			r.length = 1
			r[0] = {}
		}
		if (r = this.getFilterChainsRoot()) {
			r.length = 0
		}
		if (r = this.getEncodingRoot()) {
			root[this.keys.encoding] = EncoderModel.instance().getDefault()
		}
	}

	hasFilter(name: string) {
		return filters.some(f => f.name === name)
	}

	putFilter(filter:any) {
		if (!this.hasFilter(filter.name)) {
			filters.push(filter)
		}
	}

	getFilters() {
		return filters
	}

	
	
	
	
	hasEncoder(name: string) {
		return encoders.some(e => e.name === name)
	}

	putEncoder(e:any) {
		if (!this.hasEncoder(e.name)) {
			encoders.push(e)
		}
	}

	getEncoders() {
		return encoders
	}


	
	getNode(key?: string, defaultValue?: any):any {
		if (key === undefined || key === "") {
			return root
		}
		
		if (defaultValue !== undefined && !(key in root)) {
			root[key] = defaultValue
		}
		
		return root[key]
	}

	getRoot():any {
		return root
	}

	getByPath(keys:any[]):any {
		let node:any = root
		for(let i=0; node && i<keys.length; i++) {
			let key = keys[i]
			if (i===0 && key==="root") {
				continue
			}
			if (key === "") {
				continue
			}
			node = node[key]
		}
		return node
	}

	getInputsRoot(): Input[] {
		return this.getNode(this.keys.inputs)
	}
	
	getRangesRoot(): Range[] {
		return this.getNode(this.keys.ranges)
	}

	getFilterChainsRoot(): FilterChain[] {
		return this.getNode(this.keys.filterChains)
	}
	
	getOutputMappingRoot(): OutputStream[] {
		return this.getNode(this.keys.outputMapping)
	}
	
	getEncodingRoot(): any {
		return this.getNode(this.keys.encoding)
	}

	hasValidInput() {
		return this.getInputsRoot().some((input:Input) => {
			return !!input.path
		})
	}
	
	isInput(id:string):number {
		if (!id)  {
			return -1
		}
		return this.getInputsRoot().findIndex((input:Input) => {
			return input.id == id
		})
	}
	
	// http://ffmpeg.org/ffmpeg.html#Stream-specifiers
	toStreamSpecifier(mediaIndex:number|string, type: MediaType|number, streamIndex?:number) {
		
		if (typeof mediaIndex === "string") {
			mediaIndex = this.getInputsRoot().findIndex(input => input.id == mediaIndex)
		}
		
		let sel = "[" + mediaIndex
		
		if (type !== undefined) {
			sel += ":" + type
		}
		
		if (streamIndex !== undefined) {
			sel += ":" + streamIndex
		}

		sel += "]"
		return sel
	}

	/**
	 * 
	 * @param range 
	 */
	rangeToFilterChain(range: Range, filterChains: FilterChain[], from:number, bAudio:boolean) {
		
		// range.sourceUid determines the input stream
		let index
		const input = this.getInputsRoot().find((input,i) => {
			if (range.sourceUid === input.uid) {
				index = i
				return true
			}
			return false
		}) as Input

		const addRange = (map:Mapping) => {

			let filters:any[]
			if (map.type === "v") {
				filters = [
					{
						trim: {
							start: range.start,
							end: range.end,
							$isActive: true
						},
						$isClosed: true
					},
					{
						setpts: {
							singleValue: "PTS-STARTPTS",
							$isActive: true
						},
						$isClosed: true
					},
					{
						scale: {
							w: "0.5*iw",
							h: "-1",
							$isActive: false
						},
						$isClosed: true
					}
				]
			} else {
				filters = [
					{
						atrim: {
							start: range.start,
							end: range.end,
							$isActive: true
						},
						$isClosed: true
					}
				]
			}

			const chain:FilterChain = {
				inputStreams: [
					{
						id: String(input.id),
						mapping: map
					}
				],
				filters: filters,
				outputStreams: [
					range.id + "-" + map.type + (map.index===undefined ? "" : "-" + map.index)
				],
				rangeUid: range.uid,
				$isClosed: true
			} as FilterChain

			filterChains.splice(from, 0, chain)
			from++
		}
		
		if (input) {
			if (Utils.isVideo(input.path)) {
				addRange({type: bAudio ? "a":"v"} as Mapping)
			} else if (Utils.isAudio(input.path) && bAudio) {
				addRange({type:"a"} as Mapping)
			}
		}

		return from
	}

	prependSourceFilters(bAudio:boolean) {
		const rangesRoot = this.getRangesRoot()
		const chainsRoot = this.getFilterChainsRoot()
		
		if (!chainsRoot) {
			return
		}

		let i = 0
		
		// removing source trims
		for(i=0; i<chainsRoot.length; i++) {
			if (chainsRoot[i].rangeUid) {

				const isAudioFilter = chainsRoot[i].filters.some(f => !!f.atrim)

				if ((bAudio && isAudioFilter) || (!bAudio && !isAudioFilter)) {
					chainsRoot.splice(i, 1)
					i--	
				}
			}
		}
		
		i = 0
		// do NOT prepend trims for inputs directly

		// but prepend trims for ranges
		rangesRoot.forEach(range => {
			if (range.id && range.sourceUid) {
				i = this.rangeToFilterChain(range, chainsRoot, i, bAudio)
			}
		})
	}

	loadProject(name:string) {
		let p = Persistence.instance().getProject(name) || {}
		this.emptyRoot()
		Object.keys(p).forEach((k:string) => {
			root[k] = Utils.simpleClone(p[k])
		})
	}

	saveProject(name:string) {
		const root4save = Utils.simpleClone(root)
		root4save[this.keys.inputs].forEach(input => {
			delete input.url
		})
		Persistence.instance().setProject(name, root4save)
	}

	deleteProject(name:string) {
		Persistence.instance().deleteProject(name)
	}

	computeCommand() {
		let cmd:string = 'ffmpeg'
		
		if (this.getInputsRoot()) {
			this.getInputsRoot().forEach(input => {
				if (input.path) {
					cmd += " -i " + input.path
				}
			})
		}
		
		if (this.getEncodingRoot()) {
			cmd += EncoderModel.toCommand(this.getEncodingRoot())
		}

		const fcRoot = this.getFilterChainsRoot()
		if (fcRoot && fcRoot.length) {
			cmd += ' -filter_complex ^\n"'
			fcRoot.forEach(chain => {
				cmd += FilterChain.toCommand(chain) + "; ^\n"
			})
			cmd = cmd.replace(/; \^\n$/, '"')
		}

		if (this.getOutputMappingRoot()) {
			cmd += OutputStream.toCommand(this.getOutputMappingRoot())
		}

		cmd += " result.mp4"

		return this.command = cmd
	}
}

const instance = new Repository()

export default instance as Repository

export {
	Range
}
