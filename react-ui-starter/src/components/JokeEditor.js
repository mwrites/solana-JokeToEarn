import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const JokeEditor = ({ submitJoke }) => {
    const { connected } = useWallet();
    const [joke, setJoke] = useState("")

    if (!connected) {
        return null;
    }

    const handleChange = (event) => {
        const { value } = event.target
        setJoke(value);
    }

    const handleSubmit = (event) => {
        submitJoke(joke)
    }

    return (
        <div className="joke-edit-container">
            <form className="form">
                <input
                    type="text"
                    placeholder="Come on, don't be shy..."
                    className="form-input"
                    value={joke}
                    onChange={handleChange}
                />
                <button
                    type="button"
                    className="form-button"
                    onClick={handleSubmit}
                >
                    Shoot! 🎙
                </button>
            </form>
        </div>
    )
}

export default JokeEditor;