import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-jsx.min";
import "./CodeBlock.scss";

const CodeBlock = () => {
  const { short_id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [solution, setSolution] = useState("");
  const [role, setRole] = useState("student");
  const [showSmiley, setShowSmiley] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/codeblocks/${short_id}`)
      .then((response) => {
        setCode(response.data.content);
        setSolution(response.data.solution);
      })
      .catch((err) => console.error("Error fetching code block:", err));
  }, [short_id]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);

    if (newCode.trim() === solution) {
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
      <Editor
        value={code}
        onValueChange={handleCodeChange}
        highlight={(code) => highlight(code, languages.jsx, "jsx")}
        padding={15}
        className="codeblock-editor"
        readOnly={role === "mentor"}
      />
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
