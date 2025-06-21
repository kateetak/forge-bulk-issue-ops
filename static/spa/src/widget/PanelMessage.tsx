
export type PanelMessageProps = {
  message: string;
  containerStyle?: React.CSSProperties;
  className?: string;
}

export const PanelMessage = (props: PanelMessageProps) => {

  return (
    <div className={`panel-message ${props.className}`}>
      <p style={props.containerStyle}>{props.message}</p>
    </div>
  )

}

// Legacy function to render a panel message, kept for compatibility
export const renderPanelMessage = (
    message: string,
    containerStyle: React.CSSProperties = {},
    className: string = '') => {
  if (message) {
    return (
      <div style={containerStyle} className={className}>
        <p style={{textAlign: 'center'}}>{message}</p>
      </div>
    );
  } else {
    return null;
  }
}
