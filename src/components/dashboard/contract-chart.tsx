"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type StatusData = {
  total: number;
  active: number;
  expiring: number;
  draft: number;
  expired: number;
};

type Contract = {
  title: string;
  value: number | null;
  status: string;
  endDate: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  Aktiv: "#22c55e",
  "Läuft bald ab": "#f97316",
  Entwurf: "#a1a1aa",
  Abgelaufen: "#ef4444",
};

export function ContractCharts({
  stats,
  contracts,
}: {
  stats: StatusData;
  contracts: Contract[];
}) {
  // Pie chart data
  const pieData = [
    { name: "Aktiv", value: stats.active },
    { name: "Läuft bald ab", value: stats.expiring },
    { name: "Entwurf", value: stats.draft },
    { name: "Abgelaufen", value: stats.expired },
  ].filter((d) => d.value > 0);

  // Bar chart: top contracts by value
  const barData = contracts
    .filter((c) => c.value && c.value > 0)
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0))
    .slice(0, 6)
    .map((c) => ({
      name: c.title.length > 20 ? c.title.slice(0, 20) + "…" : c.title,
      wert: c.value!,
    }));

  // Timeline: contracts expiring soon
  const timelineData = contracts
    .filter((c) => c.endDate)
    .sort(
      (a, b) =>
        new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime()
    )
    .slice(0, 8)
    .map((c) => {
      const end = new Date(c.endDate!);
      const days = Math.ceil(
        (end.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return {
        name: c.title.length > 18 ? c.title.slice(0, 18) + "…" : c.title,
        tage: Math.max(days, 0),
        color: days < 30 ? "#ef4444" : days < 90 ? "#f97316" : "#22c55e",
      };
    });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Status Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verträge nach Status</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Daten vorhanden.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name] ?? "#a1a1aa"}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Value Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vertragswerte (Top 6)</CardTitle>
        </CardHeader>
        <CardContent>
          {barData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Vertragswerte vorhanden.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tickFormatter={(v) =>
                    v >= 1000 ? `${(v / 1000).toFixed(0)}k €` : `${v} €`
                  }
                />
                <YAxis type="category" dataKey="name" width={130} fontSize={12} />
                <Tooltip
                  formatter={(v) =>
                    new Intl.NumberFormat("de-DE", {
                      style: "currency",
                      currency: "EUR",
                    }).format(Number(v))
                  }
                />
                <Bar dataKey="wert" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Expiry Timeline */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">
            Ablauf-Timeline (Tage bis Vertragsende)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Keine Verträge mit Enddatum.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={11} angle={-15} />
                <YAxis
                  tickFormatter={(v) => `${v}d`}
                  fontSize={12}
                />
                <Tooltip
                  formatter={(v) => [`${v} Tage`, "Verbleibend"]}
                />
                <Bar dataKey="tage" radius={[4, 4, 0, 0]}>
                  {timelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
