
// export const renderWaitingMessage = (message: string = "Waiting for previous steps to be completed.") => {
//   return (
//     <div>
//       <p style={{textAlign: 'center'}}>{message}</p>
//     </div>
//   );
// }

export const renderWaitingMessage = (message: string, containerStyle: React.CSSProperties = {}) => {
  if (message) {
    return (
      <div style={containerStyle}>
        <p style={{textAlign: 'center'}}>{message}</p>
      </div>
    );
  } else {
    return null;
  }
}
