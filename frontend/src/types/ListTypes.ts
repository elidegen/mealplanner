import type { IIngredient } from "../pages/add-meal/MealTypes";

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
  id: number;
  title: string;
  ingredients: IIngredient[];
  calories?: number;
  image?: string;
}

export interface IUser {
  id: string;
  name: string;
  rights: "Admin" | "User";
  img?: string;
}
