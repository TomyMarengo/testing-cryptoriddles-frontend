import Web3 from "web3";
import { useState } from "react";

import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
import axios from "axios";

const App = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");

  const onPressConnect = async () => {
    setLoading(true);

    try {
      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        const account = Web3.utils.toChecksumAddress(accounts[0]);
        await handleLogin(account);
      }
    } catch (error) {
      console.log(error);
      setAddress("");
    }

    setLoading(false);
  };

  const onPressLogout = () => setAddress("");
  
  const handleLogin = async (address) => {
    const baseUrl = "http://localhost:5000";
    const response = await axios.get(`${baseUrl}/login/request?walletAddress=${address}`);
    const messageToSign = response?.data?.messageToSign;

    if (!messageToSign) {
      throw new Error("Invalid message to sign");
    }

    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(messageToSign, address);

    const jwtResponse = await axios.get(
      `${baseUrl}/login/verify?walletAddress=${address}&signature=${signature}`
    );

    const customToken = jwtResponse?.data?.customToken;

    if (!customToken) {
      throw new Error("Invalid JWT");
    }

    setAddress(address);
  };

  return (
    <div className="App">
      <header className="App-header">
        <ConnectWalletButton
          onPressConnect={onPressConnect}
          onPressLogout={onPressLogout}
          loading={loading}
          address={address}
        />
      </header>
    </div>
  );
};

export default App;