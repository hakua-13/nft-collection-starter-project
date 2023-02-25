import { ethers } from 'ethers';
import { useEffect, useState } from "react";

import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import openseaLogo from './assets/opensea-logo.svg';
import myEpicNft from './utils/MyEpicNFT.json';

const TWITTER_HANDLE = 'hakua';
const TWITTER_LINK = 'https://twitter.com/';
const OPENSEA_LINK = 'https://testnets.opensea.io/collection/squarenft-147';
// const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = '0xdd4AD1Af008B08e68d07b99B6743b3645552Ae91';

const App = () => {
  const [ currentAccount, setCurrentAccount ] = useState('');
  const [ mintCount, setMintCount ] = useState(null);
  const [ minting, setMinting ] = useState(false);

  // MyEpicNFT.solの中でeventがemitされた時に、情報を受け取る
  const setupEventListener = async() => {
    try{
      const { ethereum } = window;
      if( ethereum ){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer,
        );
        // Eventがemitされる際に、コントラクトから送信される情報を受け取る
        connectedContract.on('NewEpicNFTMinted', (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          // alert(`あなたのウォレットにNFTを送信しました。OpenSeaに表示されるまで最大で10分かかることがあります。NFTへのリンクはこちらです: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`);
          console.log('tokenId: ', tokenId);
          setMintCount(tokenId.toNumber() + 1);
        });
        console.log('Setup event listener!');
      }else{
        console.log("Ethereum object doesn't exist !");
      }
    }catch(error){
      console.log(error);
    }
  }

  const checkIfWalletIsConnected = async () => {
    // ユーザーがmetamaskを持っているか確認する
    const { ethereum } = window;
    if(!ethereum){
      console.log('Make sure you have MetaMask !');
      return;
    } else{
      console.log('We have the ethereum object', ethereum);
    }

    // 接続しようとしているチェーンを確認する
    // const chainId = await ethereum.request({ method: 'eth_chainId'});
    // console.log('connected to chainId: ', chainId);
    // const goerliChainId = '0x5';
    // if(goerliChainId === chainId){
    //   console.log('connected goerli chain');
    // }else{
    //   console.log('not goerli...')
    // }


    const accounts = await ethereum.request({ method: 'eth_accounts'});
    if(accounts.length !== 0){
      const account = accounts[0];
      console.log('Found on authorized account: ', account);
      setCurrentAccount(account);

      // 接続しているチェーンがgoerliかどうか確認する
      const chainId = await ethereum.request({ method: 'eth_chainId'});
      console.log('connected to chain: ', chainId);
      const goerliChainId = '0x5';
      if(chainId !== goerliChainId){
        alert('You are not connected to the goerli network');
      }

      // イベントリスナーの設定
      // この時点で、ユーザーはウォレット接続が済んでいます。
      setupEventListener();

      // mint数をコントラクトから取得する
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer,
      );
      const mintCount = await connectedContract.getMintCount();
      setMintCount(mintCount.toNumber());

    }else{
      console.log('No authorized account found');
    }

  };

  const connectWallet = async() => {
    try{
      const { ethereum } = window;
      if(!ethereum){
        alert('no have Metamask');
        return;
      }

      // connecting to MetaMask
      const accounts = await ethereum.request({ method: 'eth_requestAccounts'});
      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);

      // total mint数を取得
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        signer
      );
      const mintCount = await connectedContract.getMintCount();
      setMintCount(mintCount.toNumber());

      // イベントリスナーの設定
      setupEventListener();
    }catch(error){
      console.log(error);
    }
  }

  const askContractToMintNft = async() => {
    try{
      const { ethereum } = window;
      if(ethereum){
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log('Going to pop wallet now to pay gass...');
        let nftTxn = await connectedContract.makeAnEpicNFT();
        setMinting(true);

        console.log('Mining...please wait.');
        await nftTxn.wait();
        setMinting(false);
        console.log('nftTxn: ', nftTxn);

        console.log(`Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`);
      }else{
        console.log("Ethereum object doesn't exist!")
      };
    }catch(error){
      console.log(error);
    };
  };

  useEffect(async() => {
    checkIfWalletIsConnected();
    // const { ethereum } = window;
    // if(ethereum){
    //   const provider = new ethers.providers.Web3Provider(ethereum);
    //   const signer = provider.getSigner();
    //   const connectedContract = new ethers.Contract(
    //     CONTRACT_ADDRESS,
    //     myEpicNft.abi,
    //     signer
    //   );
    //   const mintCount = await connectedContract.getMintCount();
    //   setMintCount(mintCount.toNumber());
    //   // console.log('mintCount: ', mintCount.toNumber());
    // }else{
    //   console.log("Ethereum object doesn't exist!")
    // }
  },[])
  
  const renderNotConnectedContainer = () => {
    return(
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>
      Connect to Wallet
    </button>
    )
  };

  const renderMintUI = () => (
    <button className="cta-button connect-wallet-button" onClick={askContractToMintNft}>
      MintNFT
    </button>
  )

  return(
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">あなただけの特別な NFT をMintしよう💫</p>
          <p className='mint-count'>Mint数: {mintCount==null ? "-": mintCount} / 50</p>
          {/* メソッドを追加する
          //  すでに接続されている場合は、Connect to Walletを表示しない
          */}
          {currentAccount === '' ? (
            renderNotConnectedContainer()
          ):(
            renderMintUI()
          )}

          {minting? <p className='loading-text'>Minting...</p>: <p></p>}
        </div>
        <div className="footer-container">
          <div className='opensea-link'>
            <img src={openseaLogo} alt='OpenSea Logo' className='opensea-logo'/>
            <a
              className='footer-text'
              href={OPENSEA_LINK}
              target='_blank'
              rel='noreferrer'
            >OpenSea</a>
          </div>
          <div className='twitter-link'>
            <img src={twitterLogo} alt="Twitter Logo" className="twitter-logo"/>
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target='_blank'
              rel='noreferrer'
            >{`built on ${TWITTER_HANDLE}`}</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;