import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import axios from "axios";
import { useSignMessage, useAccount, useWalletClient } from "wagmi";
import { useState, useContext } from "react";
import { SmartWalletContext } from "../context/smart-wallet";
import { createSmartAccountClient } from "@biconomy/account";
import { Address, parseEther } from "viem";
import { gql, request } from "graphql-request";

const firebaseAuthUrl =
	"http://localhost:5001/colledge-tutorial/us-central1/signInWithEthereum";

const Home: NextPage = () => {
	const [authToken, setAuthToken] = useState<string>("");
	const account = useAccount();
	const { signMessageAsync } = useSignMessage();
	const { data: walletClient } = useWalletClient();

	const { ownerAddress, smartAccountAddress } = useContext(SmartWalletContext);

	const handleSignature = async () => {
		console.log("Signing in with Ethereum");
		const message = "Sign in to Colledge App";
		try {
			if (!account) throw new Error("No account found");
			console.log("🚀 ~ account:", account);
			const signature = await signMessageAsync({ message });
			console.log("🚀 ~ handleSignature ~ signature:", signature);

			const response = await axios.post(firebaseAuthUrl, {
				address: account.address,
				signature,
			});
			console.log("🚀 ~ handleSignature ~ response:", response);
			setAuthToken(response.data.token);
		} catch (error) {
			console.error(error);
		}
	};

	const sendTx = async () => {
		console.log("Sending ETH without gas fees");

		try {
			if (!walletClient || !account)
				throw new Error("No wallet client or account found");

			const smartAccount = await createSmartAccountClient({
				signer: walletClient,
				bundlerUrl:
					"https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
				biconomyPaymasterApiKey: process.env.NEXT_PUBLIC_BICONOMY_API_KEY,
			});

			const toAddress = account.address as Address; // Replace with the recipient's address
			const transactionData = "0x"; // Replace with the actual transaction data

			// Build the transaction
			const tx = {
				to: toAddress,
				data: transactionData,
				value: parseEther("0.01"),
			};

			const txs = [tx, tx];

			const userOpResponse = await smartAccount.sendTransaction(txs);
			const { transactionHash } = await userOpResponse.waitForTxHash();
			console.log("Transaction Hash", transactionHash);

			const userOpReceipt = await userOpResponse.wait();
			if (userOpReceipt.success == "true") {
				console.log("UserOp receipt", userOpReceipt);
				console.log("Transaction receipt", userOpReceipt.receipt);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const fetchDataFromUniswap = async () => {
		console.log("Fetching data from Uniswap");

		const uri = `https://gateway-arbitrum.network.thegraph.com/api/${process.env.NEXT_PUBLIC_THE_GRAPH_API_KEY}/subgraphs/id/5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV`;

		const query = gql`
			{
				swaps {
					amountUSD
					id
					sender
					recipient
					token0 {
						symbol
						name
					}
					timestamp
					token1 {
						symbol
						name
					}
				}
			}
		`;

		const response = await request(uri, query);
		console.log("🚀 ~ fetchDataFromUniswap ~ response:", response)
	};

	return (
		<div className={styles.container}>
			<Head>
				<title>RainbowKit App</title>
				<meta
					content="Generated by @rainbow-me/create-rainbowkit"
					name="description"
				/>
				<link href="/favicon.ico" rel="icon" />
			</Head>

			<main className={styles.main}>
				<ConnectButton />

				<h1 className="text-3xl font-bold underline my-10">
					Welcome to the Colledge App
				</h1>

				{account.isConnected && (
					<div>
						<h2>ownerAddress: {ownerAddress}</h2>
						<h2>smartAccountAddress: {smartAccountAddress}</h2>
						<button
							onClick={handleSignature}
							className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
						>
							Sign In With Ethereum
						</button>
						<br />
						<button
							onClick={sendTx}
							className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
						>
							Send ETH withouth gas fees
						</button>
						<br />
						<button
							onClick={fetchDataFromUniswap}
							className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
						>
							Fetch Data from Uniswap
						</button>
					</div>
				)}
			</main>
		</div>
	);
};

export default Home;
