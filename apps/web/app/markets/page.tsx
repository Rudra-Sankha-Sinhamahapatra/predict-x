import Link from "next/link";
import { Card, Button } from "../../components/ui";
import { fetchAllBiddings } from "../../lib/api";
import { TrendingUp, Calendar, Users, Trophy } from "lucide-react";

export default async function MarketsPage() {
  const biddings = await fetchAllBiddings().catch(() => []);

  const activeBiddings = biddings.filter(b => b.status === "OPEN");
  const resolvedBiddings = biddings.filter(b => b.status === "RESOLVED");

  return (
    <div className="mx-auto max-w-7xl px-6 pt-24 pb-12 gradient-canvas">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Prediction Markets</h1>
        <p className="text-xl text-muted-foreground">
          Discover and participate in live prediction markets
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 text-center">
          <TrendingUp className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{activeBiddings.length}</div>
          <div className="text-sm text-muted-foreground">Active Markets</div>
        </Card>
        <Card className="p-6 text-center">
          <Trophy className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{resolvedBiddings.length}</div>
          <div className="text-sm text-muted-foreground">Resolved Markets</div>
        </Card>
        <Card className="p-6 text-center">
          <Users className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold">{biddings.length}</div>
          <div className="text-sm text-muted-foreground">Total Markets</div>
        </Card>
      </div>

      <div className="flex gap-4 mb-6">
        <Button variant="primary" className="bg-teal-500 hover:bg-teal-600">
          All Markets ({biddings.length})
        </Button>
        <Button variant="ghost">
          Active ({activeBiddings.length})
        </Button>
        <Button variant="ghost">
          Resolved ({resolvedBiddings.length})
        </Button>
      </div>

      {biddings.length === 0 ? (
        <Card className="p-12 text-center bg-white/70 dark:bg-white/5 border-white/10">
          <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Markets Available</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to create a prediction market and start earning from your predictions!
          </p>
          <Button>Create First Market</Button>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {biddings.map((market) => (
            <Link key={market.id} href={`/b/${market.id}`}>
              <Card className="hover:shadow-xl transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-2 line-clamp-2 leading-tight">
                        {market.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(market.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`text-xs rounded-full px-2 py-1 font-medium ${
                        market.status === 'OPEN' 
                          ? 'bg-green-500/10 text-green-600' 
                          : market.status === 'RESOLVED'
                          ? 'bg-blue-500/10 text-blue-600'
                          : 'bg-gray-500/10 text-gray-600'
                      }`}>
                        {market.status}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                      Category
                    </div>
                    <div className="text-sm font-medium">{market.category}</div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {(market.options?.length ?? 0)} options
                    </span>
                    <span className="text-teal-500 font-medium">
                      View Market →
                    </span>
                  </div>

                  {market.options && market.options.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10">
                      <div className="text-xs text-muted-foreground mb-2">Options:</div>
                      <div className="flex flex-wrap gap-1">
                        {market.options.slice(0, 3).map((option) => (
                          <span 
                            key={option.id}
                            className="text-xs bg-black/5 dark:bg-white/10 px-2 py-1 rounded"
                          >
                            {option.text}
                          </span>
                        ))}
                        {market.options.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{market.options.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
