import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-jsx.min";
import "./CodeBlock.scss";

const CodeBlock = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [role, setRole] = useState("student");
  const [showSmiley, setShowSmiley] = useState(false);

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (newCode.trim() === "test") {
      setShowSmiley(true);
    } else {
      setShowSmiley(false);
    }
  };

  const handleExit = () => {
    navigate("/");
  };

  const handleCloseSmiley = () => {
    setShowSmiley(false);
  };

  return (
    <div className="codeblock-container">
      <h1 className="codeblock-title">
        {role === "mentor" ? "Mentor View" : "Student View"}
      </h1>
      {role === "mentor" ? (
        <div className="codeblock-editor" readOnly>
          {code}
        </div>
      ) : (
        <Editor
          value={code}
          onValueChange={handleCodeChange}
          highlight={(code) => highlight(code, languages.jsx, "jsx")}
          padding={15}
          className="codeblock-editor"
        />
      )}
      {showSmiley && (
        <div className="smiley-popup" onClick={handleCloseSmiley}>
          <div className="smiley-content">😊</div>
        </div>
      )}
      <button onClick={handleExit} className="exit-button">
        Exit
      </button>
    </div>
  );
};

export default CodeBlock;
