"use client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { addToast } from "@heroui/toast";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Select, SelectSection, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@/context/AuthContext";
import countryStateData from "@/lib/countryStateData";
export default function AddressModal({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [existing, setExisting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("USA");
  const [zip, setZip] = useState("");
  const [notes, setNotes] = useState("");
  const [countryList, setCountryList] = useState<string[]>([]);
  const [stateList, setStateList] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const ref = doc(db, "users", user.uid, "data", "address");
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const d = snap.data()!;
        setLine1(d.row1);
        setCity(d.city);
        setState(d.state);
        setCountry(d.country);
        setZip(d.zip);
        setNotes(d.notes);
        setExisting(true);
      }
    })();
  }, [user]);

  // populate country dropdown once
  useEffect(() => {
    setCountryList(Object.keys(countryStateData));
  }, []);

  // whenever country changes, update states (or clear if none)
  useEffect(() => {
    const opts = countryStateData[country] || [];
    setStateList(opts);
    if (!opts.includes(state)) setState("");
  }, [country]);

  const save = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const ref = doc(db, "users", user.uid, "data", "address");
      await setDoc(
        ref,
        {
          row1: line1,
          city,
          state,
          zip,
          country,
          notes,
        },
        { merge: true },
      );
      addToast({
        title: existing ? "Address updated" : "Address added",
        description: "Your primary address has been saved.",
        color: "success",
      });
      onClose();
    } catch (e: any) {
      addToast({
        title: "Error saving address",
        description: e.message,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="flex flex-col gap-2 bg-white dark:bg-darkaccent p-6 rounded w-full mx-8 sm:mx-0 sm:w-2/3 md:w-1/2">
        <div className="flex w-full justify-between items-center">
          <h3 className="text-lg">Add Address</h3>
          <button
            onClick={onClose}
            className="button-grow text-gray-600 transition-colors duration-300 dark:text-textaccent hover:text-black dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2">
          <Select
            labelPlacement="inside"
            label="Country"
            placeholder="Country"
            selectedKeys={new Set([country])}
            onSelectionChange={(sel) => setCountry(sel.currentKey as string)}
            classNames={{
              trigger:
                "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
              popoverContent: "rounded-sm",
            }}
          >
            {countryList.map((c) => (
              <SelectItem key={c}>{c}</SelectItem>
            ))}
          </Select>
          {stateList.length > 0 && (
            <Select
              labelPlacement="inside"
              label="State"
              placeholder="State"
              selectedKeys={new Set([state])}
              onSelectionChange={(sel) => setState(sel.currentKey as string)}
              classNames={{
                trigger:
                  "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
                popoverContent: "rounded-sm",
              }}
            >
              {stateList.map((s) => (
                <SelectItem key={s}>{s}</SelectItem>
              ))}
            </Select>
          )}
        </div>
        <Input
          labelPlacement="inside"
          label="Street Number"
          placeholder="Street Number"
          value={line1}
          onChange={(e) => setLine1(e.target.value)}
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-2">
          <Input
            labelPlacement="inside"
            label="City"
            placeholder="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            classNames={{
              inputWrapper:
                "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
            }}
          />
          <Input
            labelPlacement="inside"
            label={country === "USA" ? "ZIP Code" : "Postal Code"}
            placeholder={country === "USA" ? "ZIP Code" : "Postal Code"}
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            classNames={{
              inputWrapper:
                "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
            }}
          />
        </div>
        <Input
          labelPlacement="inside"
          label="Notes"
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          classNames={{
            inputWrapper:
              "rounded-sm border bg-transparent border-black/30 dark:border-textaccent/30",
          }}
        />
        <Button
          className="w-full py-2 px-6 border bg-transparent border-black/30 dark:border-textaccent/30 text-center button-grow-subtle rounded-sm"
          onPress={onClose}
        >
          Cancel
        </Button>
        <Button
          onPress={save}
          className="w-full py-2 px-6 bg-dark1 dark:bg-white button-grow-subtle text-white dark:text-black transition-color duration-300 rounded-sm"
        >
          {existing ? "Update" : "Save"}
        </Button>
      </div>
    </div>
  );
}
