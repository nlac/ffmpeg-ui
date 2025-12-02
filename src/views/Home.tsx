import React from 'react'
import { BrowserRouter as Router, Route, NavLink, withRouter } from "react-router-dom"

export default class Layout extends React.Component<any, any> {
	render() {
		return (
			<div>
				<div className="jumbotron">
					<h1>
						<div>FFMpeg UI</div>
						<div className="small">a backend-less web gui to generate ffmpeg commands</div>
					</h1>					
					<p>Start by a <NavLink to={'/new-project/MyProject'}>New project</NavLink>!</p>
				</div>
			</div>
		)
	}
}