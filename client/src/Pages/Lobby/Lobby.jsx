import React from "react";
import { Link } from "react-router-dom";
import "./Lobby.scss";

const Lobby = () => {
  const codeblocks = [
    { id: 1, title: "Code Block 1" },
    { id: 2, title: "Code Block 2" },
    { id: 3, title: "Code Block 3" },
    { id: 4, title: "Code Block 4" },
  ];

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Choose code block</h1>
      <div className="codeblock-grid">
        {codeblocks.map((block) => (
          <Link
            key={block.id}
            to={`/codeblock/${block.id}`}
            className="codeblock-link"
          >
            <div className="codeblock-item">{block.title}</div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Lobby;
