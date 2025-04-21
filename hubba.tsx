"use client";
import React, { useState } from "react";
import QRcode from "qrcode";
import Image from "next/image";

export default function Home() {
  const [url, setUrl] = useState("");
  const [src, setSrc] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateQr = async () => {
    try {
      setIsLoading(true);
      // Get a random URL from the API
      const response = await fetch("/api/get-random-url");
      const randomUrl = await response.json();

      if (!randomUrl) {
        console.error("No URL returned from API");
        return;
      }

      // Generate QR code from the random URL
      const qrData = await QRcode.toDataURL(randomUrl);

      // Update state with new values
      setSrc(qrData);
      setUrl(randomUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-start justify-items-center min-h-screen pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
      <main className="h-[290px] flex flex-col gap-8 row-start-2 items-center justify-between">
        <span className="text-xl font-medium text-neutral-200">
          {isLoading ? "Loading..." : url || "Click to generate a QR code"}
        </span>

        {src && (
          <Image
            src={src}
            alt="QR Code"
            width={200}
            height={200}
            className="w-36 h-36 object-contain"
          />
        )}

        <div className="flex gap-4">
          <button
            onClick={generateQr}
            className="bg-neutral-200 text-neutral-900 rounded-full px-4 py-2 font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Generating..." : "Generate Random QR"}
          </button>
        </div>
      </main>
    </div>
  );
}
