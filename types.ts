export interface HistoryEntry {
  id: string;
  count: number;
  timestamp: number;
  note?: string;
  insight?: string;
}

export interface UserStats {
  totalRounds: number;
  sessionsCompleted: number;
  lastSessionDate: number | null;
}

export enum ModalType {
  NONE,
  ADD_MANUAL,
  HISTORY,
  INSIGHT
}