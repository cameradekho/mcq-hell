import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export const Footer = () => {
  return (
    <motion.footer
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 text-center"
    >
      <p>&copy; {new Date().getFullYear()} All rights reserved.</p>
      <div className="flex justify-center space-x-6 mt-2">
        <Link href="/privacy" className="hover:text-gray-200 transition">
          Privacy Policy
        </Link>
        <Link href="/terms" className="hover:text-gray-200 transition">
          Terms of Service
        </Link>
        <Link href="/contact" className="hover:text-gray-200 transition">
          Contact
        </Link>
      </div>
    </motion.footer>
  );
};
