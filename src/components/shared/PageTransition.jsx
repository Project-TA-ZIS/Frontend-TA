import React from 'react';
import { motion } from 'framer-motion';

// 👇 Kita simpan ke variabel baru agar ESLint bisa mendeteksinya dengan jelas
const MotionDiv = motion.div;

export default function PageTransition({ children }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="h-full"
    >
      {children}
    </MotionDiv>
  );
}