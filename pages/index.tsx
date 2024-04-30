import { ConnectButton } from "@rainbow-me/rainbowkit";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import axios from "axios";
import { useSignMessage, useAccount } from "wagmi";
import { useState } from "react";

const firebaseAuthUrl = "http://localhost:5001/colledge-tutorial/us-central1/signInWithEthereum"

const Home: NextPage = () => {
  const [authToken, setAuthToken] = useState<string>("")

  const account = useAccount()
  const { signMessageAsync } = useSignMessage()

  
	const handleSignature = async () => {

    console.log("Signing in with Ethereum");
    const message = "Sign in to Colledge App"
    try {
      if(!account) throw new Error("No account found")
        console.log("🚀 ~ account:", account)
        const signature = await signMessageAsync({message})
        console.log("🚀 ~ handleSignature ~ signature:", signature)

        const response = await axios.post(firebaseAuthUrl,{
          address: account.address,
          signature
        })
        console.log("🚀 ~ handleSignature ~ response:", response)
        setAuthToken(response.data.token)
    } catch (error) {
      console.error(error)
    }
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

				<button
					onClick={handleSignature}
					className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
				>
					Sign In With Ethereum
				</button>
			</main>
		</div>
	);
};

export default Home;
