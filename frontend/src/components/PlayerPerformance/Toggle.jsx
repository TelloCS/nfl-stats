const Toggle = ({ active, onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 h-full text-xs font-bold rounded-full
      ${active
          ? 'bg-geodude-700 text-foreground'
          : 'text-paper-500 hover:text-paper-300'}`}
    >
      {label}
    </button>
  )
}

export default Toggle;