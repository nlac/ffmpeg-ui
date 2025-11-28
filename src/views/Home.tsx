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
					
					<p>My motivations were 1. learning react 2. creating a web-based command generator for ffmpeg 
						that is easy to extend to deal with the countless ffmpeg filters.</p>
					<p>The following libraries are used:</p>
					<ul>
						<li><a href="https://github.com/nlac/ruled-jsonschema-form" target="_blank">ruled-jsonschema-form</a></li>
						<li><a href="https://github.com/mozilla-services/react-jsonschema-form" target="_blank">react-jsonschema-form</a></li>
						<li><a href="https://github.com/facebook/react" target="_blank">react</a></li>
						<li><a href="https://getbootstrap.com/docs/3.3" target="_blank">bootstrap 3</a></li>
						<li>many more smaller modules</li>
					</ul>
					<p>This project is still under heavy development but can try a <NavLink to={'/new-project/MyProject'}>New project</NavLink> ! :)</p>
				</div>
				<div className="alert alert-info" role="alert">
					<strong>For Chrome users:</strong> you need to start Chrome with the <code>--allow-file-access-from-files</code> flag
				</div>
			</div>
		)
	}
}