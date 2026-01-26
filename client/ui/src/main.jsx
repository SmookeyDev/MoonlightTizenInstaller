import { render } from 'preact'
import './index.css'
import App from './app.jsx'
import { GlobalStateProvider } from './components/ClientContext.jsx'

render(<GlobalStateProvider><App /></GlobalStateProvider>, document.getElementById('app'));
