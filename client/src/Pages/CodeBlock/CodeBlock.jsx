import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./CodeBlock.scss";
import { io } from "socket.io-client";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import Monaco from "@monaco-editor/react";
import { processCode } from "../../utils/CompareSolution";

const socket = io(process.env.REACT_APP_API_URL || "http://localhost:5000", {
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
  const [output, setOutput] = useState("");
  const [description, setDescription] = useState("");
  const [hints, setHints] = useState([]);
  const [showHints, setShowHints] = useState([false, false]);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/codeblocks/${short_id}`)
      .then((response) => {
        setCode(response.data.content);
        setSolution(response.data.solution);
        setDescription(response.data.description);
        setHints(response.data.hints);
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
  }, [short_id, navigate]);

  const handleCodeChange = async (newCode) => {
    setCode(newCode);
    const isSolutionCorrect = await processCode(newCode, solution);
    socket.emit("codeChangeInBlockRoom", {
      blockId: short_id,
      newCode,
      isSolutionCorrect,
    });
    setShowSmiley(isSolutionCorrect);
  };

  const handleExit = () => {
    socket.emit("UserLeaveBlockRoom", { blockId: short_id });
    navigate("/");
  };

  const handleCloseSmiley = () => {
    setShowSmiley(false);
  };

  const handleRunCode = async () => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/compiler`,
        {
          script: code,
          language: "nodejs",
          version: "latest",
          input: "",
        }
      );

      const result = response.data.output;
      if (result) {
        setOutput(result);
      } else {
        setOutput("No output");
      }
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    }
  };

  const openSelectedHint = (index) => {
    setShowHints((prev) => {
      const newShowHints = [...prev];
      newShowHints[index] = !newShowHints[index];
      return newShowHints;
    });
  };

  const openSolutionForMentor = () => {
    setShowSolution((prev) => !prev);
  };

  return (
    <div className="codeblock-container">
      <h1 className="codeblock-title">
        {role === "mentor" ? "Mentor View" : "Student View"}
      </h1>
      <p>Users in this code block: {userCount}</p>
      {mentorLeft && (
        <div className="mentor-left-message">
          Mentor has left the code block page. Redirecting to lobby...
        </div>
      )}
      <div className="content-container">
        <div className="editor-container">
          <Monaco
            height="300px"
            defaultLanguage="javascript"
            value={code}
            onChange={handleCodeChange}
            theme="vs-light"
            options={{
              automaticLayout: true,
              wordWrap: "on",
              minimap: { enabled: false },
              insertSpaces: true,
              formatOnType: true,
              fontSize: 16,
              padding: { top: 13 },
              readOnly: role === "mentor",
            }}
          />
          <div className="buttons-container">
            <button onClick={handleRunCode} className="run-button">
              Run Code
            </button>
            <button onClick={handleExit} className="exit-button">
              Exit
            </button>
          </div>
          <div className="output-container">
            <h3 className="output-title">Output:</h3>
            <pre>{output}</pre>
          </div>
        </div>
        <div className="description-container">
          <p className="description">
            Description: <br /> <br />
            {description}
          </p>
          <div className="hints-container">
            {hints.map((hint, index) => (
              <div key={index}>
                <button
                  onClick={() => openSelectedHint(index)}
                  className="hint-button"
                >
                  <EmojiObjectsOutlinedIcon style={{ marginRight: "6px" }} />
                  {`Hint ${index + 1}`}
                </button>
                {showHints[index] && <p className="hint">{hint.text}</p>}{" "}
              </div>
            ))}
          </div>
          {role === "mentor" && (
            <div>
              <button
                onClick={openSolutionForMentor}
                className="watch-solution-button"
              >
                {showSolution ? "Hide Solution" : "Watch Solution"}
              </button>
              {showSolution && (
                <div className="solution-container">
                  <pre>{solution}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {showSmiley && (
        <div className="smiley-popup" onClick={handleCloseSmiley}>
          <div className="smiley-content">😊</div>
        </div>
      )}
    </div>
  );
};

export default CodeBlock;
