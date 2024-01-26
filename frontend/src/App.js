import "./App.css";
import Homepage from "./Pages/Homepage";
// import Chatpage from "./Pages/Chatpage";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import ChatProvider from "./Context/ChatProvider";

export default function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ChatProvider>
          <Routes>
            <Route path="/" element={<Homepage />} exact />
            {/* <Route path="/chats" element={<Chatpage />} /> */}
          </Routes>
        </ChatProvider>
      </BrowserRouter>
    </div>

  );
}
