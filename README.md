# KAIROS – A discipline & accountability platform powered by smart accounts  

## Overview  
**KAIROS** is an accountability and discipline platform built on programmable smart wallets powered by **Account Abstraction**.  

The core idea is simple: **users collateralize their goals with their own money.**  

- When a user creates a task, they lock funds into a smart wallet.  
- If the task is completed, the funds are returned.  
- If the task is not completed, the funds are either **delayed** for a set period or **redirected** to an accountability partner chosen by the user.  

This mechanism combines **incentives** and **consequences**, helping users stay consistent with their goals in ways traditional task managers and to-do apps cannot.  

---

## Why KAIROS?  
Modern productivity tools often fail because they lack real stakes.  

KAIROS introduces **skin in the game**, ensuring goals are backed by tangible commitment. Whether you’re learning a new skill, managing a packed schedule, or simply building better habits, KAIROS helps you stay accountable.  

---

### Demo Video


https://github.com/user-attachments/assets/4c2f3a7a-64c4-4afa-b124-19e30e442bd0




## Features  
- **Task Wallets** – Personal smart wallets for locking funds against goals.  
- **Accountability Partners** – Redirect uncompleted task funds to a trusted person.  
- **Automated Penalties & Rewards** – Programmable consequences for missed tasks.  
- **Gasless Onboarding** – Built on a cost-efficient blockchain with Account Abstraction for smooth UX.  

KAIROS is more than a task manager — it’s a **system of accountability** designed for individuals and teams who want to turn intentions into consistent action.  

---

## Tech Stack  
- **Contracts:** Solidity, Foundry, ERC-4337, EntryPoint  
- **Frontend:** Next.js, React, Tailwind, shadcn/ui  
- **Backend:** Django (faucet service)  
- **Infrastructure:** Base Sepolia, Pimlico, Privy  

---

## Current Status  
Originally, I planned to integrate the full Account Abstraction stack (bundlers + paymasters), but I ran into setup issues. To keep momentum, I hacked around it:  
- Interacted with the custom ERC-4337 wallet directly  
- Funded wallets manually through the faucet  
- Built the full task + penalty flow on top  

This means AA sponsorship mode is still in progress, but most of the core system is already working.  

---

### What’s Working Now  

✅ Smart wallet deployment  
✅ Wallet dashboard  
✅ Task creation + staking  
✅ Penalty triggers (Chainlink Automation)  
✅ Accountability buddy logic  
✅ Auto-funded wallets with social login  


---



---



## Contracts  
custom account factory: https://sepolia.basescan.org/address/0x5D16F29E70e90ac48C7F4fb2c1145911a774eFbF


task-manager: https://sepolia.basescan.org/address/0x43e0bc90661daf20c6ffbae1079d6e07e88e403a

---

## Roadmap  
- Full Account Abstraction integration with gasless sponsorship  
- UX/UI polish and mobile optimization  


---

## License  
MIT  

---

⚡ **KAIROS introduces real accountability by putting your money where your goals are.**  
