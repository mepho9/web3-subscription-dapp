// App.jsx
import WalletConnect from './components/WalletConnect';
import SubscriptionPanel from './components/SubscriptionPanel';

export default function App() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
			<div className="flex flex-col items-center space-y-10 py-10 w-full max-w-md">
				<WalletConnect />
				<SubscriptionPanel />
			</div>
		</div>
	);
}
