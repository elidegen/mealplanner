import type { ITag } from "../../types/MealTypes";
import TagList from "../tag-list/TagList";
import IconAdd from "../../assets/img/icon_add.svg?react";
import { useState } from "react";

type Props = {
  tags: ITag[];
  addTag: (tag: ITag) => void;
  removeTag: (name: string) => void;
};

function TagInput({ tags, addTag, removeTag }: Props) {
  const [currentTag, setCurrentTag] = useState<string>("");

  function handleAddTag() {
    if (currentTag.trim() === "") return;
    const tag: ITag = {
      name: currentTag,
    };
    addTag(tag);
    setCurrentTag("");
  }

  return (
    <div className="input-wrapper">
      <label htmlFor="tag">Tags</label>
      <div className="add-wrapper">
        <input
          id="tag"
          type="text"
          placeholder="Enter tag"
          value={currentTag}
          onChange={(e) => setCurrentTag(e.target.value)}
        />
        <button className="icon-button" type="button" onClick={handleAddTag}>
          <IconAdd />
        </button>
      </div>
      {tags?.length > 0 && <TagList tags={tags} removeTag={removeTag} />}
    </div>
  );
}

export default TagInput;
