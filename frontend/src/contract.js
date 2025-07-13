import { ethers } from "ethers";
import abi from "./abi/SubscriptionManager.json"; // 👈 On ajoutera ça juste après
import { SUBSCRIPTION_MANAGER_ADDRESS } from '../constants/addresses';

// Use the imported constant address
const CONTRACT_ADDRESS = SUBSCRIPTION_MANAGER_ADDRESS;

// This function returns a connected contract instance
export const getContract = async () => {
	if (!window.ethereum) throw new Error("MetaMask not installed");

	const provider = new ethers.BrowserProvider(window.ethereum);
	const signer = await provider.getSigner();
	const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);

	return contract;
};
