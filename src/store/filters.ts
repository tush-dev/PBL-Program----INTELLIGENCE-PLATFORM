import { create } from "zustand";
import type { FilterParams } from "@/types";

interface FilterState extends FilterParams {
  setMonth: (month: string) => void;
  setDistrict: (district: string) => void;
  setBlock: (block: string) => void;
  setGrade: (grade: string) => void;
  setSubject: (subject: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  month: "",
  district: "",
  block: "",
  grade: "",
  subject: "",
  setMonth: (month) => set({ month }),
  setDistrict: (district) => set({ district, block: "" }),
  setBlock: (block) => set({ block }),
  setGrade: (grade) => set({ grade }),
  setSubject: (subject) => set({ subject }),
  resetFilters: () =>
    set({ month: "", district: "", block: "", grade: "", subject: "" }),
}));
