import { useEffect, useRef, useState } from "react";
import TagList from "../tag-list/TagList";
import type { ITag } from "../../types/MealTypes";
import LoadingSpinner from "../loading-spinner/LoadingSpinner";
import { apiFetch } from "../../auth/api";
import { useAuth } from "../../auth/AuthContext";
import Snackbar from "../snackbar/Snackbar";
import { useHome } from "../../home/HomeContext";

type Props = {
  selectedTags: ITag[];
  updateSelectedTags: (tags: ITag[]) => void;
};

function FilterPanel({ selectedTags, updateSelectedTags }: Props) {
  const { token } = useAuth();
  const { activeHome } = useHome();
  const [allTags, setAllTags] = useState<ITag[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    id: number;
    text: string;
    color: string;
  } | null>(null);
  const snackbarId = useRef(0);

  useEffect(() => {
    if (!activeHome) return;
    async function fetchTags() {
      setLoading(true);
      try {
        const res = await apiFetch(`/api/tags?homeId=${activeHome!.id}`, {
          method: "GET",
          token,
        });
        setAllTags(res as ITag[]);
      } catch (err) {
        console.log("err", err);

        setSnackbar({
          id: ++snackbarId.current,
          text: "Failed to load tags",
          color: "#dc2626",
        });
      } finally {
        setLoading(false);
      }
    }
    fetchTags();
  }, [token, activeHome]);

  return (
    <>
      <TagList
        selected={selectedTags}
        updateSelected={updateSelectedTags}
        tags={allTags}
      />
      <LoadingSpinner visible={loading} />
      {snackbar && (
        <Snackbar
          key={snackbar.id}
          text={snackbar.text}
          color={snackbar.color}
          duration={3000}
        />
      )}
    </>
  );
}

export default FilterPanel;
