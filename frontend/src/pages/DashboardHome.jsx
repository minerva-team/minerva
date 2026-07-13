export default function DashboardHome() {
  return (
    <section className="grid grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((card) => (
        <div
          key={card}
          className="h-64 rounded-3xl border border-white/10 bg-backgroundC"
        />
      ))}
    </section>
  )
}
