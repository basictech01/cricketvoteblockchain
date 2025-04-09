# 🏏 CricketVoteCrypto

**CricketVoteCrypto** is a Web3-powered IPL prediction platform where users participate in match-based prediction questions and earn **CVT (Cricket Vote Token)** as rewards. It merges the thrill of fantasy cricket with the transparency and security of blockchain to create a gamified, community-driven experience.

---

## 🚀 Live Demo

Coming soon...

---

## 📜 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Scripts](#scripts)
- [Screenshots](#screenshots)
- [License](#license)

---

## 📖 About

This DApp enables users to:

- Connect with MetaMask wallet
- Earn CVT tokens
- Participate in IPL match prediction questions
- Claim rewards securely using Merkle tree proofs

All data is decentralized and trustless thanks to Ethereum smart contracts deployed on the **Sepolia Testnet**.

---

## ✨ Features

### ✅ Web3 Wallet Integration

Users connect via MetaMask and get an initial airdrop of **10 CVT tokens** to participate in predictions.

### 🎯 Prediction Questions

Admins create time-bound prediction questions for each IPL match. Users vote using CVT tokens before the deadline.

### 🧾 Merkle-Based Reward Distribution

Winning users are compiled into a Merkle tree. Only the root is stored on-chain, and users claim rewards by submitting Merkle proofs — saving gas and maintaining security.

### 📊 User Dashboard

Users can track:

- Total predictions
- Pending/won/lost predictions
- Overall & per-match accuracy

### 🔐 Admin Panel

Admins can:

- Create/edit questions
- Mark answers post-match
- Generate Merkle tree and push root to the contract

---

## 🛠 Tech Stack

| Layer         | Tech                          |
|---------------|-------------------------------|
| Frontend      | Next.js, Tailwind CSS         |
| Blockchain    | Solidity (ERC-20 + Merkle)    |
| Wallet Auth   | MetaMask                      |
| Backend DB    | MongoDB                       |
| Network       | Sepolia Ethereum Testnet      |

---

## 📦 Getting Started

### 🧑‍💻 Prerequisites

- Node.js v18+
- MetaMask Extension
- MongoDB running locally or remotely
- Sepolia ETH for test transactions

### 📥 Installation

```bash
git clone https://github.com/yourusername/CricketVoteCrypto.git
cd CricketVoteCrypto
npm install
