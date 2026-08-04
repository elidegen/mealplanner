export interface IIngredient {
  id: number;
  name: string;
  amount: number;
  unit: string;
  homeId: number;
  mealId: number;
}

export interface ITag {
  id: number;
  name: string;
  homeId: number;
}

export interface IMacros {
  id?: number;
  calories?: number;
  proteins?: number;
  carbs?: number;
  fat?: number;
}

export interface IListEntry {
  id?: number;
  name: string;
  amount: number;
  unit: string;
  list: string;
  homeId: number;
}
