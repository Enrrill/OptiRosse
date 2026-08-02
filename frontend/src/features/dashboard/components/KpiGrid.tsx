import { KpiCard, type KpiCardProps } from '@/components/data/KpiCard'

export function KpiGrid({ cards }: { cards: KpiCardProps[] }) {
  return (
    <div className="mb-lg grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, i) => (
        <KpiCard key={`${card.label}-${i}`} {...card} />
      ))}
    </div>
  )
}
