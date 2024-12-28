import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import AddressForm from './components/AddressForm';

import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />
  },
  {
    path: '/address',
    element: <AddressForm />
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <RouterProvider router={router} />
);



