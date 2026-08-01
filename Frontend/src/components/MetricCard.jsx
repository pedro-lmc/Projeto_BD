export default function MetricCard({ title, value, status, icon: Icon, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        {status && <span className="text-xs text-teal-600 font-medium mt-1 inline-block">{status}</span>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="text-white" size={24} />
      </div>
    </div>
  );
}