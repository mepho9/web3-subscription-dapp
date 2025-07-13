import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import M9TokenAbi from '../abi/M9Token.json'
import { SUBSCRIPTION_MANAGER_ADDRESS, M9TOKEN_FEE_ADDRESS } from '../constants/addresses'

// M9Token address
const TOKEN_ADDRESS = M9TOKEN_FEE_ADDRESS
// Contract that will be allowed to spend the tokens
const SPENDER = SUBSCRIPTION_MANAGER_ADDRESS

export default function useM9Token(signer) {
	const [contract, setContract] = useState(null)

	useEffect(() => {
		if (signer) {
			const instance = new ethers.Contract(TOKEN_ADDRESS, M9TokenAbi, signer)
			setContract(instance)
		}
	}, [signer])

	const approve = async (amount) => {
		if (!contract) return
		try {
			const tx = await contract.approve(SPENDER, ethers.parseUnits(amount, 18))
			await tx.wait()
		} catch (error) {
			console.error("Approval failed:", error)
			throw error
		}
	}

	return {
		approve,
		contract,
	}
}