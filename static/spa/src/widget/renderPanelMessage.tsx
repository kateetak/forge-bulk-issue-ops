
export const renderPanelMessage = (message: string, containerStyle: React.CSSProperties = {}) => {
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
