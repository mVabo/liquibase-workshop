import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Boxes, Coins, PackageOpen, Users } from "lucide-react";
import { api, type Customer, type OrderSummary, type Potion } from "@/lib/api";
import { useMissionStage } from "@/lib/mission-stage";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function DashboardPage() {
  const { stage } = useMissionStage();
  const [potions, setPotions] = useState<Potion[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (stage < 4) {
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [nextPotions, nextCustomers, nextOrders] = await Promise.all([api.potions(), api.customers(), api.orders()]);
        if (!cancelled) {
          setPotions(nextPotions);
          setCustomers(nextCustomers);
          setOrders(nextOrders);
        }
      } catch (err) {
        if (!cancelled) {
          setError((err as Error).message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [stage]);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.totalAmount ?? 0), 0),
    [orders]
  );

  if (stage < 4) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Inventory Observatory Locked</CardTitle>
          <CardDescription>
            Mission 04 (Evolution Mode) unlocks dashboard analytics after loyalty-points migrations are introduced.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard icon={PackageOpen} title="Potion SKUs" value={String(potions.length)} subtitle="Unique potion types" />
        <MetricCard
          icon={Boxes}
          title="Total Stock"
          value={String(potions.reduce((sum, potion) => sum + potion.stock, 0))}
          subtitle="Flasks available"
        />
        <MetricCard icon={Users} title="Customers" value={String(customers.length)} subtitle="Known mages" />
        <MetricCard icon={Coins} title="Revenue" value={`${totalRevenue.toFixed(2)}g`} subtitle="Sum of paid order totals" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Inventory Ledger</CardTitle>
          <CardDescription>Supports Evolution, Rollback, and Final Demo walkthrough checks.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? <p className="text-sm text-muted-foreground">Scrying inventory...</p> : null}
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
          {!loading && !error ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Potion</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {potions.map((potion) => (
                  <TableRow key={potion.id}>
                    <TableCell className="font-semibold">{potion.name}</TableCell>
                    <TableCell>{potion.code}</TableCell>
                    <TableCell>{potion.price.toFixed(2)}g</TableCell>
                    <TableCell>{potion.stock}</TableCell>
                    <TableCell>
                      {potion.stock < 15 ? <Badge variant="outline">Low</Badge> : <Badge variant="success">Healthy</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  title,
  value,
  subtitle
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription className="flex items-center gap-2 text-xs uppercase tracking-wide">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="font-display text-3xl leading-none">{value}</p>
        <p className="mt-2 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
