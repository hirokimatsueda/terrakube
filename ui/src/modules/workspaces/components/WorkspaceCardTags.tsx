import getDeterministicColors from "@/modules/utils/getDeterministicColors";
import { Tag } from "antd";
import { WorkspaceListItem } from "@/modules/workspaces/types";
import { TagModel } from "@/modules/organizations/types";

type Props = {
  item: WorkspaceListItem;
  tags: TagModel[];
};

function lightenHex(hex: string, amount = 0.4): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`;
}

export default function WorkspaceCardTags({ item, tags }: Props) {
  if (item.tags === undefined) return null;

  return item.tags.map(({ tagId, value }) => {
    const c = getDeterministicColors(tagId);
    const tagName = tags.find((tg) => tg.id === tagId)?.name;

    if (!value) {
      return (
        <Tag style={{ backgroundColor: c.background, color: c.color, borderColor: "transparent" }} key={tagId}>
          {tagName}
        </Tag>
      );
    }

    return (
      <Tag
        key={tagId}
        style={{
          padding: 0,
          overflow: "hidden",
          borderColor: "transparent",
        }}
      >
        <span style={{ backgroundColor: c.background, color: c.color, padding: "0 7px", display: "inline-block" }}>
          {tagName}
        </span>
        <span
          style={{
            backgroundColor: lightenHex(c.background),
            color: c.color,
            borderLeft: "1px solid rgba(0,0,0,0.12)",
            padding: "0 7px",
            display: "inline-block",
          }}
        >
          {value}
        </span>
      </Tag>
    );
  });
}
