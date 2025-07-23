import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import useSubscriptionManager from '../hooks/useSubscriptionManager';
import useM9Token from '../hooks/useM9Token';
import { SUBSCRIPTION_MANAGER_ADDRESS } from '../constants/addresses';

export default function SubscriptionPanel() {
	const [signer, setSigner] = useState(null);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [remainingTime, setRemainingTime] = useState(null);
	const [expirationDate, setExpirationDate] = useState(null);
	const [price, setPrice] = useState(null);
	const [autoRenew, setAutoRenew] = useState(false);
	const [autoRenewMessage, setAutoRenewMessage] = useState('');
	
	useEffect(() => {
		const init = async () => {
			if (window.ethereum) {
				const provider = new ethers.BrowserProvider(window.ethereum);
				const signer = await provider.getSigner();
				setSigner(signer);
			}
		};
		init();
	}, []);

	const { subscribe, checkSubscription, getRemaining, getExpiration, getPrice, setAutoRenew: updateAutoRenew, getAutoRenew } = useSubscriptionManager(signer);
	const { approve, contract: m9Contract } = useM9Token(signer);

	useEffect(() => {
		if (!signer) return;
		const fetchData = async () => {
			const userAddress = await signer.getAddress();
			const [subscribed, remaining, expiresAt, fee, autoRenewStatus] = await Promise.all([
				checkSubscription(userAddress),
				getRemaining(userAddress),
				getExpiration(userAddress),
				getPrice(),
				getAutoRenew(userAddress)

			]);

			setIsSubscribed(subscribed);
			setRemainingTime(remaining);
			setExpirationDate(new Date(expiresAt * 1000));
			setPrice(fee != null ? ethers.formatUnits(fee, 18) : null);
			setAutoRenew(autoRenewStatus);
			

		};
		fetchData();
	}, [signer]);

	const refreshSubscriptionData = async () => {
		if (!signer) return;
		const userAddress = await signer.getAddress();
		const [subscribed, remaining, expiresAt] = await Promise.all([
			checkSubscription(userAddress),
			getRemaining(userAddress),
			getExpiration(userAddress)
		]);

		setIsSubscribed(subscribed);
		setRemainingTime(remaining);
		setExpirationDate(new Date(expiresAt * 1000));
	};

	const handleSubscribe = async () => {
		try {
			if (!signer) throw new Error('No signer found');
			const userAddress = await signer.getAddress();

			const allowance = await m9Contract.allowance(userAddress, SUBSCRIPTION_MANAGER_ADDRESS);
			console.log('➡️ Current allowance:', allowance.toString());

			await approve("10"); // Approve 10 M9 tokens
			await subscribe();

			await refreshSubscriptionData();
			alert('Subscription successful ✅');
		} catch (err) {
			console.error('Subscription error', err);
			alert('Subscription failed ❌');
		}
	};

	const formatRemaining = (seconds) => {
		if (seconds == null) return '';
		const days = Math.floor(seconds / (3600 * 24));
		return `${days}d left`;
	};

	const formatDate = (date) => {
		if (!date) return '';
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const handleAutoRenewChange = async (e) => {
	const newValue = e.target.checked;
	setAutoRenew(newValue);

	try {
		await updateAutoRenew(newValue);
		setAutoRenewMessage("Auto-renew updated ✅");

		setTimeout(() => {
			setAutoRenewMessage('');
		}, 3000);
	} catch (err) {
		console.error("Failed to update auto-renew:", err);
		alert("Failed to update auto-renew setting ❌");
	}
};



return (
	<div className="p-6 bg-white rounded-2xl shadow-lg w-full text-black space-y-6">
		<h2 className="text-2xl font-bold text-center">Subscription Panel</h2>

		<div className="flex items-center justify-center text-lg space-x-2">
			<span>💰</span>
			<span className="font-medium">Price:</span>
			<span>{price ? `${price} M9` : '...'}</span>
		</div>

		<div className="w-full">
			<button
				onClick={handleSubscribe}
				disabled={!signer}
				className={`w-full py-3 px-6 rounded-lg font-semibold transition duration-200 ${
					isSubscribed
						? 'bg-gray-300 text-gray-600 cursor-not-allowed'
						: 'bg-green-600 hover:bg-green-700 text-white'
				}`}
			>
				{isSubscribed ? 'Extend Subscription' : `Subscribe (${price} M9)`}
			</button>
		</div>

		{isSubscribed && (
			<div className="pt-4 border-t border-gray-200 text-center text-sm text-gray-700 space-y-1">
				<div>{formatRemaining(remainingTime)}</div>
				<div className="text-xs text-gray-500">
					Ends on: {formatDate(expirationDate)}
				</div>
			</div>
		)}

		<div className="flex items-center space-x-2 pt-2">
		<input
	type="checkbox"
	id="autoRenew"
	checked={autoRenew}
	onChange={handleAutoRenewChange}
	className="w-4 h-4"
/>
<label htmlFor="autoRenew" className="text-sm text-gray-700">
	Resubscribe automatically each month?
</label>

{autoRenewMessage && (
	<p className="text-green-600 text-sm pt-1">{autoRenewMessage}</p>
)}

		</div>

	</div>
);


}
