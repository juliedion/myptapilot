interface Props {
  title: string
  subtitle: string
  gradient: string
  icon: string
  actions?: React.ReactNode
}

export default function ModuleHeader({ title, subtitle, gradient, icon, actions }: Props) {
  return (
    <div className={`${gradient} rounded-3xl p-7 mb-6 relative overflow-hidden shadow-card`}>
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl backdrop-blur-sm">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <p className="text-white/65 text-sm mt-0.5">{subtitle}</p>
          </div>
        </div>
        {actions && <div className="flex gap-3">{actions}</div>}
      </div>
    </div>
  )
}
