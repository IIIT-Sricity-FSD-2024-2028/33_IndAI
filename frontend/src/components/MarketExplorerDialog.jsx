import { useEffect, useRef } from "react";
import { TradingSidebar } from "./TradingSidebar.jsx";
import { Icon } from "./Icon.jsx";

export function MarketExplorerDialog({
  open,
  onClose,
  catalog,
  selected,
  onSelect,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <dialog
      ref={ref}
      className="market-explorer-dialog"
      aria-label="Stock explorer"
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) {
          const box = ref.current.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="explorer-dialog-top">
        <span>STOCKS & WATCHLISTS</span>
        <button type="button" className="button secondary" onClick={onClose}>
          <Icon name="close" size={16} />
          Back to chart
        </button>
      </div>
      <TradingSidebar
        catalog={catalog}
        selected={selected}
        onSelect={onSelect}
        visible={open}
      />
    </dialog>
  );
}
