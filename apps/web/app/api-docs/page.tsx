import { Card } from "../../components/ui";
import { Database, Zap, Shield } from "lucide-react";

type Endpoint = {
  method: string;
  path: string;
  description: string;
  auth?: boolean;
  body?: string;
  response: string;
};

type EndpointCategory = {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  endpoints: Endpoint[];
};

const endpoints: EndpointCategory[] = [
  {
    category: "Authentication",
    icon: Shield,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/user/signup",
        description: "Create a new user account",
        body: "{ name: string, email: string, password: string }",
        response: '{ "message": "User Signed Up Successfully", "token": "string", "user": { "id": "uuid", "name": "string", "email": "string" } }'
      },
      {
        method: "POST", 
        path: "/api/v1/user/signin",
        description: "Sign in to existing account",
        body: "{ email: string, password: string }",
        response: '{ "message": "User Signed In Successfully", "token": "string", "userId": "uuid", "user": { "id": "uuid", "name": "string", "email": "string" } }'
      },
      {
        method: "GET",
        path: "/api/v1/user/me",
        description: "Get current user profile",
        auth: true,
        response: '{ "message": "User retrieved successfully", "user": { "id": "uuid", "name": "string", "email": "string", "createdAt": "timestamp", "wallet": { "balance": "number" }, "stats": { "totalBets": "number", "totalInvested": "number", "activeBets": "number", "wonBets": "number", "accountLevel": "string", "winRate": "string" } } }'
      }
    ]
  },
  {
    category: "Bidding Markets",
    icon: Database,
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/biddings/bidding-board/getall",
        description: "Get all active bidding markets",
        response: '{ "message": "fetched all active biddings", "allBiddings": [{ "id": "uuid", "title": "string", "category": "SPORTS|POLITICS|TECH|...", "status": "OPEN|CLOSED|RESOLVED", "options": [{ "id": "uuid", "text": "string", "payout": "number" }] }] }'
      },
      {
        method: "GET",
        path: "/api/v1/biddings/bidding-board/:id",
        description: "Get specific bidding market with options",
        response: '{ "message": "Bidding received successfully", "bidding": { "id": "uuid", "title": "string", "category": "string", "status": "OPEN", "options": [{ "id": "uuid", "text": "string", "payout": "number" }] }, "latestOdds": { "topicId": "uuid", "options": [{ "optionId": "uuid", "amount": "number", "currentPayout": "number" }], "timestamp": "ISO string" } }'
      },
      {
        method: "GET",
        path: "/api/v1/biddings/bidding-board/:id/results",
        description: "Get results for resolved markets",
        auth: true,
        response: '{ "message": "Bidding results retrieved successfully", "bidding": { "id": "uuid", "title": "string", "status": "RESOLVED" }, "results": [{ "option": { "id": "uuid", "text": "string", "payout": "number" }, "votes": [{ "user": { "id": "uuid", "name": "string" }, "amount": "number", "timestamp": "ISO string" }], "stats": { "totalVotes": "number", "totalAmount": "number" } }] }'
      }
    ]
  },
  {
    category: "Voting",
    icon: Zap,
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/votes/vote",
        description: "Place a bet on an option",
        auth: true,
        body: "{ optionId: string, amount: number }",
        response: '{ "message": "Vote placed successfully", "vote": { "id": "uuid", "userId": "uuid", "optionId": "uuid", "amount": "number", "expctedReturn": "number", "createdAt": "timestamp" }, "originalPayoutRate": "number", "note": "Odds have been updated for future votes" }'
      }
    ]
  }
];

export default function ApiDocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 pt-24 pb-16">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">API Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for the PredictX API endpoints
        </p>
      </div>

      <div className="mb-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Base URL</h2>
          <code className="bg-black/5 dark:bg-white/5 px-3 py-2 rounded">
            http://localhost:3001/api/v1
          </code>
          
          <h3 className="text-lg font-semibold mt-6 mb-3">Authentication</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Protected endpoints require a Bearer token in the Authorization header:
          </p>
          <code className="bg-black/5 dark:bg-white/5 px-3 py-2 rounded text-sm">
            Authorization: Bearer {"<your-token>"}
          </code>
        </Card>
      </div>

      {endpoints.map((category) => (
        <div key={category.category} className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <category.icon className="h-6 w-6 text-teal-500" />
            <h2 className="text-2xl font-bold">{category.category}</h2>
          </div>
          
          <div className="space-y-4">
            {category.endpoints.map((endpoint, idx) => (
              <Card key={idx} className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <span className={`text-xs font-mono px-2 py-1 rounded ${
                    endpoint.method === 'GET' ? 'bg-green-500/10 text-green-600' :
                    endpoint.method === 'POST' ? 'bg-blue-500/10 text-blue-600' :
                    'bg-orange-500/10 text-orange-600'
                  }`}>
                    {endpoint.method}
                  </span>
                  <div className="flex-1">
                    <code className="text-sm font-mono">{endpoint.path}</code>
                    {endpoint.auth && (
                      <span className="ml-2 text-xs bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded">
                        🔒 Auth Required
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">
                  {endpoint.description}
                </p>
                
                {endpoint.body && (
                  <div className="mb-3">
                    <h4 className="text-sm font-semibold mb-1">Request Body:</h4>
                    <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                      {endpoint.body}
                    </code>
                  </div>
                )}
                
                <div>
                  <h4 className="text-sm font-semibold mb-1">Response:</h4>
                  <code className="text-xs bg-black/5 dark:bg-white/5 px-2 py-1 rounded">
                    {endpoint.response}
                  </code>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Card className="p-6 mt-12">
        <h2 className="text-xl font-semibold mb-4">WebSocket Connection</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Real-time odds updates are available via WebSocket:
        </p>
        <code className="bg-black/5 dark:bg-white/5 px-3 py-2 rounded text-sm">
          ws://localhost:8080?topicId={"<bidding-id>"}
        </code>
        <p className="text-xs text-muted-foreground mt-2">
          The WebSocket sends live odds updates in the format: {"{ channel: string, data: CalculatedOdds }"}
        </p>
      </Card>
    </div>
  );
}
