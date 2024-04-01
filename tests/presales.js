const anchor = require('@project-serum/anchor');
const { Connection, PublicKey, SystemProgram, Account, Transaction, TransactionInstruction, sendAndConfirmTransaction } = require('@solana/web3.js');

// Read the program ID from somewhere, you should have it when deploying the program
const programId = new PublicKey('HE51UM7EXK13RDxCZvmcwsf18E4aGCZZRemq5qDKAaHh');

// Function to retrieve the token mint address
async function getTokenMintAddress() {
    // Initialize connection to the Solana Devnet
    const connection = new Connection('https://api.devnet.solana.com');

    // Fetch all accounts owned by the program
    const accounts = await connection.getProgramAccounts(programId);

    // Find the token mint account
    const tokenMintAccount = accounts.find(account => account.account.data.length >= 82);
    console.log(tokenMintAccount)
    if (tokenMintAccount) {
        // Extract the token mint address
        const tokenMintAddress = tokenMintAccount.pubkey.toString();
        return tokenMintAddress;
    } else {
        throw new Error('Token mint account not found');
    }
}

// Call the function and handle the result
getTokenMintAddress()
    .then(tokenMintAddress => {
        console.log('Token mint address:', tokenMintAddress);
        // Now you can use the token mint address in your frontend application
    })
    .catch(error => {
        console.error('Error:', error);
        // Handle errors gracefully in your frontend application
    });


// Initialize connection to the devnet cluster
// const provider = new anchor.Provider(
//   new anchor.Wallet("3s9c2UBdjAf5XPKhGdekzXokWs4Zcw7NHXshKwfYpAyegWoQmV5QfM1eZiis2yWcD8GxguKHx8QcPDjydmuDGftt"),
//   {
//     preflightCommitment: 'recent',
//   }
// );
// Connect to the Solana devnet
const connection = new Connection('https://api.devnet.solana.com');

// Wallet's private key
const walletPrivateKey = Uint8Array.from([13,4,21,104,1,32,55,180,18,139,62,48,192,135,64,155,181,117,120,77,166,1,147,143,93,28,217,223,91,157,99,59,172,149,149,94,193,29,125,236,155,20,2,11,78,198,38,35,149,5,45,220,55,250,57,53,202,107,166,245,19,62,94,6]);

async function initializeToken() {
    // Generate keypair from private key
    const wallet = new Account(walletPrivateKey);

    // Generate a new token mint account
    const tokenMintAccount = new Account();

    // Initialize token mint instruction
    const instructions = [
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,
            newAccountPubkey: tokenMintAccount.publicKey,
            space: 8+8,
            lamports: 0.2,
            programId
        }),
    ];

    // Create and sign transaction
    const transaction = new Transaction().add(...instructions);
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
    transaction.sign(wallet, tokenMintAccount);

    // Send transaction
    const signature = await connection.sendTransaction(transaction, [wallet]);

    // Confirm transaction
    await connection.confirmTransaction(signature);
    console.log('Token initialized successfully.');
    console.log('Token Mint Address:', tokenMintAccount.publicKey.toString());
}

initializeToken();