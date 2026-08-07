import { Link } from "react-router-dom";
import type { SettingsItem } from "../../types/ListTypes";
import IconHouse from "../../assets/img/icon_house.svg?react";
import IconUsers from "../../assets/img/icon_users.svg?react";
import IconChevronRight from "../../assets/img/icon_chevron_right.svg?react";
import "./Settings.css";

const DUMMY_SETTINGS: SettingsItem[] = [
  { id: "1", icon: IconHouse, name: "Change Home", link: "/home" },
  { id: "3", icon: IconUsers, name: "Users", link: "/users" },
];

function Settings() {
  return (
    <div className="settings-selection">
      {DUMMY_SETTINGS.map((setting) => (
        <Link key={setting.id} className="setting-link" to={setting.link}>
          <div className="setting-icon">{setting.icon && <setting.icon />}</div>
          <h2 className="setting-name">{setting.name}</h2>
          <IconChevronRight />
        </Link>
      ))}
    </div>
  );
}

export default Settings;
