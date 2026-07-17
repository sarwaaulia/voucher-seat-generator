/**
 * @param isoDate 
 * @returns
 */

export function toDisplayDate(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return "";
  }

  const parts = isoDate.split("-");
  
  // array split: yyyy-mm-dd
  if (parts.length !== 3) {
    return isoDate;
  }

  const [year, month, day] = parts;

  if (!year || !month || !day) {
    return isoDate;
  }

  return `${day}-${month}-${year}`;
}