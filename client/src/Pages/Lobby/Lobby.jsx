import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "./Lobby.scss";

const Lobby = () => {
  const [codeblocks, setCodeblocks] = useState([]);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/codeblocks`)
      .then((response) => {
        setCodeblocks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  return (
    <div className="lobby-container">
      <h1 className="lobby-title">Choose code block</h1>
      <div className="codeblock-grid">
        {codeblocks.map((block) => (
          <Link
            key={block._id}
            to={`/codeblock/${block.short_id}`}
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
