export interface IIngredient {
  name: string;
  amount: string;
}

export interface IMeal {
  title: string;
  calories?: number | null;
  ingredients: IIngredient[];
}
