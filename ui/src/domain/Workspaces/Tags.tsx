import { Button, Input, Select, Space, Tag } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import axiosInstance from "../../config/axiosConfig";
import { Tag as TagType, ApiWorkspaceTag } from "../types";
import getDeterministicColors from "@/modules/utils/getDeterministicColors";

function lightenHex(hex: string, amount = 0.4): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r + (255 - r) * amount)}, ${Math.round(g + (255 - g) * amount)}, ${Math.round(b + (255 - b) * amount)})`;
}

type Props = {
  organizationId: string;
  workspaceId: string;
  manageWorkspace: boolean;
};

const GUID_REGEX = /[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}/i;

function isGuid(value: string) {
  return GUID_REGEX.test(value);
}

export const Tags = ({ organizationId, workspaceId, manageWorkspace }: Props) => {
  const [orgTags, setOrgTags] = useState<TagType[]>([]);
  const [currentTags, setCurrentTags] = useState<ApiWorkspaceTag[]>([]);
  const [newKey, setNewKey] = useState<string>("");
  const [newValue, setNewValue] = useState<string>("");
  const [keySearch, setKeySearch] = useState<string>("");
  const [adding, setAdding] = useState(false);

  const keyOptions = useMemo(() => {
    const options = orgTags.map((t) => ({ label: t.attributes.name, value: t.id }));
    // When a new (non-UUID) key is staged, add it as a selectable option so the Select shows it
    if (newKey && !isGuid(newKey) && !orgTags.some((t) => t.attributes.name === newKey)) {
      options.push({ label: newKey, value: newKey });
    }
    return options;
  }, [orgTags, newKey]);

  const hasExactKeyMatch = useMemo(() => {
    if (!keySearch) return true;
    return orgTags.some((t) => t.attributes.name.toLowerCase() === keySearch.toLowerCase());
  }, [orgTags, keySearch]);

  const addTagToWorkspace = (tagId: string, value: string) => {
    const body = {
      data: {
        type: "workspacetag",
        attributes: {
          tagId,
          ...(value ? { value } : {}),
        },
      },
    };
    axiosInstance
      .post(`organization/${organizationId}/workspace/${workspaceId}/workspaceTag`, body, {
        headers: { "Content-Type": "application/vnd.api+json" },
      })
      .then((response) => {
        setCurrentTags((prev) => [...prev, response.data.data]);
        setNewKey("");
        setNewValue("");
        setKeySearch("");
        setAdding(false);
      });
  };

  const createNewTagAndAdd = (tagName: string, value: string) => {
    const body = {
      data: { type: "tag", attributes: { name: tagName } },
    };
    axiosInstance
      .get(`organization/${organizationId}/tag`, {
        params: { "filter[tag]": `name==${tagName}` },
      })
      .then((res) => {
        const existingId = res.data?.data[0]?.id;
        if (existingId) {
          addTagToWorkspace(existingId, value);
        } else {
          axiosInstance
            .post(`organization/${organizationId}/tag`, body, {
              headers: { "Content-Type": "application/vnd.api+json" },
            })
            .then((createRes) => {
              const newTag = createRes.data?.data;
              setOrgTags((prev) => [...prev, newTag]);
              addTagToWorkspace(newTag.id, value);
            });
        }
      });
  };

  const handleAdd = () => {
    if (!newKey) return;
    setAdding(true);
    if (isGuid(newKey)) {
      addTagToWorkspace(newKey, newValue);
    } else {
      createNewTagAndAdd(newKey, newValue);
    }
  };

  const handleRemove = (workspaceTagId: string) => {
    axiosInstance
      .delete(`organization/${organizationId}/workspace/${workspaceId}/workspaceTag/${workspaceTagId}`)
      .then(() => {
        setCurrentTags((prev) => prev.filter((t) => t.id !== workspaceTagId));
      });
  };

  const loadTags = () => {
    axiosInstance.get(`organization/${organizationId}/workspace/${workspaceId}/workspaceTag`).then((response) => {
      setCurrentTags(response.data.data ?? []);
      axiosInstance.get(`organization/${organizationId}/tag`).then((res) => {
        setOrgTags(res.data.data ?? []);
      });
    });
  };

  useEffect(() => {
    loadTags();
  }, [workspaceId]);

  const isKeyAlreadyAdded = (key: string) => {
    if (isGuid(key)) return currentTags.some((t) => t.attributes.tagId === key);
    const tagId = orgTags.find((t) => t.attributes.name === key)?.id;
    return tagId ? currentTags.some((t) => t.attributes.tagId === tagId) : false;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, minHeight: 24 }}>
        {currentTags.map((wt) => {
          const tagName = orgTags.find((t) => t.id === wt.attributes.tagId)?.attributes.name ?? wt.attributes.tagId;
          const c = getDeterministicColors(wt.attributes.tagId);
          const tagValue = wt.attributes.value;

          if (!tagValue) {
            return (
              <Tag
                key={wt.id}
                closable={manageWorkspace}
                onClose={() => handleRemove(wt.id)}
                style={{ backgroundColor: c.background, color: c.color, borderColor: "transparent" }}
              >
                {tagName}
              </Tag>
            );
          }

          return (
            <Tag
              key={wt.id}
              closable={manageWorkspace}
              onClose={() => handleRemove(wt.id)}
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
                {tagValue}
              </span>
            </Tag>
          );
        })}
      </div>
      {manageWorkspace && (
        <Space.Compact style={{ width: "100%" }}>
          <Select
            showSearch
            placeholder="Key"
            style={{ flex: "1 1 40%" }}
            options={keyOptions}
            value={newKey || undefined}
            onSearch={(val) => {
              setKeySearch(val);
            }}
            onChange={(val) => {
              setNewKey(val);
              setKeySearch("");
            }}
            filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
            dropdownRender={(menu) => (
              <>
                {menu}
                {keySearch && !hasExactKeyMatch && (
                  <div
                    style={{ padding: "4px 12px", cursor: "pointer", color: "#1677ff" }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setNewKey(keySearch);
                      setKeySearch("");
                    }}
                  >
                    <PlusOutlined /> Create &quot;{keySearch}&quot;
                  </div>
                )}
              </>
            )}
          />
          <Input
            placeholder="Value (optional)"
            style={{ flex: "1 1 40%" }}
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onPressEnter={handleAdd}
          />
          <Button
            type="primary"
            onClick={handleAdd}
            loading={adding}
            disabled={!newKey || isKeyAlreadyAdded(newKey)}
          >
            Add
          </Button>
        </Space.Compact>
      )}
    </div>
  );
};
