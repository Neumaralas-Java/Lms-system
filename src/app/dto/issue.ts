export class Issue {

  constructor(public id: number | null, public isbn: string, public memberId: string, public issueDate: string,
              public returnDate: string, public fine: number, public returned: string) {
    this.fine = parseFloat(this.fine.toFixed(2));
  }
}
