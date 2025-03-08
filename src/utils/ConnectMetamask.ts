import { ethers } from "ethers";

// Ensure `window.ethereum` is available
declare global {
  interface Window {
    ethereum?: any;
  }
}

async function connectToMetamask(): Promise<boolean> {
  try {
    if (!window.ethereum) {
      alert("MetaMask is not installed!");
      return false;
    }

    await window.ethereum.request({ method: "eth_requestAccounts" });
    return true;
  } catch (err) {
    console.error("MetaMask connection error:", err);
    return false;
  }
}

async function changeNetwork(): Promise<void> {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0xa869" }], // Avalanche Fuji Testnet
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0xa869",
              chainName: "Avalanche Fuji Testnet",
              nativeCurrency: {
                name: "Avalanche",
                symbol: "AVAX",
                decimals: 18,
              },
              rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
            },
          ],
        });
      } catch (addError) {
        alert("Error adding Avalanche Fuji Testnet");
        console.error(addError);
      }
    } else {
      console.error("Error switching network:", switchError);
    }
  }
}

export async function connect(
  setAddress: (address: string) => void,
  setMyContract: (contract: ethers.Contract) => void,
  CONTRACT_ADDRESS: string,
  abi: any
): Promise<void> {
  if (!window.ethereum) {
    alert("MetaMask is not installed!");
    return;
  }

  const res = await connectToMetamask();
  if (res) {
    await changeNetwork();

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAddress(address);

      const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
      setMyContract(contract);
    } catch (err) {
      alert("Error setting up contract or retrieving account details.");
      console.error(err);
    }
  } else {
    alert("Couldn't connect to MetaMask.");
  }
}
