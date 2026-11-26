import { useState } from "react";
import { useAction, useResource } from "./api.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveWatchlist,
  createWatchlist,
  updateWatchlist,
  deleteWatchlist,
} from "../redux/slices/watchlistSlice.js";
import {
  selectActiveWatchlist,
  selectWatchlists,
} from "../redux/selectors/index.js";

export function useWatchlists() {
  const query = useResource("/trading/watchlists");
  const action = useAction();
  const dispatch = useDispatch();
  const setActive = (id) => dispatch(setActiveWatchlist(id));
  const [notice, setNotice] = useState("");
  const items = useSelector(selectWatchlists);
  const list = useSelector(selectActiveWatchlist);
  async function update(symbols, name = list.name) {
    await action.mutateAsync({
      path: "/trading/watchlists/" + list.id,
      thunk: updateWatchlist,
      method: "PUT",
      body: { name, symbols },
    });
  }
  async function create(name) {
    const created = await action.mutateAsync({
      path: "/trading/watchlists",
      thunk: createWatchlist,
      body: { name },
    });
    setActive(created.id);
    setNotice("Watchlist created.");
  }
  async function rename(name) {
    await update(list.symbols, name);
    setNotice("Watchlist renamed.");
  }
  async function add(symbol) {
    if (!list || list.symbols.includes(symbol)) return;
    await update([...list.symbols, symbol]);
    setNotice(symbol + " added to " + list.name + ".");
  }
  async function remove(symbol) {
    await update(list.symbols.filter((item) => item !== symbol));
    setNotice(symbol + " removed from " + list.name + ".");
  }
  async function move(symbol, direction) {
    const next = [...list.symbols],
      from = next.indexOf(symbol),
      to = from + direction;
    if (from < 0 || to < 0 || to >= next.length) return;
    [next[from], next[to]] = [next[to], next[from]];
    await update(next);
    setNotice("Stock order updated.");
  }
  async function deleteList() {
    await action.mutateAsync({
      path: "/trading/watchlists/" + list.id,
      thunk: deleteWatchlist,
      method: "DELETE",
    });
    setActive(null);
    setNotice("Watchlist deleted.");
  }
  function select(id) {
    setActive(id);
    setNotice("");
    action.reset();
  }
  return {
    query,
    items,
    list,
    notice,
    busy: action.isPending,
    error: action.error,
    select,
    create,
    rename,
    add,
    remove,
    move,
    deleteList,
    clearNotice: () => {
      setNotice("");
      action.reset();
    },
  };
}
