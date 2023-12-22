export class ErrorMessage {
  private type: number;
  private address: string;
  private description: string;

  constructor(type: number, address: string, description: string) {
    this.type = type;
    this.address = address;
    this.description = description;
  }
}
