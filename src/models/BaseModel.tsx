import React from 'react'

export default abstract class BaseModel {
	
	abstract getSchema()
	abstract getUiSchema()
	abstract getDefault()

}