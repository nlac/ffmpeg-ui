import React from 'react'
import {Tooltip as TT, OverlayTrigger} from 'react-bootstrap'

const Tooltip = (props:any) => {
	return (
		<OverlayTrigger
			placement={props.placement}
			overlay={<TT id="tooltip">{props.content}</TT>}
		>{props.children}</OverlayTrigger>
	)
}

export default Tooltip