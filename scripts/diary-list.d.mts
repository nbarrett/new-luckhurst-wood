export type DiaryListDay = {date: string; title: string; body: string; files: string[]; hidden: string[]};
export const diaryListUrl: string;
export function fetchDiaryList(): Promise<DiaryListDay[]>;
export function cleanDiaryList(days: unknown): DiaryListDay[];
export function putDiaryList(days: unknown): void;
