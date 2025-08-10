import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { User, UserPlus, Check } from "lucide-react";

export default function CustomerSelector({ customers, selectedCustomer, onSelectCustomer }) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-48 justify-start">
          <User className="w-4 h-4 mr-2" />
          {selectedCustomer ? (
            <span className="truncate">{selectedCustomer.name}</span>
          ) : (
            "Select Customer"
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0">
        <Command>
          <CommandInput placeholder="Search customers..." />
          <CommandList>
            <CommandEmpty>No customers found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                onSelect={() => {
                  onSelectCustomer(null);
                  setOpen(false);
                }}
              >
                <User className="w-4 h-4 mr-2" />
                Walk-in Customer
                {!selectedCustomer && <Check className="ml-auto w-4 h-4" />}
              </CommandItem>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  onSelect={() => {
                    onSelectCustomer(customer);
                    setOpen(false);
                  }}
                >
                  <User className="w-4 h-4 mr-2" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{customer.name}</div>
                    <div className="text-xs text-slate-500 truncate">
                      {customer.email || customer.phone || 'No contact info'}
                    </div>
                  </div>
                  {selectedCustomer?.id === customer.id && (
                    <Check className="ml-2 w-4 h-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}