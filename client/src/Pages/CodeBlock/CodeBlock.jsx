import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/themes/prism.css";
import "prismjs/components/prism-jsx.min";
import "./CodeBlock.scss";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
  upgrade: false,
});

const CodeBlock = () => {
  const { short_id } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [solution, setSolution] = useState("");
  const [role, setRole] = useState("student");
  const [showSmiley, setShowSmiley] = useState(false);
  const [userCount, setUserCount] = useState(0);
  const [mentorLeft, setMentorLeft] = useState(false);

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/codeblocks/${short_id}`)
      .then((response) => {
        setCode(response.data.content);
        setSolution(response.data.solution);
      })
      .catch((err) => console.error("Error fetching code block:", err));

    socket.emit("joinToBlockRoom", { blockId: short_id });

    socket.on("setRoleForUser", (role) => {
      setRole(role);
    });

    socket.on("updateCodeInBlookRoom", (newCode) => {
      setCode(newCode);
    });

    socket.on("userCountUpdate", (count) => {
      setUserCount(count);
    });

    socket.on("resetCodeMentorLeft", () => {
      setCode("");
      setMentorLeft(true);
      setTimeout(() => {
        navigate("/");
      }, 2000);
    });

    socket.on("showSmileyInBlockRoom", (solutionStatus) => {
      setShowSmiley(solutionStatus);
    });

    return () => {
      socket.off("setRoleForUser");
      socket.off("updateCodeInBlookRoom");
      socket.off("userCountUpdate");
      socket.off("resetCodeMentorLeft");
      socket.off("showSmileyInBlockRoom");
    };
  }, [short_id]);

  const removeComments = (code) => {
    return code.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, "").trim();
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    let newCodeWithoutComments = removeComments(newCode);
    socket.emit("codeChangeInBlockRoom", {
      blockId: short_id,
      newCode,
      newCodeWithoutComments,
      solution,
    });
    if (newCodeWithoutComments === solution) {
      setShowSmiley(true);
    } else {
      setShowSmiley(false);
    }
  };

  const handleExit = () => {
    socket.emit("UserLeaveBlockRoom", { blockId: short_id });
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
      <p>Users in this block: {userCount}</p>
      {mentorLeft && (
        <div className="mentor-left-message">
          Mentor has left the code block page. Redirecting to lobby...
        </div>
      )}
      <Editor
        value={code}
        onValueChange={handleCodeChange}
        highlight={(code) => highlight(code, languages.jsx, "jsx")}
        padding={15}
        className="codeblock-editor"
        readOnly={role === "mentor" || userCount === 1}
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
