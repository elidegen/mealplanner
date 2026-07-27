export interface IIngredient {
  name: string;
  amount: string;
  homeId: number;
  mealId: number;
}

export interface ITag {
  id: number;
  name: string;
  homeId: number;
}

export interface IMacros {
  calories?: number;
  proteins?: number;
  carbs?: number;
  fat?: number;
}
