"use client";

import { scanReceipt } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Camera, Loader2 } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { toast } from "sonner";

const ReciptScanner = ({onScanComplete}) => {
    const fileInputRef = useRef();

    const {
        loading: scanReceiptLoading,
        fn: scanReceiptFn,
        data: scannedData,
    } = useFetch(scanReceipt);

    const fileToBase64 = (file) =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const result = reader.result;
                const base64 = typeof result === "string" ? result.split(",")[1] : null;
                resolve(base64 || "");
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleReceiptScan = async (file) => {
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size should be less than 5MB");
            return;
        }
        const imageBase64 = await fileToBase64(file);
        if (!imageBase64) {
            toast.error("Could not read image file");
            return;
        }
        await scanReceiptFn({ imageBase64, mimeType: file.type || "image/jpeg" });
    };

    useEffect(() => {
        if (scannedData && !scanReceiptLoading) {
            console.log("Receipt data from scan:", scannedData);
            onScanComplete(scannedData);
            toast.success("Receipt scanned successfully");
        }
    }, [scanReceiptLoading, scannedData, onScanComplete]);

    return (
    <div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleReceiptScan(file);
            e.target.value = "";
        }}
        />
         <Button
        type="button"
        variant="outline"
        className="w-full h-10 bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
      >
        {scanReceiptLoading ? (
          <>
            <Loader2 className="mr-2 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Camera className="mr-2" />
            <span>Scan Receipt with AI</span>
          </>
        )}
      </Button>
    </div>
    );
};

export default ReciptScanner;