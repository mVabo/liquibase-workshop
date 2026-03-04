import { useEffect, useMemo, useState } from "react";
import { Sparkles, ShoppingCart, Stone, WandSparkles } from "lucide-react";
import { api, type OrderSummary, type Potion, type StatusResponse } from "@/lib/api";
import { useMissionStage } from "@/lib/mission-stage";
import { getMissionByStage } from "@/lib/missions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function ShopPage() {
  const { stage } = useMissionStage();
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [potions, setPotions] = useState<Potion[]>([]);
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [customerName, setCustomerName] = useState("Astra");
  const [customerEmail, setCustomerEmail] = useState("astra@moon.magic");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const activeMission = getMissionByStage(stage);

  async function loadBaseData() {
    setLoading(true);
    setError(null);
    try {
      const [nextStatus, nextPotions, nextOrders] = await Promise.all([api.status(), api.potions(), api.orders()]);
      setStatus(nextStatus);
      setPotions(nextPotions);
      setOrders(nextOrders);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadBaseData();
  }, []);

  const selectedItems = useMemo(
    () =>
      potions
        .map((potion) => ({ potionCode: potion.code, quantity: quantities[potion.code] ?? 0 }))
        .filter((item) => item.quantity > 0),
    [potions, quantities]
  );

  async function submitOrder() {
    if (selectedItems.length === 0) {
      setSubmitMessage("Choose at least one potion quantity before invoking the order spell.");
      return;
    }

    setSubmitting(true);
    setSubmitMessage(null);

    try {
      const customer = await api.createCustomer({
        email: customerEmail,
        displayName: customerName
      });

      const createdOrder = await api.createOrder({
        customerEmail: customer.email,
        items: selectedItems
      });

      setSubmitMessage(`Order #${createdOrder.orderId} forged successfully. Total: ${createdOrder.totalAmount}`);
      setQuantities({});
      const refreshedOrders = await api.orders();
      setOrders(refreshedOrders);
    } catch (err) {
      setSubmitMessage((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <Card className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.16),transparent_36%)]" />
          <CardHeader>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Mission-aware storefront
            </div>
            <CardTitle>Arcana Apothecary Webshop</CardTitle>
            <CardDescription>
              Active mission: {activeMission.code} - {activeMission.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>{activeMission.outcome}</p>
            <p>
              Source guide: <code>{activeMission.file}</code>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Stone className="h-4 w-4 text-primary" />
              Service Crystal
            </CardTitle>
            <CardDescription>Live status pulled from backend</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? <p className="text-sm text-muted-foreground">Reading runes...</p> : null}
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            {status ? (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">App</span>
                  <strong>{status.app}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">State</span>
                  <Badge variant="success">{status.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Server time</span>
                  <span>{new Date(status.time).toLocaleTimeString()}</span>
                </div>
              </div>
            ) : null}
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={() => void loadBaseData()}>
              Refresh pulse
            </Button>
          </CardFooter>
        </Card>
      </section>

      {stage >= 1 ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {potions.map((potion) => (
            <Card key={potion.id} className="transition-transform hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{potion.code}</Badge>
                  <span className="text-sm font-semibold">{potion.price.toFixed(2)} gold</span>
                </div>
                <CardTitle className="text-lg">{potion.name}</CardTitle>
                <CardDescription>Stock: {potion.stock} flasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Inventory aura</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-chart-two" style={{ width: `${Math.min(100, potion.stock * 2)}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Catalog Locked</CardTitle>
            <CardDescription>Complete Mission 00 and set stage to Mission 01 to reveal potion products.</CardDescription>
          </CardHeader>
        </Card>
      )}

      {stage >= 3 ? (
        <section className="grid gap-4 md:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShoppingCart className="h-5 w-5 text-primary" />
                Order Forge
              </CardTitle>
              <CardDescription>
                Interactive helper for Data Quest checks (customer + order API flow).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Customer name</label>
                  <Input value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold">Customer email</label>
                  <Input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {potions.map((potion) => (
                  <div key={potion.code} className="rounded-md border border-border/60 bg-muted/20 p-3">
                    <p className="text-sm font-semibold">{potion.name}</p>
                    <p className="text-xs text-muted-foreground">{potion.code}</p>
                    <Input
                      type="number"
                      min={0}
                      className="mt-2"
                      value={quantities[potion.code] ?? 0}
                      onChange={(event) =>
                        setQuantities((current) => ({
                          ...current,
                          [potion.code]: Number.parseInt(event.target.value || "0", 10)
                        }))
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => void submitOrder()} disabled={submitting}>
                  <WandSparkles className="h-4 w-4" />
                  {submitting ? "Casting order..." : "Create paid order"}
                </Button>
                {submitMessage ? <span className="text-sm text-muted-foreground">{submitMessage}</span> : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <CardDescription>Latest payment spells</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.orderId} className="rounded-md border border-border/60 p-3 text-sm">
                  <p className="font-semibold">
                    #{order.orderId} - {order.customerName}
                  </p>
                  <p className="text-muted-foreground">
                    {order.itemCount} items - {order.totalAmount.toFixed(2)} gold
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Order Forge Locked</CardTitle>
            <CardDescription>Set mission stage to Mission 03+ to unlock customer/order interactions.</CardDescription>
          </CardHeader>
        </Card>
      )}
    </div>
  );
}
