import Web3 from "web3";
import { useState } from "react";

import "./App.css";
import ConnectWalletButton from "./components/ConnectWalletButton";
import axios from "axios";

const instance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:5000/"
})

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

  const onPressLogout = async () => {
    await instance.post(`logout`,{});
    setAddress("");
  }
  
  const handleLogin = async (address) => {
    const response = await instance.post(`login/request`, {walletAddress: address});

    const messageToSign = response?.data?.messageToSign;

    if (!messageToSign) {
      throw new Error("Invalid message to sign");
    }

    const web3 = new Web3(Web3.givenProvider);
    const signature = await web3.eth.personal.sign(messageToSign, address);

    await instance.post(
      `login/verify`, {walletAddress: address, signature: signature});


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