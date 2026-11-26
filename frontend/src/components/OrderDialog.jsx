import { useEffect, useRef, useState } from "react";
import { useCatalog, useMarket } from "../hooks/useMarket.js";
import { Result } from "./Common.jsx";
import { OrderTicket } from "./OrderTicket.jsx";
import { InstrumentPicker } from "./InstrumentPicker.jsx";
export function OrderDialog({ ticket, account, onClose }) {
  const dialog = useRef(null);
  const [symbol, setSymbol] = useState(ticket.symbol);
  const [pick, setPick] = useState(false);
  const catalog = useCatalog();
  const market = useMarket([symbol]);
  const current = { ...market, data: market.data?.[0] };
  useEffect(() => {
    const previous = document.activeElement;
    dialog.current.showModal();
    return () => previous?.focus();
  }, []);
  return (
    <dialog
      ref={dialog}
      className="trade-dialog"
      aria-label="Portfolio order"
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) onClose();
      }}
    >
      <div className="line-item">
        <h2>Trade from portfolio</h2>
        <button
          type="button"
          className="button secondary"
          onClick={onClose}
          aria-label="Close order"
        >
          Close
        </button>
      </div>
      <div className="line-item">
        <strong>{symbol}</strong>
        <button
          type="button"
          className="button secondary"
          onClick={() => setPick(!pick)}
        >
          {pick ? "Hide stock search" : "Change stock"}
        </button>
      </div>
      {pick && (
        <InstrumentPicker
          catalog={catalog}
          selected={symbol}
          onSelect={(next) => {
            setSymbol(next);
            setPick(false);
          }}
          autoFocus
        />
      )}
      <Result query={current}>
        {(instrument) => (
          <OrderTicket
            key={symbol}
            instrument={instrument}
            account={account}
            initialSide={ticket.side}
          />
        )}
      </Result>
    </dialog>
  );
}
