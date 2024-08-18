import { React } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import CodeBlock from "./Pages/CodeBlock/CodeBlock";
import Lobby from "./Pages/Lobby/Lobby";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/codeblock/:id" element={<CodeBlock />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
