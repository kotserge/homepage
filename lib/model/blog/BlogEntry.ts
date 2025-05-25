import { IBlogEntry } from "./IBlogEntry";

export default class BlogEntry implements IBlogEntry {
  public id: string;
  public title: string;
  public date: string;
  public description: string;
  public formattedDate: string;
  public content?: string | undefined;

  constructor(
    id: string,
    title: string,
    date: string,
    description: string,
    content?: string | undefined,
  ) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.description = description;
    this.formattedDate = this.formatDate(date);
    this.content = content;
  }

  private formatDate(input: string): string {
    const [year, month, day] = input.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  }
}
