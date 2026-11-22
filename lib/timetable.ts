import type { Locale } from "./i18n";

// A grade 8 week from the national curriculum used in Fergana public schools.
// The hours are sample data: EduBridge is not a school register, it only needs
// to know which lesson a student is sitting in so it can line their open
// questions up against it.
export type SchoolSubject = {
  key: string;
  uz: string;
  en: string;
  ru: string;
  slug?: "algebra" | "fizika" | "kimyo";
};

const S = {
  onaTili: { key: "onaTili", uz: "Ona tili", en: "Native language", ru: "Родной язык" },
  adabiyot: { key: "adabiyot", uz: "Adabiyot", en: "Literature", ru: "Литература" },
  rusTili: { key: "rusTili", uz: "Rus tili", en: "Russian", ru: "Русский язык" },
  ingliz: { key: "ingliz", uz: "Ingliz tili", en: "English", ru: "Английский язык" },
  algebra: { key: "algebra", uz: "Algebra", en: "Algebra", ru: "Алгебра", slug: "algebra" },
  geometriya: { key: "geometriya", uz: "Geometriya", en: "Geometry", ru: "Геометрия" },
  informatika: { key: "informatika", uz: "Informatika va AT", en: "Informatics and IT", ru: "Информатика и ИТ" },
  fizika: { key: "fizika", uz: "Fizika", en: "Physics", ru: "Физика", slug: "fizika" },
  kimyo: { key: "kimyo", uz: "Kimyo", en: "Chemistry", ru: "Химия", slug: "kimyo" },
  biologiya: { key: "biologiya", uz: "Biologiya", en: "Biology", ru: "Биология" },
  geografiya: { key: "geografiya", uz: "Geografiya", en: "Geography", ru: "География" },
  tarix: { key: "tarix", uz: "O‘zbekiston tarixi", en: "History of Uzbekistan", ru: "История Узбекистана" },
  jahonTarixi: { key: "jahonTarixi", uz: "Jahon tarixi", en: "World history", ru: "Всемирная история" },
  huquq: { key: "huquq", uz: "Huquq asoslari", en: "Basics of law", ru: "Основы права" },
  tarbiya: { key: "tarbiya", uz: "Tarbiya", en: "Civics", ru: "Воспитание" },
  texnologiya: { key: "texnologiya", uz: "Texnologiya", en: "Technology", ru: "Технология" },
  jismoniy: { key: "jismoniy", uz: "Jismoniy tarbiya", en: "Physical education", ru: "Физкультура" },
} satisfies Record<string, SchoolSubject>;

export const LESSON_HOURS = [
  ["08:30", "09:15"],
  ["09:25", "10:10"],
  ["10:20", "11:05"],
  ["11:25", "12:10"],
  ["12:20", "13:05"],
  ["13:15", "14:00"],
] as const;

// Index 1 is Monday, matching the ISO weekday numbering. Sunday has no lessons.
const WEEK: SchoolSubject[][] = [
  [],
  [S.onaTili, S.algebra, S.ingliz, S.fizika, S.jismoniy, S.tarbiya],
  [S.algebra, S.kimyo, S.biologiya, S.adabiyot, S.geografiya],
  [S.geometriya, S.fizika, S.rusTili, S.tarix, S.informatika, S.texnologiya],
  [S.algebra, S.kimyo, S.ingliz, S.jahonTarixi, S.onaTili],
  [S.geometriya, S.fizika, S.biologiya, S.huquq, S.jismoniy],
  [S.informatika, S.adabiyot, S.rusTili, S.geografiya, S.texnologiya],
];

export type TimetableLesson = {
  order: number;
  start: string;
  end: string;
  subject: SchoolSubject;
};
export type TimetableDay = {
  weekday: number;
  lessons: TimetableLesson[];
};

export function weekPlan(): TimetableDay[] {
  return WEEK.map((subjects, weekday) => ({
    weekday,
    lessons: subjects.map((subject, i) => ({
      order: i + 1,
      start: LESSON_HOURS[i][0],
      end: LESSON_HOURS[i][1],
      subject,
    })),
  })).filter((day) => day.weekday > 0);
}

// Fergana runs on Asia/Tashkent, so the school day must not follow the
// browser's clock or the server's.
export function todayInFergana(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    weekday: "short",
  }).format(new Date());
  const map: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  return map[parts] ?? 1;
}

export function subjectName(subject: SchoolSubject, locale: Locale) {
  return subject[locale];
}

// Term attendance, shown as sample data. Nothing in EduBridge records it.
export const SAMPLE_ATTENDANCE: Record<string, [attended: number, held: number]> = {
  onaTili: [21, 22],
  adabiyot: [15, 16],
  rusTili: [15, 16],
  ingliz: [21, 22],
  algebra: [31, 33],
  geometriya: [15, 16],
  informatika: [15, 16],
  fizika: [29, 33],
  kimyo: [20, 22],
  biologiya: [21, 22],
  geografiya: [15, 16],
  tarix: [10, 11],
  jahonTarixi: [11, 11],
  huquq: [10, 11],
  tarbiya: [11, 11],
  texnologiya: [16, 16],
  jismoniy: [21, 22],
};
