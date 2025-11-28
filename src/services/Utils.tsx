//import React from 'react'
import mime from 'mime';
//import { isArray } from "util";

function getClass(obj: any) {
	if (obj && (typeof obj === "object")) {
		return obj.constructor.toString().match(/^function (\w+)/)[1].toLowerCase()
	}
	return typeof obj
}

// pure object like {}
function isPureObject(val: any) {
	//return typeof val === 'function' || (typeof val === 'object' && val !== null && !Array.isArray(val))
	return typeof val === 'object' && val !== null && val.constructor.toString().match(/^function Object\(/)
}

// can we use a for loop
function isIterable(val: any) {
	return typeof val === 'function' || (typeof val === 'object' && val !== null && !Array.isArray(val))
}

function isIterableWithArray(val) {
	if (!val || typeof val !== "object" || val instanceof RegExp || val instanceof Date || val instanceof Function)
		return false
	return true
}
// can we clone this object (beside the primitives)
function isCloneable(val: any) {
	return typeof val === 'object' && val !== null && val.constructor.toString().match(/^function (Object|Array)\(/)
}




const mergers = {
	overwrite: (target: any[], src: any[]) => {
		target.length = 0
		src.forEach(item => { target.push(item) })
	},
	append: (target: any[], src: any[]) => {
		src.forEach(item => { target.push(item) })
	}
}

interface MergeOptions {
	arrayMerger?: "append" | "overwrite" | (typeof mergers.overwrite),
	skipUndefined?: boolean // set it true if you do NOT want to merge undefined values
}

function mergeOne(options: MergeOptions, target: any, val: any, key: string | number) {
	let obj = target[key]
	if (obj !== val && isIterableWithArray(obj) && isIterableWithArray(val)) {
		merge(options, obj, val)
	} else if (!options.skipUndefined || val !== undefined) {
		target[key] = val
	}
}

function merge(options: MergeOptions, target: any, ...rest) {

	let isIterableTarget = isIterableWithArray(target), isArrayTarget = Array.isArray(target)

	options = options || {}
	if (!options.arrayMerger) {
		options.arrayMerger = mergers.overwrite
	} else if (typeof options.arrayMerger === "string") {
		options.arrayMerger = mergers[options.arrayMerger]
	}

	for (let src of rest) {

		if (src === target) {
			continue
		}

		if (isIterableTarget && isIterableWithArray(src)) {
			if (isArrayTarget && Array.isArray(src)) {
				options.arrayMerger(target, src)
			} else {
				for (let key in src) {
					if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
						mergeOne(options, target, src[key], key)
					}
				}
			}
		}
	}
	return target
}

function clone(obj: any, parents: any[] = []) {

	// caching obj
	let cachedObj: any
	if (isCloneable(obj)) {
		parents.push(cachedObj = {
			original: obj
		})
	}

	// generating the clone
	let clonedObj: any
	if (isPureObject(obj)) {
		cachedObj.cloned = clonedObj = {}
		for (let key in obj) {
			if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
				let cached = parents.find(cached => cached.original === obj[key])
				if (cached) {
					clonedObj[key] = cached.cloned
				} else {
					clonedObj[key] = isCloneable(obj[key]) ? clone(obj[key], parents.slice()) : obj[key]
				}
			}
		}
	} else if (Array.isArray(obj)) {
		cachedObj.cloned = clonedObj = []
		for (let i = 0; i < obj.length; i++) {
			let cached = parents.find(cached => cached.original === obj[i])
			if (cached) {
				clonedObj[i] = cached.cloned
			} else {
				clonedObj[i] = isCloneable(obj[i]) ? clone(obj[i], parents.slice()) : obj[i]
			}
		}
	}
	// ... more cloneables here eg. Date, RegExp or any instance of a class that has a clone() method
	else {
		clonedObj = obj
	}

	return clonedObj
}

function simpleClone(val: any) {
	return eval("(" + JSON.stringify(val) + ")")
}

function evaluate(val: string, ctx?: any) {
	return eval("(" + val + ")")
}

function getClassName(Class: any) {
	if (Class && Class.constructor && !(Class.toString().match(/^class /))) {
		Class = Class.constructor
	}
	return Class && Class.toString().split('(' || /s+/)[0].split(' ' || /s+/)[1]
}

function generateUid() {
	return String(Math.random()).replace(/[^\d]/g, "")
}

function iterateReactNodes(fiberNode: any, callback: Function, level: number = 0, horz: number = 0) {
	if (!fiberNode || !fiberNode.child) {
		return
	}
	let child = fiberNode.child, x = 0;
	while (child) {
		//if (child.stateNode) {
		//cn = getClassName(child.stateNode)
		//console.info("CN:", level, x, cn, child.stateNode)
		if (child && child.stateNode && child.stateNode.props && child.stateNode.props.uiSchema) {
			callback(child, child.stateNode.props.idSchema.$id, level, x)
		}
		if (level < 60) {
			iterateReactNodes(child, callback, level + 1, x)
		}
		//}
		child = child.sibling;
		x++;
	}
}

const validPointer = /^([#/]?$|#?\/.*)/

function parse(pointer: any) {
	if (!validPointer.test(pointer)) {
		throw "Invalid JSON pointer: " + pointer
	}
	return (pointer && pointer[0] === "#" ? decodeURIComponent(pointer).slice(1) : pointer).split('/').slice(1).map(function (token: string) {
		return token.replace(/~1/g, '/').replace(/~0/g, '~')
	})
}

function traverse(obj: any, tokens: any): any {
	if (!tokens.length) {
		return obj
	}
	if (obj === undefined) {
		throw "Invalid JSON pointer: /" + tokens[0]
	}
	return traverse(obj[tokens.shift()], tokens)
}

function jsonPointer(obj: any, pointer: string, parent?: boolean) {
	pointer = pointer.replace(/\./g, "/")
	if (parent) {
		pointer = pointer.replace(/\/[^\/]+$/, "")
	}
	if (pointer[0] != "/") {
		pointer = "/" + pointer
	}
	return traverse(obj, parse(pointer))
}

function isVideo(src: string) {
	return (getMime(src) || "").indexOf("video") >= 0
	//return rgVideoExt.test(ext(src))
}

function isAudio(src: string) {
	return (getMime(src) || "").indexOf("audio") >= 0
	//return rgAudioExt.test(ext(src))
}

function getMime(src: string): string {
	return mime.getType(src) || ""
}

function isBracketedSelector(id: string) {
	return id.match(/^\[\w+:\w+\]$/)
}

export {
	isCloneable,
	merge,
	clone,
	simpleClone,

	evaluate,
	getClassName,
	jsonPointer,
	generateUid,
	getMime,
	isAudio,
	isVideo,
	isBracketedSelector
}