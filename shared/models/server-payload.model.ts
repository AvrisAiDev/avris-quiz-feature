export class ServerPayload<T = any> {
  experienceId:string;
  sessionId: string;
  chapterId: string;
  userId?: string | null;
  data: T;
  constructor(experienceId:string, sessionId: string, chapterId: string, data: T, userId: string | undefined) {
    this.experienceId = experienceId;
    this.sessionId = sessionId;
    this.chapterId = chapterId;
    this.data = data;
    this.userId = userId;
  }
}

