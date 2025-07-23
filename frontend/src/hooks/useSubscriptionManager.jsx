import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import SubscriptionManagerAbi from '../abi/SubscriptionManager.json';
import { SUBSCRIPTION_MANAGER_ADDRESS } from '../constants/addresses';

// Use the imported constant address
const CONTRACT_ADDRESS = SUBSCRIPTION_MANAGER_ADDRESS;

export default function useSubscriptionManager(signer) {
	const [contract, setContract] = useState(null);

	useEffect(() => {
		if (signer) {
			const instance = new ethers.Contract(CONTRACT_ADDRESS, SubscriptionManagerAbi, signer);
			setContract(instance);
		}
	}, [signer]);

	const checkSubscription = async (userAddress) => {
		if (!contract) return false;
		return await contract.isSubscribed(userAddress);
	};

	const getRemaining = async (userAddress) => {
		if (!contract) return 0;
		const remaining = await contract.getRemainingTime(userAddress);
		return Number(remaining);
	};

	const subscribe = async () => {
	if (!contract) return
	try {
		console.log("Calling subscribe...")
		const tx = await contract.subscribe()
		await tx.wait()
		console.log("Subscribe success")
	} catch (error) {
		console.error("Subscription failed:", error)
		throw error 
		}
	}

	const getSubscriptionFee = async () => {
		if (!contract) return 0;
		const fee = await contract.subscriptionFee();
		return Number(fee);
	};

	const getExpiration = async (userAddress) => {
		if (!contract) return null;
		const expiresAt = await contract.subscriptionExpiresAt(userAddress);
		return Number(expiresAt);
	};

	const getPrice = async () => {
		if (!contract) return null;
		const fee = await contract.subscriptionFee();
		return fee;
	};

	const setAutoRenew = async (enabled) => {
		if (!contract) return;
		const tx = await contract.setAutoRenew(enabled);
		await tx.wait();
	};

	const getAutoRenew = async (userAddress) => {
		if (!contract) return false;
		return await contract.autoRenewEnabled(userAddress);
	};

	return {
		checkSubscription,
		getRemaining,
		getSubscriptionFee,
		subscribe,
		contract,
		getExpiration,
		getPrice,
		setAutoRenew,
		getAutoRenew
	};
	
}
