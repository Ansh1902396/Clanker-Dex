import DashboardPageLayout from "@/components/dashboard/layout"
import DashboardStat from "@/components/dashboard/stat"
import DashboardChart from "@/components/dashboard/chart"
import BracketsIcon from "@/components/icons/brackets"
import GearIcon from "@/components/icons/gear"
import ProcessorIcon from "@/components/icons/proccesor"
import BoomIcon from "@/components/icons/boom"

// Icon mapping
const iconMap = {
  gear: GearIcon,
  proccesor: ProcessorIcon,
  boom: BoomIcon,
}

const dexStats = [
  {
    label: "Token Price",
    value: "$1,234.56",
    description: "+12.5% (24h)",
    icon: "gear",
    tag: "LIVE",
    intent: "success",
    direction: "up",
  },
  {
    label: "Market Cap",
    value: "$45.2M",
    description: "Fully Diluted",
    icon: "proccesor",
    tag: "MARKET",
    intent: "primary",
    direction: "neutral",
  },
  {
    label: "24h Volume",
    value: "$2.8M",
    description: "Trading Volume",
    icon: "boom",
    tag: "VOLUME",
    intent: "warning",
    direction: "up",
  },
]

export default function DashboardOverview() {
  return (
    <DashboardPageLayout
      header={{
        title: "Token Overview",
        description: "Real-time market data",
        icon: BracketsIcon,
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {dexStats.map((stat, index) => (
          <DashboardStat
            key={index}
            label={stat.label}
            value={stat.value}
            description={stat.description}
            icon={iconMap[stat.icon as keyof typeof iconMap]}
            tag={stat.tag}
            intent={stat.intent}
            direction={stat.direction}
          />
        ))}
      </div>

      <div className="mb-6">
        <DashboardChart />
      </div>
    </DashboardPageLayout>
  )
}
