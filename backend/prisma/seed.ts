import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";

// Demo-Daten fuer den ersten Start. Der Seed laeuft bei jedem Container-Start,
// bricht aber ab, sobald schon Daten existieren - eigene Aenderungen bleiben
// dadurch ueber Neustarts hinweg erhalten.

// Einladungscode aus dem Alphabet von generateJoinCode() (ohne I, O, 0, 1).
// Fest statt zufaellig, damit er in der README stehen kann.
const JOIN_CODE = "PLANER";
const PASSWORT = "test1234";

async function main() {
  const vorhandene = await prisma.user.count();
  if (vorhandene > 0) {
    console.log(
      `Seed uebersprungen: Datenbank enthaelt bereits ${vorhandene} Nutzer.`,
    );
    return;
  }

  // Gleiche Kostenstufe wie in der Registrierung (auth.routes.ts)
  const passwordHash = await bcrypt.hash(PASSWORT, 12);

  const admin = await prisma.user.create({
    data: { email: "test@mealplanner.de", name: "Test User", passwordHash },
  });
  const mitglied = await prisma.user.create({
    data: { email: "mitglied@mealplanner.de", name: "Mitbewohner", passwordHash },
  });

  // Der Einladungscode liegt im Feld `password` - siehe homes.routes.ts.
  // Er darf nie leer sein, sonst ueberschreibt ihn backfillJoinCodes() beim Start.
  const home = await prisma.home.create({
    data: {
      name: "Demo-WG",
      password: JOIN_CODE,
      users: {
        create: [
          { userId: admin.id, role: "admin", lastLogin: new Date() },
          { userId: mitglied.id, role: "user", lastLogin: new Date() },
        ],
      },
    },
  });

  // Tags sind pro Home eindeutig (@@unique auf name + homeId)
  const tagNamen = ["Vegetarisch", "Schnell", "Meal Prep", "Pasta"];
  const tags = new Map<string, number>();
  for (const name of tagNamen) {
    const tag = await prisma.tag.create({ data: { name, homeId: home.id } });
    tags.set(name, tag.id);
  }

  // Zutaten haengen direkt am Meal und brauchen zusaetzlich das Home.
  // Auch hier die Beziehungs-Schreibweise, weil sie verschachtelt angelegt werden.
  const zutat = (name: string, amount: number, unit: string) => ({
    name,
    amount,
    unit,
    home: { connect: { id: home.id } },
  });

  await prisma.meal.create({
    data: {
      name: "Spaghetti Bolognese",
      portions: 4,
      public: false,
      // Verschachtelte Writes (macros/ingredients/tags) erzwingen die
      // Beziehungs-Schreibweise - ein blosses homeId waere hier ungueltig.
      home: { connect: { id: home.id } },
      instructions:
        "Zwiebeln wuerfeln und in Olivenoel glasig duensten. Hackfleisch dazugeben und krauemelig braten. Mit den passierten Tomaten abloeschen und 20 Minuten koecheln lassen. Spaghetti nach Packungsangabe kochen und untermischen.",
      macros: { create: { calories: 620, carbs: 68, proteins: 32, fat: 22 } },
      tags: { connect: [{ id: tags.get("Pasta")! }] },
      ingredients: {
        create: [
          zutat("Spaghetti", 500, "g"),
          zutat("Hackfleisch", 400, "g"),
          zutat("Passierte Tomaten", 400, "ml"),
          zutat("Zwiebel", 2, "Stueck"),
          zutat("Olivenoel", 2, "EL"),
          // Menge 0: begrenzt die Portionsberechnung bewusst nicht
          zutat("Salz", 0, "Prise"),
        ],
      },
    },
  });

  await prisma.meal.create({
    data: {
      name: "Linsen-Curry",
      portions: 3,
      public: false,
      // Verschachtelte Writes (macros/ingredients/tags) erzwingen die
      // Beziehungs-Schreibweise - ein blosses homeId waere hier ungueltig.
      home: { connect: { id: home.id } },
      instructions:
        "Zwiebel anschwitzen, Currypaste kurz mitroesten. Linsen und Kokosmilch zugeben und 15 Minuten koecheln lassen, bis die Linsen weich sind.",
      macros: { create: { calories: 480, carbs: 52, proteins: 19, fat: 18 } },
      tags: {
        connect: [
          { id: tags.get("Vegetarisch")! },
          { id: tags.get("Meal Prep")! },
        ],
      },
      ingredients: {
        create: [
          zutat("Rote Linsen", 250, "g"),
          zutat("Kokosmilch", 400, "ml"),
          zutat("Currypaste", 2, "EL"),
          zutat("Zwiebel", 1, "Stueck"),
        ],
      },
    },
  });

  await prisma.meal.create({
    data: {
      name: "Ofengemuese mit Feta",
      portions: 2,
      public: false,
      // Verschachtelte Writes (macros/ingredients/tags) erzwingen die
      // Beziehungs-Schreibweise - ein blosses homeId waere hier ungueltig.
      home: { connect: { id: home.id } },
      instructions:
        "Gemuese in grobe Stuecke schneiden, mit Olivenoel mischen und bei 200 Grad 25 Minuten backen. Feta zerbroeckelt darueber geben und weitere 5 Minuten backen.",
      macros: { create: { calories: 410, carbs: 18, proteins: 16, fat: 29 } },
      tags: {
        connect: [{ id: tags.get("Vegetarisch")! }, { id: tags.get("Schnell")! }],
      },
      ingredients: {
        create: [
          zutat("Zucchini", 2, "Stueck"),
          zutat("Paprika", 2, "Stueck"),
          zutat("Feta", 200, "g"),
          zutat("Olivenoel", 3, "EL"),
        ],
      },
    },
  });

  // Vorrat: Name UND Einheit muessen zur Zutat passen, sonst zaehlt der
  // Eintrag nicht - ingredientKey() rechnet Einheiten nicht um.
  //
  // Bolognese  -> alles doppelt vorhanden        -> 8 Portionen kochbar
  // Curry      -> Kokosmilch nur zur Haelfte da  -> 1 Portion
  // Ofengemuese-> Feta fehlt ganz                -> 0 Portionen
  const vorrat = [
    ["Spaghetti", 1000, "g"],
    ["Hackfleisch", 800, "g"],
    ["Passierte Tomaten", 800, "ml"],
    ["Zwiebel", 4, "Stueck"],
    ["Olivenoel", 20, "EL"],
    ["Rote Linsen", 250, "g"],
    ["Kokosmilch", 200, "ml"],
    ["Currypaste", 4, "EL"],
  ] as const;

  // Was fuer das Ofengemuese fehlt bzw. das Curry ausbremst
  const einkaufsliste = [
    ["Feta", 200, "g"],
    ["Zucchini", 2, "Stueck"],
    ["Paprika", 2, "Stueck"],
    ["Kokosmilch", 200, "ml"],
  ] as const;

  await prisma.listEntry.createMany({
    data: [
      ...vorrat.map(([name, amount, unit]) => ({
        name,
        amount,
        unit,
        homeId: home.id,
        list: "pantry",
      })),
      ...einkaufsliste.map(([name, amount, unit]) => ({
        name,
        amount,
        unit,
        homeId: home.id,
        list: "shopping",
      })),
    ],
  });

  console.log(
    `Seed angelegt: Home "${home.name}" (Code ${JOIN_CODE}), 2 Nutzer, 3 Mahlzeiten, ` +
      `${vorrat.length} Vorrats- und ${einkaufsliste.length} Einkaufslisteneintraege.`,
  );
}

main()
  .catch((fehler) => {
    console.error("Seed fehlgeschlagen:", fehler);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
