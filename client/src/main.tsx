import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Flowbite } from "flowbite-react";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Flowbite theme={{ dark: true }}>
    <App />
  </Flowbite>
);
