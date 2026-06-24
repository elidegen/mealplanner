export interface IListItem {
  id: string;
  name: string;
  amount?: string;
  checked: boolean;
}

export interface SettingsItem {
  id: string;
  icon?: React.FC;
  name: string;
  link: string;
}

export interface IMeal {
  title: string;
  ingredients: string[];
  image?: string;
}

export interface IUser {
  id: string;
  name: string;
  rights: "Admin" | "User";
  img?: string;
}
