import { LocationProvider, ErrorBoundary, Router, Route } from 'preact-iso';
import Header from './components/Header.jsx';
import { GlobalStateContext } from './components/ClientContext.jsx';
import { useRef } from 'preact/hooks';
import { useEffect, useState, useContext } from 'react';
import Client from './components/WebSocketClient.js';
import About from './pages/About.jsx';
import './components/i18n.js';
import { ExclamationCircleIcon } from '@heroicons/react/16/solid';
import { useTranslation } from 'react-i18next';
import Desktop from './pages/Desktop.jsx';

export default function App() {
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const context = useContext(GlobalStateContext);
  const { t } = useTranslation();
  window.dispatch = context.dispatch;
  window.state = context.state;

  useEffect(() => {
    if (context.state.sharedData.error.disappear) {
      setTimeout(() => {
        context.dispatch({
          type: 'SET_ERROR',
          payload: {
            message: null,
            disappear: false
          }
        });
      }, 5000);
    }
  }, [context.state.sharedData.error.disappear]);

  useEffect(() => {
    if (headerRef.current?.base) {
      setHeaderHeight(headerRef.current.base.clientHeight);
    }
  }, [headerRef]);

  useEffect(() => {
    if (!window.setClient) {
      connectToService(context);
      window.setClient = true;
    }
  }, []);

  return (
    <ErrorBoundary>
      <LocationProvider>
        <div className="w-full h-screen overflow-hidden">
          <Header ref={headerRef} />
          <div className="bg-slate-800 text-white overflow-y-auto" style={{ height: `calc(100vh - ${headerHeight}px)` }}>
          <div className={`flex justify-center ${!context.state.sharedData.error.message ? 'hidden' : ''}`}>
            <div className="flex items-center p-4 mb-4 text-sm rounded-lg bg-slate-900 mt-8 mx-4 text-red-400" role="alert">
              <ExclamationCircleIcon className="h-6 w-6 mr-2" />
              <div>
                <span className="text-lg">{t(context.state.sharedData.error.message, context.state.sharedData.error.args)}</span>
              </div>
            </div>
          </div>
          <Router>
            <Route component={Desktop} path="/" />
            <Route component={Desktop} path="/index.html" />
            <Route component={About} path="/about" />
          </Router>
          </div>
        </div>
      </LocationProvider>
    </ErrorBoundary>
  );
}

function connectToService(context) {
  const ws = new WebSocket('ws://localhost:8091');

  ws.onerror = () => {
    context.dispatch({
      type: 'SET_ERROR',
      payload: {
        message: 'errors.serviceNotRunning',
        disappear: false
      }
    });
  };

  ws.onopen = () => {
    context.dispatch({
      type: 'SET_STATE',
      payload: 'service.alreadyRunning'
    });

    context.dispatch({
      type: 'SET_CLIENT',
      payload: new Client(context)
    });
  };
}
