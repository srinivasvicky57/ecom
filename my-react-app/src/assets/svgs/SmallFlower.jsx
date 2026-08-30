function SmallFlower({ className }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none">
      <circle cx="30" cy="30" r="5" fill="#8B1A1A" fillOpacity="0.12" stroke="#8B1A1A" strokeWidth="0.5"/>
      <circle cx="30" cy="30" r="2" fill="#C8933E" fillOpacity="0.2"/>
      <path d="M30 14C33 20,33 26,30 30C27 26,27 20,30 14Z" fill="#8B1A1A" fillOpacity="0.1"/>
      <path d="M30 46C33 40,33 34,30 30C27 34,27 40,30 46Z" fill="#8B1A1A" fillOpacity="0.1"/>
      <path d="M14 30C20 27,26 27,30 30C26 33,20 33,14 30Z" fill="#8B1A1A" fillOpacity="0.1"/>
      <path d="M46 30C40 27,34 27,30 30C34 33,40 33,46 30Z" fill="#8B1A1A" fillOpacity="0.1"/>
      <circle cx="30" cy="30" r="14" stroke="#C8933E" strokeWidth="0.4" fill="none" opacity="0.12"/>
    </svg>
  );
}

export default SmallFlower;
