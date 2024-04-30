import { create } from "domain";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Address, WalletClient } from "viem";
import { useAccount, useWalletClient } from "wagmi";
import { createSmartAccountClient } from "@biconomy/account";

type SmartWalletContextProps = {
	ownerAddress: Address | null;
	smartAccountAddress: Address | null;
};

export const SmartWalletContext = createContext<SmartWalletContextProps>({
	ownerAddress: null,
	smartAccountAddress: null,
});

export const SmartWalletProvider = ({ children }: { children: ReactNode }) => {
	const [ownerAddress, setOwnerAddress] = useState<Address | null>(null);
	const [smartAccountAddress, setSmartAccountAddress] =
		useState<Address | null>(null);

    const account = useAccount();
    const { data: walletClient } = useWalletClient();

    useEffect(() => {
        
        const connectSmartWallet = async(walletClient: WalletClient) => {

            try {
                const smartAccount = await createSmartAccountClient({
                    signer: walletClient,
                    bundlerUrl: "https://bundler.biconomy.io/api/v2/11155111/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
                    biconomyPaymasterApiKey:process.env.NEXT_PUBLIC_BICONOMY_API_KEY
                })
                const smartAccountAddress = await smartAccount.getAddress();
                console.log("🚀 ~ connectSmartWal ~ smartAccountAddress:", smartAccountAddress)
                setSmartAccountAddress(smartAccountAddress);
                
            } catch (error) {
                console.error(error)
            }
        }
        
        if(account && account.isConnected) {
            setOwnerAddress(account.address?? null);
            if(walletClient) {
                connectSmartWallet(walletClient);
            }
        }
    }, [account, walletClient]);


	return (
		<SmartWalletContext.Provider value={{ ownerAddress, smartAccountAddress }}>
			{children}
		</SmartWalletContext.Provider>
	);
};
