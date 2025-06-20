import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { store, persistor } from './redux/store.js'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import ThemeProvider from './components/ThemeProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <PersistGate persistor={persistor}>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </PersistGate>
)
if (import.meta.env.DEV) {
  const originalWarn = console.warn;
  console.warn = (message, ...args) => {
    if (typeof message === 'string' && message.includes('findDOMNode')) {
      return;
    }
    originalWarn(message, ...args);
  };
}