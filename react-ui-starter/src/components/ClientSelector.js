import React, { useState } from "react";
import { defaultApiVersion, defaultUseAnchor } from "../utils/config";
import Switch from "react-switch"
import useApiStore from "../stores/useApiStore";


const ClientSelector = () => {
  const { useVersion, setUseVersion, useAnchor, setUseAnchor } = useApiStore();
  // const [checked, setChecked] = useState(false);


  const handleChange = (checked) => {
    setUseAnchor(checked)
  }

  return (
    <div className="client-selector">
      <h3>Choose Your Client</h3>
      Use Anchor? <Switch onChange={handleChange} checked={useAnchor} />
      <div className="client-selector-container">
        <div className="client-selector-btn"
             onClick={() => {
               setUseVersion("v1");
             }}
        >
          <input
            type="radio"
            value={useVersion}
            name="version"
            checked={useVersion == "v1"}
          />
          v1: 1 joke = 1 ephemeral keypair
        </div>
        <div
          className="client-selector-btn"
          onClick={() => {
            setUseVersion("v2");
          }}
        >
          <input
            type="radio"
            value={useVersion}
            name="version"
            checked={useVersion == "v2"}
          />
          v2: Voting feature by usingPDA as AccountsMap
        </div>
        <div
          className="client-selector-btn"
          onClick={() => {
            setUseVersion("v3");
          }}
        >
          <input
            type="radio"
            value={useVersion}
            name="version"
            checked={useVersion == "v3"}
          />
          v3: Comments and metadata by using PDA as Parent / Child
        </div>
      </div>
    </div>
  );
};


export {
  ClientSelector
};
