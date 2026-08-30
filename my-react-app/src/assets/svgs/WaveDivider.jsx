function WaveDivider({ className, width = 60, height = 20, strokeColor = 'rgba(253,245,230,0.3)', dotColor = 'rgba(200,147,62,0.6)', dotRadius = 3 }) {
  return (
    <svg className={className} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path d={`M0 ${height/2} Q${width/4} 0, ${width/2} ${height/2} Q${width*3/4} ${height}, ${width} ${height/2}`} stroke={strokeColor} strokeWidth="1" />
      <circle cx={width/2} cy={height/2} r={dotRadius} fill={dotColor} />
    </svg>
  );
}

export default WaveDivider;
