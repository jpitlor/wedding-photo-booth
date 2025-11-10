export type Page = "landing-page" | "taking-photo" | "printing" | "admin";

// I don't like using snake_case, but I don't feel like figuring out why
// Django can't convert between snake and camel case.
export interface Metadata {
  width: number;
  height: number;
  tile_width: number;
  tile_height: number;
  row_count: number;
  column_count: number;
}

export interface PrintResponse {
  tileNumber: number;
}
