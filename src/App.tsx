import React from 'react'
import { BrowserRouter as Router} from "react-router-dom"
import Layout from './views/Layout'

const App: React.FC = () => {
	return (
		<Router>
			<Layout></Layout>
		</Router>
	)
}

export default App
