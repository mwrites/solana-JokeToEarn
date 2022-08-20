import React, { useState } from "react";
import { defaultApiVersion, defaultUseAnchor } from "../utils/config";
import Switch from "react-switch"


const ClientSelector = () => {
  const [apiVersion, setApiVersion] = useState(defaultApiVersion);
  const [checked, setChecked] = useState(false);


  const handleChange = (checked) => {
    setChecked(checked)
  }

  return (
    <div className="client-selector">
      <h3>Choose Your Client</h3>
      Use Anchor? <Switch onChange={handleChange} checked={checked} />
      <div className="client-selector-container">
        <div className="client-selector-btn"
             onClick={() => {
               setApiVersion("v1");
             }}
        >
          <input
            type="radio"
            value={apiVersion}
            name="version"
            checked={apiVersion == "v1"}
          />
          v1: 1 joke = 1 ephemeral keypair
        </div>
        <div
          className="client-selector-btn"
          onClick={() => {
            setApiVersion("v2");
          }}
        >
          <input
            type="radio"
            value={apiVersion}
            name="version"
            checked={apiVersion == "v2"}
          />
          v2: Voting feature by usingPDA as AccountsMap
        </div>
        <div
          className="client-selector-btn"
          onClick={() => {
            setApiVersion("v3");
          }}
        >
          <input
            type="radio"
            value={apiVersion}
            name="version"
            checked={apiVersion == "v3"}
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
