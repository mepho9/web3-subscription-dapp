# 🧾 Web3 Subscription DApp

A modern decentralized subscription platform powered by **Ethereum** and **ERC-20 tokens**, allowing users to subscribe or extend access via a custom M9 token.

> 💡 This dApp uses [web3-m9-token](https://github.com/mepho9/web3-m9-token) as the payment token for subscriptions.

---

## ✨ Features

- ✅ Wallet connection via MetaMask (Sepolia testnet)
- 🔒 Subscription management via smart contracts
- ⏳ Automatic expiration & renewal logic
- 💰 Dynamic pricing using the ERC-20 M9 Token
- 🧾 Approval & allowance checks before subscription
- 📈 Real-time transaction tracking via [Tenderly](https://tenderly.co/)
- 🎨 Sleek UI with React + TailwindCSS

---

## 🔧 Tech Stack

| Layer         | Tools / Frameworks                       |
|--------------|-------------------------------------------|
| **Frontend**  | React, TailwindCSS, Vite, Ethers.js, MetaMask                   |
| **Smart Contracts**   | Solidity, Hardhat, OpenZeppelin (ERC20, AccessControl), TypeChain              |
| **Monitoring** | Tenderly                                |
| **Network**    | Ethereum Sepolia Testnet                |

---

## 📁 Project Structure

web3-subscription-dapp/
├── frontend/                       # Frontend (React + Tailwind)
│   ├── src/
│   │   ├── abi/                    # Contract ABIs (M9Token + SubscriptionManager)
│   │   ├── components/             # UI components (WalletConnect, SubscriptionPanel)
│   │   ├── constants/              # Constants like contract addresses
│   │   ├── hooks/                  # Custom React hooks for web3 interactions
│   │   └── ...
│   └── ...
│
├── smart-contracts/                 Hardhat-based Solidity contracts
│   ├── contracts/                  # Subscription logic contract
│   ├── scripts/                    # Deployment scripts
│   ├── test/                       # Unit tests for SubscriptionManager
│   ├── .env.example          # Example .env config for Sepolia
│   └── ...
│
└── README.md                 # You're reading it 📘

---

## 💰 About the M9 Token

The [web3-m9-token](https://github.com/mepho9/web3-m9-token) is a custom ERC-20 token used as the payment method for subscriptions.

- 🔐 Users must approve the SubscriptionManager contract
- 🧾 Subscriptions cost a fixed amount of M9 tokens
- 🔁 Tokens are non-custodial (you retain wallet control)

---

## 📲 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/mepho9/web3-subscription-dapp.git
cd web3-subscription-dapp
```

### 2. Install frontend dependencies

```bash
cd frontend
npm install
npm run dev
```

### 3. Setup Hardhat & Deploy Contracts

```bash
cd ../smart-contracts
npm install
npx hardhat compile
npx hardhat deploy --network sepolia
```

> ⚠️ A `.env.example` file is provided — duplicate it as `.env` and replace the values accordingly.

```env
SEPOLIA_RPC_URL=...
PRIVATE_KEY=...
```

---

## 📦 Dependecies

All required packages (e.g. TailwindCSS, Ethers.js, OpenZeppelin contracts) are already listed in the package.json of each subproject. Just run `npm install` in both `frontend/` and `smart-contracts/`.

#### Frontend major deps:
- react
- vite
- ethers
- tailwindcss

#### Smart-contracts major deps:
- hardhat
- @openzeppelin/contracts
- dotenv

---

## 🧪 Tenderly Monitoring

Subscription events are monitored with [Tenderly](https://tenderly.co/)

- ✅ Successful transactions
- ❌ Failed subscriptions
- ⏰ Subscription expiration alerts

---

## 👤 User Flow

1. User connects their wallet via MetaMask

2. The dApp checks if they're already subscribed

3. If not:

    - The user approves the token spending

    - Clicks "Subscribe"

    - Transaction is sent, confirmed and monitored

4. UI displays remaining days and expiration date

---

## 🔗 Deployed Contract

- Network: Sepolia Testnet
- Contract Address: [`0x7e993Bb37E63d0b0B47A8558afD407200d4446E5`](https://sepolia.etherscan.io/address/0x7e993Bb37E63d0b0B47A8558afD407200d4446E5)

---

## 🌍 Related Projects

1. web3-m9-token – ERC-20 token used in this dApp for subscriptions
2. Github : https://github.com/mepho9/web3-m9-token

---

## 📄 License

MIT, Free to use for any purpose. Attribution appreciated.

---

### 👨‍💻 Author

**Mepho9**  
- GitHub: [@mepho9](https://github.com/mepho9)  
- LinkedIn: [rbabayev9](https://www.linkedin.com/in/rbabayev9/)

---
