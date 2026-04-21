import { create } from "zustand";
import { getCategories } from "../api/campaignService";

let categoriesPromise = null; 

const useCategoryStore = create((set, get) => ({
  categories: [],
  selectedCategory: null,
  loading: false,

  isFetchedCategories: false,

  fetchCategories: async () => {
    const { isFetchedCategories } = get();

    if (isFetchedCategories) return;

    if (categoriesPromise) return categoriesPromise;

    set({ loading: true });

    categoriesPromise = getCategories();

    try {
      const res = await categoriesPromise;

      set({
        categories: res,
        loading: false,
        isFetchedCategories: true, 
      });
    } catch (err) {
      console.error("Lỗi fetch categories:", err);
      set({ loading: false });
    } finally {
      categoriesPromise = null;
    }
  },

  setSelectedCategory: (id) => {
    set({ selectedCategory: id });
  },
}));

export default useCategoryStore;