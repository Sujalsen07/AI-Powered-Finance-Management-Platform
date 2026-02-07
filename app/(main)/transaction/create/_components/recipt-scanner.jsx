"use client";

import { scanReceipt } from "@/actions/transaction";
import { Button } from "@/components/ui/button";
import useFetch from "@/hooks/use-fetch";
import { Camera, Loader2 } from "lucide-react";
import React, { useRef } from "react";

const ReciptScanner = ({onScanComplete}) => {
    const fileInputRef = useRef();

    const {
        loading: scanReceiptLoading,
        fn: scanReceiptFn,
        data: scannedData,
    } = useFetch(scanReceipt);

    const handleReceiptScan=()=> {};

    return (
    <div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" capture="environment" onChange={(e) => {
            const file = e.target.files?.[0];
            if(file) handleReceiptScan(file);
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