import React, { useEffect, useState } from "react";
import { clear, set } from "idb-keyval";
import prettyBytes from "pretty-bytes";

function estimateStorage() {
  if ("storage" in navigator && "estimate" in navigator.storage) {
    // We've got the real thing! Return its response.
    return navigator.storage.estimate();
  }

  if (
    "webkitTemporaryStorage" in navigator &&
    "queryUsageAndQuota" in navigator.webkitTemporaryStorage
  ) {
    // Return a promise-based wrapper that will follow the expected interface.
    return new Promise(function(resolve, reject) {
      navigator.webkitTemporaryStorage.queryUsageAndQuota(function(
        usage,
        quota
      ) {
        resolve({ usage: usage, quota: quota });
      },
      reject);
    });
  }

  return Promise.reject();
}

const MAX_ENTROPY = 65536;
function fillWithRandomBytes(array) {
  let rnd = new Uint8Array(MAX_ENTROPY);
  window.crypto.getRandomValues(rnd);
  for (let i = 0; i < array.length - 1; i += rnd.length) {
    let end = Math.min(rnd.length, array.length - i);
    array.set(rnd.subarray(0, end), i);
  }
}
const chunks = [1000 * 1000 * 100, 1000 * 1000 * 10, 1000 * 1000, 1000];

function App() {
  const [quota, setQuota] = useState(0);
  const [size, setSize] = useState(0);
  const [chunkType, setChunkType] = useState(0);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    estimateStorage().then(({ quota }) => setQuota(quota));
  }, []);

  useEffect(() => {
    const fill = async () => {
      let chunk = chunks[chunkType];
      try {
        let array = new Uint8Array(chunk);
        fillWithRandomBytes(array);
        await set(size, array.buffer);
        setSize(size + chunk);
      } catch (err) {
        console.log(err);
        if (chunkType < chunks.length - 1) {
          setChunkType(chunkType + 1);
        }
      }
    };
    if (running) fill();
  });
  return (
    <>
      <h1>Quota Check</h1>
      <p>
        This app lets you test how much data can be stored in your browsers'
        IndexedDB.
      </p>
      {quota && <p>The storage API reports a quota of {prettyBytes(quota)}.</p>}
      <p>
        Filled {prettyBytes(size)} (Chunk size {prettyBytes(chunks[chunkType])})
      </p>
      <p>
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
      </p>
    </>
  );
}

export default App;
