export interface IBlogEntry {
  id: string; // Generated from file name
  title: string;
  date: string;
  description: string;
  formattedDate: string; // Generated from date
  content?: string;
}
