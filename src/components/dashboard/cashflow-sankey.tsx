"use client";

import { ResponsiveContainer, Sankey, Tooltip, Layer } from "recharts";
import { useCurrency } from "@/components/providers/currency-provider";
import type { Category } from "@prisma/client";

const NODE_COLORS = ["#6366f1", "#f43f5e", "#fb923c", "#a78bfa", "#38bdf8", "#f43f5e", "#94a3b8", "#10b981"];

type Props = {
  expensesByCategory: { category: Category; amountLKR: number }[];
  netCashflowSurplusLKR: number;
};

export function CashflowSankey({ expensesByCategory, netCashflowSurplusLKR }: Props) {
  const { format } = useCurrency();

  const activeExpenses = expensesByCategory.filter((e) => e.amountLKR > 0);

  const nodes: { name: string }[] = [
    { name: "Income" },
    ...activeExpenses.map((e) => ({ name: e.category.name })),
  ];

  const links: { source: number; target: number; value: number }[] = activeExpenses.map(
    (e, i) => ({ source: 0, target: i + 1, value: Math.max(e.amountLKR, 1) })
  );

  if (netCashflowSurplusLKR > 0) {
    nodes.push({ name: "Net Savings" });
    links.push({ source: 0, target: nodes.length - 1, value: netCashflowSurplusLKR });
  }

  const data = { nodes, links };

  if (links.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-5 h-80 flex items-center justify-center text-sm text-muted-foreground">
        No transactions recorded yet this month.
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <p className="text-sm font-medium mb-4">Income → Expenses → Savings</p>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <Sankey
            data={data}
            nodePadding={24}
            nodeWidth={12}
            linkCurvature={0.55}
            margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
            node={(props) => <SankeyNode {...props} />}
            link={(props) => <SankeyLink {...props} />}
          >
            <Tooltip
              formatter={(value) => format(Number(value), "LKR")}
              contentStyle={{
                background: "#0d1420",
                border: "1px solid #1e293b",
                borderRadius: 8,
                color: "#e2e8f0",
                fontSize: 12,
              }}
            />
          </Sankey>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function SankeyNode(props: {
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
  payload: { name: string; value?: number };
}) {
  const { x, y, width, height, index, payload } = props;
  const color = NODE_COLORS[index % NODE_COLORS.length];
  const isRight = x > 150;

  return (
    <Layer>
      <rect x={x} y={y} width={width} height={height} fill={color} rx={2} />
      <text
        x={isRight ? x - 6 : x + width + 6}
        y={y + height / 2}
        textAnchor={isRight ? "end" : "start"}
        dominantBaseline="middle"
        fontSize={12}
        fill="#e2e8f0"
      >
        {payload.name}
      </text>
    </Layer>
  );
}

function SankeyLink(props: {
  sourceX: number;
  targetX: number;
  sourceY: number;
  targetY: number;
  sourceControlX: number;
  targetControlX: number;
  linkWidth: number;
  index: number;
}) {
  const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } =
    props;
  const color = NODE_COLORS[(index + 1) % NODE_COLORS.length];

  return (
    <path
      d={`M${sourceX},${sourceY}C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
      fill="none"
      stroke={color}
      strokeOpacity={0.28}
      strokeWidth={Math.max(linkWidth, 1)}
    />
  );
}
