import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function WalletConnect() {
	const [address, setAddress] = useState(null);
	const [network, setNetwork] = useState(null);
	const [error, setError] = useState(null);

	const connectWallet = async () => {
		if (!window.ethereum) {
			setError("🦊 Please install MetaMask to connect.");
			return;
		}

		try {
			const provider = new ethers.BrowserProvider(window.ethereum);
			const accounts = await provider.send('eth_requestAccounts', []);
			const network = await provider.getNetwork();

			setAddress(accounts[0]);
			setNetwork(network.name);

			if (network.chainId !== BigInt(11155111)) {
				setError('⛔ Wrong network. Please switch to Sepolia.');
			} else {
				setError(null);
			}
		} catch (err) {
			setError(`❌ Error: ${err.message}`);
		}
	};

	useEffect(() => {
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', () => window.location.reload());
			window.ethereum.on('chainChanged', () => window.location.reload());
		}
	}, []);

	return (
		<div className="w-full max-w-md p-6 bg-white rounded-2xl shadow text-center space-y-2">

			{address ? (
				<>
					<p className="text-green-700 font-semibold mb-2">✅ Wallet connected</p>
					<p className="font-mono text-sm text-center">
                    {address ? `${address.slice(0, 10)}...${address.slice(-10)}` : ''}
                    </p>

					<p className="text-xs text-gray-600 mb-2">Network: {network}</p>
					{error && <p className="text-red-600 text-sm mt-2">{error}</p>}
				</>
			) : (
				<button
					onClick={connectWallet}
					className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					🔗 Connect Wallet
				</button>
			)}
		</div>
	);
}

export default WalletConnect;
