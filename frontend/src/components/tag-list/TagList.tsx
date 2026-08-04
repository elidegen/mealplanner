import type { ITag } from "../../pages/add-meal/MealTypes";
import IconClose from "../../assets/img/icon_close.svg?react";
import "./TagList.css";

type Props = {
  tags: ITag[];
  removeTag?: (name: string) => void;
  selected?: ITag[];
  updateSelected?: (selected: ITag[]) => void;
};

function TagList({ tags, removeTag, selected, updateSelected }: Props) {
  function isSelected(name: string): boolean {
    return selected?.some((t) => t.name === name) ?? false;
  }

  function getClassName(name: string): string {
    return isSelected(name) ? "selected tag" : "tag";
  }

  function handleSelectTag(tag: ITag) {
    if (!updateSelected || !selected) return;
    // immer ein neues Array - nur so erkennt React die Änderung
    const next = isSelected(tag.name)
      ? selected.filter((t) => t.name !== tag.name)
      : [...selected, tag];
    updateSelected(next);
  }

  return (
    <div className="tag-wrapper">
      {tags.map((tag) => (
        <div
          className={getClassName(tag.name)}
          key={tag.name}
          onClick={() => handleSelectTag(tag)}
        >
          <p>{tag.name}</p>
          {removeTag && (
            <IconClose
              className="icon-close"
              onClick={() => removeTag(tag.name)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default TagList;
