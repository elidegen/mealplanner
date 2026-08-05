// export interface IHome {
//   id          Int           @id @default(autoincrement())
//   name        String
//   password    String
//   users       HomeMembership[]
//   meals       Meal[]
//   listEntrys  ListEntry[]
//   tags        Tag[]
//   ingredients Ingredient[]
// }
// }
export interface IHome {
  id: number;
  name: string;
  role: string;
  joinCode?: string;
}
