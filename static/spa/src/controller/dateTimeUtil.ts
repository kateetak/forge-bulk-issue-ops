
export const dateToJiraEditFormat = (date: Date): string => {
  // Date time format must be dd/MMM/yy h:mm a
  const formattedDateTime = `${date.getDate()}/${date.toLocaleString('default', { month: 'short' })}/${date.getFullYear().toString().slice(-2)} ${date.getHours()}:${date.getMinutes()} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
  return formattedDateTime;
}
