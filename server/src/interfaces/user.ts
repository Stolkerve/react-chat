export class User{
  constructor() {
    this.lastMsg = new Date()
    this.msgsRate = 0
    this.strikes = 0
  }
  lastMsg: Date;
  msgsRate: number;
  strikes: number
}