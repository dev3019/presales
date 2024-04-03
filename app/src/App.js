import { useState, useEffect } from "react";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { Connection, PublicKey, clusterApiUrl, Keypair } from "@solana/web3.js";
import { Program, AnchorProvider, utils, BN, web3 } from "@project-serum/anchor";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletMultiButton,
  WalletDisconnectButton,
} from "@solana/wallet-adapter-react-ui";
import idl from './token_presale_program.json';
import {Buffer} from 'buffer'
import './App.css'; // The path to your JSON IDL file

window.Buffer = Buffer
const {SystemProgram} = web3
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet'); // Adjust for your environment: local, devnet, or mainnet-beta
const opts = { preflightCommitment: "processed" };

function App() {
  const [walletAddress, setWalletAddress] = useState(null)
  

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    return new AnchorProvider(connection, window.solana, opts.preflightCommitment);
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const {solana} = window
      if(solana){
        if(solana.isPhantom) console.log('Phantom wallet found')
        const response = await solana.connect({
          onlyIfTrusted: true
        })
        console.log('Connected with public key: ', response.publicKey.toString())
        setWalletAddress(response.publicKey.toString())
      }else alert('Install phantom wallet')
    } catch (error) {
      console.log(error)
    }
  }
  const connectWallet = async()=>{
    const {solana} = window
    if(solana){
      const response = await solana.connect()
      console.log('Connected with public key: ', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }
  const initToken = async () => { 
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const x = new PublicKey('J1Ws68RhkdKeLT4nHFCshqtJTM1PobEqVfBAqjhs5L7y')
      const y = Keypair.fromSecretKey(Buffer.from([17,138,210,230,168,79,226,42,28,108,109,69,16,246,164,42,210,61,163,23,170,67,25,154,59,158,238,235,197,223,218,180,92,142,237,246,245,37,195,119,209,7,96,233,1,70,39,69,57,92,68,127,1,127,107,201,35,95,50,242,231,114,120,79], 'base64'))
      console.log(x.toString(), y.publicKey.toString())
      await program.rpc.initializeToken({
        accounts: {
          tokenMint: y.publicKey,
          payer: x,
          systemProgram: SystemProgram.programId,
        },
        signers: [y]
      });
      console.log("Token account initiated!");
    } catch (err) {
      console.error("Error initializing token:", err);
    }
  };

  const initPresale = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const x = new PublicKey('J1Ws68RhkdKeLT4nHFCshqtJTM1PobEqVfBAqjhs5L7y')
      const newy = Keypair.generate()
      const y = Keypair.fromSecretKey(Buffer.from([17,138,210,230,168,79,226,42,28,108,109,69,16,246,164,42,210,61,163,23,170,67,25,154,59,158,238,235,197,223,218,180,92,142,237,246,245,37,195,119,209,7,96,233,1,70,39,69,57,92,68,127,1,127,107,201,35,95,50,242,231,114,120,79], 'base64'))
      console.log(newy.publicKey, newy.secretKey)
      await program.rpc.initializePresale({
        accounts: {
          presale: newy.publicKey,
          payer: x,
          systemProgram: SystemProgram.programId,
        },
        signers: [newy],
      });
      console.log("Presale initiated!");
    } catch (err) {
      console.error("Error initiating presale:", err);
    }
  };

  const fetchPresale = async()=> {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const y = Keypair.fromSecretKey(Buffer.from([222,122,52,210,252,195,160,90,226,104,28,208,199,235,110,170,20,37,104,233,86,143,82,49,67,159,185,246,29,16,81,246,162,158,65,197,194,14,115,143,135,236,149,60,89,9,24,236,211,175,19,166,162,185,122,155,96,19,0,156,246,149,195,159], 'base64'))
      // Fetch presale data
      const presaleAccount = await program.account.presale.fetch(y.publicKey);
      const presaleData = {
          tokenPrice: presaleAccount.tokenPrice,
          isActive: presaleAccount.isActive,
          maxPurchaseAmount: presaleAccount.maxPurchaseAmount,
      };
      // Fetch token mint data
      const x = Keypair.fromSecretKey(Buffer.from([17,138,210,230,168,79,226,42,28,108,109,69,16,246,164,42,210,61,163,23,170,67,25,154,59,158,238,235,197,223,218,180,92,142,237,246,245,37,195,119,209,7,96,233,1,70,39,69,57,92,68,127,1,127,107,201,35,95,50,242,231,114,120,79], 'base64'))
      const tokenMintData = await program.account.tokenMint.fetch(x.publicKey);

      console.log('Presale Data:', presaleData);
      console.log('Total Supply:', (tokenMintData.totalSupply.toNumber()));
    } catch (error) {
      console.error('Error in fetching presale: ', error)
    }
  }

  const startSale = async()=>{
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const presale = Keypair.fromSecretKey(Buffer.from([222,122,52,210,252,195,160,90,226,104,28,208,199,235,110,170,20,37,104,233,86,143,82,49,67,159,185,246,29,16,81,246,162,158,65,197,194,14,115,143,135,236,149,60,89,9,24,236,211,175,19,166,162,185,122,155,96,19,0,156,246,149,195,159], 'base64'))
      await program.rpc.setTokenPrice(0.2, {
        accounts: {
            presale: presale.publicKey,
            payer: provider.wallet.publicKey
        },
      });
      console.log('Token price set.')
    } catch (error) {
      console.error('Error starting sale: ', error)
    }
  }

  const renderNotConnectedContainer = () => {
    return (<button onClick={connectWallet}>Connect to Wallet</button>)
  }
  const renderConnectedContainer = ()=>{
    return (
      <>
        <p>Wallet connected: {walletAddress}</p>
        <button onClick={initToken}>init token</button>
        <button onClick={initPresale}>init presale</button>
        <button onClick={fetchPresale}>fetch presale</button>
        <button onClick={startSale}>Start Sale</button>
      </>
    )
  }
  useEffect(()=>{
    const onLoad = async()=>{
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  },[])
  return (
    <div className="App">
      {!walletAddress && renderNotConnectedContainer()}
      {walletAddress && renderConnectedContainer()}
    </div>
  );
}

export default App;
