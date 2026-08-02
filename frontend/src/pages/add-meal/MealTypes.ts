export interface IMeal {
  name: string;
  macros: IMacros | null;
  ingredients: IIngredient[];
  tags: ITag[];
  portions: number;
  instructions?: string;
  public: boolean;
}

export interface IIngredient {
  name: string;
  amount: string;
}

export interface ITag {
  name: string;
}

export interface IMacros {
  calories: number | null;
  proteins: number | null;
  carbs: number | null;
  fat: number | null;
}
