"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ethers } from "ethers";
import { connect } from "../../utils/ConnectMetamask";
import { abi } from "../../abi";

const CONTRACT_ADDRESS = "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3";
const ABI = abi; // Replace with actual ABI

const Login = () => {
  const [address, setAddress] = useState<string | null>(null);
  const [myContract, setMyContract] = useState<ethers.Contract | null>(null);

  const handleConnect = async () => {
    await connect(setAddress, setMyContract, CONTRACT_ADDRESS, ABI);
  };

  console.log("address, myContract", address, myContract);

  return (
    <div
      className="h-screen w-screen overflow-hidden relative"
      style={{
        backgroundImage: "url(/Login/bg.png)",
        backgroundSize: "100% 100%",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Title */}
      <motion.div
        className="flex w-full justify-center text-4xl sm:text-5xl md:text-6xl lg:text-8xl pt-10 sm:pt-16 md:pt-20"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <p className="text-black font-bold">Decentra-X Fnd</p>
      </motion.div>

      {/* Container for all elements */}
      <div className="absolute inset-0 flex flex-col items-center justify-end">
        {/* Trees */}
        <motion.div
          className="absolute bottom-0 right-0 w-1/2 sm:w-2/5 md:w-1/3 lg:w-1/4 max-w-96"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <img src="/Login/treees.png" alt="tree" className="w-full h-auto" />
        </motion.div>

        {/* Pathway & Board Section */}
        <div className="relative w-2/4 sm:w-1/3 md:w-1/4 lg:w-2/5 min-w-32 max-w-72 mb-0">
          {/* Pathway */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 50,
              damping: 15,
              delay: 0.3,
            }}
          >
            <img
              src="/Login/pathway.png"
              alt="pathway"
              className="w-full h-auto"
            />
          </motion.div>

          {/* Clickable Board - Connects to MetaMask */}
          <motion.img
            src="/Login/board.png"
            alt="board"
            className="absolute -top-full left-0 sm:left-1/4 md:-left-1/3 lg:-left-1/5 
             -translate-x-1/2 w-3/4 sm:w-4/5 md:w-6/7 max-w-72 cursor-pointer hover:scale-105 transition-all"
            initial={{
              opacity: 0,
              rotateX: 90,
              transformOrigin: "bottom center",
            }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 10,
              delay: 1,
            }}
            onClick={handleConnect} // Calls function on click
          />
        </div>

        {/* Sea Shells */}
        <motion.div
          className="absolute bottom-0 left-0 w-1/4 sm:w-1/5 md:w-1/6 max-w-32 min-w-16"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <img
            src="/Login/sea_shells.png"
            alt="sea shells"
            className="w-full h-auto"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
