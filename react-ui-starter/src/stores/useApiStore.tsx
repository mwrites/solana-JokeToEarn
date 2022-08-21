import create, { State } from "zustand";
import { defaultApiVersion, defaultUseAnchor } from '../utils/config';

// @ts-ignore
interface ApiStore extends State {
  useAnchor: boolean;
  useVersion: string;
}

const useApiStore = create<ApiStore>((set, _get) => ({
  useAnchor: defaultUseAnchor,
  useVersion: defaultApiVersion,
  setUseAnchor: (v) => set(s => ({ useAnchor: v})),
  setUseVersion: (v) => set(s => ({ useVersion: v})),
}));

export default useApiStore;