export const getNumericValue = (cellRef, worksheetRead) => {
  const cell = worksheetRead.getCell(cellRef).value;
  const value = cell?.result ?? cell ?? 0;
  return Number(value) || 0; // преобразуем в число, NaN → 0
};
