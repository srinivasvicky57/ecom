function Mandala({ className }) {
  return (
    <svg className={className} viewBox="0 0 120 120" fill="none">
      <circle cx="60" cy="60" r="50" stroke="#C8933E" strokeWidth="0.5" fill="none" opacity="0.12"/>
      <circle cx="60" cy="60" r="38" stroke="#8B1A1A" strokeWidth="0.6" fill="none" opacity="0.12"/>
      <circle cx="60" cy="60" r="26" stroke="#C8933E" strokeWidth="0.8" fill="none" opacity="0.15"/>
      <circle cx="60" cy="60" r="14" stroke="#8B1A1A" strokeWidth="0.6" fill="#C8933E" fillOpacity="0.04" opacity="0.15"/>
      <circle cx="60" cy="60" r="5" fill="#8B1A1A" fillOpacity="0.1"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <line key={a} x1="60" y1="60" x2={60 + 50 * Math.cos(a * Math.PI / 180)} y2={60 + 50 * Math.sin(a * Math.PI / 180)} stroke="#C8933E" strokeWidth="0.3" opacity="0.08"/>
      ))}
      {[0,60,120,180,240,300].map(a => {
        const cx = 60 + 38 * Math.cos(a * Math.PI / 180);
        const cy = 60 + 38 * Math.sin(a * Math.PI / 180);
        return <circle key={a} cx={cx} cy={cy} r="3" stroke="#8B1A1A" strokeWidth="0.5" fill="#8B1A1A" fillOpacity="0.06" opacity="0.15"/>;
      })}
      {[30,90,150,210,270,330].map(a => {
        const cx = 60 + 26 * Math.cos(a * Math.PI / 180);
        const cy = 60 + 26 * Math.sin(a * Math.PI / 180);
        return <circle key={a} cx={cx} cy={cy} r="2" fill="#C8933E" fillOpacity="0.12"/>;
      })}
    </svg>
  );
}

export default Mandala;
