import type { ITag } from "../../pages/add-meal/MealTypes";
import IconClose from "../../assets/img/icon_close.svg?react";
import "./TagList.css";

type Props = {
  tags: ITag[];
  removeTag?: (name: string) => void;
};

function TagList({ tags, removeTag }: Props) {
  return (
    <div className="tag-wrapper">
      {tags.map((tag) => (
        <div className="tag" key={tag.name}>
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
