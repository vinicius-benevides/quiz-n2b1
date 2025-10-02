export type SQLiteRow = Record<string, any>;

export type SQLiteResultSetRowList = {
  length: number;
  item: (index: number) => SQLiteRow;
};

export type SQLiteResultSet = {
  rows: SQLiteResultSetRowList;
  rowsAffected: number;
  insertId?: number;
};
