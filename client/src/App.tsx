"use client";

import { io } from "socket.io-client";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import Login from "./views/Login";
import Chat from "./views/Chat";
import { useState } from "react";
import { UserContext } from "./interfaces/user";
import { CurrentUserContext } from "./hooks/userContext";

const URL = "http://localhost:5000";
const socket = io(URL, { autoConnect: false });

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    element: <Login socket={socket} />,
    loader: () => {
      if (!socket.connected) {
        return null;
      }
      return redirect("/chat");
    },
  },
  {
    path: "chat",
    element: <Chat socket={socket} />,
    loader: () => {
      if (socket.connected) {
        return null;
      }
      return redirect("/");
    },
  },
]);

function App() {
  const [user, setUser] = useState<UserContext>({username: ""});
  return (
    <CurrentUserContext.Provider value={[user, setUser]}>
      <RouterProvider router={router} fallbackElement={<p>Inital load...</p>} />
    </CurrentUserContext.Provider>
  );
}

export default App;
