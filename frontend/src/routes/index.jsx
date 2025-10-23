import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Threads from '../pages/Threads';
import ThreadDetail from '../pages/ThreadDetail';
import Login from '../pages/Login';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        path: '/',
        element: <Threads />,
        children: [
          { index: true, element: <Threads /> },        // "/" → show threads
          { path: 'threads/:id', element: <ThreadDetail /> } // "/threads/:id"
        ],
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);

export default router;

