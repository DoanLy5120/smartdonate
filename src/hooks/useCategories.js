import { useEffect } from "react";
import useCategoryStore from "../store/categoryStore";

export default function useCategories() {
  const categories = useCategoryStore((s) => s.categories);

  useEffect(() => {
    useCategoryStore.getState().fetchCategories();
  }, []);

  return { categories };
}