import React, { useEffect, useState } from "react";
import { clear, set } from "idb-keyval";
import prettyBytes from "pretty-bytes";

const chunks = [1000 * 1000 * 100, 1000 * 1000 * 10, 1000 * 1000, 1000];

function App() {
  const [size, setSize] = useState(0);
  const [chunkType, setChunkType] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const fill = async () => {
      let chunk = chunks[chunkType];
      try {
        let array = new Uint8Array(chunk);
        for (let i = 0; i < array.length; i++) {
          array[i] = Math.floor(Math.random() * 255);
        }
        await set(size, array.buffer);
        setSize(size + chunk);
      } catch (err) {
        if (chunkType < chunks.length - 1) {
          setChunkType(chunkType + 1);
        }
      }
    };
    if (running) fill();
  });
  return (
    <>
      <div>Filled {prettyBytes(size)}</div>
      <button onClick={() => setRunning(true)}>Start</button>
      <button onClick={() => setRunning(false)}>Stop</button>
      <button
        onClick={() => {
          clear();
          setSize(0);
          setChunkType(0);
        }}
      >
        Clear
      </button>
    </>
  );
}

export default App;
