export const moneyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
});

export function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function currentMonth() {
  return todayDate().slice(0, 7);
}

export function currentDateTimeLocal() {
  const date = new Date();
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function formatDateTimeLocal(value) {
  if (!value) return 'Chua dat lich';
  const normalized = value.includes('T') ? value : `${value}T00:00`;
  const [datePart, timePart = '00:00'] = normalized.split('T');
  const [year, month, day] = datePart.split('-');
  const [hour, minute] = timePart.split(':');
  if (!year || !month || !day || !hour || !minute) return value;
  return `${day}/${month}/${year} ${hour}:${minute}`;
}

export function frequencyLabel(frequency) {
  if (frequency === 'daily') return 'Hang ngay';
  if (frequency === 'weekly') return 'Hang tuan';
  return 'Hang thang';
}
