import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Banknote,
  Smartphone,
  User,
  CheckCircle,
  Receipt
} from "lucide-react";

export default function PaymentModal({ isOpen, onClose, total, onComplete, cart, customer }) {
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [cashReceived, setCashReceived] = useState("");
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = [
    { id: "cash", label: "Cash", icon: Banknote, color: "from-green-500 to-green-600" },
    { id: "card", label: "Card", icon: CreditCard, color: "from-blue-500 to-blue-600" },
    { id: "mobile", label: "Mobile Pay", icon: Smartphone, color: "from-purple-500 to-purple-600" },
    { id: "loyalty_points", label: "Loyalty Points", icon: User, color: "from-amber-500 to-amber-600" }
  ];

  const handleComplete = async () => {
    setIsProcessing(true);
    await onComplete({
      method: selectedMethod,
      cashReceived: selectedMethod === "cash" ? parseFloat(cashReceived) || 0 : total,
      notes
    });
    setIsProcessing(false);
    setCashReceived("");
    setNotes("");
  };

  const change = selectedMethod === "cash" ?
    Math.max(0, (parseFloat(cashReceived) || 0) - total) : 0;

  const canComplete = selectedMethod !== "cash" ||
    (parseFloat(cashReceived) || 0) >= total;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Process Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-medium text-slate-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Items ({cart.length})</span>
                <span>${(total / 1.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tax (10%)</span>
                <span>${(total * 0.1 / 1.1).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="text-base font-medium mb-3 block">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <motion.button
                  key={method.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedMethod === method.id
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-10 h-10 mx-auto mb-2 bg-gradient-to-r ${method.color} rounded-lg flex items-center justify-center`}>
                    <method.icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{method.label}</p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cash Payment Input */}
          {selectedMethod === "cash" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-3"
            >
              <Label htmlFor="cash-received">Cash Received</Label>
              <Input
                id="cash-received"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={cashReceived}
                onChange={(e) => setCashReceived(e.target.value)}
                className="text-lg"
              />
              {cashReceived && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-green-700">Change to give:</span>
                    <span className="font-bold text-green-900">
                      ${change.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this transaction..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={!canComplete || isProcessing}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isProcessing ? (
                "Processing..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Sale
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}