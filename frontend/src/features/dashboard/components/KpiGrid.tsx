import { KpiCard, type KpiCardProps } from '@/components/data/KpiCard'

export function KpiGrid({ cards }: { cards: KpiCardProps[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((card, i) => (
        <KpiCard key={`${card.label}-${i}`} {...card} />
      ))}
    </div>
  )
}
