# Palchemy

A cryptocurrency payment platform that makes sending and receiving crypto as easy as sending an email. Built with Alchemy Account Kit smart wallets and Turnkey's secure infrastructure.

## ✨ Features

- **Email-like payments**: Send crypto to anyone with just an email address
- **No wallet required**: Recipients can claim payments without existing crypto wallets
- **Smart wallet integration**: Email, passkey & social login using Account Kit
- **Secure escrow system**: Temporary escrow wallets using Turnkey infrastructure
- **Gasless transactions**: Sponsored transactions for seamless user experience
- **Blockchain transparency**: All transactions verifiable on Arbitrum Sepolia
- **Modern UI**: TailwindCSS + shadcn/ui components, React Query, TypeScript

## 🌐 Network

This application runs on **Arbitrum Sepolia** testnet.

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd palchemy-demo
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory and add the following environment variables:

```bash
# Alchemy Configuration
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key
NEXT_PUBLIC_ALCHEMY_POLICY_ID=your_alchemy_gas_policy_id

# Turnkey Configuration
TURNKEY_API_PUBLIC_KEY=your_turnkey_public_key
TURNKEY_API_PRIVATE_KEY=your_turnkey_private_key
TURNKEY_ORGANIZATION_ID=your_turnkey_organization_id
```

#### Required API Keys

| Variable                        | Purpose                                          | How to Get                                                                                |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ALCHEMY_API_KEY`   | Alchemy API key for blockchain interactions      | Create an app in [Alchemy Dashboard](https://dashboard.alchemy.com/apps)                  |
| `NEXT_PUBLIC_ALCHEMY_POLICY_ID` | Gas sponsorship policy for free transactions     | Set up in [Gas Manager](https://dashboard.alchemy.com/services/gas-manager/configuration) |
| `TURNKEY_API_PUBLIC_KEY`        | Turnkey public key for escrow wallet management  | Generated in [Turnkey Dashboard](https://app.turnkey.com/)                                |
| `TURNKEY_API_PRIVATE_KEY`       | Turnkey private key for escrow wallet management | Generated with public key in Turnkey Dashboard                                            |
| `TURNKEY_ORGANIZATION_ID`       | Your Turnkey organization identifier             | Found in [Turnkey Dashboard](https://app.turnkey.com/)                                    |

### 3. Alchemy Setup

1. **Create an Alchemy Account**: Sign up at [alchemy.com](https://www.alchemy.com/)
2. **Create a New App**:
   - Go to [Alchemy Dashboard](https://dashboard.alchemy.com/apps)
   - Click "Create App"
   - Choose "Arbitrum Sepolia" as the network
   - Copy your API key
3. **Set up Smart Wallets**:
   - Navigate to [Smart Wallets Configuration](https://dashboard.alchemy.com/services/smart-wallets/configuration)
   - Enable email, passkey, and social login methods
4. **Configure Gas Sponsorship**:
   - Go to [Gas Manager](https://dashboard.alchemy.com/services/gas-manager/configuration)
   - Create a new policy for Arbitrum Sepolia
   - Copy the Policy ID

### 4. Turnkey Setup

1. **Create a Turnkey Account**: Sign up at [turnkey.com](https://www.turnkey.com/)
2. **Set up Organization**:
   - Complete the organization setup in [Turnkey Dashboard](https://app.turnkey.com/)
   - Note your Organization ID
3. **Generate API Keys**:
   - In the Turnkey dashboard, create a new API key pair
   - Download both the public and private keys
   - **Important**: Store the private key securely - it cannot be recovered

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start using Palchemy!

## 🗂 Project Layout

```
app/
├── api/turnkey/           # Turnkey API routes for escrow management
├── claim/[token]/         # Claim page for payment recipients
├── components/            # React components
├── hooks/                 # Custom React hooks
└── page.tsx              # Main payment interface

components/ui/             # shadcn/ui primitives
lib/
├── alchemy.ts            # Alchemy SDK configuration
├── turnkey.ts            # Turnkey escrow management
├── constants.ts          # Contract addresses and ABIs
└── types/                # TypeScript type definitions

config.ts                 # Account Kit + Gas Sponsorship setup
```

## 🏗️ How Palchemy Works

### Payment Flow

1. **Sender Login**: User authenticates via email, passkey, or social login using Account Kit
2. **Payment Creation**:
   - User enters recipient email and amount
   - Palchemy creates a secure escrow wallet using Turnkey
   - Funds are transferred to the escrow wallet
3. **Claim Link Generation**: A secure claim link is generated with encrypted payment data
4. **Recipient Experience**:
   - Recipient clicks the claim link
   - They can see payment details and escrow wallet on blockchain
   - After login, funds transfer to their new smart wallet
   - Escrow wallet is securely deleted

### Key Technologies

- **Account Kit**: Provides smart wallets with social login
- **Turnkey**: Secure key management for temporary escrow wallets
- **Arbitrum Sepolia**: Layer 2 network for fast, cheap transactions
- **Gas Sponsorship**: Palchemy covers transaction fees for smooth UX

## 🚀 Usage

1. **Send a Payment**:

   - Log in to Palchemy at [http://localhost:3000](http://localhost:3000)
   - Enter recipient email and amount
   - Click "Continue" to create escrow and generate claim link
   - Share the claim link with your recipient

2. **Receive a Payment**:
   - Click the claim link you received
   - View payment details and verify escrow on blockchain
   - Log in to create/access your smart wallet
   - Claim the payment to transfer funds to your wallet

## 🔧 Development

### Available Scripts

```bash
npm run dev     # Start development server
npm run build   # Production build
npm run start   # Run production build
npm run lint    # Lint code
```

### Testing

To test the payment flow:

1. Create a payment with a test email
2. Copy the generated claim link
3. Open the claim link in an incognito window
4. Complete the claim process

## 📚 Documentation & Resources

- [Alchemy Account Kit Documentation](https://www.alchemy.com/docs/wallets/react/overview)
- [Turnkey Documentation](https://docs.turnkey.com/)
- [Arbitrum Sepolia Explorer](https://sepolia.arbiscan.io/)

## 🔒 Security

### ⚠️ **CRITICAL SECURITY WARNING FOR PRODUCTION USE**

**This demo application is designed for educational purposes and contains intentional security simplifications to demonstrate the payment flow transparently. DO NOT use this pattern in production without implementing proper security measures.**

### 🚨 **Claim Link Security Issues (DEMO ONLY)**

**The current implementation has intentional security vulnerabilities for educational clarity:**

- **Sensitive data exposure**: Claim links contain unencrypted private keys, wallet addresses, and transaction details in the URL
- **Clear text transmission**: All sensitive information is transmitted in the clear through URLs
- **No access control**: Anyone with the claim link can view and potentially claim the payment
- **Browser history exposure**: Sensitive data persists in browser history, server logs, and referrer headers
- **Network exposure**: URLs with sensitive data can be logged by proxies, CDNs, and network infrastructure

### 🔐 **Production Security Requirements**

For a production cryptocurrency payment system, you **MUST** implement:

#### **Secure Claim Link Architecture:**

- **Server-side session management**: Store sensitive data server-side with secure session tokens
- **Database encryption**: Encrypt all sensitive data at rest using industry-standard encryption
- **Access control**: Implement proper authentication and authorization for claim access
- **HTTPS everywhere**: Ensure all communication is encrypted in transit
- **Token expiration**: Implement time-limited access tokens with automatic expiration
- **Rate limiting**: Prevent brute force attacks on claim endpoints

#### **Key Management:**

- **Hardware Security Modules (HSMs)**: Use HSMs for private key generation and storage
- **Key rotation**: Implement regular key rotation policies
- **Minimal privilege**: Limit key access to only necessary operations
- **Audit logging**: Comprehensive logging of all key operations

#### **Additional Security Measures:**

- **Multi-factor authentication**: Require MFA for sensitive operations
- **IP allowlisting**: Restrict access based on IP addresses where appropriate
- **Fraud detection**: Implement real-time fraud monitoring and alerts
- **Compliance**: Ensure compliance with relevant financial regulations (AML/KYC)
- **Security audits**: Regular security audits and penetration testing
- **Incident response**: Comprehensive incident response procedures

### 🏗️ **Infrastructure Security**

- All escrow wallets are managed by Turnkey's secure infrastructure
- Private keys are never exposed to the application frontend
- All transactions are verifiable on the Arbitrum Sepolia blockchain
- Escrow wallets are automatically deleted after successful claims
- **Production requirement**: Implement proper secret management and environment isolation

## 🛂 License

MIT
