# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh


{/* Enhanced Debug Panel */}
      <div className='mb-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm border'>
        <h3 className='font-bold mb-2'>Debug Information:</h3>
        <div className='grid grid-cols-2 gap-2'>
          <div>
            <strong>User ID:</strong> {currentUser?._id || 'Not found'}
          </div>
          <div>
            <strong>Username:</strong> {currentUser?.username || 'Not found'}
          </div>
          <div>
            <strong>Email:</strong> {currentUser?.email || 'Not found'}
          </div>
          <div>
            <strong>Is Admin (Raw):</strong> 
            <span className={currentUser?.isAdmin ? 'text-green-600' : 'text-red-600'}>
              {String(currentUser?.isAdmin)}
            </span>
          </div>
          <div>
            <strong>Is Admin (Processed):</strong>
            <span className={isUserAdmin() ? 'text-green-600' : 'text-red-600'}>
              {isUserAdmin() ? 'YES' : 'NO'}
            </span>
          </div>
          <div>
            <strong>Admin Type:</strong> {typeof currentUser?.isAdmin}
          </div>
        </div>
        <div className='mt-2'>
          <button 
            onClick={testBackendConnection}
            className='px-3 py-1 bg-blue-500 text-white rounded text-xs mr-2'
          >
            Test Backend Connection
          </button>
          <button 
            onClick={() => console.log('User can create posts:', isUserAdmin())}
            className='px-3 py-1 bg-green-500 text-white rounded text-xs'
          >
            Test Admin Check
          </button>
        </div>
        <div className='mt-2'>
          <strong>Full User Object:</strong>
          <pre className='text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto'>
            {JSON.stringify(currentUser, null, 2)}
          </pre>
        </div>
      </div>
      